'use client';

import { useState, useEffect } from 'react';
import { useAuth, useRequireAuth } from '@/lib/auth-context';
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
  // Use the auth context to get user info and enforce authentication
  const { user, token } = useRequireAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Fetch API keys when the component mounts
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

    fetchApiKeys();
  }, [user, token]);

  // Create a new API key
  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newKeyName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await authFetch('/api/api-keys', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Delete an API key
  const deleteApiKey = async (keyId: string) => {
    if (!token) return;

    if (!confirm('Opravdu chcete smazat tento API klíč? Tato akce je nevratná.')) {
      return;
    }

    try {
      const response = await authFetch(`/api/api-keys/${keyId}`, token, {
        method: 'DELETE',
      });

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

  // Toggle showing/hiding key
  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('API klíč byl zkopírován do schránky');
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        alert('Nepodařilo se zkopírovat API klíč do schránky');
      });
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nikdy';
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-12 rounded-3xl border border-gray-200/60 shadow-2xl text-center">
            <div className="flex items-center justify-center space-x-4">
              <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl font-medium text-gray-700">Načítání API klíčů...</span>
            </div>
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
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-white/60 rounded-2xl"></div>
          <div className="relative bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-red-200/50">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Chyba</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Management */}
      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <KeyIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Správa API klíčů</h2>
          </div>
        
          {/* Create new API key form */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-white/60 rounded-2xl"></div>
            <div className="relative bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-blue-200/50">
              <form onSubmit={createApiKey}>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-grow">
                    <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-3">
                      Název klíče
                    </label>
                    <input
                      type="text"
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="např. Interní systém, E-shop, apod."
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900 placeholder:text-gray-500"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newKeyName.trim()}
                      className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                        isSubmitting || !newKeyName.trim()
                          ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 hover:shadow-red-500/30'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <KeyIcon className="w-5 h-5" />
                        <span>{isSubmitting ? 'Vytváření...' : 'Vytvořit klíč'}</span>
                        {!isSubmitting && !(!newKeyName.trim()) && (
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Newly created key message */}
          {showNewKey && newlyCreatedKey && (
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-white/60 rounded-2xl"></div>
              <div className="relative bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-green-200/50">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                    <KeyIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Nový API klíč byl vytvořen</h3>
                    <p className="text-green-700 mb-4">Toto je jediný okamžik, kdy uvidíte celý klíč. Uložte si ho někam bezpečně:</p>
                    <div className="flex items-center space-x-3">
                      <code className="flex-1 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-green-200/60 font-mono text-sm text-gray-900 break-all">
                        {newlyCreatedKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedKey)}
                        className="p-3 bg-green-100/80 text-green-700 rounded-2xl hover:bg-green-200/80 transition-colors duration-200"
                        title="Kopírovat do schránky"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewKey(false)}
                    className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100/50 rounded-2xl transition-all duration-200"
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Název
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klíč
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vytvořeno
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poslední použití
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
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

      {/* API Documentation */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
          API Dokumentace
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium text-black mb-2">Autentizace</h3>
            <p className="text-gray-700 mb-3">
              Pro přístup k API je nutné použít API klíč v hlavičce <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">X-API-Key</code>.
            </p>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <pre className="text-xs overflow-x-auto"><code>
{`curl -X GET https://api.etiketa.wine/v1/wines \\
  -H "X-API-Key: vas_api_klic"`}
              </code></pre>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-black mb-2">Dostupné endpointy</h3>
            
            <div className="space-y-4">
              {/* Wines endpoints */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-black">Vína</h4>
                <ul className="space-y-2 mt-2">
                  <li>
                    <div className="flex items-start">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium mr-2">GET</span>
                      <div>
                        <code className="text-sm">/v1/wines</code>
                        <p className="text-xs text-gray-600 mt-1">Seznam všech vašich vín</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium mr-2">GET</span>
                      <div>
                        <code className="text-sm">/v1/wines/:id</code>
                        <p className="text-xs text-gray-600 mt-1">Detail konkrétního vína</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium mr-2">POST</span>
                      <div>
                        <code className="text-sm">/v1/wines</code>
                        <p className="text-xs text-gray-600 mt-1">Vytvoření nového vína</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium mr-2">PUT</span>
                      <div>
                        <code className="text-sm">/v1/wines/:id</code>
                        <p className="text-xs text-gray-600 mt-1">Aktualizace existujícího vína</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* QR Code endpoints */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-black">QR kódy</h4>
                <ul className="space-y-2 mt-2">
                  <li>
                    <div className="flex items-start">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium mr-2">GET</span>
                      <div>
                        <code className="text-sm">/v1/qrcodes/wine/:wineId</code>
                        <p className="text-xs text-gray-600 mt-1">Generování QR kódu pro konkrétní víno</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

                  {/* Analytics endpoints */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/60 to-white/40 rounded-xl"></div>
                    <div className="relative bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200/50">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></div>
                        Analytika
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <span className="bg-green-100/80 text-green-800 px-3 py-1 rounded-xl text-xs font-semibold border border-green-200/50">GET</span>
                          <div className="flex-1">
                            <code className="text-sm font-mono text-gray-800 bg-gray-100/80 px-2 py-1 rounded-lg">/v1/analytics/summary</code>
                            <p className="text-sm text-gray-600 mt-1">Souhrn analytických dat</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="bg-green-100/80 text-green-800 px-3 py-1 rounded-xl text-xs font-semibold border border-green-200/50">GET</span>
                          <div className="flex-1">
                            <code className="text-sm font-mono text-gray-800 bg-gray-100/80 px-2 py-1 rounded-lg">/v1/analytics/wine/:wineId</code>
                            <p className="text-sm text-gray-600 mt-1">Analytická data pro konkrétní víno</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-orange-50/60 rounded-2xl"></div>
              <div className="relative bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-amber-200/50">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Připravujeme</h3>
                    <p className="text-amber-700 leading-relaxed">
                      Pracujeme na rozšíření API a podrobnější dokumentaci. Pokud máte specifické požadavky,
                      kontaktujte nás na <a href="mailto:info@etiketa.wine" className="text-amber-800 underline hover:text-amber-900 font-medium transition-colors duration-200">info@etiketa.wine</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}