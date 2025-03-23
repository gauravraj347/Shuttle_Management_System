import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { bookingApi, walletApi } from '../services/api';
import { saveAs } from 'file-saver';
import ExpenseAnalytics from '../components/ExpenseAnalytics';

const BookingsHistoryPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [bookings, setBookings] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [frequentRoutes, setFrequentRoutes] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({
    weekly: 0,
    monthly: 0,
    total: 0,
    upcomingCredits: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'bookings'); // 'bookings', 'expenses', 'analytics'
  const [reportPeriod, setReportPeriod] = useState('month'); // 'week', 'month', 'semester'
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings
        const bookingsResponse = await bookingApi.getAll();
        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.data);
          
          // Get frequent routes from API
          const frequentRoutesResponse = await bookingApi.getFrequentRoutes();
          if (frequentRoutesResponse.data.success) {
            setFrequentRoutes(frequentRoutesResponse.data.routes);
          }
        }
        
        // Fetch wallet transactions
        const walletResponse = await walletApi.getTransactions();
        if (walletResponse.data.success) {
          setWalletTransactions(walletResponse.data.transactions);
        }
        
        // Fetch expense summary
        const summaryResponse = await walletApi.getExpenseSummary();
        if (summaryResponse.data.success) {
          setExpenseSummary(summaryResponse.data.summary);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);
  
  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);
  
  // Filter bookings based on status
  const getFilteredBookings = () => {
    if (activeFilter === 'all') {
      return bookings;
    } else if (activeFilter === 'upcoming') {
      return bookings.filter(booking => 
        booking.status === 'upcoming' || booking.status === 'confirmed'
      );
    } else if (activeFilter === 'completed') {
      return bookings.filter(booking => 
        booking.status === 'completed'
      );
    }
    return bookings;
  };
  
  // Get booking status badge color
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-success';
      case 'upcoming':
      case 'confirmed':
        return 'bg-primary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Toggle expanded booking details
  const toggleExpandBooking = (bookingId) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate and download expense report
  const downloadExpenseReport = () => {
    let periodText, periodData;
    const now = new Date();
    
    if (reportPeriod === 'week') {
      periodText = 'Weekly';
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      periodData = walletTransactions.filter(tx => new Date(tx.timestamp) >= oneWeekAgo);
    } else if (reportPeriod === 'month') {
      periodText = 'Monthly';
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      periodData = walletTransactions.filter(tx => new Date(tx.timestamp) >= oneMonthAgo);
    } else {
      periodText = 'Semester';
      // Assuming a semester is roughly 4 months
      const semesterStart = new Date(now - 120 * 24 * 60 * 60 * 1000);
      periodData = walletTransactions.filter(tx => new Date(tx.timestamp) >= semesterStart);
    }
    
    // Generate CSV content
    let csvContent = "Date,Time,Description,Amount,Type\n";
    
    periodData.forEach(tx => {
      const date = formatDate(tx.timestamp);
      const time = formatTime(tx.timestamp);
      const row = `${date},${time},"${tx.description}",${tx.amount},${tx.type}\n`;
      csvContent += row;
    });
    
    // Create total row
    const totalExpenses = periodData
      .filter(tx => tx.type === 'deduction')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const totalCredits = periodData
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    csvContent += `\nTotal Expenses,,,${totalExpenses},deduction\n`;
    csvContent += `Total Credits,,,${totalCredits},credit\n`;
    csvContent += `Net Change,,,${totalCredits - totalExpenses},\n`;
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${periodText}_Expense_Report_${now.toISOString().split('T')[0]}.csv`);
  };
  
  // Book a frequent route
  const bookFrequentRoute = (routeString) => {
    const [from, to] = routeString.split(' to ');
    
    // In a real app, you would find the actual stop IDs here
    // For now, we'll just navigate to the booking page
    const searchParams = new URLSearchParams({
      from,
      to
    }).toString();
    
    window.location.href = `/booking?${searchParams}`;
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
            <p className="mt-2">Loading history data...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="page-container">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Travel Dashboard</h1>
            <p className="lead">View your travel history and manage expenses</p>
          </div>
          <Link to="/booking" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            New Booking
          </Link>
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
        
        {/* Frequent Routes Quick Access */}
        {frequentRoutes.length > 0 && (
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0"><i className="bi bi-star-fill text-warning me-2"></i>Frequent Routes</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {frequentRoutes.map((route, index) => (
                  <div key={index} className="col-md-4 mb-3">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-arrow-right-circle text-primary me-2"></i>
                          {route.route}
                        </h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small">
                            {route.count} {route.count === 1 ? 'trip' : 'trips'}
                          </span>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => bookFrequentRoute(route.route)}
                          >
                            Book Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Expense Summary Card */}
        <div className="row mb-4">
          <div className="col-lg-7 mb-4 mb-lg-0">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="bi bi-graph-up-arrow text-success me-2"></i>Expense Summary</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="text-muted">Weekly Expenses</h6>
                        <h3 className="text-primary">{expenseSummary.weekly} pts</h3>
                        <div className="small text-muted">Last 7 days</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="text-muted">Monthly Expenses</h6>
                        <h3 className="text-primary">{expenseSummary.monthly} pts</h3>
                        <div className="small text-muted">Last 30 days</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="text-muted">Total Expenses</h6>
                        <h3 className="text-primary">{expenseSummary.total} pts</h3>
                        <div className="small text-muted">All time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="bi bi-wallet2 text-success me-2"></i>Upcoming Credits</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center h-100">
                  <div className="me-4">
                    <div className="display-4 fw-bold text-success">{expenseSummary.upcomingCredits}</div>
                    <div className="text-muted small">points</div>
                  </div>
                  <div>
                    <h6>Monthly Allocation</h6>
                    <p className="mb-0 text-muted small">
                      Your next credit allocation will be available on the 1st of next month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <i className="bi bi-card-list me-2"></i>
              Booking History
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              <i className="bi bi-cash-coin me-2"></i>
              Expense Tracking
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="bi bi-bar-chart me-2"></i>
              Analytics
            </button>
          </li>
        </ul>

        {/* Booking History Tab */}
        {activeTab === 'bookings' && (
          <div className="card mb-4">
            <div className="card-header bg-white">
              <ul className="nav nav-pills card-header-pills">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All Bookings
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeFilter === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeFilter === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('completed')}
                  >
                    Completed
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {filteredBookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}></th>
                        <th>Date & Time</th>
                        <th>Route</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Fare</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(booking => (
                        <React.Fragment key={booking._id}>
                          <tr 
                            className={expandedBooking === booking._id ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleExpandBooking(booking._id)}
                          >
                            <td>
                              <button className="btn btn-sm btn-link p-0">
                                <i className={`bi ${expandedBooking === booking._id ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                              </button>
                            </td>
                            <td>
                              {formatDate(booking.departureTime)}
                              <br />
                              <small className="text-muted">
                                {formatTime(booking.departureTime)}
                              </small>
                            </td>
                            <td>
                              {booking.route?.name}
                              {booking.isTransferRoute && (
                                <span className="badge bg-info ms-2">
                                  <i className="bi bi-arrow-repeat me-1"></i>
                                  Transfer
                                </span>
                              )}
                            </td>
                            <td>{booking.fromStop?.name}</td>
                            <td>{booking.toStop?.name}</td>
                            <td>{booking.fare} points</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                          
                          {/* Expanded Booking Details */}
                          {expandedBooking === booking._id && (
                            <tr>
                              <td colSpan="7" className="p-0">
                                <div className="card border-0 bg-light m-2">
                                  <div className="card-body">
                                    {booking.isTransferRoute && booking.legs ? (
                                      <div>
                                        <h6 className="mb-3">
                                          <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                                          Transfer Journey Details
                                        </h6>
                                        
                                        <div className="journey-timeline mb-3">
                                          {booking.legs.map((leg, index) => (
                                            <div key={leg._id} className="mb-3">
                                              <div className="d-flex">
                                                <div className="me-3 journey-timeline-indicator">
                                                  <div className="timeline-bullet"></div>
                                                  {index < booking.legs.length - 1 && <div className="timeline-line"></div>}
                                                </div>
                                                <div className="journey-leg p-3 border rounded">
                                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="mb-0">
                                                      <span className="badge bg-secondary me-2">Leg {index + 1}</span>
                                                      {leg.route?.name}
                                                    </h6>
                                                    <span className={`badge ${getStatusBadgeClass(leg.status)}`}>
                                                      {leg.status}
                                                    </span>
                                                  </div>
                                                  
                                                  <div className="row g-3">
                                                    <div className="col-md-3">
                                                      <div className="text-muted small">From</div>
                                                      <div>{leg.fromStop?.name}</div>
                                                    </div>
                                                    <div className="col-md-3">
                                                      <div className="text-muted small">To</div>
                                                      <div>{leg.toStop?.name}</div>
                                                    </div>
                                                    <div className="col-md-3">
                                                      <div className="text-muted small">Departure</div>
                                                      <div>
                                                        {formatTime(leg.departureTime)}
                                                      </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                      <div className="text-muted small">Fare</div>
                                                      <div>{leg.fare} points</div>
                                                    </div>
                                                  </div>
                                                  
                                                  {index < booking.legs.length - 1 && (
                                                    <div className="mt-3 pt-2 border-top">
                                                      <div className="d-flex align-items-center">
                                                        <i className="bi bi-arrow-down-up text-warning me-2"></i>
                                                        <div>
                                                          <span className="text-muted small">Transfer at</span>
                                                          <div>{leg.toStop?.name}</div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="alert alert-info">
                                          <div className="d-flex align-items-center">
                                            <i className="bi bi-info-circle fs-5 me-2"></i>
                                            <div>
                                              <p className="mb-1">
                                                <strong>One Ticket System:</strong> You're only charged once for the entire journey.
                                              </p>
                                              <p className="mb-0 small">
                                                Total fare ({booking.fare} points) covers all transfers on this booking.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="row">
                                        <div className="col-md-6">
                                          <p className="mb-2">
                                            <strong>Booking ID:</strong> {booking._id.substring(0, 8)}
                                          </p>
                                          <p className="mb-2">
                                            <strong>Created:</strong> {' '}
                                            {formatDate(booking.createdAt)}
                                          </p>
                                          <p className="mb-2">
                                            <strong>Fare Type:</strong> {' '}
                                            {booking.isPeakHour ? 'Peak Hour Rate' : 'Standard Rate'}
                                          </p>
                                        </div>
                                        <div className="col-md-6">
                                          <p className="mb-2">
                                            <strong>Shuttle Route:</strong> {booking.route?.name}
                                          </p>
                                          <p className="mb-2">
                                            <strong>Journey:</strong> {booking.fromStop?.name} → {booking.toStop?.name}
                                          </p>
                                          <p className="mb-0">
                                            <strong>Distance:</strong> {booking.distance || 'N/A'} km
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Book Again button */}
                                    {booking.status === 'completed' && (
                                      <div className="text-end mt-3">
                                        <button 
                                          className="btn btn-primary btn-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            bookFrequentRoute(`${booking.fromStop?.name} to ${booking.toStop?.name}`);
                                          }}
                                        >
                                          <i className="bi bi-arrow-repeat me-2"></i>
                                          Book Again
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="bi bi-calendar-x fs-1 text-muted"></i>
                  <h5 className="mt-3">No bookings found</h5>
                  <p className="text-muted">
                    {activeFilter === 'all' 
                      ? "You haven't made any bookings yet" 
                      : `No ${activeFilter} bookings found`}
                  </p>
                  <Link to="/booking" className="btn btn-primary mt-2">
                    Book a Shuttle Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Expense Tracking Tab */}
        {activeTab === 'expenses' && (
          <div className="card mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Wallet Transactions</h5>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <select 
                    className="form-select form-select-sm"
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="semester">Semester</option>
                  </select>
                </div>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={downloadExpenseReport}
                >
                  <i className="bi bi-download me-1"></i>
                  Download Report
                </button>
              </div>
            </div>
            <div className="card-body">
              {walletTransactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletTransactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{formatDate(transaction.timestamp)}</td>
                          <td>{formatTime(transaction.timestamp)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className={`me-2 transaction-icon ${transaction.type === 'credit' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                                <i className={`bi ${transaction.type === 'credit' ? 'bi-arrow-down' : 'bi-arrow-up'}`}></i>
                              </span>
                              {transaction.description}
                            </div>
                          </td>
                          <td>
                            <span className={transaction.type === 'credit' ? 'text-success' : 'text-danger'}>
                              {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} points
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${transaction.type === 'credit' ? 'bg-success' : 'bg-danger'}`}>
                              {transaction.type === 'credit' ? 'Credit' : 'Deduction'}
                            </span>
                          </td>
                          <td>{transaction.balanceAfter} points</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="bi bi-wallet fs-1 text-muted"></i>
                  <h5 className="mt-3">No transactions found</h5>
                  <p className="text-muted">
                    Your wallet transactions will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <ExpenseAnalytics walletTransactions={walletTransactions} />
        )}
        
        <div className="card">
          <div className="card-header bg-light">
            <h5 className="mb-0">Travel Information</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3 mb-md-0">
                <h6>Fare Rules</h6>
                <ul className="list-unstyled text-muted">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i> Peak-hour pricing applies during 7-9 AM and 4-6 PM</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i> Base fare depends on distance between stops</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i> 10% discount during off-peak hours</li>
                </ul>
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <h6>Transfer Benefits</h6>
                <ul className="list-unstyled text-muted">
                  <li><i className="bi bi-arrow-left-right text-primary me-2"></i> One ticket covers entire journey</li>
                  <li><i className="bi bi-arrow-left-right text-primary me-2"></i> Save time with smart transfer suggestions</li>
                  <li><i className="bi bi-arrow-left-right text-primary me-2"></i> No additional charges for transfers</li>
                </ul>
              </div>
              <div className="col-md-4">
                <h6>Digital Wallet Information</h6>
                <ul className="list-unstyled text-muted">
                  <li><i className="bi bi-info-circle-fill text-primary me-2"></i> 500 points allocated monthly</li>
                  <li><i className="bi bi-info-circle-fill text-primary me-2"></i> Bonus points for frequent travelers</li>
                  <li><i className="bi bi-info-circle-fill text-primary me-2"></i> Download expense reports anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .journey-timeline-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          min-width: 30px;
        }
        .timeline-bullet {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: var(--bs-primary);
          margin-top: 8px;
        }
        .timeline-line {
          width: 2px;
          flex-grow: 1;
          background-color: var(--bs-primary);
          margin: 4px 0;
        }
        .journey-leg {
          flex-grow: 1;
          background-color: white;
        }
        .transaction-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .bg-success-light {
          background-color: rgba(25, 135, 84, 0.1);
        }
        .bg-danger-light {
          background-color: rgba(220, 53, 69, 0.1);
        }
      `}</style>
    </div>
  );
};

export default BookingsHistoryPage; 