import axios from 'axios';

class Scan8004Service {
  constructor() {
    this.baseUrl = 'https://www.8004scan.io';
    this.apiEndpoint = '/api/v1/stats/global';
  }

  async getScan8004Data() {
    try {
      const data = await this.fetchRealTimeData();
      
      return {
        registeredAgents: data.registeredAgents || '0',
        feedbackSubmitted: data.feedbackSubmitted || '0', 
        activeUsers: data.activeUsers || '0',
        success: true
      };
    } catch (error) {
      console.error('Error fetching Scan8004 data:', error.message);
      return {
        registeredAgents: '0',
        feedbackSubmitted: '0',
        activeUsers: '0',
        success: false,
        error: error.message
      };
    }
  }

  async fetchRealTimeData() {
    try {
      console.log('Fetching real-time data from 8004scan.io API...');
      const apiData = await this.fetchFromAPI();
      
      if (apiData && this.isValidData(apiData)) {
        console.log('Successfully fetched API data:', apiData);
        return {
          registeredAgents: apiData.registeredAgents,
          feedbackSubmitted: apiData.feedbackSubmitted,
          activeUsers: apiData.activeUsers
        };
      }
      
      console.log('API data invalid, returning zeros');
      return {
        registeredAgents: '0',
        feedbackSubmitted: '0',
        activeUsers: '0'
      };
    } catch (error) {
      console.error('All data sources failed:', error.message);
      return {
        registeredAgents: '0',
        feedbackSubmitted: '0',
        activeUsers: '0'
      };
    }
  }

  async fetchFromAPI() {
    try {
      const response = await axios.get(`${this.baseUrl}${this.apiEndpoint}`, {
        params: { is_testnet: false },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });

      const data = response.data;
      
      if (!data || !data.chain_stats) {
        throw new Error('Invalid API response structure');
      }

      const totalAgents = data.total_agents || 0;
      const totalUsers = data.total_users || 0;
      const totalFeedbacks = data.total_feedbacks || 0;

      console.log(`API数据提取: Registered=${totalAgents}, Feedback=${totalFeedbacks}, Active Users=${totalUsers}`);
      
      return {
        registeredAgents: totalAgents.toString(),
        feedbackSubmitted: totalFeedbacks.toString(),
        activeUsers: totalUsers.toString()
      };
      
    } catch (error) {
      console.log('API request failed:', error.message);
      throw error;
    }
  }

  isValidData(data) {
    const minValidAgents = 10000;
    const registeredAgents = parseInt(data.registeredAgents) || 0;
    const feedbackSubmitted = parseInt(data.feedbackSubmitted) || 0;
    const activeUsers = parseInt(data.activeUsers) || 0;

    return registeredAgents >= minValidAgents && 
           feedbackSubmitted >= 100 && 
           activeUsers >= 100;
  }

  formatNumber(number) {
    return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  }
}

export default new Scan8004Service();
