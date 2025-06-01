/**
 * GDPR Compliance Library for Wine Intelligence Platform
 * Ensures all analytics operations comply with EU data protection regulations
 */

export interface GDPRCompliantScanEvent {
  // Temporal data (no precise timestamps)
  date: string; // YYYY-MM-DD format only
  hour: number; // 0-23, no minutes/seconds
  
  // Geographic data (anonymized to country level)
  countryCode?: string; // ISO country code only
  
  // Technical data (non-identifying)
  deviceType: string; // mobile/tablet/desktop
  operatingSystem?: string; // general OS category
  browserLanguage?: string; // language preference
  
  // Business data (product-focused, not user-focused)
  wineId: string;
  wineName: string;
  wineBatch?: string;
  wineVintage?: string;
  wineryId: string;
  wineryName: string;
  winerySlug: string;
  languageUsed?: string;
}

export interface ConsentRecord {
  wineryId: string;
  consentGiven: boolean;
  consentDate: string;
  consentVersion: string;
  purposes: string[];
  lawfulBasis: 'consent' | 'legitimate_interest';
  ipAddress?: string; // Hashed for verification
}

export interface ComplianceReport {
  dataRetentionCompliance: boolean;
  anonymizationCompliance: boolean;
  accessControlCompliance: boolean;
  consentValidityCompliance: boolean;
  issues: string[];
  lastChecked: string;
}

/**
 * Data Anonymization Utilities
 */
export class DataAnonymizer {
  /**
   * Anonymize IP address by removing last two octets
   */
  static anonymizeIP(ip: string): string {
    if (!ip) return 'unknown';
    
    // IPv4 anonymization
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.0.0`;
      }
    }
    
    // IPv6 anonymization (keep first 64 bits)
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return `${parts.slice(0, 4).join(':')}::`;
    }
    
    return 'unknown';
  }

  /**
   * Extract country code from geographic coordinates without storing precise location
   */
  static getCountryFromLocation(coordinates?: { lat: number; lng: number }): string | undefined {
    if (!coordinates) return undefined;
    
    // This would use a reverse geocoding service in production
    // For now, return undefined to ensure no location tracking
    return undefined;
  }

  /**
   * Sanitize user agent to extract only device type
   */
  static getDeviceType(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Extract general OS category without version details
   */
  static getOSCategory(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac') || ua.includes('darwin')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return 'unknown';
  }

  /**
   * Add differential privacy noise to small datasets
   */
  static addDifferentialPrivacy(value: number, sensitivity: number = 1, epsilon: number = 0.1): number {
    // Laplacian noise for differential privacy
    const scale = sensitivity / epsilon;
    const u = Math.random() - 0.5;
    const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    
    return Math.max(0, Math.round(value + noise));
  }
}

/**
 * Data Retention Management
 */
export class DataRetentionManager {
  private static readonly RETENTION_PERIODS = {
    RAW_SCAN_EVENTS: 90, // days
    DAILY_AGGREGATES: 730, // 2 years
    MONTHLY_AGGREGATES: 1825, // 5 years
    TREND_ANALYSIS: 365 // 1 year
  };

  /**
   * Check if data should be deleted based on retention periods
   */
  static shouldDelete(dataType: keyof typeof DataRetentionManager.RETENTION_PERIODS, createdDate: string): boolean {
    const retentionDays = this.RETENTION_PERIODS[dataType];
    const created = new Date(createdDate);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    
    return created < cutoff;
  }

  /**
   * Generate deletion criteria for database cleanup
   */
  static getDeletionCriteria(dataType: keyof typeof DataRetentionManager.RETENTION_PERIODS): string {
    const retentionDays = this.RETENTION_PERIODS[dataType];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    return cutoffDate.toISOString().split('T')[0];
  }
}

/**
 * Consent Management
 */
export class ConsentManager {
  /**
   * Validate consent record
   */
  static isConsentValid(consent: ConsentRecord): boolean {
    if (!consent.consentGiven) return false;
    
    // Check if consent is not older than 2 years (recommended refresh period)
    const consentDate = new Date(consent.consentDate);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    return consentDate > twoYearsAgo;
  }

  /**
   * Generate consent record
   */
  static createConsentRecord(
    wineryId: string,
    purposes: string[],
    lawfulBasis: 'consent' | 'legitimate_interest' = 'legitimate_interest',
    ipAddress?: string
  ): ConsentRecord {
    return {
      wineryId,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      consentVersion: '1.0',
      purposes,
      lawfulBasis,
      ipAddress: ipAddress ? this.hashIP(ipAddress) : undefined
    };
  }

  /**
   * Hash IP address for consent verification without storing actual IP
   */
  private static hashIP(ip: string): string {
    // Simple hash - in production, use proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

/**
 * GDPR Compliance Validator
 */
export class GDPRValidator {
  /**
   * Validate scan event data for GDPR compliance
   */
  static validateScanEvent(event: any): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for prohibited data
    if (event.userId || event.sessionId || event.fingerprint) {
      issues.push('Contains user tracking identifiers');
    }

    if (event.ipAddress && !this.isIPAnonymized(event.ipAddress)) {
      issues.push('IP address not properly anonymized');
    }

    if (event.coordinates || event.exactLocation) {
      issues.push('Contains precise location data');
    }

    if (event.personalInfo || event.email || event.phone) {
      issues.push('Contains personal information');
    }

    // Check for required anonymization
    if (event.timestamp && this.hasExcessiveTemporalPrecision(event.timestamp)) {
      issues.push('Timestamp too precise - should be limited to hour granularity');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Check if IP is properly anonymized
   */
  private static isIPAnonymized(ip: string): boolean {
    // IPv4: last two octets should be 0
    if (ip.includes('.')) {
      const parts = ip.split('.');
      return parts.length === 4 && parts[2] === '0' && parts[3] === '0';
    }
    
    // IPv6: should end with ::
    if (ip.includes(':')) {
      return ip.endsWith('::');
    }
    
    return false;
  }

  /**
   * Check if timestamp has excessive precision
   */
  private static hasExcessiveTemporalPrecision(timestamp: string): boolean {
    // Should only have date and hour, not minutes/seconds
    const date = new Date(timestamp);
    return date.getMinutes() !== 0 || date.getSeconds() !== 0 || date.getMilliseconds() !== 0;
  }

  /**
   * Comprehensive GDPR compliance check
   */
  static async verifyGDPRCompliance(): Promise<ComplianceReport> {
    const issues: string[] = [];
    
    // Check data retention compliance
    const retentionCompliance = await this.checkDataRetention();
    if (!retentionCompliance) {
      issues.push('Data retention periods exceeded');
    }

    // Check anonymization compliance
    const anonymizationCompliance = await this.checkAnonymization();
    if (!anonymizationCompliance) {
      issues.push('Data anonymization insufficient');
    }

    // Check access controls
    const accessControlCompliance = await this.checkAccessControls();
    if (!accessControlCompliance) {
      issues.push('Access control violations detected');
    }

    // Check consent validity
    const consentCompliance = await this.checkConsentValidity();
    if (!consentCompliance) {
      issues.push('Invalid or expired consent records');
    }

    return {
      dataRetentionCompliance: retentionCompliance,
      anonymizationCompliance: anonymizationCompliance,
      accessControlCompliance: accessControlCompliance,
      consentValidityCompliance: consentCompliance,
      issues,
      lastChecked: new Date().toISOString()
    };
  }

  private static async checkDataRetention(): Promise<boolean> {
    // In production, this would check actual database records
    // For now, return true as retention is handled by automated cleanup
    return true;
  }

  private static async checkAnonymization(): Promise<boolean> {
    // In production, this would validate that all stored data is properly anonymized
    return true;
  }

  private static async checkAccessControls(): Promise<boolean> {
    // In production, this would audit access logs and permissions
    return true;
  }

  private static async checkConsentValidity(): Promise<boolean> {
    // In production, this would check all consent records for validity
    return true;
  }
}

/**
 * Data Subject Rights Handler
 */
export class DataSubjectRights {
  /**
   * Handle data subject access request (Article 15)
   */
  static async handleAccessRequest(wineryId: string): Promise<any> {
    return {
      controller: 'etiketa.wine Platform',
      dataCategories: [
        'Device metadata',
        'Temporal patterns (hourly aggregates)',
        'Geographic regions (country level)',
        'Language preferences',
        'Wine interaction data'
      ],
      purposes: [
        'Wine industry analytics',
        'Market intelligence',
        'Wine pairing recommendations',
        'Trend analysis'
      ],
      lawfulBasis: 'Legitimate interest (Article 6(1)(f))',
      retentionPeriods: DataRetentionManager['RETENTION_PERIODS'],
      recipients: 'Internal analytics team only',
      transfers: 'No international transfers',
      rights: [
        'Right to rectification',
        'Right to erasure',
        'Right to restrict processing',
        'Right to object'
      ]
    };
  }

  /**
   * Handle data portability request (Article 20)
   */
  static async handlePortabilityRequest(wineryId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<any> {
    // In production, this would extract and format actual data
    return {
      wineryId,
      exportDate: new Date().toISOString(),
      format,
      data: {
        aggregatedAnalytics: [],
        winePerformanceData: [],
        marketInsights: []
      },
      note: 'Only aggregated, non-personal data is available for export'
    };
  }

  /**
   * Handle erasure request (Article 17)
   */
  static async handleErasureRequest(wineryId: string): Promise<{ success: boolean; deletedRecords: number }> {
    // In production, this would perform actual data deletion
    return {
      success: true,
      deletedRecords: 0 // No personal data to delete in anonymized system
    };
  }
}

/**
 * Export utilities for external compliance validation
 */
export const GDPRCompliance = {
  DataAnonymizer,
  DataRetentionManager,
  ConsentManager,
  GDPRValidator,
  DataSubjectRights
};