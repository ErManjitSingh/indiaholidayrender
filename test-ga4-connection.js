/**
 * GA4 Connection Test Script
 * Detailed error checking
 */

require('dotenv').config();
const ga4Service = require('./services/ga4Service');
const fs = require('fs');
const path = require('path');

async function testGA4Connection() {
  console.log('🔍 GA4 Connection Test\n');
  console.log('='.repeat(50));
  
  // Check environment variables
  console.log('\n📋 Environment Variables Check:');
  console.log(`   GA4_PROPERTY_ID: ${process.env.GA4_PROPERTY_ID || '❌ Missing'}`);
  console.log(`   GA4_SERVICE_ACCOUNT_EMAIL: ${process.env.GA4_SERVICE_ACCOUNT_EMAIL || '❌ Missing'}`);
  console.log(`   GA4_SERVICE_ACCOUNT_KEY_PATH: ${process.env.GA4_SERVICE_ACCOUNT_KEY_PATH || '❌ Missing'}`);
  
  // Check service account file
  const keyPath = path.resolve(process.env.GA4_SERVICE_ACCOUNT_KEY_PATH || './config/ga4-service-account.json');
  console.log(`\n📁 Service Account Key File Check:`);
  console.log(`   Expected path: ${keyPath}`);
  console.log(`   File exists: ${fs.existsSync(keyPath) ? '✅ Yes' : '❌ No'}`);
  
  if (!fs.existsSync(keyPath)) {
    console.log('\n⚠️  SERVICE ACCOUNT KEY FILE MISSING!');
    console.log('\n📝 To fix this:');
    console.log('   1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts');
    console.log('   2. Select project: indiaholidays-485609');
    console.log('   3. Find service account: indiaholidays@indiaholidays-485609.iam.gserviceaccount.com');
    console.log('   4. Click on it → KEYS tab → ADD KEY → Create new key → JSON');
    console.log('   5. Download the file');
    console.log('   6. Save it as: config/ga4-service-account.json');
    console.log('\n   See SERVICE_ACCOUNT_DOWNLOAD_GUIDE.md for detailed steps\n');
    return;
  }
  
  // Check file content
  try {
    const fileContent = fs.readFileSync(keyPath, 'utf8');
    const jsonContent = JSON.parse(fileContent);
    console.log(`   File is valid JSON: ✅ Yes`);
    console.log(`   Service account email in file: ${jsonContent.client_email || 'Not found'}`);
  } catch (error) {
    console.log(`   File is valid JSON: ❌ No`);
    console.log(`   Error: ${error.message}`);
    return;
  }
  
  // Test GA4 connection
  console.log('\n🔄 Testing GA4 Connection...');
  try {
    const health = await ga4Service.healthCheck();
    
    console.log('\n✅ Connection Result:');
    console.log(`   Status: ${health.status}`);
    console.log(`   Property ID: ${health.propertyId}`);
    console.log(`   Message: ${health.message}`);
    
    if (health.status === 'connected') {
      console.log('\n🎉 SUCCESS! GA4 is connected and working.');
    } else {
      console.log('\n❌ Connection Failed:');
      console.log(`   Error Type: ${health.errorType}`);
      console.log(`   Message: ${health.message}`);
      if (health.details) {
        console.log('\n   Details:');
        health.details.forEach((detail, index) => {
          console.log(`   ${index + 1}. ${detail}`);
        });
      }
    }
  } catch (error) {
    console.log('\n❌ Connection Test Failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run test
testGA4Connection().catch(console.error);
