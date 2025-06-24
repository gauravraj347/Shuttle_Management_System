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

router.get('/transactions', protect, getTransactions);

router.post('/bulk-allocate', protect, authorize('admin'), bulkAllocate);

router.post('/deduct', protect, authorize('admin'), deductFunds);

module.exports = router; 