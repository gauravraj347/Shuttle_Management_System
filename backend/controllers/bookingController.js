const Booking = require("../models/Booking");
const User = require("../models/User");
const Route = require("../models/Route");
const Stop = require("../models/Stop");
const Wallet = require("../models/Wallet");

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("routeId", "name description")
      .populate("fromStopId", "name")
      .populate("toStopId", "name")
      .sort({ departureTime: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("routeId", "name description")
      .populate("fromStopId", "name")
      .populate("toStopId", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { routeId, fromStopId, toStopId, departureTime } = req.body;

    if (!routeId || !fromStopId || !toStopId || !departureTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const fromStop = await Stop.findById(fromStopId);
    const toStop = await Stop.findById(toStopId);
    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: "One or both stops not found",
      });
    }

    const fare = route.fare;

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < fare) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      routeId,
      fromStopId,
      toStopId,
      departureTime: new Date(departureTime),
      status: "confirmed",
      fare,
    });

    await wallet.addTransaction({
      amount: fare,
      type: "debit",
      description: `Shuttle booking - ${route.name}`,
      routeId: route._id,
      timestamp: new Date(),
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("routeId", "name description")
      .populate("fromStopId", "name")
      .populate("toStopId", "name");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
