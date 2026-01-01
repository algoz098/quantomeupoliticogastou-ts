# Frontend Dockerfile
# Multi-stage build: Node para build, Nginx para servir

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar codigo fonte
COPY . .

# Argumento para URL da API (pode ser sobrescrito no build)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build da aplicacao
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:alpine AS production

# Remover configuracao padrao do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build do frontend
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copiar configuracao customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Comando padrao do nginx
CMD ["nginx", "-g", "daemon off;"]

