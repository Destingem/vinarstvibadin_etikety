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
    <div className="relative max-w-4xl mx-auto px-3 sm:px-0">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-2xl sm:rounded-3xl"></div>
      <div className="relative bg-white/80 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/60 shadow-2xl">
        
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {isEditing ? 'Upravit víno' : 'Přidat nové víno'}
          </h3>
        </div>
        
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-xl sm:rounded-2xl text-sm sm:text-base">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          
          {/* Basic Wine Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-xl sm:rounded-2xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200/50">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-2 sm:mr-3"></div>
                Základní informace
              </h4>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Název vína *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500 text-sm sm:text-base"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="vintage" className="block text-sm font-medium text-gray-700 mb-2">
                    Ročník
                  </label>
                  <input
                    type="number"
                    id="vintage"
                    {...register('vintage')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                  {errors.vintage && (
                    <p className="mt-1 text-sm text-red-600">{errors.vintage.message}</p>
                  )}
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-2">
                    Šarže
                  </label>
                  <input
                    type="text"
                    id="batch"
                    {...register('batch')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                  {errors.batch && (
                    <p className="mt-1 text-sm text-red-600">{errors.batch.message}</p>
                  )}
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Obsah alkoholu (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="alcoholContent"
                    {...register('alcoholContent')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                  {errors.alcoholContent && (
                    <p className="mt-1 text-sm text-red-600">{errors.alcoholContent.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Values */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Výživové údaje (na 100 ml)
              </h4>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="energyValueKJ" className="block text-sm font-medium text-gray-700 mb-2">
                    Energetická hodnota (kJ)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="energyValueKJ"
                    {...register('energyValueKJ')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="energyValueKcal" className="block text-sm font-medium text-gray-700 mb-2">
                    Energetická hodnota (kcal)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="energyValueKcal"
                    {...register('energyValueKcal')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-2">
                    Tuky (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="fat"
                    {...register('fat')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="saturatedFat" className="block text-sm font-medium text-gray-700 mb-2">
                    Nasycené mastné kyseliny (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="saturatedFat"
                    {...register('saturatedFat')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-2">
                    Sacharidy (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="carbs"
                    {...register('carbs')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="sugars" className="block text-sm font-medium text-gray-700 mb-2">
                    Cukry (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="sugars"
                    {...register('sugars')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-2">
                    Bílkoviny (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="protein"
                    {...register('protein')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="salt" className="block text-sm font-medium text-gray-700 mb-2">
                    Sůl (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="salt"
                    {...register('salt')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Ingredients & Allergens */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Složení a alergeny
              </h4>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                    Složení
                  </label>
                  <textarea
                    id="ingredients"
                    rows={3}
                    {...register('ingredients')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500 resize-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-2">
                    Alergeny
                  </label>
                  <textarea
                    id="allergens"
                    rows={2}
                    {...register('allergens')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Origin Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                Původ
              </h4>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="wineRegion" className="block text-sm font-medium text-gray-700 mb-2">
                    Vinařská oblast
                  </label>
                  <input
                    type="text"
                    id="wineRegion"
                    {...register('wineRegion')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="wineSubregion" className="block text-sm font-medium text-gray-700 mb-2">
                    Vinařská podoblast
                  </label>
                  <input
                    type="text"
                    id="wineSubregion"
                    {...register('wineSubregion')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="wineVillage" className="block text-sm font-medium text-gray-700 mb-2">
                    Obec
                  </label>
                  <input
                    type="text"
                    id="wineVillage"
                    {...register('wineVillage')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="wineTract" className="block text-sm font-medium text-gray-700 mb-2">
                    Trať
                  </label>
                  <input
                    type="text"
                    id="wineTract"
                    {...register('wineTract')}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                Další informace
              </h4>
              
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  Další informace
                </label>
                <textarea
                  id="additionalInfo"
                  rows={3}
                  {...register('additionalInfo')}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500 resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="order-2 sm:order-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl sm:rounded-2xl text-sm font-medium text-gray-700 hover:bg-white/80 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 group relative px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">Ukládám...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">{isEditing ? 'Upravit víno' : 'Přidat víno'}</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}