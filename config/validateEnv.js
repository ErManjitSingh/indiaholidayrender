/**
 * Environment Variables Validation
 * Ensures all required GA4 config is present at startup (fail fast)
 * Service Account based GA4 setup
 */

function validateGA4Config() {
  const required = [
    'GA4_PROPERTY_ID',
    'GA4_SERVICE_ACCOUNT_EMAIL',
    'GA4_SERVICE_ACCOUNT_KEY_PATH',
  ];

  const missing = [];

  // Check required variables
  required.forEach((key) => {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push(key);
    }
  });

  // Validate service account key file
  const fs = require('fs');
  const path = require('path');
  const keyPath = path.resolve(process.env.GA4_SERVICE_ACCOUNT_KEY_PATH);

  if (!fs.existsSync(keyPath)) {
    console.error(`❌ GA4 service account key file not found: ${keyPath}`);
    console.error('📋 Make sure the JSON file exists and is committed OR mounted correctly on Render');
    process.exit(1);
  }

  if (missing.length > 0) {
    console.error('❌ Missing required GA4 environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n📋 Please add these to Render Environment Variables');
    process.exit(1);
  }

  console.log('✅ GA4 configuration validated (Service Account)');
  console.log(`   Property ID: ${process.env.GA4_PROPERTY_ID}`);
  console.log(`   Service Account: ${process.env.GA4_SERVICE_ACCOUNT_EMAIL}`);
  console.log(`   Key Path: ${process.env.GA4_SERVICE_ACCOUNT_KEY_PATH}`);
}

module.exports = { validateGA4Config };
