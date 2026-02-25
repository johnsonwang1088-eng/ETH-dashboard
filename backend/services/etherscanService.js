import axios from 'axios';

class EtherscanService {
  constructor() {
    this.apiKey = 'J6NVRA3AUZR27GRKY99WMIJNNSRGVZIENU';
    this.baseUrl = 'https://api.etherscan.io/v2/api';
    this.chainId = '1';
  }

  async getGasData() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          chainid: this.chainId,
          module: 'gastracker',
          action: 'gasoracle',
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.result) {
        const gasPrice = response.data.result.SafeGasPrice;
        const gasPriceGwei = this.parseGasPrice(gasPrice);
        
        return {
          averageGasPrice: gasPriceGwei
        };
      }
      
      return { averageGasPrice: '0 Gwei' };
    } catch (error) {
      console.error('Error fetching Etherscan gas data:', error.message);
      return { averageGasPrice: '0 Gwei' };
    }
  }

  async getTopGasConsumers() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          chainid: this.chainId,
          module: 'account',
          action: 'txs',
          startblock: await this.getLatestBlock(),
          endblock: 99999999,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.result) {
        const gasConsumers = this.processGasConsumers(response.data.result);
        return gasConsumers;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching Etherscan gas consumers:', error.message);
      return [];
    }
  }

  async getLatestBlock() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          chainid: this.chainId,
          module: 'proxy',
          action: 'eth_blockNumber',
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.result) {
        return parseInt(response.data.result, 16);
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching latest block:', error.message);
      return 0;
    }
  }

  processGasConsumers(transactions) {
    const gasMap = new Map();
    let totalGas = 0;

    transactions.forEach(tx => {
      const gasUsed = parseInt(tx.gasUsed);
      totalGas += gasUsed;
      
      if (gasMap.has(tx.from)) {
        gasMap.set(tx.from, gasMap.get(tx.from) + gasUsed);
      } else {
        gasMap.set(tx.from, gasUsed);
      }
    });

    const sorted = Array.from(gasMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([address, gas], index) => {
      const percentage = totalGas > 0 ? ((gas / totalGas) * 100).toFixed(1) : '0.0';
      return {
        address: this.shortenAddress(address),
        amount: this.formatNumber(gas),
        percentage: `${percentage}%`
      };
    });
  }

  parseGasPrice(gasPrice) {
    const gwei = parseFloat(gasPrice);
    if (isNaN(gwei)) return '0 Gwei';
    return `${gwei.toFixed(2)} Gwei`;
  }

  formatNumber(num) {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  }

  shortenAddress(address) {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }
}

export default new EtherscanService();
