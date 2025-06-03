import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { bookingApi, stopsApi, walletApi } from '../services/api';

// Mock data generator for emergency cases
const generateMockRecommendations = (fromStopId, toStopId) => {
  // Get stop names
  const getStopName = (stopId) => {
    switch(stopId) {
      case 'stop-001': return 'Main Building';
      case 'stop-002': return 'Science Block';
      case 'stop-003': return 'Library';
      case 'stop-004': return 'Cafeteria';
      default: return 'Unknown Stop';
    }
  };
  
  const currentTime = new Date();
  const fromStopName = getStopName(fromStopId);
  const toStopName = getStopName(toStopId);
  
  // Generate mock recommendations response
  return {
    data: {
      success: true,
      recommendations: [
        // Direct Express Route (Fastest)
        {
          routeId: 'route-001',
          routeName: 'Express Direct',
          departureTime: new Date(currentTime),
          arrivalTime: new Date(new Date(currentTime).getTime() + 10 * 60000),
          fare: 35,
          distance: 2.8,
          distanceInKm: 2.8,
          fromStop: { _id: fromStopId, name: fromStopName },
          toStop: { _id: toStopId, name: toStopName },
          travelTime: 10,
          occupancy: 'medium',
          directRoute: true,
          transfers: [],
          legs: [],
          timeSaved: 0,
          transferBenefits: null,
          stops: [
            { stopId: fromStopId, name: fromStopName, arrivalTime: null, departureTime: new Date(currentTime) },
            { stopId: toStopId, name: toStopName, arrivalTime: new Date(new Date(currentTime).getTime() + 10 * 60000), departureTime: null }
          ]
        },
        // Campus Loop (Slower but cheaper)
        {
          routeId: 'route-002',
          routeName: 'Campus Loop',
          departureTime: new Date(new Date(currentTime).getTime() + 5 * 60000),
          arrivalTime: new Date(new Date(currentTime).getTime() + 20 * 60000),
          fare: 25,
          distance: 3.5,
          distanceInKm: 3.5,
          fromStop: { _id: fromStopId, name: fromStopName },
          toStop: { _id: toStopId, name: toStopName },
          travelTime: 15,
          occupancy: 'low',
          directRoute: true,
          transfers: [],
          legs: [],
          timeSaved: 0,
          transferBenefits: null,
          stops: [
            { stopId: fromStopId, name: fromStopName, arrivalTime: null, departureTime: new Date(new Date(currentTime).getTime() + 5 * 60000) },
            { stopId: 'stop-003', name: 'Library', arrivalTime: new Date(new Date(currentTime).getTime() + 10 * 60000), departureTime: new Date(new Date(currentTime).getTime() + 11 * 60000) },
            { stopId: 'stop-004', name: 'Cafeteria', arrivalTime: new Date(new Date(currentTime).getTime() + 15 * 60000), departureTime: new Date(new Date(currentTime).getTime() + 16 * 60000) },
            { stopId: toStopId, name: toStopName, arrivalTime: new Date(new Date(currentTime).getTime() + 20 * 60000), departureTime: null }
          ]
        }
      ],
      nearbyStops: [
        { _id: 'stop-001', stopId: 'stop-001', name: 'Main Building', distance: 0.1, walkingTime: 2 },
        { _id: 'stop-002', stopId: 'stop-002', name: 'Science Block', distance: 0.2, walkingTime: 4 },
        { _id: 'stop-003', stopId: 'stop-003', name: 'Library', distance: 0.3, walkingTime: 5 }
      ],
      transferStats: {
        averageWaitTime: 5,
        averageTimeSaved: 8,
        popularTransferPoints: [
          { name: 'Campus Cross', popularity: 'high' },
          { name: 'Student Center', popularity: 'medium' }
        ],
        peakHours: ['08:00-09:00', '17:00-18:00'],
        routeFrequency: {
          'route-001': '15 min',
          'route-002': '20 min'
        }
      }
    }
  };
};

const BookingPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stops, setStops] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [transferStats, setTransferStats] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // Form state
  const [bookingForm, setBookingForm] = useState({
    fromStopId: '',
    toStopId: '',
    preferredCriteria: 'fastest', // 'fastest', 'cheapest', 'least_crowded', 'fewest_transfers'
  });
  
  // Selected route for booking
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Fetch stops from database
  useEffect(() => {
    const fetchStops = async () => {
      try {
        setLoading(true);
        const response = await stopsApi.getAll();
        if (response.data && response.data.success) {
          setStops(response.data.data);
        } else {
          console.error('Error in stops response:', response.data);
          setError('Failed to load stops');
        }
      } catch (error) {
        console.error('Error fetching stops:', error);
        setError('Failed to load stops. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStops();
  }, []);
  
  // Fetch wallet data if authenticated
  useEffect(() => {
    const fetchWallet = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const walletResponse = await walletApi.getWallet();
          if (walletResponse.data.success) {
            setWallet(walletResponse.data.wallet);
          }
        } catch (error) {
          console.error('Error fetching wallet:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchWallet();
  }, [isAuthenticated]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search for route recommendations
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    // Validate form inputs
    if (!bookingForm.fromStopId) {
      setError('Please select a departure stop');
      return;
    }
    
    if (!bookingForm.toStopId) {
      setError('Please select an arrival stop');
      return;
    }
    
    if (bookingForm.fromStopId === bookingForm.toStopId) {
      setError('Please select different stops for departure and arrival');
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      console.log('Sending search params:', {
        fromStopId: bookingForm.fromStopId,
        toStopId: bookingForm.toStopId,
        preferredCriteria: bookingForm.preferredCriteria || 'fastest'
      });
      
      // Make the API call to get recommendations
      const response = await bookingApi.getRecommendations({
        fromStopId: bookingForm.fromStopId,
        toStopId: bookingForm.toStopId,
        preferredCriteria: bookingForm.preferredCriteria || 'fastest'
      });
      
      setIsUsingMockData(false);
      console.log('Search response:', response.data);
      
      if (response.data && response.data.success === true) {
        // Check for recommendations array
        if (Array.isArray(response.data.recommendations)) {
          if (response.data.recommendations.length === 0) {
            setError('No routes found between these stops. Please try different stops.');
            setRecommendations([]);
          } else {
            setRecommendations(response.data.recommendations);
            // Clear any previous errors
            setError(null);
          }
        } else {
          setRecommendations([]);
          console.warn('No recommendations array in response', response.data);
          setError('Invalid response format from server.');
        }
        
        // Check for nearbyStops array
        if (Array.isArray(response.data.nearbyStops)) {
          setNearbyStops(response.data.nearbyStops);
        } else {
          setNearbyStops([]);
        }
        
        // Check for transferStats object
        if (response.data.transferStats) {
          setTransferStats(response.data.transferStats);
        } else {
          setTransferStats(null);
        }
        
        setSelectedRoute(null); // Clear selected route
      } else {
        const errorMsg = (response.data && response.data.message) ? 
          response.data.message : 'Failed to get route recommendations';
        setError(errorMsg);
        console.error('Error in route recommendation response:', response.data);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Route recommendation error:', error);
      setRecommendations([]);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        const errorMessage = error.response.data.message || 'Error getting route recommendations';
        setError(errorMessage);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('Network error - please check your connection and ensure the backend server is running');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle booking confirmation
  const handleBooking = async () => {
    if (!selectedRoute) {
      setError('Please select a route first');
      return;
    }
    
    try {
      setLoading(true);
      
      if (selectedRoute.fare > wallet.balance) {
        setError('Insufficient wallet balance for this booking');
        setLoading(false);
        return;
      }
      
      // For non-transfer routes
      let bookingPayload = {
        routeId: selectedRoute.routeId,
        fromStopId: bookingForm.fromStopId,
        toStopId: bookingForm.toStopId,
        fare: selectedRoute.fare,
        departureTime: selectedRoute.departureTime,
        isPeakHour: selectedRoute.isPeakHour
      };
      
      // Add transfer information for multi-leg journeys
      if (!selectedRoute.directRoute && selectedRoute.legs) {
        bookingPayload = {
          ...bookingPayload,
          isTransferRoute: true,
          legs: selectedRoute.legs.map(leg => ({
            routeId: leg.routeId,
            fromStopId: leg.fromStop._id,
            toStopId: leg.toStop._id,
            fare: leg.fare
          }))
        };
      }
      
      // Send booking request to API
      const response = await bookingApi.create(bookingPayload);
      
      if (response.data.success) {
        setBookingSuccess(`Booking confirmed! Your booking ID is ${response.data.data._id}`);
        setSelectedRoute(null);
        // Reset form
        setBookingForm({
          fromStopId: '',
          toStopId: '',
          preferredCriteria: 'fastest'
        });
        setRecommendations([]);
      } else {
        setError(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle route selection
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
  };
  
  // Format money amount
  const formatMoney = (amount) => {
    return amount.toFixed(2);
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
            <p className="mt-2">Loading booking page...</p>
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
            <h1>Book a Shuttle</h1>
            <p className="lead">Find the best route between stops </p>
          </div>
        </div>
        
        {/* Wallet balance indicator */}
        <div className="row mb-4">
          <div className="col">
            <div className="alert alert-info d-flex justify-content-between align-items-center">
              <div>
                <i className="bi bi-wallet2 me-2"></i>
                Current Balance: <strong>{wallet.balance} Points</strong>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate('/profile')}
              >
                Recharge Wallet
              </button>
            </div>
          </div>
        </div>

        {isUsingMockData && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Using demo data.</strong> The system is currently running in offline mode with sample routes.
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setIsUsingMockData(false)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <div className="mt-2">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-light me-2" 
                onClick={() => handleSearch(null)}
              >
                Use Demo Data
              </button>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        {bookingSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {bookingSuccess}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setBookingSuccess(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Find Routes</h5>
              </div>
              <div className="card-body">
                <form id="search-form" onSubmit={handleSearch}>
                  <div className="mb-3">
                    <label htmlFor="fromStopId" className="form-label">Departure Stop</label>
                    <select
                      className="form-control"
                      id="fromStopId"
                      name="fromStopId"
                      value={bookingForm.fromStopId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Departure Stop</option>
                      {stops.map(stop => (
                        <option key={stop._id} value={stop._id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="toStopId" className="form-label">Arrival Stop</label>
                    <select
                      className="form-control"
                      id="toStopId"
                      name="toStopId"
                      value={bookingForm.toStopId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Arrival Stop</option>
                      {stops.map(stop => (
                        <option key={stop._id} value={stop._id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>
                        Find Routes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Nearby Stops Suggestions */}
            {nearbyStops.length > 0 && (
              <div className="card mt-4">
                <div className="card-header">
                  <h5 className="mb-0">Nearby Stops</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted small">Consider these stops that are within walking distance</p>
                  <div className="list-group">
                    {nearbyStops.map(stop => (
                      <button
                        key={stop._id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => handleSelectRoute(stop)}
                      >
                        <div>
                          <h6 className="mb-1">{stop.name}</h6>
                          <p className="mb-1 small text-muted">
                            {stop.distance} km away • {stop.walkingTime} min walking
                          </p>
                        </div>
                        <span className="badge bg-primary rounded-pill">Use</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Transfer Benefits Info */}
            {transferStats && (
              <div className="card mt-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">Transfer Benefits</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Transferring between routes can save you time and points
                  </p>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-1">
                      <i className="bi bi-clock text-primary me-2"></i>
                      <span>Average time saved: <strong>{transferStats.averageTimeSaved} minutes</strong></span>
                    </div>
                  </div>
                  
                  <p className="mb-2 small fw-bold">Popular Transfer Points:</p>
                  <ul className="list-group list-group-flush mb-3">
                    {transferStats.popularTransferPoints.map((point, idx) => (
                      <li key={idx} className="list-group-item py-2 px-0 border-0">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-arrow-left-right text-success me-2"></i>
                          <div>
                            <span className="fw-medium">{point.name}</span>
                            <span className={`ms-2 badge ${
                              point.popularity === 'high' ? 'bg-success' : 
                              point.popularity === 'medium' ? 'bg-info' : 'bg-secondary'
                            }`}>{point.popularity}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-muted small">
                    <p className="mb-1">
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      One-ticket system for all transfers
                    </p>
                    <p className="mb-0">
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      No additional fare charges for transfers
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-lg-8">
            {recommendations.length > 0 ? (
              <>
                <h5 className="mb-3">Recommended Routes</h5>
                {recommendations.map((route, index) => (
                  <div 
                    key={index} 
                    className={`card mb-3 ${selectedRoute && selectedRoute.routeId === route.routeId ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectRoute(route)}
                  >
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        {route.routeName} 
                        {index === 0 && bookingForm.preferredCriteria === 'fastest' && 
                          <span className="badge bg-success ms-2">Fastest</span>
                        }
                        {index === 0 && bookingForm.preferredCriteria === 'cheapest' && 
                          <span className="badge bg-info ms-2">Best Value</span>
                        }
                        {index === 0 && bookingForm.preferredCriteria === 'least_crowded' && 
                          <span className="badge bg-warning ms-2">Least Crowded</span>
                        }
                        {index === 0 && bookingForm.preferredCriteria === 'fewest_transfers' && 
                          <span className="badge bg-secondary ms-2">Fewest Transfers</span>
                        }
                        {!route.directRoute && 
                          <span className="badge bg-primary ms-2">Transfers: {route.transfers.length}</span>
                        }
                      </h6>
                      <div>
                        <span className={`badge ${
                          route.occupancy === 'low' ? 'bg-success' : 
                          route.occupancy === 'medium' ? 'bg-warning' : 
                          'bg-danger'
                        } me-2`}>
                          {route.occupancy.charAt(0).toUpperCase() + route.occupancy.slice(1)} Occupancy
                        </span>
                        {route.directRoute ? 
                          <span className="badge bg-info">Direct Route</span> : 
                          <span className="badge bg-secondary">Transfer Route</span>
                        }
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="d-flex mb-3">
                            <div className="me-4">
                              <div className="text-center position-relative">
                                <i className="bi bi-circle fs-5 text-success"></i>
                                <div className="vr" style={{ height: route.directRoute ? '30px' : '20px', margin: '4px auto' }}></div>
                                
                                {!route.directRoute && route.transfers && route.transfers.map((transfer, idx) => (
                                  <React.Fragment key={idx}>
                                    <div className="position-relative mb-1">
                                      <i className="bi bi-arrow-repeat text-warning fs-5"></i>
                                      <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ left: '100%', top: '50%' }}>
                                        {transfer.waitTime} min
                                      </span>
                                    </div>
                                    <div className="vr" style={{ height: '20px', margin: '4px auto' }}></div>
                                  </React.Fragment>
                                ))}
                                
                                <i className="bi bi-geo-alt-fill fs-5 text-danger"></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="mb-3">
                                <h6 className="mb-0">
                                  {typeof route.fromStop === 'object' ? route.fromStop.name : 'Loading...'}
                                </h6>
                                <small className="text-muted">
                                  {new Date(route.departureTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </small>
                              </div>
                              
                              {!route.directRoute && route.transfers && route.transfers.map((transfer, idx) => (
                                <div key={idx} className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-arrow-right text-primary me-2"></i>
                                    <div>
                                      <h6 className="mb-0">
                                        {typeof transfer.stop === 'object' ? transfer.stop.name : 'Loading...'}
                                      </h6>
                                      <small className="text-muted">
                                        {new Date(transfer.time).toLocaleTimeString([], { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <div>
                                <h6 className="mb-0">
                                  {typeof route.toStop === 'object' ? route.toStop.name : 'Loading...'}
                                </h6>
                                <small className="text-muted">
                                  {new Date(route.arrivalTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex flex-column h-100 justify-content-between">
                            <div>
                              <p className="mb-1 d-flex align-items-center">
                                <i className="bi bi-clock me-2"></i>
                                <strong>{route.travelTime} minutes</strong>
                                {route.timeSaved && (
                                  <span className="badge bg-success ms-2">
                                    Save {route.timeSaved} min
                                  </span>
                                )}
                              </p>
                              <p className="mb-1">
                                <i className="bi bi-cash me-2"></i>
                                <strong>{route.fare} points</strong>
                                {route.transferBenefits?.costSaving && (
                                  <span className="text-success ms-2">
                                    (-{route.transferBenefits.costSaving})
                                  </span>
                                )}
                              </p>
                              <p className="mb-3">
                                <i className="bi bi-rulers me-2"></i>
                                <span>{route.distanceInKm} km</span>
                              </p>
                              
                              {!route.directRoute && (
                                <div className="alert alert-info py-2 mb-3">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <small>This route includes {route.transfers.length} transfer(s)</small>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="d-grid">
                              <button 
                                className={`btn ${selectedRoute && selectedRoute.routeId === route.routeId ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRoute(route);
                                }}
                              >
                                {selectedRoute && selectedRoute.routeId === route.routeId ? 'Selected' : 'Select Route'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Leg Details Expandable Section */}
                      {!route.directRoute && route.legs && (
                        <div className="mt-3 pt-3 border-top">
                          <p className="mb-2 fw-bold small">Journey Breakdown:</p>
                          <div className="row">
                            {route.legs.map((leg, idx) => (
                              <div key={idx} className="col-md-6 mb-2">
                                <div className="card bg-light">
                                  <div className="card-body p-3">
                                    <h6 className="card-title mb-1 d-flex align-items-center">
                                      <span className="badge bg-secondary me-2">{idx + 1}</span>
                                      {leg.routeName}
                                    </h6>
                                    <div className="card-text small">
                                      <div className="d-flex align-items-center mb-1">
                                        <i className="bi bi-arrow-right text-primary me-1"></i>
                                        <span>{leg.fromStop.name} → {leg.toStop.name}</span>
                                      </div>
                                      <div className="d-flex align-items-center mb-1">
                                        <i className="bi bi-clock text-primary me-1"></i>
                                        <span>{leg.travelTime} minutes</span>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-cash text-primary me-1"></i>
                                        <span>{leg.fare} points</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Booking confirmation section */}
                {selectedRoute && (
                  <div className="card mb-4">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Confirm Booking</h5>
                      {!selectedRoute.directRoute && (
                        <span className="badge bg-warning">
                          <i className="bi bi-arrow-repeat me-1"></i>
                          Includes {selectedRoute.transfers.length} Transfer(s)
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8">
                          <p><strong>Route:</strong> {selectedRoute.routeName}</p>
                          <p><strong>From:</strong> {selectedRoute.fromStop.name}</p>
                          <p><strong>To:</strong> {selectedRoute.toStop.name}</p>
                          <p>
                            <strong>Departure:</strong> {' '}
                            {new Date(selectedRoute.departureTime).toLocaleString([], {
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </p>
                          
                          {!selectedRoute.directRoute && (
                            <div className="alert alert-info mb-3">
                              <p className="mb-1 fw-bold">Transfer Information:</p>
                              {selectedRoute.transfers.map((transfer, idx) => (
                                <div key={idx} className="mb-2">
                                  <p className="mb-1">
                                    <strong>Transfer at:</strong> {transfer.stopName}
                                  </p>
                                  <p className="mb-1 small">
                                    <strong>Wait time:</strong> {transfer.waitTime} minutes
                                  </p>
                                  <p className="mb-0 small">
                                    <strong>Connecting route:</strong> {transfer.toRouteName}
                                  </p>
                                </div>
                              ))}
                              <div className="mt-2 small">
                                <i className="bi bi-info-circle me-1"></i>
                                One ticket covers all transfers. No additional payment needed.
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <div className="alert alert-info mb-3">
                            <p className="mb-1"><strong>Total Fare:</strong> {selectedRoute.fare} points</p>
                            <p className="mb-0"><strong>Current Balance:</strong> {wallet.balance} points</p>
                          </div>
                          
                          {selectedRoute.fare > wallet.balance ? (
                            <div className="alert alert-danger mb-3">
                              <p className="mb-0">Insufficient balance. Please recharge your wallet.</p>
                            </div>
                          ) : null}
                          
                          <div className="d-grid">
                            <button 
                              className="btn btn-success"
                              onClick={handleBooking}
                              disabled={loading || selectedRoute.fare > wallet.balance}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Processing...
                                </>
                              ) : (
                                <>Confirm & Pay {selectedRoute.fare} Points</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-5 bg-light rounded">
                <i className="bi bi-search fs-1 text-muted"></i>
                <h5 className="mt-3">Search for Routes</h5>
                <p className="text-muted">
                  Select your departure and arrival stops to see smart route recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 