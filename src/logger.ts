/**
 * @file: src/logger.ts
 * @description: Инициализация pino-логгера
 * @created: 2025-08-19
 */

import pino, { Logger } from "pino";

export function createLogger(): Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    transport: process.env.NODE_ENV === "production" ? undefined : {
      target: "pino-pretty",
      options: { colorize: true }
    },
  });
}
