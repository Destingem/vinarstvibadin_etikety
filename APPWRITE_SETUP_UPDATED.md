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
4. Copy the project ID for the `.env` file

## 3. Enable Authentication

1. Go to "Auth" in the side menu
2. Under "Settings", enable the following providers:
   - Email/Password (enabled by default)
   - (Optional) Google OAuth
   - (Optional) Other OAuth providers

## 4. Create API Key

1. Go to "API Keys" in the side menu
2. Create a new API key with the following permissions:
   - `users.read`
   - `users.write`
   - `documents.read`
   - `documents.write`
   - `documents.delete`
   - `collections.read`
   - `databases.read`
3. Copy the API key for the `.env` file

## 5. Create Database

1. Go to "Databases" in the side menu
2. Create a new database named "wine_db"
3. Copy the database ID for your code (should match the DB_ID in appwrite-client.ts)

## 6. Create Wine Collection

1. In the "wine_db" database, create a new collection named "wines"
2. Set permissions: Make it readable and writable for any authenticated user
3. Add the following attributes:

| Attribute      | Type     | Required | Default | Array | Description               |
|----------------|----------|----------|---------|-------|---------------------------|
| userId         | String   | Yes      | None    | No    | Reference to Appwrite user|
| wineryName     | String   | Yes      | None    | No    | Name of the winery        |
| winerySlug     | String   | Yes      | None    | No    | URL-friendly winery name  |
| wineryAddress  | String   | No       | None    | No    | Address of the winery     |
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
   - Index on "userId"
   - Index on "winerySlug"
   - Composite index on "userId", "name", "vintage", "batch" (should be unique)

## 7. Environment Setup

Update your `.env` file with the following values (the ones you already have):

```env
# Appwrite
APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="vinarstviqr"
APPWRITE_KEY="your-api-key"

# Optional JWT support (not needed with Appwrite sessions)
JWT_SECRET="your-jwt-secret"
```

## 8. Key Differences from Previous Setup

The main change in this updated approach is using Appwrite's built-in authentication system instead of a custom one:

1. **User Management:**
   - Users are stored in Appwrite's users database
   - Winery information is stored as part of wine documents
   - Winery slug is stored in the user's preferences

2. **Authentication:**
   - Utilizes Appwrite's session management
   - Login uses createEmailSession
   - Registration uses account.create
   - Logout uses deleteSession

3. **Data Structure:**
   - Only need one collection (wines) instead of two
   - Each wine references its user (winery) through userId

## 9. Testing

After setup, test the application:

1. Register a new user (winery)
2. Login with the credentials
3. Create a new wine
4. Access the wine's QR code
5. Verify that the QR code links to the correct wine information page

## Troubleshooting

If you encounter issues:

1. Check console logs for errors
2. Verify your Appwrite credentials in .env
3. Ensure the collection and indexes are properly set up
4. Verify permissions on the collection
5. Check network requests to Appwrite in browser dev tools