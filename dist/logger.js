"use strict";
/**
 * @file: src/logger.ts
 * @description: Инициализация pino-логгера
 * @created: 2025-08-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
const pino_1 = __importDefault(require("pino"));
function createLogger() {
    return (0, pino_1.default)({
        level: process.env.LOG_LEVEL ?? "info",
        transport: process.env.NODE_ENV === "production" ? undefined : {
            target: "pino-pretty",
            options: { colorize: true }
        },
    });
}
