const Shuttle = require('../models/Shuttle');
const Route = require('../models/Route');

// @desc    Create a new shuttle
// @route   POST /api/shuttles
// @access  Private/Admin
exports.createShuttle = async (req, res) => {
  try {
    const { 
      name, 
      vehicleNumber, 
      capacity, 
      currentRoute,
      status,
      currentLocation,
      driver
    } = req.body;

    // If currentRoute is provided, check if it exists
    if (currentRoute) {
      const routeExists = await Route.findById(currentRoute);
      if (!routeExists) {
        return res.status(400).json({ success: false, message: 'Route does not exist' });
      }
    }

    const shuttle = await Shuttle.create({
      name,
      vehicleNumber,
      capacity,
      currentRoute,
      status,
      currentLocation,
      driver
    });

    res.status(201).json({
      success: true,
      data: shuttle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Shuttle with this vehicle number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all shuttles
// @route   GET /api/shuttles
// @access  Public
exports.getShuttles = async (req, res) => {
  try {
    const shuttles = await Shuttle.find().populate('currentRoute');

    res.status(200).json({
      success: true,
      count: shuttles.length,
      data: shuttles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single shuttle
// @route   GET /api/shuttles/:id
// @access  Public
exports.getShuttle = async (req, res) => {
  try {
    const shuttle = await Shuttle.findById(req.params.id).populate('currentRoute');

    if (!shuttle) {
      return res.status(404).json({ success: false, message: 'Shuttle not found' });
    }

    res.status(200).json({
      success: true,
      data: shuttle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a shuttle
// @route   PUT /api/shuttles/:id
// @access  Private/Admin
exports.updateShuttle = async (req, res) => {
  try {
    const { 
      name, 
      vehicleNumber, 
      capacity, 
      currentRoute,
      status,
      currentLocation,
      driver 
    } = req.body;

    // If currentRoute is provided, check if it exists
    if (currentRoute) {
      const routeExists = await Route.findById(currentRoute);
      if (!routeExists) {
        return res.status(400).json({ success: false, message: 'Route does not exist' });
      }
    }

    let shuttle = await Shuttle.findById(req.params.id);

    if (!shuttle) {
      return res.status(404).json({ success: false, message: 'Shuttle not found' });
    }

    // Update fields
    shuttle.name = name || shuttle.name;
    shuttle.vehicleNumber = vehicleNumber || shuttle.vehicleNumber;
    shuttle.capacity = capacity || shuttle.capacity;
    shuttle.currentRoute = currentRoute || shuttle.currentRoute;
    shuttle.status = status || shuttle.status;
    shuttle.currentLocation = currentLocation || shuttle.currentLocation;
    shuttle.driver = driver || shuttle.driver;
    shuttle.updatedAt = Date.now();

    await shuttle.save();

    res.status(200).json({
      success: true,
      data: shuttle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Shuttle with this vehicle number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a shuttle
// @route   DELETE /api/shuttles/:id
// @access  Private/Admin
exports.deleteShuttle = async (req, res) => {
  try {
    const shuttle = await Shuttle.findById(req.params.id);

    if (!shuttle) {
      return res.status(404).json({ success: false, message: 'Shuttle not found' });
    }

    await shuttle.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};