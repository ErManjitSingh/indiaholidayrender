# Quick Fix - Route Not Found Error

## Issue
Getting `{"success":false,"error":{"code":"NOT_FOUND","message":"Route not found"}}`

## Solutions

### 1. Server Restart (Most Common Fix)

```bash
# Stop all Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Start server
npm start
```

### 2. Check Server is Running

```bash
# Test root endpoint
curl http://localhost:3000/

# Should return:
# {"message":"Welcome to India Holiday API",...}
```

### 3. Check Exact URL

Make sure you're using the correct endpoint:

✅ **Correct URLs:**
- `GET http://localhost:3000/api/treks`
- `GET http://localhost:3000/api/treks/:id`
- `GET http://localhost:3000/health`

❌ **Wrong URLs:**
- `http://localhost:3000/treks` (missing `/api`)
- `http://localhost:3000/api/trek` (wrong - should be `treks`)

### 4. Debug Routes

After server starts, check registered routes:

```bash
GET http://localhost:3000/debug/routes
```

This will show all registered routes.

### 5. Check Console Logs

When you make a request, check server console. You should see:
```
2026-01-28T... - GET /api/treks
```

If you don't see this, the request isn't reaching the server.

### 6. Test with Browser

1. Open browser
2. Go to: `http://localhost:3000/api/treks`
3. Should see JSON response

### 7. Test with PowerShell

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/treks -UseBasicParsing | Select-Object -ExpandProperty Content
```

## Common Issues

### Issue: Server not running
**Solution:** Run `npm start`

### Issue: Wrong port
**Solution:** Check `.env` file - `PORT=3000`

### Issue: MongoDB not connected
**Solution:** Check MongoDB connection in console logs

### Issue: Routes not loading
**Solution:** Check for syntax errors:
```bash
node -c routes/trekRoutes.js
node -c controllers/trekController.js
```

## Expected Response

When you hit `GET /api/treks`, you should get:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

## Still Not Working?

1. Share the exact URL you're trying to access
2. Share server console logs
3. Share the response you're getting
4. Check if server is actually running on port 3000
