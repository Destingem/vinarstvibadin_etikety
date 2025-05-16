"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Wine } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

// Validation schema for wine form
const wineSchema = z.object({
  name: z.string().min(1, { message: 'Název vína je povinný' }),
  vintage: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  batch: z.string().optional().nullable(),
  alcoholContent: z.coerce.number().min(0).max(100).optional().nullable(),
  energyValueKJ: z.coerce.number().min(0).optional().nullable(),
  energyValueKcal: z.coerce.number().min(0).optional().nullable(),
  fat: z.coerce.number().min(0).optional().nullable(),
  saturatedFat: z.coerce.number().min(0).optional().nullable(),
  carbs: z.coerce.number().min(0).optional().nullable(),
  sugars: z.coerce.number().min(0).optional().nullable(),
  protein: z.coerce.number().min(0).optional().nullable(),
  salt: z.coerce.number().min(0).optional().nullable(),
  ingredients: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
  allergens: z.string().optional().nullable(),
  wineRegion: z.string().optional().nullable(),
  wineSubregion: z.string().optional().nullable(),
  wineVillage: z.string().optional().nullable(),
  wineTract: z.string().optional().nullable(),
});

type WineFormData = z.infer<typeof wineSchema>;

interface WineFormProps {
  wine?: Wine;
  isEditing?: boolean;
}

export default function WineForm({ wine, isEditing = false }: WineFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WineFormData>({
    resolver: zodResolver(wineSchema),
    defaultValues: wine ? {
      name: wine.name,
      vintage: wine.vintage || null,
      batch: wine.batch || null,
      alcoholContent: wine.alcoholContent || null,
      energyValueKJ: wine.energyValueKJ || null,
      energyValueKcal: wine.energyValueKcal || null,
      fat: wine.fat || null,
      saturatedFat: wine.saturatedFat || null,
      carbs: wine.carbs || null,
      sugars: wine.sugars || null,
      protein: wine.protein || null,
      salt: wine.salt || null,
      ingredients: wine.ingredients || null,
      additionalInfo: wine.additionalInfo || null,
      allergens: wine.allergens || null,
      wineRegion: wine.wineRegion || null,
      wineSubregion: wine.wineSubregion || null,
      wineVillage: wine.wineVillage || null,
      wineTract: wine.wineTract || null,
    } : {},
  });
  
  // Reset form when wine prop changes
  useEffect(() => {
    if (wine) {
      reset({
        name: wine.name,
        vintage: wine.vintage || null,
        batch: wine.batch || null,
        alcoholContent: wine.alcoholContent || null,
        energyValueKJ: wine.energyValueKJ || null,
        energyValueKcal: wine.energyValueKcal || null,
        fat: wine.fat || null,
        saturatedFat: wine.saturatedFat || null,
        carbs: wine.carbs || null,
        sugars: wine.sugars || null,
        protein: wine.protein || null,
        salt: wine.salt || null,
        ingredients: wine.ingredients || null,
        additionalInfo: wine.additionalInfo || null,
        allergens: wine.allergens || null,
        wineRegion: wine.wineRegion || null,
        wineSubregion: wine.wineSubregion || null,
        wineVillage: wine.wineVillage || null,
        wineTract: wine.wineTract || null,
      });
    }
  }, [wine, reset]);
  
  const onSubmit = async (data: WineFormData) => {
    if (!token) {
      setError('Nejste přihlášeni. Přihlaste se prosím a zkuste to znovu.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing && wine 
        ? `/api/wines/${wine.$id}` 
        : '/api/wines';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await authFetch(url, token, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nastala chyba při ukládání vína');
      }
      
      const result = await response.json();
      
      // Redirect to wine detail or list
      // Use $id which is how Appwrite identifies documents
      if (isEditing) {
        router.push(`/dashboard/wines/${result.wine.$id}`);
      } else {
        router.push(`/dashboard/wines/${result.wine.$id}`);
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při ukládání vína');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {isEditing ? 'Upravit víno' : 'Přidat nové víno'}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Basic Wine Information */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Název vína *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="vintage" className="block text-sm font-medium text-gray-700">
                Ročník
              </label>
              <input
                type="number"
                id="vintage"
                {...register('vintage')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.vintage && (
                <p className="mt-1 text-sm text-red-600">{errors.vintage.message}</p>
              )}
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                Šarže
              </label>
              <input
                type="text"
                id="batch"
                {...register('batch')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.batch && (
                <p className="mt-1 text-sm text-red-600">{errors.batch.message}</p>
              )}
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700">
                Obsah alkoholu (%)
              </label>
              <input
                type="number"
                step="0.1"
                id="alcoholContent"
                {...register('alcoholContent')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.alcoholContent && (
                <p className="mt-1 text-sm text-red-600">{errors.alcoholContent.message}</p>
              )}
            </div>
            
            {/* Nutritional Values */}
            <div className="col-span-2">
              <h4 className="font-medium text-gray-700 mb-3 border-b pb-2">Výživové údaje (na 100 ml)</h4>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="energyValueKJ" className="block text-sm font-medium text-gray-700">
                    Energetická hodnota (kJ)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="energyValueKJ"
                    {...register('energyValueKJ')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="energyValueKcal" className="block text-sm font-medium text-gray-700">
                    Energetická hodnota (kcal)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="energyValueKcal"
                    {...register('energyValueKcal')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="fat" className="block text-sm font-medium text-gray-700">
                    Tuky (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="fat"
                    {...register('fat')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="saturatedFat" className="block text-sm font-medium text-gray-700">
                    Nasycené mastné kyseliny (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="saturatedFat"
                    {...register('saturatedFat')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                    Sacharidy (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="carbs"
                    {...register('carbs')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="sugars" className="block text-sm font-medium text-gray-700">
                    Cukry (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="sugars"
                    {...register('sugars')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
                    Bílkoviny (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="protein"
                    {...register('protein')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="salt" className="block text-sm font-medium text-gray-700">
                    Sůl (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="salt"
                    {...register('salt')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Ingredients */}
            <div className="col-span-2">
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                Složení
              </label>
              <textarea
                id="ingredients"
                rows={3}
                {...register('ingredients')}
                placeholder="Např. Hrozny, antioxidant: oxid siřičitý"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="allergens" className="block text-sm font-medium text-gray-700">
                Alergeny
              </label>
              <textarea
                id="allergens"
                rows={2}
                {...register('allergens')}
                placeholder="Např. Obsahuje siřičitany"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Origin Information */}
            <div className="col-span-2">
              <h4 className="font-medium text-gray-700 mb-3 border-b pb-2">Původ</h4>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="wineRegion" className="block text-sm font-medium text-gray-700">
                    Vinařská oblast
                  </label>
                  <input
                    type="text"
                    id="wineRegion"
                    {...register('wineRegion')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="wineSubregion" className="block text-sm font-medium text-gray-700">
                    Vinařská podoblast
                  </label>
                  <input
                    type="text"
                    id="wineSubregion"
                    {...register('wineSubregion')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="wineVillage" className="block text-sm font-medium text-gray-700">
                    Obec
                  </label>
                  <input
                    type="text"
                    id="wineVillage"
                    {...register('wineVillage')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="wineTract" className="block text-sm font-medium text-gray-700">
                    Trať
                  </label>
                  <input
                    type="text"
                    id="wineTract"
                    {...register('wineTract')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="col-span-2">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                Další informace
              </label>
              <textarea
                id="additionalInfo"
                rows={3}
                {...register('additionalInfo')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Ukládám...' : isEditing ? 'Upravit víno' : 'Přidat víno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}