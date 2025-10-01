const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let userToken = '';

// Test data
const testUser = {
  username: 'testuser123',
  password: 'testpass123',
  role: 'user'
};

const testPayment = {
  name: 'John Doe',
  phone: '9876543210',
  location: 'Test City',
  amount: 5000,
  frequency: 'monthly',
  invoiceNo: 'INV001',
  date: new Date().toISOString().split('T')[0],
  status: 'Paid'
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status 
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  const result = await apiCall('GET', '/health');
  console.log(result.success ? '✅ Health check passed' : '❌ Health check failed:', result.error);
  return result.success;
}

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...');
  const result = await apiCall('POST', '/auth/login', {
    username: 'admin',
    password: 'admin123'
  });
  
  if (result.success) {
    adminToken = result.data.token;
    console.log('✅ Admin login successful');
    console.log(`   User: ${result.data.user.username} (${result.data.user.role})`);
  } else {
    console.log('❌ Admin login failed:', result.error);
  }
  return result.success;
}

async function testCollectionAgentLogin() {
  console.log('\n👤 Testing Collection Agent Login...');
  const result = await apiCall('POST', '/auth/login', {
    username: 'collection agent',
    password: 'collection123'
  });
  
  if (result.success) {
    userToken = result.data.token;
    console.log('✅ Collection agent login successful');
    console.log(`   User: ${result.data.user.username} (${result.data.user.role})`);
  } else {
    console.log('❌ Collection agent login failed:', result.error);
  }
  return result.success;
}

async function testUserRegistration() {
  console.log('\n📝 Testing User Registration...');
  const result = await apiCall('POST', '/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ User registration successful');
    console.log(`   User ID: ${result.data.user.id}`);
  } else {
    console.log('❌ User registration failed:', result.error);
  }
  return result.success;
}

async function testInvalidLogin() {
  console.log('\n🚫 Testing Invalid Login...');
  const result = await apiCall('POST', '/auth/login', {
    username: 'invalid',
    password: 'invalid'
  });
  
  if (!result.success && result.status === 401) {
    console.log('✅ Invalid login properly rejected');
  } else {
    console.log('❌ Invalid login test failed');
  }
  return !result.success;
}

async function testUserCount() {
  console.log('\n📊 Testing User Count...');
  const result = await apiCall('GET', '/auth/users/count');
  
  if (result.success) {
    console.log('✅ User count retrieved successfully');
    console.log(`   Total users: ${result.data.count}`);
  } else {
    console.log('❌ User count failed:', result.error);
  }
  return result.success;
}

async function testCreatePayment() {
  console.log('\n💰 Testing Payment Creation...');
  const result = await apiCall('POST', '/payments', testPayment, userToken);
  
  if (result.success) {
    console.log('✅ Payment created successfully');
    console.log(`   Payment ID: ${result.data._id}`);
    console.log(`   Invoice: ${result.data.invoiceNo}`);
    testPayment.id = result.data._id; // Store for later tests
  } else {
    console.log('❌ Payment creation failed:', result.error);
  }
  return result.success;
}

async function testGetAllPayments() {
  console.log('\n📋 Testing Get All Payments (Admin)...');
  const result = await apiCall('GET', '/payments', null, adminToken);
  
  if (result.success) {
    console.log('✅ All payments retrieved successfully');
    console.log(`   Total payments: ${result.data.length}`);
  } else {
    console.log('❌ Get all payments failed:', result.error);
  }
  return result.success;
}

async function testGetMyPayments() {
  console.log('\n👤 Testing Get My Payments...');
  const result = await apiCall('GET', '/payments/my-payments', null, userToken);
  
  if (result.success) {
    console.log('✅ My payments retrieved successfully');
    console.log(`   My payments count: ${result.data.length}`);
  } else {
    console.log('❌ Get my payments failed:', result.error);
  }
  return result.success;
}

async function testPaymentSearch() {
  console.log('\n🔍 Testing Payment Search...');
  const result = await apiCall('GET', '/payments?search=John', null, adminToken);
  
  if (result.success) {
    console.log('✅ Payment search successful');
    console.log(`   Search results: ${result.data.length}`);
  } else {
    console.log('❌ Payment search failed:', result.error);
  }
  return result.success;
}

async function testPaymentFilter() {
  console.log('\n🔽 Testing Payment Filter...');
  const result = await apiCall('GET', '/payments?frequency=monthly', null, adminToken);
  
  if (result.success) {
    console.log('✅ Payment filter successful');
    console.log(`   Filtered results: ${result.data.length}`);
  } else {
    console.log('❌ Payment filter failed:', result.error);
  }
  return result.success;
}

async function testSaveUserInfo() {
  console.log('\n💾 Testing Save User Info...');
  const userInfo = {
    name: 'Jane Smith',
    phone: '9876543211',
    location: 'Test Location',
    amount: 3000,
    frequency: 'weekly'
  };
  
  const result = await apiCall('POST', '/payments/user-info', userInfo, userToken);
  
  if (result.success) {
    console.log('✅ User info saved successfully');
  } else {
    console.log('❌ Save user info failed:', result.error);
  }
  return result.success;
}

async function testSearchUser() {
  console.log('\n🔍 Testing Search User...');
  const result = await apiCall('GET', '/payments/search-user?phone=9876543211', null, userToken);
  
  if (result.success) {
    console.log('✅ User search successful');
    console.log(`   Found user: ${result.data.name}`);
  } else {
    console.log('❌ User search failed:', result.error);
  }
  return result.success;
}

async function testAdminSearchUser() {
  console.log('\n👑 Testing Admin Search User...');
  const result = await apiCall('GET', '/payments/admin-search-user?phone=9876543210', null, adminToken);
  
  if (result.success) {
    console.log('✅ Admin user search successful');
    console.log(`   User info: ${result.data.userInfo?.name || 'Not found'}`);
    console.log(`   Payment history: ${result.data.paymentHistory?.length || 0} records`);
  } else {
    console.log('❌ Admin user search failed:', result.error);
  }
  return result.success;
}

async function testGetStats() {
  console.log('\n📈 Testing Get Stats...');
  const result = await apiCall('GET', '/payments/stats', null, adminToken);
  
  if (result.success) {
    console.log('✅ Stats retrieved successfully');
    console.log(`   Total payments: ${result.data.totalPayments}`);
    console.log(`   Monthly payments: ${result.data.monthlyPayments}`);
  } else {
    console.log('❌ Get stats failed:', result.error);
  }
  return result.success;
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  const result = await apiCall('GET', '/payments', null, null); // No token
  
  if (!result.success && (result.status === 401 || result.status === 403)) {
    console.log('✅ Unauthorized access properly blocked');
  } else {
    console.log('❌ Unauthorized access test failed');
  }
  return !result.success;
}

async function testDeletePayment() {
  console.log('\n🗑️ Testing Delete Payment...');
  if (!testPayment.id) {
    console.log('❌ No payment ID available for deletion test');
    return false;
  }
  
  const result = await apiCall('DELETE', `/payments/${testPayment.id}`, null, adminToken);
  
  if (result.success) {
    console.log('✅ Payment deleted successfully');
  } else {
    console.log('❌ Payment deletion failed:', result.error);
  }
  return result.success;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting DpChitFund API Tests...');
  console.log('=====================================');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Collection Agent Login', fn: testCollectionAgentLogin },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Invalid Login', fn: testInvalidLogin },
    { name: 'User Count', fn: testUserCount },
    { name: 'Create Payment', fn: testCreatePayment },
    { name: 'Get All Payments', fn: testGetAllPayments },
    { name: 'Get My Payments', fn: testGetMyPayments },
    { name: 'Payment Search', fn: testPaymentSearch },
    { name: 'Payment Filter', fn: testPaymentFilter },
    { name: 'Save User Info', fn: testSaveUserInfo },
    { name: 'Search User', fn: testSearchUser },
    { name: 'Admin Search User', fn: testAdminSearchUser },
    { name: 'Get Stats', fn: testGetStats },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
    { name: 'Delete Payment', fn: testDeletePayment }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n=====================================');
  console.log('📊 TEST SUMMARY');
  console.log('=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your API is working perfectly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Check if axios is available
if (typeof require !== 'undefined') {
  runAllTests().catch(console.error);
} else {
  console.log('❌ This script requires Node.js and axios package');
  console.log('Run: npm install axios');
}