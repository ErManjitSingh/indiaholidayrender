/**
 * Test Routes - Debug script
 */

require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Import routes
const trekRoutes = require('./routes/trekRoutes');
const ga4Routes = require('./routes/ga4Routes');

// Register routes
app.use('/api/treks', trekRoutes);
app.use('/api/ga4', ga4Routes);

// List all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  // Get trek routes
  trekRoutes.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: `/api/treks${middleware.route.path}`,
        methods: Object.keys(middleware.route.methods),
      });
    }
  });
  
  // Get GA4 routes
  ga4Routes.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: `/api/ga4${middleware.route.path}`,
        methods: Object.keys(middleware.route.methods),
      });
    }
  });
  
  res.json({
    success: true,
    routes,
    total: routes.length,
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working',
    timestamp: new Date().toISOString(),
  });
});

const PORT = 3001; // Different port to avoid conflict
app.listen(PORT, () => {
  console.log(`\n🔍 Debug server running on http://localhost:${PORT}`);
  console.log(`\n📋 Test endpoints:`);
  console.log(`   GET http://localhost:${PORT}/test`);
  console.log(`   GET http://localhost:${PORT}/debug/routes`);
  console.log(`\n📋 Trek routes:`);
  console.log(`   GET http://localhost:${PORT}/api/treks`);
  console.log(`   GET http://localhost:${PORT}/api/treks/:id`);
});
