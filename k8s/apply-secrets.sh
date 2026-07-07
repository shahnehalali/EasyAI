#!/usr/bin/env bash
# Apply the out-of-band app secret and roll the server so it picks up the new
# env (RESEND_API_KEY, EMAIL_FROM, FEEDBACK_RECIPIENTS, ...).
#
# The secret file k8s/jurisai-app-secrets.yaml is gitignored (holds real keys),
# so ArgoCD does NOT manage it. Whenever its values change you must run this.
#
#   ./k8s/apply-secrets.sh
#
# Requires a kubeconfig pointing at the prod cluster.
set -euo pipefail

NS=jurisai
DIR="$(cd "$(dirname "$0")" && pwd)"
SECRET_FILE="$DIR/jurisai-app-secrets.yaml"

if [[ ! -f "$SECRET_FILE" ]]; then
  echo "ERROR: $SECRET_FILE not found. Copy jurisai-app-secrets.yaml.example and fill it in." >&2
  exit 1
fi

echo "==> Applying secret jurisai-app-secrets to namespace $NS"
kubectl apply -f "$SECRET_FILE"

echo "==> Restarting jurisai-server so it re-reads the secret env"
kubectl -n "$NS" rollout restart deploy/jurisai-server
kubectl -n "$NS" rollout status  deploy/jurisai-server --timeout=180s

echo "==> Verifying the email env landed in the running pod"
kubectl -n "$NS" exec deploy/jurisai-server -- \
  sh -c 'echo "RESEND_API_KEY set: $([ -n "$RESEND_API_KEY" ] && echo yes || echo NO)";
         echo "EMAIL_FROM: $EMAIL_FROM";
         echo "FEEDBACK_RECIPIENTS: $FEEDBACK_RECIPIENTS";
         echo "SPIREX_API_KEY set: $([ -n "$SPIREX_API_KEY" ] && echo yes || echo NO)";
         echo "SPIREX_PROJECT_ID: $SPIREX_PROJECT_ID"'

echo "==> Done. Submit feedback in the app; it should arrive at FEEDBACK_RECIPIENTS."
