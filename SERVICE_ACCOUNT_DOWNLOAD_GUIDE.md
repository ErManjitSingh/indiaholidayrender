# Service Account Key File Download Guide

## Step-by-Step Instructions

### Step 1: Google Cloud Console Mein Login Karein

1. Browser kholo aur jao: https://console.cloud.google.com/
2. Apne Google account se login karo
3. Ensure ki aap **indiaholidays-485609** project mein ho

### Step 2: Service Accounts Section Mein Jao

1. Left sidebar se **IAM & Admin** click karo
2. **Service Accounts** option select karo
3. Ab aapko service accounts ki list dikhegi

### Step 3: Apna Service Account Dhundho

1. List mein dhundho: **indiaholidays@indiaholidays-485609.iam.gserviceaccount.com**
2. Agar nahi dikh raha, to:
   - **+ CREATE SERVICE ACCOUNT** button click karo
   - Name: `ga4-analytics-service`
   - Click **CREATE AND CONTINUE**
   - Role: **Viewer** ya **Analytics Viewer** select karo
   - Click **CONTINUE** → **DONE**

### Step 4: Service Account Key File Download Karein

1. Service account par click karo (jo aapne abhi create kiya ya jo pehle se hai)
2. **KEYS** tab par jao (top menu mein)
3. **ADD KEY** button click karo
4. **Create new key** select karo
5. **JSON** format choose karo (default hi JSON hota hai)
6. **CREATE** click karo
7. File automatically download ho jayegi

### Step 5: File Ko Project Mein Save Karein

1. Downloaded file ka naam kuch aisa hoga:
   - `indiaholidays-485609-xxxxx-xxxxx.json`
   - Ya koi random name

2. File ko rename karo:
   ```
   ga4-service-account.json
   ```

3. File ko project folder mein move karo:
   ```
   D:\Api_indiaholiday_nodejs\config\ga4-service-account.json
   ```

4. Ensure ki `config` folder exist karta hai:
   ```bash
   # Agar folder nahi hai, create karo:
   mkdir config
   ```

### Step 6: GA4 Property Mein Access Dein

1. [Google Analytics](https://analytics.google.com/) kholo
2. Apna GA4 property select karo (Property ID: 521715358)
3. Left sidebar se **Admin** (⚙️ icon) click karo
4. **Property Access Management** par jao
5. **+** button click karo → **Add users**
6. Service account email add karo:
   ```
   indiaholidays@indiaholidays-485609.iam.gserviceaccount.com
   ```
7. Role select karo: **Viewer**
8. **Add** click karo

### Step 7: Verify Karein

1. Server restart karo:
   ```bash
   npm start
   ```

2. Health check karo:
   ```bash
   curl http://localhost:3000/health
   ```

3. Expected response:
   ```json
   {
     "services": {
       "ga4": {
         "status": "connected",
         "propertyId": "521715358"
       }
     }
   }
   ```

## Alternative: Agar Service Account Already Hai

Agar service account pehle se exist karta hai:

1. Google Cloud Console → **IAM & Admin** → **Service Accounts**
2. Service account par click karo
3. **KEYS** tab
4. **ADD KEY** → **Create new key** → **JSON**
5. Download karo aur save karo as `config/ga4-service-account.json`

## File Structure After Setup

```
D:\Api_indiaholiday_nodejs\
├── config\
│   └── ga4-service-account.json  ← Yahan file honi chahiye
├── .env
├── index.js
└── ...
```

## Troubleshooting

### File Download Nahi Ho Rahi?
- Browser ke download folder check karo
- Browser ke download settings check karo
- Try karo: Right-click → Save As

### Service Account Dikhai Nahi De Raha?
- Ensure ki aap sahi project mein ho
- Check karo ki service account create ho gaya hai
- Refresh karo page

### Permission Denied Error?
- GA4 property mein service account ko Viewer role dein
- Property ID verify karo (521715358)

## Important Notes

⚠️ **Security Warning:**
- Service account key file **bahut sensitive** hai
- Is file ko **kabhi bhi share mat karo**
- File already `.gitignore` mein hai (Git commit nahi hogi)
- Agar file leak ho jaye, immediately Google Cloud Console se delete karo

✅ **File Safe Hai:**
- Local development ke liye use karo
- Production mein bhi use kar sakte ho
- Bas ensure karo ki file secure location mein hai

## Quick Checklist

- [ ] Google Cloud Console se login
- [ ] Service account create/select kiya
- [ ] JSON key file download ki
- [ ] File ko `config/ga4-service-account.json` save kiya
- [ ] GA4 property mein Viewer access diya
- [ ] Server restart kiya
- [ ] Health check pass ho gaya

## Video Tutorial Links (Optional)

Agar visual guide chahiye:
- Google Cloud Service Accounts: https://cloud.google.com/iam/docs/service-accounts
- GA4 API Setup: https://developers.google.com/analytics/devguides/reporting/data/v1
