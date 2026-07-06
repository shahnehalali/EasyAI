# JurisAI — Kubernetes deployment

GitOps deployment to the Rit Services cluster, following
`docs/Kubernetes/*` (How to Setup ArgoCD with your project, Kubernetes
Deployment with HTTPS).

- **Host:** `jurisai.rit.services`
- **Cluster ingress IP:** `172.236.204.215` (point DNS here)
- **Images:** `ghcr.io/shahnehalali/jurisai-server`, `ghcr.io/shahnehalali/jurisai-client` (GHCR, private)
- **TLS:** cert-manager `letsencrypt-prod` → `jurisai-tls`
- **Ingress:** Traefik `IngressRoute` (path `/api` + `/uploads` → server, rest → client)
- **Storage:** Longhorn PVCs (Postgres data + uploaded documents)

## Files
| File | Purpose |
| --- | --- |
| `jurisai-k8s.yaml` | All cluster resources (ArgoCD syncs this) |
| `jurisai-app-secrets.yaml.example` | Template for the `jurisai-app-secrets` Secret (create out of band) |
| `../server/Dockerfile`, `../client/Dockerfile` | Image builds |
| `../.github/workflows/deploy-k8s.yml` | CI: build → push → bump tags → ping ArgoCD |

## One-time setup (privileged — needs cluster + accounts; run these yourself)

These can't be done from the app sandbox — they need cluster access and real credentials.

1. **DNS** — add an A record `jurisai.rit.services → 172.236.204.215`
   (see `docs/Infrastructure/How To Add DNS`).

2. **kubectl** — install & point at the cluster
   (see `docs/Kubernetes/How To Install kubectl`).

3. **App secret** — fill real values and apply:
   ```bash
   cp k8s/jurisai-app-secrets.yaml.example k8s/jurisai-app-secrets.yaml
   # edit: strong POSTGRES_PASSWORD (and the matching DATABASE_URL), a long JWT_SECRET, SMTP, recipients
   kubectl apply -f k8s/jurisai-app-secrets.yaml      # gitignored — do not commit
   ```

4. **GHCR pull secret** — the cluster pulls the private images from ghcr.io using a
   GitHub **Personal Access Token (classic)** with scope **`read:packages`**
   (github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)):
   ```bash
   kubectl create secret docker-registry ghcr-secret \
     --docker-server=ghcr.io \
     --docker-username=shahnehalali \
     --docker-password=<YOUR_GITHUB_PAT> \
     --docker-email=rit.services.backend@gmail.com \
     --namespace=jurisai
   ```

5. **GitHub** — create branch `k8s-deployment`. **No extra secret needed**: the CI
   pushes to ghcr.io using the built-in `GITHUB_TOKEN`. Pushing to that branch builds
   the images and bumps the tags in `jurisai-k8s.yaml`.
   > First push: the new `jurisai-server` / `jurisai-client` packages are created under
   > your GitHub account as **private**. That's what `ghcr-secret` is for.

6. **ArgoCD** ([argocd.rit.services](https://argocd.rit.services), creds in Vaultwarden “Kubernetes”):
   connect this repo, create an Application →
   **Revision** `k8s-deployment`, **Path** `k8s`, **Namespace** `jurisai`, auto-sync on.

## Deploy
Once 1–6 are done:
```bash
git checkout -b k8s-deployment && git push -u origin k8s-deployment
```
CI builds both images and ArgoCD rolls them out. Verify:
```bash
kubectl -n jurisai get pods,svc,certificate,ingressroute
kubectl -n jurisai get certificate jurisai-cert   # wait for Ready=True
curl https://jurisai.rit.services/api/health
```

## Encryption at rest (GDPR)

Two layers protect data:
1. **App-level field encryption** (per-org envelope, `DATA_ENC_KEY`) for sensitive
   compliance content — already active.
2. **Encrypted storage volumes** (LUKS via Longhorn) so the *whole* database +
   uploads (incl. user PII) are encrypted on disk. The `longhorn-encrypted`
   StorageClass and the `jurisai-*-pvc` claims use it.

Enabling #2 needs a one-time migration (a PVC's StorageClass is immutable, so the
volumes are re-provisioned). **Node prereq:** `cryptsetup` + `dm_crypt` on the
Longhorn nodes.

```bash
# 1. Create the LUKS key secret (out of band; back the key up separately!)
cp k8s/longhorn-crypto-secret.yaml.example k8s/longhorn-crypto-secret.yaml
#   set a strong CRYPTO_KEY_VALUE (openssl rand -base64 48), then:
kubectl apply -f k8s/longhorn-crypto-secret.yaml            # gitignored

# 2. Back up existing data (skip only if it's throwaway demo data)
kubectl -n jurisai exec deploy/jurisai-postgres -- \
  pg_dump -U jurisai jurisai > backup.sql
#   (and copy /app/uploads out of the server pod if you have real documents)

# 3. Re-provision the volumes on the encrypted class. The StorageClass change is
#    already in jurisai-k8s.yaml; the old PVCs must be deleted so ArgoCD recreates
#    them encrypted. Scale down first to release the volumes:
kubectl -n jurisai scale deploy/jurisai-server deploy/jurisai-postgres --replicas=0
kubectl -n jurisai delete pvc jurisai-postgres-pvc jurisai-uploads-pvc
#    ArgoCD re-syncs -> new LUKS-encrypted PVCs + pods. Postgres re-seeds the
#    catalog automatically (demo/admin skipped in prod).

# 4. Restore your backup if you took one
kubectl -n jurisai exec -i deploy/jurisai-postgres -- \
  psql -U jurisai jurisai < backup.sql

# 5. Verify the volumes are encrypted
kubectl -n longhorn-system get volumes.longhorn.io -o \
  custom-columns=NAME:.metadata.name,ENCRYPTED:.spec.encrypted
```

## Notes
- The **server runs at 1 replica** on purpose: it runs `prisma db push` + catalog
  seed on start and owns the ReadWriteOnce uploads volume. Don't add an HPA to it.
  The **client** is stateless and has an HPA (2–5).
- The catalog (frameworks, classification, GDPR action plan) is seeded automatically;
  **demo/admin accounts are skipped in production** (set `SEED_DEMO=true` to include them).
- First request after a cold start may be slow while the server seeds.
