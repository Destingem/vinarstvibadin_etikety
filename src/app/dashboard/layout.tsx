"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { useRequireAuth } from '@/lib/auth-context';

export default function Layout({ children }: { children: React.ReactNode }) {
  // This will automatically redirect to /login if not authenticated
  const { isLoading } = useRequireAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}