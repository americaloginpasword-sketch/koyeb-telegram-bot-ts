/**
 * @file: check-secret-value.js
 * @description: Проверка значения секрета GOOGLE_SA_PRIVATE_KEY
 * @created: 2025-08-25
 */

const https = require('https');

const KOYEB_API_KEY = 'tivfln10b7999kqb3jwaf5dg705ttlmnlqyi7w7t6mns5nt2iq27bo9f5igya1ir';
const SECRET_ID = 'deaa7fae-efdf-434d-a979-b4e96ec9c916'; // GOOGLE_SA_PRIVATE_KEY

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

async function checkSecretValue() {
  console.log('🔍 Проверяем значение секрета GOOGLE_SA_PRIVATE_KEY...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: `/v1/secrets/${SECRET_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('✅ Ответ получен:', response.status);
    
    if (response.status === 200 && response.data.secret) {
      const secret = response.data.secret;
      console.log('📊 Информация о секрете:');
      console.log(`   ID: ${secret.id}`);
      console.log(`   Имя: ${secret.name}`);
      console.log(`   Тип: ${secret.type}`);
      console.log(`   Создан: ${secret.created_at}`);
      
      if (secret.value) {
        console.log('🔑 Значение секрета:');
        console.log('---');
        console.log(secret.value);
        console.log('---');
        
        // Проверяем формат
        if (secret.value.includes('-----BEGIN PRIVATE KEY-----')) {
          console.log('✅ Формат правильный - содержит BEGIN PRIVATE KEY');
        } else {
          console.log('❌ Неправильный формат - не содержит BEGIN PRIVATE KEY');
        }
        
        if (secret.value.includes('\\n')) {
          console.log('✅ Содержит \\n для переносов строк');
        } else {
          console.log('❌ Не содержит \\n для переносов строк');
        }
      } else {
        console.log('❌ Значение секрета не найдено');
      }
    } else {
      console.log('❌ Не удалось получить секрет');
      console.log('Ответ:', response.data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkSecretValue().catch(console.error);
