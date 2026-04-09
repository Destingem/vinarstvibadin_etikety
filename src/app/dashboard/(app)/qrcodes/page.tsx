"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import QRCodeCustomizer from '@/components/QRCodeCustomizer';
import { QRCodeOptions } from '@/lib/qr-code';
import { getComplianceChecklist } from '@/app/dashboard/wines/workspace-helpers';

interface Wine {
  id?: string;
  $id?: string;
  name: string;
  vintage?: number | null;
  batch?: string | null;
  [key: string]: any;
}

interface QRCodeData {
  qrCode: string;
  url: string;
  wine: Wine;
  options?: QRCodeOptions;
}

function buildFileName(wine: Wine) {
  let fileName = wine.name.toLowerCase().replace(/\s+/g, '_');

  if (wine.vintage) {
    fileName += `_${wine.vintage}`;
  }

  if (wine.batch) {
    fileName += `_${wine.batch.replace(/\s+/g, '_').replace(/[\\/]/g, '-')}`;
  }

  return `${fileName}.png`;
}

export default function QRCodesPage() {
  const searchParams = useSearchParams();
  const requestedWineId = searchParams.get('wineId');
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [selectedWineId, setSelectedWineId] = useState<string | null>(requestedWineId);
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    setSelectedWineId(requestedWineId);
  }, [requestedWineId]);

  useEffect(() => {
    const fetchWines = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await authFetch('/api/wines?limit=1000', token);

        if (!response.ok) {
          throw new Error('Nepodařilo se načíst seznam vín.');
        }

        const data = await response.json();
        setWines(data.wines);
      } catch (err: any) {
        setError(err.message || 'Nastala chyba při načítání vín.');
      }
    };

    fetchWines();
  }, [token]);

  useEffect(() => {
    if (!selectedWineId || !token) {
      setQrCodeData(null);
      return;
    }

    const generateQRCode = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authFetch(`/api/qrcodes?wineId=${selectedWineId}`, token);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nepodařilo se vygenerovat QR kód.');
        }

        const data = await response.json();
        setQrCodeData(data);
      } catch (err: any) {
        setError(err.message || 'Nastala chyba při generování QR kódu.');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [selectedWineId, token]);

  const handleQRCodeGenerated = (qrCodeDataUrl: string, options: QRCodeOptions) => {
    if (!selectedWineId || !qrCodeData) {
      return;
    }

    setQrCodeData({
      ...qrCodeData,
      qrCode: qrCodeDataUrl,
      options,
    });
    setLoading(false);
  };

  const handleDownload = () => {
    if (!qrCodeData) {
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeData.qrCode;
    link.download = buildFileName(qrCodeData.wine);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedWine = wines.find((wine) => (wine.$id || wine.id) === selectedWineId) || qrCodeData?.wine || null;
  const complianceChecklist = selectedWine ? getComplianceChecklist(selectedWine) : [];
  const missingCompliance = complianceChecklist.filter((item) => !item.done);

  return (
    <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-4 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(138,21,56,0.14),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,247,242,0.92))] px-5 py-6 shadow-xl shadow-stone-200/40 sm:px-8 sm:py-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(156,114,82,0.16),_transparent_56%)] lg:block" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8A1538]/70">QR a export</p>
          <h1 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">Připravte etiketu k tisku během jedné relace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
            Vyberte víno, zkontrolujte veřejnou URL, stáhněte QR kód a případně ho dolaďte. Stránka teď vede přes jasný
            workflow místo oddělených utilit.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">1. Vyberte víno</p>
              <p className="mt-2 text-sm font-medium text-stone-900">Z katalogu nebo z detailu vína.</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">2. Zkontrolujte URL</p>
              <p className="mt-2 text-sm font-medium text-stone-900">Veřejná etiketa musí fungovat před tiskem.</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">3. Stáhněte a vytiskněte</p>
              <p className="mt-2 text-sm font-medium text-stone-900">PNG je připravené pro export a finální sazbu.</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700">{error}</div>
      ) : null}

      {wines.length === 0 && !loading ? (
        <section className="mt-6 rounded-[2rem] border border-stone-200 bg-white/80 px-6 py-10 text-center shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:px-10">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="mt-5 font-serif text-3xl text-stone-900">Nejdřív přidejte víno do katalogu</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
              QR workflow potřebuje existující víno. Po založení se sem můžete vrátit rovnou z detailu vína.
            </p>
            <Link
              href="/dashboard/wines/new"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
            >
              Přidat nové víno
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
            <h2 className="text-xl font-semibold text-stone-900">Výběr vína</h2>
            <p className="mt-1 text-sm text-stone-600">Po výběru se automaticky vygeneruje QR kód i veřejná URL.</p>

            <div className="mt-5">
              <label htmlFor="wine" className="mb-2 block text-sm font-medium text-stone-700">
                Které víno chcete exportovat?
              </label>
              <select
                id="wine"
                value={selectedWineId || ''}
                onChange={(event) => setSelectedWineId(event.target.value || null)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              >
                <option value="">Vyberte víno</option>
                {wines.map((wine) => (
                  <option key={wine.$id || wine.id} value={wine.$id || wine.id}>
                    {wine.name}
                    {wine.vintage ? ` (${wine.vintage})` : ''}
                    {wine.batch ? ` – ${wine.batch}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedWine ? (
              <div className="mt-5 rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Vybrané víno</p>
                <h3 className="mt-2 text-lg font-semibold text-stone-900">{selectedWine.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedWine.vintage ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
                      Ročník {selectedWine.vintage}
                    </span>
                  ) : null}
                  {selectedWine.batch ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
                      Šarže {selectedWine.batch}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-2">
                  <Link
                    href={`/dashboard/wines/${selectedWine.$id || selectedWine.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Otevřít detail vína
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                Vyberte víno a pokračujte do QR exportu.
              </div>
            )}

            <div className="mt-5 rounded-3xl border border-stone-200 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Kontrola před tiskem</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li>Ověřte, že se veřejná etiketa otevře na telefonu.</li>
                <li>Použijte velikost alespoň 2 × 2 cm.</li>
                <li>Po designové úpravě QR kód znovu otestujte.</li>
              </ul>
            </div>

            {selectedWine ? (
              <div className="mt-5 rounded-3xl border border-stone-200 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Připravenost vína</p>
                <ul className="mt-3 space-y-2">
                  {complianceChecklist.map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-stone-700">{item.label}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.done ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}
                      >
                        {item.done ? 'Hotovo' : 'Chybí'}
                      </span>
                    </li>
                  ))}
                </ul>

                {missingCompliance.length > 0 ? (
                  <Link
                    href={`/dashboard/wines/${selectedWine.$id || selectedWine.id}/edit`}
                    className="mt-4 inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Doplnit údaje ve workspace
                  </Link>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
            {!selectedWineId ? (
              <div className="flex min-h-[26rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-stone-200 bg-stone-50/70 px-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-stone-400 shadow-sm">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-stone-900">QR náhled se zobrazí tady</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
                  Vyberte víno vlevo. Po vygenerování uvidíte náhled, veřejnou URL a akce pro stažení i úpravu QR kódu.
                </p>
              </div>
            ) : loading ? (
              <div className="flex min-h-[26rem] items-center justify-center">
                <div className="inline-flex items-center gap-3 text-stone-700">
                  <svg className="h-6 w-6 animate-spin text-[#8A1538]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg font-medium">Generuji QR kód…</span>
                </div>
              </div>
            ) : qrCodeData ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                <div className="rounded-[2rem] border border-stone-200 bg-stone-50/70 p-5">
                  <div className="flex items-center justify-center rounded-[1.5rem] bg-white p-4 shadow-sm">
                    <Image
                      src={qrCodeData.qrCode}
                      alt={`QR kód pro víno ${qrCodeData.wine.name}`}
                      width={320}
                      height={320}
                      className="h-auto w-full max-w-[18rem]"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-semibold text-stone-900">
                      {qrCodeData.wine.name}
                      {qrCodeData.wine.vintage ? ` (${qrCodeData.wine.vintage})` : ''}
                    </h2>
                    {qrCodeData.wine.batch ? <p className="mt-1 text-sm text-stone-500">Šarže {qrCodeData.wine.batch}</p> : null}
                  </div>
                </div>

                <div className="space-y-5">
                  {missingCompliance.length > 0 ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                      QR kód lze stáhnout už teď, ale pro důvěryhodnou veřejnou etiketu ještě doporučujeme doplnit:
                      {' '}
                      {missingCompliance.map((item) => item.label.toLowerCase()).join(', ')}.
                    </div>
                  ) : null}

                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">Veřejná etiketa a export</h2>
                    <p className="mt-1 text-sm text-stone-600">Stáhněte QR kód nebo nejdřív zkontrolujte cílovou stránku.</p>
                  </div>

                  <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Veřejná URL</p>
                    <a
                      href={qrCodeData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block break-all text-sm font-medium text-[#8A1538] transition hover:text-[#73102f]"
                    >
                      {qrCodeData.url}
                    </a>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
                    >
                      Stáhnout PNG
                    </button>
                    <a
                      href={qrCodeData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      Otevřít veřejnou etiketu
                    </a>
                    <Link
                      href={`/dashboard/wines/${qrCodeData.wine.id || qrCodeData.wine.$id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      Zpět do detailu vína
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowCustomizer((previous) => !previous)}
                      className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                    >
                      {showCustomizer ? 'Skrýt nastavení QR' : 'Upravit QR kód'}
                    </button>
                  </div>

                  <div className="rounded-3xl border border-stone-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Doporučení pro tisk</p>
                    <ul className="mt-3 space-y-2 text-sm text-stone-600">
                      <li>Nechte kolem QR kódu dostatek bílého místa.</li>
                      <li>Před odesláním do tisku kód otestujte na více telefonech.</li>
                      <li>Pokud měníte barvy nebo logo, po regeneraci znovu stáhněte finální PNG.</li>
                    </ul>
                  </div>

                  {showCustomizer ? (
                    <div className="rounded-[2rem] border border-stone-200 bg-stone-50/70 p-4">
                      <QRCodeCustomizer wineId={selectedWineId || ''} onQRCodeGenerated={handleQRCodeGenerated} />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
