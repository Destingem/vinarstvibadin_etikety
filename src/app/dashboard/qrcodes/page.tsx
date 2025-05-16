"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface Wine {
  id: string; // This will be $id from Appwrite, but kept as 'id' for backward compatibility
  name: string;
  vintage?: number | null;
  batch?: string | null;
}

interface QRCodeData {
  qrCode: string;
  url: string;
  wine: Wine;
}

export default function QRCodesPage() {
  const searchParams = useSearchParams();
  const wineId = searchParams.get('wineId');
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [selectedWineId, setSelectedWineId] = useState<string | null>(wineId);
  
  // Fetch wines list
  useEffect(() => {
    const fetchWines = async () => {
      if (!token) return;
      
      try {
        const response = await authFetch('/api/wines', token);
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst seznam vín');
        }
        
        const data = await response.json();
        setWines(data.wines);
      } catch (err: any) {
        setError(err.message || 'Nastala chyba při načítání vín');
      }
    };
    
    fetchWines();
  }, [token]);
  
  // Generate QR code when wine is selected
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
          throw new Error(errorData.message || 'Nepodařilo se vygenerovat QR kód');
        }
        
        const data = await response.json();
        setQrCodeData(data);
      } catch (err: any) {
        setError(err.message || 'Nastala chyba při generování QR kódu');
      } finally {
        setLoading(false);
      }
    };
    
    generateQRCode();
  }, [selectedWineId, token]);
  
  // Handle wine selection
  const handleWineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedWineId(value);
  };
  
  // Download QR code
  const handleDownload = () => {
    if (!qrCodeData) return;
    
    const wine = qrCodeData.wine;
    let fileName = wine.name.toLowerCase().replace(/\s+/g, '_');
    
    if (wine.vintage) {
      fileName += `_${wine.vintage}`;
    }
    
    if (wine.batch) {
      fileName += `_${wine.batch.replace(/\s+/g, '_').replace(/[\/\\]/g, '-')}`;
    }
    
    fileName += '.png';
    
    const link = document.createElement('a');
    link.href = qrCodeData.qrCode;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">QR kódy</h1>
          <p className="mt-2 text-sm text-gray-700">
            Vygenerujte QR kódy pro vaše vína, které můžete použít na etiketách.
          </p>
        </div>
      </div>
      
      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Generování QR kódu
            </h3>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Chyba
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="wine" className="block text-sm font-medium text-gray-700">
                  Vyberte víno pro generování QR kódu
                </label>
                <div className="mt-1">
                  <select
                    id="wine"
                    name="wine"
                    value={selectedWineId || ''}
                    onChange={handleWineChange}
                    className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">-- Vyberte víno --</option>
                    {wines.map((wine) => (
                      <option key={wine.$id} value={wine.$id}>
                        {wine.name}
                        {wine.vintage ? ` (${wine.vintage})` : ''}
                        {wine.batch ? ` - ${wine.batch}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                {wines.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-gray-500">
                    Zatím nemáte přidána žádná vína.{' '}
                    <Link
                      href="/dashboard/wines/new"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Přidat víno
                    </Link>
                  </p>
                )}
              </div>
            </div>
            
            {loading && (
              <div className="mt-6 flex justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            {qrCodeData && !loading && (
              <div className="mt-6">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-shrink-0 w-64 h-64 bg-white flex items-center justify-center p-2 rounded border border-gray-200 mx-auto md:mx-0">
                      <Image
                        src={qrCodeData.qrCode}
                        alt={`QR kód pro víno ${qrCodeData.wine.name}`}
                        width={250}
                        height={250}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {qrCodeData.wine.name}
                        {qrCodeData.wine.vintage ? ` (${qrCodeData.wine.vintage})` : ''}
                        {qrCodeData.wine.batch ? ` - ${qrCodeData.wine.batch}` : ''}
                      </h4>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">
                          QR kód URL:
                        </p>
                        <a
                          href={qrCodeData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-900 break-all"
                        >
                          {qrCodeData.url}
                        </a>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Stáhnout QR kód
                        </button>
                        
                        <a
                          href={qrCodeData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                          Otevřít odkaz
                        </a>
                        
                        <Link
                          href={`/dashboard/wines/${qrCodeData.wine.id}`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                          Upravit víno
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Návod k použití
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Stáhněte QR kód kliknutím na tlačítko "Stáhnout QR kód"</li>
                    <li>Umístěte QR kód na etiketu vašeho vína</li>
                    <li>Doporučujeme používat QR kód o velikosti alespoň 2 cm x 2 cm pro snadné naskenování</li>
                    <li>Otestujte QR kód mobilním telefonem před finálním tiskem etiket</li>
                  </ul>
                </div>
              </div>
            )}
            
            {!selectedWineId && !loading && (
              <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      QR kód není vygenerován
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Vyberte víno ze seznamu pro vygenerování QR kódu.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}