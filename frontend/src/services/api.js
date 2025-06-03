import axios from 'axios';

// Create a fixed API URL using port 5001 where the backend is running
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add a timeout to quickly fall back to mock data
  timeout: 5000
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Routes API
export const routesApi = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (routeData) => api.post('/routes', routeData),
  update: (id, routeData) => api.put(`/routes/${id}`, routeData),
  delete: (id) => api.delete(`/routes/${id}`),
};

// Stops API
export const stopsApi = {
  getAll: () => api.get('/stops'),
  getById: (id) => api.get(`/stops/${id}`),
  getNearby: (latitude, longitude, radius = 1000) => 
    api.get(`/stops/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`),
  create: (stopData) => api.post('/stops', stopData),
  update: (id, stopData) => api.put(`/stops/${id}`, stopData),
  delete: (id) => api.delete(`/stops/${id}`),
};

// Shuttles API
export const shuttlesApi = {
  getAll: () => api.get('/shuttles'),
  getById: (id) => api.get(`/shuttles/${id}`),
  create: (shuttleData) => api.post('/shuttles', shuttleData),
  update: (id, shuttleData) => api.put(`/shuttles/${id}`, shuttleData),
  delete: (id) => api.delete(`/shuttles/${id}`),
};

// Auth API
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

// Wallet API
export const walletApi = {
  getWallet: () => api.get('/wallet'),
  addFunds: (amount) => api.post('/wallet/add', { amount }),
  use: (amount, description, routeId, isPeakHour) => 
    api.post('/wallet/use', { amount, description, routeId, isPeakHour }),
  getTransactions: () => api.get('/wallet/transactions'),
  getExpenseSummary: (period) => api.get('/wallet/summary', { params: { period } }),
  downloadStatement: (period) => api.get('/wallet/statement', { 
    params: { period },
    responseType: 'blob'
  }),
  getCategories: () => api.get('/wallet/categories'),
  rechargeWallet: (paymentData) => api.post('/wallet/recharge', paymentData),
  getStudentWallets: () => api.get('/wallet/admin/students'),
  bulkAllocate: (allocationData) => api.post('/wallet/bulk-allocate', allocationData),
  deductFunds: (deductionData) => api.post('/wallet/admin/deduct', deductionData),
};

// Booking API
export const bookingApi = {
  getAll: () => api.get('/bookings'),
  create: (bookingData) => api.post('/bookings', bookingData),
  getRecommendations: (searchParams) => {
    console.log('API service - getRecommendations params:', searchParams);
    
    // Validate the search parameters
    if (!searchParams.fromStopId || !searchParams.toStopId) {
      console.error('Missing required search parameters:', searchParams);
      return Promise.reject(new Error('Missing required search parameters'));
    }
    
    return api.post('/recommendations', {
      fromStopId: searchParams.fromStopId,
      toStopId: searchParams.toStopId,
      preferredCriteria: searchParams.preferredCriteria || 'fastest'
    }).catch(error => {
      console.error('API service - getRecommendations error:', error);
      
      // Forward the error to be handled by the component
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response from server:', error.response.data);
        throw error;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('Network error - server did not respond. Please check if the backend server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        throw new Error(`Request setup error: ${error.message}`);
      }
    });
  },
  getFrequentRoutes: () => api.get('/bookings/frequent'),
  getStatistics: () => api.get('/bookings/statistics')
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData)
};

export default api; 