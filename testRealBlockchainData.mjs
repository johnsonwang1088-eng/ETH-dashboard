// Test script for scan8004Service.js with optimized blockchain queries
import scan8004Service from './backend/services/scan8004Service.js';

async function testRealBlockchainData() {
  try {
    console.log('Testing real blockchain data fetching...');
    
    // 测试完整的 Scan8004 数据获取（包含回退机制）
    console.log('\n=== Testing Complete Scan8004 Service ===');
    const scanData = await scan8004Service.getScan8004Data();
    console.log('Scan8004 Data:', scanData);
    
    // 验证数据范围
    if (scanData.success) {
      const registered = parseInt(scanData.registeredAgents) || 0;
      const feedback = parseInt(scanData.feedbackSubmitted) || 0;
      const active = parseInt(scanData.activeUsers) || 0;
      
      console.log('\n=== Data Range Validation ===');
      console.log(`Registered Agents: ${registered} (should be 30k-50k)`);
      console.log(`Feedback Submitted: ${feedback} (should be ~80% of registered)`);
      console.log(`Active Users: ${active} (should be ~85% of registered)`);
      
      if (registered >= 30000 && registered <= 50000) {
        console.log('✅ Registered agents count is in expected range (30k-50k)');
      } else {
        console.log('❌ Registered agents count is not in expected range (30k-50k)');
        console.log(`   Expected: 30,000-50,000, Got: ${registered}`);
      }
      
      if (feedback >= registered * 0.7 && feedback <= registered * 0.9) {
        console.log('✅ Feedback count is reasonable (70-90% of registered)');
      } else {
        console.log('❌ Feedback count is not reasonable');
        console.log(`   Expected: 70-90% of ${registered}, Got: ${feedback}`);
      }
      
      if (active >= registered * 0.7 && active <= registered * 0.95) {
        console.log('✅ Active users count is reasonable (70-95% of registered)');
      } else {
        console.log('❌ Active users count is not reasonable');
        console.log(`   Expected: 70-95% of ${registered}, Got: ${active}`);
      }
    } else {
      console.log('❌ Scan8004 data fetch failed:', scanData.error);
    }
    
    // 测试 API 端点
    console.log('\n=== Testing API Endpoint ===');
    const response = await fetch('http://localhost:3000/api/eth/scan8004');
    const apiData = await response.json();
    console.log('API Response:', apiData);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealBlockchainData();