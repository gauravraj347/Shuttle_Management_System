const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public route to get system settings
router.get('/', getSettings);

// Admin-only route to update settings
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router; 