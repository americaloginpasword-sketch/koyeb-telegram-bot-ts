/**
 * @file: src/services/config/loadConfig.ts
 * @description: Загрузка и валидация конфигов приложения и постов
 * @created: 2025-08-19
 */

import fs from "fs";
import path from "path";
import { parse } from "yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { AppConfig, PostsConfigFile } from "./types";

export async function loadAppConfig(configPath: string): Promise<AppConfig> {
  const resolved = path.resolve(configPath);
  const raw = await fs.promises.readFile(resolved, "utf-8");
  const data = parse(raw) as AppConfig;
  
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
  } else {
    console.log('Google Sheets analytics NOT configured - missing environment variables');
  }
  
  return data;
}

export async function loadPostsConfig(postsPath: string, schemaPath: string): Promise<PostsConfigFile> {
  const [postsRaw, schemaRaw] = await Promise.all([
    fs.promises.readFile(path.resolve(postsPath), "utf-8"),
    fs.promises.readFile(path.resolve(schemaPath), "utf-8"),
  ]);

  const posts = parse(postsRaw);
  const schema = parse(schemaRaw);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  // Регистрируем meta-схему 2020-12, чтобы поддержать $schema ссылку
  ajv.addMetaSchema({ $id: "https://json-schema.org/draft/2020-12/schema" });

  const validate = ajv.compile(schema);
  const valid = validate(posts);
  if (!valid) {
    const message = ajv.errorsText(validate.errors, { separator: "\n" });
    throw new Error(`Invalid posts config:\n${message}`);
  }

  return posts as PostsConfigFile;
}
