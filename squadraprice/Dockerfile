# Build static assets
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Same-origin API via Caddy reverse proxy — leave empty for relative URLs
ARG VITE_API_BASE_URL=
ARG VITE_IMG_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_IMG_BASE_URL=$VITE_IMG_BASE_URL

RUN npm run build

# Serve with nginx (internal; TLS terminated by Caddy)
FROM nginx:1.27-alpine
COPY nginx.spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
