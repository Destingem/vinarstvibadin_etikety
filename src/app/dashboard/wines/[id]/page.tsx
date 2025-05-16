import ClientWineDetail from './ClientWineDetail';

// In Next.js 15, params must be awaited
export default async function WineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object before accessing properties
  const resolvedParams = await params;
  return <ClientWineDetail wineId={resolvedParams.id} />;
}