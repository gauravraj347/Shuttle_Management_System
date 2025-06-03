import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { walletApi, routesApi } from '../services/api';
import RechargeWallet from '../components/RechargeWallet';
import TransactionHistory from '../components/TransactionHistory';

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  
  const [wallet, setWallet] = useState({
    balance: 0,
    currency: 'Points',
    transactions: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  
  // Recharge form state
  const [showRechargeForm, setShowRechargeForm] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(null);
  
  // Fare simulation state
  const [fareSimulation, setFareSimulation] = useState({
    routeId: '',
    baseFare: 30,
    isPeakHour: false,
    estimatedFare: 0,
    showResults: false
  });

  const [expenseSummary, setExpenseSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet', 'transactions', 'settings'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch wallet data
        const walletResponse = await walletApi.getWallet();
        if (walletResponse.data.success) {
          setWallet(walletResponse.data.wallet);
        }
        
        // Fetch routes for fare simulation
        const routesResponse = await routesApi.getAll();
        if (routesResponse.data.success) {
          setRoutes(routesResponse.data.data);
        }

        // Get expense summary
        const summaryResponse = await walletApi.getExpenseSummary();
        if (summaryResponse.data.success) {
          setExpenseSummary(summaryResponse.data.summary);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleRechargeSuccess = (responseData) => {
    // Update wallet balance
    setWallet(prev => ({
      ...prev,
      balance: responseData.data.newBalance
    }));
    
    setRechargeSuccess(`Successfully added ${responseData.data.amountAdded} points to your wallet`);
    setShowRechargeForm(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setRechargeSuccess(null);
    }, 3000);
  };
  
  const handleFareSimulationChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFareSimulation(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  const calculateFare = () => {
    const baseFare = parseInt(fareSimulation.baseFare);
    let estimatedFare = baseFare;
    
    // Apply peak hour pricing
    if (fareSimulation.isPeakHour) {
      estimatedFare = Math.round(baseFare * 1.25); // 25% more during peak hours
    } else {
      estimatedFare = Math.round(baseFare * 0.9); // 10% discount during off-peak
    }
    
    // Set the results
    setFareSimulation(prev => ({
      ...prev,
      estimatedFare,
      showResults: true
    }));
  };

  // If not authenticated, redirect to login
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (authLoading || loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col">
            <h1>{user?.role === 'admin' ? 'Admin Profile' : 'Student Profile'}</h1>
            <p className="lead">Manage your account and wallet</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {rechargeSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {rechargeSuccess}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setRechargeSuccess(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">Personal Information</h5>
              </div>
              <div className="card-body">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                
                {user?.studentId && (
                  <p><strong>Student ID:</strong> {user.studentId}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-8 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Digital Wallet</h5>
                <span className={`badge ${wallet.balance > 100 ? 'bg-success' : 'bg-warning'} fs-6`}>
                  Balance: {wallet.balance} {wallet.currency}
                </span>
              </div>
              <div className="card-body">
                <ul className="nav nav-tabs nav-fill mb-4">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'wallet' ? 'active' : ''}`}
                      onClick={() => setActiveTab('wallet')}
                    >
                      <i className="bi bi-wallet2 me-1"></i> Wallet
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                      onClick={() => setActiveTab('transactions')}
                    >
                      <i className="bi bi-list-check me-1"></i> Transactions
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                      onClick={() => setActiveTab('settings')}
                    >
                      <i className="bi bi-gear me-1"></i> Settings
                    </button>
                  </li>
                </ul>
                
                {activeTab === 'wallet' && (
                  <div className="wallet-tab">
                    {!showRechargeForm ? (
                      <div className="text-center my-3">
                        <div className="wallet-balance-display mb-4">
                          <div className="display-4 fw-bold">{wallet.balance}</div>
                          <div className="text-muted">Available Points</div>
                        </div>
                        
                        <button 
                          className="btn btn-primary btn-lg" 
                          onClick={() => setShowRechargeForm(true)}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Recharge Wallet
                        </button>
                        
                        {expenseSummary && (
                          <div className="expense-summary mt-4">
                            <h6 className="mb-3">Monthly Usage Summary</h6>
                            <div className="row g-3">
                              <div className="col-6">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <h3>{expenseSummary.thisMonth}</h3>
                                    <div className="text-muted small">Points spent this month</div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <h3>{expenseSummary.lastMonth}</h3>
                                    <div className="text-muted small">Points spent last month</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <button 
                          className="btn btn-outline-secondary mb-3"
                          onClick={() => setShowRechargeForm(false)}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back to Wallet
                        </button>
                        <RechargeWallet onSuccess={handleRechargeSuccess} />
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'transactions' && (
                  <div className="transactions-tab">
                    <TransactionHistory />
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="settings-tab">
                    <h6 className="mb-3">Wallet Settings</h6>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="lowBalanceNotification" checked />
                        <label className="form-check-label" htmlFor="lowBalanceNotification">
                          Low Balance Notifications
                        </label>
                      </div>
                      <div className="form-text">Get notified when your balance falls below 50 points</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="transactionNotification" checked />
                        <label className="form-check-label" htmlFor="transactionNotification">
                          Transaction Notifications
                        </label>
                      </div>
                      <div className="form-text">Get notified for each transaction</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Default Payment Method</label>
                      <select className="form-select">
                        <option value="creditCard">Credit Card</option>
                        <option value="upi">UPI</option>
                        <option value="bankTransfer">Bank Transfer</option>
                      </select>
                    </div>
                    
                    <button className="btn btn-primary">Save Settings</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 