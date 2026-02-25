import axios from 'axios';

const possibleAPIs = [
  'https://8004scan.io/api/stats',
  'https://8004scan.io/api/data',
  'https://8004scan.io/api/metrics',
  'https://8004scan.io/api/agents',
  'https://api.8004scan.io/stats',
  'https://api.8004scan.io/data',
  'https://api.8004scan.io/metrics',
  'https://8004scan.io/_next/data',
  'https://8004scan.io/api/v1/stats',
  'https://8004scan.io/api/v1/data'
];

async function testAPIEndpoints() {
  console.log('Testing possible API endpoints...\n');
  
  for (const url of possibleAPIs) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`✓ Status: ${response.status}`);
      console.log(`  Content-Type: ${response.headers['content-type']}`);
      console.log(`  Data: ${JSON.stringify(response.data).substring(0, 200)}`);
      console.log('');
      
    } catch (error) {
      if (error.response) {
        console.log(`✗ Status: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        console.log(`✗ Timeout`);
      } else {
        console.log(`✗ Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

testAPIEndpoints();
