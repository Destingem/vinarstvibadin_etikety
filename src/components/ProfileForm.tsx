"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { account } from '@/lib/appwrite-client';

const profileSchema = z.object({
  name: z.string().min(1, { message: 'Název vinařství je povinný' }),
  email: z.string().email({ message: 'Zadejte platný email' }),
  slug: z.string().min(1, { message: 'Slug je povinný' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug může obsahovat pouze malá písmena, číslice a pomlčky' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const [isNameSubmitting, setIsNameSubmitting] = useState(false);
  const [isSlugSubmitting, setIsSlugSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('slug', user.slug || '');
    }
  }, [user, setValue]);

  const updateName = async () => {
    if (!user) {
      setError('Nejste přihlášeni');
      return;
    }

    setIsNameSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const name = getValues('name');
      
      // First try to update the name directly using client-side API
      try {
        await account.updateName(name);
        console.log('Name updated successfully using client-side API');
        
        // Now also update in server preferences for backup/compatibility
        const response = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            name,
            email: user.email,
            slug: user.slug || '',
            updateField: 'name'
          }),
        });

        if (!response.ok) {
          console.warn('Server-side profile update failed, but client-side succeeded');
          // Still show success since the primary update worked
          setSuccess('Jméno bylo úspěšně aktualizováno');
          
          // Update local storage manually
          const updatedUser = {
            ...user,
            name: name
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Force refresh to update context
          window.location.reload();
          return;
        }

        const result = await response.json();
        setSuccess(result.message || 'Jméno bylo úspěšně aktualizováno');
        
        // Update local storage with new user data
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          // Force refresh the page to update context with new user data
          window.location.reload();
        }
      } catch (clientError) {
        console.error('Client-side name update failed, falling back to server method:', clientError);
        
        // Fall back to server method if client-side fails
        const response = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            name,
            email: user.email,
            slug: user.slug || '',
            updateField: 'name'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Aktualizace jména selhala');
        }

        const result = await response.json();
        setSuccess(result.message || 'Jméno bylo úspěšně aktualizováno');
        
        // Update local storage with new user data
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          // Force refresh the page to update context with new user data
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při aktualizaci jména');
    } finally {
      setIsNameSubmitting(false);
    }
  };

  const updateSlug = async () => {
    if (!user) {
      setError('Nejste přihlášeni');
      return;
    }

    setIsSlugSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const slug = getValues('slug');
      
      // Try to update directly via client-side prefs API
      try {
        // First get current preferences
        const currentPrefs = await account.getPrefs();
        
        // Update slug in preferences
        const updatedPrefs = {
          ...currentPrefs,
          slug: slug
        };
        
        // Save updated preferences
        await account.updatePrefs(updatedPrefs);
        console.log('Slug updated successfully using client-side API');
        setSuccess('Slug byl úspěšně aktualizován');
        
        // Update local storage manually
        const updatedUser = {
          ...user,
          slug: slug
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Force refresh to update context
        window.location.reload();
      } catch (clientError) {
        console.error('Client-side slug update failed, falling back to server method:', clientError);
        
        // Fall back to server method
        const response = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            slug,
            updateField: 'slug'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Aktualizace slugu selhala');
        }

        const result = await response.json();
        setSuccess(result.message || 'Slug byl úspěšně aktualizován');
        
        // Update local storage with new user data
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          // Force refresh the page to update context with new user data
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při aktualizaci slugu');
    } finally {
      setIsSlugSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Informace o vinařství
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Upravte základní údaje o vašem vinařství. Upozornění: Změna slugu ovlivní pouze nově vytvořená vína.
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

        <form className="space-y-8">
          {/* Name Field */}
          <div className="border-b border-gray-200 pb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Název vinařství
              </label>
              <div className="flex">
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <button
                  type="button"
                  onClick={updateName}
                  disabled={isNameSubmitting}
                  className="ml-3 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {isNameSubmitting ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Email Field (read-only as we're not implementing email change) */}
          <div className="border-b border-gray-200 pb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black bg-gray-100"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                Změna e-mailu není momentálně podporována.
              </p>
            </div>
          </div>

          {/* Slug Field */}
          <div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug pro URL
              </label>
              <div className="flex">
                <div className="flex flex-1">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 rounded-l-md border border-r-0 border-gray-300">
                    /
                  </span>
                  <input
                    id="slug"
                    type="text"
                    {...register('slug')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={updateSlug}
                  disabled={isSlugSubmitting}
                  className="ml-3 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {isSlugSubmitting ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Upozornění: Změna slugu ovlivní pouze nově vytvořená vína, existující QR kódy zůstanou funkční.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}