/**
 * @file: fix-private-key.js
 * @description: Исправление формата private key для Google Sheets API
 * @created: 2025-08-25
 */

const https = require('https');

const KOYEB_API_KEY = 'tivfln10b7999kqb3jwaf5dg705ttlmnlqyi7w7t6mns5nt2iq27bo9f5igya1ir';
const SECRET_ID = 'deaa7fae-efdf-434d-a979-b4e96ec9c916';

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

// Удалить секрет
async function deleteSecret() {
  console.log('🗑️ Удаляем секрет GOOGLE_SA_PRIVATE_KEY...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: `/v1/secrets/${SECRET_ID}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('✅ Секрет удален:', response.status);
    return response.status === 204 || response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка удаления секрета:', error.message);
    return false;
  }
}

// Создать новый секрет с правильным форматом
async function createSecret() {
  console.log('🔧 Создаем новый секрет с правильным форматом...');
  
  const options = {
    hostname: 'app.koyeb.com',
    path: '/v1/secrets',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KOYEB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  // Private key с реальными переносами строк
  const privateKey = `-----BEGIN PRIVATE KEY-----
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

  const data = {
    name: 'GOOGLE_SA_PRIVATE_KEY',
    value: privateKey,
    type: 'generic'
  };

  try {
    const response = await makeRequest(options, data);
    console.log('✅ Новый секрет создан:', response.status);
    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка создания секрета:', error.message);
    return false;
  }
}

// Основная функция
async function fixPrivateKey() {
  console.log('🔧 Исправляем формат private key...');
  console.log('---');

  // Удаляем старый секрет
  const deleteSuccess = await deleteSecret();
  if (!deleteSuccess) {
    console.log('❌ Не удалось удалить старый секрет');
    return;
  }

  // Ждем немного
  console.log('⏳ Ждем 3 секунды...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Создаем новый секрет
  const createSuccess = await createSecret();
  if (!createSuccess) {
    console.log('❌ Не удалось создать новый секрет');
    return;
  }

  console.log('✅ Private key исправлен!');
  console.log('🚀 Теперь сделайте redeploy в Koyeb Dashboard');
}

// Запускаем исправление
fixPrivateKey().catch(console.error);
