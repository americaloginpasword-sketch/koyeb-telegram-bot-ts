/**
 * @file: restart-app.js
 * @description: Полная перезагрузка приложения в Koyeb
 * @created: 2025-08-25
 */

const https = require('https');

const KOYEB_API_KEY = 'tivfln10b7999kqb3jwaf5dg705ttlmnlqyi7w7t6mns5nt2iq27bo9f5igya1ir';
const APP_ID = '1d498371-fec2-450d-8940-9b238d47ccd0';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Остановить приложение
async function stopApp() {
  console.log('🛑 Останавливаем приложение...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: `/v1/apps/${APP_ID}/deployments`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    definition: {
      name: 'terrible-kynthia',
      type: 'git',
      git: {
        repository: 'americaloginpasword-sketch/koyeb-telegram-bot-ts',
        branch: 'main'
      },
      instances: {
        type: 'MICRO',
        count: 0  // Останавливаем все инстансы
      }
    }
  };

  try {
    const response = await makeRequest(options, data);
    console.log('✅ Приложение остановлено:', response.status);
    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка остановки приложения:', error.message);
    return false;
  }
}

// Запустить приложение
async function startApp() {
  console.log('🚀 Запускаем приложение...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: `/v1/apps/${APP_ID}/deployments`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    definition: {
      name: 'terrible-kynthia',
      type: 'git',
      git: {
        repository: 'americaloginpasword-sketch/koyeb-telegram-bot-ts',
        branch: 'main'
      },
      instances: {
        type: 'MICRO',
        count: 1  // Запускаем один инстанс
      }
    }
  };

  try {
    const response = await makeRequest(options, data);
    console.log('✅ Приложение запущено:', response.status);
    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка запуска приложения:', error.message);
    return false;
  }
}

// Основная функция
async function restartApp() {
  console.log('🔄 Полная перезагрузка приложения...');
  console.log('---');

  // Останавливаем приложение
  const stopSuccess = await stopApp();
  if (!stopSuccess) {
    console.log('❌ Не удалось остановить приложение');
    return;
  }

  // Ждем 10 секунд
  console.log('⏳ Ждем 10 секунд...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Запускаем приложение
  const startSuccess = await startApp();
  if (!startSuccess) {
    console.log('❌ Не удалось запустить приложение');
    return;
  }

  console.log('✅ Приложение успешно перезагружено!');
  console.log('📋 Проверьте логи в Koyeb Dashboard');
  console.log('⏳ Подождите 2-3 минуты для полного запуска');
}

// Запускаем перезагрузку
restartApp().catch(console.error);
