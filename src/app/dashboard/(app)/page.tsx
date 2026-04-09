import ClientDashboard, { type DashboardHomeData } from '@/app/dashboard/ClientDashboard';
import { getCookieSessionUser } from '@/server/auth/session';
import {
  createDashboardOverviewResponse,
  getDashboardOverview,
} from '@/server/services/dashboard-overview';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let initialData: DashboardHomeData | null = null;

  try {
    const sessionUser = await getCookieSessionUser();

    if (sessionUser) {
      const overview = await getDashboardOverview(sessionUser.id);

      if (overview) {
        initialData = createDashboardOverviewResponse(overview) as DashboardHomeData;
      }
    }
  } catch (error) {
    console.error('Error preloading dashboard overview:', error);
  }

  return <ClientDashboard initialData={initialData} />;
}
