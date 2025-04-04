import React, { useState, useEffect } from 'react';
import { walletApi } from '../services/api';

const ExpenseAnalytics = ({ walletTransactions }) => {
  const [dateRange, setDateRange] = useState('month');
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [peakHourAnalysis, setPeakHourAnalysis] = useState({
    peakHours: 0,
    offPeakHours: 0
  });

  useEffect(() => {
    if (walletTransactions?.length > 0) {
      generateCategoryBreakdown();
      generateTrendData();
      analyzePeakHourSpending();
    }
  }, [walletTransactions, dateRange]);

  // Filter transactions based on date range
  const getFilteredTransactions = () => {
    const now = new Date();
    let cutoffDate;

    switch (dateRange) {
      case 'week':
        cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'semester':
        cutoffDate = new Date(now - 120 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    return walletTransactions.filter(tx => 
      new Date(tx.timestamp) >= cutoffDate && tx.type === 'deduction'
    );
  };

  // Generate spending by category
  const generateCategoryBreakdown = () => {
    const filteredTransactions = getFilteredTransactions();
    const categories = {};

    filteredTransactions.forEach(tx => {
      let category = 'Other';
      
      if (tx.description.includes('Shuttle booking')) {
        category = 'Shuttle Bookings';
      } else if (tx.description.includes('Campus store')) {
        category = 'Campus Store';
      } else if (tx.description.includes('Penalty')) {
        category = 'Penalties';
      }
      
      categories[category] = (categories[category] || 0) + tx.amount;
    });

    setCategoryBreakdown(categories);
  };

  // Generate trend data for spending over time
  const generateTrendData = () => {
    const filteredTransactions = getFilteredTransactions();
    const dateFormat = dateRange === 'week' ? 'day' : 'week';
    const trendMap = {};
    
    // Initialize data structure
    if (dateRange === 'week') {
      // For weekly view, group by day
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString([], {weekday: 'short'});
        trendMap[dateKey] = 0;
      }
    } else {
      // For monthly/semester view, group by week
      const numberOfWeeks = dateRange === 'month' ? 4 : 16;
      for (let i = 0; i < numberOfWeeks; i++) {
        trendMap[`Week ${i+1}`] = 0;
      }
    }
    
    // Populate with data
    filteredTransactions.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      let dateKey;
      
      if (dateRange === 'week') {
        dateKey = txDate.toLocaleDateString([], {weekday: 'short'});
      } else {
        // Calculate which week the transaction falls into
        const now = new Date();
        const diffTime = Math.abs(now - txDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7) + 1;
        dateKey = `Week ${weekNumber}`;
      }
      
      if (trendMap[dateKey] !== undefined) {
        trendMap[dateKey] += tx.amount;
      }
    });
    
    // Convert to array format for chart
    const result = Object.entries(trendMap).map(([date, amount]) => ({ date, amount }));
    setTrendData(result);
  };

  // Analyze peak vs. off-peak hour spending
  const analyzePeakHourSpending = () => {
    const filteredTransactions = getFilteredTransactions();
    let peakHours = 0;
    let offPeakHours = 0;
    
    filteredTransactions.forEach(tx => {
      if (tx.description.includes('Shuttle booking')) {
        if (tx.description.includes('peak hour')) {
          peakHours += tx.amount;
        } else {
          offPeakHours += tx.amount;
        }
      }
    });
    
    setPeakHourAnalysis({ peakHours, offPeakHours });
  };

  // Calculate the most frequent route from transactions
  const getMostFrequentRoute = () => {
    const filteredTransactions = getFilteredTransactions();
    const routeCounts = {};
    
    filteredTransactions.forEach(tx => {
      if (tx.description.includes('Shuttle booking')) {
        // Extract route information from description
        const routeMatch = tx.description.match(/from (.+) to (.+)/);
        if (routeMatch && routeMatch.length >= 3) {
          const route = `${routeMatch[1]} to ${routeMatch[2]}`;
          routeCounts[route] = (routeCounts[route] || 0) + 1;
        }
      }
    });
    
    // Find the most frequent route
    let maxCount = 0;
    let mostFrequentRoute = '';
    
    Object.entries(routeCounts).forEach(([route, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentRoute = route;
      }
    });
    
    return { route: mostFrequentRoute, count: maxCount };
  };

  const mostFrequentRoute = getMostFrequentRoute();
  const totalSpent = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0);
  
  // Simple horizontal chart renderer
  const renderChartBar = (label, value, total, color) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
      <div className="mb-3" key={label}>
        <div className="d-flex justify-content-between mb-1">
          <div>{label}</div>
          <div><strong>{value}</strong> points</div>
        </div>
        <div className="progress" style={{ height: '10px' }}>
          <div 
            className={`progress-bar ${color}`} 
            role="progressbar" 
            style={{ width: `${percentage}%` }} 
            aria-valuenow={percentage}
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="expense-analytics">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Expense Analytics</h5>
        <div>
          <select 
            className="form-select form-select-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="semester">Semester</option>
          </select>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-7">
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Spending Breakdown</h6>
            </div>
            <div className="card-body">
              {Object.keys(categoryBreakdown).length > 0 ? (
                <div>
                  {Object.entries(categoryBreakdown).map(([category, amount], index) => {
                    const colors = [
                      'bg-primary',
                      'bg-success',
                      'bg-warning',
                      'bg-danger',
                      'bg-info'
                    ];
                    return renderChartBar(
                      category, 
                      amount, 
                      totalSpent, 
                      colors[index % colors.length]
                    );
                  })}
                  
                  <div className="text-end mt-3">
                    <div className="text-muted small">
                      Total spent: <strong>{totalSpent}</strong> points
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted">No spending data available</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Spending Timeline</h6>
            </div>
            <div className="card-body">
              {trendData.length > 0 ? (
                <div className="trend-chart">
                  <div className="d-flex justify-content-between mb-3">
                    {trendData.map((data, index) => (
                      <div 
                        key={index} 
                        className="trend-column"
                        style={{ width: `${100 / trendData.length}%` }}
                      >
                        <div className="trend-bar-container">
                          <div 
                            className="trend-bar bg-primary"
                            style={{ 
                              height: `${Math.min(100, (data.amount / Math.max(...trendData.map(d => d.amount))) * 100)}%` 
                            }}
                          >
                            <span className="trend-value">{data.amount}</span>
                          </div>
                        </div>
                        <div className="trend-label">{data.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted">No trend data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Peak Hour Analysis</h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="peak-hour-chart">
                  <div className="peak-hour-donut">
                    <div 
                      className="peak-slice"
                      style={{ 
                        transform: `rotate(0deg)`,
                        backgroundColor: '#0d6efd',
                        clipPath: `polygon(50% 50%, 100% 0%, 100% 100%)`
                      }}
                    ></div>
                    <div 
                      className="off-peak-slice"
                      style={{
                        transform: `rotate(90deg)`,
                        backgroundColor: '#20c997',
                        clipPath: `polygon(50% 50%, 100% 0%, 100% 100%)`
                      }}
                    ></div>
                    <div className="donut-hole"></div>
                  </div>
                </div>
              </div>
              
              <div className="row text-center">
                <div className="col-6">
                  <div className="peak-legend">
                    <span className="legend-color bg-primary"></span>
                    <div>
                      <div className="small text-muted">Peak Hours</div>
                      <div className="fw-bold">{peakHourAnalysis.peakHours} pts</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="peak-legend">
                    <span className="legend-color bg-success"></span>
                    <div>
                      <div className="small text-muted">Off-Peak</div>
                      <div className="fw-bold">{peakHourAnalysis.offPeakHours} pts</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <hr />
              
              <div className="text-center">
                <p className="text-muted mb-0 small">
                  Traveling during off-peak hours can save you up to 20% on fares
                </p>
              </div>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">Travel Insights</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="insight-icon bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-repeat text-primary"></i>
                </div>
                <div>
                  <h6>Most Frequent Route</h6>
                  <p className="mb-0">{mostFrequentRoute.route || 'No data'}</p>
                  {mostFrequentRoute.count > 0 && (
                    <div className="badge bg-light text-dark">
                      Traveled {mostFrequentRoute.count} times
                    </div>
                  )}
                </div>
              </div>
              
              <div className="d-flex align-items-start mb-3">
                <div className="insight-icon bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-graph-up text-success"></i>
                </div>
                <div>
                  <h6>Average Expense</h6>
                  <p className="mb-0">
                    {totalSpent > 0 && trendData.length > 0 
                      ? Math.round(totalSpent / trendData.length) 
                      : 0} points per {dateRange === 'week' ? 'day' : 'week'}
                  </p>
                </div>
              </div>
              
              <div className="d-flex align-items-start">
                <div className="insight-icon bg-light rounded-circle p-2 me-3">
                  <i className="bi bi-piggy-bank text-danger"></i>
                </div>
                <div>
                  <h6>Potential Savings</h6>
                  <p className="mb-0">
                    {Math.round(peakHourAnalysis.peakHours * 0.2)} points by switching to off-peak hours
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Travel Tips</h6>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item bg-transparent px-0">
                  <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                  Travel during off-peak hours to save points
                </li>
                <li className="list-group-item bg-transparent px-0">
                  <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                  Consider transfers for faster routes
                </li>
                <li className="list-group-item bg-transparent px-0">
                  <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                  Book in advance for popular destinations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .trend-chart {
          height: 200px;
          display: flex;
          align-items: flex-end;
        }
        
        .trend-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 4px;
        }
        
        .trend-bar-container {
          height: 150px;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        
        .trend-bar {
          width: 100%;
          max-width: 30px;
          min-height: 10px;
          border-radius: 3px 3px 0 0;
          position: relative;
        }
        
        .trend-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: var(--bs-secondary);
        }
        
        .trend-label {
          text-align: center;
          font-size: 11px;
          margin-top: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .peak-hour-chart {
          width: 150px;
          height: 150px;
          position: relative;
          margin: 0 auto;
        }
        
        .peak-hour-donut {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
        }
        
        .peak-slice, .off-peak-slice {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-origin: 50% 50%;
        }
        
        .donut-hole {
          position: absolute;
          width: 60%;
          height: 60%;
          background-color: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .peak-legend {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .legend-color {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          margin-right: 8px;
        }
        
        .insight-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
      `}</style>
    </div>
  );
};

export default ExpenseAnalytics; 