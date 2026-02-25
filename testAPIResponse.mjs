import https from 'https';

function fetchStats() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.8004scan.io',
      path: '/api/v1/stats/global?is_testnet=false',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAPI() {
  console.log('='.repeat(60));
  console.log('测试 8004scan.io Global Stats API');
  console.log('='.repeat(60));
  console.log('');

  try {
    const data = await fetchStats();
    
    console.log('API 返回的数据结构:');
    console.log('');
    console.log('全局统计:');
    if (data.global_stats) {
      console.log(`  Total Agents: ${data.global_stats.total_agents}`);
      console.log(`  Total Feedbacks: ${data.global_stats.total_feedbacks}`);
      console.log(`  Active Users: ${data.global_stats.active_users}`);
    }
    
    console.log('');
    console.log('协议分布:');
    if (data.protocol_distribution) {
      console.log(`  MCP: ${data.protocol_distribution.mcp}`);
      console.log(`  A2A: ${data.protocol_distribution.a2a}`);
      console.log(`  Unknown: ${data.protocol_distribution.unknown}`);
    }
    
    console.log('');
    console.log('链统计:');
    if (data.chain_stats) {
      data.chain_stats.forEach(chain => {
        console.log(`  ${chain.name}: ${chain.total_agents} agents, ${chain.total_feedbacks} feedbacks`);
      });
    }
    
    console.log('');
    console.log('完整数据:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.log(`错误: ${error.message}`);
    console.log(error.stack);
  }
}

testAPI().catch(console.error);
