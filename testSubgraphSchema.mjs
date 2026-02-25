import https from 'https';

const API_KEY = 'f68c8bec32cc2eb3e844e20cc46bfa02';
const SUBGRAPH_ID = 'FV6RR6y13rsnCxBAicKuQEwDp8ioEGiNaWaZUmvr1F8k';

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
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.errors) {
            reject(new Error(result.errors[0].message));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testSchema() {
  console.log('='.repeat(60));
  console.log('查询 GlobalStats 和 AgentStats 的字段结构');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('1. 查询 GlobalStats 字段...\n');
    const globalStatsQuery = `{
      globalStats {
        id
      }
    }`;
    
    const globalStats = await querySubgraph(globalStatsQuery);
    console.log('GlobalStats 示例:', JSON.stringify(globalStats.globalStats, null, 2));
    console.log('');

    console.log('2. 查询 AgentStats 字段...\n');
    const agentStatsQuery = `{
      agentStats(first: 1) {
        id
      }
    }`;
    
    const agentStats = await querySubgraph(agentStatsQuery);
    console.log('AgentStats 示例:', JSON.stringify(agentStats.agentStats, null, 2));
    console.log('');

    console.log('3. 获取完整的统计数据...\n');
    
    const allAgentsQuery = `{
      agents {
        id
        owner
        createdAt
      }
    }`;
    const agents = await querySubgraph(allAgentsQuery);
    const totalAgents = agents.agents.length;

    const allFeedbackQuery = `{
      feedbacks {
        id
      }
    }`;
    const feedbacks = await querySubgraph(allFeedbackQuery);
    const totalFeedback = feedbacks.feedbacks.length;

    const allUsersQuery = `{
      agents {
        owner
      }
    }`;
    const usersData = await querySubgraph(allUsersQuery);
    const uniqueUsers = new Set(usersData.agents.map(a => a.owner.toLowerCase())).size;

    console.log(`Agents 总数: ${totalAgents.toLocaleString()}`);
    console.log(`Feedback 总数: ${totalFeedback.toLocaleString()}`);
    console.log(`唯一用户数: ${uniqueUsers.toLocaleString()}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✓ 成功获取实时统计数据！');
    console.log('='.repeat(60));
    console.log('');

    console.log('Dashboard 需要的数据:');
    console.log(`  Registered Agents: ${totalAgents.toLocaleString()}`);
    console.log(`  Feedback Submitted: ${totalFeedback.toLocaleString()}`);
    console.log(`  Active Users: ${uniqueUsers.toLocaleString()}`);
    console.log('');

    return {
      registeredAgents: totalAgents,
      feedbackSubmitted: totalFeedback,
      activeUsers: uniqueUsers
    };

  } catch (error) {
    console.log(`错误: ${error.message}`);
    throw error;
  }
}

testSchema().catch(error => {
  console.error('测试过程中发生错误:', error);
});
