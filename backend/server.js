const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import route files
const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes');
const shuttleRoutes = require('./routes/shuttles');
const stopRoutes = require('./routes/stops');
const walletRoutes = require('./routes/wallet');
const bookingRoutes = require('./routes/bookings');
const recommendationRoutes = require('./routes/recommendations');
const settingsRoutes = require('./routes/settings');

// Import database seeder
//const seedDatabase = require('./utils/seeder');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow the frontend origin
  credentials: true // Allow cookies to be sent with requests
}));
app.use(bodyParser.json());
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Shuttle Management System API is running');
});

// Use API routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/settings', settingsRoutes);

// Set environment variable for demo mode
process.env.USE_DEMO_DATA = process.env.SEED_DEMO_DATA;

// MongoDB connection string
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle-management';

// Check if we should seed demo data
const SEED_DEMO_DATA = process.env.SEED_DEMO_DATA === 'true';

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    
    // Seed demo data if enabled
    // if (SEED_DEMO_DATA) {
    //   console.log('Seeding demo data...');
    //   const seeded = await seedDatabase();
    //   if (seeded) {
    //     console.log('Demo data seeded successfully');
    //   } else {
    //     console.log('Failed to seed demo data');
    //   }
    // }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      //console.log(`Demo mode: ${process.env.USE_DEMO_DATA === 'true' ? 'ON' : 'OFF'}`);
    });
  } catch (error) {
    console.error('Server starting error:', error.message);
    process.exit(1);
  }
};

startServer(); 