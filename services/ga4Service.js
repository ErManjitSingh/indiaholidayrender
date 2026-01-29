/**
 * GA4 Service Layer
 * Handles all Google Analytics 4 Data API interactions
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

class GA4Service {
  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID;
    this.serviceAccountEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL;
    this.clientId = process.env.GA4_CLIENT_ID;
    this.clientSecret = process.env.GA4_CLIENT_SECRET;
    this.keyPath = process.env.GA4_SERVICE_ACCOUNT_KEY_PATH;
    
    this.analyticsClient = null;
    this.isInitialized = false;
  }

  /**
   * Initialize GA4 client with service account authentication
   */
  async initialize() {
    try {
      // Priority 1: Service account key file (recommended)
      if (this.keyPath && fs.existsSync(path.resolve(this.keyPath))) {
        console.log('📁 Using service account key file for authentication');
        this.analyticsClient = new BetaAnalyticsDataClient({
          keyFilename: path.resolve(this.keyPath),
        });
      } 
      // Priority 2: GOOGLE_APPLICATION_CREDENTIALS environment variable
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        console.log('📁 Using GOOGLE_APPLICATION_CREDENTIALS for authentication');
        this.analyticsClient = new BetaAnalyticsDataClient();
      }
      // Priority 3: Try application default credentials
      else {
        console.log('⚠️ No service account key file found. Trying application default credentials...');
        console.log('💡 For production, please set up service account key file:');
        console.log('   1. Download JSON key from Google Cloud Console');
        console.log('   2. Save as config/ga4-service-account.json');
        console.log('   3. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable');
        
        // Try to use application default credentials
        // This will work if running on GCP or if user has run: gcloud auth application-default login
        this.analyticsClient = new BetaAnalyticsDataClient();
      }

      this.isInitialized = true;
      console.log('✅ GA4 Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ GA4 Service initialization failed:', error.message);
      console.error('📋 Setup instructions:');
      console.error('   1. Download service account JSON key from Google Cloud Console');
      console.error('   2. Save it as: config/ga4-service-account.json');
      console.error('   3. Grant Viewer access to GA4 property');
      console.error('   4. See SETUP_GA4.md for detailed instructions');
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Health check - Test GA4 connection and permissions
   */
  async healthCheck() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Try to fetch a simple report to test connection
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: 'yesterday',
            endDate: 'today',
          },
        ],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 1,
      });

      return {
        status: 'connected',
        propertyId: this.propertyId,
        message: 'GA4 connection successful',
        testData: response.rowCount > 0,
      };
    } catch (error) {
      let errorType = 'unknown';
      let message = error.message;
      let details = [];

      // Check for authentication errors
      if (error.message.includes('Could not load the default credentials') || 
          error.message.includes('Unable to detect a Project Id') ||
          error.message.includes('Could not automatically determine credentials')) {
        errorType = 'authentication_failed';
        message = 'Authentication failed. Service account key file required.';
        details.push('Download service account JSON key from Google Cloud Console');
        details.push('Save it as: config/ga4-service-account.json');
        details.push('Or set GOOGLE_APPLICATION_CREDENTIALS environment variable');
      } else if (error.message.includes('PERMISSION_DENIED') || error.code === 7) {
        errorType = 'permission_denied';
        message = 'Permission denied. Check service account has Viewer access to GA4 property.';
        details.push(`Service account: ${this.serviceAccountEmail}`);
        details.push('Grant Viewer role in GA4 Admin → Property Access Management');
      } else if (error.message.includes('NOT_FOUND') || error.code === 5) {
        errorType = 'property_not_found';
        message = `Property ID ${this.propertyId} not found or inaccessible.`;
        details.push('Verify Property ID in GA4 Admin → Property Settings');
        details.push('Ensure service account has access to this property');
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.code === 8) {
        errorType = 'quota_exceeded';
        message = 'GA4 API quota exceeded. Please try again later.';
      } else if (error.message.includes('UNAUTHENTICATED') || error.code === 16) {
        errorType = 'unauthenticated';
        message = 'Authentication required. Please set up service account key file.';
        details.push('See SETUP_GA4.md for instructions');
      }

      return {
        status: 'error',
        propertyId: this.propertyId,
        errorType,
        message,
        details: details.length > 0 ? details : undefined,
        originalError: error.message,
      };
    }
  }

  /**
   * Get analytics data with date range and filters
   */
  async getAnalyticsData(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      startDate = '7daysAgo',
      endDate = 'today',
      dimensions = [],
      metrics = ['activeUsers', 'sessions', 'screenPageViews'],
      dimensionFilter = null,
      limit = 10000,
    } = options;

    try {
      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: dimensions.map((dim) => ({ name: dim })),
        metrics: metrics.map((met) => ({ name: met })),
        limit,
      };

      // Add dimension filter if provided
      if (dimensionFilter) {
        request.dimensionFilter = dimensionFilter;
      }

      const [response] = await this.analyticsClient.runReport(request);

      return this.normalizeData(response, dimensions, metrics);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get overview metrics (Total users, Sessions, Page views)
   */
  async getOverviewMetrics(dateRange = '7daysAgo') {
    const endDate = dateRange === 'today' ? 'today' : 'today';
    const startDate = this.getStartDate(dateRange);

    return await this.getAnalyticsData({
      startDate,
      endDate,
      metrics: ['activeUsers', 'sessions', 'screenPageViews', 'averageSessionDuration'],
    });
  }

  /**
   * Get top pages
   */
  async getTopPages(dateRange = '7daysAgo', limit = 10) {
    const endDate = dateRange === 'today' ? 'today' : 'today';
    const startDate = this.getStartDate(dateRange);

    return await this.getAnalyticsData({
      startDate,
      endDate,
      dimensions: ['pagePath', 'pageTitle'],
      metrics: ['screenPageViews', 'activeUsers'],
      limit,
    });
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(dateRange = '7daysAgo', limit = 10) {
    const endDate = dateRange === 'today' ? 'today' : 'today';
    const startDate = this.getStartDate(dateRange);

    return await this.getAnalyticsData({
      startDate,
      endDate,
      dimensions: ['sessionSource', 'sessionMedium'],
      metrics: ['sessions', 'activeUsers'],
      limit,
    });
  }

  /**
   * Get data with custom filters
   */
  async getFilteredData(filters = {}) {
    const {
      dateRange = '7daysAgo',
      pagePath = null,
      landingPage = null,
      source = null,
      medium = null,
    } = filters;

    const endDate = dateRange === 'today' ? 'today' : 'today';
    const startDate = this.getStartDate(dateRange);

    const dimensionFilter = {
      andGroup: {
        expressions: [],
      },
    };

    // Add filters
    if (pagePath) {
      dimensionFilter.andGroup.expressions.push({
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: pagePath,
          },
        },
      });
    }

    if (landingPage) {
      dimensionFilter.andGroup.expressions.push({
        filter: {
          fieldName: 'landingPage',
          stringFilter: {
            matchType: 'CONTAINS',
            value: landingPage,
          },
        },
      });
    }

    if (source) {
      dimensionFilter.andGroup.expressions.push({
        filter: {
          fieldName: 'sessionSource',
          stringFilter: {
            matchType: 'EXACT',
            value: source,
          },
        },
      });
    }

    if (medium) {
      dimensionFilter.andGroup.expressions.push({
        filter: {
          fieldName: 'sessionMedium',
          stringFilter: {
            matchType: 'EXACT',
            value: medium,
          },
        },
      });
    }

    return await this.getAnalyticsData({
      startDate,
      endDate,
      dimensionFilter: dimensionFilter.andGroup.expressions.length > 0 ? dimensionFilter : null,
    });
  }

  /**
   * Normalize GA4 response to clean JSON format
   */
  normalizeData(response, dimensions, metrics) {
    const normalized = {
      rowCount: response.rowCount || 0,
      rows: [],
      totals: {},
    };

    // Extract totals
    if (response.totals && response.totals.length > 0) {
      response.totals[0].metricValues.forEach((metric, index) => {
        normalized.totals[metrics[index]] = {
          value: metric.value || '0',
        };
      });
    }

    // Normalize rows
    if (response.rows && response.rows.length > 0) {
      normalized.rows = response.rows.map((row) => {
        const normalizedRow = {};

        // Add dimensions
        row.dimensionValues.forEach((dim, index) => {
          normalizedRow[dimensions[index] || `dimension${index}`] = dim.value;
        });

        // Add metrics
        row.metricValues.forEach((met, index) => {
          normalizedRow[metrics[index]] = {
            value: met.value || '0',
          };
        });

        return normalizedRow;
      });
    }

    return normalized;
  }

  /**
   * Handle errors and return user-friendly messages
   */
  handleError(error) {
    const errorMap = {
      PERMISSION_DENIED: {
        code: 'PERMISSION_DENIED',
        message: 'Permission denied. Check service account has Viewer access to GA4 property.',
        statusCode: 403,
      },
      NOT_FOUND: {
        code: 'PROPERTY_NOT_FOUND',
        message: `GA4 Property ${this.propertyId} not found or inaccessible.`,
        statusCode: 404,
      },
      QUOTA_EXCEEDED: {
        code: 'QUOTA_EXCEEDED',
        message: 'GA4 API quota exceeded. Please try again later.',
        statusCode: 429,
      },
      INVALID_ARGUMENT: {
        code: 'INVALID_ARGUMENT',
        message: 'Invalid request parameters.',
        statusCode: 400,
      },
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        return {
          ...value,
          originalError: error.message,
        };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
      originalError: error.message,
      statusCode: 500,
    };
  }

  /**
   * Get start date based on date range string
   */
  getStartDate(dateRange) {
    const dateMap = {
      today: 'today',
      yesterday: 'yesterday',
      '7daysAgo': '7daysAgo',
      '30daysAgo': '30daysAgo',
      '90daysAgo': '90daysAgo',
    };

    return dateMap[dateRange] || dateRange;
  }
}

// Export singleton instance
module.exports = new GA4Service();
