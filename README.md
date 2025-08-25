# Telegram Bot on Koyeb (Node.js 20 + TypeScript + Express + grammY + Google Sheets + Docker)

A minimal, production-friendly template to deploy a Telegram bot to **Koyeb** for free (Hobby plan).  
Features: HTTPS webhook via Koyeb, stable URL, logging with pino, optional Google Sheets analytics.

## Quick Start

```bash
npm install
npm run build
# Create .env from example and fill values
cp .env.example .env
npm start
```

## Deploy to Koyeb (summarized)
1) Push this repo to GitHub.  
2) In Koyeb → Create App → From GitHub Repo → pick this repo.  
3) Choose **Dockerfile** deployment (recommended).  
4) Set env vars: BOT_TOKEN, WEBHOOK_SECRET, SHEETS_SPREADSHEET_ID, and GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.  
5) Deploy → get your URL: https://<app>.koyeb.app  
6) Set webhook:
```
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook"   -d "url=https://<app>.koyeb.app/webhook/<WEBHOOK_SECRET>"
```
7) Message your bot `/start`.

See the detailed step-by-step guide in chat.