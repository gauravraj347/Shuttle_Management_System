const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email'
    ],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true // Only enforce uniqueness if field exists
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'shuttlesecret123456789',
    {
      expiresIn: '30d'
    }
  );
};

// Method to add transaction and update balance
UserSchema.methods.addTransaction = async function(amount, type, description) {
  // Create the transaction
  const transaction = {
    amount,
    type,
    description,
    timestamp: Date.now()
  };

  // Add transaction to history
  this.wallet.transactions.push(transaction);

  // Update balance
  if (type === 'credit') {
    this.wallet.balance += amount;
  } else if (type === 'debit') {
    if (this.wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.wallet.balance -= amount;
  }

  // Save user with updated wallet
  return this.save();
};

// Method to check if email is university email
UserSchema.statics.isUniversityEmail = function(email) {
  // Check for bennett.edu.in domain specifically
  return email.endsWith('@bennett.edu.in');
};

module.exports = mongoose.model('User', UserSchema); 