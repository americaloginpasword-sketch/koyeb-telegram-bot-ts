/**
 * @file: check-apps.js
 * @description: Проверка всех приложений в Koyeb
 * @created: 2025-08-25
 */

const https = require('https');

const KOYEB_API_KEY = 'tivfln10b7999kqb3jwaf5dg705ttlmnlqyi7w7t6mns5nt2iq27bo9f5igya1ir';

function makeRequest(options) {
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
    req.end();
  });
}

async function checkApps() {
  console.log('🔍 Проверяем все приложения в Koyeb...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: '/v1/apps',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('✅ Ответ получен:', response.status);
    
    if (response.status === 200 && response.data.apps) {
      console.log(`📊 Найдено приложений: ${response.data.apps.length}`);
      
      response.data.apps.forEach((app, index) => {
        console.log(`\n${index + 1}. Приложение:`);
        console.log(`   ID: ${app.id}`);
        console.log(`   Имя: ${app.name}`);
        console.log(`   Статус: ${app.status}`);
        console.log(`   URL: ${app.urls ? app.urls[0] : 'N/A'}`);
      });
    } else {
      console.log('❌ Не удалось получить список приложений');
      console.log('Ответ:', response.data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkApps().catch(console.error);
