const Booking = require('../models/Booking');
const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Shuttle = require('../models/Shuttle');
const Wallet = require('../models/Wallet');

// @desc    Get all bookings for the current user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('routeId', 'name description')
      .populate('fromStopId', 'name')
      .populate('toStopId', 'name')
      .populate('shuttleId', 'name vehicleNumber')
      .sort({ departureTime: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('routeId', 'name description')
      .populate('fromStopId', 'name')
      .populate('toStopId', 'name')
      .populate('shuttleId', 'name vehicleNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the user
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { routeId, fromStopId, toStopId, departureTime, shuttleId, isPeakHour } = req.body;

    // Validate required fields
    if (!routeId || !fromStopId || !toStopId || !departureTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if the route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if the stops exist
    const fromStop = await Stop.findById(fromStopId);
    const toStop = await Stop.findById(toStopId);
    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: 'One or both stops not found'
      });
    }

    // Check if the shuttle exists if provided
    let shuttle = null;
    if (shuttleId) {
      shuttle = await Shuttle.findById(shuttleId);
      if (!shuttle) {
        return res.status(404).json({
          success: false,
          message: 'Shuttle not found'
        });
      }
    }

    // Determine fare based on peak hour
    const fare = isPeakHour ? route.peakHourFare : route.fare;

    // Check if user has enough balance
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < fare) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      routeId,
      fromStopId,
      toStopId,
      departureTime: new Date(departureTime),
      status: 'confirmed',
      fare,
      isPeakHour: !!isPeakHour,
      shuttleId: shuttle ? shuttle._id : null
    });

    // Deduct fare from wallet
    await wallet.addTransaction({
      amount: fare,
      type: 'debit',
      description: `Shuttle booking - ${route.name}`,
      routeId: route._id,
      isPeakHour: !!isPeakHour,
      timestamp: new Date()
    });

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('routeId', 'name description')
      .populate('fromStopId', 'name')
      .populate('toStopId', 'name')
      .populate('shuttleId', 'name vehicleNumber');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const { status } = req.body;

    // Find the booking
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the user or user is admin
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Only allow status to be updated
    if (status) {
      booking.status = status;
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the user or user is admin
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }

    // Only allow cancellation for future bookings
    const currentTime = new Date();
    const departureTime = new Date(booking.departureTime);
    
    if (departureTime < currentTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a past booking'
      });
    }

    // If it's a confirmed booking, refund the wallet
    if (booking.status === 'confirmed') {
      const wallet = await Wallet.findOne({ user: req.user.id });
      if (wallet) {
        await wallet.addTransaction({
          amount: booking.fare,
          type: 'credit',
          description: 'Booking cancellation refund',
          timestamp: new Date()
        });
      }
    }

    // Update booking status to cancelled instead of deleting
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get frequent routes for the user
// @route   GET /api/bookings/frequent
// @access  Private
exports.getFrequentRoutes = async (req, res) => {
  try {
    // Aggregate bookings to find frequent routes
    const frequentRoutes = await Booking.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$routeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get route details
    const routeIds = frequentRoutes.map(item => item._id);
    const routes = await Route.find({ _id: { $in: routeIds } }, 'name description');

    // Combine count and route details
    const result = frequentRoutes.map(item => {
      const route = routes.find(r => r._id.toString() === item._id.toString());
      return {
        routeId: item._id,
        routeName: route ? route.name : 'Unknown Route',
        count: item.count
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/statistics
// @access  Private
exports.getBookingStatistics = async (req, res) => {
  try {
    // Get all bookings for the user
    const bookings = await Booking.find({ userId: req.user.id });

    // Count upcoming bookings
    const currentDate = new Date();
    const upcomingBookings = bookings.filter(
      booking => new Date(booking.departureTime) > currentDate && booking.status === 'confirmed'
    ).length;

    // Count completed bookings
    const completedBookings = bookings.filter(
      booking => booking.status === 'completed'
    ).length;

    // Find favorite route
    const routeCounts = {};
    bookings.forEach(booking => {
      const routeId = booking.routeId.toString();
      routeCounts[routeId] = (routeCounts[routeId] || 0) + 1;
    });

    let favoriteRouteId = null;
    let maxCount = 0;
    Object.entries(routeCounts).forEach(([routeId, count]) => {
      if (count > maxCount) {
        favoriteRouteId = routeId;
        maxCount = count;
      }
    });

    // Find most used stop
    const stopCounts = {};
    bookings.forEach(booking => {
      const fromStopId = booking.fromStopId.toString();
      stopCounts[fromStopId] = (stopCounts[fromStopId] || 0) + 1;
    });

    let mostUsedStopId = null;
    maxCount = 0;
    Object.entries(stopCounts).forEach(([stopId, count]) => {
      if (count > maxCount) {
        mostUsedStopId = stopId;
        maxCount = count;
      }
    });

    // Calculate average fare
    const totalFare = bookings.reduce((sum, booking) => sum + booking.fare, 0);
    const averageFare = bookings.length > 0 ? (totalFare / bookings.length).toFixed(2) : 0;

    // Get details for favorite route and most used stop
    const favoriteRoute = favoriteRouteId
      ? await Route.findById(favoriteRouteId, 'name')
      : null;

    const mostUsedStop = mostUsedStopId
      ? await Stop.findById(mostUsedStopId, 'name')
      : null;

    const statistics = {
      totalBookings: bookings.length,
      upcomingBookings,
      completedBookings,
      favoriteRoute: favoriteRoute
        ? {
            routeId: favoriteRouteId,
            routeName: favoriteRoute.name,
            count: routeCounts[favoriteRouteId]
          }
        : null,
      mostUsedStop: mostUsedStop
        ? {
            stopId: mostUsedStopId,
            stopName: mostUsedStop.name,
            count: stopCounts[mostUsedStopId]
          }
        : null,
      averageFare: parseFloat(averageFare)
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 