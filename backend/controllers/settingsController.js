// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    // In a real implementation, these settings might be stored in a database
    // For now, we'll just read them from environment variables
    const settings = {
      isDemoMode: process.env.USE_DEMO_DATA === 'true',
      version: process.env.APP_VERSION || '1.0.0',
      features: {
        realTimeTracking: true,
        walletPayments: true,
        aiRecommendations: true
      }
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update system settings (admin only)
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { isDemoMode } = req.body;
    
    // In a real implementation, you would update these settings in a database
    // For now, we'll just return the updated settings
    
    // This is just simulating the update - in a real app, you'd persist this
    process.env.USE_DEMO_DATA = isDemoMode ? 'true' : 'false';
    
    const settings = {
      isDemoMode: process.env.USE_DEMO_DATA === 'true',
      version: process.env.APP_VERSION || '1.0.0',
      features: {
        realTimeTracking: true,
        walletPayments: true,
        aiRecommendations: true
      }
    };
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 