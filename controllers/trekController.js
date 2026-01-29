/**
 * Trek Controller
 * Handles all Trek-related business logic
 */

const Trek = require('../models/Trek');
const { generateSlug } = require('../utils/helpers');

/**
 * Get all treks with filters and pagination
 */
exports.getAllTreks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      location,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Filters
    if (status) query.status = status;
    if (location) query['keywordSettings.location'] = location;
    if (difficulty) query['packageInfo.difficulty'] = difficulty;
    if (search) {
      query.$or = [
        { 'packageInfo.title': { $regex: search, $options: 'i' } },
        { 'content.aboutContent': { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const treks = await Trek.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-schemaPreview.jsonLd -optimizer.blocks')
      .lean();

    const total = await Trek.countDocuments(query);

    res.json({
      success: true,
      data: treks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch treks',
        details: error.message,
      },
    });
  }
};

/**
 * Get single trek by ID or slug
 */
exports.getTrekById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeSchema = false } = req.query;

    const trek = await Trek.findOne({
      $or: [{ _id: id }, { 'packageInfo.slug': id }],
    });

    if (!trek) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trek not found',
        },
      });
    }

    const trekData = trek.toObject();

    // Generate schema if requested
    if (includeSchema && trek.schemaSettings.schemaEnabled) {
      trekData.schemaJsonLd = trek.generateSchemaJsonLd();
    }

    res.json({
      success: true,
      data: trekData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch trek',
        details: error.message,
      },
    });
  }
};

/**
 * Create new trek
 */
exports.createTrek = async (req, res) => {
  try {
    const trekData = req.body;

    // Generate slug if not provided
    if (!trekData.packageInfo?.slug && trekData.packageInfo?.title) {
      trekData.packageInfo.slug = generateSlug(trekData.packageInfo.title);
    }

    // Set default values
    if (!trekData.status) trekData.status = 'draft';
    if (!trekData.schemaSettings) {
      trekData.schemaSettings = {
        schemaType: 'Trek',
        schemaEnabled: true,
        autoJsonEnabled: true,
      };
    }

    const trek = new Trek(trekData);
    await trek.save();

    // Generate schema preview
    if (trek.schemaSettings.autoJsonEnabled) {
      trek.schemaPreview.jsonLd = trek.generateSchemaJsonLd();
      trek.schemaPreview.lastGenerated = new Date();
      await trek.save();
    }

    res.status(201).json({
      success: true,
      message: 'Trek created successfully',
      data: trek,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_SLUG',
          message: 'Trek with this slug already exists',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create trek',
        details: error.message,
      },
    });
  }
};

/**
 * Update trek
 */
exports.updateTrek = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const trek = await Trek.findById(id);
    if (!trek) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trek not found',
        },
      });
    }

    // Update slug if title changed
    if (updateData.packageInfo?.title && !updateData.packageInfo?.slug) {
      updateData.packageInfo.slug = generateSlug(updateData.packageInfo.title);
    }

    // Regenerate schema if content changed
    const shouldRegenerateSchema =
      updateData.content ||
      updateData.packageInfo ||
      updateData.schemaSettings;

    Object.assign(trek, updateData);
    await trek.save();

    // Regenerate schema preview
    if (shouldRegenerateSchema && trek.schemaSettings.autoJsonEnabled) {
      trek.schemaPreview.jsonLd = trek.generateSchemaJsonLd();
      trek.schemaPreview.lastGenerated = new Date();
      await trek.save();
    }

    res.json({
      success: true,
      message: 'Trek updated successfully',
      data: trek,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update trek',
        details: error.message,
      },
    });
  }
};

/**
 * Delete trek
 */
exports.deleteTrek = async (req, res) => {
  try {
    const { id } = req.params;

    const trek = await Trek.findByIdAndDelete(id);
    if (!trek) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trek not found',
        },
      });
    }

    res.json({
      success: true,
      message: 'Trek deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete trek',
        details: error.message,
      },
    });
  }
};

/**
 * Update specific section of trek
 */
exports.updateTrekSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { section, data } = req.body;

    const validSections = [
      'schemaSettings',
      'packageInfo',
      'content',
      'seoSettings',
      'keywordSettings',
      'faqSettings',
      'internalLinks',
      'optimizer',
      'metaSettings',
      'reports',
      'formState',
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SECTION',
          message: `Invalid section. Valid sections: ${validSections.join(', ')}`,
        },
      });
    }

    const trek = await Trek.findById(id);
    if (!trek) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trek not found',
        },
      });
    }

    trek[section] = { ...trek[section].toObject(), ...data };
    await trek.save();

    res.json({
      success: true,
      message: `${section} updated successfully`,
      data: trek[section],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update trek section',
        details: error.message,
      },
    });
  }
};

/**
 * Get schema preview
 */
exports.getSchemaPreview = async (req, res) => {
  try {
    const { id } = req.params;

    const trek = await Trek.findById(id);
    if (!trek) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trek not found',
        },
      });
    }

    const jsonLd = trek.generateSchemaJsonLd();

    res.json({
      success: true,
      data: {
        jsonLd,
        html: `<script type="application/ld+json">${jsonLd}</script>`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SCHEMA_ERROR',
        message: 'Failed to generate schema',
        details: error.message,
      },
    });
  }
};

/**
 * Generate SEO report
 */
exports.generateSEOReport = async (req, res) => {
  try {
    const { id } = req.params;

    const trek = await Trek.findById(id);
    if (!trek) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Trek not found',
        },
      });
    }

    const issues = [];
    let score = 100;

    // Check title
    if (!trek.packageInfo.title || trek.packageInfo.title.length < 30) {
      issues.push({
        type: 'title',
        message: 'Title should be at least 30 characters',
        severity: 'high',
        fixable: true,
      });
      score -= 10;
    }

    // Check description
    if (!trek.packageInfo.description || trek.packageInfo.description.length < 120) {
      issues.push({
        type: 'description',
        message: 'Description should be at least 120 characters',
        severity: 'medium',
        fixable: true,
      });
      score -= 10;
    }

    // Check focus keyword
    if (!trek.seoSettings.focusKeyword) {
      issues.push({
        type: 'keyword',
        message: 'Focus keyword not set',
        severity: 'high',
        fixable: true,
      });
      score -= 15;
    }

    // Check images
    if (trek.seoSettings.imageCount === 0) {
      issues.push({
        type: 'images',
        message: 'No images found',
        severity: 'medium',
        fixable: true,
      });
      score -= 10;
    }

    // Check alt text coverage
    if (trek.seoSettings.altCoverage < 80) {
      issues.push({
        type: 'altText',
        message: `Only ${trek.seoSettings.altCoverage}% images have alt text`,
        severity: 'medium',
        fixable: true,
      });
      score -= 10;
    }

    // Check internal links
    if (trek.seoSettings.internalLinks < 3) {
      issues.push({
        type: 'internalLinks',
        message: 'Add more internal links (minimum 3)',
        severity: 'low',
        fixable: true,
      });
      score -= 5;
    }

    // Check FAQs
    if (trek.content.faqs.length === 0) {
      issues.push({
        type: 'faqs',
        message: 'No FAQs found',
        severity: 'low',
        fixable: true,
      });
      score -= 5;
    }

    trek.reports.seoReport = {
      score: Math.max(0, score),
      issues,
      lastGenerated: new Date(),
    };

    await trek.save();

    res.json({
      success: true,
      data: trek.reports.seoReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: 'Failed to generate SEO report',
        details: error.message,
      },
    });
  }
};

/**
 * Bulk operations
 */
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'IDs array is required',
        },
      });
    }

    const result = await Trek.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} treks updated`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'BULK_UPDATE_ERROR',
        message: 'Failed to bulk update treks',
        details: error.message,
      },
    });
  }
};
