import { notFound, redirect } from 'next/navigation';
import ClientWinesPage from '@/app/dashboard/wines/ClientWinesPage';
import { getCookieSessionUser } from '@/server/auth/session';
import { listApiWines } from '@/server/services/api-wines';

export const dynamic = 'force-dynamic';

function normalizeWineVintage(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return value;
}

export default async function WinesPage() {
  const sessionUser = await getCookieSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  const initialData = await listApiWines(sessionUser.id, {
    page: 1,
    limit: 1000,
    search: '',
  });

  if (!initialData) {
    notFound();
  }

  return (
    <ClientWinesPage
      initialData={{
        ...initialData,
        wines: initialData.wines.map((wine) => ({
          ...wine,
          vintage: normalizeWineVintage(wine.vintage),
        })),
      } as Parameters<typeof ClientWinesPage>[0]['initialData']}
    />
  );
}
