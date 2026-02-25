import puppeteer from 'puppeteer';

async function debugNetwork() {
  console.log('='.repeat(60));
  console.log('调试 8004scan.io 网络请求');
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
    
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('data') || request.url().includes('graph')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('api') || url.includes('data') || url.includes('graph') || url.includes('subgraph')) {
        responses.push({
          url: url,
          status: response.status()
        });
      }
    });
    
    console.log('正在访问 8004scan.io...');
    
    await page.goto('https://www.8004scan.io/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('等待数据加载...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('='.repeat(60));
    console.log('API/Data 请求:');
    console.log('='.repeat(60));
    console.log('');
    
    for (let i = 0; i < Math.min(30, requests.length); i++) {
      console.log(`  ${i + 1}. ${requests[i].method} ${requests[i].url}`);
    }
    
    console.log('');
    console.log(`共找到 ${requests.length} 个请求`);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('响应:');
    console.log('='.repeat(60));
    console.log('');
    
    for (let i = 0; i < Math.min(30, responses.length); i++) {
      console.log(`  ${i + 1}. ${responses[i].status} ${responses[i].url}`);
    }
    
    console.log('');
    console.log(`共找到 ${responses.length} 个响应`);

  } catch (error) {
    console.log(`错误: ${error.message}`);
    console.log(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugNetwork().catch(console.error);
