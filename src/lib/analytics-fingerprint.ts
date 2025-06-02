/**
 * GDPR-Compliant Analytics Fingerprinting
 * Creates anonymous user fingerprints from scan data without storing personal information
 */

export interface ScanEvent {
  wineryId: string;
  hour: number;
  countryCode?: string;
  operatingSystem?: string;
  languageUsed?: string;
  deviceType?: string;
  date: string;
  wineId: string;
}

/**
 * Generate GDPR-compliant user fingerprint
 * Uses: wineryId + 2-hour window + region + OS + language + deviceType
 */
export function generateUserFingerprint(scan: ScanEvent): string {
  // Group hours in 2-hour windows for privacy (0-1, 2-3, 4-5, etc.)
  const hourGroup = Math.floor(scan.hour / 2) * 2;
  
  const fingerprint = [
    scan.wineryId,
    hourGroup.toString(),
    scan.countryCode || 'unknown',
    scan.operatingSystem || 'unknown',
    scan.languageUsed || 'unknown', 
    scan.deviceType || 'unknown'
  ].join('|');
  
  return fingerprint;
}

/**
 * Calculate unique visitors from scan events using fingerprinting
 */
export function calculateUniqueVisitors(scanEvents: ScanEvent[]): number {
  const uniqueFingerprints = new Set<string>();
  
  scanEvents.forEach(scan => {
    const fingerprint = generateUserFingerprint(scan);
    uniqueFingerprints.add(fingerprint);
  });
  
  return uniqueFingerprints.size;
}

/**
 * Calculate return visitor rate (users with multiple scan sessions)
 */
export function calculateReturnRate(scanEvents: ScanEvent[]): number {
  const fingerprintSessions = new Map<string, Set<string>>();
  
  scanEvents.forEach(scan => {
    const fingerprint = generateUserFingerprint(scan);
    const sessionKey = `${scan.date}|${Math.floor(scan.hour / 2) * 2}`; // 2-hour sessions
    
    if (!fingerprintSessions.has(fingerprint)) {
      fingerprintSessions.set(fingerprint, new Set());
    }
    fingerprintSessions.get(fingerprint)!.add(sessionKey);
  });
  
  // Count users with multiple sessions (return visitors)
  const returnVisitors = Array.from(fingerprintSessions.values()).filter(
    sessions => sessions.size > 1
  ).length;
  
  const totalUniqueVisitors = fingerprintSessions.size;
  
  return totalUniqueVisitors > 0 ? (returnVisitors / totalUniqueVisitors) * 100 : 0;
}

/**
 * Estimate average session duration based on scan patterns
 */
export function estimateSessionDuration(scanEvents: ScanEvent[]): string {
  const fingerprintSessions = new Map<string, number[]>();
  
  scanEvents.forEach(scan => {
    const fingerprint = generateUserFingerprint(scan);
    
    if (!fingerprintSessions.has(fingerprint)) {
      fingerprintSessions.set(fingerprint, []);
    }
    fingerprintSessions.get(fingerprint)!.push(scan.hour);
  });
  
  // Calculate session durations
  const sessionDurations: number[] = [];
  
  fingerprintSessions.forEach(hours => {
    if (hours.length > 1) {
      // Sort hours and calculate span
      hours.sort((a, b) => a - b);
      const duration = hours[hours.length - 1] - hours[0];
      // Assume each scan represents ~30 minutes of engagement
      sessionDurations.push(duration * 60 + 30); // Convert to minutes
    } else {
      // Single scan - estimate 2-3 minutes average
      sessionDurations.push(2.5 * 60); // 2.5 minutes in seconds
    }
  });
  
  if (sessionDurations.length === 0) {
    return "0:00";
  }
  
  const avgSeconds = sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length;
  const minutes = Math.floor(avgSeconds / 60);
  const seconds = Math.floor(avgSeconds % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate bounce rate (single-scan sessions)
 */
export function calculateBounceRate(scanEvents: ScanEvent[]): number {
  const fingerprintScans = new Map<string, number>();
  
  scanEvents.forEach(scan => {
    const fingerprint = generateUserFingerprint(scan);
    fingerprintScans.set(fingerprint, (fingerprintScans.get(fingerprint) || 0) + 1);
  });
  
  const singleScanSessions = Array.from(fingerprintScans.values()).filter(count => count === 1).length;
  const totalSessions = fingerprintScans.size;
  
  return totalSessions > 0 ? (singleScanSessions / totalSessions) * 100 : 0;
}

/**
 * Get comprehensive analytics metrics using fingerprinting
 */
export function getAdvancedMetrics(scanEvents: ScanEvent[]) {
  return {
    uniqueVisitors: calculateUniqueVisitors(scanEvents),
    returnRate: calculateReturnRate(scanEvents),
    avgSessionDuration: estimateSessionDuration(scanEvents),
    bounceRate: calculateBounceRate(scanEvents)
  };
}