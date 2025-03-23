const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['RECHARGE', 'TICKET_PURCHASE', 'REFUND', 'MONTHLY_ALLOCATION', 'ADMIN_ADJUSTMENT'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    default: null
  },
  balance: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema); 