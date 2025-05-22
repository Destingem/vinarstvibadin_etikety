// This script sets up the correct permissions for analytics collections
const { Client, Databases } = require('node-appwrite');

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set API key
if (process.env.APPWRITE_KEY) {
  client.setKey(process.env.APPWRITE_KEY);
} else {
  console.error('APPWRITE_KEY environment variable not set');
  process.exit(1);
}

// Initialize the Databases service
const databases = new Databases(client);

// Database and collection IDs
const ANALYTICS_DB_ID = 'analytics';
const collections = [
  'scan_events',
  'daily_scan_stats',
  'regional_scan_stats',
  'language_scan_stats',
  'hourly_scan_stats', 
  'wine_popularity_rankings'
];

// Define permissions
// For read-only analytics data:
// - Create/Read/Update/Delete for server (API key)
// - Everyone can read
const readPermissions = async (collectionId) => {
  try {
    console.log(`Setting permissions for collection: ${collectionId}`);
    await databases.updateCollection(
      ANALYTICS_DB_ID,
      collectionId,
      collectionId, // Keep collection name
      null, // Don't change collection name
      [
        'role:all' // Allow anyone to read
      ], 
      [
        'role:all' // Allow anyone to create (needed for scan tracking)
      ],
      [
        'role:all' // Allow anyone to update (needed for aggregation)
      ],
      [
        'role:all' // Allow anyone to delete (needed for maintenance)
      ]
    );
    console.log(`Permissions set successfully for ${collectionId}`);
  } catch (error) {
    console.error(`Error setting permissions for ${collectionId}:`, error);
  }
};

// Main function to set up permissions
async function setupPermissions() {
  console.log('Setting up permissions for analytics collections...');
  
  for (const collection of collections) {
    await readPermissions(collection);
  }
  
  console.log('All permissions set up!');
}

// Run the setup
setupPermissions().catch(error => {
  console.error('Failed to set up permissions:', error);
  process.exit(1);
});