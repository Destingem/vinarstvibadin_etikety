import {
  DashboardOverviewSchema,
  type DashboardOverview,
} from '@/server/schemas/dashboard-overview';
import { ensureDemoCatalog } from '@/server/services/demo-catalog';
import { getWineryProfile } from '@/server/services/winery-profiles';
import { listWineryWines } from '@/server/services/wines';

export async function getDashboardOverview(
  ownerUserId: string
): Promise<DashboardOverview | null> {
  const profile = await getWineryProfile(ownerUserId);

  if (!profile) {
    return null;
  }

  await ensureDemoCatalog(profile);

  const wineResult = await listWineryWines(ownerUserId);

  return DashboardOverviewSchema.parse({
    profile,
    metrics: {
      totalWines: wineResult.total,
    },
    allWines: wineResult.wines,
    recentWines: wineResult.wines.slice(0, 5),
  });
}

function serializeDashboardWine(wine: DashboardOverview['allWines'][number]) {
  return {
    id: wine.id,
    $id: wine.id,
    ownerUserId: wine.ownerUserId,
    userId: wine.ownerUserId,
    name: wine.name,
    vintage: wine.vintage,
    batch: wine.batch,
    createdAt: wine.createdAt,
    updatedAt: wine.updatedAt,
    wineryName: wine.wineryName,
    winerySlug: wine.winerySlug,
  };
}

export function createDashboardOverviewResponse(overview: DashboardOverview) {
  return {
    winery: {
      id: overview.profile.ownerUserId,
      ownerUserId: overview.profile.ownerUserId,
      email: overview.profile.email,
      name: overview.profile.displayName,
      displayName: overview.profile.displayName,
      slug: overview.profile.slug,
      locale: overview.profile.locale,
      isAdmin: overview.profile.isAdmin,
      isDemo: overview.profile.isDemo,
      settings: overview.profile.settings,
      _count: {
        wines: overview.metrics.totalWines,
      },
    },
    allWines: overview.allWines.map(serializeDashboardWine),
    overview: {
      profile: overview.profile,
      metrics: overview.metrics,
      recentWines: overview.recentWines.map(serializeDashboardWine),
    },
  };
}
