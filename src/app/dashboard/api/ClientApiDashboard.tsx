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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-black mb-2">API přístup</h1>
        <p className="text-gray-800">
          Zde můžete spravovat své API klíče pro přístup k systému Etiketa.wine pomocí REST API.
          API umožňuje integraci s vašimi vlastními systémy pro správu vín, etiket a QR kódů.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* API Key Management */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Správa API klíčů</h2>
        
        {/* Create new API key form */}
        <form onSubmit={createApiKey} className="mb-6 border-b border-gray-200 pb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                Název klíče
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="např. Interní systém, E-shop, apod."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting || !newKeyName.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Vytvořit klíč
              </button>
            </div>
          </div>
        </form>

        {/* Newly created key message */}
        {showNewKey && newlyCreatedKey && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <KeyIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Nový API klíč byl vytvořen</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p className="mb-1">Toto je jediný okamžik, kdy uvidíte celý klíč. Uložte si ho někam bezpečně:</p>
                  <div className="flex items-center">
                    <code className="bg-white px-2 py-1 rounded border border-green-200 font-mono text-sm break-all">
                      {newlyCreatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="ml-2 p-1 text-green-700 hover:text-green-800"
                      title="Kopírovat do schránky"
                    >
                      <ClipboardIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowNewKey(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                  >
                    <span className="sr-only">Zavřít</span>
                    <span className="h-5 w-5" aria-hidden="true">×</span>
                  </button>
                </div>
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
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-black">Analytika</h4>
                <ul className="space-y-2 mt-2">
                  <li>
                    <div className="flex items-start">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium mr-2">GET</span>
                      <div>
                        <code className="text-sm">/v1/analytics/summary</code>
                        <p className="text-xs text-gray-600 mt-1">Souhrn analytických dat</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium mr-2">GET</span>
                      <div>
                        <code className="text-sm">/v1/analytics/wine/:wineId</code>
                        <p className="text-xs text-gray-600 mt-1">Analytická data pro konkrétní víno</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Připravujeme</h3>
              <p className="mt-1 text-sm text-blue-700">
                Pracujeme na rozšíření API a podrobnější dokumentaci. Pokud máte specifické požadavky,
                kontaktujte nás na <a href="mailto:info@etiketa.wine" className="underline hover:text-blue-800">info@etiketa.wine</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}