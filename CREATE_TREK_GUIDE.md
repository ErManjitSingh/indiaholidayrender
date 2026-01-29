# How to Create a Trek

## API Working! ✅

Your API is now working correctly. The empty `data: []` response means no treks have been created yet.

## Create Your First Trek

### Method 1: Using PowerShell

```powershell
$body = @{
    packageInfo = @{
        title = "Triund Trek"
        description = "A beautiful trek in Himachal Pradesh"
        duration = "2D/1N"
        price = 2500
        currency = "INR"
        startLocation = "McLeod Ganj"
        endLocation = "Triund"
        difficulty = "Moderate"
    }
    content = @{
        aboutContent = "Triund Trek is one of the most popular treks..."
    }
    keywordSettings = @{
        location = "Himachal"
        name = "Triund Trek"
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri http://localhost:3000/api/treks `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer admin-token"} `
    -Body $body
```

### Method 2: Using curl (if available)

```bash
curl -X POST http://localhost:3000/api/treks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d @examples/create-trek-example.json
```

### Method 3: Using Browser Extension (Postman/Thunder Client)

1. Method: `POST`
2. URL: `http://localhost:3000/api/treks`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer admin-token`
4. Body: Use the JSON from `examples/create-trek-example.json`

### Method 4: Using Node.js Script

```javascript
const fetch = require('node-fetch'); // or use built-in fetch in Node 18+

const trekData = {
  packageInfo: {
    title: "Triund Trek",
    description: "A beautiful trek in Himachal Pradesh",
    duration: "2D/1N",
    price: 2500,
    currency: "INR",
    startLocation: "McLeod Ganj",
    endLocation: "Triund",
    difficulty: "Moderate"
  },
  content: {
    aboutContent: "Triund Trek is one of the most popular treks..."
  },
  keywordSettings: {
    location: "Himachal",
    name: "Triund Trek"
  }
};

fetch('http://localhost:3000/api/treks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-token'
  },
  body: JSON.stringify(trekData)
})
.then(res => res.json())
.then(data => console.log(data));
```

## Minimum Required Fields

To create a trek, you need at minimum:

```json
{
  "packageInfo": {
    "title": "Trek Name",
    "description": "Short description",
    "duration": "2D/1N",
    "price": 2500,
    "startLocation": "Start Point",
    "endLocation": "End Point"
  },
  "content": {
    "aboutContent": "Long description"
  },
  "keywordSettings": {
    "location": "Himachal",
    "name": "Trek Name"
  }
}
```

## After Creating Trek

### Get All Treks
```
GET http://localhost:3000/api/treks
```

### Get Specific Trek
```
GET http://localhost:3000/api/treks/:id
```
or
```
GET http://localhost:3000/api/treks/triund-trek
```

### Update Trek
```
PUT http://localhost:3000/api/treks/:id
```

### Get SEO Report
```
GET http://localhost:3000/api/treks/:id/seo-report
```

### Get Schema Preview
```
GET http://localhost:3000/api/treks/:id/schema-preview
```

## Example Response After Creation

```json
{
  "success": true,
  "message": "Trek created successfully",
  "data": {
    "_id": "...",
    "packageInfo": {
      "title": "Triund Trek",
      "slug": "triund-trek",
      ...
    },
    ...
  }
}
```

## Next Steps

1. ✅ API is working
2. ✅ Create your first trek
3. ✅ Test all endpoints
4. ✅ Build your admin panel
5. ✅ Integrate with frontend

## Need Help?

- Check `README_TREK_API.md` for complete API documentation
- Check `examples/create-trek-example.json` for full example
- All endpoints are documented in the README
