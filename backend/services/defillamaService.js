import axios from 'axios';

class DefillamaService {
  constructor() {
    this.baseUrl = 'https://api.llama.fi';
  }

  async getChainTvl() {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/historicalChainTvl/Ethereum`);
      const historicalData = response.data;
      
      if (historicalData && historicalData.length > 0) {
        const latestData = historicalData[historicalData.length - 1];
        const tvl = latestData.tvl;
        
        const formattedTvl = (tvl / 1e9).toFixed(3);
        return {
          tvlInDeFi: `$${formattedTvl}B`,
          tvlInDeFiValue: tvl
        };
      }
      
      return {
        tvlInDeFi: '$0B',
        tvlInDeFiValue: 0
      };
    } catch (error) {
      console.error('Error getting DefiLlama TVL data:', error.message);
      return {
        tvlInDeFi: '$0B',
        tvlInDeFiValue: 0
      };
    }
  }
}

export default new DefillamaService();
