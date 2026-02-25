import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function analyze8004scanPage() {
  console.log('='.repeat(60));
  console.log('分析 8004scan.io 页面结构');
  console.log('='.repeat(60));
  console.log('');

  try {
    const html = await fetchPage('https://www.8004scan.io/');
    
    console.log('查找统计数据相关的内容...\n');

    const patterns = [
      { name: '统计数据', pattern: /\d{4,5}/g },
      { name: 'JSON 数据', pattern: /\{[^}]*"agents"[^}]*\}/g },
      { name: 'API 端点', pattern: /https?:\/\/[^"']*?api[^""]*/g },
      { name: 'GraphQL 端点', pattern: /https?:\/\/[^"']*?graphql[^""]*/g },
      { name: 'Subgraph', pattern: /subgraph[^""]*/gi },
      { name: '合约地址', pattern: /0x[a-fA-F0-9]{40}/g },
      { name: 'JavaScript 数据', pattern: /data:\s*\{[^}]*\}/g }
    ];

    for (const { name, pattern } of patterns) {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`${name}:`);
        matches.slice(0, 5).forEach(m => console.log(`  ${m.substring(0, 100)}`));
        console.log('');
      }
    }

    console.log('查找特定数字模式 (3-5 万范围)...\n');
    const numberPattern = /[4-5][0-9]{4}/g;
    const largeNumbers = html.match(numberPattern);
    if (largeNumbers) {
      console.log('找到的大数字:');
      largeNumbers.slice(0, 10).forEach(n => console.log(`  ${n}`));
    } else {
      console.log('未找到 4-5 万范围的数字');
    }
    console.log('');

    console.log('查找 script 标签中的数据...\n');
    const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    let scriptCount = 0;
    
    while ((match = scriptPattern.exec(html)) !== null && scriptCount < 5) {
      const scriptContent = match[1];
      
      if (scriptContent.includes('agents') || 
          scriptContent.includes('feedback') || 
          scriptContent.includes('stats')) {
        
        console.log(`Script ${scriptCount + 1} (包含相关数据):`);
        
        const dataPatterns = [
          /agents["']?\s*:\s*\d+/g,
          /feedback["']?\s*:\s*\d+/g,
          /users["']?\s*:\s*\d+/g,
          /total["']?\s*:\s*\d+/g,
          /count["']?\s*:\s*\d+/g
        ];
        
        for (const p of dataPatterns) {
          const m = scriptContent.match(p);
          if (m) {
            m.forEach(item => console.log(`  ${item}`));
          }
        }
        console.log('');
        scriptCount++;
      }
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.log(`错误: ${error.message}`);
  }
}

analyze8004scanPage().catch(error => {
  console.error('测试过程中发生错误:', error);
});
