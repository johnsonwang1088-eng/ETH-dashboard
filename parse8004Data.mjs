// Parse 8004scan.io HTML to extract real data
import fs from 'fs';

async function parse8004ScanHTML() {
  try {
    const html = fs.readFileSync('d:\\OpenhandsProjects\\eth-project\\8004scan-page.html', 'utf8');
    
    console.log('HTML length:', html.length);
    
    // 查找可能包含数据的模式
    const patterns = [
      {
        name: 'registeredAgents',
        regex: /"registeredAgents"\s*:\s*"([0-9,]+)"/gi
      },
      {
        name: 'feedbackSubmitted', 
        regex: /"feedbackSubmitted"\s*:\s*"([0-9,]+)"/gi
      },
      {
        name: 'activeUsers',
        regex: /"activeUsers"\s*:\s*"([0-9,]+)"/gi
      },
      {
        name: 'userProvidedNumbers',
        regex: /46673|35728|35421/g
      },
      {
        name: 'anyNumbers',
        regex: /"totalAgents"\s*:\s*"([0-9,]+)"/gi
      }
    ];
    
    const results = {};
    
    for (const pattern of patterns) {
      const matches = html.match(pattern.regex);
      if (matches && matches.length > 0) {
        results[pattern.name] = matches.slice(0, 5);
        console.log(`Found ${pattern.name}: ${matches.slice(0, 3).join(', ')}`);
      }
    }
    
    // 查找 JSON 数据块
    const jsonMatch = html.match(/__NEXT_DATA__\s*type="application\/json">\s*<script>(.*?)<\/script>/s);
    if (jsonMatch) {
      const jsonData = jsonMatch[1];
      try {
        const parsed = JSON.parse(jsonData);
        console.log('Found NEXT_DATA JSON');
        
        // 在 JSON 中查找数据
        const findDeepNumber = (obj, path) => {
          if (!obj) return null;
          const keys = path.split('.');
          let current = obj;
          for (const key of keys) {
            current = current[key];
            if (current === undefined) return null;
          }
          return current;
        };
        
        const possiblePaths = [
          'props.pageProps.data.registeredAgents',
          'props.pageProps.data.totalAgents',
          'props.pageProps.data.agents',
          'props.pageProps.metrics.registeredAgents',
          'props.pageProps.stats.registeredAgents'
        ];
        
        for (const path of possiblePaths) {
          const value = findDeepNumber(parsed, path);
          if (value && typeof value === 'number') {
            console.log(`Found number at ${path}: ${value}`);
          }
        }
        
      } catch (e) {
        console.log('Failed to parse NEXT_DATA JSON:', e.message);
      }
    }
    
    // 直接搜索用户提到的数字
    const userNumbers = ['46673', '35728', '35421'];
    const foundNumbers = {};
    
    for (const num of userNumbers) {
      const regex = new RegExp(num, 'g');
      const count = (html.match(regex) || []).length;
      if (count > 0) {
        foundNumbers[num] = count;
        console.log(`Found number ${num}: ${count} times`);
      }
    }
    
    return {
      success: true,
      patterns: results,
      foundNumbers: foundNumbers,
      htmlPreview: html.substring(0, 500) + '...' + html.substring(html.length - 500)
    };
    
  } catch (error) {
    console.error('Failed to parse HTML:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

const result = await parse8004ScanHTML();
console.log('Parse result:', result);