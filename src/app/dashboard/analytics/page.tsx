import { Suspense } from 'react';
import ClientAnalyticsDashboard from './ClientAnalyticsDashboard';

export const metadata = {
  title: 'Analytika QR kódů | Etiketa.wine',
  description: 'Statistiky a přehledy o načítání QR kódů vašich vín'
};

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytika QR kódů</h1>
      
      <div className="mb-4 text-sm">
        <p className="text-black">
          Na této stránce najdete anonymní statistiky o načítání QR kódů vašich vín.
          Data jsou aktualizována denně a poskytují přehled o tom, jak zákazníci interagují s vašimi produkty.
        </p>
      </div>
      
      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <ClientAnalyticsDashboard />
      </Suspense>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Metric cards skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Charts skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}