const express = require("express");
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getFrequentRoutes,
  getBookingStatistics,
} = require("../controllers/bookingController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all bookings and create new booking
router.route("/").get(getBookings).post(createBooking);


module.exports = router;
