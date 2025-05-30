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
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-2xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700 rounded-2xl">
          {success}
        </div>
      )}

      <form className="space-y-6">
        {/* Name Field */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
              Název vinařství
            </label>
            <div className="flex gap-3">
              <input
                id="name"
                type="text"
                {...register('name')}
                className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={updateName}
                disabled={isNameSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNameSubmitting ? 'Ukládám...' : 'Uložit'}
              </button>
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        {/* Email Field (read-only) */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 bg-gray-100/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-600 cursor-not-allowed"
              readOnly
            />
            <p className="mt-2 text-xs text-gray-500">
              Změna e-mailu není momentálně podporována.
            </p>
          </div>
        </div>

        {/* Slug Field */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-3">
              Slug pro URL
            </label>
            <div className="flex gap-3">
              <div className="flex flex-1">
                <span className="inline-flex items-center px-4 text-gray-500 bg-gray-100/60 backdrop-blur-sm rounded-l-2xl border border-r-0 border-gray-200/60">
                  /
                </span>
                <input
                  id="slug"
                  type="text"
                  {...register('slug')}
                  className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                />
              </div>
              <button
                type="button"
                onClick={updateSlug}
                disabled={isSlugSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSlugSubmitting ? 'Ukládám...' : 'Uložit'}
              </button>
            </div>
            {errors.slug && (
              <p className="mt-2 text-sm text-red-600">{errors.slug.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Upozornění: Změna slugu ovlivní pouze nově vytvořená vína, existující QR kódy zůstanou funkční.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}