const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Shuttle = require('../models/Shuttle');
const Wallet = require('../models/Wallet');
const Booking = require('../models/Booking');
const demoData = require('../demoData');

// Function to seed the database with demo data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Route.deleteMany();
    await Stop.deleteMany();
    await Shuttle.deleteMany();
    await Wallet.deleteMany();
    await Booking.deleteMany();
    
    console.log('Previous data cleared');
    
    // Create users
    const users = await User.create(demoData.users);
    console.log(`${users.length} users created`);
    
    // Create stops - transform location data to GeoJSON format
    const stopsWithGeoJSON = demoData.stops.map(stop => {
      return {
        ...stop,
        location: {
          type: 'Point',
          coordinates: [stop.location.lng, stop.location.lat] // GeoJSON uses [longitude, latitude] order
        }
      };
    });
    
    const stops = await Stop.create(stopsWithGeoJSON);
    console.log(`${stops.length} stops created`);
    
    // Create routes and associate with stops
    const routesWithStops = demoData.routes.map((route, index) => {
      // Associate routes with stops randomly
      const routeStops = stops.slice(0, Math.min(3 + index, stops.length));
      return {
        ...route,
        stops: routeStops.map(stop => stop._id)
      };
    });
    
    const routes = await Route.create(routesWithStops);
    console.log(`${routes.length} routes created`);
    
    // Update stops with reference to routes
    for (const stop of stops) {
      const associatedRoutes = routes.filter(route => 
        route.stops.some(routeStop => routeStop.toString() === stop._id.toString())
      );
      
      stop.routes = associatedRoutes.map(route => route._id);
      await stop.save();
    }
    
    // Create shuttles - transform currentLocation to GeoJSON format
    const shuttlesWithRoutes = demoData.shuttles.map((shuttle, index) => {
      // Transform location data to GeoJSON format
      const transformedShuttle = {
        ...shuttle,
        currentLocation: {
          type: 'Point',
          coordinates: [shuttle.currentLocation.lng, shuttle.currentLocation.lat]
        }
      };
      
      // Associate shuttles with routes (active shuttles only)
      if (shuttle.status === 'active' && index < routes.length) {
        const route = routes[index];
        const currentStop = route.stops[0];
        const nextStop = route.stops.length > 1 ? route.stops[1] : route.stops[0];
        
        return {
          ...transformedShuttle,
          route: route._id,
          currentStop,
          nextStop,
          estimatedArrival: new Date(Date.now() + (5 * 60000)) // 5 minutes from now
        };
      }
      return transformedShuttle;
    });
    
    const shuttles = await Shuttle.create(shuttlesWithRoutes);
    console.log(`${shuttles.length} shuttles created`);
    
    // Create wallets
    const walletsWithUsers = demoData.wallets.map((wallet, index) => {
      if (index < users.length) {
        return {
          ...wallet,
          user: users[index]._id
        };
      }
      return null;
    }).filter(wallet => wallet !== null);
    
    const wallets = await Wallet.create(walletsWithUsers);
    console.log(`${wallets.length} wallets created`);
    
    // Create bookings
    if (demoData.bookings && demoData.bookings.length > 0) {
      const bookingsWithReferences = demoData.bookings.map((booking, index) => {
        // Use first user for all bookings for simplicity
        const user = users[0];
        // Rotate through routes
        const route = routes[index % routes.length];
        // Get stops from the route
        const routeStops = route.stops;
        const fromStop = routeStops[0]; 
        const toStop = routeStops[routeStops.length - 1];
        // Assign a shuttle
        const shuttle = shuttles.find(s => s.route && s.route.toString() === route._id.toString()) 
                      || shuttles[0];
        
        return {
          ...booking,
          userId: user._id,
          routeId: route._id,
          fromStopId: fromStop,
          toStopId: toStop,
          shuttleId: shuttle._id
        };
      });
      
      const bookings = await Booking.create(bookingsWithReferences);
      console.log(`${bookings.length} bookings created`);
    }
    
    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

module.exports = seedDatabase; 