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

async function calculateStats() {
  console.log('='.repeat(60));
  console.log('计算 8004scan.io 统计数据');
  console.log('='.repeat(60));
  console.log('');

  try {
    const data = await fetchStats();
    
    let totalAgents = 0;
    let totalFeedbacks = 0;
    
    console.log('按链统计:');
    console.log('');
    data.chain_stats.forEach(chain => {
      totalAgents += chain.total_agents;
      totalFeedbacks += chain.total_feedbacks;
      console.log(`  ${chain.name.padEnd(20)}: Agents=${chain.total_agents.toString().padStart(5)}, Feedbacks=${chain.total_feedbacks.toString().padStart(5)}`);
    });
    
    console.log('');
    console.log('='.repeat(60));
    console.log('总计:');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  Total Agents (Registered Agents): ${totalAgents.toLocaleString()}`);
    console.log(`  Total Feedbacks (Feedback Submitted): ${totalFeedbacks.toLocaleString()}`);
    console.log('');
    console.log('用户期望的数据:');
    console.log(`  Registered Agents: 46,901`);
    console.log(`  Feedback Submitted: 35,837`);
    console.log(`  Active Users: 35,658`);
    console.log('');
    
    console.log('差异:');
    console.log(`  Registered Agents 差异: ${46901 - totalAgents}`);
    console.log(`  Feedback Submitted 差异: ${35837 - totalFeedbacks}`);
    console.log('');
    
    console.log('协议分布:');
    console.log(`  MCP: ${data.protocol_distribution.mcp.toLocaleString()}`);
    console.log(`  A2A: ${data.protocol_distribution.a2a.toLocaleString()}`);
    console.log(`  Unknown: ${data.protocol_distribution.unknown.toLocaleString()}`);
    console.log(`  协议总数: ${(data.protocol_distribution.mcp + data.protocol_distribution.a2a + data.protocol_distribution.unknown).toLocaleString()}`);

  } catch (error) {
    console.log(`错误: ${error.message}`);
    console.log(error.stack);
  }
}

calculateStats().catch(console.error);
