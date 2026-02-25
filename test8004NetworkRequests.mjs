import https from 'https';
import http from 'http';

function fetchHeaders(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    }).on('error', reject);
  });
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testPossibleAPIs() {
  console.log('='.repeat(60));
  console.log('测试 8004scan.io 可能的 API 端点');
  console.log('='.repeat(60));
  console.log('');

  const baseUrl = 'https://www.8004scan.io';
  const possibleEndpoints = [
    '/api/stats',
    '/api/v1/stats',
    '/api/v1/agents/count',
    '/api/v1/feedback/count',
    '/api/v1/users/count',
    '/api/agents/count',
    '/api/feedback/count',
    '/api/users/count',
    '/stats',
    '/data',
    '/api',
    '/graphql',
    '/api/graphql'
  ];

  console.log('首先获取主页内容，查找可能的 API 端点...\n');
  try {
    const html = await fetchPage(baseUrl);
    
    const apiPatterns = [
      /api\/[a-zA-Z0-9\/\-_]+/g,
      /["']\/[^"']*?api[^"']*?["']/gi,
      /https?:\/\/[^"']*?api[^"']*["']/gi,
      /fetch\(['"`]([^'"`]+)['"`]\)/gi,
      /axios\(['"`]([^'"`]+)['"`]\)/gi
    ];

    const foundEndpoints = new Set();
    for (const pattern of apiPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(m => {
          const cleaned = m.replace(/['"`]/g, '');
          if (cleaned.includes('api') || cleaned.includes('graphql')) {
            foundEndpoints.add(cleaned);
          }
        });
      }
    }

    console.log('从 HTML 中找到的 API 端点:');
    foundEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint}`);
    });
    console.log('');

  } catch (error) {
    console.log(`✗ 获取主页失败: ${error.message}\n`);
  }

  console.log('测试常见 API 端点...\n');
  
  for (const endpoint of possibleEndpoints) {
    const url = baseUrl + endpoint;
    process.stdout.write(`  测试 ${endpoint}... `);
    
    try {
      const result = await fetchHeaders(url);
      
      if (result.status === 200) {
        console.log(`✓ ${result.status}`);
        
        try {
          const data = await fetchPage(url);
          console.log(`    响应类型: ${result.headers['content-type'] || 'unknown'}`);
          
          if (result.headers['content-type'] && result.headers['content-type'].includes('application/json')) {
            const json = JSON.parse(data);
            console.log(`    数据预览: ${JSON.stringify(json).substring(0, 200)}...`);
          }
        } catch (e) {
          console.log(`    数据解析失败`);
        }
      } else if (result.status === 404) {
        console.log(`✗ 404 Not Found`);
      } else if (result.status === 401 || result.status === 403) {
        console.log(`✗ ${result.status} (需要认证)`);
      } else {
        console.log(`? ${result.status}`);
      }
    } catch (error) {
      console.log(`✗ 连接失败`);
    }
  }

  console.log('');
  console.log('='.repeat(60));
}

testPossibleAPIs().catch(error => {
  console.error('测试过程中发生错误:', error);
});
