const express = require('express');
const { 
  getRoutes, 
  getRoute, 
  createRoute, 
  updateRoute, 
  deleteRoute 
} = require('../controllers/routeController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getRoutes);
router.get('/:id', getRoute);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), createRoute);
router.put('/:id', protect, authorize('admin'), updateRoute);
router.delete('/:id', protect, authorize('admin'), deleteRoute);

module.exports = router; 