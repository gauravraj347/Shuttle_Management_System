const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a route name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a route description"],
      trim: true,
    },
    stops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
      },
    ],
    distance: {
      type: Number,
      required: [true, "Please provide the route distance"],
    },
    estimatedTime: {
      type: Number,
      required: [true, "Please provide the estimated time in minutes"],
    },
    fare: {
      type: Number,
      required: [true, "Please provide the standard fare"],
    },
 
    schedule: [
      {
        type: String,
        required: true,
      },
    ],
 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", RouteSchema);
