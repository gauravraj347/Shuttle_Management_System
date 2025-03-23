const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID']
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Please provide a route ID']
  },
  fromStopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: [true, 'Please provide a departure stop']
  },
  toStopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: [true, 'Please provide a destination stop']
  },
  departureTime: {
    type: Date,
    required: [true, 'Please provide a departure time']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  fare: {
    type: Number,
    required: [true, 'Please provide fare amount']
  },
  isPeakHour: {
    type: Boolean,
    default: false
  },
  shuttleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shuttle'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema); 