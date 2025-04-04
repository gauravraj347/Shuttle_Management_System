const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Shuttle = require('../models/Shuttle');

// @desc    Get route recommendations between stops
// @route   POST /api/recommendations
// @access  Public
exports.getRecommendations = async (req, res) => {
  try {
    const { fromStopId, toStopId, preferredCriteria } = req.body;
    
    // Check if required parameters are provided
    if (!fromStopId || !toStopId) {
      return res.status(400).json({
        success: false,
        message: 'Departure and arrival stops are required'
      });
    }
    
    // Fetch the stop information
    const [fromStop, toStop] = await Promise.all([
      Stop.findById(fromStopId).populate('routes'),
      Stop.findById(toStopId).populate('routes')
    ]);
    
    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: 'One or both stops not found'
      });
    }
    
    // Find common routes between the stops (direct routes)
    const directRouteIds = fromStop.routes
      .filter(route => toStop.routes.some(r => r._id.toString() === route._id.toString()))
      .map(route => route._id);
    
    // Find active shuttles for these routes
    const activeShuttles = await Shuttle.find({
      status: 'active',
      route: { $in: directRouteIds }
    }).populate('route').populate('currentStop');
    
    // Fetch full route details
    const routes = await Route.find({
      _id: { $in: directRouteIds }
    }).populate('stops');
    
    // Calculate current time for departures
    const currentTime = new Date();
    const departureTime = new Date(currentTime);
    
    // Function to get next departure time based on schedule
    const getNextDeparture = (route) => {
      const dayOfWeek = currentTime.getDay();
      const scheduleType = dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday';
      
      const schedule = route.schedule.find(s => s.day === scheduleType);
      if (!schedule) return null;
      
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeString = `${currentHour}:${currentMinute < 10 ? '0' + currentMinute : currentMinute}`;
      
      // Find the next departure time
      const nextDeparture = schedule.departureTime.find(time => time > currentTimeString);
      return nextDeparture || schedule.departureTime[0]; // If no next time today, return first time tomorrow
    };
    
    // Check if it's peak hour
    const isPeakHour = () => {
      const hour = currentTime.getHours();
      return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    };
    
    // Function to determine occupancy based on time and route
    const getOccupancy = (route) => {
      const hour = currentTime.getHours();
      if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
        return 'high';
      } else if ((hour >= 7 && hour < 8) || (hour > 9 && hour <= 10) || 
                 (hour >= 16 && hour < 17) || (hour > 18 && hour <= 19)) {
        return 'medium';
      }
      return 'low';
    };
    
    // Generate recommendations
    const recommendations = routes.map(route => {
      // Get the stop objects within this route
      const routeFromStop = route.stops.find(stop => stop._id.toString() === fromStopId);
      const routeToStop = route.stops.find(stop => stop._id.toString() === toStopId);
      
      // Find if there's a shuttle on this route
      const shuttle = activeShuttles.find(shuttle => 
        shuttle.route && shuttle.route._id.toString() === route._id.toString()
      );
      
      // Calculate departure and arrival times
      const nextDepartureTime = getNextDeparture(route);
      let departureDateTime = new Date(departureTime);
      
      if (nextDepartureTime) {
        const [hours, minutes] = nextDepartureTime.split(':').map(Number);
        departureDateTime.setHours(hours, minutes, 0, 0);
        
        // If the departure time is in the past, set it to tomorrow
        if (departureDateTime < currentTime) {
          departureDateTime.setDate(departureDateTime.getDate() + 1);
        }
      }
      
      // Calculate arrival time based on estimated time
      const arrivalDateTime = new Date(departureDateTime);
      arrivalDateTime.setMinutes(arrivalDateTime.getMinutes() + route.estimatedTime);
      
      // Determine fare based on peak hour
      const peakHour = isPeakHour();
      const fare = peakHour ? route.peakHourFare : route.fare;
      
      // Determine occupancy
      const occupancy = getOccupancy(route);
      
      // Format times for display
      const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
      };
      
      // Build stop timeline
      const stops = [];
      route.stops.forEach(stop => {
        // Skip stops that are not between fromStop and toStop
        const fromStopIndex = route.stops.findIndex(s => s._id.toString() === fromStopId);
        const toStopIndex = route.stops.findIndex(s => s._id.toString() === toStopId);
        const stopIndex = route.stops.findIndex(s => s._id.toString() === stop._id.toString());
        
        // Only include stops between from and to (inclusive)
        const includeStop = (fromStopIndex <= toStopIndex)
          ? (stopIndex >= fromStopIndex && stopIndex <= toStopIndex)
          : (stopIndex >= toStopIndex && stopIndex <= fromStopIndex);
        
        if (includeStop) {
          const isFromStop = stop._id.toString() === fromStopId;
          const isToStop = stop._id.toString() === toStopId;
          
          // Calculate arrival time for this stop
          const minutesToAdd = 
            Math.abs(stopIndex - fromStopIndex) * (route.estimatedTime / (route.stops.length - 1));
          
          const stopDateTime = new Date(departureDateTime);
          stopDateTime.setMinutes(stopDateTime.getMinutes() + minutesToAdd);
          
          stops.push({
            stopId: stop._id,
            name: stop.name,
            arrivalTime: isFromStop ? null : stopDateTime,
            departureTime: isToStop ? null : stopDateTime
          });
        }
      });
      
      return {
        routeId: route._id,
        routeName: route.name,
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
        fare,
        distance: route.distance,
        distanceInKm: route.distance,
        fromStop: { _id: fromStopId, name: fromStop.name },
        toStop: { _id: toStopId, name: toStop.name },
        travelTime: route.estimatedTime,
        occupancy,
        directRoute: true,
        transfers: [],
        legs: [],
        timeSaved: 0,
        transferBenefits: null,
        shuttleId: shuttle ? shuttle._id : null,
        stops,
        isPeakHour: peakHour
      };
    });
    
    // Sort recommendations by criteria
    let sortedRecommendations = [...recommendations];
    if (preferredCriteria === 'fastest') {
      sortedRecommendations.sort((a, b) => a.travelTime - b.travelTime);
    } else if (preferredCriteria === 'cheapest') {
      sortedRecommendations.sort((a, b) => a.fare - b.fare);
    } else if (preferredCriteria === 'least_crowded') {
      const occupancyScore = { 'low': 1, 'medium': 2, 'high': 3 };
      sortedRecommendations.sort((a, b) => occupancyScore[a.occupancy] - occupancyScore[b.occupancy]);
    }
    
    // Get nearby stops for alternatives
    const nearbyStops = await Stop.find({
      location: {
        $near: {
          $geometry: fromStop.location,
          $maxDistance: 1000 // 1km radius
        }
      },
      _id: { $ne: fromStopId }
    }).limit(3);
    
    // Format nearby stops
    const formattedNearbyStops = nearbyStops.map(stop => {
      // Calculate distance in km and walking time (approx. 1km = 12 min walking)
      const fromStopCoords = fromStop.location.coordinates;
      const stopCoords = stop.location.coordinates;
      
      // Simple distance calculation (this is approximate)
      const distance = Math.sqrt(
        Math.pow(fromStopCoords[0] - stopCoords[0], 2) + 
        Math.pow(fromStopCoords[1] - stopCoords[1], 2)
      ) * 111; // Rough conversion to km
      
      const walkingTime = Math.round(distance * 12); // 12 minutes per km
      
      return {
        _id: stop._id,
        stopId: stop._id,
        name: stop.name,
        distance: distance.toFixed(1),
        walkingTime
      };
    });
    
    // Generate transfer statistics
    const transferStats = {
      averageWaitTime: 5,
      averageTimeSaved: 8,
      popularTransferPoints: [
        { name: 'Campus Cross', popularity: 'high' },
        { name: 'Student Center', popularity: 'medium' }
      ],
      peakHours: ['08:00-09:00', '17:00-18:00'],
      routeFrequency: routes.reduce((acc, route) => {
        const weekdaySchedule = route.schedule.find(s => s.day === 'weekday');
        const frequency = weekdaySchedule 
          ? `${Math.round(60 / (weekdaySchedule.departureTime.length / 8))} min` 
          : 'Unknown';
        acc[route._id] = frequency;
        return acc;
      }, {})
    };
    
    return res.json({
      success: true,
      recommendations: sortedRecommendations,
      nearbyStops: formattedNearbyStops,
      transferStats
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 