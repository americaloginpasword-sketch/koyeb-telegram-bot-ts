# Настройка Google API для Google Sheets

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

| Переменная | Значение | Источник |
|------------|----------|----------|
| `SHEET_ID` | ID таблицы | URL Google Sheets |
| `GOOGLE_SA_EMAIL` | `client_email` | JSON файл |
| `GOOGLE_SA_PRIVATE_KEY` | `private_key` | JSON файл |

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

## 🚀 **Проверка:**

После настройки в логах должно появиться:
```
Google Sheets Analytics: CONFIGURED
Google Sheets Analytics initialized
```

## 📊 **Структура таблицы:**

Бот автоматически создаст таблицу с колонками:
- A: Дата первого посещения
- B: Никнейм пользователя
- C-H: Действия по постам 1-6
