/**
 * Trek Model
 * Complete data structure for Trek pages with SEO, Schema, Analytics, and AI optimization
 */

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  activities: [String],
  meals: [String],
  accommodation: String,
});

const internalLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  anchorText: { type: String, required: true },
  type: { type: String, enum: ['trek', 'tour', 'blog'], default: 'trek' },
  order: { type: Number, default: 0 },
});

const optimizerBlockSchema = new mongoose.Schema({
  type: { type: String, enum: ['heading', 'paragraph', 'list'], required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const metaVariantSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ctr: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const trekSchema = new mongoose.Schema(
  {
    // 1. Schema Settings - Structured Data Control
    schemaSettings: {
      schemaType: {
        type: String,
        enum: ['Trek', 'Tour', 'Event', 'TravelPackage'],
        default: 'Trek',
      },
      schemaEnabled: { type: Boolean, default: true },
      autoJsonEnabled: { type: Boolean, default: true },
      includeFaqSchema: { type: Boolean, default: true },
      includeItinerarySchema: { type: Boolean, default: true },
      includeOffersSchema: { type: Boolean, default: true },
      includeRatingSchema: { type: Boolean, default: false },
      autoInjectHead: { type: Boolean, default: true },
      manualSchemaOverride: { type: String, default: '' },
    },

    // 2. Package Info - Trek Basic Identity
    packageInfo: {
      title: { type: String, required: true, index: true },
      slug: { type: String, required: true, unique: true, index: true },
      description: { type: String, required: true },
      imageUrl: { type: String },
      duration: { type: String, required: true }, // "2D/1N", "5D/4N"
      price: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      startLocation: { type: String, required: true },
      endLocation: { type: String, required: true },
      difficulty: {
        type: String,
        enum: ['Easy', 'Moderate', 'Hard', 'Very Hard'],
        default: 'Moderate',
      },
      maxAltitude: { type: Number }, // in meters
      groupSize: { type: Number },
      bestSeason: [String], // ["Summer", "Winter"]
    },

    // 3. Content - Core Trek Content
    content: {
      aboutContent: { type: String, required: true },
      highlights: [String],
      inclusions: [String],
      exclusions: [String],
      itinerary: [itineraryDaySchema],
      faqs: [faqSchema],
      tips: [String],
      thingsToCarry: [String],
    },

    // 4. SEO Settings - Per Trek SEO Control
    seoSettings: {
      focusKeyword: { type: String },
      canonicalUrl: { type: String },
      robots: { type: String, default: 'index, follow' },
      anchorText: { type: String },
      internalLinks: { type: Number, default: 0 },
      linkedToTrekTour: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trek' }],
      imageCount: { type: Number, default: 0 },
      altCoverage: { type: Number, default: 0 }, // percentage
      featuredImageAlt: { type: String },
      ctaText: { type: String, default: 'Book Now' },
      whatsapp: { type: Boolean, default: true },
      call: { type: Boolean, default: true },
      whatsappNumber: { type: String },
      callNumber: { type: String },
      previewed: { type: Boolean, default: false },
    },

    // 5. Keyword Settings - Auto Keyword Engine
    keywordSettings: {
      pageType: { type: String, default: 'trek' },
      location: { type: String, required: true }, // "Himachal", "Uttarakhand"
      name: { type: String, required: true },
      duration: { type: String },
      difficulty: { type: String },
      season: { type: String },
      sourceCity: { type: String },
      autoApply: { type: Boolean, default: true },
      keywords: [String],
    },

    // 6. FAQ Settings - Smart FAQ System
    faqSettings: {
      autoFaqSelection: [{ type: mongoose.Schema.Types.ObjectId }],
      autoFaqSuggestions: [
        {
          question: String,
          answer: String,
          score: Number,
          source: String,
        },
      ],
      manualFaqs: [faqSchema],
    },

    // 7. Internal Links - Auto Internal Link Engine
    internalLinks: {
      suggestions: [
        {
          url: String,
          anchorText: String,
          type: String,
          relevanceScore: Number,
        },
      ],
      overrides: [internalLinkSchema],
      activeLinks: [internalLinkSchema],
    },

    // 8. Optimizer - AI Content Optimizer
    optimizer: {
      paragraph: { type: String },
      touched: { type: Boolean, default: false },
      blocks: [optimizerBlockSchema],
      keywordDensity: { type: Number, default: 0 },
      readabilityScore: { type: Number, default: 0 },
      lastOptimized: { type: Date },
    },

    // 9. Meta Settings - Meta A/B + Score
    metaSettings: {
      variantIndex: { type: Number, default: 0 },
      autoPaused: { type: Boolean, default: false },
      suggestions: [metaVariantSchema],
      currentTitle: { type: String },
      currentDescription: { type: String },
      metaScore: { type: Number, default: 0, min: 0, max: 100 },
      lastUpdated: { type: Date },
    },

    // 10. Reports - Trek Health Reports
    reports: {
      seoReport: {
        score: { type: Number, default: 0 },
        issues: [
          {
            type: String,
            message: String,
            severity: { type: String, enum: ['low', 'medium', 'high'] },
            fixable: { type: Boolean, default: true },
          },
        ],
        lastGenerated: { type: Date },
      },
      optimizerReport: {
        score: { type: Number, default: 0 },
        issues: [
          {
            type: String,
            message: String,
            suggestion: String,
          },
        ],
        lastGenerated: { type: Date },
      },
    },

    // 11. Schema Preview - Generated Schema Live Preview
    schemaPreview: {
      jsonLd: { type: String },
      lastGenerated: { type: Date },
    },

    // 12. Form State - Admin UX Support
    formState: {
      activeTab: { type: String, default: 'packageInfo' },
      formTab: { type: String },
      openActionId: { type: String },
      activeTrek: { type: mongoose.Schema.Types.ObjectId },
    },

    // Additional fields
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
trekSchema.index({ 'packageInfo.slug': 1 });
trekSchema.index({ 'packageInfo.title': 'text', 'content.aboutContent': 'text' });
trekSchema.index({ 'keywordSettings.location': 1 });
trekSchema.index({ 'keywordSettings.difficulty': 1 });
trekSchema.index({ status: 1 });
trekSchema.index({ createdAt: -1 });

// Virtual for full URL
trekSchema.virtual('url').get(function () {
  return `/treks/${this.packageInfo.slug}`;
});

// Pre-save middleware to generate slug if not provided
trekSchema.pre('save', function (next) {
  if (!this.packageInfo.slug && this.packageInfo.title) {
    this.packageInfo.slug = this.packageInfo.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to generate schema JSON-LD
trekSchema.methods.generateSchemaJsonLd = function () {
  const schema = {
    '@context': 'https://schema.org',
    '@type': this.schemaSettings.schemaType || 'TouristTrip',
    name: this.packageInfo.title,
    description: this.packageInfo.description,
    image: this.packageInfo.imageUrl,
    duration: this.packageInfo.duration,
    location: {
      '@type': 'Place',
      name: this.packageInfo.startLocation,
    },
  };

  if (this.schemaSettings.includeOffersSchema && this.packageInfo.price) {
    schema.offers = {
      '@type': 'Offer',
      price: this.packageInfo.price,
      priceCurrency: this.packageInfo.currency || 'INR',
    };
  }

  if (this.schemaSettings.includeRatingSchema && this.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: this.rating,
      reviewCount: this.reviewCount,
    };
  }

  if (this.schemaSettings.includeFaqSchema && this.content.faqs.length > 0) {
    schema.mainEntity = {
      '@type': 'FAQPage',
      mainEntity: this.content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  return JSON.stringify(schema, null, 2);
};

module.exports = mongoose.model('Trek', trekSchema);
