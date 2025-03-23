import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoutesPage from './pages/RoutesPage';
import RouteDetailPage from './pages/RouteDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import BookingPage from './pages/BookingPage';
import BookingsHistoryPage from './pages/BookingsHistoryPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:id" element={<RouteDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingsHistoryPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer className="footer py-4 mt-auto">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-md-4 text-center text-md-start">
                <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} Shuttle Management System</p>
              </div>
              <div className="col-md-4 text-center d-none d-md-block">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item">
                    <a href="#" className="text-muted">Privacy Policy</a>
                  </li>
                  <li className="list-inline-item">
                    <span className="text-muted mx-1">•</span>
                  </li>
                  <li className="list-inline-item">
                    <a href="#" className="text-muted">Terms of Service</a>
                  </li>
                </ul>
              </div>
              <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
                <div className="social-links">
                  <a href="#" className="text-muted me-2"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="text-muted me-2"><i className="bi bi-twitter"></i></a>
                  <a href="#" className="text-muted"><i className="bi bi-instagram"></i></a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
