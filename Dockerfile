# ---------- Build stage ----------
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    # Копируем package.json и package-lock.json
    COPY package*.json ./
    
    # Устанавливаем зависимости
    RUN npm ci
    
    # Копируем весь проект
    COPY . .
    
    # Переменные окружения для сборки
    ENV NODE_ENV=production
    
    # Сборка Tailwind и Next.js
    RUN npx tailwindcss -i ./src/app/globals.css -o ./styles.css
    RUN npm run build
    
    # ---------- Production stage ----------
    FROM node:18-alpine AS runner
    WORKDIR /app
    
    # Переменные окружения
    ENV NODE_ENV=production
    ENV PORT=3005
    ENV HOST=0.0.0.0
    
    # Создаем пользователя для безопасности
    RUN addgroup --system --gid 1001 nodejs && \
        adduser --system --uid 1001 nextjs
    
    # Копируем файлы из сборки
    COPY --from=builder --chown=nextjs:nodejs /app/public ./public
    COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
    COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
    COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
    
    # Переходим на непривилегированного пользователя
    USER nextjs
    
    # Открываем порт для Nginx
    EXPOSE 3005
    
    # Запуск Next.js
    CMD ["npm", "run", "start"]
    