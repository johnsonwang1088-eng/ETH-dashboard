import https from 'https';

function fetchFromEtherscan(address) {
  return new Promise((resolve, reject) => {
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=YourApiKeyToken`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkContract() {
  const addresses = [
    '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
    '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63'
  ];

  console.log('='.repeat(60));
  console.log('检查 ERC-8004 合约在 Etherscan 上的状态');
  console.log('='.repeat(60));
  console.log('');

  for (const address of addresses) {
    console.log(`检查合约: ${address}`);
    try {
      const result = await fetchFromEtherscan(address);
      console.log(`  状态: ${result.status === '1' ? '✓ 存在' : '✗ 不存在'}`);
      console.log(`  消息: ${result.message}`);
      if (result.status === '1') {
        const abi = JSON.parse(result.result);
        console.log(`  ABI 函数数量: ${abi.length}`);
        
        const hasTotalSupply = abi.some(item => item.name === 'totalSupply' && item.type === 'function');
        const hasGetTotalFeedback = abi.some(item => item.name === 'getTotalFeedbackCount' && item.type === 'function');
        const hasBalanceOf = abi.some(item => item.name === 'balanceOf' && item.type === 'function');
        
        console.log(`  totalSupply 函数: ${hasTotalSupply ? '✓' : '✗'}`);
        console.log(`  getTotalFeedbackCount 函数: ${hasGetTotalFeedback ? '✓' : '✗'}`);
        console.log(`  balanceOf 函数: ${hasBalanceOf ? '✓' : '✗'}`);
        
        console.log(`  可用函数: ${abi.filter(i => i.type === 'function').slice(0, 10).map(f => f.name).join(', ')}`);
      }
    } catch (error) {
      console.log(`  ✗ 查询失败: ${error.message}`);
    }
    console.log('');
  }
}

checkContract().catch(error => {
  console.error('测试过程中发生错误:', error);
});
