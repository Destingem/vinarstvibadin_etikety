"use client";

import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Soucasne heslo je povinne' }),
    newPassword: z.string().min(6, { message: 'Heslo musi mit alespon 6 znaku' }),
    confirmPassword: z.string().min(1, { message: 'Potvrzeni hesla je povinne' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Hesla se neshoduji',
    path: ['confirmPassword'],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

function SurfaceMessage({
  tone,
  children,
}: {
  tone: 'error' | 'success';
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {children}
    </div>
  );
}

export default function PasswordChangeForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setError('Nejste prihlaseni');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/password-change', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Zmena hesla selhala');
      }

      reset();
      setSuccess(result.message || 'Heslo bylo uspesne zmeneno');
    } catch (err: any) {
      setError(err.message || 'Nastala chyba pri zmene hesla');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,249,243,0.98),rgba(248,239,232,0.92))] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,14rem))]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">
              Account security
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b1f1a]">
              Zmena hesla bez legacy form dojmu
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5a54]">
              Jediny krok je potvrdit stavajici pristup a zvolit nove heslo. Po ulozeni je zmena okamzite aktivni pro dalsi prihlaseni.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Okamzity efekt</div>
            <div className="mt-2 text-sm font-medium text-[#2b1f1a]">Plati po ulozeni</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Doporuceni</div>
            <div className="mt-2 text-sm font-medium text-[#2b1f1a]">Delsi heslo + cislice + symboly</div>
          </div>
        </div>
      </section>

      {error ? <SurfaceMessage tone="error">{error}</SurfaceMessage> : null}
      {success ? <SurfaceMessage tone="success">{success}</SurfaceMessage> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <label htmlFor="currentPassword" className="text-sm font-semibold text-[#2b1f1a]">
                Soucasne heslo
              </label>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5a54]">
                Potvrzuje, ze heslo meni opravnene prihlaseny uzivatel. Bez nej zmenu neprovedeme.
              </p>
            </div>
          </div>

          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
            className="mt-4 w-full rounded-2xl border border-stone-300 bg-[#fffdfb] px-4 py-3 text-[#2b1f1a] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#ead8cf]"
            placeholder="••••••••"
          />
          {errors.currentPassword ? (
            <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A1538]">
              Nove heslo
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5a54]">
              Zvolte heslo, ktere nepouzivate u jinych sluzeb. Pokud pristup sdili vice lidi, poslete nove heslo jen zabezpecenym kanalem.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-stone-200 bg-[#fbf7f3] p-5">
              <label htmlFor="newPassword" className="text-sm font-semibold text-[#2b1f1a]">
                Nove heslo
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register('newPassword')}
                className="mt-3 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-[#2b1f1a] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#ead8cf]"
                placeholder="••••••••"
              />
              {errors.newPassword ? <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p> : null}
              <p className="mt-3 text-sm leading-6 text-[#6b5a54]">
                Doporucujeme kombinaci malych a velkych pismen, cisel a symbolu.
              </p>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-[#fbf7f3] p-5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#2b1f1a]">
                Potvrzeni noveho hesla
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="mt-3 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-[#2b1f1a] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#ead8cf]"
                placeholder="••••••••"
              />
              {errors.confirmPassword ? (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-[#6b5a54]">
                Druhe pole slouzi jen jako kontrola. Po ulozeni se hodnoty vymazou.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7d9d1] bg-[#fbf7f3] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.06)] sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#eadfd8] bg-white/80 p-4 text-sm leading-6 text-[#6b5a54]">
              Po ulozeni se heslo zmeni okamzite.
            </div>
            <div className="rounded-2xl border border-[#eadfd8] bg-white/80 p-4 text-sm leading-6 text-[#6b5a54]">
              Aktualni session muze pokracovat, ale dalsi prihlaseni uz pouziji nove heslo.
            </div>
            <div className="rounded-2xl border border-[#eadfd8] bg-white/80 p-4 text-sm leading-6 text-[#6b5a54]">
              Pokud pristup sdili tym, informujte ostatni jen pres bezpecny kanal.
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#8A1538] px-8 text-sm font-semibold text-white transition hover:bg-[#73102f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menim heslo...</span>
              </span>
            ) : (
              'Zmenit heslo'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
