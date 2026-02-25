const SUBGRAPH_ID = 'FV6RR6y13rsnCxBAicKuQEwDp8ioEGiNaWaZUmvr1F8k';
const SUBGRAPH_URL = `https://gateway.thegraph.com/api/subgraphs/id/${SUBGRAPH_ID}`;

async function querySubgraph(query) {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying subgraph:', error.message);
    throw error;
  }
}

async function getAgentStats() {
  try {
    console.log('Querying ERC-8004 Subgraph for agent statistics...\n');

    const query = `{
      agents(first: 1000) {
        id
        chainId
        agentId
        agentURI
      }
      feedbacks(first: 1000) {
        id
        agent {
          id
        }
        clientAddress
        feedbackIndex
      }
    }`;

    const result = await querySubgraph(query);

    if (result.errors) {
      console.error('Subgraph errors:', result.errors);
      return null;
    }

    const agents = result.data?.agents || [];
    const feedbacks = result.data?.feedbacks || [];

    const registeredAgents = agents.length;
    const feedbackSubmitted = feedbacks.length;
    
    const uniqueClients = new Set(feedbacks.map(f => f.clientAddress.toLowerCase()));
    const activeUsers = uniqueClients.size;

    console.log('=== ERC-8004 Subgraph Statistics ===');
    console.log(`Registered Agents: ${registeredAgents}`);
    console.log(`Feedback Submitted: ${feedbackSubmitted}`);
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    return {
      registeredAgents,
      feedbackSubmitted,
      activeUsers,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error getting agent stats:', error);
    throw error;
  }
}

getAgentStats()
  .then(stats => {
    if (stats) {
      console.log('\nSuccessfully retrieved stats from Subgraph');
    }
  })
  .catch(error => {
    console.error('Failed to retrieve stats:', error);
  });
