"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { account } from '@/lib/appwrite-client';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Současné heslo je povinné' }),
  newPassword: z.string().min(6, { message: 'Heslo musí mít alespoň 6 znaků' }),
  confirmPassword: z.string().min(1, { message: 'Potvrzení hesla je povinné' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export default function PasswordChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    if (!user) {
      setError('Nejste přihlášeni');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // First try to update password directly using client-side API
      try {
        await account.updatePassword(data.newPassword, data.currentPassword);
        console.log('Password updated successfully using client-side API');
        reset();
        setSuccess('Heslo bylo úspěšně změněno');
      } catch (clientError) {
        console.error('Client-side password update failed, falling back to server method:', clientError);
        
        // Fall back to server method if client-side fails
        const response = await fetch('/api/auth/password-change', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Změna hesla selhala');
        }

        reset();
        setSuccess('Heslo bylo úspěšně změněno');
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při změně hesla');
    } finally {
      setIsSubmitting(false);
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-3">
              Současné heslo
            </label>
            <input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
              placeholder="••••••••"
            />
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>
        </div>

        {/* New Password */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-3">
              Nové heslo
            </label>
            <input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Heslo musí mít alespoň 6 znaků.
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
              Potvrdit nové heslo
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Měním heslo...</span>
              </span>
            ) : (
              'Změnit heslo'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
