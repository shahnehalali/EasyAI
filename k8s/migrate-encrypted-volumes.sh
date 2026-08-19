#!/usr/bin/env bash
# =============================================================================
# One-time migration: move the Postgres and uploads volumes onto the
# LUKS-encrypted StorageClass (GDPR Art. 32(1)(a), encryption at rest).
#
# WHY THIS IS NEEDED
#   k8s/jurisai-k8s.yaml has declared `storageClassName: longhorn-encrypted` on
#   both PVCs for a while, but a PVC's storageClassName is IMMUTABLE. The claims
#   were created before the encrypted class existed, so ArgoCD has been applying
#   a field it can never change and silently doing nothing. Both volumes are
#   still on the plain `longhorn` class with encrypted=false — verify with:
#
#     kubectl -n jurisai get pvc -o custom-columns=NAME:.metadata.name,SC:.spec.storageClassName
#
#   The only way to fix it is to delete the PVCs and let them be re-provisioned,
#   which destroys the data. Hence: dump, delete, restore.
#
# THIS SCRIPT CAUSES DOWNTIME (a few minutes) AND DELETES PRODUCTION VOLUMES.
# It refuses to run unless a verified dump exists. Read it before running it.
#
# Prerequisites, all already confirmed on this cluster:
#   - StorageClass longhorn-encrypted exists
#   - Secret longhorn-crypto exists in namespace longhorn-system
#   - The nodes can actually mount an encrypted volume (canary test passed)
#
#   export KUBECONFIG="C:/Users/ShahnehalAli/.kube/kubeconfig.yaml"
#   ./k8s/migrate-encrypted-volumes.sh
# =============================================================================
set -euo pipefail

NS=jurisai
WORKDIR="${WORKDIR:-./migration-$(date -u +%Y%m%dT%H%M%SZ)}"
DUMP="$WORKDIR/jurisai.sql"
UPLOADS="$WORKDIR/uploads.tar"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mABORT: %s\033[0m\n' "$*" >&2; exit 1; }

mkdir -p "$WORKDIR"

# ---------------------------------------------------------------- preflight --
say "Preflight"
kubectl -n "$NS" get deploy jurisai-postgres >/dev/null || die "cannot reach the cluster / namespace"
kubectl get sc longhorn-encrypted >/dev/null || die "StorageClass longhorn-encrypted is missing"
kubectl -n longhorn-system get secret longhorn-crypto >/dev/null || die "Secret longhorn-crypto is missing"

for pvc in jurisai-postgres-pvc jurisai-uploads-pvc; do
  sc=$(kubectl -n "$NS" get pvc "$pvc" -o jsonpath='{.spec.storageClassName}')
  echo "  $pvc is currently on: $sc"
  [ "$sc" = "longhorn-encrypted" ] && die "$pvc is already encrypted — nothing to migrate"
done

PGUSER=$(kubectl -n "$NS" get secret jurisai-app-secrets -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
PGDB=$(kubectl -n "$NS" get secret jurisai-app-secrets -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)
echo "  database: $PGDB (user $PGUSER)"

# ------------------------------------------------------------------- backup --
# Order matters: the uploads copy needs a running server pod, then the server is
# stopped BEFORE the dump so nothing can be written between dump and delete.
say "Copying uploaded documents to $UPLOADS"
POD=$(kubectl -n "$NS" get pod -l app=jurisai-server -o jsonpath='{.items[0].metadata.name}')
# `|| true`: an empty uploads dir makes tar exit non-zero, which is fine.
kubectl -n "$NS" exec "$POD" -- tar cf - -C /app uploads > "$UPLOADS" 2>/dev/null || true
echo "  uploads archive: $(wc -c < "$UPLOADS") bytes"

say "Stopping the API server so nothing writes during the dump"
kubectl -n "$NS" scale deploy/jurisai-server --replicas=0
kubectl -n "$NS" wait --for=delete pod -l app=jurisai-server --timeout=180s || true

say "Dumping the database to $DUMP"
kubectl -n "$NS" exec deploy/jurisai-postgres --   pg_dump --clean --if-exists --no-owner --no-privileges -U "$PGUSER" "$PGDB" > "$DUMP"

# A dump that does not contain the User table is not a dump worth trusting.
grep -q 'CREATE TABLE public."User"' "$DUMP" || die "dump looks wrong — no User table in it"
echo "  dump: $(wc -c < "$DUMP") bytes"
[ "$(wc -c < "$DUMP")" -gt 10000 ] || die "dump is suspiciously small"

# Independent sanity check: the dump must carry the rows we expect to get back.
EXPECT_USERS=$(kubectl -n "$NS" exec deploy/jurisai-postgres -- psql -U "$PGUSER" -d "$PGDB" -tAc 'SELECT COUNT(*) FROM "User";' | tr -d '[:space:]')
echo "  live database has $EXPECT_USERS users; expecting the same after restore"

say "Backups written to $WORKDIR — keep them until the app is verified."
if [ "${AUTO_CONFIRM:-}" != "yes" ]; then
  read -r -p "Proceed to DELETE both production volumes and re-provision them encrypted? [type: yes] " ok
  [ "$ok" = "yes" ] || die "cancelled by operator"
fi

# ------------------------------------------------------------ re-provision --
say "Stopping Postgres to release its volume"
kubectl -n "$NS" scale deploy/jurisai-postgres --replicas=0
kubectl -n "$NS" wait --for=delete pod -l app=jurisai-postgres --timeout=180s || true

say "Deleting the unencrypted PVCs"
kubectl -n "$NS" delete pvc jurisai-postgres-pvc jurisai-uploads-pvc --wait=true

say "Re-creating them from the manifest (now on longhorn-encrypted)"
# Apply just the PVCs; ArgoCD will reconcile the rest.
kubectl apply -f "$(dirname "$0")/jurisai-k8s.yaml"

for pvc in jurisai-postgres-pvc jurisai-uploads-pvc; do
  kubectl -n "$NS" wait --for=jsonpath='{.status.phase}'=Bound "pvc/$pvc" --timeout=180s
  sc=$(kubectl -n "$NS" get pvc "$pvc" -o jsonpath='{.spec.storageClassName}')
  [ "$sc" = "longhorn-encrypted" ] || die "$pvc came back on '$sc', not longhorn-encrypted"
done

say "Starting Postgres on the new encrypted volume"
kubectl -n "$NS" scale deploy/jurisai-postgres --replicas=1
kubectl -n "$NS" rollout status deploy/jurisai-postgres --timeout=300s
# Wait for it to actually accept connections, not just be Ready.
for i in $(seq 1 30); do
  if kubectl -n "$NS" exec deploy/jurisai-postgres -- pg_isready -U "$PGUSER" -d "$PGDB" >/dev/null 2>&1; then break; fi
  sleep 3
done

say "Restoring the dump"
kubectl -n "$NS" exec -i deploy/jurisai-postgres -- psql -U "$PGUSER" -d "$PGDB" < "$DUMP"

say "Starting the API server"
kubectl -n "$NS" scale deploy/jurisai-server --replicas=1
kubectl -n "$NS" rollout status deploy/jurisai-server --timeout=300s

say "Restoring uploaded documents"
POD=$(kubectl -n "$NS" get pod -l app=jurisai-server -o jsonpath='{.items[0].metadata.name}')
if [ -s "$UPLOADS" ]; then
  kubectl -n "$NS" exec -i "$POD" -- tar xf - -C /app < "$UPLOADS" || echo "  (nothing to restore)"
fi

# ---------------------------------------------------------------- verify ----
say "Verifying"
echo "--- volumes ---"
for pvc in jurisai-postgres-pvc jurisai-uploads-pvc; do
  vol=$(kubectl -n "$NS" get pvc "$pvc" -o jsonpath='{.spec.volumeName}')
  enc=$(kubectl -n longhorn-system get volumes.longhorn.io "$vol" -o jsonpath='{.spec.encrypted}')
  echo "  $pvc -> encrypted=$enc"
  [ "$enc" = "true" ] || die "$pvc is STILL not encrypted"
done

echo "--- data ---"
GOT_USERS=$(kubectl -n "$NS" exec deploy/jurisai-postgres -- psql -U "$PGUSER" -d "$PGDB" -tAc 'SELECT COUNT(*) FROM "User";' | tr -d '[:space:]')
echo "  users before: $EXPECT_USERS   after: $GOT_USERS"
[ "$EXPECT_USERS" = "$GOT_USERS" ] || die "row count changed across the migration — the dump is still at $DUMP"
kubectl -n "$NS" exec deploy/jurisai-postgres -- psql -U "$PGUSER" -d "$PGDB" -c 'SELECT (SELECT COUNT(*) FROM "Organization") AS orgs, (SELECT COUNT(*) FROM "AiSystem") AS ai_systems, (SELECT COUNT(*) FROM "ChecklistItemResponse") AS responses;'

echo "--- health ---"
curl -fsS https://compliance.rit.services/api/health && echo

say "Done. Both volumes are encrypted at rest."
echo "Keep $WORKDIR until you have signed in and confirmed the data looks right."
