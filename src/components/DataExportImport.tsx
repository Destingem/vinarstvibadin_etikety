"use client";

import { useState } from 'react';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

export default function DataExportImport() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, token } = useAuth();

  const [exportType, setExportType] = useState<string>('wines');
  const [format, setFormat] = useState<string>('json');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [showCustomDates, setShowCustomDates] = useState<boolean>(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState<boolean>(false);

  const handleBasicExport = async () => {
    if (!user || !token) {
      setError('Nejste přihlášeni.');
      return;
    }

    setExportLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authFetch('/api/data/export', token, { method: 'GET' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export dat selhal.');
      }

      const data = await response.json();
      const fileName = `${user.slug || 'vinarstvi'}-data-${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Kompletní záloha byla úspěšně stažena.');
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při exportu dat.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleAdvancedExport = async () => {
    if (!user || !token) {
      setError('Nejste přihlášeni.');
      return;
    }

    setExportLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let dateParams = '';

      if (showCustomDates && customDateRange.startDate && customDateRange.endDate) {
        dateParams = `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      } else if (dateRange !== 'custom' && exportType.startsWith('analytics-')) {
        dateParams = `&range=${dateRange}`;
      }

      const exportUrl = `/api/data/export?type=${exportType}&format=${format}${dateParams}`;

      if (format === 'csv') {
        const response = await authFetch(exportUrl, token, { method: 'GET' });

        if (!response.ok) {
          throw new Error('Export selhal.');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();

        window.setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      } else {
        const response = await authFetch(exportUrl, token, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Export selhal.');
        }

        const data = await response.json();
        const dataBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();

        window.setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }

      setSuccess(`Export ${getExportTypeLabel(exportType)} je připravený ke stažení.`);
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při exportu dat.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !token) {
      setError('Nejste přihlášeni.');
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileContent = await file.text();
      let importData;

      try {
        importData = JSON.parse(fileContent);
      } catch {
        throw new Error('Neplatný formát souboru. Soubor musí být ve formátu JSON.');
      }

      const response = await authFetch('/api/data/import', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: importData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import dat selhal.');
      }

      event.target.value = '';
      setSuccess('Import dat byl dokončen. Zkontrolujte navazující přehledy a katalog.');
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při importu dat.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setShowCustomDates(value === 'custom');
  };

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,239,0.92))] p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">Datový přenos</p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-900">Zálohy, exporty a import v jednom pracovním kroku</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Pro kompletní přesun zvolte rychlou zálohu. Pro analytiku nebo dílčí export vyberte konkrétní datovou sadu
            a formát. Import očekává JSON zálohu z kompatibilního exportu.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white/72 px-4 py-4 text-sm text-stone-600">
          <p className="font-medium text-stone-900">Nejčastější použití</p>
          <p className="mt-1">Rychlá záloha před větším zásahem do katalogu nebo analytiky.</p>
          <p>Export analytiky pro sdílení mimo aplikaci v JSON nebo CSV.</p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="overflow-hidden rounded-[1.8rem] border border-stone-200 bg-white/72">
          <div className="border-b border-stone-200 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Export</p>
                <h4 className="mt-2 text-xl font-semibold text-stone-900">Stáhnout kompletní zálohu</h4>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Jedním kliknutím stáhnete celé datové zázemí vinařství jako JSON soubor pro archiv nebo přesun.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-stone-50 px-3 py-3 text-stone-500 sm:block">
                <ArrowDownTrayIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 space-y-3 border-l border-stone-200 pl-4 text-sm text-stone-600">
              <p>Obsahuje vína i související exportovatelná data.</p>
              <p>Soubor se pojmenuje podle data stažení.</p>
              <p>Další krok: uložit kopii mimo aplikaci.</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleBasicExport}
                disabled={exportLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportLoading ? 'Připravuji export…' : 'Stáhnout zálohu'}
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedExport((previous) => !previous)}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                {showAdvancedExport ? 'Skrýt pokročilý export' : 'Otevřít pokročilý export'}
              </button>
            </div>
          </div>

          {showAdvancedExport ? (
            <div className="px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Pokročilý export</p>
                  <h5 className="mt-2 text-lg font-semibold text-stone-900">Vybraná data a analytika</h5>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Vyberte konkrétní datovou sadu, časové období a výstupní formát podle toho, co chcete sdílet nebo archivovat.
                  </p>
                </div>

                <div className="hidden rounded-2xl bg-stone-50 px-3 py-3 text-stone-500 sm:block">
                  {getExportTypeIcon(exportType)}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="export-type" className="mb-2 block text-sm font-medium text-stone-700">
                    Typ exportu
                  </label>
                  <select
                    id="export-type"
                    value={exportType}
                    onChange={(event) => setExportType(event.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
                  >
                    <option value="wines">Seznam vín</option>
                    <optgroup label="Analytická data">
                      <option value="analytics-daily">Denní statistiky skenů</option>
                      <option value="analytics-regional">Regionální statistiky</option>
                      <option value="analytics-language">Jazykové preference</option>
                      <option value="analytics-hourly">Rozložení během dne</option>
                      <option value="analytics-wines">Žebříček oblíbenosti vín</option>
                    </optgroup>
                  </select>
                </div>

                {exportType.startsWith('analytics-') ? (
                  <div className="sm:col-span-2">
                    <label htmlFor="date-range" className="mb-2 block text-sm font-medium text-stone-700">
                      Časové období
                    </label>
                    <select
                      id="date-range"
                      value={dateRange}
                      onChange={(event) => handleDateRangeChange(event.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
                    >
                      <option value="7days">Posledních 7 dní</option>
                      <option value="30days">Posledních 30 dní</option>
                      <option value="90days">Posledních 90 dní</option>
                      <option value="year">Poslední rok</option>
                      <option value="custom">Vlastní období</option>
                    </select>
                  </div>
                ) : null}

                {showCustomDates ? (
                  <>
                    <div>
                      <label htmlFor="custom-start" className="mb-2 block text-sm font-medium text-stone-700">
                        Od data
                      </label>
                      <input
                        id="custom-start"
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(event) =>
                          setCustomDateRange((previous) => ({ ...previous, startDate: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-end" className="mb-2 block text-sm font-medium text-stone-700">
                        Do data
                      </label>
                      <input
                        id="custom-end"
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(event) =>
                          setCustomDateRange((previous) => ({ ...previous, endDate: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
                      />
                    </div>
                  </>
                ) : null}

                <div className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Formát</span>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                      <input
                        type="radio"
                        name="format"
                        value="json"
                        checked={format === 'json'}
                        onChange={() => setFormat('json')}
                        className="h-4 w-4 border-stone-300 text-[#8A1538] focus:ring-[#8A1538]/30"
                      />
                      JSON
                    </label>
                    <label className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={format === 'csv'}
                        onChange={() => setFormat('csv')}
                        className="h-4 w-4 border-stone-300 text-[#8A1538] focus:ring-[#8A1538]/30"
                      />
                      CSV
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-stone-50/80 p-4 text-sm text-stone-600">
                <div className="flex items-center gap-2 text-stone-900">
                  {getExportTypeIcon(exportType)}
                  <span className="font-medium">Co export právě udělá</span>
                </div>
                <p className="mt-2 leading-6">{getExportTypeDescription(exportType)}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-500">
                  Další krok: po stažení soubor předejte dál nebo ho uložte k internímu reportingu.
                </p>
                <button
                  type="button"
                  onClick={handleAdvancedExport}
                  disabled={exportLoading || (showCustomDates && (!customDateRange.startDate || !customDateRange.endDate))}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  {exportLoading ? 'Exportuji…' : `Exportovat ${getExportTypeLabel(exportType)}`}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-stone-200 bg-white/72">
          <div className="px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Import</p>
                <h4 className="mt-2 text-xl font-semibold text-stone-900">Vrátit data ze zálohy</h4>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Nahrajte JSON zálohu z kompatibilního exportu. Importovaná data se spojí s existujícím stavem podle pravidel backendu.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-stone-50 px-3 py-3 text-stone-500 sm:block">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 space-y-3 border-l border-stone-200 pl-4 text-sm text-stone-600">
              <p>Akceptovaný formát je `.json`.</p>
              <p>Import nespouštějte na neověřených souborech třetích stran.</p>
              <p>Další krok: po dokončení zkontrolujte katalog a navazující přehledy.</p>
            </div>

            <label className="mt-6 block">
              <span className="sr-only">Vyberte soubor s daty</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importLoading}
                className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-2xl file:border-0 file:bg-white file:px-4 file:py-3 file:text-sm file:font-semibold file:text-stone-700 file:ring-1 file:ring-stone-200 hover:file:bg-stone-50 disabled:cursor-not-allowed"
              />
            </label>

            {importLoading ? <p className="mt-3 text-sm text-[#8A1538]">Importuji data…</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function getExportTypeLabel(type: string): string {
  switch (type) {
    case 'wines':
      return 'seznam vín';
    case 'analytics-daily':
      return 'denní statistiky';
    case 'analytics-regional':
      return 'regionální statistiky';
    case 'analytics-language':
      return 'jazykové preference';
    case 'analytics-hourly':
      return 'rozložení během dne';
    case 'analytics-wines':
      return 'žebříček vín';
    default:
      return 'data';
  }
}

function getExportTypeDescription(type: string): string {
  switch (type) {
    case 'wines':
      return 'Exportuje kompletní seznam vašich vín včetně všech dostupných detailů.';
    case 'analytics-daily':
      return 'Denní statistiky skenování QR kódů včetně počtu skenů, návštěvnosti a zařízení.';
    case 'analytics-regional':
      return 'Geografické rozložení skenů podle regionů a zemí, odkud návštěvníci přicházejí.';
    case 'analytics-language':
      return 'Přehled jazykových preferencí návštěvníků při zobrazení veřejných etiket.';
    case 'analytics-hourly':
      return 'Rozložení skenování během dne pro hledání nejsilnějších časových oken.';
    case 'analytics-wines':
      return 'Pořadí vín podle zájmu návštěvníků a počtu načtení veřejné etikety.';
    default:
      return 'Exportuje vybraná data ve zvoleném formátu.';
  }
}

function getExportTypeIcon(type: string) {
  switch (type) {
    case 'wines':
      return <DocumentTextIcon className="h-5 w-5 text-stone-500" />;
    case 'analytics-daily':
      return <ChartBarIcon className="h-5 w-5 text-[#8A1538]" />;
    case 'analytics-regional':
      return <GlobeAltIcon className="h-5 w-5 text-emerald-600" />;
    case 'analytics-language':
      return <LanguageIcon className="h-5 w-5 text-amber-600" />;
    case 'analytics-hourly':
      return <ClockIcon className="h-5 w-5 text-stone-500" />;
    case 'analytics-wines':
      return <CalendarIcon className="h-5 w-5 text-[#8A1538]" />;
    default:
      return <DocumentTextIcon className="h-5 w-5 text-stone-500" />;
  }
}
