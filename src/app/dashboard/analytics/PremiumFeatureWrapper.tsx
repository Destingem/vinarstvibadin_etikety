'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Surface } from '@/components/ui/surface';

interface PremiumFeatureWrapperProps {
  children: ReactNode;
  featureName: string;
}

export default function PremiumFeatureWrapper({
  children,
  featureName,
}: PremiumFeatureWrapperProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [membershipPlan, setMembershipPlan] = useState('');
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) {
        return;
      }

      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        const response = await fetch('/api/membership/status', {
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!response.ok) {
          setHasAccess(false);
          return;
        }

        const data = await response.json();

        if (data.hasMembership && data.membership) {
          const plan = data.membership.plan;
          setMembershipPlan(plan);
          setHasAccess(plan === 'NEOMEZENĚ' || plan === 'ENTERPRISE');
          return;
        }

        setHasAccess(false);
      } catch (error) {
        console.error('Error checking membership:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [isLoading, user]);

  if (hasAccess === null) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Přístup"
            title="Ověřování členství"
            description="Kontrolujeme aktuální tarif a oprávnění pro tuto část dashboardu."
          />
          <Surface tone="muted" className="flex min-h-[220px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-stone-300 border-t-[#6f1d2b]" />
              <p className="text-sm font-medium text-stone-600">Ověřování přístupu…</p>
            </div>
          </Surface>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Přístup"
            title={`${featureName} vyžaduje vyšší tarif`}
            description="Tato část je dostupná od tarifu Neomezeně. Přístup řídíme podle aktivního členství účtu, ne podle samotné navigace."
            meta={
              membershipPlan ? <Badge>Aktuální tarif: {membershipPlan}</Badge> : <Badge>Bez prémiového přístupu</Badge>
            }
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Surface>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-900">Co se odemkne</h2>
                <ul className="space-y-3 text-sm leading-6 text-stone-600">
                  <li>Rozsirene provozni nástroje pro monitoring, API přehledy a správu zákaznickych ploch.</li>
                  <li>Vyssi limity a prémiové funkce podle konkretni sekce dashboardu.</li>
                  <li>Stabilnejsi workflow pro integrace, reporting a týmovou práci.</li>
                </ul>
              </div>
            </Surface>

            <Surface tone="muted">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-900">Další krok</h2>
                <p className="text-sm leading-6 text-stone-600">
                  Pokud tuto sekci potřebujete pro ostrý provoz, požádejte o aktivaci nebo napište
                  na <a className="font-medium text-[#6f1d2b]" href="mailto:info@etiketa.wine"> info@etiketa.wine</a>.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="mailto:info@etiketa.wine">Pozadat o aktivaci</PrimaryButton>
                  <SecondaryButton onClick={() => router.push('/dashboard')}>
                    Zpět na dashboard
                  </SecondaryButton>
                </div>
              </div>
            </Surface>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
