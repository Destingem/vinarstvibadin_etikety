import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aplikace | etiketa.wine',
  description: 'Operativni aplikacni cast pro katalog, QR workflow, analytiku a nastaveni.',
};

export default function DashboardAppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-dashboard-group="app">{children}</div>;
}
