# Trek Module API Documentation

## Overview

Complete Trek management system with SEO, Schema, Analytics, and AI optimization features.

## Base URL

```
http://localhost:3000/api/treks
```

## Authentication

Admin endpoints require authentication header:
```
Authorization: Bearer <admin-token>
```
or
```
X-Admin-Token: <admin-token>
```

## Endpoints

### 1. Get All Treks

**GET** `/api/treks`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status: `draft`, `published`, `archived`
- `location` (string) - Filter by location: `Himachal`, `Uttarakhand`
- `difficulty` (string) - Filter by difficulty: `Easy`, `Moderate`, `Hard`
- `search` (string) - Search in title and content
- `sortBy` (string, default: `createdAt`) - Sort field
- `sortOrder` (string, default: `desc`) - Sort order: `asc` or `desc`

**Example:**
```bash
GET /api/treks?page=1&limit=10&status=published&location=Himachal
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 2. Get Trek by ID or Slug

**GET** `/api/treks/:id`

**Parameters:**
- `id` - Trek ID or slug

**Query Parameters:**
- `includeSchema` (boolean) - Include JSON-LD schema

**Example:**
```bash
GET /api/treks/triund-trek?includeSchema=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "packageInfo": {...},
    "content": {...},
    "seoSettings": {...},
    "schemaJsonLd": "..." // if includeSchema=true
  }
}
```

### 3. Create Trek

**POST** `/api/treks` (Admin)

**Request Body:**
```json
{
  "packageInfo": {
    "title": "Triund Trek",
    "description": "Beautiful trek in Himachal",
    "imageUrl": "https://...",
    "duration": "2D/1N",
    "price": 2500,
    "currency": "INR",
    "startLocation": "McLeod Ganj",
    "endLocation": "Triund",
    "difficulty": "Moderate"
  },
  "content": {
    "aboutContent": "Long description...",
    "highlights": ["Scenic views", "Camping"],
    "faqs": [
      {
        "question": "What is the best time?",
        "answer": "Summer months"
      }
    ]
  },
  "keywordSettings": {
    "location": "Himachal",
    "name": "Triund Trek",
    "duration": "2 days",
    "difficulty": "Moderate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trek created successfully",
  "data": {...}
}
```

### 4. Update Trek

**PUT** `/api/treks/:id` (Admin)

**Request Body:** Same as create, but partial updates allowed

**Response:**
```json
{
  "success": true,
  "message": "Trek updated successfully",
  "data": {...}
}
```

### 5. Update Trek Section

**PATCH** `/api/treks/:id/section` (Admin)

**Request Body:**
```json
{
  "section": "seoSettings",
  "data": {
    "focusKeyword": "triund trek himachal",
    "canonicalUrl": "https://...",
    "robots": "index, follow"
  }
}
```

**Valid Sections:**
- `schemaSettings`
- `packageInfo`
- `content`
- `seoSettings`
- `keywordSettings`
- `faqSettings`
- `internalLinks`
- `optimizer`
- `metaSettings`
- `reports`
- `formState`

### 6. Delete Trek

**DELETE** `/api/treks/:id` (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Trek deleted successfully"
}
```

### 7. Get Schema Preview

**GET** `/api/treks/:id/schema-preview` (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "jsonLd": "{...}",
    "html": "<script type=\"application/ld+json\">...</script>"
  }
}
```

### 8. Generate SEO Report

**GET** `/api/treks/:id/seo-report` (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "issues": [
      {
        "type": "title",
        "message": "Title should be at least 30 characters",
        "severity": "high",
        "fixable": true
      }
    ],
    "lastGenerated": "2026-01-28T..."
  }
}
```

### 9. Bulk Update

**POST** `/api/treks/bulk-update` (Admin)

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"],
  "updateData": {
    "status": "published"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 treks updated",
  "data": {
    "matched": 3,
    "modified": 3
  }
}
```

## Data Structure

### Complete Trek Schema

```javascript
{
  // 1. Schema Settings
  schemaSettings: {
    schemaType: "Trek",
    schemaEnabled: true,
    autoJsonEnabled: true,
    includeFaqSchema: true,
    includeItinerarySchema: true,
    includeOffersSchema: true,
    includeRatingSchema: false,
    autoInjectHead: true,
    manualSchemaOverride: ""
  },

  // 2. Package Info
  packageInfo: {
    title: "Triund Trek",
    slug: "triund-trek",
    description: "...",
    imageUrl: "...",
    duration: "2D/1N",
    price: 2500,
    currency: "INR",
    startLocation: "...",
    endLocation: "...",
    difficulty: "Moderate",
    maxAltitude: 2850,
    groupSize: 12,
    bestSeason: ["Summer", "Winter"]
  },

  // 3. Content
  content: {
    aboutContent: "...",
    highlights: [...],
    inclusions: [...],
    exclusions: [...],
    itinerary: [
      {
        day: 1,
        title: "Day 1",
        description: "...",
        activities: [...],
        meals: [...],
        accommodation: "..."
      }
    ],
    faqs: [
      {
        question: "...",
        answer: "...",
        order: 0
      }
    ],
    tips: [...],
    thingsToCarry: [...]
  },

  // 4. SEO Settings
  seoSettings: {
    focusKeyword: "triund trek",
    canonicalUrl: "...",
    robots: "index, follow",
    anchorText: "...",
    internalLinks: 5,
    linkedToTrekTour: [...],
    imageCount: 10,
    altCoverage: 90,
    featuredImageAlt: "...",
    ctaText: "Book Now",
    whatsapp: true,
    call: true,
    whatsappNumber: "+91...",
    callNumber: "+91...",
    previewed: false
  },

  // 5. Keyword Settings
  keywordSettings: {
    pageType: "trek",
    location: "Himachal",
    name: "Triund Trek",
    duration: "2 days",
    difficulty: "Moderate",
    season: "Summer",
    sourceCity: "Delhi",
    autoApply: true,
    keywords: [...]
  },

  // 6. FAQ Settings
  faqSettings: {
    autoFaqSelection: [...],
    autoFaqSuggestions: [...],
    manualFaqs: [...]
  },

  // 7. Internal Links
  internalLinks: {
    suggestions: [...],
    overrides: [...],
    activeLinks: [...]
  },

  // 8. Optimizer
  optimizer: {
    paragraph: "...",
    touched: false,
    blocks: [...],
    keywordDensity: 2.5,
    readabilityScore: 75,
    lastOptimized: "..."
  },

  // 9. Meta Settings
  metaSettings: {
    variantIndex: 0,
    autoPaused: false,
    suggestions: [...],
    currentTitle: "...",
    currentDescription: "...",
    metaScore: 85,
    lastUpdated: "..."
  },

  // 10. Reports
  reports: {
    seoReport: {
      score: 85,
      issues: [...],
      lastGenerated: "..."
    },
    optimizerReport: {
      score: 75,
      issues: [...],
      lastGenerated: "..."
    }
  },

  // 11. Schema Preview
  schemaPreview: {
    jsonLd: "...",
    lastGenerated: "..."
  },

  // 12. Form State
  formState: {
    activeTab: "packageInfo",
    formTab: "...",
    openActionId: "...",
    activeTrek: "..."
  },

  // Additional
  status: "published",
  publishedAt: "...",
  views: 0,
  likes: 0,
  rating: 4.5,
  reviewCount: 10
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Technical details (optional)"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Examples

### Create a Trek

```bash
curl -X POST http://localhost:3000/api/treks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "packageInfo": {
      "title": "Triund Trek",
      "description": "Beautiful trek in Himachal Pradesh",
      "duration": "2D/1N",
      "price": 2500,
      "startLocation": "McLeod Ganj",
      "endLocation": "Triund",
      "difficulty": "Moderate"
    },
    "content": {
      "aboutContent": "Triund is a beautiful trek..."
    },
    "keywordSettings": {
      "location": "Himachal",
      "name": "Triund Trek"
    }
  }'
```

### Update SEO Settings

```bash
curl -X PATCH http://localhost:3000/api/treks/trek-id/section \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "section": "seoSettings",
    "data": {
      "focusKeyword": "triund trek himachal",
      "canonicalUrl": "https://example.com/treks/triund-trek"
    }
  }'
```

### Get SEO Report

```bash
curl http://localhost:3000/api/treks/trek-id/seo-report \
  -H "Authorization: Bearer admin-token"
```
