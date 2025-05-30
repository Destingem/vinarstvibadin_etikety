import { NextResponse } from 'next/server';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';

export async function GET() {
  try {
    console.log('API route: Testing Appwrite connection');
    
    // Try to count wines
    const winesResponse = await adminDatabases.listDocuments(DB_ID, WINES_COLLECTION_ID);
    const winesCount = winesResponse.total;
    
    // Get a sample wine if any exist
    const wine = winesResponse.documents.length > 0 ? winesResponse.documents[0] : null;
    
    const wineData = wine ? {
      id: wine.$id,
      name: wine.name,
      userId: wine.userId
    } : null;
    
    return NextResponse.json({ 
      success: true, 
      message: `Appwrite connection successful. Found ${winesCount} wines.`,
      wine: wineData
    });
  } catch (error) {
    console.error('API route: Error connecting to Appwrite:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error connecting to Appwrite',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}