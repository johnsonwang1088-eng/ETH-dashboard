import axios from 'axios';

class BeaconchainService {
  constructor() {
    this.apiKey = 'rCeTw2oFMPITIfmwNCBSfprSngylqAOeSPoTCjHIHL3';
    this.baseUrl = 'https://beaconcha.in/api/v1';
  }

  async getBeaconchainData() {
    
    try {
      const [epochData, slotData] = await Promise.all([
        this.getEpochData(),
        this.getSlotData()
      ]);

      return {
        stakedETH: this.formatNumber(epochData?.totalvalidatorbalance || 0),
        joiningQueue: this.formatNumber(epochData?.gval || 0),
        leavingQueue: this.formatNumber(epochData?.vval || 0),
        epoch: this.formatNumber(epochData?.epoch || 0),
        slot: this.formatNumber(slotData?.slot || 0)
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
    }
  }

  async getEpochData() {
    
    try {
      const response = await axios.get(`${this.baseUrl}/epoch/latest`, {
        headers: {
          'API-KEY': this.apiKey
        },
        timeout: 10000
      });

      return response.data?.data;
    } catch (error) {
      console.error('Error fetching epoch data:', error.message);
      return null;
    }
  }

  async getSlotData() {
    
    try {
      const response = await axios.get(`${this.baseUrl}/slot/latest`, {
        headers: {
          'API-KEY': this.apiKey
        },
        timeout: 10000
      });

      return response.data?.data;
    } catch (error) {
      console.error('Error fetching slot data:', error.message);
      return null;
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
