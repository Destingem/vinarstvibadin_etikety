import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth/session';
import { getAnalyticsSummary } from '@/lib/analytics-api';

/**
 * API endpoint to get analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const range = request.nextUrl.searchParams.get('range') || '30days';
    const user = await getRequestSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Neautorizováno', message: 'Pro zobrazení analytiky se přihlaste' },
        { status: 401 }
      );
    }
    const analytics = await getAnalyticsSummary(user.id, range);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in analytics dashboard endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics dashboard' },
      { status: 500 }
    );
  }
}
