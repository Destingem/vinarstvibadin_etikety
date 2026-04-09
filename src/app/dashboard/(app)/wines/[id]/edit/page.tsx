import { notFound, redirect } from 'next/navigation';
import ClientEditPage from '@/app/dashboard/wines/client-edit-page';
import { getCookieSessionUser } from '@/server/auth/session';
import { getOwnedApiWine } from '@/server/services/api-wines';
import type { WorkspaceWine } from '@/app/dashboard/wines/workspace-helpers';

export const dynamic = 'force-dynamic';

export default async function EditWinePage({ params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getCookieSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const result = await getOwnedApiWine(sessionUser.id, resolvedParams.id);

  if (!result || result.status !== 'ok') {
    notFound();
  }

  return <ClientEditPage wineId={resolvedParams.id} initialWine={result.wine as WorkspaceWine} />;
}
