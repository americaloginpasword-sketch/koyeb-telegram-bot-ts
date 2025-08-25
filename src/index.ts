/**
 * @file: src/index.ts
 * @description: Точка входа Neurohod: загрузка конфигов, инициализация бота и HTTP-сервера
 * @created: 2025-08-19
 */

import dotenv from "dotenv";
import { createLogger } from "./logger";
import { createHttpServer } from "./http/server";
import { createBot } from "./bot/bot";
import { loadAppConfig } from "./services/config/loadConfig";
import { GoogleSheetsAnalytics } from "./services/analytics/googleSheets";

async function main() {
  dotenv.config();
  const logger = createLogger();

  const appConfig = await loadAppConfig("config/app.yaml");

  // Инициализируем Google Sheets Analytics если настроено
  let analytics: GoogleSheetsAnalytics | undefined;
  if (appConfig.analytics?.google_sheets) {
    try {
      analytics = new GoogleSheetsAnalytics(
        {
          sheetId: appConfig.analytics.google_sheets.sheet_id,
          serviceAccountEmail: appConfig.analytics.google_sheets.service_account_email,
          privateKeyPath: appConfig.analytics.google_sheets.private_key_path,
        },
        logger
      );
      logger.info("Google Sheets Analytics initialized");
    } catch (error) {
      logger.error({ error }, "Failed to initialize Google Sheets Analytics");
    }
  }

  const bot = createBot(process.env.TELEGRAM_BOT_TOKEN ?? "", logger, appConfig, analytics);

  const app = createHttpServer({
    logger,
    bot,
    appConfig,
    analytics,
  });

  const port = Number(process.env.PORT ?? 3000);
  const server = app.listen(port, () => {
    logger.info({ port }, "HTTP server listening");
  });

  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.info("Starting bot in long polling mode (no TELEGRAM_WEBHOOK_URL set)");
    await bot.start({ drop_pending_updates: true });
  } else {
    logger.info({ webhookUrl }, "Webhook mode configured externally");
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Received shutdown signal");
    
    try {
      if (!webhookUrl) {
        await bot.stop();
        logger.info("Bot stopped");
      }
      
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    } catch (error) {
      logger.error({ error }, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
