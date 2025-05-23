import { generateSampleData } from './analytics-service';

/**
 * Get analytics summary for a specific user/winery
 */
export async function getAnalyticsSummary(userId: string, range: string = '30days') {
  try {
    // In a real implementation, we would fetch data from the analytics database
    // For now, we'll generate sample data
    return generateSampleData(userId, range);
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

/**
 * Get analytics for a specific wine
 */
export async function getWineAnalytics(wineId: string, range: string = '30days') {
  try {
    // In a real implementation, we would fetch data from the analytics database
    // For now, we'll generate sample data for this wine
    const sampleData = generateSampleData('wine-owner-' + wineId, range);
    
    // Modify the data to be specific to this wine
    return {
      totalScans: Math.floor(sampleData.totalScans / 5),
      totalUniqueVisitors: Math.floor(sampleData.totalUniqueVisitors / 5),
      scansByDevice: {
        mobile: Math.floor(sampleData.scansByDevice.mobile / 5),
        tablet: Math.floor(sampleData.scansByDevice.tablet / 5),
        desktop: Math.floor(sampleData.scansByDevice.desktop / 5),
        unknown: 0
      },
      scanTrend: sampleData.scanTrend,
      dailyScans: sampleData.dailyScans.map(day => ({
        date: day.date,
        scanCount: Math.floor(day.scanCount / 5)
      })),
      topRegions: sampleData.topRegions.map(region => ({
        ...region,
        scanCount: Math.floor(region.scanCount / 5)
      })),
      languages: sampleData.languages.map(lang => ({
        ...lang,
        scanCount: Math.floor(lang.scanCount / 5)
      })),
      timeDistribution: sampleData.timeDistribution.map(time => ({
        ...time,
        scanCount: Math.floor(time.scanCount / 5)
      }))
    };
  } catch (error) {
    console.error('Error getting wine analytics:', error);
    throw error;
  }
}