# 🚀 Деплой Neurohod Bot на Koyeb

## 📋 Подготовка к деплою

### 1. Подготовка репозитория

Убедитесь, что все файлы готовы к деплою:

```bash
# Проверьте, что все изменения закоммичены
git add .
git commit -m "Prepare for Koyeb deployment"
git push origin main
```

### 2. Настройка секретов в Koyeb

В панели управления Koyeb создайте следующие секреты:

#### Обязательные секреты:
- `telegram-bot-token` - токен вашего Telegram бота
- `telegram-webhook-url` - URL webhook'а (будет создан после деплоя)
- `google-sheet-id` - ID Google таблицы для аналитики
- `google-sa-email` - email сервисного аккаунта Google
- `google-sa-private-key` - приватный ключ сервисного аккаунта

#### Как создать секреты:
1. Войдите в панель Koyeb
2. Перейдите в раздел "Secrets"
3. Нажмите "Create Secret"
4. Введите имя и значение секрета

### 3. Деплой приложения

#### Вариант 1: Через веб-интерфейс Koyeb

1. **Создание приложения:**
   - Нажмите "Create App"
   - Выберите "GitHub" как источник
   - Подключите ваш репозиторий

2. **Настройка деплоя:**
   - **Name:** `neurohod-bot`
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Run Command:** `npm start`
   - **Port:** `3000`

3. **Переменные окружения:**
   ```
   NODE_ENV=production
   PORT=3000
   ```

4. **Секреты:**
   - Подключите все созданные секреты

#### Вариант 2: Через CLI Koyeb

```bash
# Установка CLI
curl -fsSL https://cli.koyeb.com/install.sh | bash

# Авторизация
koyeb login

# Деплой
koyeb app init neurohod-bot \
  --git github.com/YOUR_USERNAME/YOUR_REPO \
  --git-branch main \
  --ports 3000:http \
  --routes /:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --secret telegram-bot-token \
  --secret telegram-webhook-url \
  --secret google-sheet-id \
  --secret google-sa-email \
  --secret google-sa-private-key
```

### 4. Настройка webhook'а

После успешного деплоя:

1. **Получите URL приложения:**
   - В панели Koyeb найдите ваш деплой
   - Скопируйте URL (например: `https://neurohod-bot-your-username.koyeb.app`)

2. **Установите webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://neurohod-bot-your-username.koyeb.app/telegram/webhook"}'
   ```

3. **Обновите секрет webhook URL:**
   - В Koyeb обновите секрет `telegram-webhook-url`
   - Установите значение: `https://neurohod-bot-your-username.koyeb.app/telegram/webhook`

### 5. Проверка работоспособности

#### Health Check:
```bash
curl https://neurohod-bot-your-username.koyeb.app/healthz
```

#### Метрики:
```bash
curl https://neurohod-bot-your-username.koyeb.app/metrics
```

#### Тест бота:
- Отправьте сообщение боту в Telegram
- Проверьте логи в панели Koyeb

## 🔧 Мониторинг и логи

### Просмотр логов:
1. В панели Koyeb перейдите к вашему приложению
2. Нажмите на "Logs" для просмотра логов в реальном времени

### Метрики:
- Используйте эндпоинт `/metrics` для Prometheus метрик
- Настройте алерты в Koyeb для мониторинга

## 🚨 Troubleshooting

### Бот не отвечает:
1. Проверьте логи в Koyeb
2. Убедитесь, что webhook URL правильный
3. Проверьте health check эндпоинт

### Ошибки Google Sheets:
1. Проверьте права доступа service account
2. Убедитесь, что SHEET_ID правильный
3. Проверьте формат private key

### Проблемы с деплоем:
1. Проверьте build логи
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения

## 📈 Масштабирование

### Автомасштабирование:
Koyeb автоматически масштабирует приложение в зависимости от нагрузки.

### Ручное масштабирование:
1. В панели Koyeb перейдите к приложению
2. Нажмите "Scale"
3. Установите нужное количество инстансов

## 💰 Стоимость

- **Бесплатный план:** 2 приложения, 512MB RAM
- **Платный план:** от $7/месяц за дополнительные ресурсы

## 🔒 Безопасность

### Рекомендации:
- Регулярно ротируйте токены
- Используйте HTTPS только
- Проверяйте логи на подозрительную активность
- Ограничивайте доступ к эндпоинтам

---

**Удачного деплоя! 🎉**
