import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Ops | etiketa.wine',
  description: 'Interni administracni vrstva pro spravu clenstvi, uzivatelu a provoznich zasahu.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardAdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-dashboard-group="admin">{children}</div>;
}
