import scan8004Service from './backend/services/scan8004Service.js';

async function testService() {
  console.log('='.repeat(60));
  console.log('测试 Scan8004Service 直接调用');
  console.log('='.repeat(60));
  console.log('');

  try {
    const data = await scan8004Service.getScan8004Data();
    
    console.log('返回的数据:');
    console.log(`  Registered Agents: ${data.registeredAgents}`);
    console.log(`  Feedback Submitted: ${data.feedbackSubmitted}`);
    console.log(`  Active Users: ${data.activeUsers}`);
    console.log(`  Success: ${data.success}`);
    console.log('');

    if (data.error) {
      console.log(`错误信息: ${data.error}`);
    }

  } catch (error) {
    console.log(`测试失败: ${error.message}`);
    console.log(error.stack);
  }
}

testService().catch(console.error);
