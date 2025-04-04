import React from 'react';
import { Link } from 'react-router-dom';

const RouteList = ({ routes }) => {
  if (!routes || routes.length === 0) {
    return (
      <div className="text-center my-5">
        <h3>No routes available</h3>
        <p>Currently, there are no shuttle routes in the system.</p>
      </div>
    );
  }

  return (
    <div className="route-list">
      {routes.map((route) => (
        <div
          key={route._id}
          className="card mb-3 route-list-item"
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">{route.name}</h5>
              <span className={`badge ${route.isActive ? 'bg-success' : 'bg-danger'}`}>
                {route.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="card-text text-muted mt-2">{route.description}</p>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <small className="text-muted">
                  <i className="bi bi-geo-alt me-1"></i>
                  {route.stops?.length || 0} Stops
                </small>
                {route.optimizationFactors && (
                  <div className="mt-2">
                    {route.optimizationFactors.peakHours && (
                      <span className="badge bg-info me-2">Peak Hours</span>
                    )}
                    {route.optimizationFactors.classSchedules && (
                      <span className="badge bg-info me-2">Class Schedules</span>
                    )}
                    {route.optimizationFactors.demandAnalysis && (
                      <span className="badge bg-info me-2">Demand Analysis</span>
                    )}
                  </div>
                )}
              </div>
              <Link to={`/routes/${route._id}`} className="btn btn-primary btn-sm">
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteList; 