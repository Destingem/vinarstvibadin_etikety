import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID, MEMBERSHIPS_COLLECTION_ID, Query } from '@/lib/appwrite-client';

// This endpoint resets the demo account every hour
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Hourly demo account reset triggered...');
    console.log(`📅 Date: ${new Date().toISOString()}`);
    
    // Get demo user ID from environment variable
    const demoUserId = process.env.DEMO_USER_ID;
    
    if (!demoUserId) {
      return NextResponse.json(
        { 
          error: 'Demo user ID not configured',
          message: 'DEMO_USER_ID environment variable is required'
        },
        { status: 400 }
      );
    }
    
    let deletedWines = 0;
    let resetMembership = false;
    
    try {
      // 1. Delete all wines belonging to the demo user
      console.log('🗑️ Deleting demo user wines...');
      const wines = await adminDatabases.listDocuments(
        DB_ID,
        WINES_COLLECTION_ID,
        [Query.equal('userId', demoUserId)]
      );
      
      for (const wine of wines.documents) {
        await adminDatabases.deleteDocument(
          DB_ID,
          WINES_COLLECTION_ID,
          wine.$id
        );
        deletedWines++;
      }
      
      console.log(`✅ Deleted ${deletedWines} wines`);
      
      // 2. Reset demo user's membership wine count
      console.log('🔄 Resetting membership wine count...');
      const memberships = await adminDatabases.listDocuments(
        DB_ID,
        MEMBERSHIPS_COLLECTION_ID,
        [Query.equal('appwriteUserId', demoUserId)]
      );
      
      for (const membership of memberships.documents) {
        await adminDatabases.updateDocument(
          DB_ID,
          MEMBERSHIPS_COLLECTION_ID,
          membership.$id,
          {
            currentWineCount: 0,
            resetYear: new Date().getFullYear()
          }
        );
        resetMembership = true;
      }
      
      console.log(`✅ Reset membership: ${resetMembership}`);
      
      const result = {
        success: true,
        message: 'Demo account reset successful',
        details: {
          deletedWines,
          resetMembership,
          resetTime: new Date().toISOString(),
          demoUserId
        }
      };
      
      console.log('✅ Demo account reset completed successfully');
      return NextResponse.json(result);
      
    } catch (error) {
      console.error('❌ Error during demo reset:', error);
      return NextResponse.json(
        { 
          error: 'Error resetting demo account',
          message: error instanceof Error ? error.message : 'Unknown error',
          demoUserId
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error processing demo reset request:', error);
    return NextResponse.json(
      { 
        error: 'Error processing demo reset request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}