import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page-container">
      {/* Hero Section with Dynamic Background */}
      <section className="hero-section position-relative overflow-hidden bg-dark">
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(94, 114, 228, 0.4) 0%, rgba(23, 43, 77, 0.8) 90%)',
          zIndex: 1
        }}></div>
        <div className="position-absolute w-100 h-100" style={{
          backgroundImage: 'url("https://img.freepik.com/free-vector/city-map-with-bus-route-infographic-template_23-2148482207.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}></div>
        
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="position-absolute" style={{ 
            top: '40px', 
            right: '0', 
            width: '100px', 
            height: '100px',
            zIndex: 1,
            transform: 'rotate(15deg)'
          }}>
            <div className="position-relative animate-floating">
              <i className="bi bi-bus-front" style={{ fontSize: '3.5rem', color: 'rgba(255,255,255,0.4)' }}></i>
            </div>
          </div>
          <div className="position-absolute" style={{ 
            bottom: '120px', 
            left: '10%', 
            width: '60px', 
            height: '60px',
            zIndex: 1,
            transform: 'rotate(-10deg)'
          }}>
            <div className="position-relative animate-floating-reverse">
              <i className="bi bi-signpost-2" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)' }}></i>
            </div>
          </div>
          
          <div className="row min-vh-100 align-items-center py-5">
            <div className="col-lg-7 animate-fade-in">
              <span className="badge bg-primary mb-3 px-3 py-2">Campus Transit Solution</span>
              <h1 className="display-3 fw-bold text-white mb-4">
                Smart Campus <span className="text-gradient d-inline-block">Transportation</span>
              </h1>
              <p className="lead text-white opacity-90 mb-4">
                Streamline your campus commute with our intelligent shuttle management system. 
                Book rides, track routes, and manage payments—all in one place.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-5">
                <Link to="/routes" className="btn btn-primary btn-lg px-4 py-3 shadow-lg">
                  <i className="bi bi-map me-2"></i>
                  Explore Routes
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4 py-3">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </Link>
              </div>
              
              <div className="mt-5 d-flex gap-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-white p-2 d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                    <i className="bi bi-lightning-charge-fill text-primary fs-4"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="text-white mb-0">Fast Booking</h6>
                    <p className="text-white-50 mb-0 small">Book in seconds</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-white p-2 d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                    <i className="bi bi-shield-check text-primary fs-4"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="text-white mb-0">Secure System</h6>
                    <p className="text-white-50 mb-0 small">Safe & reliable</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block position-relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="position-relative mt-4" style={{ perspective: "1000px" }}>
                <img
                  src="https://img.freepik.com/free-vector/bus-stop-concept-illustration_114360-1224.jpg"
                  alt="Shuttle Management System"
                  className="img-fluid rounded-lg shadow-lg"
                  style={{ 
                    borderRadius: '1rem',
                    transform: 'rotateY(-10deg) rotateX(5deg)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
                  }}
                />
                <div className="position-absolute" style={{
                  bottom: '-40px',
                  right: '-20px',
                  zIndex: -1,
                  width: '200px',
                  height: '200px',
                  background: 'rgba(94, 114, 228, 0.15)',
                  borderRadius: '50%'
                }}></div>
                <div className="position-absolute" style={{
                  top: '-30px',
                  left: '-20px',
                  zIndex: -1,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(45, 206, 137, 0.15)',
                  borderRadius: '50%'
                }}></div>
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-lg" style={{ width: "70px", height: "70px", cursor: "pointer" }}>
                    <i className="bi bi-play-fill text-primary fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-wave position-absolute bottom-0 left-0 w-100" style={{ zIndex: 2 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,106.7C96,117,192,139,288,138.7C384,139,480,117,576,90.7C672,64,768,32,864,32C960,32,1056,64,1152,80C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-white">
        <div className="container py-4">
          <div className="row g-4 justify-content-center text-center">
            <div className="col-lg-3 col-md-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="py-4 px-3">
                <h2 className="display-4 fw-bold text-primary mb-2">25+</h2>
                <p className="text-muted mb-0">Campus Routes</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="py-4 px-3">
                <h2 className="display-4 fw-bold text-primary mb-2">500+</h2>
                <p className="text-muted mb-0">Daily Rides</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="py-4 px-3">
                <h2 className="display-4 fw-bold text-primary mb-2">50+</h2>
                <p className="text-muted mb-0">Shuttle Vehicles</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="py-4 px-3">
                <h2 className="display-4 fw-bold text-primary mb-2">4.8</h2>
                <p className="text-muted mb-0">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Modern Cards */}
      <section className="features-section py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5 animate-fade-in">
            <span className="badge bg-primary-soft text-primary px-3 py-2 mb-3">Features</span>
            <h2 className="display-5 fw-bold">Smart Transit Features</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "650px" }}>
              Everything you need for seamless campus transportation in one intuitive platform
            </p>
          </div>
          
          <div className="row g-4 py-4">
            <div className="col-lg-4 col-md-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="card border-0 h-100 shadow-sm hover-translate">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="feature-icon-container mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" 
                       style={{ background: 'rgba(94, 114, 228, 0.1)', width: '70px', height: '70px' }}>
                    <i className="bi bi-bus-front text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h3 className="card-title h4 mb-3">Intelligent Route Planning</h3>
                  <p className="card-text text-muted flex-grow-1">
                    Our AI-powered system optimizes routes based on traffic patterns, class schedules, and real-time demand for maximum efficiency.
                  </p>
                  <Link to="/routes" className="btn btn-sm btn-outline-primary mt-3 align-self-start">
                    Explore Routes <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="card border-0 h-100 shadow-sm hover-translate">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="feature-icon-container mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" 
                       style={{ background: 'rgba(45, 206, 137, 0.1)', width: '70px', height: '70px' }}>
                    <i className="bi bi-signpost-split text-success" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h3 className="card-title h4 mb-3">Dynamic Stop Management</h3>
                  <p className="card-text text-muted flex-grow-1">
                    Stops adapt to demand patterns, with location analytics determining where pickups are most needed across campus.
                  </p>
                  <Link to="/routes" className="btn btn-sm btn-outline-success mt-3 align-self-start">
                    View Stops <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="card border-0 h-100 shadow-sm hover-translate">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="feature-icon-container mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" 
                       style={{ background: 'rgba(17, 205, 239, 0.1)', width: '70px', height: '70px' }}>
                    <i className="bi bi-geo-alt-fill text-info" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h3 className="card-title h4 mb-3">Real-time Tracking</h3>
                  <p className="card-text text-muted flex-grow-1">
                    Track your shuttle in real-time with GPS integration, get accurate ETAs, and never miss your ride again.
                  </p>
                  <Link to="/login" className="btn btn-sm btn-outline-info mt-3 align-self-start">
                    Track Now <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="card border-0 h-100 shadow-sm hover-translate">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="feature-icon-container mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" 
                       style={{ background: 'rgba(251, 99, 64, 0.1)', width: '70px', height: '70px' }}>
                    <i className="bi bi-credit-card text-warning" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h3 className="card-title h4 mb-3">Digital Payments</h3>
                  <p className="card-text text-muted flex-grow-1">
                    Cashless fare collection with digital wallet integration, fare calculation, and automatic billing.
                  </p>
                  <Link to="/login" className="btn btn-sm btn-outline-warning mt-3 align-self-start">
                    Manage Wallet <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="card border-0 h-100 shadow-sm hover-translate">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="feature-icon-container mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" 
                       style={{ background: 'rgba(245, 54, 92, 0.1)', width: '70px', height: '70px' }}>
                    <i className="bi bi-phone text-danger" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h3 className="card-title h4 mb-3">Advanced Booking</h3>
                  <p className="card-text text-muted flex-grow-1">
                    Reserve your seat in advance with our intuitive booking system that integrates with your class schedule.
                  </p>
                  <Link to="/login" className="btn btn-sm btn-outline-danger mt-3 align-self-start">
                    Book Now <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="card border-0 h-100 shadow-sm hover-translate">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="feature-icon-container mb-4 rounded-3 d-inline-flex align-items-center justify-content-center" 
                       style={{ background: 'rgba(23, 43, 77, 0.1)', width: '70px', height: '70px' }}>
                    <i className="bi bi-graph-up text-dark" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h3 className="card-title h4 mb-3">Analytics Dashboard</h3>
                  <p className="card-text text-muted flex-grow-1">
                    Comprehensive analytics for admins to optimize routes, monitor demand patterns, and improve service.
                  </p>
                  <Link to="/login" className="btn btn-sm btn-outline-dark mt-3 align-self-start">
                    View Dashboard <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5 animate-fade-in">
            <span className="badge bg-primary-soft text-primary px-3 py-2 mb-3">How It Works</span>
            <h2 className="display-5 fw-bold">Simple Process, Powerful Results</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "650px" }}>
              Getting around campus has never been easier with our streamlined process
            </p>
          </div>

          <div className="row g-5 align-items-center py-4">
            <div className="col-lg-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="position-relative p-3">
                <img 
                  src="https://img.freepik.com/free-vector/booking-app-concept_23-2148628123.jpg" 
                  alt="Mobile app interface" 
                  className="img-fluid rounded-lg shadow-lg"
                  style={{ borderRadius: '1rem' }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100" 
                     style={{ 
                       background: 'linear-gradient(45deg, rgba(94, 114, 228, 0.2) 0%, rgba(130, 94, 228, 0) 100%)',
                       borderRadius: '1rem',
                       zIndex: 1
                     }}></div>
              </div>
            </div>
            <div className="col-lg-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="pe-lg-5">
                <div className="d-flex mb-4">
                  <div className="step-circle me-4 flex-shrink-0">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" 
                         style={{ width: "48px", height: "48px" }}>1</div>
                  </div>
                  <div>
                    <h3 className="h4 mb-3">Create Your Account</h3>
                    <p className="text-muted">Sign up with your student ID to access all features of our shuttle management system.</p>
                  </div>
                </div>
                
                <div className="d-flex mb-4">
                  <div className="step-circle me-4 flex-shrink-0">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" 
                         style={{ width: "48px", height: "48px" }}>2</div>
                  </div>
                  <div>
                    <h3 className="h4 mb-3">Find Your Route</h3>
                    <p className="text-muted">Browse available routes or search for specific destinations within campus.</p>
                  </div>
                </div>
                
                <div className="d-flex mb-4">
                  <div className="step-circle me-4 flex-shrink-0">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" 
                         style={{ width: "48px", height: "48px" }}>3</div>
                  </div>
                  <div>
                    <h3 className="h4 mb-3">Book Your Ride</h3>
                    <p className="text-muted">Select your shuttle, pickup time and location, then confirm your booking with a single tap.</p>
                  </div>
                </div>
                
                <div className="d-flex">
                  <div className="step-circle me-4 flex-shrink-0">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" 
                         style={{ width: "48px", height: "48px" }}>4</div>
                  </div>
                  <div>
                    <h3 className="h4 mb-3">Track & Ride</h3>
                    <p className="text-muted">Track your shuttle in real-time, receive notifications, and enjoy your ride.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section with Gradient and Pattern */}
      <section className="cta-section py-5 text-center text-white position-relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
      }}>
        <div className="position-absolute top-0 end-0 w-100 h-100 opacity-10" style={{ 
          backgroundImage: 'url("https://img.freepik.com/free-vector/bus-transit-concept-with-city-map_23-2148511768.jpg")',
          backgroundSize: 'cover',
          mixBlendMode: 'overlay'
        }}></div>
        
        <div className="position-absolute" style={{ right: '5%', top: '20%', width: '150px', height: '150px', 
                                                 background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div className="position-absolute" style={{ left: '10%', bottom: '10%', width: '200px', height: '200px', 
                                                  background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                                                  
        <div className="container position-relative py-5" style={{ zIndex: '2' }}>
          <div className="row justify-content-center py-3">
            <div className="col-lg-8 col-md-10 animate-fade-in">
              <span className="badge bg-white text-primary mb-4 px-3 py-2">Ready to Get Started?</span>
              <h2 className="display-4 fw-bold mb-4">Join Our Campus Shuttle Network Today</h2>
              <p className="lead mb-5">Experience the future of campus transportation with our intelligent shuttle management system.</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/register" className="btn btn-light btn-lg px-5 py-3 shadow">
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </Link>
                <Link to="/routes" className="btn btn-outline-light btn-lg px-5 py-3">
                  <i className="bi bi-map me-2"></i>
                  View Routes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 