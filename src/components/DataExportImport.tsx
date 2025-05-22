"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowDownTrayIcon, 
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LanguageIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function DataExportImport() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  // Analytics export state
  const [exportType, setExportType] = useState<string>('wines');
  const [format, setFormat] = useState<string>('json');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomDates, setShowCustomDates] = useState<boolean>(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState<boolean>(false);

  const handleBasicExport = async () => {
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

  // Handle advanced export
  const handleAdvancedExport = async () => {
    if (!user) {
      setError('Nejste přihlášeni');
      return;
    }

    setExportLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Determine date parameters
      let dateParams = '';
      if (showCustomDates && customDateRange.startDate && customDateRange.endDate) {
        dateParams = `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      } else if (dateRange !== 'custom') {
        // For analytics data, we may want to include the date range
        if (exportType.startsWith('analytics-')) {
          dateParams = `&range=${dateRange}`;
        }
      }
      
      // Create export URL
      const exportUrl = `/api/data/export?type=${exportType}&format=${format}${dateParams}`;
      
      // For CSV downloads, we need to redirect the browser
      if (format === 'csv') {
        // Get the JWT token from local storage
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Create a hidden form to submit the request with the Authorization header
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = exportUrl;
        form.style.display = 'none';
        
        // Add a hidden field for the token
        const tokenField = document.createElement('input');
        tokenField.type = 'hidden';
        tokenField.name = 'token';
        tokenField.value = token;
        form.appendChild(tokenField);
        
        // Submit the form
        document.body.appendChild(form);
        form.submit();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(form);
        }, 1000);
      } else {
        // For JSON format, use fetch API
        const response = await fetch(exportUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Export failed');
        }
        
        const data = await response.json();
        
        // Create a JSON file for download
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        // Create a link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
      
      setSuccess(`Data typu "${getExportTypeLabel(exportType)}" byla úspěšně exportována`);
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

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setShowCustomDates(value === 'custom');
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Záloha a export dat
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Exportujte data vašeho vinařství, analytické údaje nebo je importujte z předchozí zálohy.
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
          {/* Basic export */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-2">Export dat</h4>
            <p className="text-sm text-gray-500 mb-4">
              Stáhněte si kompletní zálohu všech vašich vín a dalších dat.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleBasicExport}
                disabled={exportLoading}
                className="py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {exportLoading ? 'Exportuji...' : 'Exportovat data'}
              </button>
              
              <button
                onClick={() => setShowAdvancedExport(!showAdvancedExport)}
                className="py-2 px-4 bg-white text-indigo-600 font-medium rounded-md border border-indigo-300 hover:bg-indigo-50"
              >
                {showAdvancedExport ? 'Skrýt pokročilý export' : 'Pokročilý export'}
              </button>
            </div>
          </div>
          
          {/* Advanced export options */}
          {showAdvancedExport && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-base font-medium text-gray-900 mb-2">Pokročilý export dat</h4>
              <p className="text-sm text-gray-500 mb-4">
                Vyberte specifický typ dat k exportu včetně analytických údajů.
              </p>
              
              {/* Export type selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ exportu
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              
              {/* Date range selection (for analytics data only) */}
              {exportType.startsWith('analytics-') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Časové období
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="7days">Posledních 7 dní</option>
                    <option value="30days">Posledních 30 dní</option>
                    <option value="90days">Posledních 90 dní</option>
                    <option value="year">Poslední rok</option>
                    <option value="custom">Vlastní období</option>
                  </select>
                </div>
              )}
              
              {/* Custom date range inputs */}
              {showCustomDates && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Od data
                    </label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do data
                    </label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Format selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formát
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={format === 'json'}
                      onChange={() => setFormat('json')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">JSON</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={() => setFormat('csv')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">CSV</span>
                  </label>
                </div>
              </div>
              
              {/* Advanced export button */}
              <button
                onClick={handleAdvancedExport}
                disabled={exportLoading || (showCustomDates && (!customDateRange.startDate || !customDateRange.endDate))}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:bg-indigo-300"
              >
                {exportLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exportuji...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Exportovat {getExportTypeLabel(exportType)}
                  </>
                )}
              </button>
              
              {/* Export type information */}
              <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                <div className="flex items-center text-gray-700 mb-1">
                  {getExportTypeIcon(exportType)}
                  <span className="ml-2 font-medium">Informace o exportu</span>
                </div>
                <p className="text-gray-500 text-xs">
                  {getExportTypeDescription(exportType)}
                </p>
              </div>
            </div>
          )}

          {/* Import section */}
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

// Helper functions to get labels and descriptions for export types
function getExportTypeLabel(type: string): string {
  switch (type) {
    case 'wines': return 'seznam vín';
    case 'analytics-daily': return 'denní statistiky';
    case 'analytics-regional': return 'regionální statistiky';
    case 'analytics-language': return 'jazykové preference';
    case 'analytics-hourly': return 'rozložení během dne';
    case 'analytics-wines': return 'žebříček vín';
    default: return 'data';
  }
}

function getExportTypeDescription(type: string): string {
  switch (type) {
    case 'wines': 
      return 'Exportuje kompletní seznam vašich vín včetně všech detailů.';
    case 'analytics-daily': 
      return 'Exportuje denní statistiky načítání QR kódů, včetně počtu skenů, unikátních návštěvníků a rozdělení podle zařízení.';
    case 'analytics-regional': 
      return 'Exportuje geografické statistiky o tom, odkud zákazníci skenují vaše QR kódy.';
    case 'analytics-language': 
      return 'Exportuje statistiky o jazykových preferencích zákazníků při skenování QR kódů.';
    case 'analytics-hourly': 
      return 'Exportuje statistiky o tom, v kterou hodinu dne zákazníci nejčastěji skenují QR kódy.';
    case 'analytics-wines': 
      return 'Exportuje žebříček oblíbenosti vašich vín podle počtu naskenovaných QR kódů.';
    default: 
      return 'Exportuje vybraná data ve zvoleném formátu.';
  }
}

function getExportTypeIcon(type: string) {
  switch (type) {
    case 'wines': 
      return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    case 'analytics-daily': 
      return <ChartBarIcon className="h-4 w-4 text-blue-500" />;
    case 'analytics-regional': 
      return <GlobeAltIcon className="h-4 w-4 text-green-500" />;
    case 'analytics-language': 
      return <LanguageIcon className="h-4 w-4 text-indigo-500" />;
    case 'analytics-hourly': 
      return <ClockIcon className="h-4 w-4 text-amber-500" />;
    case 'analytics-wines': 
      return <CalendarIcon className="h-4 w-4 text-red-500" />;
    default: 
      return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
  }
}
