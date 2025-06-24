const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Please provide an amount"],
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: [true, "Please specify the transaction type"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    trim: true,
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
      unique: true,
    },
    balance: {
      type: Number,
      default: 150,
    },
    currency: {
      type: String,
      default: "points",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },
    transactions: [TransactionSchema],
  },
  { timestamps: true }
);

// Method to add a transaction and update balance
WalletSchema.methods.addTransaction = async function (transactionData) {
  // Add the new transaction
  this.transactions.push(transactionData);

  // Update the balance
  if (transactionData.type === "credit") {
    this.balance += transactionData.amount;
  } else {
    this.balance -= transactionData.amount;
  }

  // Save and return
  return this.save();
};

module.exports = mongoose.model("Wallet", WalletSchema);
