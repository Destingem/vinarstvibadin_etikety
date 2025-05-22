# Analytics Module Setup

This document provides instructions for setting up the Analytics module for tracking QR code scans.

## Required Appwrite Collections

Create the following collections in your Appwrite database:

1. `scan_events` - Stores individual scan events
2. `daily_scan_stats` - Stores aggregated daily statistics
3. `regional_scan_stats` - Stores geographical statistics
4. `language_scan_stats` - Stores language preferences
5. `hourly_scan_stats` - Stores time-of-day patterns
6. `wine_popularity_rankings` - Stores wine popularity rankings

## Collection Setup Instructions

### 1. `scan_events` Collection

#### Attributes:
- `timestamp` (datetime): When the scan occurred
- `ipAddress` (string, optional): Masked/hashed IP address for privacy
- `userAgent` (string, optional): User agent string
- `deviceType` (string, enum): "MOBILE", "TABLET", "DESKTOP", "UNKNOWN"
- `operatingSystem` (string, optional): OS name
- `browserLanguage` (string, optional): User's browser language preference
- `countryCode` (string, optional): 2-letter country code
- `regionCode` (string, optional): Region/state code
- `city` (string, optional): City name
- `languageUsed` (string, optional): Language version of the page viewed
- `referrer` (string, optional): Where the scan came from
- `wineId` (string): ID of the wine being viewed
- `wineName` (string): Name of the wine
- `wineBatch` (string, optional): Batch number of the wine
- `wineVintage` (number, optional): Vintage of the wine
- `wineryId` (string): ID of the winery
- `wineryName` (string): Name of the winery
- `winerySlug` (string): Slug of the winery

#### Indexes:
- `timestamp` (ASC)
- `wineId` (ASC)
- `wineryId` (ASC)
- `countryCode` (ASC)
- `deviceType` (ASC)

### 2. `daily_scan_stats` Collection

#### Attributes:
- `date` (datetime): The date for this aggregate
- `wineryId` (string): ID of the winery
- `wineId` (string, optional): ID of the wine (null for winery-level stats)
- `scanCount` (number): Total number of scans
- `uniqueVisitorsEstimate` (number): Estimated unique visitors
- `mobileCount` (number): Count of mobile device scans
- `tabletCount` (number): Count of tablet device scans
- `desktopCount` (number): Count of desktop device scans

#### Indexes:
- `date` (ASC)
- `wineryId` (ASC)
- `wineId` (ASC)
- Composite index: `date`, `wineryId`, `wineId`

### 3. `regional_scan_stats` Collection

#### Attributes:
- `date` (datetime): The date for this aggregate
- `wineryId` (string): ID of the winery
- `wineId` (string, optional): ID of the wine (null for winery-level aggregates)
- `countryCode` (string): 2-letter country code
- `regionCode` (string, optional): Region/state code
- `city` (string, optional): City name
- `scanCount` (number): Total scans from this location

#### Indexes:
- `date` (ASC)
- `wineryId` (ASC)
- `countryCode` (ASC)
- Composite index: `date`, `wineryId`, `wineId`, `countryCode`

### 4. `language_scan_stats` Collection

#### Attributes:
- `date` (datetime): The date for this aggregate
- `wineryId` (string): ID of the winery
- `wineId` (string, optional): ID of the wine (null for winery-level aggregates)
- `language` (string): Language code (e.g., "cs", "en", "de")
- `scanCount` (number): Total scans in this language

#### Indexes:
- `date` (ASC)
- `wineryId` (ASC)
- `language` (ASC)
- Composite index: `date`, `wineryId`, `wineId`, `language`

### 5. `hourly_scan_stats` Collection

#### Attributes:
- `date` (datetime): The date for this aggregate
- `hour` (number): The hour of day (0-23)
- `wineryId` (string): ID of the winery
- `wineId` (string, optional): ID of the wine (null for winery-level aggregates)
- `scanCount` (number): Total scans during this hour

#### Indexes:
- `date` (ASC)
- `wineryId` (ASC)
- `hour` (ASC)
- Composite index: `date`, `hour`, `wineryId`, `wineId`

### 6. `wine_popularity_rankings` Collection

#### Attributes:
- `date` (datetime): The date for these rankings
- `periodType` (string): "daily", "weekly", "monthly", "yearly"
- `wineryId` (string): ID of the winery
- `rankings` (JSON array): Pre-calculated ranking data

#### Indexes:
- `date` (ASC)
- `wineryId` (ASC)
- `periodType` (ASC)
- Composite index: `date`, `periodType`, `wineryId`

## Installation Steps

1. Create all the collections in your Appwrite database according to the structure above.

2. Install required npm packages:
   ```bash
   npm install d3 ua-parser-js
   ```

3. Set up a scheduled task to run the aggregation endpoint daily:
   - You can use a service like Vercel Cron Jobs to call the `/api/analytics/aggregate` endpoint once per day.
   - Alternatively, you can use GitHub Actions to periodically trigger the endpoint.

## Testing

1. Use the provided test script in `tests/test-analytics.js` to generate test data:
   ```bash
   TEST_WINE_ID=your_wine_id TEST_WINERY_ID=your_winery_id TEST_WINERY_SLUG=your_winery_slug NUM_REQUESTS=10 node tests/test-analytics.js
   ```

2. Check that scan events are recorded in the `scan_events` collection.

3. Run the aggregation endpoint manually to generate aggregate data:
   ```bash
   curl -X POST http://localhost:3000/api/analytics/aggregate -H "Content-Type: application/json" -d '{"date":"2025-05-21"}'
   ```

4. Visit the analytics dashboard at `/dashboard/analytics` to see the results.

## Maintenance

- The analytics data will grow over time. Consider implementing a data retention policy for raw scan events.
- For optimal performance, consider creating additional indexes on frequently queried fields.
- Monitor the size of your collections and implement pagination for large data sets.