const Route = require('../models/Route');
const Stop = require('../models/Stop');

// @desc    Create a new route
// @route   POST /api/routes
// @access  Private/Admin
exports.createRoute = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      stops, 
      orderedStops,
      isActive,
      fare,
      peakHourFare,
      distance,
      estimatedTime,
      schedule,
      optimizationFactors 
    } = req.body;

    // Validate stops exist
    if (stops && stops.length > 0) {
      const stopsExist = await Stop.find({ _id: { $in: stops } });
      if (stopsExist.length !== stops.length) {
        return res.status(400).json({ success: false, message: 'Some stops do not exist' });
      }
    }

    const route = await Route.create({
      name,
      description,
      stops: stops || [],
      orderedStops: orderedStops || [],
      isActive: isActive !== undefined ? isActive : true,
      fare: fare || 10,
      peakHourFare: peakHourFare || 15,
      distance: distance || 0,
      estimatedTime: estimatedTime || 0,
      schedule: schedule || { weekdays: [], weekends: [] },
      optimizationFactors: optimizationFactors || {
        peakHours: false,
        classSchedules: false,
        demandAnalysis: false
      }
    });

    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Route with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate('stops');

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single route
// @route   GET /api/routes/:id
// @access  Public
exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stops')
      .populate({
        path: 'orderedStops.stopId',
        model: 'Stop'
      });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a route
// @route   PUT /api/routes/:id
// @access  Private/Admin
exports.updateRoute = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      stops, 
      orderedStops,
      isActive,
      fare,
      peakHourFare,
      distance,
      estimatedTime,
      schedule,
      optimizationFactors 
    } = req.body;

    // Validate stops exist if provided
    if (stops && stops.length > 0) {
      const stopsExist = await Stop.find({ _id: { $in: stops } });
      if (stopsExist.length !== stops.length) {
        return res.status(400).json({ success: false, message: 'Some stops do not exist' });
      }
    }

    let route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    // Update fields
    route.name = name || route.name;
    route.description = description || route.description;
    route.stops = stops || route.stops;
    route.orderedStops = orderedStops || route.orderedStops;
    route.isActive = isActive !== undefined ? isActive : route.isActive;
    route.fare = fare !== undefined ? fare : route.fare;
    route.peakHourFare = peakHourFare !== undefined ? peakHourFare : route.peakHourFare;
    route.distance = distance !== undefined ? distance : route.distance;
    route.estimatedTime = estimatedTime !== undefined ? estimatedTime : route.estimatedTime;
    route.schedule = schedule || route.schedule;
    route.optimizationFactors = optimizationFactors || route.optimizationFactors;
    route.updatedAt = Date.now();

    await route.save();

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Route with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 