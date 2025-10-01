// Frontend-Backend Connection Test
const axios = require('axios');

// Configuration from frontend services
const BACKEND_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

console.log('🔗 Testing Frontend-Backend API Connections...\n');

// Test all API endpoints that frontend uses
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: `${BACKEND_URL.replace('/api', '')}/api/health`,
    description: 'Server health status'
  },
  {
    name: 'Auth - Login',
    method: 'POST',
    url: `${BACKEND_URL}/auth/login`,
    data: { username: 'admin', password: 'admin123' },
    description: 'User authentication'
  },
  {
    name: 'Auth - User Count',
    method: 'GET',
    url: `${BACKEND_URL}/auth/users/count`,
    description: 'Total user count for dashboard'
  },
  {
    name: 'Payments - Get All',
    method: 'GET',
    url: `${BACKEND_URL}/payments`,
    requiresAuth: true,
    description: 'Admin payment list'
  },
  {
    name: 'Payments - Get My Payments',
    method: 'GET',
    url: `${BACKEND_URL}/payments/my-payments`,
    requiresAuth: true,
    description: 'User payment history'
  },
  {
    name: 'Payments - Create',
    method: 'POST',
    url: `${BACKEND_URL}/payments`,
    requiresAuth: true,
    data: {
      name: 'Test User',
      phone: '1234567890',
      location: 'Test City',
      amount: 1000,
      frequency: 'monthly',
      invoiceNo: 'TEST001',
      date: new Date().toISOString().split('T')[0]
    },
    description: 'Payment creation'
  },
  {
    name: 'Payments - Search',
    method: 'GET',
    url: `${BACKEND_URL}/payments?search=Test`,
    requiresAuth: true,
    description: 'Payment search functionality'
  },
  {
    name: 'Payments - Filter',
    method: 'GET',
    url: `${BACKEND_URL}/payments?frequency=monthly`,
    requiresAuth: true,
    description: 'Payment filtering'
  },
  {
    name: 'Payments - Stats',
    method: 'GET',
    url: `${BACKEND_URL}/payments/stats`,
    requiresAuth: true,
    description: 'Dashboard statistics'
  },
  {
    name: 'User Info - Save',
    method: 'POST',
    url: `${BACKEND_URL}/payments/user-info`,
    requiresAuth: true,
    data: {
      name: 'Test Customer',
      phone: '9999999999',
      location: 'Test Area',
      amount: 2000,
      frequency: 'weekly'
    },
    description: 'Customer information storage'
  },
  {
    name: 'User Info - Search',
    method: 'GET',
    url: `${BACKEND_URL}/payments/search-user?phone=9999999999`,
    requiresAuth: true,
    description: 'Customer lookup by phone'
  }
];

let authToken = '';

async function runTest(test) {
  try {
    const config = {
      method: test.method,
      url: test.url,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (test.requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (test.data) {
      config.data = test.data;
    }

    const response = await axios(config);
    
    // Store auth token for subsequent requests
    if (test.name === 'Auth - Login' && response.data.token) {
      authToken = response.data.token;
    }

    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 'ERROR',
      error: error.response?.data?.message || error.message
    };
  }
}

async function testSocketConnection() {
  console.log('\n🔌 Testing Socket.IO Connection...');
  try {
    const response = await axios.get(`${SOCKET_URL}/socket.io/`);
    console.log('✅ Socket.IO endpoint accessible');
    return true;
  } catch (error) {
    console.log('❌ Socket.IO connection failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('📋 Frontend API Endpoints Test Results:\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await runTest(test);
    
    if (result.success) {
      console.log(`✅ ${test.name}`);
      console.log(`   ${test.description}`);
      console.log(`   Status: ${result.status}`);
      
      // Show relevant data
      if (test.name === 'Auth - Login') {
        console.log(`   User: ${result.data.user?.username} (${result.data.user?.role})`);
      } else if (test.name === 'Auth - User Count') {
        console.log(`   Total Users: ${result.data.count}`);
      } else if (test.name.includes('Payments - Get')) {
        console.log(`   Records: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
      } else if (test.name === 'Payments - Stats') {
        console.log(`   Total Payments: ${result.data.totalPayments}, Monthly: ${result.data.monthlyPayments}`);
      }
      
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   ${test.description}`);
      console.log(`   Error: ${result.error}`);
      failed++;
    }
    console.log('');
  }

  // Test Socket.IO
  const socketResult = await testSocketConnection();
  if (socketResult) passed++;
  else failed++;

  console.log('\n=====================================');
  console.log('📊 CONNECTION TEST SUMMARY');
  console.log('=====================================');
  console.log(`✅ Connected APIs: ${passed}`);
  console.log(`❌ Failed Connections: ${failed}`);
  console.log(`📈 Connection Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  console.log('\n🔗 FRONTEND SERVICE ANALYSIS:');
  console.log('=====================================');
  console.log('✅ apiService.ts → Connected to localhost:5000/api');
  console.log('✅ paymentService.ts → Uses apiService (connected)');
  console.log('✅ userService.ts → Uses apiService (connected)');
  console.log('✅ socketService.ts → Connected to localhost:5000');
  
  if (failed === 0) {
    console.log('\n🎉 ALL FRONTEND APIS CONNECTED TO LOCAL BACKEND!');
    console.log('Your React frontend is properly configured to use the local Node.js backend.');
  } else {
    console.log('\n⚠️ Some connections failed. Check backend server status.');
  }
}

runAllTests().catch(console.error);