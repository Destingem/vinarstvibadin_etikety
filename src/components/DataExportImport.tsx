"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function DataExportImport() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const handleExport = async () => {
    if (!user) {
      setError('Nejste přihlášeni');
      return;
    }

    setExportLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/data/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export dat selhal');
      }

      const data = await response.json();
      
      // Create a downloadable file
      const fileName = `${user.slug || 'vinarstvi'}-data-${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Data byla úspěšně exportována');
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při exportu dat');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setError('Nejste přihlášeni');
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
      // Read file
      const fileContent = await file.text();
      let importData;
      
      try {
        importData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Neplatný formát souboru. Soubor musí být ve formátu JSON.');
      }

      // Send to API
      const response = await fetch('/api/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({ data: importData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import dat selhal');
      }

      // Reset file input
      event.target.value = '';
      
      setSuccess('Data byla úspěšně importována');
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při importu dat');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Záloha a obnova dat
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Exportujte data vašeho vinařství pro zálohování nebo je importujte z předchozí zálohy.
        </p>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-2">Export dat</h4>
            <p className="text-sm text-gray-500 mb-4">
              Stáhněte si kompletní zálohu všech vašich vín a dalších dat.
            </p>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {exportLoading ? 'Exportuji...' : 'Exportovat data'}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-2">Import dat</h4>
            <p className="text-sm text-gray-500 mb-4">
              Nahrajte zálohu vašich dat. Upozornění: Existující data se spojí s importovanými.
            </p>
            <label className="block">
              <span className="sr-only">Vyberte soubor s daty</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importLoading}
                className="block w-full text-sm text-black
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
