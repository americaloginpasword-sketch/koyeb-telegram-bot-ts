# Настройка Webhook для Telegram Bot

## 🚨 **Проблема:**
Бот падает с ошибкой `409: Conflict: terminated by other getUpdates request` из-за конфликта между несколькими экземплярами.

## 🔧 **Решение:**
Настроить webhook вместо long polling.

## 📝 **Шаги настройки:**

### **1. Добавьте webhook URL в Koyeb Secrets:**

**Name:** `TELEGRAM_WEBHOOK_URL`  
**Value:** `https://koyeb-telegram-bot-ts-americaloginpasword-sketch.koyeb.app/webhook`

### **2. Формат webhook URL:**
```
https://[YOUR_KOYEB_APP_NAME]-[YOUR_USERNAME].koyeb.app/webhook
```

### **3. Проверьте ваш URL:**
Замените на ваш реальный URL из Koyeb Dashboard.

## 🚀 **После добавления webhook:**

1. **Сделайте redeploy** на Koyeb
2. **В логах должно появиться:**
   ```
   TELEGRAM_WEBHOOK_URL: SET
   Webhook mode configured externally
   Webhook set successfully
   ```

## ✅ **Преимущества webhook:**
- ✅ Нет конфликтов между экземплярами
- ✅ Более стабильная работа
- ✅ Лучшая производительность
- ✅ Поддержка множественных пользователей

## 🔍 **Проверка:**
После настройки webhook бот должен:
- ✅ Запускаться без ошибок
- ✅ Обрабатывать сообщения
- ✅ Работать с Google Sheets Analytics
