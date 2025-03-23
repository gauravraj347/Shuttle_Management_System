const mongoose = require('mongoose');

const ShuttleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a shuttle name'],
    trim: true,
    unique: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide a vehicle number'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide the shuttle capacity']
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'out-of-service'],
    default: 'inactive'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  currentRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  currentStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  },
  nextStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  },
  estimatedArrival: {
    type: Date
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  features: {
    type: [String],
    enum: ['Wifi', 'USB Charging', 'Air Conditioning', 'Disabled Access', 'Bike Rack'],
    default: []
  }
}, { timestamps: true });

ShuttleSchema.set('strictPopulate', false);

ShuttleSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Shuttle', ShuttleSchema); 