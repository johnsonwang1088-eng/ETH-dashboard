// Test Scan8004Service directly
const Scan8004Service = await import('./backend/services/scan8004Service.js');

async function testScan8004Service() {
  console.log('Testing Scan8004Service...');
  
  try {
    const result = await Scan8004Service.default.getScan8004Data();
    console.log('Service result:', result);
    
    // 测试多次调用，观察数据变化
    console.log('\nTesting multiple calls:');
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
      const testResult = await Scan8004Service.default.getScan8004Data();
      console.log(`Call ${i + 1}:`, testResult);
    }
    
  } catch (error) {
    console.error('Service test failed:', error.message);
  }
}

testScan8004Service();