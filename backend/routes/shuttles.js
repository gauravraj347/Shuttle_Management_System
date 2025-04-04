const express = require('express');
const { 
  getShuttles, 
  getShuttle, 
  createShuttle, 
  updateShuttle, 
  deleteShuttle 
} = require('../controllers/shuttleController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getShuttles);
router.get('/:id', getShuttle);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), createShuttle);
router.put('/:id', protect, authorize('admin'), updateShuttle);
router.delete('/:id', protect, authorize('admin'), deleteShuttle);

module.exports = router; 