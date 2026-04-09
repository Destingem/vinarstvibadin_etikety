"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

export default function ImportExportWines() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    if (!user || !token) {
      setError('Nejste přihlášeni.');
      return;
    }

    setExportLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authFetch('/api/wines/export', token, { method: 'GET' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export dat selhal.');
      }

      const data = await response.json();
      const fileName = `vina-${user.slug || 'vinarstvi'}-${new Date().toISOString().split('T')[0]}.vrqr`;
      const blob = new Blob([data.data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Export úspěšně dokončen. Exportováno ${data.totalWines} vín.`);
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
      const response = await authFetch('/api/wines/import', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: fileContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import dat selhal.');
      }

      const result = await response.json();
      event.target.value = '';
      setSuccess(result.message || 'Data byla úspěšně importována.');

      window.setTimeout(() => {
        router.refresh();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při importu dat.');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,244,239,0.92))] p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">Katalogový přenos</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Import a export bez dalšího mezikroku</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Tahle plocha slouží jen pro dva jasné úkoly: stáhnout záložní kopii katalogu nebo vrátit dříve exportovaný
            `.vrqr` soubor zpět do systému. Po importu se katalog automaticky obnoví, aby byl další krok hned jasný.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white/72 px-4 py-4 text-sm text-stone-600">
          <p className="font-medium text-stone-900">Doporučený postup</p>
          <p className="mt-1">1. Stáhnout zálohu před větším zásahem do katalogu.</p>
          <p>2. Importovat jen `.vrqr` soubor vytvořený z etiketa.wine.</p>
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

      <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-stone-200 bg-white/72">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:divide-x lg:divide-stone-200">
          <article className="p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Export</p>
            <h3 className="mt-2 text-xl font-semibold text-stone-900">Stáhnout aktuální katalog</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Vytvoří se jeden `.vrqr` soubor se všemi víny. Použijte ho jako bezpečnostní kopii před větším úklidem
              nebo jako přenos mezi prostředími.
            </p>

            <div className="mt-5 space-y-3 border-l border-stone-200 pl-4 text-sm text-stone-600">
              <p>Obsahuje celý aktuální katalog.</p>
              <p>Soubor se pojmenuje podle data exportu.</p>
              <p>Po stažení už není potřeba další krok v aplikaci.</p>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exportLoading}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportLoading ? 'Připravuji zálohu…' : 'Stáhnout zálohu'}
            </button>

            <p className="mt-3 text-sm text-stone-500">
              Další krok: uložte soubor mimo platformu, ideálně do interního archivu vinařství.
            </p>
          </article>

          <article className="border-t border-stone-200 p-5 sm:p-6 lg:border-t-0">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Import</p>
            <h3 className="mt-2 text-xl font-semibold text-stone-900">Obnovit katalog ze zálohy</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Nahrajte dříve exportovaný `.vrqr` soubor. Po úspěšném importu stránku automaticky obnovíme, aby byly
              nové nebo obnovené záznamy hned vidět v katalogu.
            </p>

            <div className="mt-5 space-y-3 border-l border-stone-200 pl-4 text-sm text-stone-600">
              <p>Importujte jen soubory vytvořené exportem z etiketa.wine.</p>
              <p>Duplicitní vína se řeší podle backend logiky.</p>
              <p>Po dokončení se katalog automaticky znovu načte.</p>
            </div>

            <label className="mt-6 block">
              <span className="sr-only">Vyberte VRQR soubor</span>
              <input
                type="file"
                accept=".vrqr"
                onChange={handleImport}
                disabled={importLoading}
                className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-2xl file:border-0 file:bg-white file:px-4 file:py-3 file:text-sm file:font-semibold file:text-stone-700 file:ring-1 file:ring-stone-200 hover:file:bg-stone-50 disabled:cursor-not-allowed"
              />
            </label>

            {importLoading ? <p className="mt-3 text-sm text-[#8A1538]">Importuji katalog…</p> : null}
            {!importLoading ? (
              <p className="mt-3 text-sm text-stone-500">
                Další krok: po obnovení zkontrolujte katalog a otevřete detail nově přidaných vín.
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
