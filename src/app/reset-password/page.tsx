"use client";

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Heslo musí mít alespoň 6 znaků' }),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Hesla se neshodují",
  path: ["passwordConfirm"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Get userId and secret from URL params
    const userIdParam = searchParams.get('userId');
    const secretParam = searchParams.get('secret');
    
    if (!userIdParam || !secretParam) {
      setError('Neplatný odkaz pro obnovení hesla. Zkontrolujte URL nebo požádejte o nový odkaz.');
      return;
    }
    
    setUserId(userIdParam);
    setSecret(secretParam);
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!userId || !secret) {
      setError('Chybí údaje pro obnovení hesla');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          secret,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Nastala chyba při změně hesla');
      }

      setSuccess(result.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Nastala chyba při změně hesla');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header Text */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
          Obnovení hesla
        </h2>
        <p className="text-lg text-gray-600 font-light">
          Zadejte své nové heslo
        </p>
      </div>

      {/* Reset Password Form */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-2xl">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700 rounded-2xl">
              {success}
              <p className="text-sm mt-2">Za chvíli budete přesměrováni na přihlášení...</p>
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nové heslo
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                  Potvrdit heslo
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  {...register('passwordConfirm')}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500"
                  placeholder="••••••••"
                />
                {errors.passwordConfirm && (
                  <p className="text-sm text-red-600 mt-1">{errors.passwordConfirm.message}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !userId || !secret}
                className="group relative w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Měním heslo...</span>
                    </>
                  ) : (
                    <>
                      <span>Změnit heslo</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Back to Login Link */}
      <div className="mt-8 text-center">
        <Link 
          href="/login" 
          className="text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
        >
          ← Zpět na přihlášení
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Ambient Background - Same as main page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        
        {/* Floating red orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-100/60 to-red-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-l from-red-200/50 to-red-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-gradient-to-br from-red-150/40 to-red-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.1) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-20 backdrop-blur-xl border-b border-red-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl blur-sm opacity-75"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                etiketa.wine
              </h1>
            </Link>
            <div className="text-sm text-gray-600">
              <span>powered by</span>
              <a 
                href="https://vinokod.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
              >
                vinokod.cz
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Obnovení hesla
              </h2>
              <p className="text-lg text-gray-600 font-light">
                Načítání...
              </p>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-20 backdrop-blur-xl border-t border-gray-200/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <span>&copy; {new Date().getFullYear()} etiketa.wine</span>
            <span className="mx-3 text-gray-400">•</span>
            <a 
              href="https://vinokod.cz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-red-600 hover:text-red-700 transition-colors duration-300 font-medium"
            >
              Více na vinokod.cz
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}