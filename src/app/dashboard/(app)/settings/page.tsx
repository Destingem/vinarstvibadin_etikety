"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/auth-context";
import ProfileForm from "@/components/ProfileForm";
import PasswordChangeForm from "@/components/PasswordChangeForm";
import AccountOverview from "@/components/settings/AccountOverview";
import SettingsSection from "@/components/settings/SettingsSection";
import UsageEntitlements from "@/components/settings/UsageEntitlements";
import BillingSummary from "@/components/billing/BillingSummary";
import type {
  ApiUsageSummary,
  MembershipStatusData,
} from "@/components/settings/types";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatusData | null>(null);
  const [usageSummary, setUsageSummary] = useState<ApiUsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSettingsData() {
      setIsLoading(true);
      setLoadError(null);

      const [membershipResult, usageResult] = await Promise.allSettled([
        fetch("/api/membership/status", {
          credentials: "same-origin",
          cache: "no-store",
        }),
        fetch("/api/analytics/api-usage?range=30days", {
          credentials: "same-origin",
          cache: "no-store",
        }),
      ]);

      let nextMembership: MembershipStatusData | null = null;
      let nextUsage: ApiUsageSummary | null = null;
      let nextError: string | null = null;

      if (
        membershipResult.status === "fulfilled" &&
        membershipResult.value.ok
      ) {
        nextMembership =
          (await membershipResult.value.json()) as MembershipStatusData;
      } else {
        nextError = "Nepodarilo se nacist stav tarifu a opravneni.";
      }

      if (usageResult.status === "fulfilled" && usageResult.value.ok) {
        nextUsage = (await usageResult.value.json()) as ApiUsageSummary;
      }

      if (cancelled) {
        return;
      }

      setMembershipStatus(nextMembership);
      setUsageSummary(nextUsage);
      setLoadError(nextError);
      setIsLoading(false);
    }

    loadSettingsData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <header className="pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d5348]">
            Ucet a pristup
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-[#2b1f1a] sm:text-4xl">
                Nastaveni uctu
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6b5a54] sm:text-base">
                Profil, zabezpeceni a pristup jsou sloucene do jedne provozni
                plochy. Session se zde ověřuje automaticky a stav tarifu, API
                opravneni i obnova jsou videt na jednom miste.
              </p>
            </div>
            <div className="rounded-full border border-[#e7d9d1] bg-[#fbf6f1] px-4 py-2 text-sm text-[#7b5a52]">
              Aktivace a obnova tarifu jsou zatim spravovane ručne
            </div>
          </div>
        </header>

        {loadError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        <AccountOverview
          user={user}
          membershipStatus={membershipStatus}
          usageSummary={usageSummary}
          isLoading={isLoading}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <SettingsSection
              eyebrow="Profil"
              title="Identita uctu"
              description="Upravte jmeno vinarstvi, verejnou adresu a kontaktni email. Vsechny zmeny se promitnou do session i do verejneho profilu."
            >
              <ProfileForm />
            </SettingsSection>

            <SettingsSection
              eyebrow="Zabezpeceni"
              title="Prihlaseni a heslo"
              description="Spravujte pristupove udaje k uctu. Zmena hesla probiha okamzite a dalsi session uz pouzije nove heslo."
            >
              <PasswordChangeForm />
            </SettingsSection>
          </div>

          <div className="space-y-6">
            <BillingSummary
              membershipStatus={membershipStatus}
              isLoading={isLoading}
            />
            <UsageEntitlements
              membershipStatus={membershipStatus}
              usageSummary={usageSummary}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
