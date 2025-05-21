"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

/**
 * Component for importing and exporting wine data
 */
export default function ImportExportWines() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, token } = useAuth();

  /**
   * Handles the export of wine data
   */
  const handleExport = async () => {
    if (!user || !token) {
      setError('Nejste přihlášeni');
      return;
    }

    setExportLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/wines/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export dat selhal');
      }

      const data = await response.json();
      
      // Create a downloadable file
      const fileName = `vina-${user.slug || 'vinarstvi'}-${new Date().toISOString().split('T')[0]}.vrqr`;
      const blob = new Blob([data.data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Export úspěšně dokončen. Exportováno ${data.totalWines} vín.`);
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při exportu dat');
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Handles the import of wine data
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !token) {
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
      
      // Send to API
      const response = await fetch('/api/wines/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data: fileContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import dat selhal');
      }

      const result = await response.json();
      
      // Reset file input
      event.target.value = '';
      
      setSuccess(result.message || 'Data byla úspěšně importována');
      
      // Wait 2 seconds then refresh the page to show the imported wines
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při importu dat');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-900">
          Záloha a import
        </h3>
        <p className="mt-1 max-w-2xl text-xs text-gray-500">
          Zálohujte svá vína pro přenos do jiné instance nebo obnovte vína ze zálohy.
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Záloha vín</h4>
            <p className="text-xs text-gray-500 mb-4">
              Stáhněte si kompletní zálohu všech vašich vín ve formátu VRQR. Soubor je šifrovaný a může být importován pouze do tohoto systému.
            </p>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="py-1.5 px-3 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors"
            >
              {exportLoading ? 'Vytvářím zálohu...' : 'Vytvořit zálohu'}
            </button>
          </div>

          <div className="p-3 border rounded">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Import vín</h4>
            <p className="text-xs text-gray-500 mb-4">
              Nahrajte soubor VRQR vytvořený exportem z tohoto systému. Existující vína se stejným jménem, ročníkem a šarží budou přeskočena.
            </p>
            <label className="block">
              <span className="sr-only">Vyberte soubor VRQR</span>
              <input
                type="file"
                accept=".vrqr"
                onChange={handleImport}
                disabled={importLoading}
                className="block w-full text-sm text-black
                  file:mr-4 file:py-1.5 file:px-3
                  file:rounded file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100 transition-colors cursor-pointer"
              />
            </label>
            {importLoading && (
              <p className="mt-2 text-sm text-indigo-600">Importuji...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}