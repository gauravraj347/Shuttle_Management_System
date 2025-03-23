const demoData = {
  users: [
    {
      name: 'John Student',
      email: 'john@example.com',
      password: 'password123',
      role: 'student',
      studentId: 'STU001',
      isEmailVerified: true
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true
    },
    {
      name: 'Sara Johnson',
      email: 'sara@example.com',
      password: 'sara123',
      role: 'student',
      studentId: 'STU002',
      isEmailVerified: true
    }
  ],
  
  routes: [
    {
      name: 'Main Campus Loop',
      description: 'Circular route covering all major campus buildings',
      distance: 3.5,
      estimatedTime: 15,
      fare: 30,
      peakHourFare: 45,
      schedule: [
        { day: 'weekday', departureTime: ['08:00', '09:00', '10:00', '11:00', '12:00'] },
        { day: 'weekend', departureTime: ['10:00', '12:00', '14:00', '16:00'] }
      ]
    },
    {
      name: 'Residence to Library',
      description: 'Direct route from residence halls to main library',
      distance: 2.1,
      estimatedTime: 10,
      fare: 25,
      peakHourFare: 35,
      schedule: [
        { day: 'weekday', departureTime: ['08:30', '09:30', '10:30', '11:30', '12:30'] },
        { day: 'weekend', departureTime: ['11:00', '13:00', '15:00', '17:00'] }
      ]
    },
    {
      name: 'Engineering Loop',
      description: 'Route covering engineering buildings and labs',
      distance: 2.8,
      estimatedTime: 12,
      fare: 28,
      peakHourFare: 40,
      schedule: [
        { day: 'weekday', departureTime: ['07:45', '08:45', '09:45', '10:45', '11:45'] },
        { day: 'weekend', departureTime: ['09:30', '11:30', '13:30', '15:30'] }
      ]
    }
  ],
  
  stops: [
    {
      name: 'Main Building',
      location: { lat: 37.7749, lng: -122.4194 },
      facilities: ['Shelter', 'Seating', 'Information Board']
    },
    {
      name: 'Science Complex',
      location: { lat: 37.7750, lng: -122.4180 },
      facilities: ['Shelter', 'Seating']
    },
    {
      name: 'Student Center',
      location: { lat: 37.7752, lng: -122.4175 },
      facilities: ['Shelter', 'Seating', 'Information Board', 'Vending Machine']
    },
    {
      name: 'Sports Complex',
      location: { lat: 37.7748, lng: -122.4170 },
      facilities: ['Shelter', 'Seating']
    },
    {
      name: 'North Residence Hall',
      location: { lat: 37.7760, lng: -122.4190 },
      facilities: ['Shelter', 'Seating', 'Information Board']
    },
    {
      name: 'Campus Cross',
      location: { lat: 37.7755, lng: -122.4185 },
      facilities: ['Shelter', 'Seating']
    },
    {
      name: 'Main Library',
      location: { lat: 37.7752, lng: -122.4183 },
      facilities: ['Shelter', 'Seating', 'Information Board', 'Coffee Shop']
    },
    {
      name: 'Engineering Building',
      location: { lat: 37.7742, lng: -122.4165 },
      facilities: ['Shelter', 'Seating', 'Information Board']
    }
  ],
  
  shuttles: [
    {
      name: 'Shuttle 1',
      vehicleNumber: 'SH-001',
      capacity: 20,
      currentLocation: { lat: 37.7750, lng: -122.4183 },
      status: 'active'
    },
    {
      name: 'Shuttle 2',
      vehicleNumber: 'SH-002',
      capacity: 15,
      currentLocation: { lat: 37.7758, lng: -122.4187 },
      status: 'active'
    },
    {
      name: 'Shuttle 3',
      vehicleNumber: 'SH-003',
      capacity: 20,
      currentLocation: { lat: 37.7745, lng: -122.4172 },
      status: 'inactive'
    },
    {
      name: 'Shuttle 4',
      vehicleNumber: 'SH-004',
      capacity: 25,
      currentLocation: { lat: 37.7752, lng: -122.4178 },
      status: 'active'
    }
  ],
  
  wallets: [
    {
      balance: 460,
      currency: 'points',
      transactions: [
        {
          amount: 100,
          type: 'credit',
          description: 'Wallet top-up',
          timestamp: new Date('2023-03-15T10:30:00')
        },
        {
          amount: 30,
          type: 'debit',
          description: 'Shuttle booking - Route A to B',
          timestamp: new Date('2023-03-16T08:45:00'),
          isPeakHour: true
        }
      ]
    },
    {
      balance: 250,
      currency: 'points',
      transactions: [
        {
          amount: 50,
          type: 'credit',
          description: 'Wallet top-up',
          timestamp: new Date('2023-03-14T14:20:00')
        },
        {
          amount: 25,
          type: 'debit',
          description: 'Shuttle booking - Route C to D',
          timestamp: new Date('2023-03-15T09:15:00'),
          isPeakHour: false
        }
      ]
    }
  ],
  
  bookings: [
    {
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      status: 'confirmed',
      fare: 30,
      isPeakHour: true
    },
    {
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
      status: 'confirmed',
      fare: 25,
      isPeakHour: false
    },
    {
      departureTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'completed',
      fare: 30,
      isPeakHour: true
    }
  ]
};

module.exports = demoData; 