"use strict";
/**
 * @file: src/metrics/metrics.ts
 * @description: Метрики Prometheus: клики кнопок, отправка постов, платежи
 * @created: 2025-08-19
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSendDuration = exports.errorCounter = exports.userStartCounter = exports.paymentSuccessCounter = exports.invoiceStartedCounter = exports.buttonClickCounter = exports.postSentCounter = exports.metricsRegistry = void 0;
const prom_client_1 = require("prom-client");
exports.metricsRegistry = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: exports.metricsRegistry });
exports.postSentCounter = new prom_client_1.Counter({
    name: "post_sent_total",
    help: "Количество отправленных постов",
    labelNames: ["post_id"],
    registers: [exports.metricsRegistry],
});
exports.buttonClickCounter = new prom_client_1.Counter({
    name: "button_click_total",
    help: "Клики по кнопкам",
    labelNames: ["action", "post_id"],
    registers: [exports.metricsRegistry],
});
exports.invoiceStartedCounter = new prom_client_1.Counter({
    name: "invoice_started_total",
    help: "Созданные инвойсы",
    labelNames: ["post_id"],
    registers: [exports.metricsRegistry],
});
exports.paymentSuccessCounter = new prom_client_1.Counter({
    name: "payment_success_total",
    help: "Успешные оплаты",
    labelNames: ["post_id"],
    registers: [exports.metricsRegistry],
});
exports.userStartCounter = new prom_client_1.Counter({
    name: "user_start_total",
    help: "Количество пользователей, начавших взаимодействие с ботом",
    registers: [exports.metricsRegistry],
});
exports.errorCounter = new prom_client_1.Counter({
    name: "bot_errors_total",
    help: "Количество ошибок бота",
    labelNames: ["error_type"],
    registers: [exports.metricsRegistry],
});
exports.postSendDuration = new prom_client_1.Counter({
    name: "post_send_duration_seconds",
    help: "Время отправки постов",
    labelNames: ["post_id"],
    registers: [exports.metricsRegistry],
});
