import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-middleware';
import { getAnalyticsSummary } from '@/lib/analytics-service';

// GET /api/v1/analytics/summary - Get analytics summary for the authenticated user
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      // Get query parameters
      const { searchParams } = new URL(req.url);
      const range = searchParams.get('range') || '30days';
      
      // Get analytics summary
      const analytics = await getAnalyticsSummary(ctx.userId, range);
      
      // Return analytics data
      return NextResponse.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při načítání analytických dat' },
        { status: 500 }
      );
    }
  });
}