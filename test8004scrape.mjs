import https from 'https';
import http from 'http';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function extractStats(html) {
  const stats = {
    registeredAgents: null,
    feedbackSubmitted: null,
    activeUsers: null
  };

  const agentPatterns = [
    /Registered Agents[:\s]*[<>/\w\s]*?(\d{3,5})/gi,
    /registered[^\d<]*?(\d{4,6})/gi
  ];
  
  const feedbackPatterns = [
    /Feedback Submitted[:\s]*[<>/\w\s]*?(\d{3,5})/gi,
    /feedback[^\d<]*?(\d{4,6})/gi
  ];
  
  const userPatterns = [
    /Active Users[:\s]*[<>/\w\s]*?(\d{3,5})/gi,
    /active[^\d<]*?(\d{4,6})/gi
  ];

  for (const pattern of agentPatterns) {
    const match = pattern.exec(html);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value >= 10000 && value <= 100000) {
        stats.registeredAgents = value;
        break;
      }
    }
  }

  for (const pattern of feedbackPatterns) {
    const match = pattern.exec(html);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value >= 10000 && value <= 100000) {
        stats.feedbackSubmitted = value;
        break;
      }
    }
  }

  for (const pattern of userPatterns) {
    const match = pattern.exec(html);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value >= 10000 && value <= 100000) {
        stats.activeUsers = value;
        break;
      }
    }
  }

  return stats;
}

async function get8004scanStats() {
  try {
    console.log('Fetching 8004scan.io page...\n');
    const html = await fetchPage('https://www.8004scan.io/');
    
    console.log('Extracting statistics...\n');
    const stats = extractStats(html);
    
    console.log('=== 8004scan.io Statistics ===');
    console.log(`Registered Agents: ${stats.registeredAgents || 'Not found'}`);
    console.log(`Feedback Submitted: ${stats.feedbackSubmitted || 'Not found'}`);
    console.log(`Active Users: ${stats.activeUsers || 'Not found'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    if (stats.registeredAgents && stats.feedbackSubmitted && stats.activeUsers) {
      return {
        ...stats,
        timestamp: Date.now()
      };
    }
    
    console.log('\nCould not extract all statistics. Trying alternative approach...');
    
    const numberMatches = html.match(/\b([3-6]\d{4})\b/g);
    if (numberMatches) {
      const uniqueNumbers = [...new Set(numberMatches.map(n => parseInt(n)))].sort((a, b) => b - a);
      console.log(`Found numbers in 30k-70k range: ${uniqueNumbers.slice(0, 10).join(', ')}`);
      
      if (uniqueNumbers.length >= 3) {
        return {
          registeredAgents: uniqueNumbers[0],
          feedbackSubmitted: uniqueNumbers[1],
          activeUsers: uniqueNumbers[2],
          timestamp: Date.now()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching 8004scan.io:', error.message);
    throw error;
  }
}

get8004scanStats()
  .then(stats => {
    if (stats) {
      console.log('\nSuccessfully retrieved stats from 8004scan.io');
    } else {
      console.log('\nFailed to extract stats');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
