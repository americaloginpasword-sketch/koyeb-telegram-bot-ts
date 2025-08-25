# Neurohod Bot - Документация проекта

## 📋 Обзор

Neurohod Bot - это Telegram бот для автоматизации процессов с интеграцией Google Sheets аналитики, написанный на TypeScript с использованием Node.js 20.

## 🏗 Архитектура

### Технологический стек:
- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js + Grammy (Telegram Bot API)
- **Containerization**: Docker
- **Platform**: Koyeb (production)
- **Analytics**: Google Sheets API
- **Monitoring**: Prometheus metrics
- **Logging**: Pino

### Структура проекта:
```
src/
├── bot/           # Telegram бот логика
├── http/          # HTTP сервер и webhook'и
├── services/      # Бизнес-логика и интеграции
├── metrics/       # Prometheus метрики
└── index.ts       # Точка входа
```

## 🚀 Деплой

### Платформа: Koyeb
- **URL**: https://koyeb.com
- **Преимущества**: 
  - Бесплатный план (2 приложения, 512MB RAM)
  - Автоматический деплой из GitHub
  - HTTPS из коробки
  - Автомасштабирование

### Файлы деплоя:
- `Dockerfile` - контейнеризация
- `koyeb.yaml` - конфигурация Koyeb
- `KOYEB_DEPLOYMENT.md` - подробные инструкции
- `scripts/prepare-deploy.sh` - скрипт подготовки

### Переменные окружения:
```bash
# Обязательные секреты в Koyeb:
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-app.koyeb.app/telegram/webhook
SHEET_ID=your_google_sheet_id
GOOGLE_SA_EMAIL=your_service_account_email
GOOGLE_SA_PRIVATE_KEY=your_private_key
```

## 🔧 Разработка

### Локальный запуск:
```bash
npm install
npm run dev
```

### Подготовка к деплою:
```bash
npm run prepare-deploy
```

### Сборка:
```bash
npm run build
npm start
```

## 📊 Мониторинг

### Health Check:
- Endpoint: `/healthz`
- Проверка: статус приложения, uptime, память

### Метрики:
- Endpoint: `/metrics`
- Формат: Prometheus
- Метрики: HTTP запросы, ошибки, время ответа

### Логирование:
- Логгер: Pino
- Уровни: error, warn, info, debug
- Формат: JSON

## 🔒 Безопасность

### Webhook безопасность:
- HTTPS только
- Верификация подписей (если поддерживается)
- Rate limiting

### Переменные окружения:
- Секреты только в Koyeb Secrets
- Никаких токенов в коде
- Регулярная ротация

## 📈 Масштабирование

### Автомасштабирование:
- Koyeb автоматически масштабирует по нагрузке
- Health checks для мониторинга
- Graceful shutdown

### Мониторинг производительности:
- Prometheus метрики
- Логи в реальном времени
- Алерты при проблемах

## 🔄 CI/CD

### Автоматический деплой:
1. Push в main branch
2. Koyeb автоматически собирает и деплоит
3. Health check проверяет работоспособность
4. Webhook обновляется автоматически

### Ручной деплой:
```bash
# Подготовка
npm run prepare-deploy

# Коммит и пуш
git add .
git commit -m "Deploy to Koyeb"
git push origin main
```

## 📚 Документация

### Основные файлы:
- `docs/Project.md` - архитектура и обзор
- `docs/Tasktracker.md` - статус задач
- `docs/changelog.md` - история изменений
- `KOYEB_DEPLOYMENT.md` - инструкции по деплою

### API документация:
- Health check: `GET /healthz`
- Метрики: `GET /metrics`
- Telegram webhook: `POST /telegram/webhook`

## 🐛 Troubleshooting

### Частые проблемы:
1. **Бот не отвечает**: проверьте логи в Koyeb
2. **Ошибки Google Sheets**: проверьте права доступа
3. **Webhook не работает**: проверьте HTTPS URL

### Полезные команды:
```bash
# Проверка health
curl https://your-app.koyeb.app/healthz

# Просмотр метрик
curl https://your-app.koyeb.app/metrics

# Проверка webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

---

**Версия**: 1.0.0  
**Последнее обновление**: 2025-01-27  
**Платформа**: Koyeb


