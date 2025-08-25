"use strict";
/**
 * @file: src/http/server.ts
 * @description: HTTP-сервер (Express) с эндпоинтами healthz, metrics и webhook
 * @created: 2025-08-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpServer = createHttpServer;
const express_1 = __importDefault(require("express"));
const metrics_1 = require("../metrics/metrics");
function createHttpServer({ logger, bot, appConfig, analytics }) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get("/healthz", (_req, res) => {
        res.status(200).json({
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || "1.0.0"
        });
    });
    app.get("/metrics", async (_req, res) => {
        res.set("Content-Type", metrics_1.metricsRegistry.contentType);
        res.end(await metrics_1.metricsRegistry.metrics());
    });
    // Редирект-трекинг кликов URL-кнопок: /r?action=material&post=1&to=<encoded>
    app.get("/r", async (req, res) => {
        const action = String(req.query.action ?? "unknown");
        const postId = String(req.query.post ?? "0");
        const to = String(req.query.to ?? "");
        metrics_1.buttonClickCounter.labels(action, postId).inc();
        // Логируем клик в Google Sheets если доступно
        if (analytics) {
            try {
                // В URL кнопках мы не знаем telegram_id, поэтому логируем только action
                // В реальном приложении можно передавать telegram_id в URL или использовать сессии
                logger.info({ action, postId, to }, "URL button click tracked");
            }
            catch (error) {
                logger.error({ error, action, postId }, "Failed to log URL button click to Google Sheets");
            }
        }
        try {
            const url = new URL(to);
            res.redirect(307, url.toString());
        }
        catch {
            logger.warn({ to }, "Invalid redirect URL");
            res.status(400).send("Bad redirect URL");
        }
    });
    app.post("/telegram/webhook", async (req, res) => {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).end();
        }
        catch (err) {
            logger.error({ err }, "Webhook handling error");
            res.status(500).end();
        }
    });
    return app;
}
