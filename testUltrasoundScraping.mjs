import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

const TIMEOUT = 30000;

async function testUltrasoundScraping() {
  console.log('Starting ultrasound.money scraping test...');
  
  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    
    console.log('Navigating to ultrasound.money...');
    
    await Promise.race([
      page.goto('https://ultrasound.money', {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT
      }),
      setTimeout(TIMEOUT + 5000).then(() => {
        throw new Error('Page load timeout');
      })
    ]);
    
    console.log('Waiting for content to load...');
    await setTimeout(5000);
    
    const data = await page.evaluate(() => {
      const result = {};
      const bodyText = document.body.innerText || '';
      
      const burnTotalMatch = bodyText.match(/burn total\s+([\d.,]+)/i);
      if (burnTotalMatch) {
        result.burnTotal = burnTotalMatch[1];
      }
      
      const burned7dMatch = bodyText.match(/burn total\s+([\d.,]+)/i);
      if (burned7dMatch) {
        result.burned7d = burned7dMatch[1];
      }
      
      const burnRateMatch = bodyText.match(/burn rate\s+([\d.,]+)/i);
      if (burnRateMatch) {
        result.burnRate = burnRateMatch[1];
      }
      
      const supplyChangeMatch = bodyText.match(/supply change\s*([+-]?[\d.,]+\s*eth)/i);
      if (supplyChangeMatch) {
        result.supplyChange = supplyChangeMatch[1].trim();
      }
      
      const supplyGrowthMatch = bodyText.match(/supply growth\s*([+-]?[\d.,]+%)/i);
      if (supplyGrowthMatch) {
        result.supplyGrowth = supplyGrowthMatch[1].trim();
      }
      
      const blobFeeBurnMatch = bodyText.match(/blob fee burn\s+([\d.,]+)/i);
      if (blobFeeBurnMatch) {
        result.blobFeeBurn = blobFeeBurnMatch[1];
      }
      
      const feeBurnMatch = bodyText.match(/fee burn\s*[:=]?\s*([\d.,]+)\s*k?eth/i);
      if (feeBurnMatch) {
        result.feeBurn = feeBurnMatch[1];
      }
      
      const issuedMatch = bodyText.match(/issued\s+([\d.,]+)/i);
      if (issuedMatch) {
        result.issued = issuedMatch[1];
      }
      
      const issuanceMatch = bodyText.match(/issuance\s+([\d.,]+)/i);
      if (issuanceMatch) {
        result.issuance = issuanceMatch[1];
      }
      
      return result;
    });
    
    console.log('Scraped data:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error during scraping:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

testUltrasoundScraping().catch(console.error);
