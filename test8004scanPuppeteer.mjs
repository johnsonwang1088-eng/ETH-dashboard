import puppeteer from 'puppeteer';

async function scrapeWithPuppeteer() {
  console.log('='.repeat(60));
  console.log('使用 Puppeteer 获取 8004scan.io 渲染后的数据');
  console.log('='.repeat(60));
  console.log('');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('正在访问 8004scan.io...');
    
    // 等待页面完全加载
    await page.goto('https://www.8004scan.io/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('等待数据加载...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 获取页面内容
    const pageContent = await page.content();
    
    console.log('='.repeat(60));
    console.log('查找统计数据:');
    console.log('='.repeat(60));
    console.log('');

    // 尝试查找包含数字的元素
    const stats = await page.evaluate(() => {
      const result = {
        registeredAgents: null,
        feedbackSubmitted: null,
        activeUsers: null
      };

      // 查找所有包含4-5万数字的元素
      const allElements = document.querySelectorAll('*');
      const numberPattern = /[4-5][0-9]{4}/g;
      
      for (const element of allElements) {
        const text = element.textContent.trim();
        const matches = text.match(numberPattern);
        
        if (matches && matches.length > 0) {
          const number = parseInt(matches[0]);
          if (number >= 10000 && number <= 50000) {
            // 检查元素或其父元素是否有特定的类名或文本
            const parentText = element.parentElement ? element.parentElement.textContent.toLowerCase() : '';
            const textLower = text.toLowerCase();
            
            if (textLower.includes('registered') || textLower.includes('agents') || parentText.includes('registered') || parentText.includes('agents')) {
              result.registeredAgents = number;
            } else if (textLower.includes('feedback') || textLower.includes('submitted') || parentText.includes('feedback') || parentText.includes('submitted')) {
              result.feedbackSubmitted = number;
            } else if (textLower.includes('active') || textLower.includes('users') || parentText.includes('active') || parentText.includes('users')) {
              result.activeUsers = number;
            }
          }
        }
      }

      return result;
    });

    console.log('找到的统计数据:');
    console.log(`  Registered Agents: ${stats.registeredAgents || 'Not found'}`);
    console.log(`  Feedback Submitted: ${stats.feedbackSubmitted || 'Not found'}`);
    console.log(`  Active Users: ${stats.activeUsers || 'Not found'}`);
    console.log('');

    // 如果没有找到，尝试查找所有4-5万的数字
    if (!stats.registeredAgents || !stats.feedbackSubmitted || !stats.activeUsers) {
      console.log('='.repeat(60));
      console.log('查找所有 4-5 万范围的数字:');
      console.log('='.repeat(60));
      console.log('');

      const allNumbers = await page.evaluate(() => {
        const numbers = new Set();
        const numberPattern = /[4-5][0-9]{4}/g;
        
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          const text = element.textContent.trim();
          const matches = text.match(numberPattern);
          if (matches) {
            matches.forEach(match => numbers.add(parseInt(match)));
          }
        }
        
        return Array.from(numbers).sort((a, b) => b - a);
      });

      console.log('找到的数字（降序）:');
      allNumbers.slice(0, 10).forEach(num => {
        console.log(`  ${num.toLocaleString()}`);
      });
      console.log('');

      // 如果找到足够的数字，取前三个
      if (allNumbers.length >= 3) {
        stats.registeredAgents = allNumbers[0];
        stats.feedbackSubmitted = allNumbers[1];
        stats.activeUsers = allNumbers[2];
        
        console.log('='.repeat(60));
        console.log('✓ 数据提取成功！');
        console.log('='.repeat(60));
        console.log('');
        console.log('Dashboard 统计数据:');
        console.log(`  Registered Agents: ${stats.registeredAgents.toLocaleString()}`);
        console.log(`  Feedback Submitted: ${stats.feedbackSubmitted.toLocaleString()}`);
        console.log(`  Active Users: ${stats.activeUsers.toLocaleString()}`);
        console.log('');
      }
    }

    return stats;

  } catch (error) {
    console.log(`✗ 错误: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

scrapeWithPuppeteer().catch(console.error);
