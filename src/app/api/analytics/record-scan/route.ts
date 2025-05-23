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
 * Masks IP address for privacy (keeps only first two octets for IPv4)
 */
function maskIpAddress(ip: string): string {
  if (!ip) return '';
  
  // Handle IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }
  
  // Handle IPv6 - mask more aggressively
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 2) {
      return `${parts[0]}:${parts[1]}:****`;
    }
  }
  
  return ip;
}

/**
 * Gets geolocation data from IP address using ipinfo.io
 * Uses API key stored in environment variable IP_INFO_KEY
 */
async function getGeolocationFromIp(ip: string): Promise<{
  countryCode: string;
  regionCode: string;
  city: string;
}> {
  // Default values if lookup fails
  const defaultGeo = {
    countryCode: '',
    regionCode: '',
    city: ''
  };
  
  // Skip geolocation for localhost or internal IPs
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || 
      ip.startsWith('192.168.') || ip.startsWith('10.') || 
      ip.startsWith('172.16.') || ip.startsWith('::ffff:')) {
    console.log(`Skipping geolocation for local/internal IP: ${ip}`);
    return {
      countryCode: 'LOCAL',
      regionCode: 'DEV',
      city: 'Development'
    };
  }
  
  try {
    // Get API token from environment utility
    const apiToken = env.IP_INFO_KEY;
    
    if (!apiToken) {
      console.warn('IP_INFO_KEY environment variable not set. Geolocation might be limited.');
    }
    
    // Construct the API URL with token if available
    const apiUrl = apiToken 
      ? `https://ipinfo.io/${ip}/json?token=${apiToken}`
      : `https://ipinfo.io/${ip}/json`;
    
    console.log(`Fetching geolocation data for IP: ${ip}`);
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geolocation lookup failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Geolocation data received:', JSON.stringify(data, null, 2));
    
    return {
      countryCode: data.country || '',
      regionCode: data.region || '',
      city: data.city || ''
    };
  } catch (error) {
    console.error('Error getting geolocation from IP:', error);
    return defaultGeo;
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
    
    // Extract client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    const maskedIp = maskIpAddress(ip);
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';
    
    // Safely parse user agent information
    let browserName = 'Unknown';
    let osInfo = 'Unknown';
    let deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN' = 'UNKNOWN';
    
    try {
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser();
      const os = parser.getOS();
      
      browserName = browser.name || 'Unknown';
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
    
    // Get referrer (if available)
    const referrer = request.headers.get('referer') || '';
    
    // Create base scan event record
    const scanEvent = {
      timestamp: new Date().toISOString(),
      ipAddress: maskedIp,
      userAgent: userAgent,
      deviceType: deviceType,
      operatingSystem: osInfo,
      browserLanguage: browserLanguage,
      countryCode: '', // Will be filled by geolocation
      regionCode: '', // Will be filled by geolocation
      city: '', // Will be filled by geolocation
      languageUsed: data.languageUsed || browserLanguage.substring(0, 2),
      referrer: referrer,
      wineId: wineId,
      wineName: wineName || 'Unknown Wine',
      wineBatch: wineBatch || '',
      wineVintage: wineVintage ? String(wineVintage) : '', // Convert to string for Appwrite storage
      wineryId: wineryId,
      wineryName: wineryName || 'Unknown Winery',
      winerySlug: winerySlug || '',
    };
    
    // Try to get geolocation data
    try {
      const geoData = await getGeolocationFromIp(ip);
      
      scanEvent.countryCode = geoData.countryCode;
      scanEvent.regionCode = geoData.regionCode;
      scanEvent.city = geoData.city;
    } catch (geoError) {
      console.error('Error getting geolocation:', geoError);
      // Continue without geolocation data
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