import axios from 'axios';

async function fetchPage(url) {
  const response = await axios.get(url, {
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
  return response.data;
}

async function analyze8004scanPage() {
  console.log('='.repeat(60));
  console.log('详细分析 8004scan.io 页面结构');
  console.log('='.repeat(60));
  console.log('');

  try {
    const html = await fetchPage('https://www.8004scan.io/');
    
    // 查找包含 "Registered", "Feedback", "Active" 的行
    const lines = html.split('\n');
    console.log('查找包含关键字的行:');
    console.log('');
    
    const keywords = ['Registered', 'Feedback', 'Active', 'Agents', 'Users', 'Submitted'];
    const relevantLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (keywords.some(keyword => line.includes(keyword))) {
        relevantLines.push({
          lineNumber: i + 1,
          content: line.trim().substring(0, 200)
        });
      }
    }
    
    relevantLines.slice(0, 20).forEach(({ lineNumber, content }) => {
      console.log(`Line ${lineNumber}: ${content}`);
    });
    
    console.log('');
    console.log('='.repeat(60));
    console.log('查找 4-5 万范围的数字及其上下文:');
    console.log('='.repeat(60));
    console.log('');
    
    const numberPattern = /[4-5][0-9]{4}/g;
    const matches = [];
    let match;
    
    while ((match = numberPattern.exec(html)) !== null) {
      const start = Math.max(0, match.index - 100);
      const end = Math.min(html.length, match.index + 100);
      const context = html.substring(start, end).replace(/\s+/g, ' ');
      
      matches.push({
        number: match[0],
        context: context
      });
    }
    
    // 去重并排序
    const uniqueMatches = [];
    const seenNumbers = new Set();
    
    for (const match of matches) {
      if (!seenNumbers.has(match.number)) {
        seenNumbers.add(match.number);
        uniqueMatches.push(match);
      }
    }
    
    uniqueMatches.slice(0, 10).forEach(({ number, context }) => {
      console.log(`数字: ${number}`);
      console.log(`上下文: ${context}`);
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('查找 JSON 数据:');
    console.log('='.repeat(60));
    console.log('');
    
    const jsonPattern = /\{[^{}]*"(registeredAgents|feedbackSubmitted|activeUsers|registered_agents|feedback_submitted|active_users)"[^{}]*\}/gi;
    const jsonMatches = [];
    
    while ((match = jsonPattern.exec(html)) !== null) {
      jsonMatches.push(match[0]);
    }
    
    if (jsonMatches.length > 0) {
      console.log('找到的 JSON 数据片段:');
      jsonMatches.forEach(json => {
        console.log(json);
        console.log('');
      });
    } else {
      console.log('未找到 JSON 数据片段');
    }
    
    console.log('='.repeat(60));
    console.log('查找 script 标签中的数据:');
    console.log('='.repeat(60));
    console.log('');
    
    const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    let scriptCount = 0;
    
    while ((scriptMatch = scriptPattern.exec(html)) !== null && scriptCount < 3) {
      const scriptContent = scriptMatch[1];
      
      if (scriptContent.includes('registered') || scriptContent.includes('feedback') || scriptContent.includes('active')) {
        console.log(`Script ${scriptCount + 1}:`);
        console.log(scriptContent.substring(0, 500));
        console.log('');
        scriptCount++;
      }
    }
    
    if (scriptCount === 0) {
      console.log('未找到包含关键字的 script 标签');
    }
    
  } catch (error) {
    console.log(`✗ 分析失败: ${error.message}`);
    throw error;
  }
}

analyze8004scanPage().catch(console.error);
