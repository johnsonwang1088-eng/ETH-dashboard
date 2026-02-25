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

async function exploreFields() {
  console.log('='.repeat(60));
  console.log('探索实体字段结构');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('1. Feedback 字段\n');
    const feedbackQuery = `{
      feedbacks(first: 1) {
        id
      }
    }`;
    
    const feedbackData = await querySubgraph(feedbackQuery);
    if (feedbackData.feedbacks.length > 0) {
      console.log('Feedback 示例:', JSON.stringify(feedbackData.feedbacks[0], null, 2));
    }
    console.log('');

    console.log('2. Validation 字段\n');
    const validationQuery = `{
      validations(first: 1) {
        id
      }
    }`;
    
    const validationData = await querySubgraph(validationQuery);
    if (validationData.validations.length > 0) {
      console.log('Validation 示例:', JSON.stringify(validationData.validations[0], null, 2));
    }
    console.log('');

    console.log('3. AgentMetadata 字段\n');
    const metadataQuery = `{
      agentMetadatas(first: 1) {
        id
      }
    }`;
    
    const metadataData = await querySubgraph(metadataQuery);
    if (metadataData.agentMetadatas.length > 0) {
      console.log('AgentMetadata 示例:', JSON.stringify(metadataData.agentMetadatas[0], null, 2));
    }
    console.log('');

    console.log('4. AgentRegistrationFile 字段\n');
    const fileQuery = `{
      agentRegistrationFiles(first: 1) {
        id
      }
    }`;
    
    const fileData = await querySubgraph(fileQuery);
    if (fileData.agentRegistrationFiles.length > 0) {
      console.log('AgentRegistrationFile 示例:', JSON.stringify(fileData.agentRegistrationFiles[0], null, 2));
    }
    console.log('');

    console.log('5. FeedbackFile 字段\n');
    const feedbackFileQuery = `{
      feedbackFiles(first: 1) {
        id
      }
    }`;
    
    const feedbackFileData = await querySubgraph(feedbackFileQuery);
    if (feedbackFileData.feedbackFiles.length > 0) {
      console.log('FeedbackFile 示例:', JSON.stringify(feedbackFileData.feedbackFiles[0], null, 2));
    }
    console.log('');

    console.log('6. FeedbackResponse 字段\n');
    const responseQuery = `{
      feedbackResponses(first: 1) {
        id
      }
    }`;
    
    const responseData = await querySubgraph(responseQuery);
    if (responseData.feedbackResponses.length > 0) {
      console.log('FeedbackResponse 示例:', JSON.stringify(responseData.feedbackResponses[0], null, 2));
    }
    console.log('');

    console.log('='.repeat(60));

  } catch (error) {
    console.log(`错误: ${error.message}`);
  }
}

exploreFields().catch(error => {
  console.error('测试过程中发生错误:', error);
});
