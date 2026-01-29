# GA4 Permission Setup - Step by Step

## Current Status
✅ Service account key file downloaded  
✅ File is valid  
❌ **Permission denied** - Service account ko GA4 property mein access nahi hai

## Solution: GA4 Property Mein Access Dein

### Step 1: Google Analytics Kholo
```
URL: https://analytics.google.com/
```

### Step 2: Property Select Karo
- Left sidebar se apna GA4 property select karo
- Property ID: **521715358**

### Step 3: Admin Section Mein Jao
- Bottom left corner mein **Admin** (⚙️ icon) click karo
- Ya direct: Property Settings → Property Access Management

### Step 4: Property Access Management
- **Property** column mein (middle column)
- **Property Access Management** option click karo

### Step 5: Add Service Account
- **+** button click karo (top right)
- Ya **Add users** button click karo

### Step 6: Service Account Email Add Karo
- **Email addresses** field mein yeh email add karo:
  ```
  indiaholidays@indiaholidays-485609.iam.gserviceaccount.com
  ```

### Step 7: Role Select Karo
- **Role** dropdown se **Viewer** select karo
- (Ya **Viewer** role select karo)

### Step 8: Add Button Click Karo
- **Add** button click karo
- Service account ab list mein dikhna chahiye

### Step 9: Verify
- Service account list mein dikhna chahiye
- Role: **Viewer** hona chahiye

## After Adding Access

### Test Connection Again:
```bash
node test-ga4-connection.js
```

### Expected Output:
```
✅ Connection Result:
   Status: connected
   Property ID: 521715358
   Message: GA4 connection successful
```

## Alternative: Account Access Management

Agar Property Access Management nahi dikh raha:
1. **Admin** → **Account Access Management**
2. Service account ko account level pe access dein
3. Phir property level pe bhi access dein

## Troubleshooting

### Issue: "Add users" button nahi dikh raha
- Ensure ki aap property owner/admin ho
- Check karo ki aap sahi property mein ho

### Issue: Service account email accept nahi ho raha
- Email exactly copy karo: `indiaholidays@indiaholidays-485609.iam.gserviceaccount.com`
- No spaces, no typos

### Issue: Still permission denied
- Wait 1-2 minutes (permissions propagate hone mein time lagta hai)
- Server restart karo
- Test script phir se run karo

## Quick Checklist

- [ ] Google Analytics khola
- [ ] Property select ki (521715358)
- [ ] Admin → Property Access Management
- [ ] Service account email add ki
- [ ] Viewer role select ki
- [ ] Add button click kiya
- [ ] Test script run kiya
- [ ] Connection successful!

## Test Commands

```bash
# Test GA4 connection
node test-ga4-connection.js

# Start server
npm start

# Health check
curl http://localhost:3000/health
```
