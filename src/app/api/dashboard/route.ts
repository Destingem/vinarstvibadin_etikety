import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth/session';
import {
  createDashboardOverviewResponse,
  getDashboardOverview,
} from '@/server/services/dashboard-overview';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const overview = await getDashboardOverview(sessionUser.id);

    if (!overview) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(createDashboardOverviewResponse(overview));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
