export default async function WineTestPage({ params }: { params: Promise<{ winery: string; wineId: string }> }) {
  // In Next.js 15, params should be awaited
  const { winery, wineId } = await params;
  
  return (
    <div>
      <h1>Wine Test Page</h1>
      <p>Winery: {winery}</p>
      <p>Wine ID: {wineId}</p>
    </div>
  );
}