/**
 * @file: src/metrics/metrics.ts
 * @description: Метрики Prometheus: клики кнопок, отправка постов, платежи
 * @created: 2025-08-19
 */

import { Counter, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const postSentCounter = new Counter({
	name: "post_sent_total",
	help: "Количество отправленных постов",
	labelNames: ["post_id"] as const,
	registers: [metricsRegistry],
});

export const buttonClickCounter = new Counter({
	name: "button_click_total",
	help: "Клики по кнопкам",
	labelNames: ["action", "post_id"] as const,
	registers: [metricsRegistry],
});

export const invoiceStartedCounter = new Counter({
	name: "invoice_started_total",
	help: "Созданные инвойсы",
	labelNames: ["post_id"] as const,
	registers: [metricsRegistry],
});

export const paymentSuccessCounter = new Counter({
	name: "payment_success_total",
	help: "Успешные оплаты",
	labelNames: ["post_id"] as const,
	registers: [metricsRegistry],
});

export const userStartCounter = new Counter({
	name: "user_start_total",
	help: "Количество пользователей, начавших взаимодействие с ботом",
	registers: [metricsRegistry],
});

export const errorCounter = new Counter({
	name: "bot_errors_total",
	help: "Количество ошибок бота",
	labelNames: ["error_type"] as const,
	registers: [metricsRegistry],
});

export const postSendDuration = new Counter({
	name: "post_send_duration_seconds",
	help: "Время отправки постов",
	labelNames: ["post_id"] as const,
	registers: [metricsRegistry],
});
