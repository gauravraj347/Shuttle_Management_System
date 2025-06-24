const Route = require("../models/Route");
const Stop = require("../models/Stop");

exports.getRecommendations = async (req, res) => {
  try {
    const { fromStopId, toStopId, preferredCriteria } = req.body;
    // Check if required parameters are provided
    if (!fromStopId || !toStopId) {
      return res.status(400).json({
        success: false,
        message: "Departure and arrival stops are required",
      });
    }
    // Fetch the stop information
    const [fromStop, toStop] = await Promise.all([
      Stop.findById(fromStopId).populate("routes"),
      Stop.findById(toStopId).populate("routes"),
    ]);
    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: "One or both stops not found",
      });
    }
    // Find common routes between the stops (direct routes)
    const directRouteIds = fromStop.routes
      .filter((route) =>
        toStop.routes.some((r) => r._id.toString() === route._id.toString())
      )
      .map((route) => route._id);
    // Fetch full route details
    const routes = await Route.find({
      _id: { $in: directRouteIds },
    }).populate("stops");
    // Calculate current time for departures
    const currentTime = new Date();
    const departureTime = new Date(currentTime);
    // Function to get next departure time based on schedule
    const getNextDeparture = (route) => {
      const dayOfWeek = currentTime.getDay();
      const scheduleType =
        dayOfWeek === 0 || dayOfWeek === 6 ? "weekend" : "weekday";
      const schedule = route.schedule.find((s) => s.day === scheduleType);
      if (!schedule) return null;
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      // Find the next departure time strictly after now
      const nextDeparture = schedule.departureTime.find((time) => {
        const [h, m] = time.split(":").map(Number);
        if (h > currentHour) return true;
        if (h === currentHour && m > currentMinute) return true;
        return false;
      });
      if (nextDeparture) {
        return { time: nextDeparture, dayOffset: 0 };
      } else if (schedule.departureTime.length > 0) {
        // No more departures today, return first time tomorrow
        return { time: schedule.departureTime[0], dayOffset: 1 };
      }
      return null;
    };
    // Function to determine occupancy based on time and route
    const getOccupancy = (route) => {
      const hour = currentTime.getHours();
      if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
        return "high";
      } else if (
        (hour >= 7 && hour < 8) ||
        (hour > 9 && hour <= 10) ||
        (hour >= 16 && hour < 17) ||
        (hour > 18 && hour <= 19)
      ) {
        return "medium";
      }
      return "low";
    };
    // Generate recommendations
    const recommendations = routes.map((route) => {
      // Get the stop objects within this route
      const routeFromStop = route.stops.find(
        (stop) => stop._id.toString() === fromStopId
      );
      const routeToStop = route.stops.find(
        (stop) => stop._id.toString() === toStopId
      );
      // Use the first scheduled departure time (if any)
      let departureTime = null;
      if (Array.isArray(route.schedule) && route.schedule.length > 0) {
        const [hours, minutes] = route.schedule[0].split(":").map(Number);
        departureTime = new Date(currentTime);
        departureTime.setHours(hours, minutes, 0, 0);
      }
      // Calculate arrival time based on estimated time
      const arrivalDateTime = departureTime
        ? new Date(departureTime)
        : new Date(currentTime);
      if (departureTime) {
        arrivalDateTime.setMinutes(
          arrivalDateTime.getMinutes() + route.estimatedTime
        );
      }
      // Build stop timeline
      const stops = [];
      route.stops.forEach((stop) => {
        const fromStopIndex = route.stops.findIndex(
          (s) => s._id.toString() === fromStopId
        );
        const toStopIndex = route.stops.findIndex(
          (s) => s._id.toString() === toStopId
        );
        const stopIndex = route.stops.findIndex(
          (s) => s._id.toString() === stop._id.toString()
        );
        const includeStop =
          fromStopIndex <= toStopIndex
            ? stopIndex >= fromStopIndex && stopIndex <= toStopIndex
            : stopIndex >= toStopIndex && stopIndex <= fromStopIndex;
        if (includeStop) {
          const isFromStop = stop._id.toString() === fromStopId;
          const isToStop = stop._id.toString() === toStopId;
          const minutesToAdd =
            Math.abs(stopIndex - fromStopIndex) *
            (route.estimatedTime / (route.stops.length - 1));
          const stopDateTime = departureTime
            ? new Date(departureTime)
            : new Date(currentTime);
          stopDateTime.setMinutes(stopDateTime.getMinutes() + minutesToAdd);
          stops.push({
            stopId: stop._id,
            name: stop.name,
            arrivalTime: isFromStop ? null : stopDateTime,
            departureTime: isToStop ? null : stopDateTime,
          });
        }
      });
      // List all scheduled times as upcomingDepartureTimes
      const upcomingDepartureTimes = Array.isArray(route.schedule)
        ? route.schedule.map((t) => ({ time: t }))
        : [];
      return {
        routeId: route._id,
        routeName: route.name,
        departureTime: departureTime,
        arrivalTime: arrivalDateTime,
        fare: route.fare,
        distance: route.distance,
        distanceInKm: route.distance,
        fromStop: { _id: fromStopId, name: fromStop.name },
        toStop: { _id: toStopId, name: toStop.name },
        travelTime: route.estimatedTime,
        occupancy: getOccupancy(route),
        directRoute: true,
        transfers: [],
        legs: [],
        timeSaved: 0,
        transferBenefits: null,
        shuttleId: null,
        stops,
        upcomingDepartureTimes,
      };
    });
    // Sort recommendations by criteria
    let sortedRecommendations = [...recommendations];
    if (preferredCriteria === "fastest") {
      sortedRecommendations.sort((a, b) => a.travelTime - b.travelTime);
    } else if (preferredCriteria === "cheapest") {
      sortedRecommendations.sort((a, b) => a.fare - b.fare);
    } else if (preferredCriteria === "least_crowded") {
      const occupancyScore = { low: 1, medium: 2, high: 3 };
      sortedRecommendations.sort(
        (a, b) => occupancyScore[a.occupancy] - occupancyScore[b.occupancy]
      );
    }
    // Get nearby stops for alternatives
    const nearbyStops = await Stop.find({
      location: {
        $near: {
          $geometry: fromStop.location,
          $maxDistance: 1000, // 1km radius
        },
      },
      _id: { $ne: fromStopId },
    }).limit(3);
    // Format nearby stops
    const formattedNearbyStops = nearbyStops.map((stop) => {
      // Calculate distance in km and walking time (approx. 1km = 12 min walking)
      const fromStopCoords = fromStop.location.coordinates;
      const stopCoords = stop.location.coordinates;
      // Simple distance calculation (this is approximate)
      const distance =
        Math.sqrt(
          Math.pow(fromStopCoords[0] - stopCoords[0], 2) +
            Math.pow(fromStopCoords[1] - stopCoords[1], 2)
        ) * 111; // Rough conversion to km
      const walkingTime = Math.round(distance * 12); // 12 minutes per km
      return {
        _id: stop._id,
        stopId: stop._id,
        name: stop.name,
        distance: distance.toFixed(1),
        walkingTime,
      };
    });
    // Generate transfer statistics
    const transferStats = {
      averageWaitTime: 5,
      averageTimeSaved: 8,
      popularTransferPoints: [
        { name: "Campus Cross", popularity: "high" },
        { name: "Student Center", popularity: "medium" },
      ],
      peakHours: ["08:00-09:00", "17:00-18:00"],
      routeFrequency: routes.reduce((acc, route) => {
        const weekdaySchedule = route.schedule.find((s) => s.day === "weekday");
        const frequency = weekdaySchedule
          ? `${Math.round(60 / (weekdaySchedule.departureTime.length / 8))} min`
          : "Unknown";
        acc[route._id] = frequency;
        return acc;
      }, {}),
    };
    return res.json({
      success: true,
      recommendations: sortedRecommendations,
      nearbyStops: formattedNearbyStops,
      transferStats,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getRecommendedRoutes = async (req, res) => {
  try {
    const { startStop, endStop, time } = req.query;
    if (!startStop || !endStop || !time) {
      return res.status(400).json({
        success: false,
        message: "Please provide start stop, end stop, and time",
      });
    }
    // Find routes that include both stops
    const routes = await Route.find({
      stops: { $all: [startStop, endStop] },
      active: true,
    }).populate("stops");
    if (!routes.length) {
      return res.status(404).json({
        success: false,
        message: "No routes found between these stops",
      });
    }
    // Get current time and day
    const currentTime = new Date(time);
    const dayOfWeek = currentTime.getDay();
    const scheduleType = "weekday"; // Always use weekday schedule
    // Filter and sort routes based on schedule
    const recommendedRoutes = routes
      .map((route) => {
        const schedule = route.schedule.find((s) => s.day === scheduleType);
        if (!schedule) return null;
        // Find the next departure time
        const nextDeparture = schedule.departureTime.find((departure) => {
          const [hours, minutes] = departure.split(":").map(Number);
          const departureTime = new Date(currentTime);
          departureTime.setHours(hours, minutes, 0);
          return departureTime > currentTime;
        });
        if (!nextDeparture) return null;
        return {
          routeId: route._id,
          routeName: route.name,
          nextDeparture,
          fare: route.fare,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const timeA = a.nextDeparture.split(":").map(Number);
        const timeB = b.nextDeparture.split(":").map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
    res.json({
      success: true,
      data: recommendedRoutes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
