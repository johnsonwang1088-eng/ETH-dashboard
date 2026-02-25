import axios from 'axios';

class L2BeatService {
  constructor() {
    this.apiUrl = 'https://l2beat.com/api/scaling/tvs';
  }

  async getL2Data() {
    
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const { usdValue, ethValue } = response.data.data;
        const valueSecured = this.formatCurrency(usdValue);
        const valueSecuredEth = this.formatNumber(ethValue);

        return {
          valueSecured,
          valueSecuredEth,
          valueSecuredUsd: usdValue
        };
      }
      
      return {
        valueSecured: '$0',
        valueSecuredEth: 0,
        valueSecuredUsd: 0
      };
    } catch (error) {
      console.error('Error fetching L2Beat data:', error.message);
      return {
        valueSecured: '$0',
        valueSecuredEth: 0,
        valueSecuredUsd: 0
      };
    }
  }

  formatCurrency(value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  }

  formatNumber(value) {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  }
}

export default new L2BeatService();
