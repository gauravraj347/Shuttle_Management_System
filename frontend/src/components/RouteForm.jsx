import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const RouteForm = ({ stops, initialData, onSubmit, buttonText = "Save Route" }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stops: [],
    orderedStops: [],
    isActive: true,
    fare: 10,
    peakHourFare: 15,
    distance: 0,
    estimatedTime: 0,
    schedule: [],
    optimizationFactors: {
      peakHours: false,
      classSchedules: false,
      demandAnalysis: false
    }
  });

  // For schedule management
  const [newWeekdayTime, setNewWeekdayTime] = useState('');
  const [newWeekendTime, setNewWeekendTime] = useState('');
  
  // Format stops data for react-select
  const stopsOptions = stops.map(stop => ({
    value: stop._id,
    label: stop.name
  }));

  useEffect(() => {
    if (initialData) {
      // Convert stops to array of IDs if they are objects
      const stopsArray = initialData.stops?.map(stop => 
        typeof stop === 'object' ? stop._id : stop
      ) || [];
      
      setFormData({
        _id: initialData._id,
        name: initialData.name || '',
        description: initialData.description || '',
        stops: stopsArray,
        orderedStops: initialData.orderedStops || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        fare: initialData.fare || 10,
        peakHourFare: initialData.peakHourFare || 15,
        distance: initialData.distance || 0,
        estimatedTime: initialData.estimatedTime || 0,
        schedule: initialData.schedule || [],
        optimizationFactors: initialData.optimizationFactors || {
          peakHours: false,
          classSchedules: false,
          demandAnalysis: false
        }
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('optimizationFactors.')) {
        const factor = name.split('.')[1];
        setFormData({
          ...formData,
          optimizationFactors: {
            ...formData.optimizationFactors,
            [factor]: checked
          }
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else if (name === 'fare' || name === 'peakHourFare' || name === 'distance' || name === 'estimatedTime') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleStopSelect = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setFormData({
        ...formData,
        stops: [],
        orderedStops: []
      });
      return;
    }
    
    // Get new stop IDs that weren't in the previous selection
    const currentStops = formData.stops;
    const newSelectedIds = selectedOptions.map(option => option.value);
    
    // Keep existing ordered stops that are still selected
    let newOrderedStops = formData.orderedStops
      .filter(item => newSelectedIds.includes(item.stopId))
      .map((item, index) => ({ ...item, order: index }));
    
    // Add newly selected stops to the end of orderedStops
    const existingStopIds = newOrderedStops.map(item => item.stopId);
    const newStopIds = newSelectedIds.filter(id => !existingStopIds.includes(id));
    
    newStopIds.forEach((stopId, index) => {
      newOrderedStops.push({
        stopId,
        order: existingStopIds.length + index
      });
    });
    
    setFormData({
      ...formData,
      stops: newSelectedIds,
      orderedStops: newOrderedStops
    });
  };

  const moveStopUp = (index) => {
    if (index <= 0) return;
    
    const newOrderedStops = [...formData.orderedStops];
    // Swap current stop with the previous one
    [newOrderedStops[index], newOrderedStops[index - 1]] = [newOrderedStops[index - 1], newOrderedStops[index]];
    // Update order numbers
    newOrderedStops.forEach((stop, i) => {
      stop.order = i;
    });
    
    setFormData({
      ...formData,
      orderedStops: newOrderedStops
    });
  };

  const moveStopDown = (index) => {
    if (index >= formData.orderedStops.length - 1) return;
    
    const newOrderedStops = [...formData.orderedStops];
    // Swap current stop with the next one
    [newOrderedStops[index], newOrderedStops[index + 1]] = [newOrderedStops[index + 1], newOrderedStops[index]];
    // Update order numbers
    newOrderedStops.forEach((stop, i) => {
      stop.order = i;
    });
    
    setFormData({
      ...formData,
      orderedStops: newOrderedStops
    });
  };

  const handleRemoveStop = (stopId) => {
    // Remove from stops array
    const updatedStops = formData.stops.filter(id => id !== stopId);
    
    // Remove from orderedStops array
    const updatedOrderedStops = formData.orderedStops
      .filter(stop => stop.stopId !== stopId)
      .map((stop, index) => ({ ...stop, order: index })); // Reorder remaining stops
    
    setFormData({
      ...formData,
      stops: updatedStops,
      orderedStops: updatedOrderedStops
    });
  };

  const addWeekdayTime = () => {
    if (!newWeekdayTime) return;
    
    // Check if we already have a weekday entry in the schedule
    const weekdayScheduleIndex = formData.schedule.findIndex(item => item.day === 'weekday');
    
    if (weekdayScheduleIndex >= 0) {
      // Update existing weekday schedule
      const updatedSchedule = [...formData.schedule];
      updatedSchedule[weekdayScheduleIndex] = {
        ...updatedSchedule[weekdayScheduleIndex],
        departureTime: [...updatedSchedule[weekdayScheduleIndex].departureTime, newWeekdayTime]
      };
      
      setFormData({
        ...formData,
        schedule: updatedSchedule
      });
    } else {
      // Create new weekday schedule
      setFormData({
        ...formData,
        schedule: [
          ...formData.schedule,
          {
            day: 'weekday',
            departureTime: [newWeekdayTime]
          }
        ]
      });
    }
    
    setNewWeekdayTime('');
  };

  

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="name" className="form-label">Route Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="2"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="fare" className="form-label">Regular Fare (Points)</label>
          <input
            type="number"
            className="form-control"
            id="fare"
            name="fare"
            min="0"
            step="0.1"
            value={formData.fare}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="peakHourFare" className="form-label">Peak Hour Fare (Points)</label>
          <input
            type="number"
            className="form-control"
            id="peakHourFare"
            name="peakHourFare"
            min="0"
            step="0.1"
            value={formData.peakHourFare}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="distance" className="form-label">Route Distance (km)</label>
          <input
            type="number"
            className="form-control"
            id="distance"
            name="distance"
            min="0"
            step="0.1"
            value={formData.distance}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="estimatedTime" className="form-label">Estimated Time (minutes)</label>
          <input
            type="number"
            className="form-control"
            id="estimatedTime"
            name="estimatedTime"
            min="0"
            value={formData.estimatedTime}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">Route Stops</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="stops" className="form-label">Select Stops</label>
            <Select
              isMulti
              name="stops"
              options={stopsOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleStopSelect}
              value={stopsOptions.filter(option => formData.stops.includes(option.value))}
            />
            <small className="form-text text-muted">Select stops for this route, then arrange them in order below.</small>
          </div>

          {formData.orderedStops.length > 0 && (
            <div>
              <label className="form-label">Stop Order</label>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.orderedStops.map((orderedStop, index) => {
                      const stop = stops.find(s => s._id === orderedStop.stopId);
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">Schedule</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              
              <div className="input-group mb-2">
                <input
                  type="time"
                  className="form-control"
                  value={newWeekdayTime}
                  onChange={(e) => setNewWeekdayTime(e.target.value)}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-primary" 
                  onClick={addWeekdayTime}
                >
                  Add
                </button>
              </div>
              <div className="list-group">
                {formData.schedule.find(item => item.day === 'weekday')?.departureTime.map((time, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{time}</span>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => removeWeekdayTime(index)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                {!formData.schedule.find(item => item.day === 'weekday') || 
                 formData.schedule.find(item => item.day === 'weekday').departureTime.length === 0 ? (
                  <div className="list-group-item text-muted">No times added</div>
                ) : null}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Optimization Factors</label>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="peakHours"
            name="optimizationFactors.peakHours"
            checked={formData.optimizationFactors.peakHours}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="peakHours">
            Optimize for Peak Hours
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="classSchedules"
            name="optimizationFactors.classSchedules"
            checked={formData.optimizationFactors.classSchedules}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="classSchedules">
            Consider Class Schedules
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="demandAnalysis"
            name="optimizationFactors.demandAnalysis"
            checked={formData.optimizationFactors.demandAnalysis}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="demandAnalysis">
            Use Demand Analysis
          </label>
        </div>
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default RouteForm; 