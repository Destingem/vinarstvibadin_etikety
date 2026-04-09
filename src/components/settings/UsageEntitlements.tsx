"use client";

import {
  getUsageLabel,
  hasPremiumAccess,
  type ApiUsageSummary,
  type MembershipStatusData,
} from "@/components/settings/types";

type UsageEntitlementsProps = {
  membershipStatus: MembershipStatusData | null;
  usageSummary: ApiUsageSummary | null;
  isLoading: boolean;
};

function StatusPill({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-stone-200 bg-stone-100 text-stone-600"
      }`}
    >
      {label}
    </span>
  );
}

export default function UsageEntitlements({
  membershipStatus,
  usageSummary,
  isLoading,
}: UsageEntitlementsProps) {
  const membership = membershipStatus?.membership;
  const hasPremium = hasPremiumAccess(membership?.plan);
  const endpoints = usageSummary?.endpoints?.slice(0, 3) ?? [];

  return (
    <section className="rounded-[28px] border border-stone-200 bg-[rgba(255,251,247,0.92)] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d5348]">
          Usage a opravneni
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b1f1a]">
          Kapacita a opravneni
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#6b5a54]">
          Rychly prehled toho, co je na uctu aktivni a jaky provoz byl za poslednich 30 dni.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white/75 p-4">
          <div>
            <div className="text-sm font-semibold text-[#2b1f1a]">Kapacita katalogu</div>
            <p className="mt-1 text-sm leading-6 text-[#6b5a54]">
              {membershipStatus?.message || "Stav kapacity se ukaze po nacteni aktualnich dat."}
            </p>
          </div>
          <StatusPill
            enabled={Boolean(membershipStatus?.canCreateWines)}
            label={isLoading ? "..." : getUsageLabel(membershipStatus)}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white/75 p-4">
          <div>
            <div className="text-sm font-semibold text-[#2b1f1a]">Integracni pristup</div>
            <p className="mt-1 text-sm leading-6 text-[#6b5a54]">
              Externi API a sprava klicu jsou urcene pro tarify Neomezene a Enterprise.
            </p>
          </div>
          <StatusPill
            enabled={hasPremium}
            label={hasPremium ? "Aktivni" : "Od tarifu Neomezene"}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white/75 p-4">
          <div>
            <div className="text-sm font-semibold text-[#2b1f1a]">Provozni analytika</div>
            <p className="mt-1 text-sm leading-6 text-[#6b5a54]">
              Rozsirene dashboardy a API usage prehledy se odemykaji stejne jako API pristup.
            </p>
          </div>
          <StatusPill
            enabled={hasPremium}
            label={hasPremium ? "Aktivni" : "Premium funkce"}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white/75 p-4">
          <div>
            <div className="text-sm font-semibold text-[#2b1f1a]">Obnova a zmena tarifu</div>
            <p className="mt-1 text-sm leading-6 text-[#6b5a54]">
              Zmeny tarifu a obnovu clenstvi zatim resime rucne; Enterprise dostava individualni rezim.
            </p>
          </div>
          <StatusPill
            enabled={Boolean(membershipStatus?.hasMembership)}
            label={membership?.plan === "ENTERPRISE" ? "Individualni rezim" : "Rucne spravovane"}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-stone-200 bg-white/80 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2b1f1a]">
              API provoz za 30 dni
            </h3>
            <p className="mt-1 text-sm text-[#6b5a54]">
              Operativni prehled bez odchodu na samostatny analytics screen.
            </p>
          </div>
          <StatusPill
            enabled={hasPremium}
            label={hasPremium ? "Sledovano" : "Po aktivaci pristupu"}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-[#fffaf6] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              Pozadavky
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "..." : usageSummary?.summary.totalRequests?.toLocaleString("cs-CZ") || "0"}
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-[#fffaf6] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              Uspesnost
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "..." : usageSummary?.summary.successRate || "0"} %
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-[#fffaf6] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
              Odezva
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#2b1f1a]">
              {isLoading ? "..." : usageSummary?.summary.averageResponseTime || 0} ms
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8d5348]">
            Nejvice volane endpointy
          </h4>
          <div className="mt-3 space-y-3">
            {endpoints.length > 0 ? (
              endpoints.map((endpoint) => (
                <div
                  key={endpoint.endpoint}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-[#fffdfb] px-4 py-3"
                >
                  <code className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#2b1f1a]">
                    {endpoint.endpoint}
                  </code>
                  <div className="text-right text-xs text-[#6b5a54]">
                    <div>{endpoint.count.toLocaleString("cs-CZ")} volani</div>
                    <div>{Math.round(endpoint.averageResponseTime)} ms avg</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fffdfb] p-4 text-sm leading-6 text-[#6b5a54]">
                {hasPremium
                  ? "Zatim bez zaznamenanych API volani. Jakmile integrace zacne posilat pozadavky, prehled se ukaze zde."
                  : "API usage se zobrazi po aktivaci integracniho pristupu a prvnich pozadavcich."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
