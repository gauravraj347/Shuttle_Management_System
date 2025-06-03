import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  
  const { login, error, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }
    
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        // Get user role from AuthContext
        const userRole = user?.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="page-container bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-lg border-0 animate-fade-in">
              <div className="card-header bg-white text-center p-5 border-0">
                <h3 className="mb-0 text-gradient fw-bold">Welcome Back</h3>
                <p className="text-muted mt-2">Sign in to your account to continue</p>
              </div>
              <div className="card-body px-lg-5 py-lg-5">
                {(error || formError) && (
                  <div className="alert alert-danger" role="alert">
                    <div className="d-flex">
                      <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
                      <div>{formError || error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        id="email"
                        name="email"
                        placeholder="email@bennett.edu.in"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <label htmlFor="password" className="form-label">Password</label>
                      <a href="#" className="small text-decoration-none">Forgot password?</a>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 ps-0"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-5">
                    <button 
                      type="submit" 
                      className="btn btn-primary py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Don't have an account? <Link to="/register" className="fw-semibold">Register now</Link>
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 