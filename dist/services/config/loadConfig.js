"use strict";
/**
 * @file: src/services/config/loadConfig.ts
 * @description: Загрузка и валидация конфигов приложения и постов
 * @created: 2025-08-19
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAppConfig = loadAppConfig;
exports.loadPostsConfig = loadPostsConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = require("yaml");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
async function loadAppConfig(configPath) {
    const resolved = path_1.default.resolve(configPath);
    const raw = await fs_1.default.promises.readFile(resolved, "utf-8");
    const data = (0, yaml_1.parse)(raw);
    // Добавляем Google Sheets конфигурацию из переменных окружения
    console.log('Checking Google Sheets environment variables:');
    console.log('SHEET_ID:', process.env.SHEET_ID ? 'SET' : 'NOT SET');
    console.log('GOOGLE_SA_EMAIL:', process.env.GOOGLE_SA_EMAIL ? 'SET' : 'NOT SET');
    console.log('GOOGLE_SA_PRIVATE_KEY:', process.env.GOOGLE_SA_PRIVATE_KEY ? 'SET' : 'NOT SET');
    if (process.env.SHEET_ID && process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_PRIVATE_KEY) {
        data.analytics = {
            google_sheets: {
                sheet_id: process.env.SHEET_ID,
                service_account_email: process.env.GOOGLE_SA_EMAIL,
                private_key: process.env.GOOGLE_SA_PRIVATE_KEY,
            },
        };
        console.log('Google Sheets analytics configured');
    }
    else {
        console.log('Google Sheets analytics NOT configured - missing environment variables');
    }
    return data;
}
async function loadPostsConfig(postsPath, schemaPath) {
    const [postsRaw, schemaRaw] = await Promise.all([
        fs_1.default.promises.readFile(path_1.default.resolve(postsPath), "utf-8"),
        fs_1.default.promises.readFile(path_1.default.resolve(schemaPath), "utf-8"),
    ]);
    const posts = (0, yaml_1.parse)(postsRaw);
    const schema = (0, yaml_1.parse)(schemaRaw);
    const ajv = new ajv_1.default({ allErrors: true, strict: false });
    (0, ajv_formats_1.default)(ajv);
    // Регистрируем meta-схему 2020-12, чтобы поддержать $schema ссылку
    ajv.addMetaSchema({ $id: "https://json-schema.org/draft/2020-12/schema" });
    const validate = ajv.compile(schema);
    const valid = validate(posts);
    if (!valid) {
        const message = ajv.errorsText(validate.errors, { separator: "\n" });
        throw new Error(`Invalid posts config:\n${message}`);
    }
    return posts;
}
