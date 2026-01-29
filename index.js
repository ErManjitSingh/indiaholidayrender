// Main entry point for the API
const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { validateGA4Config } = require('./config/validateEnv');
const ga4Routes = require('./routes/ga4Routes');
const authRoutes = require('./routes/authRoutes');
const trekRoutes = require('./routes/trekRoutes');
const trekController = require('./controllers/trekController');
const ga4Service = require('./services/ga4Service');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Ensure .env exists in the same folder as index.js and contains MONGODB_URI=...');
  process.exit(1);
}

// Validate GA4 configuration at startup (fail fast)
console.log('🔍 Validating environment configuration...');
try {
  validateGA4Config();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`   Query:`, req.query);
  console.log(`   Params:`, req.params);
  next();
});

function getMongoStatus() {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return states[mongoose.connection.readyState] || 'unknown';
}

// MongoDB connection event listeners
let serverStarted = false;

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

let reconnectTimeout = null;
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected – will try to reconnect in 2s');
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;
    if (mongoose.connection.readyState !== 0) return; // already connecting/connected
    try {
      console.log('🔄 Reconnecting to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB reconnected');
    } catch (e) {
      console.error('❌ MongoDB reconnect failed:', e.message);
    }
  }, 2000);
});

// Routes
app.get('/', (req, res) => {
  const state = mongoose.connection.readyState;
  console.log('   MongoDB readyState at request:', state, state === 1 ? '(connected)' : '(not connected)');
  res.json({
    message: 'Welcome to India Holiday API',
    status: 'Server is running',
    mongodb: getMongoStatus(),
    mongodbConnected: state === 1,
    ga4Configured: !!process.env.GA4_PROPERTY_ID,
    timestamp: new Date().toISOString(),
  });
});

// Auth (login, JWT)
app.use('/api/auth', authRoutes);

// GA4 Routes (Admin only)
app.use('/api/ga4', ga4Routes);

// Trek Routes – explicit GET /api/treks first (so list always works), then router for rest
app.get('/api/treks', trekController.getAllTreks);
app.use('/api/treks', trekRoutes);

// Debug: List all routes (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/routes', (req, res) => {
    const routes = [];
    trekRoutes.stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({
          path: `/api/treks${middleware.route.path}`,
          methods: Object.keys(middleware.route.methods),
        });
      }
    });
    res.json({
      success: true,
      message: 'Registered routes',
      routes,
      total: routes.length,
    });
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  console.log('   MongoDB readyState at request:', state, state === 1 ? '(connected)' : '(not connected)');
  const mongoStatus = getMongoStatus();
  const mongoConnected = state === 1;
  
  let ga4Status = 'not_configured';
  let ga4Details = null;
  
  try {
    if (process.env.GA4_PROPERTY_ID) {
      const health = await ga4Service.healthCheck();
      ga4Status = health.status;
      ga4Details = {
        propertyId: health.propertyId,
        message: health.message,
        errorType: health.errorType,
        details: health.details,
      };
    }
  } catch (error) {
    ga4Status = 'error';
    ga4Details = {
      error: error.message,
      message: 'GA4 health check failed. See QUICK_SETUP_GA4.md for setup instructions.',
    };
  }

  res.json({
    status: 'ok',
    serverPid: process.pid,
    services: {
      mongodb: {
        status: mongoStatus,
        connected: mongoConnected,
      },
      ga4: {
        status: ga4Status,
        ...ga4Details,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler (include path so we can see what URL was requested)
app.use((req, res) => {
  console.log('   404 for:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
  });
});

// Wait for mongoose connection to be ready (state 1)
function waitForConnected(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) return resolve();
    const deadline = Date.now() + timeoutMs;
    const t = setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(t);
        resolve();
      } else if (Date.now() >= deadline) {
        clearInterval(t);
        reject(new Error(`MongoDB readyState did not become 1 within ${timeoutMs}ms (current: ${mongoose.connection.readyState})`));
      }
    }, 100);
  });
}

// Connect to MongoDB with retries
async function connectMongo(maxRetries = 3) {
  const options = { serverSelectionTimeoutMS: 15000, socketTimeoutMS: 45000 };
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        await mongoose.disconnect().catch(() => {});
        await new Promise((r) => setTimeout(r, 500));
      }
      console.log(`🔄 Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      console.log('Connection URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
      await mongoose.connect(MONGODB_URI, options);
      await waitForConnected(5000);
      console.log('✅ MongoDB readyState after connect:', mongoose.connection.readyState);
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err.message);
      if (err.cause) console.error('   Cause:', err.cause.message || err.cause);
      if (err.code) console.error('   Code:', err.code);
      if (attempt < maxRetries) {
        console.log(`   Retrying in 2 seconds...`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  }
}

// Connect to MongoDB and initialize GA4
const startServer = async () => {
  try {
    await connectMongo();

    // Initialize GA4 Service
    console.log('🔄 Initializing GA4 Service...');
    try {
      await ga4Service.initialize();
    } catch (ga4Error) {
      console.warn('⚠️ GA4 Service initialization failed:', ga4Error.message);
      console.warn('   GA4 endpoints may not work until configured properly');
    }

    // Start server
    if (!serverStarted) {
      serverStarted = true;
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT} (PID: ${process.pid})`);
        console.log(`📊 MongoDB Status: ${getMongoStatus()}`);
        console.log(`📊 GA4 Property ID: ${process.env.GA4_PROPERTY_ID || 'Not configured'}`);
        console.log('\n📋 Available endpoints:');
        console.log(`   GET  / - API status`);
        console.log(`   GET  /health - Health check`);
        console.log(`\n📊 GA4 Endpoints:`);
        console.log(`   GET  /api/ga4/health - GA4 connection test`);
        console.log(`   GET  /api/ga4/overview - Overview metrics`);
        console.log(`   GET  /api/ga4/top-pages - Top pages`);
        console.log(`   GET  /api/ga4/traffic-sources - Traffic sources`);
        console.log(`   POST /api/ga4/analytics - Custom analytics`);
        console.log(`   POST /api/ga4/filtered - Filtered analytics`);
        console.log(`\n🏔️  Trek Endpoints:`);
        console.log(`   GET    /api/treks - Get all treks`);
        console.log(`   GET    /api/treks/:id - Get trek by ID/slug`);
        console.log(`   POST   /api/treks - Create trek (Admin)`);
        console.log(`   PUT    /api/treks/:id - Update trek (Admin)`);
        console.log(`   DELETE /api/treks/:id - Delete trek (Admin)`);
        console.log(`   PATCH  /api/treks/:id/section - Update section (Admin)`);
        console.log(`   GET    /api/treks/:id/schema-preview - Schema preview (Admin)`);
        console.log(`   GET    /api/treks/:id/seo-report - SEO report (Admin)`);
        console.log(`   POST   /api/treks/bulk-update - Bulk update (Admin)`);
      });
    }
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    if (err.name) console.error('   Error name:', err.name);
    if (err.code) console.error('   Error code:', err.code);
    if (err.cause) console.error('   Cause:', err.cause?.message || err.cause);
    console.error('   Full error:', err);
    
    // Still need 404 and error handlers when DB fails (trek routes won't be added)
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Route not found' },
      });
    });
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        success: false,
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
      });
    });

    // Start server even if DB connection fails
    if (!serverStarted) {
      serverStarted = true;
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT} (with errors, PID: ${process.pid})`);
        console.log(`📊 MongoDB Status: ${getMongoStatus()}`);
      });
    }
  }
};

// Start the application
startServer();
