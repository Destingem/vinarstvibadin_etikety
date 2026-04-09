"use client";

import {
  getPlanMeta,
  hasPremiumAccess,
  type MembershipStatusData,
} from "@/components/settings/types";

type BillingSummaryProps = {
  membershipStatus: MembershipStatusData | null;
  isLoading: boolean;
};

function getDaysUntil(dateString?: string) {
  if (!dateString) {
    return null;
  }

  const diff = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const PLAN_CATALOG = [
  {
    code: "STANDARD",
    label: "Standard",
    price: "690 Kč / rok",
    description: "Zakladni provoz digitalnich etiket pro mensi katalog a jednoduchy workflow.",
  },
  {
    code: "PLUS",
    label: "Plus",
    price: "1 490 Kč / rok",
    description: "Vice sarzi, vice prostoru pro provoz a prehlednejsi obnova.",
  },
  {
    code: "NEOMEZENĚ",
    label: "Neomezene",
    price: "6 990 Kč / rok",
    description: "Neomezeny katalog, API pristup a provozni analytika v jednom tarifu.",
  },
  {
    code: "ENTERPRISE",
    label: "Enterprise",
    price: "Na dotaz",
    description: "Individualni podminky, SLA a rozsireny onboarding.",
  },
];

export default function BillingSummary({
  membershipStatus,
  isLoading,
}: BillingSummaryProps) {
  const membership = membershipStatus?.membership;
  const planMeta = getPlanMeta(membership?.plan);
  const daysUntilExpiry = getDaysUntil(membership?.expiresAt);
  const isPremium = hasPremiumAccess(membership?.plan);

  const statusText = !membershipStatus?.hasMembership
    ? "Bez aktivniho tarifu"
    : !membership?.isActive || membership?.isExpired
      ? "Tarif vyzaduje obnovu"
      : daysUntilExpiry !== null && daysUntilExpiry <= 30
        ? `Obnova do ${daysUntilExpiry} dnu`
        : "Tarif je v poradku";

  return (
    <section className="rounded-[28px] border border-stone-200 bg-[rgba(255,251,247,0.92)] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d5348]">
            Pristup a obnova
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b1f1a]">
            Tarif a provozni stav
          </h2>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
          {isLoading ? "Nacitam..." : statusText}
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-stone-200 bg-white/80 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              Aktualni tarif
            </p>
            <div className="mt-2 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "Nacitam..." : planMeta.label}
            </div>
            <p className="mt-1 text-sm text-[#6b5a54]">{planMeta.price}</p>
          </div>
          {isPremium && (
            <span className="rounded-full border border-[#d9c4b6] bg-[#f7ece3] px-3 py-1 text-xs font-medium text-[#8d5348]">
              Premium
            </span>
          )}
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#6b5a54]">Platnost do</dt>
            <dd className="font-medium text-[#2b1f1a]">
              {membership?.expiresAt
                ? new Date(membership.expiresAt).toLocaleDateString("cs-CZ")
                : "Neni nastavena"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#6b5a54]">Zpusob fakturace</dt>
            <dd className="font-medium text-[#2b1f1a]">Rucni aktivace</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#6b5a54]">Dalsi krok</dt>
            <dd className="font-medium text-[#2b1f1a]">
              {membershipStatus?.hasMembership ? "Obnova nebo zmena tarifu podle domluvy" : "Aktivace pristupu podle domluvy"}
            </dd>
          </div>
        </dl>

        <p className="mt-5 rounded-2xl border border-[#eadfd8] bg-[#fbf7f3] p-4 text-sm leading-6 text-[#6b5a54]">
          Platby zatim neprobihaji samoobsluzne. Pro prodlouzeni, upgrade nebo zmenu fakturacnich
          udaju pisete na{" "}
          <a className="font-medium text-[#8d5348] underline decoration-[#d7b3a5] underline-offset-4" href="mailto:info@etiketa.wine">
            info@etiketa.wine
          </a>.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
          Prehled tarifu
        </h3>
        <div className="mt-3 space-y-3">
          {PLAN_CATALOG.map((plan) => {
            const isCurrent = plan.code === membership?.plan;

            return (
              <div
                key={plan.code}
                className={`rounded-2xl border p-4 transition-colors ${
                  isCurrent
                    ? "border-[#d7b3a5] bg-[#fff7f1]"
                    : "border-stone-200 bg-white/75"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#2b1f1a]">
                      {plan.label}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#6b5a54]">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#2b1f1a]">
                      {plan.price}
                    </div>
                    {isCurrent && (
                      <div className="mt-1 text-xs font-medium text-[#8d5348]">
                        Aktivni plan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
