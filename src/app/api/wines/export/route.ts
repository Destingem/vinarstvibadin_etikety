import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID, Query } from '@/lib/appwrite-client';
import { obfuscateData } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      const userId = decoded.userId;
      
      // Get all wines for this winery from Appwrite
      const response = await adminDatabases.listDocuments(
        DB_ID,
        WINES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      // Convert documents to appropriate format
      const wines = response.documents;
      
      // Create export data structure
      const exportData = {
        wines: wines,
        exportDate: new Date().toISOString(),
        version: '1.0',
        metadata: {
          totalWines: wines.length,
          userId: userId
        }
      };
      
      // Obfuscate the data
      const obfuscatedData = obfuscateData(exportData);
      
      // Return the obfuscated data
      return NextResponse.json({
        data: obfuscatedData,
        exportDate: new Date().toISOString(),
        totalWines: wines.length,
        message: 'Export úspěšně vytvořen'
      });
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Neplatný token nebo vypršela platnost přihlášení' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { message: 'Export dat selhal' },
      { status: 500 }
    );
  }
}