import axios from 'axios';

class GoogleSearchService {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyARO8vgRnpV4EQu6vMu_atvOg0N3XgliNk';
    this.cx = process.env.GOOGLE_CX || '218d5b6727c6f44b4';
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
  }

  async search(query, num = 10, startIndex = 1) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: query,
          num: Math.min(num, 10),
          start: startIndex,
          fields: 'items(title,link,snippet)'
        }
      });

      const results = response.data.items || [];
      return this.formatResults(results);
    } catch (error) {
      console.error('Google Search API error:', error.message);
      if (error.response && error.response.status === 403) {
        throw new Error('Google API 配额已用尽或 API key 无效。请检查 Custom Search Engine ID 是否配置正确。');
      }
      throw error;
    }
  }

  async searchTwitter(query, numResults = 30, dateRestrict = 'd1') {
    try {
      const dorkQuery = `site:x.com ${query}`;
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: dorkQuery,
          num: Math.min(numResults, 10),
          dateRestrict: dateRestrict,
          fields: 'items(title,link,snippet)'
        }
      });

      const results = response.data.items || [];
      return this.formatResults(results);
    } catch (error) {
      console.error('Google Search API error:', error.message);
      if (error.response && error.response.status === 403) {
        throw new Error('Google API 配额已用尽或 API key 无效。请检查 Custom Search Engine ID 是否配置正确。');
      }
      throw error;
    }
  }

  async searchMultipleQueries(queries, totalResults = 30, dateRestrict = 'd1') {
    const resultsPerQuery = Math.ceil(totalResults / queries.length);
    const allResults = [];

    for (const query of queries) {
      try {
        const results = await this.searchTwitter(query, resultsPerQuery, dateRestrict);
        allResults.push(...results);
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error.message);
      }
    }

    return allResults.slice(0, totalResults);
  }

  extractTweetId(link) {
    const match = link.match(/x\.com\/[^\/]+\/status\/(\d+)/);
    return match ? match[1] : null;
  }

  getTweetIdTime(tweetId) {
    const twitterEpoch = 1288834974657n;
    const tweetIdBigInt = BigInt(tweetId);
    const timestampBigInt = (tweetIdBigInt >> 22n) + twitterEpoch;
    return Number(timestampBigInt);
  }

  formatResults(items) {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    console.log(`Total raw results: ${items.length}`);
    console.log(`Sample result: ${JSON.stringify(items[0], null, 2)}`);

    const processed = items
      .map(item => {
        const tweetId = this.extractTweetId(item.link);
        const tweetTime = tweetId ? this.getTweetIdTime(tweetId) : null;
        const hoursAgo = tweetTime ? Math.floor((now - tweetTime) / (1000 * 60 * 60)) : null;
        
        console.log(`Link: ${item.link}`);
        console.log(`TweetId: ${tweetId}, TweetTime: ${tweetTime}, Hours ago: ${hoursAgo}`);
        
        return {
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          tweetId,
          tweetTime,
          hoursAgo
        };
      })
      .filter(item => {
        if (!item.tweetId) {
          console.log(`Filtered out: No tweet ID`);
          return false;
        }
        if (!item.tweetTime) {
          console.log(`Filtered out: No tweet time`);
          return false;
        }
        const within24Hours = (now - item.tweetTime) <= oneDayMs;
        if (!within24Hours) {
          console.log(`Filtered out: ${item.hoursAgo} hours ago (> 24h)`);
        }
        return within24Hours;
      });
    
    console.log(`Total processed: ${processed.length}`);
    return processed;
  }

  async getXTrending() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: 'site:x.com trending',
          num: 10,
          fields: 'items(title,link,snippet)'
        }
      });

      const results = response.data.items || [];
      return this.formatResults(results);
    } catch (error) {
      console.error('Google Search API error:', error.message);
      throw error;
    }
  }
}

export default new GoogleSearchService();
