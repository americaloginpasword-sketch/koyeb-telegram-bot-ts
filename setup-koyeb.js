/**
 * @file: setup-koyeb.js
 * @description: Автоматическая настройка Koyeb через API
 * @created: 2025-08-25
 */

const https = require('https');

// Конфигурация
const KOYEB_API_KEY = 'tivfln10b7999kqb3jwaf5dg705ttlmnlqyi7w7t6mns5nt2iq27bo9f5igya1ir';
const APP_NAME = 'terrible-kynthia';
const USERNAME = 'americaloginpasword-sketch';

// Данные для секретов
const SECRETS = {
  SHEET_ID: '1BkFdG333rOZQ56dowB8_AcFYHSZ5lTPCZXUEqgFdrP0',
  GOOGLE_SA_EMAIL: 'neurohod-bot-analytics@bot-neurohod.iam.gserviceaccount.com',
  GOOGLE_SA_PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----`,
  TELEGRAM_WEBHOOK_URL: `https://${APP_NAME}.koyeb.app/webhook`
};

// Функция для HTTP запросов
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

// Получить список приложений
async function getApps() {
  console.log('🔍 Получаем список приложений...');
  
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
    console.log('✅ Приложения получены:', response.status);
    
    if (response.status === 200 && response.data.apps) {
      const app = response.data.apps.find(a => a.name === APP_NAME);
      if (app) {
        console.log('✅ Найдено приложение:', app.id);
        return app.id;
      }
    }
    
    console.log('❌ Приложение не найдено');
    return null;
  } catch (error) {
    console.error('❌ Ошибка получения приложений:', error.message);
    return null;
  }
}

// Получить список секретов
async function getSecrets() {
  console.log('🔍 Получаем список секретов...');
  
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
    console.log('✅ Секреты получены:', response.status);
    return response.status === 200 ? response.data.secrets || [] : [];
  } catch (error) {
    console.error('❌ Ошибка получения секретов:', error.message);
    return [];
  }
}

// Создать или обновить секрет
async function createOrUpdateSecret(name, value) {
  console.log(`🔧 Настраиваем секрет: ${name}`);
  
  const options = {
    hostname: 'app.koyeb.com',
    path: '/v1/secrets',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    name: name,
    value: value,
    type: 'generic'
  };

  try {
    const response = await makeRequest(options, data);
    console.log(`✅ Секрет ${name} настроен:`, response.status);
    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error(`❌ Ошибка настройки секрета ${name}:`, error.message);
    return false;
  }
}

// Запустить redeploy
async function triggerRedeploy(appId) {
  console.log('🚀 Запускаем redeploy...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: `/v1/apps/${appId}/deployments`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    definition: {
      name: APP_NAME,
      type: 'git',
      git: {
        repository: 'americaloginpasword-sketch/koyeb-telegram-bot-ts',
        branch: 'main'
      }
    }
  };

  try {
    const response = await makeRequest(options, data);
    console.log('✅ Redeploy запущен:', response.status);
    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка запуска redeploy:', error.message);
    return false;
  }
}

// Основная функция
async function setupKoyeb() {
  console.log('🚀 Начинаем автоматическую настройку Koyeb...');
  console.log('📊 API Key:', KOYEB_API_KEY.substring(0, 10) + '...');
  console.log('---');

  // Получаем ID приложения
  const appId = await getApps();
  if (!appId) {
    console.log('❌ Не удалось найти приложение');
    return;
  }

  // Настраиваем секреты
  console.log('🔧 Настраиваем секреты...');
  for (const [name, value] of Object.entries(SECRETS)) {
    const success = await createOrUpdateSecret(name, value);
    if (!success) {
      console.log(`❌ Не удалось настроить секрет ${name}`);
    }
  }

  // Запускаем redeploy
  console.log('🚀 Запускаем redeploy...');
  const redeploySuccess = await triggerRedeploy(appId);
  
  if (redeploySuccess) {
    console.log('✅ Настройка завершена успешно!');
    console.log('📋 Проверьте логи в Koyeb Dashboard');
  } else {
    console.log('❌ Ошибка при redeploy');
  }
}

// Запускаем настройку
setupKoyeb().catch(console.error);
