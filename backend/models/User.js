const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [/^[\w-\.]+@bennett\.edu\.in$/, "Please provide a valid email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    studentId: {
      type: String,
      sparse: true, // Only enforce uniqueness if field exists
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// Method to add transaction and update balance
UserSchema.methods.addTransaction = async function (amount, type, description) {
  // Create the transaction
  const transaction = {
    amount,
    type,
    description,
    timestamp: Date.now(),
  };

  // Add transaction to history
  this.wallet.transactions.push(transaction);

  // Update balance
  if (type === "credit") {
    this.wallet.balance += amount;
  } else if (type === "debit") {
    if (this.wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }
    this.wallet.balance -= amount;
  }

  // Save user with updated wallet
  return this.save();
};

// Method to check if email is university email
UserSchema.statics.isUniversityEmail = function (email) {
  // Check for bennett.edu.in domain specifically
  return email.endsWith("@bennett.edu.in");
};

module.exports = mongoose.model("User", UserSchema);
