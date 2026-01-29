/**
 * Test Trek API Endpoints
 */

const baseUrl = 'http://localhost:3000/api/treks';

async function testTrekAPI() {
  console.log('🧪 Testing Trek API Endpoints\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Get all treks
    console.log('\n1️⃣ Testing GET /api/treks');
    const response1 = await fetch(baseUrl);
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));

    // Test 2: Health check
    console.log('\n2️⃣ Testing GET /health');
    const response2 = await fetch('http://localhost:3000/health');
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));

    console.log('\n✅ Tests completed');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n📋 Make sure:');
    console.error('   1. Server is running: npm start');
    console.error('   2. MongoDB is connected');
    console.error('   3. Server is listening on port 3000');
  }
}

// Run tests
testTrekAPI();
