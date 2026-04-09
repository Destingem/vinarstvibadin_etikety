import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { AuthProvider } from '@/lib/auth-context';
import { getCookieSessionUser } from '@/server/auth/session';

export const metadata: Metadata = {
  title: 'Dashboard | etiketa.wine',
  description: 'Pracovní prostor pro správu katalogu vín, QR výstupů a provozu etiketa.wine.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCookieSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={user} initialToken="session">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
