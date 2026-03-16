import googleSearchService from './services/googleSearchService.js';

async function testService() {
  console.log('=== Testing Google Search Service ===\n');
  
  try {
    const queries = ['"Ethereum"'];
    const results = await googleSearchService.searchMultipleQueries(queries, 5);
    
    console.log(`Total results received: ${results.length}\n`);
    
    results.forEach((item, i) => {
      console.log(`${i+1}. TweetId: ${item.tweetId}`);
      console.log(`   Hours ago: ${item.hoursAgo}`);
      console.log(`   Title: ${item.title.substring(0, 50)}...`);
      console.log(`   Link: ${item.link}`);
      console.log();
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testService();
