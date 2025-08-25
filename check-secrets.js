/**
 * @file: check-secrets.js
 * @description: Проверка существующих секретов в Koyeb
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

async function checkSecrets() {
  console.log('🔍 Проверяем существующие секреты в Koyeb...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: '/v1/secrets',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('✅ Ответ получен:', response.status);
    
    if (response.status === 200 && response.data.secrets) {
      console.log(`📊 Найдено секретов: ${response.data.secrets.length}`);
      
      if (response.data.secrets.length === 0) {
        console.log('📝 Секретов нет');
      } else {
        response.data.secrets.forEach((secret, index) => {
          console.log(`\n${index + 1}. Секрет:`);
          console.log(`   ID: ${secret.id}`);
          console.log(`   Имя: ${secret.name}`);
          console.log(`   Тип: ${secret.type}`);
          console.log(`   Создан: ${secret.created_at}`);
        });
      }
    } else {
      console.log('❌ Не удалось получить список секретов');
      console.log('Ответ:', response.data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkSecrets().catch(console.error);
