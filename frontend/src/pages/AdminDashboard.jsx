import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { routesApi, stopsApi, walletApi } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import RouteForm from '../components/RouteForm';
import axios from 'axios';

// Define API URL
const API_URL = 'http://localhost:5001';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading, token } = useContext(AuthContext);
  
  const [stats, setStats] = useState({
    routes: 0,
    stops: 0,
    students: 0,
    shuttles: 0,
  });
  
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [studentWallets, setStudentWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  
  // Wallet management state
  const [activeTab, setActiveTab] = useState('students');
  const [bulkAllocationForm, setBulkAllocationForm] = useState({
    userIds: [],
    amount: '',
    isMonthly: true
  });
  const [singleUserForm, setSingleUserForm] = useState({
    userId: '',
    amount: '',
    description: '',
    type: 'add' // 'add' or 'deduct'
  });
  const [selectAll, setSelectAll] = useState(false);

  // New state variables
  const [editingRoute, setEditingRoute] = useState(null);
  const [showRouteEditForm, setShowRouteEditForm] = useState(false);
  const [showStopForm, setShowStopForm] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopFormData, setStopFormData] = useState({
    name: '',
    location: {
      type: 'Point',
      coordinates: [0, 0]  // [longitude, latitude] for GeoJSON
    },
    description: '',
    facilities: [],
    type: 'regular'
  });

  // Add this to your state variables near the top of the component
  const [creditAllocationForm, setCreditAllocationForm] = useState({
    userIds: [],
    type: 'monthly',
    amount: '',
    note: ''
  });

  // Add function to clear messages
  const clearError = () => setError(null);
  const clearSuccess = () => setFormSuccess(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch routes
        const routesResponse = await routesApi.getAll();
        if (routesResponse.data.success) {
          setRoutes(routesResponse.data.data);
          setStats(prev => ({ ...prev, routes: routesResponse.data.count }));
        }
        
        // Fetch stops
        const stopsResponse = await stopsApi.getAll();
        if (stopsResponse.data.success) {
          setStops(stopsResponse.data.data);
          setStats(prev => ({ ...prev, stops: stopsResponse.data.count }));
        }
        
        // Fetch student wallets
        console.log('Fetching student wallets...');
        try {
          const walletsResponse = await walletApi.getStudentWallets();
          console.log('Student wallets response:', walletsResponse);
          
          if (walletsResponse.data.success) {
            setStudentWallets(walletsResponse.data.data);
            console.log('Set student wallets:', walletsResponse.data.data);
            setStats(prev => ({ ...prev, students: walletsResponse.data.count }));
          } else {
            console.error('Failed to fetch student wallets:', walletsResponse.data.message);
          }
        } catch (walletError) {
          console.error('Error fetching student wallets:', walletError);
          setStudentWallets([
            { 
              _id: '1', 
              name: 'John Doe', 
              email: 'john@example.com',
              studentId: 'STU001',
              wallet: { 
                balance: 500, 
                currency: 'Points',
                lastUpdated: new Date()
              }
            },
            { 
              _id: '2', 
              name: 'Jane Smith', 
              email: 'jane@example.com',
              studentId: 'STU002',
              wallet: { 
                balance: 350, 
                currency: 'Points',
                lastUpdated: new Date()
              }
            }
          ]);
          setStats(prev => ({ ...prev, students: 2 }));
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setError(error.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const handleCreateRoute = async (formData) => {
    try {
      setLoading(true);
      const response = await routesApi.create(formData);
      
      if (response.data.success) {
        // Add the new route to the routes list
        setRoutes([...routes, response.data.data]);
        setStats(prev => ({ ...prev, routes: prev.routes + 1 }));
        setShowRouteForm(false);
        setFormSuccess('Route created successfully!');
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setFormSuccess(null);
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoute = async (routeId) => {
    try {
      setLoading(true);
      // Fetch route details
      const response = await routesApi.getById(routeId);
      
      if (response.data.success) {
        setEditingRoute(response.data.data);
        setShowRouteEditForm(true);
      }
    } catch (error) {
      setError('Failed to get route details: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoute = async (updatedRouteData) => {
    try {
      setLoading(true);
      const response = await routesApi.update(updatedRouteData._id, updatedRouteData);
      
      if (response.data.success) {
        // Update routes in state
        setRoutes(routes.map(route => 
          route._id === updatedRouteData._id ? response.data.data : route
        ));
        setFormSuccess('Route updated successfully');
        setShowRouteEditForm(false);
        setEditingRoute(null);
      }
    } catch (error) {
      setError('Failed to update route: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      setLoading(true);
      const response = await routesApi.delete(routeId);
      
      if (response.data.success) {
        // Remove route from state
        setRoutes(routes.filter(route => route._id !== routeId));
        setFormSuccess('Route deleted successfully');
      }
    } catch (error) {
      setError('Failed to delete route: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk allocation form change
  const handleBulkFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBulkAllocationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle single user form change
  const handleSingleUserFormChange = (e) => {
    const { name, value } = e.target;
    setSingleUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select all toggle
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      // Select all user IDs
      setBulkAllocationForm(prev => ({
        ...prev,
        userIds: studentWallets.map(student => student._id)
      }));
    } else {
      // Deselect all
      setBulkAllocationForm(prev => ({
        ...prev,
        userIds: []
      }));
    }
  };
  
  // Handle user selection for bulk allocation
  const handleUserSelection = (userId) => {
    const userIds = [...bulkAllocationForm.userIds];
    
    if (userIds.includes(userId)) {
      // Remove user
      const index = userIds.indexOf(userId);
      userIds.splice(index, 1);
    } else {
      // Add user
      userIds.push(userId);
    }
    
    setBulkAllocationForm(prev => ({
      ...prev,
      userIds
    }));
    
    // Update selectAll state based on if all users are selected
    setSelectAll(userIds.length === studentWallets.length);
  };
  
  // Handle bulk allocation submit
  const handleBulkAllocation = async (e) => {
    e.preventDefault();
    
    if (bulkAllocationForm.userIds.length === 0) {
      setError('Please select at least one student');
      return;
    }
    
    if (!bulkAllocationForm.amount || isNaN(Number(bulkAllocationForm.amount))) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      const response = await walletApi.adminBulkAllocatePoints(
        bulkAllocationForm.userIds,
        Number(bulkAllocationForm.amount),
        bulkAllocationForm.isMonthly
      );
      
      if (response.data.success) {
        setFormSuccess(response.data.message || 'Points allocated successfully!');
        
        // Refresh student wallet data
        const walletsResponse = await walletApi.getStudentWallets();
        if (walletsResponse.data.success) {
          setStudentWallets(walletsResponse.data.data);
        }
        
        // Reset form
        setBulkAllocationForm({
          userIds: [],
          amount: '',
          isMonthly: true
        });
        setSelectAll(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to allocate points');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle single user fund adjustment
  const handleSingleUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!singleUserForm.userId) {
      setError('Please select a student');
      return;
    }
    
    if (!singleUserForm.amount || isNaN(Number(singleUserForm.amount))) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      let response;
      
      if (singleUserForm.type === 'add') {
        response = await walletApi.adminAddFunds(
          singleUserForm.userId,
          Number(singleUserForm.amount),
          singleUserForm.description
        );
      } else {
        response = await walletApi.adminDeductFunds(
          singleUserForm.userId,
          Number(singleUserForm.amount),
          singleUserForm.description
        );
      }
      
      if (response.data.success) {
        setFormSuccess(`Successfully ${singleUserForm.type === 'add' ? 'added' : 'deducted'} points from student wallet!`);
        
        // Refresh student wallet data
        const walletsResponse = await walletApi.getStudentWallets();
        if (walletsResponse.data.success) {
          setStudentWallets(walletsResponse.data.data);
        }
        
        // Reset form
        setSingleUserForm({
          userId: '',
          amount: '',
          description: '',
          type: 'add'
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${singleUserForm.type} points`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'longitude' || name === 'latitude') {
      // Handle coordinates for GeoJSON format
      const coordinates = [...stopFormData.location.coordinates];
      if (name === 'longitude') {
        coordinates[0] = parseFloat(value) || 0;
      } else if (name === 'latitude') {
        coordinates[1] = parseFloat(value) || 0;
      }
      
      setStopFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates
        }
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStopFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setStopFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await stopsApi.create(stopFormData);
      
      if (response.data.success) {
        // Add the new stop to the stops list
        setStops([...stops, response.data.data]);
        setStats(prev => ({ ...prev, stops: prev.stops + 1 }));
        setShowStopForm(false);
        setStopFormData({
          name: '',
          location: {
            type: 'Point',
            coordinates: [0, 0]
          },
          description: '',
          facilities: [],
          type: 'regular'
        });
        setFormSuccess('Stop added successfully!');
        
        // Clear the success message after 2 seconds
        setTimeout(() => {
          setFormSuccess(null);
        }, 2000);
      }
    } catch (error) {
      setError('Failed to add stop: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditStop = (stop) => {
    setEditingStop(stop);
    // Convert MongoDB GeoJSON format to form format
    setStopFormData({
      name: stop.name,
      location: stop.location || {
        type: 'Point',
        coordinates: [0, 0]  // [longitude, latitude]
      },
      description: stop.description || '',
      facilities: stop.facilities || [],
      type: stop.type || 'regular'
    });
    setShowStopForm(true);
  };

  const handleUpdateStop = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await stopsApi.update(editingStop._id, stopFormData);
      
      if (response.data.success) {
        setStops(stops.map(stop => 
          stop._id === editingStop._id ? response.data.data : stop
        ));
        setFormSuccess('Stop updated successfully');
        setShowStopForm(false);
        setEditingStop(null);
        setStopFormData({
          name: '',
          location: {
            type: 'Point',
            coordinates: [0, 0]  // [longitude, latitude]
          },
          description: '',
          facilities: [],
          type: 'regular'
        });
      }
    } catch (error) {
      setError('Failed to update stop: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      setLoading(true);
      const response = await stopsApi.delete(stopId);
      
      if (response.data.success) {
        // Remove stop from state
        setStops(stops.filter(stop => stop._id !== stopId));
        setFormSuccess('Stop deleted successfully');
      }
    } catch (error) {
      setError('Failed to delete stop: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle credit allocation form change
  const handleCreditAllocationFormChange = (e) => {
    const { name, value } = e.target;
    setCreditAllocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBulkCreditAllocation = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (creditAllocationForm.userIds.length === 0) {
        setError('Please select at least one student');
        setLoading(false);
        return;
      }
      
      const response = await walletApi.bulkAllocate({
        userIds: creditAllocationForm.userIds,
        amount: parseFloat(creditAllocationForm.amount),
        type: creditAllocationForm.type,
        note: creditAllocationForm.note
      });
      
      if (response.data.success) {
        // Update student wallets in state
        const updatedWallets = studentWallets.map(student => {
          if (creditAllocationForm.userIds.includes(student._id)) {
            return {
              ...student,
              wallet: {
                ...student.wallet,
                balance: student.wallet.balance + parseFloat(creditAllocationForm.amount)
              }
            };
          }
          return student;
        });
        
        setStudentWallets(updatedWallets);
        
        // Reset form
        setCreditAllocationForm({
          type: 'monthly',
          amount: '',
          userIds: [],
          note: ''
        });
        
        setFormSuccess(`Credits allocated successfully to ${creditAllocationForm.userIds.length} students`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to allocate credits');
    } finally {
      setLoading(false);
    }
  };

  // Render tabs
  const renderTabs = () => {
    return (
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'routes' ? 'active' : ''}`} 
            onClick={() => setActiveTab('routes')}
          >
            Routes
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stops' ? 'active' : ''}`} 
            onClick={() => setActiveTab('stops')}
          >
            Stops
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'students' ? 'active' : ''}`} 
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'wallet' ? 'active' : ''}`} 
            onClick={() => setActiveTab('wallet')}
          >
            Wallet Management
          </button>
        </li>
      </ul>
    );
  };

  // Render students list
  const renderStudentsContent = () => {
    return (
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 text-white">
            <i className="bi bi-people me-2"></i>
            Student List
          </h5>
          {/* Optional: Add a search input here if needed */}
          {/* <div className="input-group w-auto" style={{ maxWidth: '300px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search students..." 
              aria-label="Search students"
            />
            <button className="btn btn-outline-light" type="button">
              <i className="bi bi-search"></i>
            </button>
          </div> */}
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading student data...</p>
            </div>
          ) : (
            <>
              <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                <div>
                  Showing {studentWallets.length} students with wallet information
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Student ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Wallet Balance</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentWallets.length > 0 ? (
                      studentWallets
                        .slice() // Create a shallow copy to avoid mutating state directly
                        .sort((a, b) => {
                          const idA = a.studentId || ''; // Treat null/undefined as empty string for sorting
                          const idB = b.studentId || '';
                          return idA.localeCompare(idB);
                        })
                        .map(student => (
                          <tr key={student._id}>
                            <td>
                              <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                {student.studentId}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle bg-primary bg-opacity-10 text-primary me-2">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                {student.name}
                              </div>
                            </td>
                            <td>{student.email}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {/* Progress bar hidden if balance is 0 */}
                                <div className={`progress me-2 flex-grow-1 ${student.wallet.balance > 0 ? '' : 'd-none'}`} style={{height: '8px', maxWidth: '100px'}}>
                                  <div 
                                    className={`progress-bar ${student.wallet.balance > 300 ? 'bg-success' : student.wallet.balance > 100 ? 'bg-warning' : 'bg-danger'}`} 
                                    role="progressbar" 
                                    style={{width: `${Math.min(100, student.wallet.balance / 5)}%`}}
                                    aria-valuenow={student.wallet.balance} 
                                    aria-valuemin="0" 
                                    aria-valuemax="500"
                                  ></div>
                                </div>
                                <span className={`badge ${student.wallet.balance > 300 ? 'bg-success' : student.wallet.balance > 100 ? 'bg-warning' : 'bg-danger'}`}>
                                  {student.wallet.balance} {student.wallet.currency || 'Points'}
                                </span>
                              </div>
                            </td>
                            <td>
                              {/* Actions: Adjust Balance, View Details */}
                              <button 
                                className="btn btn-sm btn-outline-primary me-1" 
                                onClick={() => {
                                  setActiveTab('wallet');
                                  setSingleUserForm({
                                    ...singleUserForm,
                                    userId: student._id
                                  });
                                }}
                                title="Adjust Balance"
                              >
                                <i className="bi bi-wallet2"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" title="View Details">
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-emoji-frown fs-4 mb-3 d-block"></i>
                            <p>No students found. Please run seed script.</p>
                            {/* Assuming there's a function to run seed script */}
                            {/* <button className="btn btn-sm btn-primary">
                              Run Seed Script
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render routes content
  const renderRoutesContent = () => {
    return (
      <>
        <div className="card mb-4 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <h5 className="mb-0 text-white">Manage Routes</h5>
            <button 
              className="btn btn-light btn-sm"
              onClick={() => setShowRouteForm(!showRouteForm)}
            >
              {showRouteForm ? 'Cancel' : 'Add New Route'}
            </button>
          </div>
          <div className="card-body">
            {showRouteForm ? (
              <RouteForm stops={stops} onSubmit={handleCreateRoute} buttonText="Create Route" />
            ) : (
              <>
                {routes.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Fare</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routes.map((route) => (
                          <tr key={route._id}>
                            <td>{route.name}</td>
                            <td>{route.description}</td>
                            <td>
                              {route.fare} <small className="text-muted">({route.peakHourFare || route.fare} peak)</small>
                            </td>
                            <td>
                              <div className="btn-group">
                                <Link to={`/routes/${route._id}`} className="btn btn-sm btn-outline-info" title="View Details">
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <button className="btn btn-sm btn-outline-warning" onClick={() => handleEditRoute(route._id)} title="Edit Route">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger" 
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete the route "${route.name}"?`)) {
                                      handleDeleteRoute(route._id);
                                    }
                                  }}
                                  title="Delete Route"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-3">
                    <p className="mb-0 text-muted">No routes available. Create a new route to get started.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Route Edit Modal (inline for now) */}
        {showRouteEditForm && editingRoute && (
          <div className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-secondary text-white">
              <h5 className="mb-0 text-white">Edit Route: {editingRoute.name}</h5>
              <button 
                className="btn btn-light btn-sm" 
                onClick={() => {
                  setShowRouteEditForm(false);
                  setEditingRoute(null);
                }}
              >
                Cancel
              </button>
            </div>
            <div className="card-body">
              <RouteForm 
                stops={stops} 
                initialData={editingRoute}
                onSubmit={handleUpdateRoute} 
                buttonText="Update Route" 
              />
            </div>
          </div>
        )}
      </>
    );
  };

  // Render stops content
  const renderStopsContent = () => {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0 text-white">Manage Stops</h5>
          <button 
            className="btn btn-light btn-sm"
            onClick={() => setShowStopForm(!showStopForm)}
          >
            {showStopForm ? 'Cancel' : 'Add New Stop'}
          </button>
        </div>
        <div className="card-body">
          {showStopForm && (
            <form onSubmit={editingStop ? handleUpdateStop : handleAddStop} className="mb-4 p-3 border rounded bg-light">
              <h6 className="mb-3">{editingStop ? 'Edit Stop' : 'Add New Stop'}</h6>
              <div className="mb-3">
                <label htmlFor="stopName" className="form-label">Stop Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="stopName"
                  name="name"
                  value={stopFormData.name}
                  onChange={handleStopFormChange}
                  required
                />
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="stopLatitude" className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="form-control"
                    id="stopLatitude"
                    name="latitude"
                    value={stopFormData.location.coordinates[1]}
                    onChange={handleStopFormChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="stopLongitude" className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="form-control"
                    id="stopLongitude"
                    name="longitude"
                    value={stopFormData.location.coordinates[0]}
                    onChange={handleStopFormChange}
                    required
                  />
                </div>
              </div>
              
              
                
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary">
                  {editingStop ? 'Update Stop' : 'Add Stop'}
                </button>
              </div>
            </form>
          )}
          
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stops.map((stop) => (
                  <tr key={stop._id}>
                    <td>{stop.name}</td>
                    <td>
                      {stop.location ? 
                        `${stop.location.coordinates[0].toFixed(4)}, ${stop.location.coordinates[1].toFixed(4)}` : 
                        'No coordinates'
                      }
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-warning" 
                          onClick={() => handleEditStop(stop)}
                          title="Edit Stop"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the stop "${stop.name}"?`)) {
                              handleDeleteStop(stop._id);
                            }
                          }}
                          title="Delete Stop"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render dashboard overview content
  const renderDashboardOverview = () => {
    return (
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon-container bg-primary bg-opacity-10 me-3">
                <i className="bi bi-map text-primary stat-icon"></i>
              </div>
              <div>
                <div className="fs-5 text-muted">Routes</div>
                <h2 className="fw-bold text-primary mb-0">{stats.routes}</h2>
              </div>
            </div>
            <div className="card-footer bg-transparent border-top-0 text-end py-2">
              <Link to="#" className="text-decoration-none" onClick={() => setActiveTab('routes')}>
                Manage <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon-container bg-success bg-opacity-10 me-3">
                <i className="bi bi-geo-alt text-success stat-icon"></i>
              </div>
              <div>
                <div className="fs-5 text-muted">Stops</div>
                <h2 className="fw-bold text-success mb-0">{stats.stops}</h2>
              </div>
            </div>
            <div className="card-footer bg-transparent border-top-0 text-end py-2">
              <Link to="#" className="text-decoration-none" onClick={() => setActiveTab('stops')}>
                Manage <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 dashboard-stat-card">
            <div className="card-body d-flex align-items-center">
              <div className="stat-icon-container bg-info bg-opacity-10 me-3">
                <i className="bi bi-people text-info stat-icon"></i>
              </div>
              <div>
                <div className="fs-5 text-muted">Students</div>
                <h2 className="fw-bold text-info mb-0">{stats.students}</h2>
              </div>
            </div>
            <div className="card-footer bg-transparent border-top-0 text-end py-2">
              <Link to="#" className="text-decoration-none" onClick={() => setActiveTab('students')}>
                Manage <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render active content based on tab
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'routes':
        return renderRoutesContent();
      case 'stops':
        return renderStopsContent();
      case 'students':
        return renderStudentsContent();
      case 'wallet':
        return renderWalletManagementContent();
      default:
        return renderStudentsContent();
    }
  };

  // Add Wallet Management Content
  const renderWalletManagementContent = () => {
    return (
      <div className="row">
        {/* Monthly/Semester Credit Allocation */}
        <div className="col-lg-12 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0 text-white">
                <i className="bi bi-calendar-check me-2"></i>
                Monthly/Semester Credit Allocation
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleBulkCreditAllocation}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <select
                        className="form-select"
                        id="type"
                        name="type"
                        value={creditAllocationForm.type}
                        onChange={handleCreditAllocationFormChange}
                        required
                      >
                        <option value="monthly">Monthly Credits</option>
                        <option value="semester">Semester Credits</option>
                        <option value="semester">Bonus Credits</option>
                      </select>
                      <label htmlFor="type">Allocation Type</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        id="amount"
                        name="amount"
                        value={creditAllocationForm.amount}
                        onChange={handleCreditAllocationFormChange}
                        min="1"
                        placeholder="Amount"
                        required
                      />
                      <label htmlFor="amount">Amount (Points)</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-floating mt-3">
                  <input
                    type="text"
                    className="form-control"
                    id="note"
                    name="note"
                    value={creditAllocationForm.note}
                    onChange={handleCreditAllocationFormChange}
                    placeholder="Note"
                  />
                  <label htmlFor="note">Note (Optional)</label>
                </div>
                
                <div className="mt-4 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0 text-secondary">Select Students</h6>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="selectAllSwitch"
                        checked={creditAllocationForm.userIds.length === studentWallets.length}
                        onChange={() => {
                          if (creditAllocationForm.userIds.length === studentWallets.length) {
                            setCreditAllocationForm(prev => ({...prev, userIds: []}));
                          } else {
                            setCreditAllocationForm(prev => ({
                              ...prev, 
                              userIds: studentWallets.map(s => s._id)
                            }));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor="selectAllSwitch">
                        Select All
                      </label>
                    </div>
                  </div>
                  
                  <div className="table-responsive" style={{maxHeight: '200px', overflowY: 'auto'}}>
                    <table className="table table-hover table-striped align-middle table-sm">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th style={{width: '40px'}}></th>
                          <th>Student</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentWallets.map(student => (
                          <tr key={student._id}>
                            <td>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={creditAllocationForm.userIds.includes(student._id)}
                                  onChange={() => {
                                    if (creditAllocationForm.userIds.includes(student._id)) {
                                      setCreditAllocationForm(prev => ({
                                        ...prev,
                                        userIds: prev.userIds.filter(id => id !== student._id)
                                      }));
                                    } else {
                                      setCreditAllocationForm(prev => ({
                                        ...prev,
                                        userIds: [...prev.userIds, student._id]
                                      }));
                                    }
                                  }}
                                  id={`user-${student._id}`}
                                />
                              </div>
                            </td>
                            <td>
                              <label htmlFor={`user-${student._id}`} className="d-flex align-items-center mb-0 cursor-pointer">
                                <div className="avatar-circle bg-primary bg-opacity-10 text-primary me-2">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div>{student.name}</div>
                                  <small className="text-muted">{student.studentId}</small>
                                </div>
                              </label>
                            </td>
                            <td>
                              <span className={`badge ${student.wallet.balance > 300 ? 'bg-success' : student.wallet.balance > 100 ? 'bg-warning' : 'bg-danger'}`}>
                                {student.wallet.balance} points
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted">
                      {creditAllocationForm.userIds.length} students selected
                    </span>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={loading || creditAllocationForm.userIds.length === 0 || !creditAllocationForm.amount}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...</>
                      ) : (
                        <><i className="bi bi-check-circle me-1"></i>Allocate Credits</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If not authenticated or not admin, redirect to login
  if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
    return <Navigate to="/login" />;
  }

  if (authLoading || loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white p-3">
        <h4 className="mb-4 text-white">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button 
              className={`nav-link text-white ${activeTab === 'dashboard' ? 'active bg-primary' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="bi bi-house-door me-2"></i>
              Dashboard
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              className={`nav-link text-white ${activeTab === 'routes' ? 'active bg-primary' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              <i className="bi bi-map me-2"></i>
              Routes
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              className={`nav-link text-white ${activeTab === 'stops' ? 'active bg-primary' : ''}`}
              onClick={() => setActiveTab('stops')}
            >
              <i className="bi bi-geo-alt me-2"></i>
              Stops
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              className={`nav-link text-white ${activeTab === 'students' ? 'active bg-primary' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <i className="bi bi-people me-2"></i>
              Students
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              className={`nav-link text-white ${activeTab === 'wallet' ? 'active bg-primary' : ''}`}
              onClick={() => setActiveTab('wallet')}
            >
              <i className="bi bi-wallet2 me-2"></i>
              Wallet Management
            </button>
          </li>
        </ul>
        {/* User Info and Logout */}
        <div className="mt-auto p-3 border-top border-secondary">
          <div className="d-flex align-items-center mb-3">
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2" style={{width: '38px', height: '38px'}}>
              <span className="fs-6 text-white">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-white">{user?.name || 'Admin User'}</div>
              <small className="text-muted">{user?.email || 'admin@bennett.edu.in'}</small>
            </div>
          </div>
          <Link to="/logout" className="btn btn-outline-light w-100 btn-sm">
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="main-content flex-grow-1 p-4 bg-light">
        {/* Content Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="text-primary">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'routes' && 'Routes Management'}
              {activeTab === 'stops' && 'Stops Management'}
              {activeTab === 'students' && 'Student Management'}
              {activeTab === 'wallet' && 'Wallet Management'}
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/admin">Admin</Link></li>
                <li className="breadcrumb-item active" aria-current="page">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'routes' && 'Routes'}
                  {activeTab === 'stops' && 'Stops'}
                  {activeTab === 'students' && 'Students'}
                  {activeTab === 'wallet' && 'Wallet'}
                </li>
              </ol>
            </nav>
          </div>
        </div>
        
        {/* Display error or success message */}
        {error && (
          <div className="alert alert-danger shadow-sm alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={clearError}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {formSuccess && (
          <div className="alert alert-success shadow-sm alert-dismissible fade show" role="alert">
            {formSuccess}
            <button 
              type="button" 
              className="btn-close" 
              onClick={clearSuccess}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {/* Active Tab Content */}
        {renderActiveContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 