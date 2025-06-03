import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [formError, setFormError] = useState('');

  const { register, error, loading } = useContext(AuthContext);
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
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 3) {
      setFormError('Password must be at least 3 characters');
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registrationData } = formData;
    
    try {
      const success = await register(registrationData);
      if (success) {
        // Redirect based on role
        if (registrationData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setFormError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="page-container bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card shadow-lg border-0 animate-fade-in">
              <div className="card-header bg-white text-center p-5 border-0">
                <h3 className="mb-0 fw-bold text-gradient">Create Your Account</h3>
                <p className="text-muted mt-2">Join our shuttle management system</p>
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
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

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
                        placeholder="email@bennett.edu"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="password" className="form-label">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 ps-0"
                          id="password"
                          name="password"
                          placeholder="Create password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength="6"
                        />
                      </div>
                      <small className="form-text text-muted mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Minimum 6 characters
                      </small>
                    </div>

                    <div className="col-md-6 mb-4">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-shield-lock text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-start-0 ps-0"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="role" className="form-label">Account Type</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person-badge text-muted"></i>
                      </span>
                      <select
                        className="form-select border-start-0 ps-0"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Administrator</option>
                        <option value="driver">Driver</option>
                      </select>
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
                          Creating your account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="mb-0">
                      Already have an account? <Link to="/login" className="fw-semibold">Sign in</Link>
                    </p>
                  </div>
                </form>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 