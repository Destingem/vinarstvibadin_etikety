import ClientAnalyticsDashboard from '@/app/dashboard/analytics/ClientAnalyticsDashboard';
import PremiumFeatureWrapper from '@/app/dashboard/analytics/PremiumFeatureWrapper';

export const metadata = {
  title: 'Analytics | Etiketa.wine',
  description: 'Provozní analytika veřejných etiket a přehledy skenů vín.'
};

export default function AnalyticsPage() {
  return (
    <PremiumFeatureWrapper featureName="Pokročilá analytika">
      <ClientAnalyticsDashboard />
    </PremiumFeatureWrapper>
  );
}
