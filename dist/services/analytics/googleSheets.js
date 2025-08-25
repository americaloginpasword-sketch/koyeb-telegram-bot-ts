"use strict";
/**
 * @file: src/services/analytics/googleSheets.ts
 * @description: Сервис для записи аналитики кликов в Google Sheets
 * @dependencies: googleapis, .secrets/google-sa.json
 * @created: 2025-08-19
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsAnalytics = void 0;
const googleapis_1 = require("googleapis");
class GoogleSheetsAnalytics {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.initGoogleSheets();
    }
    initGoogleSheets() {
        try {
            // Исправляем формат private key
            let privateKey = this.config.privateKey;
            // Убираем кавычки если есть
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.slice(1, -1);
            }
            // Заменяем \n на реальные переносы строк
            privateKey = privateKey.replace(/\\n/g, '\n');
            this.logger.info('Processing private key for Google Sheets API');
            const auth = new googleapis_1.google.auth.GoogleAuth({
                credentials: {
                    client_email: this.config.serviceAccountEmail,
                    private_key: privateKey,
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            this.sheets = googleapis_1.google.sheets({ version: 'v4', auth });
            this.logger.info('Google Sheets API initialized successfully');
        }
        catch (error) {
            this.logger.error({ error }, 'Failed to initialize Google Sheets API');
            throw error;
        }
    }
    async upsertUserAction(action) {
        try {
            const { username, telegramId, postId, action: actionType, timestamp } = action;
            // Ищем существующую строку пользователя
            const range = 'A:H'; // Расширяем диапазон для новой колонки с датой
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.config.sheetId,
                range,
            });
            const rows = response.data.values || [];
            const userRowIndex = rows.findIndex((row) => row[1] === (username || `user_${telegramId}`) // Ищем по колонке B (никнейм)
            );
            if (userRowIndex !== -1) {
                // Обновляем существующую строку, добавляя новое действие
                const existingRow = rows[userRowIndex];
                const updatedRow = [...existingRow];
                // Убеждаемся, что у нас есть достаточно столбцов (8: дата, ник, 6 постов)
                while (updatedRow.length < 8) {
                    updatedRow.push('');
                }
                // Добавляем новое действие к существующему в соответствующем столбце поста
                if (postId >= 1 && postId <= 6) {
                    const currentValue = updatedRow[postId + 1] || ''; // +1 потому что дата теперь в колонке A
                    const newValue = currentValue ? `${currentValue}, ${actionType}` : actionType;
                    updatedRow[postId + 1] = newValue;
                }
                const updateRange = `A${userRowIndex + 1}:H${userRowIndex + 1}`;
                this.logger.info({ telegramId, postId, actionType, updateRange, updatedRow }, 'Attempting to update user action in Google Sheets');
                const response = await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.config.sheetId,
                    range: updateRange,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [updatedRow],
                    },
                });
                this.logger.info({
                    telegramId,
                    postId,
                    actionType,
                    response: response.data,
                    updatedRange: response.data.updates?.updatedRange,
                    updatedCells: response.data.updates?.updatedCells
                }, 'Successfully updated user action in Google Sheets');
            }
            else {
                // Добавляем новую строку
                const newRow = [
                    '', // date_first_visit (колонка A)
                    username || `user_${telegramId}`, // никнейм (колонка B)
                    '', // post_1 (колонка C)
                    '', // post_2 (колонка D)
                    '', // post_3 (колонка E)
                    '', // post_4 (колонка F)
                    '', // post_5 (колонка G)
                    '', // post_6 (колонка H)
                ];
                // Устанавливаем значение для соответствующего поста
                if (postId >= 1 && postId <= 6) {
                    newRow[postId + 1] = actionType; // +1 потому что дата теперь в колонке A
                }
                // Если это первое действие пользователя (start), записываем дату
                if (actionType === 'start') {
                    newRow[0] = timestamp.toLocaleDateString('ru-RU') + ' ' + timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                this.logger.info({ telegramId, postId, actionType, newRow }, 'Attempting to append new user action to Google Sheets');
                const response = await this.sheets.spreadsheets.values.append({
                    spreadsheetId: this.config.sheetId,
                    range: 'A:H',
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [newRow],
                    },
                });
                this.logger.info({
                    telegramId,
                    postId,
                    actionType,
                    response: response.data,
                    updatedRange: response.data.updates?.updatedRange,
                    updatedCells: response.data.updates?.updatedCells
                }, 'Successfully added new user action to Google Sheets');
            }
        }
        catch (error) {
            this.logger.error({ error, action }, 'Failed to upsert user action to Google Sheets');
            throw error;
        }
    }
    async logButtonClick(telegramId, username, postId, action) {
        const userAction = {
            username,
            telegramId,
            postId,
            action,
            timestamp: new Date(),
        };
        await this.upsertUserAction(userAction);
    }
}
exports.GoogleSheetsAnalytics = GoogleSheetsAnalytics;
