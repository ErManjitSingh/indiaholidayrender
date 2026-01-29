/**
 * Environment Variables Validation
 * Ensures all required GA4 config is present at startup (fail fast)
 */

function validateGA4Config() {
  const required = [
    'GA4_PROPERTY_ID',
    'GA4_SERVICE_ACCOUNT_EMAIL',
    'GA4_CLIENT_ID',
    'GA4_CLIENT_SECRET',
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check optional service account key file
  if (process.env.GA4_SERVICE_ACCOUNT_KEY_PATH) {
    const fs = require('fs');
    const path = require('path');
    const keyPath = path.resolve(process.env.GA4_SERVICE_ACCOUNT_KEY_PATH);
    
    if (!fs.existsSync(keyPath)) {
      warnings.push(`Service account key file not found: ${keyPath}`);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required GA4 environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n📋 Please add these to your .env file');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ GA4 Configuration warnings:');
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
    console.warn('   Will use OAuth2 credentials instead.\n');
  }

  console.log('✅ GA4 configuration validated');
  console.log(`   Property ID: ${process.env.GA4_PROPERTY_ID}`);
  console.log(`   Service Account: ${process.env.GA4_SERVICE_ACCOUNT_EMAIL}`);
}

module.exports = { validateGA4Config };
