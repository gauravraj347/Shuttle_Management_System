const Stop = require('../models/Stop');

// @desc    Create a new stop
// @route   POST /api/stops
// @access  Private/Admin
exports.createStop = async (req, res) => {
  try {
    const { name, location, description, type, popularity, amenities } = req.body;

    const stop = await Stop.create({
      name,
      location,
      description,
      type: type || 'regular',
      popularity: popularity || 0,
      amenities: amenities || {
        shelter: false,
        seating: false,
        lighting: false,
        wheelchair: false
      }
    });

    res.status(201).json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all stops
// @route   GET /api/stops
// @access  Public
exports.getStops = async (req, res) => {
  try {
    const stops = await Stop.find();

    res.status(200).json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single stop
// @route   GET /api/stops/:id
// @access  Public
exports.getStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found' });
    }

    res.status(200).json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby stops based on location
// @route   GET /api/stops/nearby
// @access  Public
exports.getNearbyStops = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query; // radius in meters, default 1km
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(radius);
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(maxDistance)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates or radius'
      });
    }
    
    // Perform a geospatial query using MongoDB's $near operator
    const nearbyStops = await Stop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON uses [lng, lat] order
          },
          $maxDistance: maxDistance
        }
      }
    }).limit(10); // Limit to 10 nearest stops
    
    // Calculate walking time based on distance (rough estimate: 1km = 12min walking)
    const stopsWithDistance = nearbyStops.map(stop => {
      // Calculate distance in km
      const [stopLng, stopLat] = stop.location.coordinates;
      const distance = calculateDistance(latitude, longitude, stopLat, stopLng);
      const walkingTime = Math.round(distance * 12); // 12 minutes per km
      
      return {
        _id: stop._id,
        stopId: stop._id,
        name: stop.name,
        location: stop.location,
        facilities: stop.facilities,
        distance: distance.toFixed(2), // km, to 2 decimal places
        walkingTime: walkingTime // minutes
      };
    });
    
    res.status(200).json({
      success: true,
      count: stopsWithDistance.length,
      data: stopsWithDistance
    });
  } catch (error) {
    console.error('Error getting nearby stops:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching nearby stops'
    });
  }
};

// @desc    Update a stop
// @route   PUT /api/stops/:id
// @access  Private/Admin
exports.updateStop = async (req, res) => {
  try {
    const { name, location, description, type, isActive, popularity, amenities } = req.body;

    let stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found' });
    }

    // Update fields
    stop.name = name || stop.name;
    stop.location = location || stop.location;
    stop.description = description || stop.description;
    stop.type = type || stop.type;
    stop.isActive = isActive !== undefined ? isActive : stop.isActive;
    stop.popularity = popularity !== undefined ? popularity : stop.popularity;
    
    if (amenities) {
      stop.amenities = {
        ...stop.amenities,
        ...amenities
      };
    }
    
    stop.updatedAt = Date.now();

    await stop.save();

    res.status(200).json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a stop
// @route   DELETE /api/stops/:id
// @access  Private/Admin
exports.deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found' });
    }

    await stop.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}