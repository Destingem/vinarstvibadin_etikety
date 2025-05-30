"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface User {
  $id: string;
  email: string;
  name: string;
  status: boolean;
  registration: string;
  emailVerification: boolean;
}

interface Membership {
  $id: string;
  appwriteUserId: string;
  plan: string;
  wineLimit: number;
  currentWineCount: number;
  expiresAt: string;
  isActive: boolean;
  resetYear: number;
  $createdAt?: string;
  $updatedAt?: string;
  user?: {
    email: string;
    name: string;
  };
}

const MEMBERSHIP_PLANS = {
  STANDARD: { wineLimit: 20, price: '690 Kč/rok', description: 'Do 20 šarží' },
  PLUS: { wineLimit: 50, price: '1 490 Kč/rok', description: 'Do 50 šarží' },
  NEOMEZENĚ: { wineLimit: -1, price: '6 990 Kč/rok', description: 'Neomezeně šarží' },
  ENTERPRISE: { wineLimit: -1, price: 'Na dotaz', description: 'Individuálně' }
};

const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

export default function AdminPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'memberships' | 'demo'>('memberships');
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('STANDARD');

  // Check if user is admin
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    if (!isAdmin || !token) return;
    
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchMemberships();
    }
  }, [activeTab, isAdmin, token]);

  const fetchUsers = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/users', token);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/memberships', token);
      if (response.ok) {
        const data = await response.json();
        setMemberships(data.memberships || []);
      } else {
        console.error('Failed to fetch memberships:', response.status);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMembership = async () => {
    if (!selectedUser || !selectedPlan || !token) return;

    try {
      const response = await authFetch('/api/admin/memberships', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appwriteUserId: selectedUser,
          plan: selectedPlan
        })
      });

      if (response.ok) {
        fetchMemberships();
        setSelectedUser('');
        alert('Členství bylo úspěšně vytvořeno!');
      } else {
        const errorData = await response.json();
        alert(`Chyba při vytváření členství: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating membership:', error);
      alert('Chyba při vytváření členství');
    }
  };

  const toggleMembershipStatus = async (membershipId: string, currentStatus: boolean) => {
    if (!token) return;
    
    try {
      const response = await authFetch(`/api/admin/memberships/${membershipId}`, token, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchMemberships();
      } else {
        const errorData = await response.json();
        alert(`Chyba při změně stavu členství: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling membership status:', error);
      alert('Chyba při změně stavu členství');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Přístup odepřen</h1>
          <p className="mt-2 text-gray-600">Nemáte oprávnění k přístupu do administrace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administrace</h1>
        <p className="mt-2 text-gray-600">Správa uživatelů a členství</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('memberships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'memberships'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Členství
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Uživatelé
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'demo'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Demo účet
          </button>
        </nav>
      </div>

      {activeTab === 'memberships' && (
        <div className="space-y-6">
          {/* Create membership form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Vytvořit nové členství</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uživatel
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Vyberte uživatele</option>
                  {users.map((user) => (
                    <option key={user.$id} value={user.$id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarif
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => (
                    <option key={key} value={key}>
                      {key} - {plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={createMembership}
                  disabled={!selectedUser || !selectedPlan}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vytvořit členství
                </button>
              </div>
            </div>
          </div>

          {/* Memberships list */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Aktivní členství</h2>
            </div>
            {loading ? (
              <div className="p-6 text-center">Načítání...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uživatel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Využití
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platnost do
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stav
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akce
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberships.map((membership) => (
                      <tr key={membership.$id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {membership.user?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {membership.user?.email || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {membership.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            if (membership.wineLimit === -1) return `${membership.currentWineCount} / ∞`;
                            
                            // Calculate cumulative limit based on membership age
                            const currentYear = new Date().getFullYear();
                            const membershipYear = membership.$createdAt 
                              ? new Date(membership.$createdAt).getFullYear()
                              : currentYear;
                            const yearsSinceStart = Math.max(1, currentYear - membershipYear + 1);
                            const cumulativeLimit = membership.wineLimit * yearsSinceStart;
                            
                            return `${membership.currentWineCount} / ${cumulativeLimit} (${membership.wineLimit}/rok × ${yearsSinceStart})`;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(membership.expiresAt).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            membership.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {membership.isActive ? 'Aktivní' : 'Neaktivní'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleMembershipStatus(membership.$id!, membership.isActive)}
                            className={`text-sm px-3 py-1 rounded ${
                              membership.isActive 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {membership.isActive ? 'Deaktivovat' : 'Aktivovat'}
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
      )}

      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Všichni uživatelé</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center">Načítání...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jméno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email ověřen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.$id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status ? 'Aktivní' : 'Neaktivní'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.registration).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.emailVerification ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.emailVerification ? 'Ověřen' : 'Neověřen'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'demo' && (
        <div className="space-y-6">
          {/* Demo Account Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Demo účet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-2">Přihlašovací údaje</h3>
                  <div className="space-y-2 text-sm text-orange-700">
                    <p><strong>Email:</strong> demo@etiketa.wine</p>
                    <p><strong>Heslo:</strong> demo123456</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Vlastnosti demo účtu</h3>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Neomezené členství (DEMO plán)</li>
                    <li>• Automatický reset každou hodinu</li>
                    <li>• Přístup ke všem funkcím</li>
                    <li>• Označení "DEMO ÚČET" v UI</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Reset funkce</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Demo účet se automaticky resetuje každou hodinu. Během resetu se:
                  </p>
                  <ul className="space-y-1 text-sm text-green-700 mb-4">
                    <li>• Smažou všechna vína</li>
                    <li>• Resetuje počítadlo vín na 0</li>
                    <li>• Zachová členství</li>
                  </ul>
                  <button
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    onClick={async () => {
                      if (confirm('Opravdu chcete resetovat demo účet?')) {
                        try {
                          const response = await fetch('/api/cron/demo-reset', {
                            method: 'POST'
                          });
                          if (response.ok) {
                            const result = await response.json();
                            alert(`Demo účet byl úspěšně resetován! Smazáno ${result.details?.deletedWines || 0} vín.`);
                          } else {
                            const error = await response.json();
                            alert(`Chyba: ${error.message || error.error}`);
                          }
                        } catch (error) {
                          alert('Chyba při resetování demo účtu');
                        }
                      }
                    }}
                  >
                    Resetovat demo účet nyní
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cron Job Setup Instructions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Nastavení automatického resetu</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 mb-4">
                Pro automatický hodinový reset demo účtu nastavte cron service:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Vercel Cron (doporučeno):</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    # vercel.json<br/>
                    {`{`}<br/>
                    &nbsp;&nbsp;"crons": [{`{`}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"path": "/api/cron/demo-reset",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"schedule": "0 * * * *"<br/>
                    &nbsp;&nbsp;{`}`}]<br/>
                    {`}`}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Manuální cron job:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    # Spustit každou hodinu<br/>
                    0 * * * * curl -X GET https://yourdomain.com/api/cron/demo-reset
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-2 mt-4">Vyžaduje environment variable:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><code>DEMO_USER_ID</code> - ID demo uživatele v Appwrite</li>
              </ul>
              
              <p className="text-sm text-gray-500 mt-4">
                <strong>Poznámka:</strong> Endpoint /api/cron/demo-reset je veřejně přístupný bez autentifikace.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}