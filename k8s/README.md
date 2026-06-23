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
| `jurisai-secrets.example.yaml` | Template for the `jurisai-secrets` Secret (create out of band) |
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
   cp k8s/jurisai-secrets.example.yaml k8s/jurisai-secrets.yaml
   # edit: strong POSTGRES_PASSWORD (and the matching DATABASE_URL), a long JWT_SECRET, SMTP, recipients
   kubectl apply -f k8s/jurisai-secrets.yaml      # gitignored — do not commit
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

## Notes
- The **server runs at 1 replica** on purpose: it runs `prisma db push` + catalog
  seed on start and owns the ReadWriteOnce uploads volume. Don't add an HPA to it.
  The **client** is stateless and has an HPA (2–5).
- The catalog (frameworks, classification, GDPR action plan) is seeded automatically;
  **demo/admin accounts are skipped in production** (set `SEED_DEMO=true` to include them).
- First request after a cold start may be slow while the server seeds.
