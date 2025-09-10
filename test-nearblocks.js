const https = require('https');

// Test NearBlocks API directly
const accountId = 'bctemp.near';
const apiKey = process.env.NEARBLOCKS_API_KEY || 'C250644665EF49FA81C555440644CFDA';

console.log('Testing NearBlocks API for account:', accountId);
console.log('API Key available:', !!apiKey);

const options = {
  hostname: 'api.nearblocks.io',
  port: 443,
  path: `/v1/account/${accountId}/txns`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();