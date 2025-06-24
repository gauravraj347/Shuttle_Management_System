const mongoose = require("mongoose");

const StopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a stop name"],
      trim: true,
      unique: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
   
    routes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create a geospatial index for location-based queries
StopSchema.index({ location: "2dsphere" });   //calculating distance between coordinates,

module.exports = mongoose.model("Stop", StopSchema);
