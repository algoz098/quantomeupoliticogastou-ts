# API Dockerfile
# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias de build para better-sqlite3
RUN apk add --no-cache python3 make g++

# Copiar arquivos de dependencias
COPY package*.json ./

# Instalar todas as dependencias (incluindo devDependencies para build)
RUN npm ci

# Copiar codigo fonte
COPY tsconfig.json ./
COPY src ./src

# Build do TypeScript (inclui scripts de import)
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Instalar dependencias de runtime para better-sqlite3
RUN apk add --no-cache python3 make g++

# Criar usuario nao-root para seguranca
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar arquivos de dependencias
COPY package*.json ./

# Instalar apenas dependencias de producao
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar build do stage anterior (inclui scripts compilados)
COPY --from=builder /app/dist ./dist

# Copiar entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Criar diretorios necessarios
RUN mkdir -p /app/data /app/database && chown -R nodejs:nodejs /app/data /app/database

# Mudar para usuario nao-root
USER nodejs

# Variaveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/politicos.db

# Expor porta
EXPOSE 3000

# Health check (com start-period maior para permitir importacao inicial)
HEALTHCHECK --interval=30s --timeout=10s --start-period=600s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Usar entrypoint que verifica banco e importa dados se necessario
ENTRYPOINT ["./entrypoint.sh"]

