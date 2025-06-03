const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Stop = require('./models/Stop');
const Route = require('./models/Route');
const Shuttle = require('./models/Shuttle');
const Wallet = require('./models/Wallet');
const Booking = require('./models/Booking');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Shuttle';

// Sample data for seeding
const seedData = {
  users: [
    {
      name: 'Golu',
      email: 'golu@bennett.edu.in',
      password: '123456',
      role: 'student',
      studentId: 'STU001'
    },
  ],
  
  stops: [

    {
      name: 'A',
      location: {
        type: 'Point',
        coordinates: [-122.4196, 37.7949] // [longitude, latitude]
      },
      facilities: ['Shelter', 'Seating', 'Information Board']
    },
    {
      name: 'B',
      location: {
        type: 'Point',
        coordinates: [-122.4980, 37.7790]
      },
      facilities: ['Shelter', 'Seating']
    },



    {
      name: 'Main Building',
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749] // [longitude, latitude]
      },
      facilities: ['Shelter', 'Seating', 'Information Board']
    },
    {
      name: 'Science Complex',
      location: {
        type: 'Point',
        coordinates: [-122.4180, 37.7750]
      },
      facilities: ['Shelter', 'Seating']
    },
    {
      name: 'Library',
      location: {
        type: 'Point',
        coordinates: [-122.4175, 37.7752]
      },
      facilities: ['Shelter', 'Seating', 'Information Board', 'Vending Machine']
    },
    {
      name: 'Cafeteria',
      location: {
        type: 'Point',
        coordinates: [-122.4170, 37.7748]
      },
      facilities: ['Shelter', 'Seating']
    },
    {
      name: 'North Residence Hall',
      location: {
        type: 'Point',
        coordinates: [-122.4190, 37.7760]
      },
      facilities: ['Shelter', 'Seating', 'Information Board']
    },
    {
      name: 'Campus Cross',
      location: {
        type: 'Point',
        coordinates: [-122.4185, 37.7755]
      },
      facilities: ['Shelter', 'Seating']
    },
    {
      name: 'Engineering Building',
      location: {
        type: 'Point',
        coordinates: [-122.4165, 37.7742]
      },
      facilities: ['Shelter', 'Seating', 'Information Board']
    }
  ],
  
  routes: [
    {
      name: 'Route 1',
      description: 'Main campus route',
      schedule: [
        { day: 'weekday', departureTime: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'] }
      ],
      stops: [stops[0]._id, stops[1]._id],
      fare: 10,
      peakHourFare: 15,
      active: true
    },
    {
      name: 'Route 2',
      description: 'Secondary route',
      schedule: [
        { day: 'weekday', departureTime: ['09:00', '11:00', '13:00', '15:00', '17:00'] }
      ],
      stops: [stops[1]._id, stops[2]._id],
      fare: 8,
      peakHourFare: 12,
      active: true
    },
    {
      name: 'Route 3',
      description: 'Express route',
      schedule: [
        { day: 'weekday', departureTime: ['08:30', '10:30', '12:30', '14:30', '16:30'] }
      ],
      stops: [stops[0]._id, stops[2]._id],
      fare: 12,
      peakHourFare: 18,
      active: true
    },
    {
      name: 'Route 4',
      description: 'Circular route',
      schedule: [
        { day: 'weekday', departureTime: ['08:00', '10:00', '12:00', '14:00', '16:00'] }
      ],
      stops: [stops[0]._id, stops[1]._id, stops[2]._id],
      fare: 15,
      peakHourFare: 20,
      active: true
    }
  ],
  
  shuttles: [
    {
      name: 'Shuttle 1',
      vehicleNumber: 'SH-001',
      capacity: 20,
      currentLocation: {
        type: 'Point',
        coordinates: [-122.4183, 37.7750]
      },
      status: 'active',
      features: ['Wifi', 'USB Charging', 'Air Conditioning']
    },
    {
      name: 'Shuttle 2',
      vehicleNumber: 'SH-002',
      capacity: 15,
      currentLocation: {
        type: 'Point',
        coordinates: [-122.4187, 37.7758]
      },
      status: 'active',
      features: ['Wifi', 'Air Conditioning']
    },
    {
      name: 'Shuttle 3',
      vehicleNumber: 'SH-003',
      capacity: 20,
      currentLocation: {
        type: 'Point',
        coordinates: [-122.4172, 37.7745]
      },
      status: 'inactive',
      features: ['USB Charging', 'Air Conditioning', 'Disabled Access']
    }
  ],
  
  wallets: [
    {
      balance: 500,
      currency: 'points',
      status: 'active',
      transactions: [
        {
          amount: 100,
          type: 'credit',
          description: 'Initial deposit',
          timestamp: new Date('2023-03-15T10:30:00')
        }
      ]
    },
    {
      balance: 300,
      currency: 'points',
      status: 'active',
      transactions: [
        {
          amount: 50,
          type: 'credit',
          description: 'Initial deposit',
          timestamp: new Date('2023-03-15T10:30:00')
        }
      ]
    },
    {
      balance: 200,
      currency: 'points',
      status: 'active',
      transactions: [
        {
          amount: 200,
          type: 'credit',
          description: 'Initial deposit',
          timestamp: new Date('2023-03-15T10:30:00')
        }
      ]
    }
  ],
  
  bookings: [
    {
      status: 'confirmed',
      fare: 35,
      isPeakHour: true,
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
    },
    {
      status: 'confirmed',
      fare: 25,
      isPeakHour: false,
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // day after tomorrow
    },
    {
      status: 'completed',
      fare: 30,
      isPeakHour: true,
      departureTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ]
};

// Function to connect to MongoDB with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${retries}...`);
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB Connected Successfully!');
      return true;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      if (attempt < retries) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`Failed to connect after ${retries} attempts`);
  throw lastError;
};

// Function to hash passwords
const hashPasswords = async (users) => {
  return Promise.all(users.map(async (user) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    return { ...user, password: hashedPassword };
  }));
};

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB with retry logic
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Stop.deleteMany({});
    await Route.deleteMany({});
    await Shuttle.deleteMany({});
    await Wallet.deleteMany({});
    await Booking.deleteMany({});
    console.log('All existing data cleared');
    
    console.log('Starting database seeding process...');
    
    // Hash passwords before creating users
    console.log('Hashing user passwords...');
    const usersWithHashedPasswords = await hashPasswords(seedData.users);
    
    // Create users
    console.log('Creating users...');
    const users = await User.create(usersWithHashedPasswords);
    console.log(`${users.length} users created successfully`);
    
    // Create stops
    console.log('Creating stops...');
    const stops = await Stop.create(seedData.stops);
    console.log(`${stops.length} stops created successfully`);
    
    // Create routes with references to stops
    console.log('Creating routes...');
    const routesWithStops = seedData.routes.map((route, index) => {
      // For the C-D Express route (index 0), only assign stops C and D
      if (index === 0) {
        const stopC = stops.find(stop => stop.name === 'C');
        const stopD = stops.find(stop => stop.name === 'D');
        if (stopC && stopD) {
          return {
            ...route,
            stops: [stopC._id, stopD._id]
          };
        }
      }
      
      // For other routes, use the existing logic
      const routeStops = [];
      
      // For the first route, assign all stops
      if (index === 1) {
        routeStops.push(...stops.map(stop => stop._id));
      }
      // For the second route, assign odd-indexed stops
      else if (index === 2) {
        stops.forEach((stop, i) => {
          if (i % 2 === 0) routeStops.push(stop._id);
        });
      }
      // For the third route, assign even-indexed stops
      else if (index === 3) {
        stops.forEach((stop, i) => {
          if (i % 2 === 1) routeStops.push(stop._id);
        });
      }
      
      return {
        ...route,
        stops: routeStops
      };
    });
    
    const routes = await Route.create(routesWithStops);
    console.log(`${routes.length} routes created successfully`);
    
    // Update stops with route references
    console.log('Updating stops with route references...');
    for (const stop of stops) {
      const routesForStop = routes.filter(route => 
        route.stops.includes(stop._id)
      );
      
      stop.routes = routesForStop.map(route => route._id);
      await stop.save();
    }
    console.log('Stops updated with route references');
    
    // Create shuttles with route assignments
    console.log('Creating shuttles...');
    const shuttlesWithRoutes = seedData.shuttles.map((shuttle, index) => {
      if (index < routes.length) {
        // Assign each shuttle to a different route
        const route = routes[index];
        return {
          ...shuttle,
          route: route._id,
          currentStop: route.stops[0],
          nextStop: route.stops.length > 1 ? route.stops[1] : route.stops[0],
          estimatedArrival: new Date(Date.now() + 5 * 60000) // 5 minutes from now
        };
      }
      return shuttle;
    });
    
    const shuttles = await Shuttle.create(shuttlesWithRoutes);
    console.log(`${shuttles.length} shuttles created successfully`);
    
    // Create wallets for users
    console.log('Creating wallets...');
    const walletsWithUsers = seedData.wallets.map((wallet, index) => {
      if (index < users.length) {
        return {
          ...wallet,
          user: users[index]._id
        };
      }
      return null;
    }).filter(Boolean);
    
    const wallets = await Wallet.create(walletsWithUsers);
    console.log(`${wallets.length} wallets created successfully`);
    
    // Create bookings
    console.log('Creating bookings...');
    const bookingsWithReferences = seedData.bookings.map((booking, index) => {
      // Use first user for all bookings
      const user = users[0];
      // Rotate through routes for variety
      const route = routes[index % routes.length];
      // Get first and last stop from the route
      const routeStops = route.stops;
      const fromStop = routeStops[0];
      const toStop = routeStops[routeStops.length - 1];
      // Find a shuttle for this route
      const shuttle = shuttles.find(s => s.route && s.route.toString() === route._id.toString()) || shuttles[0];
      
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
    console.log(`${bookings.length} bookings created successfully`);
    
    console.log('Database seeding completed successfully!');
    
    // Return summary of created entities
    return {
      users: users.length,
      stops: stops.length,
      routes: routes.length,
      shuttles: shuttles.length,
      wallets: wallets.length,
      bookings: bookings.length
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run the seeding function
seedDatabase()
  .then((summary) => {
    console.log('Seeding summary:', summary);
    console.log('Closing MongoDB connection...');
    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    console.error('Error details:', error.message);
    
    // Handle specific error types
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB server. Make sure MongoDB is running.');
    } else if (error.name === 'ValidationError') {
      console.error('Data validation error. Check your models and data.');
    }
    
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
    process.exit(1);
  }); 