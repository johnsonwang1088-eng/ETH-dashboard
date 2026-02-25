import axios from 'axios';

async function testAPIEndpoint(url) {
  try {
    console.log(`测试: ${url}`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.8004scan.io',
        'Referer': 'https://www.8004scan.io/'
      }
    });
    console.log(`✓ 成功: Status ${response.status}`);
    console.log(`数据: ${JSON.stringify(response.data).substring(0, 200)}`);
    console.log('');
    return response.data;
  } catch (error) {
    console.log(`✗ 失败: ${error.message}`);
    console.log('');
    return null;
  }
}

async function find8004scanAPI() {
  console.log('='.repeat(60));
  console.log('测试 8004scan.io 可能的 API 端点');
  console.log('='.repeat(60));
  console.log('');

  const apiEndpoints = [
    'https://www.8004scan.io/api/stats',
    'https://www.8004scan.io/api/v1/stats',
    'https://www.8004scan.io/api/data',
    'https://www.8004scan.io/api/agents',
    'https://www.8004scan.io/api/feedback',
    'https://www.8004scan.io/api/dashboard',
    'https://api.8004scan.io/stats',
    'https://api.8004scan.io/v1/stats',
    'https://api.8004scan.io/data',
    'https://8004scan.io/api/stats',
    'https://8004scan.io/api/v1/stats',
    'https://8004scan.io/api/data',
    'https://www.8004scan.io/_next/data/build/index.json',
    'https://www.8004scan.io/_next/data/production/index.json',
  ];

  for (const endpoint of apiEndpoints) {
    await testAPIEndpoint(endpoint);
  }

  console.log('='.repeat(60));
  console.log('尝试从页面源码中找到API端点');
  console.log('='.repeat(60));
  console.log('');

  try {
    const response = await axios.get('https://www.8004scan.io/', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = response.data;

    // 查找包含 "api" 的内容
    const apiPattern = /(https?:\/\/[^"'\s]*api[^"'\s]*)/gi;
    const apiMatches = [];
    let match;

    while ((match = apiPattern.exec(html)) !== null) {
      apiMatches.push(match[0]);
    }

    if (apiMatches.length > 0) {
      console.log('找到的 API 相关 URL:');
      const uniqueApiUrls = [...new Set(apiMatches)];
      uniqueApiUrls.slice(0, 10).forEach(url => {
        console.log(`  ${url}`);
      });
      console.log('');
    }

    // 查找 Next.js 数据端点
    const nextDataPattern = /"([^"]*\/_next\/data\/[^"]*)"/g;
    const nextDataMatches = [];
    
    while ((match = nextDataPattern.exec(html)) !== null) {
      nextDataMatches.push(match[1]);
    }

    if (nextDataMatches.length > 0) {
      console.log('找到的 Next.js 数据端点:');
      const uniqueNextDataUrls = [...new Set(nextDataMatches)];
      uniqueNextDataUrls.slice(0, 10).forEach(url => {
        console.log(`  ${url}`);
      });
      console.log('');
    }

    // 尝试访问第一个找到的 Next.js 数据端点
    if (uniqueNextDataUrls.length > 0) {
      const firstNextDataUrl = uniqueNextDataUrls[0];
      if (firstNextDataUrl.startsWith('/')) {
        const fullUrl = `https://www.8004scan.io${firstNextDataUrl}`;
        console.log(`尝试访问 Next.js 数据端点: ${fullUrl}`);
        const nextDataResponse = await testAPIEndpoint(fullUrl);
        if (nextDataResponse) {
          console.log('Next.js 数据内容:');
          console.log(JSON.stringify(nextDataResponse, null, 2).substring(0, 500));
        }
      }
    }

  } catch (error) {
    console.log(`✗ 页面分析失败: ${error.message}`);
  }
}

find8004scanAPI().catch(console.error);
