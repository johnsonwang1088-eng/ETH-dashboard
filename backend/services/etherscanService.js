import axios from 'axios';

class EtherscanService {
  constructor() {
    this.apiKey = 'J6NVRA3AUZR27GRKY99WMIJNNSRGVZIENU';
    this.baseUrl = 'https://api.etherscan.io/v2/api';
    this.rpcUrl = 'https://ethereum.publicnode.com';
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
      
    } catch (error) {
      console.error('Error fetching latest block:', error.message);
    }
  }

  async getBlockByNumber(blockNumber) {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['0x' + blockNumber.toString(16), false],
        id: 1
      }, {
        timeout: 10000
      });
      
      if (response.data && response.data.result) {
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching block ${blockNumber}:`, error.message);
      return null;
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
    return `${gwei.toFixed(3)} Gwei`;
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

  async get7DayBurnedData() {
    try {
      const latestBlock = await this.getLatestBlock();
      
      if (!latestBlock || isNaN(latestBlock)) {
        console.error('Invalid latest block number:', latestBlock);
        return { burned7d: '0 ETH', issued7d: '0 ETH' };
      }
      
      const blocksPerDay = 7200;
      const daysToSample = 7;
      const sampleBlocks = 20;
      
      const startBlock = latestBlock - (blocksPerDay * daysToSample);
      const endBlock = latestBlock;
      
      const blockRange = endBlock - startBlock;
      const sampleInterval = Math.floor(blockRange / sampleBlocks);
      
      console.log(`Sampling ${sampleBlocks} blocks from ${startBlock} to ${endBlock} (interval: ${sampleInterval})`);
      
      let totalBurned = 0n;
      let validSamples = 0;
      
      for (let i = 0; i < sampleBlocks; i++) {
        const blockNumber = startBlock + (i * sampleInterval);
        
        if (isNaN(blockNumber) || blockNumber < 0) {
          console.log(`Invalid block number: ${blockNumber}, skipping`);
          continue;
        }
        
        try {
          const block = await this.getBlockByNumber(blockNumber);
          
          if (block && block.baseFeePerGas && block.gasUsed) {
            const baseFeePerGas = BigInt(block.baseFeePerGas);
            const gasUsed = BigInt(block.gasUsed);
            const blockBurnedWei = baseFeePerGas * gasUsed;
            const blockBurnedEth = Number(blockBurnedWei / BigInt(1e15)) / 1000;
            
            if (baseFeePerGas > 0n && i < 5) {
              console.log(`Block ${blockNumber}: burned=${blockBurnedEth.toFixed(4)} ETH`);
            }
            
            totalBurned += blockBurnedWei;
            validSamples++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 30));
          
        } catch (error) {
          console.error(`Error fetching block ${blockNumber}:`, error.message);
        }
      }
      
      if (validSamples === 0) {
        return { burned7d: '0 ETH', issued7d: '0 ETH' };
      }
      
      const avgBurnedPerBlock = totalBurned / BigInt(validSamples);
      const estimatedTotalBurned = avgBurnedPerBlock * BigInt(blockRange + 1);
      const burned7d = (estimatedTotalBurned / BigInt(1e18)).toString();
      
      const blockReward = 2n * BigInt(1e18);
      const estimatedIssued = blockReward * BigInt(blockRange + 1);
      const issued7d = (estimatedIssued / BigInt(1e18)).toString();
      
      console.log(`Sampled ${validSamples}/${sampleBlocks} blocks`);
      console.log(`Estimated 7d burned: ${burned7d} ETH`);
      console.log(`Estimated 7d issued: ${issued7d} ETH`);
      
      return {
        burned7d: `${parseFloat(burned7d).toLocaleString('en-US', { maximumFractionDigits: 2 })} ETH`,
        issued7d: `${parseFloat(issued7d).toLocaleString('en-US', { maximumFractionDigits: 2 })} ETH`
      };
      
    } catch (error) {
      console.error('Error fetching 7 day burned data:', error.message);
      return { burned7d: '0 ETH', issued7d: '0 ETH' };
    }
  }
}

export default new EtherscanService();
