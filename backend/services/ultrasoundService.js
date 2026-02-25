class UltrasoundService {
  constructor() {
  }

  async getSupplyData() {
    return {
      supplyChange: '-1250 ETH',
      burned7d: '8500 ETH',
      issued7d: '7250 ETH',
      burnRate: '117.24%',
      supplyGrowth: '-0.0104%',
      blobFeeBurn: '420.50 ETH'
    };
  }

  async getTotalValueSecured() {
    return {
      totalValueSecured: '$32.5B'
    };
  }
}

export default new UltrasoundService();
