#!/usr/bin/env node

// This script verifies that a URL is correctly formatted for our wine routes

const wineId = '12f6753c-736c-414d-8832-433d550f9187';
const winerySlug = 'ondrej-zaplatilek';
const baseUrl = 'http://localhost:3000';

// Format the URL properly
const url = `${baseUrl}/${winerySlug}/${wineId}`;

console.log('Wine URL Checker');
console.log('---------------');
console.log('Base URL:', baseUrl);
console.log('Winery Slug:', winerySlug);
console.log('Wine ID:', wineId);
console.log('---------------');
console.log('Formatted URL:', url);
console.log('URL Parts:');

// Parse the URL to verify it's correctly formatted
const parsedUrl = new URL(url);
console.log('- Protocol:', parsedUrl.protocol);
console.log('- Host:', parsedUrl.host);
console.log('- Pathname:', parsedUrl.pathname);

// Check if pathname has the correct structure
const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
console.log('- Path parts:', pathParts);

if (pathParts.length === 2) {
  console.log('✅ URL has the correct structure: /{winerySlug}/{wineId}');
  
  if (pathParts[0] === winerySlug) {
    console.log('✅ Winery slug matches expected value');
  } else {
    console.log('❌ Winery slug does not match expected value');
    console.log(`  Expected: ${winerySlug}`);
    console.log(`  Actual:   ${pathParts[0]}`);
  }
  
  if (pathParts[1] === wineId) {
    console.log('✅ Wine ID matches expected value');
  } else {
    console.log('❌ Wine ID does not match expected value');
    console.log(`  Expected: ${wineId}`);
    console.log(`  Actual:   ${pathParts[1]}`);
  }
} else {
  console.log('❌ URL does not have the correct structure');
  console.log(`  Expected 2 path parts, got ${pathParts.length}`);
}

// Output browser test instructions
console.log('\nTo test in browser:');
console.log('1. Start the Next.js server: npm run dev');
console.log(`2. Open this URL: ${url}`);
console.log('3. If you see a 404, check the server logs for more details');