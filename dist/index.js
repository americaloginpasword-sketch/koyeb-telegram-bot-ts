"use strict";
/**
 * @file: src/index.ts
 * @description: Точка входа Neurohod: загрузка конфигов, инициализация бота и HTTP-сервера
 * @created: 2025-08-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./logger");
const server_1 = require("./http/server");
const bot_1 = require("./bot/bot");
const loadConfig_1 = require("./services/config/loadConfig");
const googleSheets_1 = require("./services/analytics/googleSheets");
async function main() {
    dotenv_1.default.config();
    const logger = (0, logger_1.createLogger)();
    const appConfig = await (0, loadConfig_1.loadAppConfig)("config/app.yaml");
    // Инициализируем Google Sheets Analytics если настроено
    let analytics;
    if (appConfig.analytics?.google_sheets) {
        try {
            analytics = new googleSheets_1.GoogleSheetsAnalytics({
                sheetId: appConfig.analytics.google_sheets.sheet_id,
                serviceAccountEmail: appConfig.analytics.google_sheets.service_account_email,
                privateKey: appConfig.analytics.google_sheets.private_key,
            }, logger);
            logger.info("Google Sheets Analytics initialized");
        }
        catch (error) {
            logger.error({ error }, "Failed to initialize Google Sheets Analytics");
        }
    }
    const bot = (0, bot_1.createBot)(process.env.TELEGRAM_BOT_TOKEN ?? "", logger, appConfig, analytics);
    const app = (0, server_1.createHttpServer)({
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
    }
    else {
        logger.info({ webhookUrl }, "Webhook mode configured externally");
    }
    // Graceful shutdown
    const shutdown = async (signal) => {
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
        }
        catch (error) {
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
