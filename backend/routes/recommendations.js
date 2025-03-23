const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

// This route is public so anyone can get route recommendations
router.post('/', getRecommendations);

module.exports = router; 