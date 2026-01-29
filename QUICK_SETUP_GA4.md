# Quick GA4 Setup Guide

## Current Issue
GA4 connection is failing because **service account key file is missing**.

## Solution: Download Service Account Key File

### Step 1: Download JSON Key File

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **indiaholidays-485609**
3. Go to **IAM & Admin** → **Service Accounts**
4. Find service account: **indiaholidays@indiaholidays-485609.iam.gserviceaccount.com**
5. Click on it → **Keys** tab
6. Click **Add Key** → **Create new key**
7. Choose **JSON** format
8. Download the file

### Step 2: Save Key File

1. Create `config` folder if it doesn't exist:
   ```bash
   mkdir config
   ```

2. Save the downloaded JSON file as:
   ```
   config/ga4-service-account.json
   ```

### Step 3: Verify GA4 Access

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select GA4 property (ID: 521715358)
3. Go to **Admin** → **Property Access Management**
4. Ensure service account has **Viewer** role:
   - Email: `indiaholidays@indiaholidays-485609.iam.gserviceaccount.com`
   - Role: **Viewer**

### Step 4: Restart Server

```bash
npm start
```

### Step 5: Test Connection

```bash
curl http://localhost:3000/api/ga4/health \
  -H "Authorization: Bearer any-token"
```

Expected response:
```json
{
  "status": "connected",
  "propertyId": "521715358",
  "message": "GA4 connection successful"
}
```

## Alternative: Use Environment Variable

Instead of saving the file, you can set environment variable:

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\path\to\your\service-account-key.json"

# Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## Troubleshooting

### Error: "Permission denied"
- ✅ Check service account has Viewer access in GA4
- ✅ Verify Property ID is correct (521715358)

### Error: "Property not found"
- ✅ Verify Property ID in GA4 Admin → Property Settings
- ✅ Ensure service account has access to this property

### Error: "Authentication failed"
- ✅ Check service account key file exists: `config/ga4-service-account.json`
- ✅ Verify JSON file is valid
- ✅ Check file permissions

## File Structure

After setup, your project should have:
```
Api_indiaholiday_nodejs/
├── config/
│   └── ga4-service-account.json  ← Add this file
├── .env
└── ...
```

**Important:** The `ga4-service-account.json` file contains sensitive credentials. 
- ✅ Already in `.gitignore` (won't be committed to Git)
- ❌ Never share this file publicly
- ❌ Never commit it to version control
