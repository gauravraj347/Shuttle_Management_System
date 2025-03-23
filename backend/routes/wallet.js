const express = require('express');
const { 
  getWallet, 
  rechargeWallet, 
  useWalletFunds,
  adminAddFunds,
  adminDeductFunds,
  adminBulkAllocatePoints,
  getStudentWallets,
  getTransactions,
  bulkAllocate,
  deductFunds
} = require('../controllers/walletController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Get wallet balance and transactions
router.get('/', protect, getWallet);

// Recharge wallet - for students
router.post('/recharge', protect, rechargeWallet);

// Use wallet funds - for students
router.post('/use', protect, useWalletFunds);

// Admin routes - requires admin role
// Add funds to a single user's wallet
router.post('/admin/add', protect, authorize('admin'), adminAddFunds);

// Deduct funds from a single user's wallet
router.post('/admin/deduct', protect, authorize('admin'), adminDeductFunds);

// Bulk allocate points to multiple students
router.post('/admin/bulk-allocate', protect, authorize('admin'), adminBulkAllocatePoints);

// Get all student wallets
router.get('/admin/students', protect, authorize('admin'), getStudentWallets);

// @route   GET /api/wallet/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/transactions', protect, getTransactions);

// @route   POST /api/wallet/bulk-allocate
// @desc    Bulk allocate credits (monthly, semester, or bonus)
// @access  Private (Admin only)
router.post('/bulk-allocate', protect, authorize('admin'), bulkAllocate);

// @route   POST /api/wallet/deduct
// @desc    Deduct points for violations
// @access  Private (Admin only)
router.post('/deduct', protect, authorize('admin'), deductFunds);

module.exports = router; 