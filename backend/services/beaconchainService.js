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
      
      await page.goto('https://beaconcha.in', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 5000));

      const data = await page.evaluate(() => {
        const mainText = document.body.innerText;
        
        const result = {};
        
        const epochMatch = mainText.match(/Epoch\s+(\d{6})/);
        if (epochMatch) {
          result.epoch = parseInt(epochMatch[1]);
        }

        const slotMatch = mainText.match(/Slot\s+(\d{8})/);
        if (slotMatch) {
          result.slot = parseInt(slotMatch[1]);
        }

        const stakedMatch = mainText.match(/Staked\s+ETH\s+([\d,]+)\s+ETH/);
        if (stakedMatch) {
          result.stakedETH = parseInt(stakedMatch[1].replace(/,/g, ''));
        }

        const joiningLeavingMatch = mainText.match(/Joining\s+\/\s+Leaving\s+(\d+)K\s+\/\s+(\d+)K/);
        if (joiningLeavingMatch) {
          result.joining = parseInt(joiningLeavingMatch[1]) * 1000;
          result.leaving = parseInt(joiningLeavingMatch[2]) * 1000;
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
