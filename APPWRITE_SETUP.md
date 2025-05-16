# Appwrite Setup for Vinařství QR Codes

This guide will help you set up Appwrite for the wine QR code application.

## 1. Create an Appwrite Account

If you don't already have an Appwrite account:

1. Go to [https://appwrite.io](https://appwrite.io) and sign up
2. Verify your email and log in

## 2. Create a New Project

1. Create a new project named "VinarstviQR"
2. Select the Web platform
3. Enter your app's domain (e.g., localhost for development)
4. Copy the project ID for the .env file

## 3. Create API Key

1. Go to "API Keys" in the side menu
2. Create a new API key with the following permissions:
   - documents.read
   - documents.write
   - documents.delete
   - collections.read
   - databases.read
3. Copy the API key for the .env file

## 4. Create Database

1. Go to "Databases" in the side menu
2. Create a new database named "wine_db"
3. Copy the database ID for your code (should match the DB_ID in appwrite.ts)

## 5. Create Collections

### Wineries Collection

1. In the "wine_db" database, create a new collection named "wineries"
2. Set permissions: Make it readable and writable for any team member
3. Add the following attributes:

| Attribute     | Type     | Required | Default | Array | Description              |
|---------------|----------|----------|---------|-------|--------------------------|
| name          | String   | Yes      | None    | No    | Winery name              |
| slug          | String   | Yes      | None    | No    | URL-friendly name        |
| email         | String   | Yes      | None    | No    | Email for login          |
| passwordHash  | String   | Yes      | None    | No    | Hashed password          |
| passwordSalt  | String   | Yes      | None    | No    | Salt for password        |
| address       | String   | No       | None    | No    | Winery address           |
| createdAt     | String   | Yes      | None    | No    | Creation timestamp       |
| updatedAt     | String   | Yes      | None    | No    | Last update timestamp    |

4. Create the following indexes:
   - Unique index on "email"
   - Unique index on "slug"
   - Searchable index on "name"

### Wines Collection

1. In the "wine_db" database, create a new collection named "wines"
2. Set permissions: Make it readable and writable for any team member
3. Add the following attributes:

| Attribute      | Type     | Required | Default | Array | Description               |
|----------------|----------|----------|---------|-------|---------------------------|
| wineryId       | String   | Yes      | None    | No    | Reference to winery       |
| name           | String   | Yes      | None    | No    | Wine name                 |
| vintage        | Integer  | No       | None    | No    | Wine vintage year         |
| batch          | String   | No       | None    | No    | Batch/lot number          |
| alcoholContent | Float    | No       | None    | No    | Alcohol percentage        |
| energyValueKJ  | Float    | No       | None    | No    | Energy in kJ              |
| energyValueKcal| Float    | No       | None    | No    | Energy in kcal            |
| fat            | Float    | No       | 0       | No    | Fat content (g)           |
| saturatedFat   | Float    | No       | 0       | No    | Saturated fat (g)         |
| carbs          | Float    | No       | 0       | No    | Carbohydrates (g)         |
| sugars         | Float    | No       | 0       | No    | Sugars (g)                |
| protein        | Float    | No       | 0       | No    | Protein (g)               |
| salt           | Float    | No       | 0       | No    | Salt (g)                  |
| ingredients    | String   | No       | None    | No    | Ingredients list          |
| additionalInfo | String   | No       | None    | No    | Additional information    |
| allergens      | String   | No       | None    | No    | Allergen information      |
| wineRegion     | String   | No       | None    | No    | Wine region               |
| wineSubregion  | String   | No       | None    | No    | Wine subregion            |
| wineVillage    | String   | No       | None    | No    | Wine village              |
| wineTract      | String   | No       | None    | No    | Wine tract                |
| createdAt      | String   | Yes      | None    | No    | Creation timestamp        |
| updatedAt      | String   | Yes      | None    | No    | Last update timestamp     |

4. Create the following indexes:
   - Searchable index on "name"
   - Index on "wineryId"
   - Composite index on "wineryId", "name", "vintage", "batch" (should be unique)

## 6. Environment Setup

Update your `.env` file with the following values:

```env
# Appwrite
APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="your-project-id"
APPWRITE_KEY="your-api-key"

# Auth
JWT_SECRET="your-jwt-secret"
```

Replace:
- "your-project-id" with your Appwrite project ID
- "your-api-key" with your API key
- "your-jwt-secret" with a secure random string for JWT signing

## 7. Additional Configuration

Since we're using JWT for authentication (not Appwrite Account API directly), there are no additional Appwrite configurations needed. The application handles authentication internally using custom JWT tokens and the Appwrite Database API.

## 8. Data Migration

If you need to migrate existing data from another database:

1. Export data from your existing database
2. Format the data according to the Appwrite collections structure
3. Use the Appwrite SDK or API to import the data

## 9. Testing

After setup, test the application:

1. Register a new winery
2. Login with the winery credentials
3. Create a new wine
4. Access the wine's QR code
5. Verify that the QR code links to the correct wine information page

## Troubleshooting

If you encounter issues:

1. Check console logs for errors
2. Verify your Appwrite credentials in .env
3. Ensure all collections and indexes are properly set up
4. Verify permissions on collections
5. Check network requests to Appwrite in browser dev tools