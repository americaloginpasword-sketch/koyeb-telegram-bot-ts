# 🚀 Руководство по развертыванию Neurohod Bot

## 📋 Обзор

Этот документ содержит инструкции по развертыванию Telegram бота Neurohod на бесплатных платформах для обеспечения его постоянной работы.

## 🎯 Рекомендуемые платформы

### 1. Railway (Рекомендуемый)
**Преимущества:**
- 🆓 Бесплатный план: 500 часов/месяц
- 🚀 Автоматический деплой из GitHub
- 🔒 HTTPS из коробки
- 📊 Мониторинг и логи
- 🐳 Поддержка Docker

#### Пошаговая настройка:

1. **Подготовка репозитория:**
   ```bash
   # Убедитесь, что все изменения закоммичены в GitHub
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Создание проекта на Railway:**
   - Перейдите на [railway.app](https://railway.app)
   - Войдите через GitHub
   - Нажмите "New Project" → "Deploy from GitHub repo"
   - Выберите ваш репозиторий

3. **Настройка переменных окружения:**
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_WEBHOOK_URL=https://your-app-name.railway.app/telegram/webhook
   SHEET_ID=your_google_sheet_id
   GOOGLE_SA_EMAIL=your_service_account_email
   GOOGLE_SA_PRIVATE_KEY_PATH=.secrets/google-sa.json
   NODE_ENV=production
   ```

4. **Настройка webhook:**
   - После деплоя скопируйте URL вашего приложения
   - Установите webhook URL в Telegram:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-app-name.railway.app/telegram/webhook"}'
   ```

### 2. Render (Альтернатива)
**Преимущества:**
- 🆓 Бесплатный план: 750 часов/месяц
- 🔄 Автоматический рестарт при простоях
- 🔒 SSL сертификаты

#### Настройка:
1. Создайте аккаунт на [render.com](https://render.com)
2. Подключите GitHub репозиторий
3. Выберите "Web Service"
4. Настройте переменные окружения аналогично Railway

### 3. Fly.io (Для продвинутых)
**Преимущества:**
- 🆓 Бесплатный план: 3 VM, 256MB RAM
- 🌍 Глобальное распределение
- ⚡ Высокая производительность

## 🔧 Необходимые файлы

### 1. Создайте `.env.example`:
```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-app.railway.app/telegram/webhook

# Google Sheets Analytics
SHEET_ID=your_sheet_id
GOOGLE_SA_EMAIL=your_service_account_email
GOOGLE_SA_PRIVATE_KEY_PATH=.secrets/google-sa.json

# Environment
NODE_ENV=production
PORT=3000
```

### 2. Обновите `.dockerignore`:
```
node_modules
npm-debug.log
.env
.env.local
.env.production
.git
.gitignore
README.md
docs/
*.md
```

## 📊 Мониторинг

### Health Check
После деплоя проверьте работоспособность:
```bash
curl https://your-app.railway.app/healthz
```

Ожидаемый ответ:
```json
{
  "status": "OK",
  "timestamp": "2025-08-20T10:00:00.000Z",
  "uptime": 3600,
  "memory": {...},
  "version": "1.0.0"
}
```

### Метрики
```bash
curl https://your-app.railway.app/metrics
```

## 🔒 Безопасность

### Переменные окружения
- ✅ Никогда не коммитьте `.env` файлы
- ✅ Используйте секреты платформы для хранения токенов
- ✅ Регулярно ротируйте токены

### Webhook безопасность
- ✅ Используйте HTTPS только
- ✅ Проверяйте подписи webhook'ов (если поддерживается)
- ✅ Ограничивайте доступ к эндпоинтам

## 🚨 Troubleshooting

### Бот не отвечает
1. Проверьте логи в панели управления платформы
2. Убедитесь, что webhook URL правильный
3. Проверьте health check эндпоинт

### Ошибки Google Sheets
1. Проверьте права доступа service account
2. Убедитесь, что SHEET_ID правильный
3. Проверьте формат private key

### Высокое потребление ресурсов
1. Мониторьте метрики в `/metrics`
2. Проверьте логи на утечки памяти
3. Оптимизируйте код при необходимости

## 📈 Масштабирование

### Когда переходить на платные планы:
- 🚀 Более 1000 активных пользователей
- 💰 Регулярные платежи через бота
- 📊 Потребность в детальной аналитике

### Рекомендуемые платные планы:
- **Railway Pro**: $5/месяц за дополнительные ресурсы
- **Render Pro**: $7/месяц за больше часов
- **DigitalOcean**: $5/месяц за VPS

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Обратитесь к документации платформы
3. Создайте issue в GitHub репозитории

---

**Удачного деплоя! 🎉**


