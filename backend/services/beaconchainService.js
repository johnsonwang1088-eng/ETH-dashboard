import puppeteer from 'puppeteer';

class BeaconchainService {
  async getBeaconchainData() {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.goto('https://beaconcha.in/explorer', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 10000));

      const data = await page.evaluate(() => {
        const result = {};
        // Get the whole text to be safe
        const text = document.body.innerText.replace(/\s+/g, ' ');
        
        // Use case-insensitive regex to be more robust
        const epochMatch = text.match(/EPOCH\s*([\d,]+)/i);
        if (epochMatch) result.epoch = parseInt(epochMatch[1].replace(/,/g, ''));

        const slotMatch = text.match(/SLOT\s*([\d,]+)/i);
        if (slotMatch) result.slot = parseInt(slotMatch[1].replace(/,/g, ''));

        // Specifically look for STAKED ETH followed by the number
        const stakedMatch = text.match(/STAKED\s*ETH\s*([\d,]+)/i);
        if (stakedMatch) result.stakedETH = parseInt(stakedMatch[1].replace(/,/g, ''));

        // Parse JOINING / LEAVING which might look like "3026K / 32"
        const queueMatch = text.match(/JOINING\s*\/\s*LEAVING\s*([\d,K]+)\s*\/\s*([\d,K]+)/i);
        if (queueMatch) {
          const parseQueueValue = (val) => {
            if (val.toUpperCase().endsWith('K')) {
              return parseFloat(val.replace(/K/i, '')) * 1000;
            }
            return parseInt(val.replace(/,/g, ''));
          };
          result.joining = parseQueueValue(queueMatch[1]);
          result.leaving = parseQueueValue(queueMatch[2]);
        }

        return result;
      });

      return {
        stakedETH: this.formatNumber(data.stakedETH || 0),
        joiningQueue: this.formatNumber(data.joining || 0),
        leavingQueue: this.formatNumber(data.leaving || 0),
        epoch: (data.epoch || 0).toString(),
        slot: (data.slot || 0).toString()
      };
    } catch (error) {
      console.error('Error fetching Beaconchain data:', error.message);
      return {
        stakedETH: '0',
        joiningQueue: '0',
        leavingQueue: '0',
        epoch: '0',
        slot: '0'
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  formatNumber(num) {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  }
}

export default new BeaconchainService();
