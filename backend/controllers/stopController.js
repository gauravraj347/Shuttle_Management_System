const Stop = require("../models/Stop");

exports.createStop = async (req, res) => {
  try {
    const { name, location, description, type } = req.body;

    const stop = await Stop.create({
      name,
      location,
    });

    res.status(201).json({
      success: true,
      data: stop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStops = async (req, res) => {
  try {
    const stops = await Stop.find();

    res.status(200).json({
      success: true,
      count: stops.length,
      data: stops,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res
        .status(404)
        .json({ success: false, message: "Stop not found" });
    }

    res.status(200).json({
      success: true,
      data: stop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStop = async (req, res) => {
  try {
    const { name, location } = req.body;

    let stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res
        .status(404)
        .json({ success: false, message: "Stop not found" });
    }

    // Update fields
    stop.name = name || stop.name;
    stop.location = location || stop.location;

    stop.updatedAt = Date.now();

    await stop.save();

    res.status(200).json({
      success: true,
      data: stop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res
        .status(404)
        .json({ success: false, message: "Stop not found" });
    }

    await stop.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
