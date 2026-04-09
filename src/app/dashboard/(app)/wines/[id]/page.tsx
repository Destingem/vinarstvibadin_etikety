import { notFound, redirect } from 'next/navigation';
import ClientWineDetail from '@/app/dashboard/wines/client-wine-detail';
import { getCookieSessionUser } from '@/server/auth/session';
import { getOwnedApiWine } from '@/server/services/api-wines';
import type { WorkspaceWine } from '@/app/dashboard/wines/workspace-helpers';

export const dynamic = 'force-dynamic';

function normalizeWineVintage(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return value;
}

export default async function WineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getCookieSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const result = await getOwnedApiWine(sessionUser.id, resolvedParams.id);

  if (!result || result.status !== 'ok') {
    notFound();
  }

  const wine = result.wine as WorkspaceWine;

  if (!wine) {
    notFound();
  }

  const initialWine = {
    ...wine,
    vintage: normalizeWineVintage(wine.vintage),
  } as WorkspaceWine;

  return <ClientWineDetail wineId={resolvedParams.id} initialWine={initialWine} />;
}
