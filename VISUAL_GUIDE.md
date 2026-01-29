# Visual Guide - Service Account File Download

## Quick Steps (Screenshots Guide)

### Step 1: Google Cloud Console Open Karein
```
URL: https://console.cloud.google.com/
```

### Step 2: Service Accounts Page
```
Left Sidebar → IAM & Admin → Service Accounts
Ya direct: https://console.cloud.google.com/iam-admin/serviceaccounts
```

### Step 3: Service Account Select Karein
```
List mein dhundho: indiaholidays@indiaholidays-485609.iam.gserviceaccount.com
Ya agar nahi hai to:
  → + CREATE SERVICE ACCOUNT button click karo
  → Name: ga4-analytics-service
  → CREATE AND CONTINUE
  → Role: Viewer
  → DONE
```

### Step 4: Keys Tab Mein Jao
```
Service account par click karo
Top menu mein "KEYS" tab click karo
```

### Step 5: Key Create Karein
```
→ ADD KEY button click karo
→ "Create new key" select karo
→ "JSON" format choose karo (default)
→ CREATE button click karo
→ File automatically download ho jayegi
```

### Step 6: File Save Karein
```
Downloaded file ko rename karo: ga4-service-account.json
File ko move karo: D:\Api_indiaholiday_nodejs\config\ga4-service-account.json
```

## File Structure After Download

```
D:\Api_indiaholiday_nodejs\
├── config\
│   ├── .gitkeep
│   ├── validateEnv.js
│   └── ga4-service-account.json  ← YAHAN FILE HONI CHAHIYE
├── .env
├── index.js
└── ...
```

## Verify File

File download ke baad verify karo:
```bash
node test-ga4-connection.js
```

Expected output:
```
✅ File exists: Yes
✅ File is valid JSON: Yes
✅ GA4 Connection: connected
```

## Common Issues

### Issue 1: File Download Nahi Ho Rahi
**Solution:**
- Browser ke download settings check karo
- Download folder manually check karo
- Try: Right-click → Save As

### Issue 2: Service Account Dikhai Nahi De Raha
**Solution:**
- Ensure ki aap sahi project mein ho (indiaholidays-485609)
- Service account create karo (agar nahi hai)
- Page refresh karo

### Issue 3: Permission Denied Error
**Solution:**
- GA4 property mein service account ko Viewer access dein
- Google Analytics → Admin → Property Access Management
- Service account email add karo: indiaholidays@indiaholidays-485609.iam.gserviceaccount.com
- Role: Viewer

## Quick Test Commands

```bash
# Check if file exists
Test-Path "config\ga4-service-account.json"

# Test GA4 connection
node test-ga4-connection.js

# Start server
npm start

# Health check
curl http://localhost:3000/health
```
