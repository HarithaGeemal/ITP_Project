/**
 * Prediction Routes
 * API endpoints for delay prediction
 */

const express = require('express');
const router = express.Router();
const PredictionController = require('../controllers/PredictionController');

// ============================================
// PREDICTION ROUTES
// ============================================

/**
 * POST /api/predictions/delay
 * Create a new delay prediction
 */
router.post('/delay', PredictionController.predictDelay);

/**
 * GET /api/predictions/delay
 * Get all predictions with optional filtering
 */
router.get('/delay', PredictionController.getAllPredictions);

/**
 * GET /api/predictions/delay/:id
 * Get a specific prediction by ID
 */
router.get('/delay/:id', PredictionController.getPrediction);

/**
 * PUT /api/predictions/delay/:id
 * Update a prediction by ID
 */
router.put('/delay/:id', PredictionController.updatePrediction);

/**
 * DELETE /api/predictions/delay/:id
 * Delete a prediction by ID
 */
router.delete('/delay/:id', PredictionController.deletePrediction);

/**
 * GET /api/predictions/project/:projectId
 * Get all predictions for a specific project
 */
router.get('/project/:projectId', PredictionController.getProjectPredictions);

/**
 * GET /api/predictions/stats
 * Get prediction statistics and analytics
 */
router.get('/stats', PredictionController.getPredictionStats);

/**
 * GET /api/predictions/health
 * Check ML API health status
 */
router.get('/health', PredictionController.checkHealth);

/**
 * GET /api/predictions/model-info
 * Get ML model information
 */
router.get('/model-info', PredictionController.getModelInfo);

module.exports = router;

