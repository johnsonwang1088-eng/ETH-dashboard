import puppeteer from 'puppeteer';

async function debugPage() {
  console.log('='.repeat(60));
  console.log('调试 8004scan.io 页面内容');
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

    const pageContent = await page.content();
    
    console.log('页面内容长度:', pageContent.length);
    console.log('');

    const data = await page.evaluate(() => {
      const result = {
        allNumbers: [],
        allText: [],
        elementsWithStats: []
      };

      const allElements = Array.from(document.querySelectorAll('*'));
      
      for (const element of allElements) {
        const text = element.textContent.trim();
        if (text.length > 0 && text.length < 200) {
          const numberMatch = text.match(/\b\d{4,6}\b/);
          if (numberMatch) {
            const number = parseInt(numberMatch[0]);
            if (number >= 10000 && number <= 100000) {
              result.allNumbers.push({
                number: number,
                text: text.substring(0, 100),
                tag: element.tagName,
                className: element.className
              });
            }
          }
        }
      }

      result.allNumbers.sort((a, b) => b.number - a.number);
      
      return result;
    });

    console.log('='.repeat(60));
    console.log('找到的数字:');
    console.log('='.repeat(60));
    console.log('');
    
    for (let i = 0; i < Math.min(20, data.allNumbers.length); i++) {
      console.log(`  ${i + 1}. ${data.allNumbers[i].number} - ${data.allNumbers[i].text}`);
    }
    
    console.log('');
    console.log(`共找到 ${data.allNumbers.length} 个数字`);

  } catch (error) {
    console.log(`错误: ${error.message}`);
    console.log(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugPage().catch(console.error);
