# Appwrite Setup for API Key Management

This guide covers the additional Appwrite setup required for the API key management feature.

## API Keys Collection

1. In the "wine_db" database, create a new collection named "api_keys"
2. Set permissions: Make it readable and writable for any team member
3. Add the following attributes:

| Attribute     | Type     | Required | Default | Array | Description              |
|---------------|----------|----------|---------|-------|--------------------------|
| userId        | String   | Yes      | None    | No    | Reference to user        |
| name          | String   | Yes      | None    | No    | API key name             |
| key           | String   | Yes      | None    | No    | Full API key             |
| keyHash       | String   | Yes      | None    | No    | Hashed API key           |
| createdAt     | String   | Yes      | None    | No    | Creation timestamp       |
| lastUsedAt    | String   | No       | None    | No    | Last usage timestamp     |
| expiresAt     | String   | No       | None    | No    | Expiration timestamp     |

4. Create the following indexes:
   - Index on "userId"
   - Unique index on "keyHash"

## Environment Variables

Add these variables to your .env file:

```env
# JWT Secret (should already exist)
JWT_SECRET=your-jwt-secret

# API V1 URL (for documentation)
NEXT_PUBLIC_API_URL=https://api.etiketa.wine/v1
```

## API Documentation

The API documentation is available on the API dashboard page within the application.

## Testing the API

1. Log in to the application
2. Navigate to the API dashboard
3. Create a new API key
4. Copy the key (it will only be shown once)
5. Test the API using curl or Postman:

```bash
# Get all wines
curl -X GET https://api.etiketa.wine/v1/wines \
  -H "X-API-Key: your_api_key"

# Get a specific wine
curl -X GET https://api.etiketa.wine/v1/wines/wine_id \
  -H "X-API-Key: your_api_key"

# Create a new wine
curl -X POST https://api.etiketa.wine/v1/wines \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Wine", "vintage": 2023}'
```

## API Endpoints

The API provides the following endpoints:

### Wines
- `GET /v1/wines` - List all wines
- `GET /v1/wines/:id` - Get a specific wine
- `POST /v1/wines` - Create a new wine
- `PUT /v1/wines/:id` - Update a wine
- `DELETE /v1/wines/:id` - Delete a wine

### QR Codes
- `GET /v1/qrcodes/wine/:wineId` - Generate a QR code for a wine

### Analytics
- `GET /v1/analytics/summary` - Get analytics summary
- `GET /v1/analytics/wine/:wineId` - Get analytics for a specific wine