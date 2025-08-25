# 🚀 Следующие шаги для деплоя на Koyeb

## ✅ Что уже готово:
- [x] Проект подготовлен к деплою
- [x] Все файлы конфигурации созданы
- [x] Скрипт подготовки протестирован
- [x] Документация обновлена

## 📋 Что нужно сделать:

### 1. Закоммитить изменения
```bash
git add .
git commit -m "Prepare for Koyeb deployment"
git push origin main
```

### 2. Создать секреты в Koyeb
В панели управления Koyeb создайте следующие секреты:

#### Обязательные секреты:
- `telegram-bot-token` - ваш токен Telegram бота
- `telegram-webhook-url` - будет создан после деплоя
- `google-sheet-id` - ID Google таблицы для аналитики
- `google-sa-email` - email сервисного аккаунта Google
- `google-sa-private-key` - приватный ключ сервисного аккаунта

### 3. Деплой через веб-интерфейс Koyeb
1. Войдите в [koyeb.com](https://koyeb.com)
2. Нажмите "Create App"
3. Выберите "GitHub" как источник
4. Подключите ваш репозиторий
5. Настройте:
   - **Name**: `neurohod-bot`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Port**: `3000`
6. Подключите все созданные секреты
7. Нажмите "Deploy"

### 4. Настройка webhook'а
После успешного деплоя:
1. Скопируйте URL приложения из Koyeb
2. Установите webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.koyeb.app/telegram/webhook"}'
```

### 5. Проверка работоспособности
```bash
# Health check
curl https://your-app.koyeb.app/healthz

# Метрики
curl https://your-app.koyeb.app/metrics

# Тест бота
# Отправьте сообщение боту в Telegram
```

## 📚 Подробные инструкции:
- `KOYEB_DEPLOYMENT.md` - полное руководство по деплою
- `docs/Project.md` - архитектура и обзор проекта

## 🆘 Если возникнут проблемы:
1. Проверьте логи в панели Koyeb
2. Убедитесь, что все секреты созданы правильно
3. Проверьте health check эндпоинт
4. Обратитесь к `KOYEB_DEPLOYMENT.md` для troubleshooting

---

**Удачного деплоя! 🎉**
