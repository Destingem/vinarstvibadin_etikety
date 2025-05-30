import ClientApiDashboard from './ClientApiDashboard';
import PremiumFeatureWrapper from '../analytics/PremiumFeatureWrapper';

export const metadata = {
  title: 'API přístup | Etiketa.wine',
  description: 'Správa API klíčů a dokumentace pro přístup k systému Etiketa.wine'
};

export default function ApiDashboardPage() {
  return (
    <PremiumFeatureWrapper featureName="API integrace">
      <ClientApiDashboard />
    </PremiumFeatureWrapper>
  );
}