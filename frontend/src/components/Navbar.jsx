import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for the navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-md navbar-dark ${scrolled ? 'scrolled' : ''}`} style={{ transition: 'all 0.3s ease' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-bus-front me-2" style={{ fontSize: '1.5rem' }}></i>
          <span>Shuttle Management</span>
        </Link>
        
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                <i className="bi bi-house-door me-1"></i>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/routes' ? 'active' : ''}`} to="/routes">
                <i className="bi bi-map me-1"></i>
                Routes
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                {user && user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} to="/admin">
                      <i className="bi bi-speedometer2 me-1"></i>
                      Admin
                    </Link>
                  </li>
                )}
                {user && user.role === 'student' && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/booking' ? 'active' : ''}`}
                        to="/booking"
                      >
                        <i className="bi bi-calendar-plus me-1"></i>
                        Book
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/bookings' ? 'active' : ''}`}
                        to="/bookings"
                      >
                        <i className="bi bi-card-list me-1"></i>
                        Bookings
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item dropdown ms-2">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="avatar-circle me-2">
                      {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{user && user.name}</span>
                    {user && user.wallet && (
                      <span className="ms-2 badge bg-light text-dark">
                        <i className="bi bi-wallet2 me-1"></i>
                        {user.wallet.balance} {user.wallet.currency}
                      </span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Link>
                    </li>
                    {user && user.role === 'student' && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/profile">
                            <i className="bi bi-wallet2 me-2"></i>
                            My Wallet
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/booking">
                            <i className="bi bi-calendar-plus me-2"></i>
                            Book Shuttle
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/bookings">
                            <i className="bi bi-card-list me-2"></i>
                            My Bookings
                          </Link>
                        </li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a className="dropdown-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-2">
                  <Link className="btn btn-outline-light" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-light" to="/register">
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 