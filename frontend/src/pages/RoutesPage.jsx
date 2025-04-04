import React, { useState, useEffect } from 'react';
import { routesApi } from '../services/api';
import RouteList from '../components/RouteList';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await routesApi.getAll();
        
        if (response.data.success) {
          setRoutes(response.data.data);
        } else {
          setError('Failed to fetch routes');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'An error occurred while fetching routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <div className="page-container">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1>Shuttle Routes</h1>
            <p className="lead">
              Browse all available shuttle routes across the campus.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading routes...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <RouteList routes={routes} />
        )}
      </div>
    </div>
  );
};

export default RoutesPage; 