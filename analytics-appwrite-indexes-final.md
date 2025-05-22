# Analytics Collections - Detailed Index Setup

## 1. scan_events Collection

### Indexes:

| Index Name | Attributes | Type | Order |
|------------|------------|------|-------|
| timestamp_idx | `timestamp` | Key | ASC |
| wineId_idx | `wineId` | Key | ASC |
| wineryId_idx | `wineryId` | Key | ASC |
| countryCode_idx | `countryCode` | Key | ASC |
| deviceType_idx | `deviceType` | Key | ASC |
| wine_timestamp_idx | `wineId`, `timestamp` | Key | ASC, ASC |
| winery_timestamp_idx | `wineryId`, `timestamp` | Key | ASC, ASC |

## 2. daily_scan_stats Collection

### Indexes:

| Index Name | Attributes | Type | Order |
|------------|------------|------|-------|
| date_idx | `date` | Key | ASC |
| wineryId_idx | `wineryId` | Key | ASC |
| wineId_idx | `wineId` | Key | ASC |
| unique_daily_stats | `date`, `wineryId`, `wineId` | Unique | ASC, ASC, ASC |

## 3. regional_scan_stats Collection

### Indexes:

| Index Name | Attributes | Type | Order |
|------------|------------|------|-------|
| date_idx | `date` | Key | ASC |
| wineryId_idx | `wineryId` | Key | ASC |
| countryCode_idx | `countryCode` | Key | ASC |
| winery_country_idx | `wineryId`, `countryCode` | Key | ASC, ASC |
| unique_regional_idx | `date`, `wineryId`, `wineId`, `countryCode`, `regionCode`, `city` | Unique | ASC, ASC, ASC, ASC, ASC, ASC |

## 4. language_scan_stats Collection

### Indexes:

| Index Name | Attributes | Type | Order |
|------------|------------|------|-------|
| date_idx | `date` | Key | ASC |
| wineryId_idx | `wineryId` | Key | ASC |
| language_idx | `language` | Key | ASC |
| winery_language_idx | `wineryId`, `language` | Key | ASC, ASC |
| unique_language_idx | `date`, `wineryId`, `wineId`, `language` | Unique | ASC, ASC, ASC, ASC |

## 5. hourly_scan_stats Collection

### Indexes:

| Index Name | Attributes | Type | Order |
|------------|------------|------|-------|
| date_idx | `date` | Key | ASC |
| wineryId_idx | `wineryId` | Key | ASC |
| hour_idx | `hour` | Key | ASC |
| time_search_idx | `date`, `hour` | Key | ASC, ASC |
| unique_hourly_idx | `date`, `hour`, `wineryId`, `wineId` | Unique | ASC, ASC, ASC, ASC |

## 6. wine_popularity_rankings Collection

### Indexes:

| Index Name | Attributes | Type | Order |
|------------|------------|------|-------|
| date_idx | `date` | Key | ASC |
| wineryId_idx | `wineryId` | Key | ASC |
| periodType_idx | `periodType` | Key | ASC |
| unique_ranking_idx | `date`, `periodType`, `wineryId` | Unique | ASC, ASC, ASC |

## Index Implementation Instructions

When creating indexes in Appwrite:

1. Navigate to your project in the Appwrite Console
2. Select "Databases" from the left menu
3. Choose your database and then the appropriate collection
4. Click on the "Indexes" tab
5. Click "Create Index" and fill in the details according to the tables above
6. Click "Create" to create the index

### Important Notes:

- **Key Type**: Standard database key used for most queries (select "Key")
- **Unique Type**: Enforces uniqueness constraints, preventing duplicate data (select "Unique")
- **Fulltext Type**: Used for text search operations (not needed for these collections)
- **Order**: Almost all indexes use ASC (ascending) order

For optimal performance:
- Create single-field indexes for frequently filtered fields
- Create composite indexes for queries with multiple constraints
- Ensure unique constraints are properly enforced by unique indexes