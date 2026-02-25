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

async function testSubgraph() {
  console.log('='.repeat(60));
  console.log('从 ERC-8004 Subgraph 获取实时数据');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('查询 Agent 数据...\n');
    const agentQuery = `{
      agents(first: 1) {
        id
        owner
        createdAt
      }
    }`;
    
    const agentData = await querySubgraph(agentQuery);
    console.log('Agent 示例:', JSON.stringify(agentData.agents[0], null, 2));
    console.log('');

    console.log('查询 GlobalStats 数据...\n');
    const globalStatsQuery = `{
      globalStats {
        id
        totalAgents
        totalFeedback
        activeUsers
      }
    }`;
    
    const globalStats = await querySubgraph(globalStatsQuery);
    console.log('GlobalStats:', JSON.stringify(globalStats.globalStats, null, 2));
    console.log('');

    console.log('查询 Protocol 数据...\n');
    const protocolQuery = `{
      protocols(first: 1) {
        id
        identityRegistry
        reputationRegistry
      }
    }`;
    
    const protocol = await querySubgraph(protocolQuery);
    console.log('Protocol:', JSON.stringify(protocol.protocols, null, 2));
    console.log('');

    console.log('查询所有实体的数量...\n');
    
    const agentsQuery = `{
      agents {
        id
      }
    }`;
    const agents = await querySubgraph(agentsQuery);
    const totalAgents = agents.agents.length;

    const feedbackQuery = `{
      feedbacks {
        id
      }
    }`;
    const feedbacks = await querySubgraph(feedbackQuery);
    const totalFeedback = feedbacks.feedbacks.length;

    console.log(`Agents 总数: ${totalAgents.toLocaleString()}`);
    console.log(`Feedback 总数: ${totalFeedback.toLocaleString()}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✓ 成功获取链上数据！');
    console.log('='.repeat(60));
    console.log('');

    let registeredAgents = 0;
    let feedbackSubmitted = 0;
    let activeUsers = 0;

    if (globalStats.globalStats && globalStats.globalStats.length > 0) {
      const stats = globalStats.globalStats[0];
      registeredAgents = parseInt(stats.totalAgents || 0);
      feedbackSubmitted = parseInt(stats.totalFeedback || 0);
      activeUsers = parseInt(stats.activeUsers || 0);
    } else {
      registeredAgents = totalAgents;
      feedbackSubmitted = totalFeedback;
      activeUsers = totalFeedback;
    }

    console.log('实时统计数据:');
    console.log(`  Registered Agents: ${registeredAgents.toLocaleString()}`);
    console.log(`  Feedback Submitted: ${feedbackSubmitted.toLocaleString()}`);
    console.log(`  Active Users: ${activeUsers.toLocaleString()}`);
    console.log('');

    return {
      registeredAgents,
      feedbackSubmitted,
      activeUsers
    };

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('✗ 查询失败');
    console.log('='.repeat(60));
    console.log(`错误: ${error.message}`);
    throw error;
  }
}

testSubgraph().catch(error => {
  console.error('测试过程中发生错误:', error);
});
