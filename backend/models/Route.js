const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a route name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a route description'],
    trim: true
  },
  stops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  }],
  distance: {
    type: Number,
    required: [true, 'Please provide the route distance']
  },
  estimatedTime: {
    type: Number,
    required: [true, 'Please provide the estimated time in minutes']
  },
  fare: {
    type: Number,
    required: [true, 'Please provide the standard fare']
  },
  peakHourFare: {
    type: Number,
    required: [true, 'Please provide the peak hour fare']
  },
  schedule: [{
    day: {
      type: String,
      enum: ['weekday', 'weekend', 'holiday'],
      required: [true, 'Please specify the day type']
    },
    departureTime: {
      type: [String],
      required: [true, 'Please provide departure times']
    }
  }],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema); 