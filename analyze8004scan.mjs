import axios from 'axios';

async function testEndpoints() {
  const endpoints = [
    '/api/v1/stats/global',
    '/api/v1/stats',
    '/api/v1/users',
    '/api/v1/users/active',
    '/api/v1/users/count',
    '/api/v1/active-users',
    '/api/v1/metrics',
    '/api/v1/metrics/users',
    '/api/v1/stats/users/active',
    '/api/v1/stats/active-users',
    '/api/v1/dashboard',
    '/api/v1/dashboard/stats',
    '/api/v1/analytics',
    '/api/v1/analytics/users',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get('https://www.8004scan.io' + endpoint, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log('✅', endpoint, ':', JSON.stringify(response.data).substring(0, 200));
      
      if (response.data && typeof response.data === 'object') {
        console.log('   Keys:', Object.keys(response.data));
      }
    } catch (error) {
      if (error.response) {
        console.log('❌', endpoint, ': HTTP', error.response.status);
      } else {
        console.log('❌', endpoint, ':', error.message);
      }
    }
  }
}

testEndpoints();
