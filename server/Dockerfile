# JurisAI API server (Node/Express + Prisma).
# IMPORTANT: build context must be the REPO ROOT, because the server reads the
# catalog from ../content (resolves to /content in the image), which lives
# outside the server/ folder.
#   docker build -f server/Dockerfile -t ghcr.io/shahnehalali/jurisai-server:latest .
FROM node:20-alpine

# Prisma needs OpenSSL on Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies (incl. prisma CLI) using the lockfile.
COPY server/package*.json ./
RUN npm ci

# Generate the Prisma client.
COPY server/prisma ./prisma
RUN npx prisma generate

# Server source.
COPY server/ ./

# Catalog content (seed JSON, law/profile content). The server resolves it at
# ../../content from /app/prisma and /app/services/... -> /content.
COPY content /content

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Sync schema, seed the catalog (idempotent; demo users skipped in production),
# encrypt any pre-existing plaintext (idempotent), then run the API.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run seed && node scripts/backfillEncryption.js && node index.js"]
