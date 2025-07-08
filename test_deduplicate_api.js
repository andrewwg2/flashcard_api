/**
 * Test script for the deDuplicate maintenance API endpoint
 * 
 * This script demonstrates how to call the new maintenance endpoint
 * to remove duplicate flashcards from your database.
 * 
 * Usage: node test_deduplicate_api.js
 * 
 * Make sure your API server is running on http://localhost:5000
 */

const https = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const ENDPOINT = '/api/flashcards/maintenance/deduplicate';

/**
 * Make a POST request to the deDuplicate maintenance endpoint
 */
async function testDeDuplicateAPI() {
  console.log('🧹 Testing deDuplicate maintenance API endpoint...\n');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: ENDPOINT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log(`✅ Status Code: ${res.statusCode}`);
          console.log('📊 Response:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('\n🎉 Deduplication completed successfully!');
            console.log(`📈 Summary:`);
            console.log(`   • Duplicate groups found: ${response.result.duplicateGroupsFound}`);
            console.log(`   • Records deleted: ${response.result.recordsDeleted}`);
            console.log(`   • Remaining records: ${response.result.remainingRecords}`);
            console.log(`   • Completed at: ${response.timestamp}`);
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Make sure your API server is running on http://localhost:5000');
        console.log('   You can start it with: npm start or npm run dev');
      }
      
      reject(error);
    });

    req.end();
  });
}

/**
 * Example of how to use the endpoint with curl
 */
function showCurlExample() {
  console.log('\n📝 You can also test this endpoint using curl:');
  console.log(`curl -X POST ${API_BASE_URL}${ENDPOINT} \\`);
  console.log(`     -H "Content-Type: application/json"`);
  console.log('\n');
}

// Run the test
async function main() {
  try {
    await testDeDuplicateAPI();
    showCurlExample();
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { testDeDuplicateAPI };
