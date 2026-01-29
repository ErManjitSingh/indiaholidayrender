# GA4 Setup Instructions

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Google Analytics Data API**

## Step 2: Service Account Creation

### Option A: Service Account Key File (Recommended)

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `ga4-analytics-service`
4. Grant role: **Viewer** (or **Analytics Viewer**)
5. Click **Done**
6. Click on the created service account
7. Go to **Keys** tab → **Add Key** → **Create new key**
8. Choose **JSON** format
9. Download the JSON file
10. Save it as `config/ga4-service-account.json` in your project

### Option B: OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Copy **Client ID** and **Client Secret**
5. Add to `.env` file

## Step 3: Grant GA4 Access

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to **Admin** → **Property Access Management**
4. Click **+** → **Add users**
5. Add service account email: `indiaholidays@indiaholidays-485609.iam.gserviceaccount.com`
6. Role: **Viewer**
7. Click **Add**

## Step 4: Verify Property ID

1. In GA4, go to **Admin** → **Property Settings**
2. Copy **Property ID** (e.g., `521715358`)
3. Ensure it matches `GA4_PROPERTY_ID` in `.env`

## Step 5: Test Connection

After setup, test the connection:

```bash
curl http://localhost:3000/api/ga4/health \
  -H "Authorization: Bearer your-admin-token"
```

Expected response:
```json
{
  "status": "connected",
  "propertyId": "521715358",
  "message": "GA4 connection successful"
}
```

## Troubleshooting

### Permission Denied
- Ensure service account has **Viewer** access in GA4
- Check property ID is correct
- Verify service account email matches

### Property Not Found
- Verify Property ID in `.env`
- Check service account has access to the property
- Ensure property exists and is active

### Authentication Failed
- Verify service account key file path
- Check OAuth2 credentials if using OAuth
- Ensure Google Analytics Data API is enabled
