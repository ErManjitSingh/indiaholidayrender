/**
 * Helper Utilities
 */

/**
 * Generate URL-friendly slug from string
 */
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate SEO score
 */
function calculateSEOScore(trek) {
  let score = 0;
  let maxScore = 100;

  // Title (20 points)
  if (trek.packageInfo?.title) {
    const titleLength = trek.packageInfo.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      score += 20;
    } else if (titleLength > 0) {
      score += 10;
    }
  }

  // Description (20 points)
  if (trek.packageInfo?.description) {
    const descLength = trek.packageInfo.description.length;
    if (descLength >= 120 && descLength <= 160) {
      score += 20;
    } else if (descLength > 0) {
      score += 10;
    }
  }

  // Focus keyword (15 points)
  if (trek.seoSettings?.focusKeyword) {
    score += 15;
  }

  // Images with alt text (15 points)
  if (trek.seoSettings?.altCoverage) {
    score += (trek.seoSettings.altCoverage / 100) * 15;
  }

  // Internal links (10 points)
  if (trek.seoSettings?.internalLinks >= 3) {
    score += 10;
  } else if (trek.seoSettings?.internalLinks > 0) {
    score += 5;
  }

  // FAQs (10 points)
  if (trek.content?.faqs && trek.content.faqs.length >= 3) {
    score += 10;
  } else if (trek.content?.faqs && trek.content.faqs.length > 0) {
    score += 5;
  }

  // Schema enabled (10 points)
  if (trek.schemaSettings?.schemaEnabled) {
    score += 10;
  }

  return Math.min(score, maxScore);
}

/**
 * Sanitize HTML
 */
function sanitizeHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Format date
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

module.exports = {
  generateSlug,
  isValidEmail,
  calculateSEOScore,
  sanitizeHTML,
  formatDate,
};
