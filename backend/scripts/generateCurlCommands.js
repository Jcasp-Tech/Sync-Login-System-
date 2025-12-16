/**
 * Script to generate all cURL commands from apiEndpoints.js
 * Usage: node scripts/generateCurlCommands.js
 */

const apiEndpoints = require('../src/config/apiEndpoints');

console.log('='.repeat(80));
console.log('API cURL Commands for Testing');
console.log('='.repeat(80));
console.log(`Base URL: ${apiEndpoints.client.endpoints[0].curl.match(/http:\/\/[^\s]+/)[0].replace('/api/v1/client/auth/register', '')}`);
console.log('='.repeat(80));
console.log('\n');

// Client API Endpoints
console.log('## CLIENT API ENDPOINTS\n');
apiEndpoints.client.endpoints.forEach((endpoint, index) => {
  console.log(`${index + 1}. ${endpoint.name}`);
  console.log(`   Endpoint: ${endpoint.endpoint}`);
  console.log(`   cURL:`);
  console.log(`   ${endpoint.curl}`);
  console.log('\n' + '-'.repeat(80) + '\n');
});

// Service API Endpoints (if any)
if (apiEndpoints.service.endpoints && apiEndpoints.service.endpoints.length > 0) {
  console.log('## SERVICE API ENDPOINTS\n');
  apiEndpoints.service.endpoints.forEach((endpoint, index) => {
    if (endpoint.note) {
      console.log(`   ${endpoint.note}`);
    } else {
      console.log(`${index + 1}. ${endpoint.name}`);
      console.log(`   Endpoint: ${endpoint.endpoint}`);
      console.log(`   cURL:`);
      console.log(`   ${endpoint.curl}`);
    }
    console.log('\n' + '-'.repeat(80) + '\n');
  });
}

console.log('='.repeat(80));
console.log('End of cURL Commands');
console.log('='.repeat(80));
