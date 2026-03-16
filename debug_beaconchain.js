import puppeteer from 'puppeteer';

async function debugBeaconchain() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('Navigating to beaconcha.in/explorer...');
    await page.goto('https://beaconcha.in/explorer', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 8000)); // Wait a bit longer for all dynamic content

    const cardsData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.card'));
      return cards.map((card, index) => ({
        index,
        text: card.innerText.replace(/\s+/g, ' ').trim()
      }));
    });

    console.log('Found cards:', JSON.stringify(cardsData, null, 2));

  } catch (error) {
    console.error('Debug error:', error.message);
  } finally {
    await browser.close();
  }
}

debugBeaconchain();
