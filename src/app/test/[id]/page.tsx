export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, params should be awaited
  const { id } = await params;
  
  return (
    <div>
      <h1>Test Page</h1>
      <p>ID: {id}</p>
    </div>
  );
}