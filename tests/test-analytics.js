/**
 * Test script to verify analytics functionality
 */
const fetch = require('node-fetch');

// Configuration
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const TEST_WINE_ID = process.env.TEST_WINE_ID || '';
const TEST_WINERY_ID = process.env.TEST_WINERY_ID || '';
const TEST_WINERY_SLUG = process.env.TEST_WINERY_SLUG || '';
const NUM_REQUESTS = process.env.NUM_REQUESTS ? parseInt(process.env.NUM_REQUESTS) : 5;

if (!TEST_WINE_ID || !TEST_WINERY_ID || !TEST_WINERY_SLUG) {
  console.error('Error: You must provide TEST_WINE_ID, TEST_WINERY_ID, and TEST_WINERY_SLUG environment variables.');
  process.exit(1);
}

/**
 * Simulates a scan event
 */
async function simulateScan() {
  try {
    const data = {
      wineId: TEST_WINE_ID,
      wineName: 'Test Wine',
      wineryId: TEST_WINERY_ID,
      wineryName: 'Test Winery',
      winerySlug: TEST_WINERY_SLUG,
      wineBatch: 'TEST-BATCH',
      wineVintage: 2023,
      languageUsed: 'cs'
    };

    // Random IP (for testing only)
    const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    // Sample user agents
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Languages
    const languages = ['cs', 'en', 'de', 'sk'];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    
    // Send the request
    const response = await fetch(`${SITE_URL}/api/analytics/record-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': randomUserAgent,
        'Accept-Language': `${randomLanguage},en-US;q=0.9,en;q=0.8`,
        'X-Forwarded-For': ip
      },
      body: JSON.stringify({
        ...data,
        languageUsed: randomLanguage
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error simulating scan:', error);
    return { error: error.message };
  }
}

/**
 * Main function to run tests
 */
async function runTests() {
  console.log(`Starting analytics test with ${NUM_REQUESTS} simulated scan events...`);
  
  const results = [];
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    console.log(`Simulating scan ${i + 1}/${NUM_REQUESTS}...`);
    const result = await simulateScan();
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\nTest results:');
  console.log(`${results.filter(r => r.success).length} successful scans recorded`);
  console.log(`${results.filter(r => !r.success).length} failed scans`);
  
  // Check if aggregation endpoint is available
  try {
    console.log('\nTesting aggregation endpoint...');
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(`${SITE_URL}/api/analytics/aggregate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: today
      })
    });
    
    const result = await response.json();
    console.log('Aggregation result:', result);
    
    if (result.success) {
      console.log('✅ Aggregation endpoint working correctly');
    } else {
      console.log('❌ Aggregation failed');
    }
  } catch (error) {
    console.error('Error testing aggregation:', error);
  }
  
  console.log('\nTest completed!');
}

// Run the tests
runTests();