const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Transaction = require('../models/Transaction');

// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    // Find wallet by user ID
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    // If wallet doesn't exist, create a default one
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
        currency: 'Points'
      });
    }
    
    // Get latest transactions
    const transactions = await WalletTransaction.find({ 
      wallet: wallet._id 
    }).sort({ createdAt: -1 }).limit(10);
    
    res.status(200).json({
      success: true,
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
        lastUpdated: wallet.updatedAt
      },
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add funds to wallet (recharge)
// @route   POST /api/wallet/recharge
// @access  Private
exports.rechargeWallet = async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid amount' 
      });
    }
    
    // In a real application, integrate with a payment gateway
    // This is a simplified version for demonstration
    
    // 1. Process payment (simulation)
    const paymentSuccess = true;
    const paymentId = 'PAY_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    if (!paymentSuccess) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment processing failed. Please try again.' 
      });
    }
    
    // 2. Update wallet balance
    let wallet = await Wallet.findOne({ user: userId });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: 0,
        currency: 'Points'
      });
    }
    
    const oldBalance = wallet.balance;
    wallet.balance += Number(amount);
    wallet.lastRechargeDate = Date.now();
    await wallet.save();
    
    // 3. Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      amount: Number(amount),
      type: 'RECHARGE',
      description: `Account recharge via ${paymentMethod}`,
      reference: paymentId,
      balance: wallet.balance
    });
    
    await transaction.save();
    
    // 4. Return success response
    return res.status(200).json({
      success: true,
      message: 'Wallet recharged successfully',
      data: {
        oldBalance,
        newBalance: wallet.balance,
        amountAdded: Number(amount),
        transactionId: transaction._id,
        paymentId
      }
    });
    
  } catch (error) {
    console.error('Wallet recharge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to recharge wallet',
      error: error.message
    });
  }
};

// @desc    Use wallet funds (for booking)
// @route   POST /api/wallet/use
// @access  Private
exports.useWalletFunds = async (req, res) => {
  try {
    const { amount, description, routeId, isPeakHour } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Calculate fare with dynamic pricing
    const finalAmount = calculateFare(amount, isPeakHour);
    
    // Check if user has sufficient balance
    if (user.wallet.balance < finalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient wallet balance'
      });
    }
    
    // Add transaction to wallet
    await user.addTransaction(
      finalAmount, 
      'debit', 
      description || `Shuttle booking payment for route ${routeId || 'unknown'} ${isPeakHour ? '(Peak hour)' : '(Off-peak)'}`
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      fareDetails: {
        baseFare: amount,
        finalFare: finalAmount,
        isPeakHour: isPeakHour || false
      },
      wallet: {
        balance: user.wallet.balance,
        currency: user.wallet.currency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin adds funds to student wallet
// @route   POST /api/wallet/admin/add
// @access  Private/Admin
exports.adminAddFunds = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Add transaction to wallet
    await user.addTransaction(
      amount, 
      'credit', 
      description || 'Admin added funds'
    );
    
    res.status(200).json({
      success: true,
      message: 'Funds added successfully',
      wallet: {
        balance: user.wallet.balance,
        currency: user.wallet.currency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin deducts funds from student wallet (for violations)
// @route   POST /api/wallet/admin/deduct
// @access  Private/Admin
exports.adminDeductFunds = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason for deduction is required' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user has sufficient balance
    if (user.wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'User has insufficient balance for this deduction'
      });
    }
    
    // Add transaction to wallet
    await user.addTransaction(
      amount, 
      'debit', 
      `Admin deduction: ${reason}`
    );
    
    res.status(200).json({
      success: true,
      message: 'Funds deducted successfully',
      wallet: {
        balance: user.wallet.balance,
        currency: user.wallet.currency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin bulk allocates points to multiple students
// @route   POST /api/wallet/admin/bulk-allocate
// @access  Private/Admin
exports.adminBulkAllocatePoints = async (req, res) => {
  try {
    const { userIds, amount, description, isMonthly } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs are required (as an array)' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    // Create a period label for the transaction description
    const periodLabel = isMonthly ? 'monthly' : 'semester';
    const transactionDescription = description || `Admin ${periodLabel} allocation`;
    
    // Process each user
    const results = [];
    let failedCount = 0;
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        
        if (user) {
          await user.addTransaction(amount, 'credit', transactionDescription);
          results.push({
            userId,
            success: true,
            newBalance: user.wallet.balance
          });
        } else {
          failedCount++;
          results.push({
            userId,
            success: false,
            message: 'User not found'
          });
        }
      } catch (error) {
        failedCount++;
        results.push({
          userId,
          success: false,
          message: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk allocation complete. ${userIds.length - failedCount} successful, ${failedCount} failed.`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all student wallets for admin
// @route   GET /api/wallet/admin/students
// @access  Private/Admin
exports.getStudentWallets = async (req, res) => {
  try {
    // Find all users with role 'student'
    const students = await User.find({ role: 'student' }).select('_id name email studentId');
    
    // For each student, find their wallet or create one if it doesn't exist
    const studentWallets = await Promise.all(
      students.map(async (student) => {
        let wallet = await Wallet.findOne({ user: student._id });
        
        // If wallet doesn't exist, create a default one
        if (!wallet) {
          wallet = new Wallet({
            user: student._id,
            balance: 0,
            currency: 'Points'
          });
          await wallet.save();
        }
        
        // Return student with wallet info
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          studentId: student.studentId || 'N/A',
          wallet: {
            _id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
            lastUpdated: wallet.updatedAt
          }
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      count: studentWallets.length,
      data: studentWallets
    });
    
  } catch (error) {
    console.error('Error fetching student wallets:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user transaction history
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    // Get transactions for this wallet
    const transactions = await WalletTransaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 }) // Sort by date, newest first
      .limit(100); // Limit to last 100 transactions
    
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate fare based on dynamic pricing
function calculateFare(baseFare, isPeakHour = false) {
  // Apply peak hour surcharge (25% more)
  if (isPeakHour) {
    return Math.round(baseFare * 1.25);
  }
  
  // Apply off-peak discount (10% less)
  return Math.round(baseFare * 0.9);
}

// Handle bulk allocation of funds (monthly/semester credits or bonus)
exports.bulkAllocate = async (req, res) => {
  try {
    const { userIds, amount, type, reason, note } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one user ID'
      });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    // Determine transaction type and description based on allocation type
    let transactionType, description;
    
    if (type === 'monthly') {
      transactionType = 'MONTHLY_ALLOCATION';
      description = `Monthly credit allocation${note ? `: ${note}` : ''}`;
    } else if (type === 'semester') {
      transactionType = 'MONTHLY_ALLOCATION';
      description = `Semester credit allocation${note ? `: ${note}` : ''}`;
    } else if (type === 'bonus') {
      transactionType = 'ADMIN_ADJUSTMENT';
      
      let bonusReason = '';
      switch(reason) {
        case 'frequent_user':
          bonusReason = 'Frequent user reward';
          break;
        case 'special_occasion':
          bonusReason = 'Special occasion bonus';
          break;
        default:
          bonusReason = 'Bonus points';
      }
      
      description = `${bonusReason}${note ? `: ${note}` : ''}`;
    } else {
      transactionType = 'ADMIN_ADJUSTMENT';
      description = `Credit allocation${note ? `: ${note}` : ''}`;
    }
    
    // Process each user
    const results = [];
    let successCount = 0;
    
    for (const userId of userIds) {
      try {
        // Find user's wallet
        let wallet = await Wallet.findOne({ user: userId });
        
        // Create wallet if it doesn't exist
        if (!wallet) {
          wallet = new Wallet({
            user: userId,
            balance: 0
          });
        }
        
        // Update wallet balance
        const oldBalance = wallet.balance;
        wallet.balance += Number(amount);
        await wallet.save();
        
        // Create transaction record
        const transaction = new WalletTransaction({
          wallet: wallet._id,
          amount: Number(amount),
          type: transactionType,
          description,
          balance: wallet.balance,
          reference: `ADMIN-${Date.now()}`
        });
        
        await transaction.save();
        
        results.push({
          userId,
          success: true,
          oldBalance,
          newBalance: wallet.balance
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.push({
          userId,
          success: false,
          error: error.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Successfully allocated funds to ${successCount} out of ${userIds.length} users`,
      results
    });
    
  } catch (error) {
    console.error('Bulk allocation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Handle deduction of funds (penalties)
exports.deductFunds = async (req, res) => {
  try {
    const { userId, amount, reason, note } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a user ID'
      });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found for this user'
      });
    }
    
    // Determine description based on reason
    let description;
    switch(reason) {
      case 'cancellation':
        description = `Penalty: Last-minute cancellation${note ? ` - ${note}` : ''}`;
        break;
      case 'no_show':
        description = `Penalty: No-show${note ? ` - ${note}` : ''}`;
        break;
      case 'rule_violation':
        description = `Penalty: Rule violation${note ? ` - ${note}` : ''}`;
        break;
      default:
        description = `Penalty${note ? `: ${note}` : ''}`;
    }
    
    // Update wallet balance
    const oldBalance = wallet.balance;
    wallet.balance = Math.max(0, wallet.balance - Number(amount)); // Prevent negative balance
    await wallet.save();
    
    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      amount: -Number(amount), // Negative amount for deduction
      type: 'ADMIN_ADJUSTMENT',
      description,
      balance: wallet.balance,
      reference: `PENALTY-${Date.now()}`
    });
    
    await transaction.save();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully deducted funds',
      data: {
        userId,
        oldBalance,
        newBalance: wallet.balance,
        amountDeducted: Number(amount),
        transactionId: transaction._id
      }
    });
    
  } catch (error) {
    console.error('Deduct funds error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 