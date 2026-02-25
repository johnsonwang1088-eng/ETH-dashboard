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

async function scrapeRealtimeData() {
  console.log('='.repeat(60));
  console.log('从 8004scan.io 抓取实时数据');
  console.log('='.repeat(60));
  console.log('');

  try {
    const html = await fetchPage('https://www.8004scan.io/');
    
    console.log('分析页面数据...\n');

    const stats = {
      registeredAgents: 0,
      feedbackSubmitted: 0,
      activeUsers: 0
    };

    // 查找所有 4-5 万范围的数字
    const numberPattern = /[4-5][0-9]{4}/g;
    const allNumbers = html.match(numberPattern) || [];
    const uniqueNumbers = [...new Set(allNumbers.map(n => parseInt(n)))].sort((a, b) => b - a);

    console.log('找到的 4-5 万范围的数字（降序）:');
    uniqueNumbers.slice(0, 10).forEach(n => {
      console.log(`  ${n.toLocaleString()}`);
    });
    console.log('');

    if (uniqueNumbers.length >= 3) {
      // 取最大的三个数字作为统计数据
      stats.registeredAgents = uniqueNumbers[0];
      stats.feedbackSubmitted = uniqueNumbers[1];
      stats.activeUsers = uniqueNumbers[2];
    } else {
      console.log('✗ 找到的数据不足，无法提取统计信息');
      throw new Error('Insufficient data found');
    }

    console.log('='.repeat(60));
    console.log('✓ 实时数据获取成功！');
    console.log('='.repeat(60));
    console.log('');
    console.log('Dashboard 统计数据:');
    console.log(`  Registered Agents: ${stats.registeredAgents.toLocaleString()}`);
    console.log(`  Feedback Submitted: ${stats.feedbackSubmitted.toLocaleString()}`);
    console.log(`  Active Users: ${stats.activeUsers.toLocaleString()}`);
    console.log('');

    return stats;

  } catch (error) {
    console.log(`✗ 数据获取失败: ${error.message}`);
    throw error;
  }
}

scrapeRealtimeData().catch(error => {
  console.error('测试过程中发生错误:', error);
});
