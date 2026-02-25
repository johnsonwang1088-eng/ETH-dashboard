import puppeteer from 'puppeteer';

async function scrapeWithPuppeteer() {
  console.log('='.repeat(60));
  console.log('精确获取 8004scan.io 渲染后的数据');
  console.log('='.repeat(60));
  console.log('');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('正在访问 8004scan.io...');
    
    await page.goto('https://www.8004scan.io/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('等待数据加载...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('='.repeat(60));
    console.log('查找页面中的统计数据');
    console.log('='.repeat(60));
    console.log('');

    // 精确查找统计数据
    const stats = await page.evaluate(() => {
      const result = {
        registeredAgents: null,
        feedbackSubmitted: null,
        activeUsers: null,
        allStats: []
      };

      // 查找所有可能包含统计数据的容器
      const allElements = Array.from(document.querySelectorAll('*'));
      
      for (const element of allElements) {
        const text = element.textContent.trim();
        
        // 查找包含统计标签的元素
        const parentText = element.parentElement ? element.parentElement.textContent.toLowerCase() : '';
        const textLower = text.toLowerCase();
        
        if (textLower.includes('registered') && textLower.includes('agents')) {
          const numberMatch = text.match(/\d{4,6}/);
          if (numberMatch) {
            const number = parseInt(numberMatch[0]);
            if (number >= 10000 && number <= 60000) {
              result.registeredAgents = number;
              result.allStats.push({ type: 'registeredAgents', number, text: text.substring(0, 100) });
            }
          }
        }
        
        if (textLower.includes('feedback') && textLower.includes('submitted')) {
          const numberMatch = text.match(/\d{4,6}/);
          if (numberMatch) {
            const number = parseInt(numberMatch[0]);
            if (number >= 10000 && number <= 60000) {
              result.feedbackSubmitted = number;
              result.allStats.push({ type: 'feedbackSubmitted', number, text: text.substring(0, 100) });
            }
          }
        }
        
        if (textLower.includes('active') && textLower.includes('users')) {
          const numberMatch = text.match(/\d{4,6}/);
          if (numberMatch) {
            const number = parseInt(numberMatch[0]);
            if (number >= 10000 && number <= 60000) {
              result.activeUsers = number;
              result.allStats.push({ type: 'activeUsers', number, text: text.substring(0, 100) });
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

    if (stats.allStats.length > 0) {
      console.log('所有找到的统计信息:');
      stats.allStats.forEach(stat => {
        console.log(`  ${stat.type}: ${stat.number} - "${stat.text}"`);
      });
      console.log('');
    }

    // 如果没有找到，尝试查找页面中所有4-6万的数字
    if (!stats.registeredAgents || !stats.feedbackSubmitted || !stats.activeUsers) {
      console.log('='.repeat(60));
      console.log('查找页面中的大数字 (3-6万范围)');
      console.log('='.repeat(60));
      console.log('');

      const allNumbers = await page.evaluate(() => {
        const numbers = [];
        const allElements = Array.from(document.querySelectorAll('*'));
        
        for (const element of allElements) {
          const text = element.textContent.trim();
          const numberPattern = /\b(3[0-9]{4}|4[0-9]{4}|5[0-9]{4}|6[0]{4})\b/g;
          const matches = text.match(numberPattern);
          
          if (matches) {
            matches.forEach(match => {
              const number = parseInt(match);
              if (number >= 30000 && number <= 60000) {
                // 查找这个数字的上下文
                const parent = element.parentElement;
                const context = parent ? parent.textContent.substring(0, 150) : '';
                
                numbers.push({
                  number,
                  context: context.substring(0, 100),
                  fullContext: context
                });
              }
            });
          }
        }
        
        // 去重
        const uniqueNumbers = [];
        const seen = new Set();
        
        for (const num of numbers) {
          if (!seen.has(num.number)) {
            seen.add(num.number);
            uniqueNumbers.push(num);
          }
        }
        
        return uniqueNumbers.sort((a, b) => b.number - a.number);
      });

      console.log(`找到 ${allNumbers.length} 个 3-6 万范围的数字:`);
      allNumbers.slice(0, 20).forEach((num, index) => {
        console.log(`  ${index + 1}. ${num.number.toLocaleString()}`);
        console.log(`     上下文: ${num.context.substring(0, 80)}...`);
        console.log('');
      });

      // 尝试从上下文推断
      console.log('尝试从上下文推断统计数据...');
      console.log('');
      
      for (const num of allNumbers) {
        const ctxLower = num.fullContext.toLowerCase();
        
        if (!stats.registeredAgents && (ctxLower.includes('registered') || ctxLower.includes('agents'))) {
          stats.registeredAgents = num.number;
          console.log(`✓ 找到 Registered Agents: ${num.number}`);
        }
        
        if (!stats.feedbackSubmitted && (ctxLower.includes('feedback') || ctxLower.includes('submitted'))) {
          stats.feedbackSubmitted = num.number;
          console.log(`✓ 找到 Feedback Submitted: ${num.number}`);
        }
        
        if (!stats.activeUsers && (ctxLower.includes('active') || ctxLower.includes('users'))) {
          stats.activeUsers = num.number;
          console.log(`✓ 找到 Active Users: ${num.number}`);
        }
      }
      console.log('');

      if (allNumbers.length >= 3) {
        console.log('使用最大的三个数字:');
        stats.registeredAgents = allNumbers[0].number;
        stats.feedbackSubmitted = allNumbers[1].number;
        stats.activeUsers = allNumbers[2].number;
      }
    }

    console.log('='.repeat(60));
    console.log('最终结果:');
    console.log('='.repeat(60));
    console.log('');
    console.log('Dashboard 统计数据:');
    console.log(`  Registered Agents: ${stats.registeredAgents?.toLocaleString() || 'Not found'}`);
    console.log(`  Feedback Submitted: ${stats.feedbackSubmitted?.toLocaleString() || 'Not found'}`);
    console.log(`  Active Users: ${stats.activeUsers?.toLocaleString() || 'Not found'}`);
    console.log('');

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
