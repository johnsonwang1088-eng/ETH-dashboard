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
        throw new Error('Google API quota exceeded or invalid API key. Please check Custom Search Engine ID configuration.');
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
          fields: 'items(title,link,snippet,pagemap)'
        }
      });

      const results = response.data.items || [];
      console.log(`Query: ${query}, Raw results count: ${results.length}`);
      console.log('Sample result:', results[0]);
      
      const formattedResults = this.formatResults(results);
      console.log(`Filtered results count: ${formattedResults.length}`);
      
      return formattedResults;
    } catch (error) {
      console.error('Google Search API error:', error.message);
      if (error.response && error.response.status === 403) {
        throw new Error('Google API quota exceeded or invalid API key. Please check Custom Search Engine ID configuration.');
      }
      throw error;
    }
  }

  async searchMultipleQueries(queries, totalResults = 30, dateRestrict = 'd1') {
    const resultsPerQuery = Math.ceil(totalResults * 2 / queries.length);
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

  formatResults(items) {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const processed = items
      .map(item => {
        const tweetId = this.extractTweetId(item.link);
        const tweetTime = tweetId ? this.getTweetTime(tweetId) : null;
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

  extractTweetId(url) {
    const match = url.match(/x\.com\/[^\/]+\/status\/(\d+)/);
    return match ? match[1] : null;
  }

  getTweetIdTime(tweetId) {
    const twitterEpoch = 1288834974657n;
    const tweetIdBigInt = BigInt(tweetId);
    const timestampBigInt = (tweetIdBigInt >> 22n) + twitterEpoch;
    return Number(timestampBigInt);
  }

  getTweetTime(tweetId) {
    return this.getTweetIdTime(tweetId);
  }
}

export default new GoogleSearchService();
