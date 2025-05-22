# Analytics Module for etiketa.wine

This document provides an overview of the new Analytics Module implemented for tracking QR code scans in the etiketa.wine application.

## Features

The analytics module offers the following features:

### 1. QR Code Scan Tracking
- Records every QR code scan anonymously
- Tracks metrics by wine, batch, and product
- Provides daily, weekly, and monthly statistics

### 2. Regional Statistics (Geolocation)
- Based on IP addresses (no precise GPS data)
- Breakdowns by cities, regions, and countries
- Helps optimize distribution and marketing in regions with high interest

### 3. Device Type Analysis
- Mobile / Tablet / Desktop distribution
- Operating system information
- Helps understand customer behavior patterns

### 4. Language Preferences
- Tracks which language version customers are viewing
- Helps prioritize translation efforts and export strategies

### 5. Time Trends
- Hour of day analysis
- Day of week patterns
- Helps optimize social media posting and marketing campaigns

### 6. Most Popular Wines
- Ranking of most frequently scanned wines
- Helps identify which products generate the most interest

### 7. Combined Analytics
- Custom reports combining different metrics
- Identifies trends and patterns across multiple dimensions

## Implementation Details

### Data Collection

1. **Anonymous Tracking**: All data is collected anonymously with IP addresses masked for privacy
2. **Client-Side Component**: Added to wine detail pages to track scans
3. **Minimal Performance Impact**: Uses a lightweight tracking endpoint with keepalive

### Data Storage

Data is stored in Appwrite with the following collections:

1. **scan_events**: Raw scan event data
2. **daily_scan_stats**: Aggregated daily statistics 
3. **regional_scan_stats**: Geographic statistics
4. **language_scan_stats**: Language preference tracking
5. **hourly_scan_stats**: Time-of-day patterns
6. **wine_popularity_rankings**: Ranked list of popular wines

### Data Processing

1. **Real-time Collection**: Scan events are recorded in real-time
2. **Daily Aggregation**: A scheduled endpoint processes raw data into aggregated statistics
3. **Efficient Queries**: Pre-aggregated data enables fast dashboard loading

### Dashboard Interface

The analytics dashboard provides:

1. **Overview Cards**: Summary metrics of total scans, visitors, and trends
2. **Time Series Charts**: Visual representation of scan trends over time
3. **Geographic Distribution**: Regional breakdown of customer engagement
4. **Device Analysis**: Distribution of device types used for scanning
5. **Language Reports**: Breakdown of customer language preferences
6. **Hourly Trends**: Analysis of scan activity throughout the day
7. **Popular Wines**: Ranking of wines by scan frequency

## Setup Instructions

Detailed setup instructions are available in:
- `/src/app/api/analytics/SETUP.md` - Installation guide for the Appwrite collections

## Testing

A test script is provided to verify the analytics functionality:
- `/tests/test-analytics.js` - Simulates QR code scans for testing

## Next Steps and Future Enhancements

Potential future improvements:

1. **Export Functionality**: Allow exporting analytics data to CSV/Excel
2. **Custom Date Ranges**: More flexible date range selection
3. **Advanced Visualizations**: Additional chart types and visualizations
4. **Benchmark Comparisons**: Compare performance against industry averages
5. **Marketing Integration**: Connect analytics with marketing tools
6. **Alert System**: Notifications for unusual scan activity
7. **Real-time Dashboard**: Live updating metrics for highly active products

## Technical Requirements

- D3.js for data visualization
- UA-Parser-JS for device detection
- Appwrite for data storage

---

This analytics module provides wineries with valuable insights into customer engagement with their QR codes, helping optimize product information, marketing strategies, and export efforts based on actual customer behavior.