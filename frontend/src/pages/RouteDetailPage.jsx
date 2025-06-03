import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { routesApi } from '../services/api';

const RouteDetailPage = () => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        setLoading(true);
        const response = await routesApi.getById(id);
        
        if (response.data.success) {
          setRoute(response.data.data);
        } else {
          setError('Failed to fetch route details');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'An error occurred while fetching route details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRouteDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading route details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <Link to="/routes" className="btn btn-primary">
            Back to Routes
          </Link>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="alert alert-warning" role="alert">
            Route not found
          </div>
          <Link to="/routes" className="btn btn-primary">
            Back to Routes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-8">
            <h1>{route.name}</h1>
            <p className="lead">{route.description}</p>
          </div>
          <div className="col-md-4 text-md-end d-flex align-items-center justify-content-md-end">
            <Link to="/routes" className="btn btn-outline-primary me-2">
              Back to Routes
            </Link>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Route Information</h5>
          </div>
          <div className="card-body">
            <div className="row">
              
              <div className="col-md-6">
                <h6>Additional Details:</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Total Stops
                    <span className="badge bg-primary rounded-pill">{route.stops?.length || 0}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Created
                    <span>{new Date(route.createdAt).toLocaleDateString()}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Last Updated
                    <span>{new Date(route.updatedAt).toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Stops on this Route</h5>
          </div>
          <div className="card-body">
            {route.stops && route.stops.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.stops.map((stop) => (
                      <tr key={stop._id || stop}>
                        <td>{typeof stop === 'object' ? stop.name : 'Loading...'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-3">
                <p className="mb-0">No stops assigned to this route yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailPage; 