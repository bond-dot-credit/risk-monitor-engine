const testProtocolRewards = async () => {
  try {
    console.log('Testing NEAR Protocol Rewards API...');
    
    // Test the account info endpoint
    console.log('\n1. Testing account info endpoint...');
    const accountResponse = await fetch('http://localhost:3003/api/near-protocol-rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getAccountInfo'
      })
    });
    
    const accountData = await accountResponse.json();
    console.log('Account Info Response:', JSON.stringify(accountData, null, 2));
    
    // Test the metrics collection endpoint
    console.log('\n2. Testing metrics collection endpoint...');
    const metricsResponse = await fetch('http://localhost:3003/api/near-protocol-rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'collectMetrics',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      })
    });
    
    const metricsData = await metricsResponse.json();
    console.log('Metrics Collection Response:', JSON.stringify(metricsData, null, 2));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
};

testProtocolRewards();