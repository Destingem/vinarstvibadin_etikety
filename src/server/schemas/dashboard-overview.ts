import { z } from 'zod';
import { WineryProfileSchema } from '@/server/schemas/winery-profile';
import { WineryWineSchema } from '@/server/schemas/wine';

export const DashboardOverviewMetricsSchema = z.object({
  totalWines: z.number().int().nonnegative(),
});

export const DashboardOverviewSchema = z.object({
  profile: WineryProfileSchema,
  metrics: DashboardOverviewMetricsSchema,
  allWines: z.array(WineryWineSchema),
  recentWines: z.array(WineryWineSchema),
});

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
export type DashboardOverviewMetrics = z.infer<typeof DashboardOverviewMetricsSchema>;
