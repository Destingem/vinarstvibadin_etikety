'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { KeyIcon, TrashIcon, DocumentTextIcon, ClipboardIcon, ClockIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
};

export default function ClientApiDashboard() {
  const { user, token } = useRequireAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [usageStats, setUsageStats] = useState<any>(null);

  useEffect(() => {
    async function fetchApiKeys() {
      if (!user || !token) return;

      try {
        setLoading(true);
        const response = await authFetch('/api/api-keys', token);
        if (response.ok) {
          const data = await response.json();
          setApiKeys(data.apiKeys);
        } else {
          setError('Nepodařilo se načíst API klíče');
        }
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Nastala chyba při načítání API klíčů');
      } finally {
        setLoading(false);
      }
    }

    async function fetchUsageStats() {
      if (!user || !token) return;
      try {
        const response = await authFetch('/api/analytics/api-usage?range=30days', token);
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
  }, [user, token]);

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newKeyName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await authFetch('/api/api-keys', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys([...apiKeys, data.apiKey]);
        setNewKeyName('');
        setNewlyCreatedKey(data.apiKey.key);
        setShowNewKey(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nepodařilo se vytvořit API klíč');
      }
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('Nastala chyba při vytváření API klíče');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!token) return;
    if (!confirm('Opravdu chcete smazat tento API klíč? Tato akce je nevratná.')) return;

    try {
      const response = await authFetch(`/api/api-keys/${keyId}`, token, { method: 'DELETE' });
      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nepodařilo se smazat API klíč');
      }
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Nastala chyba při mazání API klíče');
    }
  };

  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('API klíč byl zkopírován do schránky'))
      .catch(() => alert('Nepodařilo se zkopírovat API klíč do schránky'));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nikdy';
    return new Date(dateString).toLocaleString('cs-CZ');
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="flex items-center justify-center space-x-4">
            <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-medium text-gray-700">Načítání API klíčů...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          API přístup
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Zde můžete spravovat své API klíče pro přístup k systému Etiketa.wine pomocí REST API.
          API umožňuje integraci s vašimi vlastními systémy pro správu vín, etiket a QR kódů.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Chyba</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Key Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <KeyIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Správa API klíčů</h2>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Create new API key form */}
          <form onSubmit={createApiKey} className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-grow">
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Název klíče
                </label>
                <input
                  type="text"
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="např. Interní systém, E-shop, apod."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newKeyName.trim()}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isSubmitting || !newKeyName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Vytváření...' : 'Vytvořit klíč'}
                </button>
              </div>
            </div>
          </form>

          {/* Newly created key message */}
          {showNewKey && newlyCreatedKey && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <KeyIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">Nový API klíč byl vytvořen</h3>
                  <p className="mt-1 text-sm text-green-700 mb-3">
                    Toto je jediný okamžik, kdy uvidíte celý klíč. Uložte si ho někam bezpečně:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                      {newlyCreatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      title="Kopírovat do schránky"
                    >
                      <ClipboardIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewKey(false)}
                  className="text-green-400 hover:text-green-600"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* API keys list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Vaše API klíče</h3>
            
            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-sm">Zatím nemáte žádné API klíče. Vytvořte si svůj první klíč pomocí formuláře výše.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klíč</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vytvořeno</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poslední použití</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {key.name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <code className="font-mono bg-gray-50 px-2 py-1 rounded text-xs">
                              {showKeys[key.id] ? key.key : `${key.key.substring(0, 10)}...`}
                            </code>
                            <button
                              onClick={() => toggleShowKey(key.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title={showKeys[key.id] ? "Skrýt klíč" : "Zobrazit klíč"}
                            >
                              {showKeys[key.id] ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title="Kopírovat do schránky"
                            >
                              <ClipboardIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(key.createdAt)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(key.lastUsedAt)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => deleteApiKey(key.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Smazat klíč"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Usage Statistics */}
      {usageStats && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">API Statistiky (posledních 30 dní)</h2>
          </div>
          
          <div className="px-6 py-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-blue-600">{usageStats.summary.totalRequests.toLocaleString()}</div>
                </div>
                <p className="text-sm text-blue-600">Celkem požadavků</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-green-600">{usageStats.summary.successRate}%</div>
                </div>
                <p className="text-sm text-green-600">Úspěšnost</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-purple-600">{usageStats.summary.averageResponseTime}ms</div>
                </div>
                <p className="text-sm text-purple-600">Průměrná odezva</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-red-600">{usageStats.summary.errorRequests.toLocaleString()}</div>
                </div>
                <p className="text-sm text-red-600">Chyby</p>
              </div>
            </div>

            {/* Top Endpoints */}
            {usageStats.endpoints && usageStats.endpoints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Nejpoužívanější endpointy</h3>
                <div className="space-y-2">
                  {usageStats.endpoints.slice(0, 5).map((endpoint: any, index: number) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between bg-gray-50 rounded p-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
                        <code className="text-sm font-mono text-gray-800">{endpoint.endpoint}</code>
                        <span className="text-xs text-gray-600">{endpoint.averageResponseTime}ms avg</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{endpoint.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">
                          {endpoint.successCount} úspěch / {endpoint.errorCount} chyb
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Documentation */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">API Dokumentace</h2>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-8">
          {/* Authentication */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔐 Autentizace</h3>
            <p className="text-gray-700 mb-4">
              Pro přístup k API můžete použít API klíč dvěma způsoby:
            </p>
            
            <div className="space-y-4">
              {/* Method 1: Header */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">1. V hlavičce požadavku (doporučeno)</h4>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Příklad:</span>
                    <button
                      onClick={() => copyToClipboard('curl -X GET "https://etiketa.wine/api/v1/wines" \\\n  -H "X-API-Key: vas_api_klic" \\\n  -H "Content-Type: application/json"')}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Kopírovat
                    </button>
                  </div>
                  <pre className="text-sm overflow-x-auto text-gray-800 font-mono">
{`curl -X GET "https://etiketa.wine/api/v1/wines" \\
  -H "X-API-Key: vas_api_klic" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>

              {/* Method 2: URL Parameter */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">2. V URL parametru (pro rychlé testování)</h4>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Příklad:</span>
                    <button
                      onClick={() => copyToClipboard('https://etiketa.wine/api/v1/wines?key=vas_api_klic&page=1&limit=10')}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Kopírovat
                    </button>
                  </div>
                  <pre className="text-sm overflow-x-auto text-gray-800 font-mono">
{`https://etiketa.wine/api/v1/wines?key=vas_api_klic&page=1&limit=10`}
                  </pre>
                </div>
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ <strong>Pozor:</strong> Používejte URL parametr pouze pro testování. V produkci doporučujeme hlavičku X-API-Key.
                </p>
              </div>
            </div>
          </div>

          {/* Available Endpoints */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Dostupné endpointy</h3>
            <div className="space-y-6">
              
              {/* Wines API */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🍷 Wines API</h4>
                <div className="space-y-4">
                  
                  {/* GET /api/v1/wines */}
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-2">GET</span>
                      <code className="text-sm font-mono">/api/v1/wines</code>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Získá seznam všech vín uživatele s podporou stránkování</p>
                    <div className="text-xs text-gray-600">
                      <strong>Parametry:</strong> page (číslo stránky), limit (počet položek na stránku, max 100)
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => copyToClipboard('curl -X GET "https://etiketa.wine/api/v1/wines?page=1&limit=10&key=vas_api_klic"')}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Kopírovat příklad
                      </button>
                    </div>
                  </div>

                  {/* GET /api/v1/wines/:id */}
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-2">GET</span>
                      <code className="text-sm font-mono">/api/v1/wines/:id</code>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Získá detail konkrétního vína podle ID</p>
                    <div className="mt-2">
                      <button
                        onClick={() => copyToClipboard('curl -X GET "https://etiketa.wine/api/v1/wines/ID_VINA?key=vas_api_klic"')}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Kopírovat příklad
                      </button>
                    </div>
                  </div>

                  {/* POST /api/v1/wines */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono mr-2">POST</span>
                      <code className="text-sm font-mono">/api/v1/wines</code>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Vytvoří nové víno</p>
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Povinné pole:</strong> name, vintage, batch<br/>
                      <strong>Volitelné:</strong> alcoholContent, energyValueKJ, energyValueKcal, fat, saturatedFat, carbs, sugars, protein, salt, ingredients, additionalInfo, allergens, wineRegion, wineSubregion, wineVillage, wineTract, wineryName
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => copyToClipboard('curl -X POST "https://etiketa.wine/api/v1/wines" \\\n  -H "X-API-Key: vas_api_klic" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name": "Riesling", "vintage": 2023, "batch": "A001", "alcoholContent": 12.5}\'')}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Kopírovat příklad
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* QR Codes API */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🔗 QR Codes API</h4>
                <div className="space-y-4">
                  
                  {/* GET /api/v1/qrcodes/wine/:wineId */}
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-2">GET</span>
                      <code className="text-sm font-mono">/api/v1/qrcodes/wine/:wineId</code>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Vygeneruje QR kód pro konkrétní víno ve formátu SVG</p>
                    <div className="text-xs text-gray-600">
                      <strong>Parametry:</strong> size (velikost QR kódu, výchozí 200), format (svg/png, výchozí svg)
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => copyToClipboard('curl -X GET "https://etiketa.wine/api/v1/qrcodes/wine/ID_VINA?size=300&format=svg&key=vas_api_klic"')}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Kopírovat příklad
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Analytics API */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">📊 Analytics API</h4>
                <div className="space-y-4">
                  
                  {/* GET /api/v1/analytics/summary */}
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-2">GET</span>
                      <code className="text-sm font-mono">/api/v1/analytics/summary</code>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Získá souhrnné analytické údaje pro všechna vína uživatele</p>
                    <div className="text-xs text-gray-600">
                      <strong>Parametry:</strong> days (počet dní zpět, výchozí 30)
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => copyToClipboard('curl -X GET "https://etiketa.wine/api/v1/analytics/summary?days=7&key=vas_api_klic"')}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Kopírovat příklad
                      </button>
                    </div>
                  </div>

                  {/* GET /api/v1/analytics/wine/:wineId */}
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-2">GET</span>
                      <code className="text-sm font-mono">/api/v1/analytics/wine/:wineId</code>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Získá detailní analytické údaje pro konkrétní víno</p>
                    <div className="text-xs text-gray-600">
                      <strong>Parametry:</strong> days (počet dní zpět, výchozí 30)
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => copyToClipboard('curl -X GET "https://etiketa.wine/api/v1/analytics/wine/ID_VINA?days=30&key=vas_api_klic"')}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Kopírovat příklad
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Response Format */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Formát odpovědi</h3>
            <p className="text-gray-700 mb-3">
              Všechny API odpovědi jsou ve formátu JSON. Struktura úspěšné odpovědi:
            </p>
            <div className="bg-gray-50 p-3 rounded border">
              <pre className="text-sm overflow-x-auto text-gray-800 font-mono">
{`{
  "success": true,
  "data": {
    // Vlastní data odpovědi
  },
  "pagination": {  // Pouze u stránkovaných odpovědí
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}`}
              </pre>
            </div>
            
            <p className="text-gray-700 mt-4 mb-3">Struktura chybové odpovědi:</p>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <pre className="text-sm overflow-x-auto text-gray-800 font-mono">
{`{
  "success": false,
  "error": "Popis chyby",
  "code": "ERROR_CODE"
}`}
              </pre>
            </div>
          </div>

          {/* Rate Limits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⏱️ Limity požadavků</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800">Základní účet</h4>
                  <p className="text-sm text-blue-700">60 požadavků za hodinu</p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Premium účet</h4>
                  <p className="text-sm text-blue-700">300 požadavků za hodinu</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-3">
                Při překročení limitu obdržíte HTTP status 429. Hlavičky odpovědi obsahují informace o limitu:
                <code className="bg-blue-100 px-1 py-0.5 rounded text-xs ml-1">X-RateLimit-Limit</code>,
                <code className="bg-blue-100 px-1 py-0.5 rounded text-xs ml-1">X-RateLimit-Remaining</code>,
                <code className="bg-blue-100 px-1 py-0.5 rounded text-xs ml-1">X-RateLimit-Reset</code>
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <ClockIcon className="h-6 w-6 text-amber-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-amber-800 mb-1">Potřebujete pomoc?</h3>
                <p className="text-amber-700 mb-3">
                  Pokud máte specifické požadavky nebo potřebujete pomoc s integrací,
                  kontaktujte nás na <a href="mailto:info@etiketa.wine" className="text-amber-800 underline hover:text-amber-900 font-medium">info@etiketa.wine</a>.
                </p>
                <div className="space-y-2">
                  <div className="p-2 bg-amber-100 rounded border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Tip:</strong> Pro testování API doporučujeme použít nástroje jako Postman, Insomnia nebo curl.
                    </p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Postman Collection:</strong> Připravujeme předpřipravenou kolekci pro Postman s vašimi API klíči.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}