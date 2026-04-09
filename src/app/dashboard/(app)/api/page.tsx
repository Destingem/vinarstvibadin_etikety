import ClientApiDashboard from '@/app/dashboard/api/ClientApiDashboard';
import PremiumFeatureWrapper from '@/app/dashboard/analytics/PremiumFeatureWrapper';

export const metadata = {
  title: 'API přístup | Etiketa.wine',
  description: 'Session-first dashboard pro spravu API klicu, scope profilu a dokumentace externich integraci.'
};

export default function ApiDashboardPage() {
  return (
    <PremiumFeatureWrapper featureName="API integrace">
      <ClientApiDashboard />
    </PremiumFeatureWrapper>
  );
}
