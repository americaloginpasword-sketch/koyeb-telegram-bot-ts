/**
 * @file: test-sheets-simple.js
 * @description: Упрощенный тест Google Sheets API
 * @created: 2025-08-25
 */

const { google } = require('googleapis');

// Данные напрямую из JSON файла
const SHEET_ID = '1BkFdG333rOZQ56dowB8_AcFYHSZ5lTPCZXUEqgFdrP0';
const GOOGLE_SA_EMAIL = 'neurohod-bot-analytics@bot-neurohod.iam.gserviceaccount.com';
const GOOGLE_SA_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDVWU0OCqKgRrTi
qhiaoXu2paryYY8uyEgQUnud2YMUOq6UmFjSBW3VJZYtjIHgJ9JQxyeKCXZEwLLx
X1dc51Kc1wDBd/t4AiHHOUclW2Qi8jGEf20n3wh31eaDncvJnCTJwSe7G8N8+I7m
CYKbAxk4RMeh4l97ER/e5+uolOVuNzx3c5rBz2DaJpR8BeaY+TprM2zhLAEIWbuB
I6jWiZAaXzhbAtHI3gmK91cSdtlvptkRYF3bQXgSamV7COVXkpEupkyBpfG8KEz/
Tn10kMDrrKsFOueT6jpmlcNlJXVFVWubg79Nbo+DZEmIDADcaQSTS7cQI3p03cL9
dBuD6275AgMBAAECggEABz8+z6d11GWXzGFEb7A6OxSP5NGCjcTDieZmCOZ0E5JW
Ds8eqUJXnkIQwrWp+GVx4/ONOMekgFEJYws+36At8reXm3rKDHlfZgc15E4hQydL
SPm+c/hurwoRh/lVYaD6W5jCPZKuW8biV8G38YWz7BuN/8Y9lw5tsOKGOJZCNYb+
l/Fa1EFeh4YAh97JkGEdEDTYnQKfekRYAVBmCYCL79mhqo2ZioTkzo5HOWwNCp8r
VP2tmaKPuPu5D2YnbMTX8KjtqLWk1XXwCLttQzUgL/m2aq6N0EAZNR57xe/zynG5
fwDtv0Z7WRTKbC+PtTJhBHrfQGh4NbkpC8UzIBbXZwKBgQDrxi+B7a7Zg6MbJIh9
lYw6m/cdCiV1t7Fxm+4IuotGbJ4hAf13yXAENnb+tMkGeLItNSL/CqrSii3shWRV
wXqeMkVrgkgy9rBRJlk+gWQ1Q6SOBU6Ul5VR8YU/8GC9iZQlsU6xr23lcI/0mDmO
22du+hD9HSDGQY8oJiYOyCP+zwKBgQDnpqKEAuNu4BVXDKEa1dkLYyZeTr9YDwjQ
yVpsC/rnBi2gUy7arwRNV6xRbIoQhm1dZUGTj9irredVDDIaTKNH7di5tegPo8gx
qksXR7CNwMRucrYpYTF0sFx7DSZ+123K/xGHaacz2by4BxJ9uRXgK6HBVZMuw4vF
Vwl8YWVntwKBgQCq5xiutKxGjQ3g8eViKtHf9gf069LldobQFDhB6X5lSPyCbp/d
gY2J8DTnQgJph3mYHWlFt+TFAlZxmOt24e1Q2J3LZT+SeZCq8gJEtaP+nA6ex6gD
O7GIGWr+Qu7M1PonLFQfpkshwisHIISwUcezAN7pqoCEVSdA8g4qLtcwrwKBgD1/
4M95UNYjyaaVpMPSGFBMn2gUMfp361g6zLW4rIDfBAf3bY4DPvoll4r6bOEcPza3
ZiR94QEbJzpOBZMz23mCLLKJF7XnPoPo+QySLM5FaiEEdVYhBpc7JyJICHtOSEjH
VOkFZK2AVfjpb8BO/f7ItqX0SSH2KkpW5B7QYLKbAoGBAOcpf7S0aVypclX6NV54
d7VGT9S7BUN1GZTpMKgx7kAXwSuWAsf7hJmhMP+Jef9oXQDF8+VjyDc6dGNSeKKq
o9EBc8Y4lUpUfMtyuy/62g4HjyxHnNlOYYUEkSGIEyN7f3W6HJGHHUAExktT16Jn
52tQGtwzI1IvudlrEx4PLzA+
-----END PRIVATE KEY-----`;

async function testGoogleSheets() {
  try {
    console.log('🔧 Инициализация Google Sheets API...');
    console.log('📧 Email:', GOOGLE_SA_EMAIL);
    console.log('🔑 Private Key:', GOOGLE_SA_PRIVATE_KEY ? 'УСТАНОВЛЕН' : 'НЕ УСТАНОВЛЕН');
    console.log('📊 Sheet ID:', SHEET_ID);
    console.log('---');
    
    // Создаем аутентификацию
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SA_EMAIL,
        private_key: GOOGLE_SA_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('✅ Google Sheets API инициализирован');
    console.log(`📊 Работаем с таблицей: ${SHEET_ID}`);

    // Тестовые данные
    const testData = [
      [
        new Date().toLocaleString('ru-RU'), // Дата
        'test_user_123', // Никнейм
        'start', // Post 1
        'material', // Post 2
        'support', // Post 3
        'community', // Post 4
        'payment', // Post 5
        'test_action' // Post 6
      ]
    ];

    console.log('📝 Отправляем тестовые данные...');
    console.log('Данные:', testData[0]);

    // Добавляем данные в таблицу
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: testData,
      },
    });

    console.log('✅ Данные успешно добавлены!');
    console.log('📊 Обновлено ячеек:', response.data.updates.updatedCells);
    console.log('📋 Диапазон:', response.data.updates.updatedRange);
    
    // Читаем данные для проверки
    console.log('\n📖 Читаем данные из таблицы...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:H',
    });

    const rows = readResponse.data.values || [];
    console.log(`📊 Всего строк в таблице: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('📋 Последние 3 строки:');
      rows.slice(-3).forEach((row, index) => {
        console.log(`  ${rows.length - 2 + index}: [${row.join(' | ')}]`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при работе с Google Sheets:');
    console.error('Сообщение:', error.message);
    
    if (error.code === 403) {
      console.error('🔒 Ошибка доступа. Проверьте:');
      console.error('  - Правильность email сервисного аккаунта');
      console.error('  - Права доступа к таблице (Editor)');
      console.error('  - Включен ли Google Sheets API');
    } else if (error.code === 400) {
      console.error('🔧 Ошибка запроса. Проверьте:');
      console.error('  - Правильность ID таблицы');
      console.error('  - Формат private key');
    }
    
    console.error('Полная ошибка:', error);
  }
}

// Запускаем тест
console.log('🚀 Запуск теста Google Sheets API...');
testGoogleSheets();
