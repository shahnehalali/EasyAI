# JurisAI web client (React/Vite -> static, served by nginx).
# IMPORTANT: build context must be the REPO ROOT, because the client's Vite
# config aliases the screenshot-feedback plugin from ../plugins (outside client/).
#   docker build -f client/Dockerfile -t ritservi/jurisai-client:latest .
FROM node:20-alpine AS build
WORKDIR /app

# Install client deps first (better layer caching).
COPY client/package*.json ./client/
RUN cd client && npm ci

# The plugin source the client imports via a Vite alias, then the client source.
COPY plugins ./plugins
COPY client ./client

RUN cd client && npm run build

# --- Serve the built SPA with nginx ---
FROM nginx:alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
