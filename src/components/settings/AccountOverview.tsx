"use client";

import type { AuthUser } from "@/lib/auth-context";
import {
  getPlanMeta,
  getRemainingWineCapacity,
  type ApiUsageSummary,
  type MembershipStatusData,
} from "@/components/settings/types";

type AccountOverviewProps = {
  user: AuthUser | null;
  membershipStatus: MembershipStatusData | null;
  usageSummary: ApiUsageSummary | null;
  isLoading: boolean;
};

function getStatusLabel(status: MembershipStatusData | null) {
  if (!status?.hasMembership || !status.membership) {
    return {
      label: "Bez tarifu",
      className: "border-stone-200 bg-stone-100 text-stone-700",
    };
  }

  if (!status.membership.isActive || status.membership.isExpired) {
    return {
      label: "Neaktivni",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  const expiresAt = new Date(status.membership.expiresAt).getTime();
  const soon = expiresAt < Date.now() + 1000 * 60 * 60 * 24 * 30;

  return soon
    ? {
        label: "Brzy konci",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      }
    : {
        label: "Aktivni",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
}

function getPublicLabel(slug?: string) {
  return slug ? `etiketa.wine/${slug}` : "Verejna adresa zatim neni nastavena";
}

export default function AccountOverview({
  user,
  membershipStatus,
  usageSummary,
  isLoading,
}: AccountOverviewProps) {
  const planMeta = getPlanMeta(membershipStatus?.membership?.plan);
  const statusBadge = getStatusLabel(membershipStatus);

  return (
    <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,249,243,0.98),rgba(248,239,232,0.92))] shadow-[0_28px_80px_rgba(58,34,27,0.12)]">
      <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d5348]">
              Prehled uctu
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2b1f1a] sm:text-4xl">
            {user?.name || "Ucet vinarstvi"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b5a54] sm:text-base">
            Spravujte identitu uctu, verejnou adresu a provozni stav clenstvi z jedne stranky.
            Stav tarifu, kapacita katalogu a API opravneni jsou tu soustredene bez skakani do dalsich screenu.
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
                Kontaktni email
              </dt>
              <dd className="mt-2 text-sm font-medium text-[#2b1f1a]">
                {user?.email || "Neuvedeno"}
              </dd>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
                Verejna adresa etikety
              </dt>
              <dd className="mt-2 text-sm font-medium text-[#2b1f1a]">
                {getPublicLabel(user?.slug)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              Tarif
            </p>
            <div className="mt-3 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "Nacitam..." : planMeta.label}
            </div>
            <p className="mt-1 text-sm text-[#6b5a54]">
              {planMeta.price}
            </p>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              Zbyvajici kapacita
            </p>
            <div className="mt-3 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "..." : getRemainingWineCapacity(membershipStatus)}
            </div>
            <p className="mt-1 text-sm text-[#6b5a54]">
              {membershipStatus?.limit === -1 ? "Neomezeny katalog vin." : "Kolik dalsich vin lze jeste pridat."}
            </p>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              API provoz za 30 dni
            </p>
            <div className="mt-3 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "..." : usageSummary?.summary.totalRequests?.toLocaleString("cs-CZ") || "0"}
            </div>
            <p className="mt-1 text-sm text-[#6b5a54]">
              {usageSummary ? `${usageSummary.summary.successRate} % uspesnost` : "Zatim bez zaznamenaneho provozu."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
