import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // With localStorage, the server doesn't need to do anything for logout
  // The client will clear localStorage
  
  // Just return a success response
  return NextResponse.json({ 
    success: true,
    message: 'Logged out successfully'
  });
}