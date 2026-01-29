/**
 * Trek Routes
 * All Trek-related API endpoints
 */

const express = require('express');
const router = express.Router();
const trekController = require('../controllers/trekController');
const { authenticateAdmin } = require('../middleware/auth');

// IMPORTANT: Specific routes must come before generic :id routes

// Bulk operations (must be before /:id routes)
router.post('/bulk-update', authenticateAdmin, trekController.bulkUpdate);

// Schema preview (specific route before generic)
router.get('/:id/schema-preview', authenticateAdmin, trekController.getSchemaPreview);

// Reports (specific route before generic)
router.get('/:id/seo-report', authenticateAdmin, trekController.generateSEOReport);

// Section-specific updates (specific route before generic)
router.patch('/:id/section', authenticateAdmin, trekController.updateTrekSection);

// Public routes (for published treks)
router.get('/', trekController.getAllTreks);

// Admin routes (protected)
router.post('/', authenticateAdmin, trekController.createTrek);

// Generic routes (must be last)
router.get('/:id', trekController.getTrekById);
router.put('/:id', authenticateAdmin, trekController.updateTrek);
router.delete('/:id', authenticateAdmin, trekController.deleteTrek);

module.exports = router;
