import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { bookingApi, walletApi } from '../services/api';
import { saveAs } from 'file-saver';

const BookingsHistoryPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [bookings, setBookings] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [frequentRoutes, setFrequentRoutes] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({
    weekly: 0,
    monthly: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'bookings');
  const [reportPeriod, setReportPeriod] = useState('day');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings
        const bookingsResponse = await bookingApi.getAll();
        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.data);
          
          // Get frequent routes
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
          setExpenseSummary({
            weekly: summaryResponse.data.summary.weekly,
            monthly: summaryResponse.data.summary.monthly,
          });
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
  
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);
  
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

  const toggleExpandBooking = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
    } else {
      periodText = 'Monthly';
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      periodData = walletTransactions.filter(tx => new Date(tx.timestamp) >= oneMonthAgo);
    }
    
    let csvContent = "Date,Time,Description,Amount,Type\n";
    
    periodData.forEach(tx => {
      const date = formatDate(tx.timestamp);
      const time = formatTime(tx.timestamp);
      const row = `${date},${time},"${tx.description}",${tx.amount},${tx.type}\n`;
      csvContent += row;
    });
    
    const totalExpenses = periodData
      .filter(tx => tx.type === 'deduction')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    csvContent += `\nTotal Expenses,,,${totalExpenses},deduction\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${periodText}_Expense_Report_${now.toISOString().split('T')[0]}.csv`);
  };
  
  const bookFrequentRoute = (routeString) => {
    const [from, to] = routeString.split(' to ');
    const searchParams = new URLSearchParams({ from, to }).toString();
    window.location.href = `/booking?${searchParams}`;
  };

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
            <h1>Travel History</h1>
            <p className="lead">View your past trips and manage expenses</p>
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
        
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="bi bi-graph-up-arrow text-success me-2"></i>Expense Summary</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="text-muted">Weekly Expenses</h6>
                        <h3 className="text-primary">{expenseSummary.weekly} pts</h3>
                        <div className="small text-muted">Last 7 days</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card border-0 bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="text-muted">Monthly Expenses</h6>
                        <h3 className="text-primary">{expenseSummary.monthly} pts</h3>
                        <div className="small text-muted">Last 30 days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <i className="bi bi-card-list me-2"></i>
              <span style={{ color: 'black' }}>Booking History</span>
            </button>
          </li>
        </ul>

        {activeTab === 'bookings' && (
          <div className="card mb-4">
            
            <div className="card-body">
              {filteredBookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}></th>
                        <th>Created Date & Time</th>
                        <th>Departure Stop</th>
                        <th>Arriving Stop</th>
                        <th>Points</th>
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
                              {formatDate(booking.createdAt)}
                              <br />
                              <small className="text-muted">
                                {formatTime(booking.createdAt)}
                              </small>
                            </td>
                            <td>{booking.fromStopId?.name}</td>
                            <td>{booking.toStopId?.name}</td>
                            <td>{booking.fare} points</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                          {expandedBooking === booking._id && (
                            <tr>
                              <td colSpan="6" className="p-0">
                                <div className="card border-0 bg-light m-2">
                                  <div className="card-body">
                                    <div className="row">
                                      <div className="col-md-6">
                                        <p className="mb-2">
                                          <strong>Booking ID:</strong> {booking._id.substring(0, 8)}
                                        </p>
                                        <p className="mb-2">
                                          <strong>Departure:</strong> {formatDate(booking.departureTime)} at {formatTime(booking.departureTime)}
                                        </p>
                                      </div>
                                      <div className="col-md-6">
                                        <p className="mb-0">
                                          <strong>Points Deducted:</strong> {booking.fare} points
                                        </p>
                                      </div>
                                    </div>
                                    {booking.status === 'completed' && (
                                      <div className="text-end mt-3">
                                        <button 
                                          className="btn btn-primary btn-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            bookFrequentRoute(`${booking.fromStopId?.name} to ${booking.toStopId?.name}`);
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
      </div>
      
      <style jsx="true">{`
        .page-container {
          background-color: #f8f9fa;
        }
        .card {
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          color: black;
        }
        .badge {
          padding: 0.5em 0.75em;
        }
      `}</style>
    </div>
  );
};

export default BookingsHistoryPage;