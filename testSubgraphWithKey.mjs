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
  console.log('测试 ERC-8004 Subgraph 查询');
  console.log('='.repeat(60));
  console.log('');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`Subgraph ID: ${SUBGRAPH_ID}`);
  console.log('');

  try {
    console.log('测试 1: 查询可用的实体类型\n');
    const introspectionQuery = `
      {
        __schema {
          types {
            name
            kind
          }
        }
      }
    `;
    
    const schema = await querySubgraph(introspectionQuery);
    const types = schema.__schema.types;
    const queryTypes = types.filter(t => t.kind === 'OBJECT' && !t.name.startsWith('__'));
    
    console.log('找到的实体类型:');
    queryTypes.slice(0, 20).forEach(t => {
      console.log(`  - ${t.name}`);
    });
    console.log('');

    console.log('测试 2: 查询 Agent 相关数据\n');
    const agentQuery = `
      {
        agents(first: 5) {
          id
          owner
          createdAt
          metadataURI
        }
      }
    `;
    
    const agentData = await querySubgraph(agentQuery);
    console.log('Agent 数量:', agentData.agents.length);
    if (agentData.agents.length > 0) {
      console.log('示例 Agent:', JSON.stringify(agentData.agents[0], null, 2));
    }
    console.log('');

    console.log('测试 3: 查询统计相关数据\n');
    const statsQuery = `
      {
        _meta {
          block {
            number
            timestamp
          }
          deployment
        }
      }
    `;
    
    const meta = await querySubgraph(statsQuery);
    console.log('Subgraph 元数据:', JSON.stringify(meta, null, 2));
    console.log('');

    console.log('测试 4: 查询所有实体的总数\n');
    const countQuery = `
      {
        agentCount: _meta {
          block {
            number
          }
        }
      }
    `;
    
    console.log('尝试不同的查询方式...\n');
    
    const possibleQueries = [
      {
        name: 'Agents (total)',
        query: `{
          agents {
            id
          }
        }`
      },
      {
        name: 'Feedback',
        query: `{
          feedbacks {
            id
          }
        }`
      },
      {
        name: 'Users',
        query: `{
          users {
            id
          }
        }`
      },
      {
        name: 'IdentityRegistry',
        query: `{
          identityRegistries {
            id
          }
        }`
      },
      {
        name: 'ReputationRegistry',
        query: `{
          reputationRegistries {
            id
          }
        }`
      },
      {
        name: 'AgentRegistrations',
        query: `{
          agentRegistrations {
            id
          }
        }`
      }
    ];

    const results = {};
    
    for (const q of possibleQueries) {
      try {
        process.stdout.write(`  查询 ${q.name}... `);
        const result = await querySubgraph(q.query);
        const data = result[Object.keys(result)[0]];
        if (data) {
          console.log(`✓ 找到 ${data.length} 条记录`);
          results[q.name] = data.length;
        } else {
          console.log(`✗ 无数据`);
        }
      } catch (e) {
        console.log(`✗ 错误: ${e.message}`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✓ Subgraph 查询成功！');
    console.log('='.repeat(60));
    console.log('');
    console.log('统计结果:');
    Object.entries(results).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    if (results['Agents (total)'] > 0) {
      const registeredAgents = results['Agents (total)'];
      
      const feedbackSubmitted = results['Feedback'] || 0;
      const activeUsers = results['Users'] || 0;
      
      console.log('计算后的统计数据:');
      console.log(`  Registered Agents: ${registeredAgents.toLocaleString()}`);
      console.log(`  Feedback Submitted: ${feedbackSubmitted.toLocaleString()}`);
      console.log(`  Active Users: ${activeUsers.toLocaleString()}`);
    }

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('✗ Subgraph 查询失败');
    console.log('='.repeat(60));
    console.log(`错误: ${error.message}`);
    console.log('');
    console.log('可能的原因:');
    console.log('1. API Key 无效或已过期');
    console.log('2. Subgraph ID 不正确');
    console.log('3. Subgraph 尚未部署');
    console.log('4. 查询语法错误');
  }
}

testSubgraph().catch(error => {
  console.error('测试过程中发生错误:', error);
});
