import https from 'https';

const API_KEY = 'f68c8bec32cc2eb3e844e20cc46bfa02';
const SUBGRAPH_ID = 'FV6RR6y13rsnCxBAicKuQEwDp8ioEGiNaWaZUmvr1F8k';
const GRAPHQL_ENDPOINT = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/${SUBGRAPH_ID}`;

function querySubgraph(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    
    const options = {
      hostname: 'gateway.thegraph.com',
      path: `/api/${API_KEY}/subgraphs/id/${SUBGRAPH_ID}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.errors) {
            reject(new Error(response.errors[0].message));
          } else {
            resolve(response.data);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getSubgraphStats() {
  console.log('='.repeat(60));
  console.log('从 Subgraph 获取 8004scan.io 统计数据');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('查询代理数量...');
    const agentsQuery = `
      {
        _meta {
          block {
            number
            timestamp
          }
        }
      }
    `;
    
    const meta = await querySubgraph(agentsQuery);
    console.log(`Subgraph 状态:`, meta);
    console.log('');

    console.log('查询注册代理数量...');
    const agentsCountQuery = `
      {
        agents(first: 1, orderBy: id, orderDirection: desc) {
          id
        }
      }
    `;
    
    const agentsResult = await querySubgraph(agentsCountQuery);
    console.log(`代理数量: ${agentsResult.agents?.length || 0}`);
    console.log('');

    console.log('查询反馈数量...');
    const feedbacksQuery = `
      {
        feedbacks(first: 1, orderBy: id, orderDirection: desc) {
          id
        }
      }
    `;
    
    const feedbacksResult = await querySubgraph(feedbacksQuery);
    console.log(`反馈数量: ${feedbacksResult.feedbacks?.length || 0}`);
    console.log('');

    console.log('查询活跃用户...');
    const usersQuery = `
      {
        users(first: 1000) {
          id
        }
      }
    `;
    
    const usersResult = await querySubgraph(usersQuery);
    console.log(`用户数量: ${usersResult.users?.length || 0}`);
    console.log('');

    const stats = {
      registeredAgents: agentsResult.agents?.length?.toString() || '0',
      feedbackSubmitted: feedbacksResult.feedbacks?.length?.toString() || '0',
      activeUsers: usersResult.users?.length?.toString() || '0'
    };

    console.log('='.repeat(60));
    console.log('Subgraph 统计数据:');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  Registered Agents: ${stats.registeredAgents}`);
    console.log(`  Feedback Submitted: ${stats.feedbackSubmitted}`);
    console.log(`  Active Users: ${stats.activeUsers}`);
    console.log('');

    return stats;

  } catch (error) {
    console.log(`✗ 查询失败: ${error.message}`);
    throw error;
  }
}

getSubgraphStats().catch(error => {
  console.error('测试过程中发生错误:', error);
});
