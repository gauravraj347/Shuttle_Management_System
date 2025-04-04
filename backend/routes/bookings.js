const express = require('express');
const { 
  getBookings, 
  getBooking, 
  createBooking, 
  updateBooking, 
  deleteBooking,
  getFrequentRoutes,
  getBookingStatistics
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all bookings and create new booking
router.route('/')
  .get(getBookings)
  .post(createBooking);

// Get, update and delete specific booking
router.route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(deleteBooking);

// Get frequent routes for the user
router.get('/frequent', getFrequentRoutes);

// Get booking statistics
router.get('/statistics', getBookingStatistics);

module.exports = router; 