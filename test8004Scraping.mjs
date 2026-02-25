// Test web scraping from 8004scan.io
import axios from 'axios';

async function test8004ScanScraping() {
  try {
    console.log('Testing 8004scan.io web scraping...');
    
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

    console.log('Response status:', response.status);
    console.log('Response length:', response.data.length);
    
    // 保存 HTML 到文件以便分析
    const fs = await import('fs');
    await fs.promises.writeFile('d:\\OpenhandsProjects\\eth-project\\8004scan-page.html', response.data);
    console.log('HTML saved to 8004scan-page.html');
    
    // 尝试提取数据
    const html = response.data;
    
    // 查找可能包含数据的模式
    const patterns = [
      /registered\s+agents[:\s]*([0-9,]+)/gi,
      /feedback\s+submitted[:\s]*([0-9,]+)/gi,
      /active\s+users[:\s]*([0-9,]+)/gi,
      /"registeredAgents"\s*:\s*"([0-9,]+)"/gi,
      /"feedbackSubmitted"\s*:\s*"([0-9,]+)"/gi,
      /"activeUsers"\s*:\s*"([0-9,]+)"/gi,
      /46673/gi,
      /35728/gi,
      /35421/gi
    ];
    
    console.log('\nSearching for data patterns...');
    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`Found pattern: ${pattern.source}`);
        console.log(`Matches: ${matches.slice(0, 5)}`);
      }
    }
    
    return {
      success: true,
      message: 'HTML downloaded successfully'
    };
    
  } catch (error) {
    console.error('Web scraping failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

const result = await test8004ScanScraping();
console.log('Result:', result);