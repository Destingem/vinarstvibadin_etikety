import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import * as AnalyticsService from '@/lib/analytics-service';
import { env } from '@/lib/env';

/**
 * Determines device type based on user agent
 */
function getDeviceType(userAgent: string): 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN' {
  try {
    // First try UAParser - more accurate but can fail
    try {
      const parser = new UAParser(userAgent);
      const device = parser.getDevice();
      const deviceType = device.type;

      if (!deviceType) {
        // If UAParser couldn't determine the device type, use our fallback
        return fallbackDeviceDetection(userAgent);
      }
      
      if (deviceType === 'mobile') return 'MOBILE';
      if (deviceType === 'tablet') return 'TABLET';
      return 'DESKTOP';
    } catch (parserError) {
      console.error('UAParser error:', parserError);
      return fallbackDeviceDetection(userAgent);
    }
  } catch (error) {
    console.error('Error detecting device type:', error);
    return 'UNKNOWN';
  }
}

/**
 * Simple fallback device detection if UAParser fails
 */
function fallbackDeviceDetection(userAgent: string): 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN' {
  // Convert to lowercase for easier matching
  const ua = userAgent.toLowerCase();
  
  // Simple mobile detection
  if (
    ua.includes('iphone') || 
    ua.includes('android') && !ua.includes('tablet') && !ua.includes('sm-t') ||
    ua.includes('mobile') || 
    ua.includes('blackberry') || 
    ua.includes('windows phone')
  ) {
    return 'MOBILE';
  }
  
  // Simple tablet detection
  if (
    ua.includes('ipad') || 
    ua.includes('android') && (ua.includes('tablet') || ua.includes('sm-t')) ||
    ua.includes('kindle') || 
    ua.includes('silk')
  ) {
    return 'TABLET';
  }
  
  // If it's not mobile or tablet, assume desktop
  if (
    ua.includes('windows') || 
    ua.includes('macintosh') || 
    ua.includes('linux') && !ua.includes('android')
  ) {
    return 'DESKTOP';
  }
  
  // Unknown if we can't determine
  return 'UNKNOWN';
}

/**
 * Gets country code from IP address for GDPR-compliant analytics
 * Only returns country-level information, no precise location
 */
async function getCountryFromIp(ip: string): Promise<string> {
  // Skip geolocation for localhost or internal IPs
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || 
      ip.startsWith('192.168.') || ip.startsWith('10.') || 
      ip.startsWith('172.16.') || ip.startsWith('::ffff:')) {
    return 'LOCAL';
  }
  
  try {
    const apiToken = env.IP_INFO_KEY;
    const apiUrl = apiToken 
      ? `https://ipinfo.io/${ip}/country?token=${apiToken}`
      : `https://ipinfo.io/${ip}/country`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return '';
    }
    
    const countryCode = await response.text();
    return countryCode.trim().toUpperCase();
  } catch (error) {
    console.error('Error getting country from IP:', error);
    return '';
  }
}


/**
 * API endpoint to record a QR code scan event
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request data
    const data = await request.json();
    
    // Extract required fields
    const { wineId, wineName, wineryId, wineryName, winerySlug, wineBatch, wineVintage } = data;
    
    // Validate required fields
    if (!wineId || !wineryId) {
      return NextResponse.json(
        { error: 'Missing required fields: wineId and wineryId are required' },
        { status: 400 }
      );
    }
    
    // Extract client IP address for country lookup only
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Get user agent for device detection only (not stored)
    const userAgent = request.headers.get('user-agent') || '';
    
    // Safely parse user agent information (for device detection only)
    let osInfo = 'Unknown';
    let deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN' = 'UNKNOWN';
    
    try {
      const parser = new UAParser(userAgent);
      const os = parser.getOS();
      
      osInfo = os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown';
      deviceType = getDeviceType(userAgent);
    } catch (error) {
      console.error('Error parsing user agent with UAParser:', error);
      // Use our fallback detection if UAParser fails
      deviceType = fallbackDeviceDetection(userAgent);
    }
    
    // Get browser language
    const acceptLanguage = request.headers.get('accept-language') || '';
    const browserLanguage = acceptLanguage.split(',')[0];
    
    // Create GDPR-compliant scan event record with anonymized data
    const now = new Date();
    const scanEvent = {
      date: now.toISOString().split('T')[0], // YYYY-MM-DD format
      hour: now.getHours(), // 0-23
      deviceType: deviceType,
      operatingSystem: osInfo,
      browserLanguage: browserLanguage,
      countryCode: '', // Will be filled by country lookup
      languageUsed: data.languageUsed || browserLanguage.substring(0, 2),
      wineId: wineId,
      wineName: wineName || 'Unknown Wine',
      wineBatch: wineBatch || '',
      wineVintage: wineVintage ? String(wineVintage) : '',
      wineryId: wineryId,
      wineryName: wineryName || 'Unknown Winery',
      winerySlug: winerySlug || '',
    };
    
    // Get country code only (GDPR compliant)
    try {
      const countryCode = await getCountryFromIp(ip);
      scanEvent.countryCode = countryCode;
    } catch (geoError) {
      console.error('Error getting country code:', geoError);
      // Continue without country data
    }
    
    // Record the scan event using the analytics service
    const result = await AnalyticsService.recordScanEvent(scanEvent);
    
    // Return success response
    return NextResponse.json(result, { status: result.success ? 201 : 500 });
  } catch (error) {
    console.error('Error recording scan event:', error);
    
    // Return error response but with 200 status to avoid users seeing errors
    return NextResponse.json(
      { success: false, error: 'Could not record scan event' },
      { status: 200 }
    );
  }
}

/**
 * Provide a minimal success response for GET requests (useful for testing)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Analytics endpoint is working. Use POST to record scan events.' },
    { status: 200 }
  );
}