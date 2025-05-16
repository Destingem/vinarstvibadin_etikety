import ClientEditPage from './ClientEditPage';

// In Next.js 15, params must be awaited
export default async function EditWinePage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object before accessing properties
  const resolvedParams = await params;
  return <ClientEditPage wineId={resolvedParams.id} />;
}