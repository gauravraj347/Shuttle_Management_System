const express = require('express');
const { 
  getStops, 
  getStop, 
  createStop, 
  updateStop, 
  deleteStop,
  getNearbyStops
} = require('../controllers/stopController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getStops);
router.get('/nearby', getNearbyStops);
router.get('/:id', getStop);

// Protected routes - Admin only
router.post('/', protect, authorize('admin'), createStop);
router.put('/:id', protect, authorize('admin'), updateStop);
router.delete('/:id', protect, authorize('admin'), deleteStop);

module.exports = router;