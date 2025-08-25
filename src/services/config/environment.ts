/**
 * @file: src/services/config/environment.ts
 * @description: Универсальная система переменных окружения для Neurohod
 * @created: 2025-08-25
 */

export interface EnvironmentConfig {
  // Основные настройки
  NODE_ENV: string;
  PORT: number;
  
  // Telegram Bot
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_URL?: string;
  
  // Google Sheets Analytics
  SHEET_ID?: string;
  GOOGLE_SA_EMAIL?: string;
  GOOGLE_SA_PRIVATE_KEY?: string;
  
  // Логирование
  LOG_LEVEL?: string;
  
  // Безопасность
  VERIFY_WEBHOOKS?: boolean;
}

/**
 * Загружает и валидирует переменные окружения
 */
export function loadEnvironment(): EnvironmentConfig {
  // Обрабатываем private key
  let privateKey = process.env.GOOGLE_SA_PRIVATE_KEY;
  if (privateKey) {
    // Убираем кавычки если есть
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    // Заменяем \n на реальные переносы строк
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const config: EnvironmentConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 3000,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL,
    SHEET_ID: process.env.SHEET_ID,
    GOOGLE_SA_EMAIL: process.env.GOOGLE_SA_EMAIL,
    GOOGLE_SA_PRIVATE_KEY: privateKey,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    VERIFY_WEBHOOKS: process.env.VERIFY_WEBHOOKS === 'true',
  };

  // Валидация обязательных переменных
  validateRequiredVariables(config);

  return config;
}

/**
 * Валидирует обязательные переменные окружения
 */
function validateRequiredVariables(config: EnvironmentConfig): void {
  const required: Array<keyof EnvironmentConfig> = ['TELEGRAM_BOT_TOKEN'];
  const missing: string[] = [];

  for (const key of required) {
    if (!config[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Проверяет, настроена ли Google Sheets аналитика
 */
export function isGoogleSheetsConfigured(config: EnvironmentConfig): boolean {
  return !!(config.SHEET_ID && config.GOOGLE_SA_EMAIL && config.GOOGLE_SA_PRIVATE_KEY);
}

/**
 * Возвращает конфигурацию Google Sheets для аналитики
 */
export function getGoogleSheetsConfig(config: EnvironmentConfig) {
  if (!isGoogleSheetsConfigured(config)) {
    return null;
  }

  return {
    sheetId: config.SHEET_ID!,
    serviceAccountEmail: config.GOOGLE_SA_EMAIL!,
    privateKey: config.GOOGLE_SA_PRIVATE_KEY!,
  };
}

/**
 * Логирует статус переменных окружения (без секретов)
 */
export function logEnvironmentStatus(config: EnvironmentConfig): void {
  console.log('Environment configuration:');
  console.log(`  NODE_ENV: ${config.NODE_ENV}`);
  console.log(`  PORT: ${config.PORT}`);
  console.log(`  TELEGRAM_BOT_TOKEN: ${config.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`  TELEGRAM_WEBHOOK_URL: ${config.TELEGRAM_WEBHOOK_URL ? 'SET' : 'NOT SET'}`);
  console.log(`  SHEET_ID: ${config.SHEET_ID ? 'SET' : 'NOT SET'}`);
  console.log(`  GOOGLE_SA_EMAIL: ${config.GOOGLE_SA_EMAIL ? 'SET' : 'NOT SET'}`);
  console.log(`  GOOGLE_SA_PRIVATE_KEY: ${config.GOOGLE_SA_PRIVATE_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`  Google Sheets Analytics: ${isGoogleSheetsConfigured(config) ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`  LOG_LEVEL: ${config.LOG_LEVEL}`);
  console.log(`  VERIFY_WEBHOOKS: ${config.VERIFY_WEBHOOKS}`);
  
  // Дополнительная отладка
  console.log('--- DEBUG INFO ---');
  console.log(`  process.env.GOOGLE_SA_PRIVATE_KEY exists: ${!!process.env.GOOGLE_SA_PRIVATE_KEY}`);
  console.log(`  process.env.GOOGLE_SA_PRIVATE_KEY length: ${process.env.GOOGLE_SA_PRIVATE_KEY?.length || 0}`);
  console.log(`  process.env.GOOGLE_SA_PRIVATE_KEY starts with: ${process.env.GOOGLE_SA_PRIVATE_KEY?.substring(0, 20) || 'N/A'}`);
  console.log(`  config.GOOGLE_SA_PRIVATE_KEY length: ${config.GOOGLE_SA_PRIVATE_KEY?.length || 0}`);
  console.log(`  config.GOOGLE_SA_PRIVATE_KEY starts with: ${config.GOOGLE_SA_PRIVATE_KEY?.substring(0, 20) || 'N/A'}`);
  console.log('--- END DEBUG ---');
}
