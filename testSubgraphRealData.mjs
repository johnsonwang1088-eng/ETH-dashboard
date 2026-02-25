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

async function getRealTimeData() {
  console.log('='.repeat(60));
  console.log('从 Subgraph 获取实时数据');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('查询所有 Agents...\n');
    const agentsQuery = `{
      agents {
        id
        owner
        createdAt
      }
    }`;
    
    const agentsData = await querySubgraph(agentsQuery);
    const totalAgents = agentsData.agents.length;
    
    const uniqueOwners = new Set(agentsData.agents.map(a => a.owner.toLowerCase())).size;
    
    console.log(`  Agents 总数: ${totalAgents.toLocaleString()}`);
    console.log(`  唯一所有者数: ${uniqueOwners.toLocaleString()}`);
    console.log('');

    console.log('查询所有 Feedback...\n');
    const feedbackQuery = `{
      feedbacks {
        id
        from
        to
        rating
        createdAt
      }
    }`;
    
    const feedbackData = await querySubgraph(feedbackQuery);
    const totalFeedback = feedbackData.feedbacks.length;
    
    const uniqueFeedbackUsers = new Set([
      ...feedbackData.feedbacks.map(f => f.from.toLowerCase()),
      ...feedbackData.feedbacks.map(f => f.to.toLowerCase())
    ]).size;
    
    console.log(`  Feedback 总数: ${totalFeedback.toLocaleString()}`);
    console.log(`  参与反馈的用户数: ${uniqueFeedbackUsers.toLocaleString()}`);
    console.log('');

    console.log('查询所有 Validations...\n');
    const validationQuery = `{
      validations {
        id
        validator
        createdAt
      }
    }`;
    
    const validationData = await querySubgraph(validationQuery);
    const totalValidations = validationData.validations.length;
    
    console.log(`  Validation 总数: ${totalValidations.toLocaleString()}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✓ 实时数据获取成功！');
    console.log('='.repeat(60));
    console.log('');

    const registeredAgents = totalAgents;
    const feedbackSubmitted = totalFeedback;
    const activeUsers = uniqueOwners;

    console.log('Dashboard 统计数据:');
    console.log(`  Registered Agents: ${registeredAgents.toLocaleString()}`);
    console.log(`  Feedback Submitted: ${feedbackSubmitted.toLocaleString()}`);
    console.log(`  Active Users: ${activeUsers.toLocaleString()}`);
    console.log('');

    return {
      registeredAgents,
      feedbackSubmitted,
      activeUsers,
      rawData: {
        agents: totalAgents,
        feedbacks: totalFeedback,
        validations: totalValidations,
        uniqueOwners,
        uniqueFeedbackUsers
      }
    };

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('✗ 数据获取失败');
    console.log('='.repeat(60));
    console.log(`错误: ${error.message}`);
    throw error;
  }
}

getRealTimeData().catch(error => {
  console.error('测试过程中发生错误:', error);
});
