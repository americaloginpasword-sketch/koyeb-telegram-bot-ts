# @file: Dockerfile
# @description: Production Dockerfile for Neurohod bot optimized for Koyeb
# @created: 2025-08-19
# @updated: 2025-01-27

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neurohod -u 1001

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Копируем файлы
COPY --from=build --chown=neurohod:nodejs /app/dist ./dist
COPY --from=build --chown=neurohod:nodejs /app/node_modules ./node_modules
COPY --chown=neurohod:nodejs package.json ./

# Переключаемся на непривилегированного пользователя
USER neurohod

# Открываем порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение
CMD ["node", "dist/index.js"]
