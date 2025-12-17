/**
 * Comprehensive Test Script for Service Auth APIs
 * Tests all endpoints using the provided access key
 * 
 * Usage: 
 *   nvm use 22
 *   node test-service-auth.js
 * 
 * Note: Requires Node.js 22 (project requirement)
 */

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion !== 22) {
  console.error(`\n❌ Error: This project requires Node.js version 22.`);
  console.error(`   Current version: ${nodeVersion}`);
  console.error(`   Please use nvm to switch to Node.js 22:`);
  console.error(`   nvm use 22\n`);
  process.exit(1);
}

// Configuration
const BASE_URL = 'http://localhost:5002';
const ACCESS_KEY = 'ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5';

// Test data
const testUser = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPass123',
  name: 'Test User',
  custom_fields: {
    department: 'Engineering',
    role: 'Developer'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to print colored messages
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to print section headers
function printSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Helper function to print test results
function printResult(testName, success, data = null, error = null) {
  const status = success ? '✓ PASS' : '✗ FAIL';
  const color = success ? 'green' : 'red';
  
  log(`\n[${status}] ${testName}`, color);
  
  if (data) {
    console.log('Response:', JSON.stringify(data, null, 2));
  }
  
  if (error) {
    log(`Error: ${error.message || error}`, 'red');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  return success;
}

// Store tokens for subsequent tests
let accessToken = null;
let refreshToken = null;
let userId = null;

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(method, url, data = null, headers = {}) {
  const options = {
    method,
    headers: {
      ...headers
    }
  };
  
  // Only add Content-Type and body if we have data to send
  if (data) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  const responseData = await response.json();
  
  if (!response.ok) {
    const error = new Error(responseData.message || `HTTP ${response.status}`);
    error.response = {
      status: response.status,
      data: responseData
    };
    throw error;
  }
  
  return { data: responseData, status: response.status };
}

/**
 * Test 1: Register a new user
 */
async function testRegister() {
  printSection('TEST 1: Register New User');
  
  try {
    const response = await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/register`,
      {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
        custom_fields: testUser.custom_fields
      },
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`
      }
    );
    
    if (response.data.success && response.data.data.user) {
      userId = response.data.data.user.id;
      return printResult('Register User', true, response.data);
    } else {
      return printResult('Register User', false, null, 'Unexpected response format');
    }
  } catch (error) {
    return printResult('Register User', false, null, error);
  }
}

/**
 * Test 2: Login user (should return only accessToken)
 */
async function testLogin() {
  printSection('TEST 2: Login User');
  
  try {
    const response = await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/login`,
      {
        email: testUser.email,
        password: testUser.password
      },
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`
      }
    );
    
    if (response.data.success && response.data.data.tokens) {
      accessToken = response.data.data.tokens.accessToken;
      
      // Verify that refreshToken is NOT in the response
      if (response.data.data.tokens.refreshToken) {
        log('WARNING: refreshToken should not be in login response!', 'yellow');
      }
      
      log(`\n✓ Access Token received: ${accessToken.substring(0, 50)}...`, 'green');
      return printResult('Login User', true, response.data);
    } else {
      return printResult('Login User', false, null, 'Unexpected response format');
    }
  } catch (error) {
    return printResult('Login User', false, null, error);
  }
}

/**
 * Test 3: Get refresh token using access token
 */
async function testRefreshToken() {
  printSection('TEST 3: Get Refresh Token (using Access Token)');
  
  if (!accessToken) {
    return printResult('Get Refresh Token', false, null, 'Access token not available from login');
  }
  
  try {
    const response = await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/refresh-token`,
      {
        accessToken: accessToken
      },
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`
      }
    );
    
    if (response.data.success && response.data.data.refreshToken) {
      refreshToken = response.data.data.refreshToken;
      
      // Verify that accessToken is NOT in the response
      if (response.data.data.accessToken) {
        log('WARNING: accessToken should not be in refresh-token response!', 'yellow');
      }
      
      log(`\n✓ Refresh Token received: ${refreshToken.substring(0, 50)}...`, 'green');
      return printResult('Get Refresh Token', true, response.data);
    } else {
      return printResult('Get Refresh Token', false, null, 'Unexpected response format');
    }
  } catch (error) {
    return printResult('Get Refresh Token', false, null, error);
  }
}

/**
 * Test 4: Access profile using refresh token and access key
 */
async function testProfile() {
  printSection('TEST 4: Get User Profile (using AccessKey + RefreshToken)');
  
  if (!refreshToken) {
    return printResult('Get Profile', false, null, 'Refresh token not available');
  }
  
  try {
    const response = await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/profile`,
      null, // No body needed - userId comes from refreshToken
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`,
        'X-Refresh-Token': refreshToken
      }
    );
    
    return printResult('Get Profile', true, response.data);
  } catch (error) {
    return printResult('Get Profile', false, null, error);
  }
}

/**
 * Test 5: Access protected endpoint using refresh token and access key
 * This demonstrates using refresh token + access key to access other APIs
 */
async function testProtectedAccess() {
  printSection('TEST 5: Access Protected Endpoint (using AccessKey + RefreshToken)');
  
  if (!refreshToken) {
    return printResult('Protected Access', false, null, 'Refresh token not available');
  }
  
  try {
    // Demonstrate accessing profile with both AccessKey and RefreshToken
    log('Note: To access protected APIs, you need both:', 'yellow');
    log('1. Authorization: AccessKey <access_key>', 'yellow');
    log('2. X-Refresh-Token: <refreshToken>', 'yellow');
    
    // Test accessing profile again to demonstrate the pattern
    const response = await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/profile`,
      null,
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`,
        'X-Refresh-Token': refreshToken
      }
    );
    
    log(`\n✓ Successfully accessed protected endpoint with AccessKey + RefreshToken`, 'green');
    return printResult('Protected Access', true, { message: 'AccessKey + RefreshToken authentication working', profile: response.data });
  } catch (error) {
    return printResult('Protected Access', false, null, error);
  }
}

/**
 * Test 6: Logout user
 */
async function testLogout() {
  printSection('TEST 6: Logout User');
  
  if (!refreshToken) {
    return printResult('Logout', false, null, 'Refresh token not available');
  }
  
  try {
    const response = await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/logout`,
      {
        refreshToken: refreshToken
      },
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`
      }
    );
    
    return printResult('Logout User', true, response.data);
  } catch (error) {
    return printResult('Logout User', false, null, error);
  }
}

/**
 * Test 7: Try to use refresh token after logout (should fail)
 */
async function testTokenAfterLogout() {
  printSection('TEST 7: Verify Token Revoked After Logout');
  
  if (!refreshToken) {
    return printResult('Token After Logout', false, null, 'Refresh token not available');
  }
  
  // Store the refresh token before logout
  const revokedToken = refreshToken;
  
  try {
    // Try to access profile with the revoked refresh token - should fail
    await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/profile`,
      null,
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`,
        'X-Refresh-Token': revokedToken
      }
    );
    
    // If we get here, the token was not properly revoked
    return printResult('Token After Logout (Should Fail)', false, null, 'Token should be revoked but profile access succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✓ Token properly revoked - access denied as expected', 'green');
      return printResult('Token After Logout (Expected Failure)', true, null);
    } else {
      return printResult('Token After Logout', false, null, error);
    }
  }
}

/**
 * Test 8: Error cases - Invalid access token
 */
async function testErrorCases() {
  printSection('TEST 8: Error Cases');
  
  // Test with invalid access token
  try {
    await makeRequest(
      'POST',
      `${BASE_URL}/api/v1/service/auth/refresh-token`,
      {
        accessToken: 'invalid_token_here'
      },
      {
        'Authorization': `AccessKey ${ACCESS_KEY}`
      }
    );
    return printResult('Invalid Access Token', false, null, 'Should have failed');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return printResult('Invalid Access Token (Expected Failure)', true, null);
    } else {
      return printResult('Invalid Access Token', false, null, error);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n' + '='.repeat(60), 'bright');
  log('SERVICE AUTH API TEST SUITE', 'bright');
  log('='.repeat(60), 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Access Key: ${ACCESS_KEY}`, 'blue');
  log(`Test User Email: ${testUser.email}`, 'blue');
  
  const results = [];
  
  try {
    // Run tests in sequence
    results.push(await testRegister());
    results.push(await testLogin());
    results.push(await testRefreshToken());
    results.push(await testProfile());
    results.push(await testProtectedAccess());
    results.push(await testLogout());
    results.push(await testTokenAfterLogout());
    results.push(await testErrorCases());
    
    // Print summary
    printSection('TEST SUMMARY');
    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    const total = results.length;
    
    log(`Total Tests: ${total}`, 'bright');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    
    if (passed === total) {
      log('\n✓ All tests passed!', 'green');
    } else {
      log('\n✗ Some tests failed. Please review the output above.', 'red');
    }
    
    // Print token flow summary
    printSection('TOKEN FLOW SUMMARY');
    log('1. Login → Returns: accessToken only', 'cyan');
    log('2. Refresh Token API (using accessToken) → Returns: refreshToken only', 'cyan');
    log('3. Access Protected APIs → Requires: AccessKey + RefreshToken', 'cyan');
    log('   - Header: Authorization: AccessKey <access_key>', 'cyan');
    log('   - Header: X-Refresh-Token: <refreshToken>', 'cyan');
    log('4. Logout → Revokes refreshToken', 'cyan');
    
  } catch (error) {
    log(`\nFatal error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the tests
runTests().catch(console.error);
