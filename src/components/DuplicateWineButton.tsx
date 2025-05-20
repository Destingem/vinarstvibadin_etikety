"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface DuplicateWineButtonProps {
  wineId: string;
  wineName: string;
}

export default function DuplicateWineButton({ wineId, wineName }: DuplicateWineButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState('');
  const [newVintage, setNewVintage] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { token } = useAuth();
  
  const openModal = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event propagation
    setIsModalOpen(true);
  };
  
  const closeModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsModalOpen(false);
    setNewBatch('');
    setNewVintage(undefined);
    setError(null);
  };
  
  const handleDuplicate = async () => {
    // Verify we have token and proper state before proceeding
    if (!token || !isModalOpen) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authFetch('/api/wines/duplicate', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wineId,
          newBatch,
          newVintage: newVintage,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nastala chyba při kopírování vína');
      }
      
      const data = await response.json();
      
      // Close modal
      closeModal();
      
      // Redirect to the duplicated wine
      router.push(`/dashboard/wines/${data.wine.$id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při kopírování vína');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <button
        type="button"
        onClick={(e) => openModal(e)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg 
          className="-ml-1 mr-2 h-5 w-5 text-gray-500" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
        </svg>
        Duplikovat víno
      </button>
      
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={(e) => closeModal(e)}
            ></div>
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Duplikovat víno
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Zkopíruje víno "{wineName}" a vytvoří nový záznam. Můžete upravit šarži a ročník pro nové víno.
                      </p>
                    </div>
                    
                    {error && (
                      <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md">
                        {error}
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="newBatch" className="block text-sm font-medium text-gray-700">
                          Nová šarže
                        </label>
                        <input 
                          type="text" 
                          id="newBatch" 
                          value={newBatch} 
                          onChange={(e) => setNewBatch(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                          placeholder="Zadejte novou šarži" 
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newVintage" className="block text-sm font-medium text-gray-700">
                          Nový ročník
                        </label>
                        <input 
                          type="number" 
                          id="newVintage" 
                          value={newVintage || ''} 
                          onChange={(e) => setNewVintage(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                          placeholder="Zadejte nový ročník" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Duplikovat
                </button>
                <button
                  type="button"
                  onClick={(e) => closeModal(e)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}