import scan8004Service from './backend/services/scan8004Service.js';

async function testScan8004Service() {
  console.log('='.repeat(60));
  console.log('开始测试 Scan8004 服务数据获取功能');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('正在获取实时数据...');
    const data = await scan8004Service.getScan8004Data();
    
    console.log('');
    console.log('='.repeat(60));
    console.log('数据获取结果:');
    console.log('='.repeat(60));
    console.log(`注册代理数: ${data.registeredAgents}`);
    console.log(`反馈提交数: ${data.feedbackSubmitted}`);
    console.log(`活跃用户数: ${data.activeUsers}`);
    console.log(`获取状态: ${data.success ? '成功' : '失败'}`);
    
    if (!data.success && data.error) {
      console.log(`错误信息: ${data.error}`);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('数据验证:');
    console.log('='.repeat(60));
    
    const registeredAgents = parseInt(data.registeredAgents);
    const feedbackSubmitted = parseInt(data.feedbackSubmitted);
    const activeUsers = parseInt(data.activeUsers);
    
    // 验证数据是否在合理范围内
    const isRegisteredValid = registeredAgents >= 10000 && registeredAgents <= 50000;
    const isFeedbackValid = feedbackSubmitted >= 10000 && feedbackSubmitted <= 50000;
    const isActiveValid = activeUsers >= 10000 && activeUsers <= 50000;
    
    console.log(`注册代理数验证: ${isRegisteredValid ? '✓ 通过' : '✗ 失败'} (应该在 10,000 - 50,000 之间)`);
    console.log(`反馈提交数验证: ${isFeedbackValid ? '✓ 通过' : '✗ 失败'} (应该在 10,000 - 50,000 之间)`);
    console.log(`活跃用户数验证: ${isActiveValid ? '✓ 通过' : '✗ 失败'} (应该在 10,000 - 50,000 之间)`);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('测试完成');
    console.log('='.repeat(60));
    
    if (data.success && isRegisteredValid && isFeedbackValid && isActiveValid) {
      console.log('✓ 所有测试通过！');
      console.log('');
      console.log('数据范围检查:');
      console.log(`- 注册代理数: ${registeredAgents.toLocaleString()}`);
      console.log(`- 反馈提交数: ${feedbackSubmitted.toLocaleString()}`);
      console.log(`- 活跃用户数: ${activeUsers.toLocaleString()}`);
      console.log('');
      console.log('请将这些数值与 8004scan.io 上的实时数据进行对比。');
    } else {
      console.log('✗ 测试未通过，请检查服务配置或网络连接。');
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

testScan8004Service();
