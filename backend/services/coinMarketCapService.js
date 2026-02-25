import axios from 'axios';

class CoinMarketCapService {
  constructor() {
    this.apiKey = process.env.COINMARKETCAP_API_KEY || 'efe45785c9e84a15af535bffd0fbd58d';
    this.baseUrl = 'https://pro-api.coinmarketcap.com/v1';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-CMC_PRO_API_KEY': this.apiKey,
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }

  async getETHMarketData() {
    try {
      const response = await this.client.get('/cryptocurrency/quotes/latest', {
        params: {
          symbol: 'ETH',
          convert: 'USD'
        }
      });

      const ethData = response.data.data.ETH;
      const quote = ethData.quote.USD;

      return {
        price: quote.price.toFixed(2),
        marketCap: (quote.market_cap / 1e12).toFixed(4) + 'T',
        circulatingSupply: (ethData.circulating_supply / 1e6).toFixed(2) + 'M',
        volume24h: (quote.volume_24h / 1e9).toFixed(2) + 'B',
        marketDominance: quote.market_cap_dominance.toFixed(2) + '%'
      };
    } catch (error) {
      console.error('Error fetching CoinMarketCap data:', error.message);
      throw new Error(`CoinMarketCap API error: ${error.message}`);
    }
  }
}

export default new CoinMarketCapService();
