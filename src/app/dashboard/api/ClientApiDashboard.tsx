'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ClipboardIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { useRequireAuth } from '@/lib/auth-context';

type ApiScopeValue =
  | 'wines:read'
  | 'wines:write'
  | 'wines:delete'
  | 'qrcodes:generate'
  | 'analytics:read';

type ApiKey = {
  id: string;
  name: string;
  key?: string;
  scopes?: ApiScopeValue[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
};

type UsageSummary = {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRequests: number;
};

type EndpointUsage = {
  endpoint: string;
  count: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
};

type UsageStats = {
  summary: UsageSummary;
  endpoints?: EndpointUsage[];
};

type ScopeOption = {
  value: ApiScopeValue;
  label: string;
  description: string;
};

const DEFAULT_SCOPE_OPTIONS: ScopeOption[] = [
  {
    value: 'wines:read',
    label: 'wines:read',
    description: 'Cteni katalogu, detailu a navazujicich dat o vine.',
  },
  {
    value: 'wines:write',
    label: 'wines:write',
    description: 'Zakladani a upravy zaznamu vin.',
  },
  {
    value: 'wines:delete',
    label: 'wines:delete',
    description: 'Mazani zaznamu. Pouzivejte jen pro admin nebo synchronizacni job.',
  },
  {
    value: 'qrcodes:generate',
    label: 'qrcodes:generate',
    description: 'Generovani QR vystupu pro existujici vina.',
  },
  {
    value: 'analytics:read',
    label: 'analytics:read',
    description: 'Cteni souhrnnych nebo wine-level analytics dat.',
  },
];

const DEFAULT_SCOPES = DEFAULT_SCOPE_OPTIONS.map((scope) => scope.value);

const endpointCards = [
  {
    method: 'GET',
    path: '/api/v1/wines',
    scope: 'wines:read',
    description: 'Vraci seznam vin s podporou page a limit parametru.',
    example:
      'curl -X GET "https://etiketa.wine/api/v1/wines?page=1&limit=20" \\\n  -H "Authorization: Bearer etw_xxx"',
  },
  {
    method: 'POST',
    path: '/api/v1/wines',
    scope: 'wines:write',
    description: 'Zaklada novy zaznam vina v katalogu.',
    example:
      'curl -X POST "https://etiketa.wine/api/v1/wines" \\\n  -H "Authorization: Bearer etw_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name":"Riesling","vintage":2023,"batch":"A001"}\'',
  },
  {
    method: 'GET',
    path: '/api/v1/qrcodes/wine/:wineId',
    scope: 'qrcodes:generate',
    description: 'Vraci QR vystup pro konkretni vino, typicky SVG nebo PNG.',
    example:
      'curl -X GET "https://etiketa.wine/api/v1/qrcodes/wine/ID_VINA?format=svg" \\\n  -H "Authorization: Bearer etw_xxx"',
  },
  {
    method: 'GET',
    path: '/api/v1/analytics/summary',
    scope: 'analytics:read',
    description: 'Vraci souhrnny prehled usage a scan dat za zvolene obdobi.',
    example:
      'curl -X GET "https://etiketa.wine/api/v1/analytics/summary?days=30" \\\n  -H "Authorization: Bearer etw_xxx"',
  },
];

const methodToneClasses: Record<string, string> = {
  GET: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  POST: 'bg-[#7c2332]/10 text-[#6f1d2b] border border-[#7c2332]/15',
  DELETE: 'bg-amber-50 text-amber-700 border border-amber-200',
};

function formatDate(dateString: string | null, withTime = true) {
  if (!dateString) return 'Nikdy';

  const formatter = withTime
    ? {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    : {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };

  return new Intl.DateTimeFormat('cs-CZ', formatter as Intl.DateTimeFormatOptions).format(
    new Date(dateString)
  );
}

function maskKey(value?: string) {
  if (!value) return 'Klic je dostupny pouze pri vytvoreni.';
  return `${value.slice(0, 12)}...${value.slice(-6)}`;
}

function wasUsedRecently(lastUsedAt: string | null) {
  if (!lastUsedAt) return false;

  const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(lastUsedAt).getTime() >= threshold;
}

function sessionFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'same-origin',
  });
}

export default function ClientApiDashboard() {
  const { user } = useRequireAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<ApiScopeValue[]>(DEFAULT_SCOPES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApiKeys() {
      if (!user) return;

      try {
        setLoading(true);
        const response = await sessionFetch('/api/api-keys');

        if (response.ok) {
          const data = await response.json();
          setApiKeys(Array.isArray(data.apiKeys) ? data.apiKeys : []);
          setError(null);
        } else {
          setError('Nepodarilo se nacist API klice.');
        }
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Nastala chyba pri nacitani API klicu.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchUsageStats() {
      if (!user) return;

      try {
        const response = await sessionFetch('/api/analytics/api-usage?range=30days');

        if (response.ok) {
          const data = await response.json();
          setUsageStats(data);
        }
      } catch (err) {
        console.error('Error fetching usage stats:', err);
      }
    }

    fetchApiKeys();
    fetchUsageStats();
  }, [user]);

  useEffect(() => {
    if (!copyState) return;

    const timeout = window.setTimeout(() => setCopyState(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const activeKeyCount = apiKeys.length;
  const recentlyUsedKeys = apiKeys.filter((key) => wasUsedRecently(key.lastUsedAt)).length;
  const latestKey = useMemo(
    () =>
      [...apiKeys].sort(
        (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      )[0] || null,
    [apiKeys]
  );

  const createApiKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !newKeyName.trim() || !selectedScopes.length || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await sessionFetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: selectedScopes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys((current) => [data.apiKey, ...current]);
        setNewlyCreatedKey(data.apiKey);
        setShowNewKey(true);
        setNewKeyName('');
        setSelectedScopes(DEFAULT_SCOPES);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nepodarilo se vytvorit API klic.');
      }
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('Nastala chyba pri vytvareni API klice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!user) return;
    if (!window.confirm('Opravdu chcete smazat tento API klic? Tato akce je nevratna.')) return;

    try {
      const response = await sessionFetch(`/api/api-keys/${keyId}`, { method: 'DELETE' });

      if (response.ok) {
        setApiKeys((current) => current.filter((key) => key.id !== keyId));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nepodarilo se smazat API klic.');
      }
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Nastala chyba pri mazani API klice.');
    }
  };

  const toggleShowKey = (keyId: string) => {
    setShowKeys((current) => ({ ...current, [keyId]: !current[keyId] }));
  };

  const toggleScope = (scope: ApiScopeValue) => {
    setSelectedScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]
    );
  };

  const copyToClipboard = async (text: string, feedbackId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(feedbackId);
    } catch (err) {
      console.error('Clipboard write failed:', err);
      setError('Nepodarilo se zkopirovat text do schranky.');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Surface tone="muted" padding="lg">
          <div className="flex items-center justify-center gap-3 text-stone-700">
            <svg className="h-5 w-5 animate-spin text-[#6f1d2b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm font-medium sm:text-base">Nacitam API access workspace.</span>
          </div>
        </Surface>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative space-y-6 pb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-52 rounded-[40px] bg-[radial-gradient(circle_at_top_right,_rgba(111,29,43,0.1),_transparent_50%),radial-gradient(circle_at_top_left,_rgba(194,165,139,0.12),_transparent_45%)]"
        />

        <PageHeader
          eyebrow="API Access"
          title="Integracni pristup"
          description="Dashboard ověřuje session cookie, zatimco externi integrace dostavaji vlastni API klic a pracuji pres Authorization hlavicku. Kazda integrace by mela mit vlastni scope profil."
          meta={
            <>
              <Badge tone="burgundy">/api/v1/*</Badge>
              <Badge tone="neutral">Dashboard: session cookie</Badge>
              <Badge tone="neutral">API key: Authorization</Badge>
            </>
          }
          actions={
            <>
              <SecondaryButton
                onClick={() =>
                  copyToClipboard(
                    'curl -X GET "https://etiketa.wine/api/v1/wines" \\\n  -H "Authorization: Bearer etw_xxx" \\\n  -H "Content-Type: application/json"',
                    'header-example'
                  )
                }
              >
                <ClipboardIcon className="h-4 w-4" />
                {copyState === 'header-example' ? 'Zkopirovano' : 'Kopirovat integracni priklad'}
              </SecondaryButton>
            </>
          }
        />

        {error ? (
          <Surface tone="muted" padding="sm">
            <div className="flex items-start gap-3 text-stone-700">
              <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                <ClockIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">Akce se nepodarila dokoncit</p>
                <p className="mt-1 text-sm text-stone-600">{error}</p>
              </div>
            </div>
          </Surface>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Aktivni klice"
            value={activeKeyCount}
            detail="Jeden klic na jednu integraci nebo provozni job."
            icon={<KeyIcon className="h-5 w-5" />}
            tone="accent"
          />
          <MetricCard
            label="Pouziti za 30 dni"
            value={usageStats?.summary?.totalRequests?.toLocaleString('cs-CZ') || '0'}
            detail="Souhrn vsech requestu na externi API surface."
            icon={<DocumentTextIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Uspesnost"
            value={usageStats?.summary ? `${usageStats.summary.successRate}%` : 'Bez dat'}
            detail="Pomaha odhalit vadne integrace nebo spatny auth kontrakt."
            icon={<ClockIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Klice pouzite nedavno"
            value={recentlyUsedKeys}
            detail={
              latestKey
                ? `Posledni novy klic: ${formatDate(latestKey.createdAt, false)}`
                : 'Zatim nebyl zalozen zadny API klic.'
            }
            icon={<KeyIcon className="h-5 w-5" />}
            tone={recentlyUsedKeys === 0 && activeKeyCount > 0 ? 'warning' : 'neutral'}
            badge={recentlyUsedKeys === 0 && activeKeyCount > 0 ? 'Bez provozu' : 'OK'}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <div className="space-y-6">
            <Surface>
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Issue Key
                </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-900">Vystaveni noveho klice</h2>
              <p className="mt-1 text-sm text-stone-600">
                  Vydavejte samostatny klic pro kazdou integraci. Scope omezte na minimum nutne pro dany tok dat.
              </p>
              </div>

              <form onSubmit={createApiKey} className="mt-5 space-y-5">
                <div>
                  <label htmlFor="keyName" className="block text-sm font-medium text-stone-700">
                    Nazev integrace
                  </label>
                  <input
                    id="keyName"
                    type="text"
                    value={newKeyName}
                    onChange={(event) => setNewKeyName(event.target.value)}
                    placeholder="napr. E-shop export, ERP sync, interni dashboard"
                    className="mt-2 w-full rounded-[18px] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-[#7c2332]/40"
                    required
                  />
                </div>

                <div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-stone-700">Scope profil</h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Scope selection je soucasti requestu pri vytvoreni klice. Umoznuje oddelit cteni, zapis i QR generovani.
                      </p>
                    </div>
                    <SecondaryButton
                      type="button"
                      onClick={() => setSelectedScopes(DEFAULT_SCOPES)}
                    >
                      Vybrat doporucene minimum
                    </SecondaryButton>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {DEFAULT_SCOPE_OPTIONS.map((scope) => {
                      const checked = selectedScopes.includes(scope.value);

                      return (
                        <label
                          key={scope.value}
                          className={`rounded-[20px] border px-4 py-4 transition-colors ${
                            checked
                              ? 'border-[#7c2332]/25 bg-[#7c2332]/6'
                              : 'border-stone-200 bg-stone-50/70 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleScope(scope.value)}
                              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#6f1d2b] focus:ring-[#7c2332]"
                            />
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{scope.label}</p>
                              <p className="mt-1 text-sm leading-6 text-stone-600">{scope.description}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-stone-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {selectedScopes.map((scope) => (
                      <Badge key={scope} tone="burgundy">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting || !newKeyName.trim() || selectedScopes.length === 0}
                  >
                    <KeyIcon className="h-4 w-4" />
                    {isSubmitting ? 'Vytvarim klic' : 'Vytvorit API klic'}
                  </PrimaryButton>
                </div>
              </form>
            </Surface>

            {showNewKey && newlyCreatedKey ? (
              <Surface tone="accent">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                      Newly Issued Key
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-stone-900">Ulozte si plnou hodnotu nyni</h2>
                    <p className="mt-1 text-sm text-stone-600">
                      Cely API klic uvidite pouze pri vytvoreni. Potom zustane v seznamu uz jen metadata a hash-only storage na serveru.
                    </p>
                  </div>
                  <SecondaryButton type="button" onClick={() => setShowNewKey(false)}>
                    Zavrit
                  </SecondaryButton>
                </div>

                <div className="mt-4 rounded-[22px] border border-[#7c2332]/15 bg-white/90 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900">{newlyCreatedKey.name}</p>
                      <code className="mt-3 block overflow-x-auto rounded-[18px] bg-stone-950 px-4 py-3 text-sm text-stone-50">
                        {newlyCreatedKey.key}
                      </code>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(newlyCreatedKey.scopes?.length ? newlyCreatedKey.scopes : DEFAULT_SCOPES).map((scope) => (
                          <Badge key={scope} tone="neutral">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <SecondaryButton
                      type="button"
                      onClick={() => copyToClipboard(newlyCreatedKey.key || '', 'new-key')}
                    >
                      <ClipboardIcon className="h-4 w-4" />
                      {copyState === 'new-key' ? 'Zkopirovano' : 'Kopirovat'}
                    </SecondaryButton>
                  </div>
                </div>
              </Surface>
            ) : null}

            <Surface>
              <div className="flex flex-col gap-2 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                    Key Inventory
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900">Aktualni klice a provozni stav</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Sledujte, kdy byl klic vydan, zda se pouziva, a ktere scopes nese.
                  </p>
                </div>
              </div>

              {apiKeys.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={<KeyIcon className="h-6 w-6" />}
                    title="Zatim neni vydan zadny API klic"
                    description="Vytvorte prvni klic pro konkretni integraci. Doporuceni je jeden klic na jeden consumer a scope omezene podle use-casu."
                  />
                </div>
              ) : (
                <div className="mt-3 divide-y divide-stone-200/80">
                  {apiKeys.map((key) => {
                    const keyScopes = key.scopes?.length ? key.scopes : DEFAULT_SCOPES;
                    const isVisible = showKeys[key.id];

                    return (
                      <div key={key.id} className="py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-stone-900">{key.name}</h3>
                              {wasUsedRecently(key.lastUsedAt) ? (
                                <Badge tone="success">Aktivni za 30 dni</Badge>
                              ) : (
                                <Badge tone="neutral">Bez nedavne aktivity</Badge>
                              )}
                              {key.expiresAt ? <Badge tone="warning">Expirace {formatDate(key.expiresAt, false)}</Badge> : null}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {keyScopes.map((scope) => (
                                <Badge key={`${key.id}-${scope}`} tone="neutral">
                                  {scope}
                                </Badge>
                              ))}
                            </div>

                            <div className="mt-4 rounded-[18px] bg-stone-50 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                                Hodnota klice
                              </p>
                              <code className="mt-2 block break-all text-sm text-stone-800">
                                {isVisible && key.key ? key.key : maskKey(key.key)}
                              </code>
                              <p className="mt-2 text-xs text-stone-500">
                                {key.key
                                  ? 'Plna hodnota je v tomto klientu dostupna pouze bezprostredne po vytvoreni.'
                                  : 'Server vraci u starsich klicu pouze metadata. Klic proto uchovavejte mimo aplikaci pri vydani.'}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-[220px] space-y-3 rounded-[20px] border border-stone-200/80 bg-stone-50/80 p-4">
                            <dl className="space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-stone-500">Vytvoreno</dt>
                                <dd className="text-right text-sm font-medium text-stone-900">
                                  {formatDate(key.createdAt)}
                                </dd>
                              </div>
                              <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-stone-500">Posledni pouziti</dt>
                                <dd className="text-right text-sm font-medium text-stone-900">
                                  {formatDate(key.lastUsedAt)}
                                </dd>
                              </div>
                            </dl>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {key.key ? (
                                <>
                                  <SecondaryButton type="button" onClick={() => toggleShowKey(key.id)}>
                                    {isVisible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    {isVisible ? 'Skryt' : 'Zobrazit'}
                                  </SecondaryButton>
                                  <SecondaryButton
                                    type="button"
                                    onClick={() => copyToClipboard(key.key || '', `key-${key.id}`)}
                                  >
                                    <ClipboardIcon className="h-4 w-4" />
                                    {copyState === `key-${key.id}` ? 'Zkopirovano' : 'Kopirovat'}
                                  </SecondaryButton>
                                </>
                              ) : null}
                              <SecondaryButton type="button" onClick={() => deleteApiKey(key.id)}>
                                <TrashIcon className="h-4 w-4" />
                                Smazat
                              </SecondaryButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Surface>
          </div>

          <div className="space-y-6">
            <Surface tone="accent">
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Auth Contract
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Header-only pristup</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Dashboard pouziva session cookie. Externi API akceptuje klic v hlavicce `Authorization`. Query string nepouzivejte.
                </p>
              </div>

              <div className="mt-4 rounded-[22px] bg-stone-950 px-4 py-4 text-sm text-stone-50">
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono">
{`curl -X GET "https://etiketa.wine/api/v1/wines" \\
  -H "Authorization: Bearer etw_xxx" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>

              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="rounded-[20px] border border-stone-200/80 bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-900">Pravidlo 1</p>
                  <p className="mt-1">Jeden klic patri jedne integraci. Nezdilejte jeden klic mezi e-shopem, ERP a internim reportem.</p>
                </div>
                <div className="rounded-[20px] border border-stone-200/80 bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-900">Pravidlo 2</p>
                  <p className="mt-1">Authorization hlavicka je jediny podporovany transport pro API klic. Klic nepatri do URL, query ani logu.</p>
                </div>
                <div className="rounded-[20px] border border-stone-200/80 bg-white/80 px-4 py-4">
                  <p className="font-semibold text-stone-900">Pravidlo 3</p>
                  <p className="mt-1">Pri kompromitaci klic smazte a vydejte novy. Stary klic se po smazani uz neobnovi.</p>
                </div>
              </div>
            </Surface>

            <Surface>
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Scope Strategy
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Doporuceny scope model</h2>
              </div>

              <div className="mt-4 space-y-3">
                {DEFAULT_SCOPE_OPTIONS.map((scope) => (
                  <div key={scope.value} className="rounded-[20px] border border-stone-200/80 bg-stone-50/70 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="burgundy">{scope.value}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{scope.description}</p>
                  </div>
                ))}
                <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-sm font-semibold text-amber-800">Poznamka k sirokym opravnenim</p>
                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    Scope `*` existuje v backend kontraktu, ale pro bezny provoz ho nepouzivejte. Vydavejte uzke scope profily a klice oddelujte podle systemu.
                  </p>
                </div>
              </div>
            </Surface>

            {usageStats ? (
              <Surface tone="muted">
                <div className="border-b border-stone-200/80 pb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                    Usage Snapshot
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900">Poslednich 30 dni</h2>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-white/85 px-4 py-4">
                    <p className="text-sm text-stone-500">Prumerna odezva</p>
                    <p className="mt-1 text-2xl font-semibold text-stone-900">
                      {usageStats.summary.averageResponseTime} ms
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white/85 px-4 py-4">
                    <p className="text-sm text-stone-500">Chybove requesty</p>
                    <p className="mt-1 text-2xl font-semibold text-stone-900">
                      {usageStats.summary.errorRequests.toLocaleString('cs-CZ')}
                    </p>
                  </div>
                </div>

                {usageStats.endpoints && usageStats.endpoints.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {usageStats.endpoints.slice(0, 4).map((endpoint) => (
                      <div
                        key={endpoint.endpoint}
                        className="rounded-[20px] border border-stone-200/80 bg-white/85 px-4 py-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <code className="block truncate text-sm font-semibold text-stone-900">
                              {endpoint.endpoint}
                            </code>
                            <p className="mt-1 text-sm text-stone-500">
                              {endpoint.averageResponseTime} ms avg
                            </p>
                          </div>
                          <div className="text-sm text-stone-600">
                            {endpoint.count.toLocaleString('cs-CZ')} req
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-stone-500">
                          {endpoint.successCount} uspech / {endpoint.errorCount} chyb
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Surface>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Surface>
            <div className="border-b border-stone-200/80 pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                Endpoint Families
              </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-900">Co ma byt za kazdym klicem povoleno</h2>
              <p className="mt-1 text-sm text-stone-600">
                Dokumentace je zjednodusena na hlavni operacni surface. Kazdy endpoint ukazuje metodu, path a potrebny scope.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {endpointCards.map((endpoint) => (
                <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-[22px] border border-stone-200/80 bg-stone-50/70 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            methodToneClasses[endpoint.method] || methodToneClasses.GET
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-semibold text-stone-900">{endpoint.path}</code>
                        <Badge tone="neutral">{endpoint.scope}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{endpoint.description}</p>
                    </div>
                    <SecondaryButton
                      type="button"
                      onClick={() => copyToClipboard(endpoint.example, `${endpoint.method}-${endpoint.path}`)}
                    >
                      <ClipboardIcon className="h-4 w-4" />
                      {copyState === `${endpoint.method}-${endpoint.path}` ? 'Zkopirovano' : 'Kopirovat'}
                    </SecondaryButton>
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-[18px] bg-stone-950 px-4 py-3 text-sm text-stone-50">
{endpoint.example}
                  </pre>
                </div>
              ))}
            </div>
          </Surface>

          <div className="space-y-6">
            <Surface tone="muted">
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Response Model
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Co cist z odpovedi</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Uspesna odpoved</p>
                  <pre className="mt-2 overflow-x-auto rounded-[18px] bg-stone-950 px-4 py-3 text-sm text-stone-50">
{`{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Chybova odpoved</p>
                  <pre className="mt-2 overflow-x-auto rounded-[18px] bg-stone-950 px-4 py-3 text-sm text-stone-50">
{`{
  "success": false,
  "error": "Popis chyby",
  "code": "ERROR_CODE"
}`}
                  </pre>
                </div>
              </div>
            </Surface>

            <Surface>
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Limits and Support
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Provozni poznamky</h2>
              </div>

              <div className="mt-4 space-y-4 text-sm leading-6 text-stone-600">
                <div className="rounded-[20px] border border-stone-200/80 bg-stone-50/70 px-4 py-4">
                  <p className="font-semibold text-stone-900">Rate limiting</p>
                  <p className="mt-1">
                    Zakladni ucet pocita s 60 requesty za hodinu, Neomezene s 300 requesty za hodinu. Pri limitu vraci API `429` a hlavicky `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
                  </p>
                </div>
                <div className="rounded-[20px] border border-stone-200/80 bg-stone-50/70 px-4 py-4">
                  <p className="font-semibold text-stone-900">Doporuceny rollout</p>
                  <p className="mt-1">
                    Nejdrive overte `wines:read`, teprve potom zapojte zapis nebo mazani. Pomuze to oddelit auth chyby od problemu v business logice integrace.
                  </p>
                </div>
                <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800">
                  <p className="font-semibold">Potrebujete pomoc s integraci?</p>
                  <p className="mt-1">
                    Pro specificky use-case nebo revizi scope profilu piste na{' '}
                    <a href="mailto:info@etiketa.wine" className="font-medium underline">
                      info@etiketa.wine
                    </a>
                    .
                  </p>
                </div>
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}
