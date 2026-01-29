/**
 * GA4 Admin Routes
 * Read-only analytics APIs for admin panel
 */

const express = require('express');
const router = express.Router();
const ga4Service = require('../services/ga4Service');
const { authenticateAdmin } = require('../middleware/auth');

/**
 * Health Check - Test GA4 connection
 * GET /api/ga4/health
 */
router.get('/health', authenticateAdmin, async (req, res) => {
  try {
    const health = await ga4Service.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    });
  }
});

/**
 * Get Overview Metrics
 * GET /api/ga4/overview?dateRange=7daysAgo
 */
router.get('/overview', authenticateAdmin, async (req, res) => {
  try {
    const { dateRange = '7daysAgo' } = req.query;
    const data = await ga4Service.getOverviewMetrics(dateRange);
    res.json({
      success: true,
      dateRange,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch overview metrics',
      },
    });
  }
});

/**
 * Get Top Pages
 * GET /api/ga4/top-pages?dateRange=7daysAgo&limit=10
 */
router.get('/top-pages', authenticateAdmin, async (req, res) => {
  try {
    const { dateRange = '7daysAgo', limit = 10 } = req.query;
    const data = await ga4Service.getTopPages(dateRange, parseInt(limit));
    res.json({
      success: true,
      dateRange,
      limit: parseInt(limit),
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch top pages',
      },
    });
  }
});

/**
 * Get Traffic Sources
 * GET /api/ga4/traffic-sources?dateRange=7daysAgo&limit=10
 */
router.get('/traffic-sources', authenticateAdmin, async (req, res) => {
  try {
    const { dateRange = '7daysAgo', limit = 10 } = req.query;
    const data = await ga4Service.getTrafficSources(dateRange, parseInt(limit));
    res.json({
      success: true,
      dateRange,
      limit: parseInt(limit),
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch traffic sources',
      },
    });
  }
});

/**
 * Get Custom Analytics Data
 * POST /api/ga4/analytics
 * Body: { startDate, endDate, dimensions, metrics, filters }
 */
router.post('/analytics', authenticateAdmin, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      dimensions = [],
      metrics = ['activeUsers', 'sessions', 'screenPageViews'],
      filters = {},
    } = req.body;

    let data;

    // If filters provided, use filtered query
    if (Object.keys(filters).length > 0) {
      data = await ga4Service.getFilteredData({
        dateRange: startDate ? null : '7daysAgo',
        ...filters,
      });
    } else {
      data = await ga4Service.getAnalyticsData({
        startDate: startDate || '7daysAgo',
        endDate: endDate || 'today',
        dimensions,
        metrics,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch analytics data',
      },
    });
  }
});

/**
 * Get Filtered Data
 * POST /api/ga4/filtered
 * Body: { dateRange, pagePath, landingPage, source, medium }
 */
router.post('/filtered', authenticateAdmin, async (req, res) => {
  try {
    const filters = req.body;
    const data = await ga4Service.getFilteredData(filters);
    res.json({
      success: true,
      filters,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch filtered data',
      },
    });
  }
});

module.exports = router;
