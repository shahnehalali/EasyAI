# JurisAI API server (Node/Express + Prisma). Build context: ./server
FROM node:20-alpine

# Prisma needs OpenSSL on Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies (incl. prisma CLI) using the lockfile for reproducible builds.
COPY package*.json ./
RUN npm ci

# Generate the Prisma client against the schema.
COPY prisma ./prisma
RUN npx prisma generate

# App source.
COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# On start: sync the schema, seed the catalog (idempotent; demo users skipped in
# production), then run the API. Keep the server Deployment at 1 replica so this
# runs once and the uploads volume has a single writer.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run seed && node index.js"]
