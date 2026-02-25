import axios from 'axios';

class GoogleSearchService {
  constructor() {
    this.apiKey = 'AIzaSyARO8vgRnpV4EQu6vMu_atvOg0N3XgliNk';
    this.searchEngineId = '017576662512468239146:omuauf_lfve';
  }

  async getXTrending() {
    const queries = ['ethereum', 'ETH'];
    const allResults = [];

    for (const query of queries) {
      try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: this.apiKey,
            cx: this.searchEngineId,
            q: `${query} site:x.com OR site:twitter.com`,
            num: 10,
            sort: 'date',
            dateRestrict: 'd1'
          },
          timeout: 10000
        });

        if (response.data.items) {
          const results = response.data.items.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
          }));
          allResults.push(...results);
        }
      } catch (error) {
        console.error(`Error fetching Google search results for ${query}:`, error.message);
      }
    }

    const uniqueResults = this.removeDuplicates(allResults);
    return uniqueResults.slice(0, 20);
  }

  removeDuplicates(results) {
    const seen = new Set();
    return results.filter(result => {
      const link = result.link;
      if (seen.has(link)) {
        return false;
      }
      seen.add(link);
      return true;
    });
  }
}

export default new GoogleSearchService();
