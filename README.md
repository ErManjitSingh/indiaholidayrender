# India Holiday API - Node.js Backend

## Features

- ✅ MongoDB Integration
- ✅ GA4 (Google Analytics 4) Integration
- ✅ Admin Panel Analytics APIs
- ✅ Express.js REST API
- ✅ Environment-based Configuration

## Installation

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `@google-analytics/data` - GA4 Data API
- `google-auth-library` - Google authentication
- `jsonwebtoken` - JWT authentication
- `express-rate-limit` - Rate limiting
- `cors` - CORS middleware
- `dotenv` - Environment variables

### 2. Environment Configuration

Copy `.env` file and ensure all variables are set:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000

# GA4 Configuration
GA4_PROPERTY_ID=521715358
GA4_SERVICE_ACCOUNT_EMAIL=indiaholidays@indiaholidays-485609.iam.gserviceaccount.com
GA4_CLIENT_ID=your_client_id
GA4_CLIENT_SECRET=your_client_secret
GA4_SERVICE_ACCOUNT_KEY_PATH=./config/ga4-service-account.json

# Security
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production
```

### 3. GA4 Service Account Setup

**Option 1: Service Account Key File (Recommended)**
1. Download service account JSON key from Google Cloud Console
2. Save it as `config/ga4-service-account.json`
3. Grant Viewer access to GA4 property

**Option 2: OAuth2 Credentials**
- Use `GA4_CLIENT_ID` and `GA4_CLIENT_SECRET` in `.env`

### 4. Start Server

```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Overall health check
- `GET /api/ga4/health` - GA4 connection test (Admin only)

### Analytics APIs (Admin Only)

All GA4 endpoints require admin authentication header:
```
Authorization: Bearer <admin-token>
```
or
```
X-Admin-Token: <admin-token>
```

#### Overview Metrics
```
GET /api/ga4/overview?dateRange=7daysAgo
```

#### Top Pages
```
GET /api/ga4/top-pages?dateRange=7daysAgo&limit=10
```

#### Traffic Sources
```
GET /api/ga4/traffic-sources?dateRange=7daysAgo&limit=10
```

#### Custom Analytics
```
POST /api/ga4/analytics
Body: {
  "startDate": "7daysAgo",
  "endDate": "today",
  "dimensions": ["pagePath"],
  "metrics": ["activeUsers", "sessions"]
}
```

#### Filtered Data
```
POST /api/ga4/filtered
Body: {
  "dateRange": "7daysAgo",
  "pagePath": "/holidays",
  "source": "google",
  "medium": "organic"
}
```

## Date Range Options

- `today` - Today's data
- `yesterday` - Yesterday's data
- `7daysAgo` - Last 7 days
- `30daysAgo` - Last 30 days
- `90daysAgo` - Last 90 days
- Custom: `YYYY-MM-DD` format

## Security

- All GA4 endpoints are protected with admin authentication
- Rate limiting enabled (100 requests/minute per IP)
- Environment variables validated at startup
- Fail-fast on missing configuration

## Project Structure

```
Api_indiaholiday_nodejs/
├── config/
│   └── validateEnv.js          # Environment validation
├── middleware/
│   └── auth.js                 # Authentication middleware
├── routes/
│   └── ga4Routes.js            # GA4 API routes
├── services/
│   └── ga4Service.js           # GA4 service layer
├── .env                        # Environment variables
├── index.js                    # Main server file
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
- Check MongoDB Atlas Network Access (IP whitelist)
- Verify connection string in `.env`
- Ensure cluster is running

### GA4 Connection Issues
- Verify Property ID is correct
- Check service account has Viewer access
- Ensure service account key file exists (if using file auth)
- Check OAuth2 credentials (if using OAuth)

### Permission Denied
- Grant Viewer access to service account in GA4
- Verify property ID is accessible

## Development Notes

- Server validates all GA4 config at startup
- MongoDB connection is required for full functionality
- GA4 endpoints work independently of MongoDB
- All analytics data is normalized for frontend consumption
