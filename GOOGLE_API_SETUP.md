# Настройка Google API для Google Sheets

## 🎯 **Обзор**

Эта инструкция поможет настроить Google Sheets Analytics для Telegram бота Neurohod. Система автоматически отслеживает действия пользователей и сохраняет их в Google Sheets.

## 🔧 **Пошаговая инструкция:**

### **1. Создание проекта в Google Cloud Console**

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите **Google Sheets API**:
   - Перейдите в "APIs & Services" → "Library"
   - Найдите "Google Sheets API"
   - Нажмите "Enable"

### **2. Создание сервисного аккаунта**

1. Перейдите в "APIs & Services" → "Credentials"
2. Нажмите "Create Credentials" → "Service Account"
3. Заполните форму:
   - **Name**: `neurohod-bot-analytics`
   - **Description**: `Service account for Telegram bot analytics`
4. Нажмите "Create and Continue"
5. Пропустите шаги 2 и 3 (роли и доступ)
6. Нажмите "Done"

### **3. Создание ключа**

1. В списке сервисных аккаунтов найдите созданный
2. Нажмите на email сервисного аккаунта
3. Перейдите на вкладку "Keys"
4. Нажмите "Add Key" → "Create new key"
5. Выберите "JSON"
6. Нажмите "Create"
7. **Скачайте файл** - он содержит все необходимые данные

### **4. Настройка Google Sheets**

1. Создайте новую таблицу в [Google Sheets](https://sheets.google.com/)
2. Скопируйте **ID таблицы** из URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ↑ ID таблицы ↑
   ```
3. Предоставьте доступ сервисному аккаунту:
   - Нажмите "Share" в правом верхнем углу
   - Добавьте email сервисного аккаунта (из JSON файла)
   - Дайте права "Editor"

### **5. Настройка переменных окружения**

В Koyeb добавьте следующие секреты:

| Переменная | Значение | Источник | Обязательная |
|------------|----------|----------|--------------|
| `SHEET_ID` | ID таблицы | URL Google Sheets | ✅ |
| `GOOGLE_SA_EMAIL` | `client_email` | JSON файл | ✅ |
| `GOOGLE_SA_PRIVATE_KEY` | `private_key` | JSON файл | ✅ |

**Примечание:** Все переменные Google Sheets Analytics являются опциональными. Бот будет работать и без них, но аналитика не будет сохраняться.

### **6. Извлечение данных из JSON**

Откройте скачанный JSON файл и найдите:

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "neurohod-bot-analytics@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Используйте:**
- `client_email` → `GOOGLE_SA_EMAIL`
- `private_key` → `GOOGLE_SA_PRIVATE_KEY` (весь блок с BEGIN/END)

## 🔒 **Безопасность:**

- ✅ **Никогда не коммитьте** JSON файл в Git
- ✅ **Используйте секреты** в Koyeb
- ✅ **Ограничьте права** сервисного аккаунта
- ✅ **Регулярно ротируйте** ключи

## 🔧 **Система переменных окружения**

Neurohod использует универсальную систему конфигурации переменных окружения:

### **Обязательные переменные:**
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота

### **Опциональные переменные:**
- `TELEGRAM_WEBHOOK_URL` - URL для webhook (если не указан, используется long polling)
- `SHEET_ID` - ID Google Sheets таблицы
- `GOOGLE_SA_EMAIL` - email сервисного аккаунта
- `GOOGLE_SA_PRIVATE_KEY` - приватный ключ сервисного аккаунта
- `LOG_LEVEL` - уровень логирования (по умолчанию: info)
- `VERIFY_WEBHOOKS` - проверка webhook (по умолчанию: false)

### **Автоматическая валидация:**
Система автоматически проверяет наличие обязательных переменных при запуске и выводит подробный статус конфигурации в логи.

## 🚀 **Проверка:**

После настройки в логах должно появиться:
```
Environment configuration:
  NODE_ENV: production
  PORT: 3000
  TELEGRAM_BOT_TOKEN: SET
  TELEGRAM_WEBHOOK_URL: SET
  Google Sheets Analytics: CONFIGURED
  LOG_LEVEL: info
  VERIFY_WEBHOOKS: true
Google Sheets Analytics initialized
```

## 📊 **Структура таблицы:**

Бот автоматически создаст таблицу с колонками:
- **A**: Дата первого посещения
- **B**: Никнейм пользователя  
- **C**: Действия по посту 1
- **D**: Действия по посту 2
- **E**: Действия по посту 3
- **F**: Действия по посту 4
- **G**: Действия по посту 5
- **H**: Действия по посту 6

### **Типы действий:**
- `start` - пользователь запустил бота
- `material` - клик по кнопке "Получить материалы"
- `support` - клик по кнопке "Техподдержка"
- `community` - клик по кнопке "Стать ПервоPROходцем"
- `payment` - клик по кнопке оплаты

## 🔧 **Устранение неполадок:**

### **Проблема: "Google Sheets Analytics: NOT CONFIGURED"**
**Решение:** Проверьте, что все три переменные настроены:
- `SHEET_ID`
- `GOOGLE_SA_EMAIL`
- `GOOGLE_SA_PRIVATE_KEY`

### **Проблема: "Failed to initialize Google Sheets Analytics"**
**Возможные причины:**
1. **Неправильный формат private_key** - убедитесь, что ключ содержит `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`
2. **Неправильный email** - проверьте, что email сервисного аккаунта указан верно
3. **Нет доступа к таблице** - убедитесь, что сервисный аккаунт имеет права "Editor" на таблицу

### **Проблема: "Missing required environment variables"**
**Решение:** Добавьте обязательную переменную `TELEGRAM_BOT_TOKEN`

### **Проблема: Данные не появляются в таблице**
**Проверьте:**
1. **Права доступа** - сервисный аккаунт должен иметь права "Editor"
2. **Формат ID таблицы** - ID должен быть из URL Google Sheets
3. **Логи приложения** - ищите ошибки при записи данных

## 📈 **Примеры использования:**

### **Анализ активности пользователей:**
```sql
-- Подсчет уникальных пользователей
SELECT COUNT(DISTINCT B) as unique_users FROM Sheet1

-- Топ постов по популярности
SELECT 
  'Post 1' as post, COUNT(C) as clicks FROM Sheet1 WHERE C != ''
UNION ALL
SELECT 'Post 2', COUNT(D) FROM Sheet1 WHERE D != ''
UNION ALL
SELECT 'Post 3', COUNT(E) FROM Sheet1 WHERE E != ''
-- и так далее для всех постов
```

### **Отслеживание конверсии:**
- **Start → Material**: Сколько пользователей скачали материалы
- **Start → Payment**: Сколько пользователей дошли до оплаты
- **Start → Community**: Сколько пользователей присоединились к сообществу

### **Автоматические отчеты:**
Настройте Google Sheets для автоматического создания отчетов:
1. **Ежедневные сводки** - количество новых пользователей
2. **Анализ постов** - какие посты популярнее
3. **Конверсионная воронка** - от start до payment
