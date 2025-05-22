# Analytics Module - Permissions Setup

## Authorization Issues

If you're experiencing authorization issues with the analytics module, you need to ensure the correct permissions are set up in Appwrite. For analytics to work properly, the collections need specific permissions:

1. Public read access for the dashboard to display data
2. Public create access for recording anonymous QR code scans
3. Public update/delete access for aggregating data and maintenance

## Setting Up Permissions

There are two ways to set up the permissions:

### Option 1: Using the Appwrite Console (Recommended for beginners)

1. Open the Appwrite Console
2. Navigate to Databases > analytics
3. Click on each collection and update the permissions:
   - For all collections: Add `role:all` to Read, Create, Update, and Delete permissions

### Option 2: Using the Setup Script (Recommended for developers)

The repository includes a script to automatically set up the correct permissions:

```bash
# Set your Appwrite API key
export APPWRITE_KEY="your-api-key-here"

# Optional: Set endpoint and project ID if different from defaults
export APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="vinarstviqr"

# Run the setup script
node scripts/setup-analytics-permissions.js
```

## Verification

To verify the permissions are working correctly:

1. Visit the analytics dashboard page
2. Check the browser console for any authorization errors
3. If there are still errors, review the collection IDs in the script to ensure they match your database setup

## Security Considerations

The current setup allows public access to maintain simplicity. For production environments, consider:

1. Implementing more restrictive permissions
2. Using specific user roles rather than `role:all`
3. Setting up document-level permissions so wineries can only view their own data