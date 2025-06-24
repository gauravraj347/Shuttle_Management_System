const Route = require("../models/Route");
const Stop = require("../models/Stop");

exports.createRoute = async (req, res) => {
  try {
    const {
      name,
      description,
      stops,
      orderedStops,
      fare,
      distance,
      estimatedTime,
      schedule,
    } = req.body;

    if (stops && stops.length > 0) {
      const stopsExist = await Stop.find({ _id: { $in: stops } });
      if (stopsExist.length !== stops.length) {
        return res
          .status(400)
          .json({ success: false, message: "Some stops do not exist" });
      }
    }

    const routeData = {
      ...req.body,
      schedule: req.body.schedule,
    };

    const route = new Route(routeData);
    await route.save();

    if (stops && stops.length > 0) {
      await Stop.updateMany(
        { _id: { $in: stops } },
        { $push: { routes: route._id } }
      );
    }

    const populatedRoute = await Route.findById(route._id).populate("stops");

    res.status(201).json({
      success: true,
      data: populatedRoute,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Route with this name already exists",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate("stops");

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate("stops");

    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Route not found" });
    }

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const {
      name,
      description,
      stops,
      orderedStops,
      fare,
      distance,
      estimatedTime,
      schedule,
    } = req.body;

    if (stops && stops.length > 0) {
      const stopsExist = await Stop.find({ _id: { $in: stops } });
      if (stopsExist.length !== stops.length) {
        return res
          .status(400)
          .json({ success: false, message: "Some stops do not exist" });
      }
    }

    let route = await Route.findById(req.params.id);

    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Route not found" });
    }

    route.name = name || route.name;
    route.description = description || route.description;
    route.stops = stops || route.stops;
    route.orderedStops = orderedStops || route.orderedStops;
    route.fare = fare !== undefined ? fare : route.fare;
    route.distance = distance !== undefined ? distance : route.distance;
    route.estimatedTime =
      estimatedTime !== undefined ? estimatedTime : route.estimatedTime;
    route.schedule = schedule || route.schedule;
    route.updatedAt = Date.now();

    await route.save();

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Route with this name already exists",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Route not found" });
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
