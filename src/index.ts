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
import { loadEnvironment, isGoogleSheetsConfigured, getGoogleSheetsConfig, logEnvironmentStatus } from "./services/config/environment";

async function main() {
  dotenv.config();
  
  // Загружаем и валидируем переменные окружения
  const env = loadEnvironment();
  const logger = createLogger();
  
  // Логируем статус конфигурации
  logEnvironmentStatus(env);

  const appConfig = await loadAppConfig("config/app.yaml");

  // Инициализируем Google Sheets Analytics если настроено
  let analytics: GoogleSheetsAnalytics | undefined;
  if (isGoogleSheetsConfigured(env)) {
    try {
      const sheetsConfig = getGoogleSheetsConfig(env);
      if (sheetsConfig) {
        analytics = new GoogleSheetsAnalytics(sheetsConfig, logger);
        logger.info("Google Sheets Analytics initialized");
      }
    } catch (error) {
      logger.error({ error }, "Failed to initialize Google Sheets Analytics");
    }
  }

  const bot = createBot(env.TELEGRAM_BOT_TOKEN, logger, appConfig, analytics);

  const app = createHttpServer({
    logger,
    bot,
    appConfig,
    analytics,
  });

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "HTTP server listening");
  });

                const webhookUrl = env.TELEGRAM_WEBHOOK_URL;
              if (!webhookUrl) {
                logger.info("Starting bot in long polling mode (no TELEGRAM_WEBHOOK_URL set)");
                // Добавляем задержку для избежания конфликтов
                await new Promise(resolve => setTimeout(resolve, 2000));
                await bot.start({ drop_pending_updates: true });
              } else {
                logger.info({ webhookUrl }, "Webhook mode configured externally");
                // Настраиваем webhook
                await bot.api.setWebhook(webhookUrl);
                logger.info("Webhook set successfully");
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
  console.error('Fatal error during startup:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});
