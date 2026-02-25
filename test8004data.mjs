import axios from 'axios';

async function scrape8004Data() {
  try {
    console.log('Fetching 8004scan.io homepage...');
    const response = await axios.get('https://8004scan.io', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const html = response.data;
    
    // 查找包含大数字的完整HTML片段
    console.log('\n=== Searching for data in HTML ===\n');
    
    // 尝试找到包含 "Registered Agents", "Feedback Submitted", "Active Users" 的部分
    const statsPatterns = [
      /Registered Agents[^>]*>([^<]*)</gi,
      /Feedback Submitted[^>]*>([^<]*)</gi,
      /Active Users[^>]*>([^<]*)</gi
    ];
    
    for (const pattern of statsPatterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`Pattern: ${pattern}`);
        matches.forEach(m => console.log(`  Match: "${m[1]}"`));
      }
    }
    
    // 查找JSON格式的数据
    const jsonPattern = /registeredAgents["\s:]+(\d+)/gi;
    const jsonMatches = [...html.matchAll(jsonPattern)];
    if (jsonMatches.length > 0) {
      console.log('\nJSON registeredAgents:');
      jsonMatches.forEach(m => console.log(`  ${m[1]}`));
    }
    
    const feedbackJsonPattern = /feedbackSubmitted["\s:]+(\d+)/gi;
    const feedbackJsonMatches = [...html.matchAll(feedbackJsonPattern)];
    if (feedbackJsonMatches.length > 0) {
      console.log('\nJSON feedbackSubmitted:');
      feedbackJsonMatches.forEach(m => console.log(`  ${m[1]}`));
    }
    
    const activeJsonPattern = /activeUsers["\s:]+(\d+)/gi;
    const activeJsonMatches = [...html.matchAll(activeJsonPattern)];
    if (activeJsonMatches.length > 0) {
      console.log('\nJSON activeUsers:');
      activeJsonMatches.forEach(m => console.log(`  ${m[1]}`));
    }
    
    // 查找3-5万之间的所有数字及其上下文
    const contextPattern = /(\w{5,15})["\s:]+(\d{4,5})["\s,}]/g;
    const contextMatches = [...html.matchAll(contextPattern)];
    if (contextMatches.length > 0) {
      console.log('\n=== Key-value pairs with 4-5 digit numbers ===');
      contextMatches.forEach(m => {
        const num = parseInt(m[2]);
        if (num >= 30000 && num <= 50000) {
          console.log(`  ${m[1]}: ${m[2]}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scrape8004Data();
