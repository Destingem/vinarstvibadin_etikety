"use client";

import { type ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';

const profileSchema = z.object({
  name: z.string().min(1, { message: 'Nazev vinarstvi je povinny' }),
  email: z.string().email({ message: 'Zadejte platny email' }),
  slug: z
    .string()
    .min(1, { message: 'Slug je povinny' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug muze obsahovat pouze mala pismena, cislice a pomlcky',
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

function SectionActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#8A1538] px-6 text-sm font-semibold text-white transition hover:bg-[#73102f] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default function ProfileForm() {
  const { user, refreshSession } = useAuth();
  const [isNameSubmitting, setIsNameSubmitting] = useState(false);
  const [isSlugSubmitting, setIsSlugSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastWineryNameUpdate, setLastWineryNameUpdate] = useState<string | null>(null);
  const [lastWinerySlugUpdate, setLastWinerySlugUpdate] = useState<string | null>(null);

  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  const watchedSlug = watch('slug');

  const canUpdateWineryName = () => {
    if (!lastWineryNameUpdate) {
      return true;
    }

    const lastUpdateDate = new Date(lastWineryNameUpdate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastUpdateDate <= sixMonthsAgo;
  };

  const canUpdateWinerySlug = () => {
    if (!lastWinerySlugUpdate) {
      return true;
    }

    const lastUpdateDate = new Date(lastWinerySlugUpdate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastUpdateDate <= sixMonthsAgo;
  };

  const getNextAllowedNameDate = () => {
    if (!lastWineryNameUpdate) {
      return null;
    }

    const lastUpdateDate = new Date(lastWineryNameUpdate);
    const nextAllowedDate = new Date(lastUpdateDate);
    nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 6);
    return nextAllowedDate;
  };

  const getNextAllowedSlugDate = () => {
    if (!lastWinerySlugUpdate) {
      return null;
    }

    const lastUpdateDate = new Date(lastWinerySlugUpdate);
    const nextAllowedDate = new Date(lastUpdateDate);
    nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 6);
    return nextAllowedDate;
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setValue('name', user.name);
    setValue('email', user.email);
    setValue('slug', user.slug || '');
  }, [setValue, user]);

  useEffect(() => {
    const fetchProfileState = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setLastWineryNameUpdate(data.profile?.settings?.lastWineryNameUpdate || null);
        setLastWinerySlugUpdate(data.profile?.settings?.lastWinerySlugUpdate || null);
      } catch (fetchError) {
        console.error('Error fetching profile settings:', fetchError);
      }
    };

    if (user) {
      fetchProfileState();
    }
  }, [user]);

  const updateName = async () => {
    if (!user) {
      setError('Nejste prihlaseni');
      return;
    }

    if (!canUpdateWineryName()) {
      const nextDate = getNextAllowedNameDate();
      setError(
        `Nazev vinarstvi lze zmenit pouze jednou za 6 mesicu. Dalsi zmena bude mozna od ${nextDate?.toLocaleDateString(
          'cs-CZ'
        )}`
      );
      return;
    }

    setIsNameSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const name = getValues('name');
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: name,
          updateField: 'name',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Aktualizace nazvu selhala');
      }

      setSuccess(result.message || 'Nazev byl uspesne aktualizovan');
      setLastWineryNameUpdate(result.profile?.settings?.lastWineryNameUpdate || null);
      await refreshSession();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba pri aktualizaci nazvu');
    } finally {
      setIsNameSubmitting(false);
    }
  };

  const updateSlug = async () => {
    if (!user) {
      setError('Nejste prihlaseni');
      return;
    }

    if (!canUpdateWinerySlug()) {
      const nextDate = getNextAllowedSlugDate();
      setError(
        `Slug vinarstvi lze zmenit pouze jednou za 6 mesicu. Dalsi zmena bude mozna od ${nextDate?.toLocaleDateString(
          'cs-CZ'
        )}`
      );
      return;
    }

    setIsSlugSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const slug = getValues('slug');
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          updateField: 'slug',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Aktualizace slugu selhala');
      }

      setSuccess(result.message || 'Verejna adresa byla uspesne aktualizovana');
      setLastWinerySlugUpdate(result.profile?.settings?.lastWinerySlugUpdate || null);
      await refreshSession();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba pri aktualizaci verejne adresy');
    } finally {
      setIsSlugSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,249,243,0.98),rgba(248,239,232,0.92))] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">
              Account identity
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b1f1a]">
              Profil vinarstvi a verejna adresa
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5a54]">
              Udrzujte na jednom miste jmeno vinarstvi, kontakt a verejnou adresu. Formulare jsou ted
              rozdelené podle toho, co ovlivnuje dashboard a co ovlivnuje verejnou etiketu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Identita</div>
              <div className="mt-2 text-sm font-medium text-[#2b1f1a]">{user?.name || 'Neuvedeno'}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Verejna URL</div>
              <div className="mt-2 text-sm font-medium text-[#2b1f1a]">etiketa.wine/{user?.slug || 'slug'}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Kontakt</div>
              <div className="mt-2 text-sm font-medium text-[#2b1f1a]">{user?.email || 'Neuvedeno'}</div>
            </div>
          </div>
        </div>
      </section>

      {error ? <SurfaceMessage tone="error">{error}</SurfaceMessage> : null}
      {success ? <SurfaceMessage tone="success">{success}</SurfaceMessage> : null}

      <form className="space-y-6">
        <section className="grid gap-4 rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-[#2b1f1a]">
                Nazev vinarstvi
              </label>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  canUpdateWineryName()
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {canUpdateWineryName() ? 'Lze upravit' : 'Docasne uzamceno'}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#6b5a54]">
              Propisuje se do dashboardu i na verejnou etiketu. Drzime delsi interval zmen, aby identita
              vinarstvi zustala stabilni.
            </p>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="mt-4 w-full rounded-2xl border border-stone-300 bg-[#fffdfb] px-4 py-3 text-[#2b1f1a] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#ead8cf]"
              placeholder="Napr. Vinarstvi Novy Dvur"
            />
            {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
            {!canUpdateWineryName() ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                Nazev lze menit jednou za 6 mesicu. Dalsi zmena bude mozna od{' '}
                {getNextAllowedNameDate()?.toLocaleDateString('cs-CZ')}.
              </p>
            ) : null}
          </div>
          <SectionActionButton onClick={updateName} disabled={isNameSubmitting || !canUpdateWineryName()}>
            {isNameSubmitting ? 'Ukladam identitu...' : 'Ulozit zmenu nazvu'}
          </SectionActionButton>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="slug" className="text-sm font-semibold text-[#2b1f1a]">
                  Verejna adresa
                </label>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    canUpdateWinerySlug()
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {canUpdateWinerySlug() ? 'Lze upravit' : 'Docasne uzamceno'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6b5a54]">
                Slug urcuje verejnou adresu vinarstvi. Pracujte s nim opatrne, protoze je zaklad pro QR a sdilene odkazy.
              </p>
            </div>
            <SectionActionButton onClick={updateSlug} disabled={isSlugSubmitting || !canUpdateWinerySlug()}>
              {isSlugSubmitting ? 'Ukladam adresu...' : 'Ulozit verejnou adresu'}
            </SectionActionButton>
          </div>

          <div className="mt-5 rounded-[24px] border border-stone-200 bg-[#fbf7f3] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Preview URL</div>
            <div className="mt-2 text-sm font-medium text-[#2b1f1a]">etiketa.wine/{watchedSlug || user?.slug || 'slug'}</div>
          </div>

          <div className="mt-4 flex">
            <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-stone-300 bg-stone-100 px-4 text-sm text-stone-500">
              etiketa.wine/
            </span>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              className="w-full rounded-r-2xl border border-stone-300 bg-[#fffdfb] px-4 py-3 text-[#2b1f1a] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#ead8cf]"
              placeholder="napr-slunce-vinice"
            />
          </div>
          {errors.slug ? <p className="mt-2 text-sm text-red-600">{errors.slug.message}</p> : null}
          {!canUpdateWinerySlug() ? (
            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              Slug lze menit jednou za 6 mesicu. Dalsi zmena bude mozna od{' '}
              {getNextAllowedSlugDate()?.toLocaleDateString('cs-CZ')}.
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-[#6b5a54]">
            Zmena slugu se projevi u novych verejnych odkazu. Existujici QR kody zustavaji podle backend logiky funkcni.
          </p>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-[#2b1f1a]">
                Kontaktni email
              </label>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5a54]">
                E-mail je primarni identita uctu. Samoobsluzna zmena neni v tomhle releasu otevrena, aby se nemichaly auth
                a provozni zmeny do jednoho kroku.
              </p>
            </div>
            <div className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              Pouze pro cteni
            </div>
          </div>

          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-4 w-full cursor-not-allowed rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-500"
            readOnly
          />

          <div className="mt-4 rounded-[24px] border border-[#eadfd8] bg-[#fbf7f3] p-4 text-sm leading-6 text-[#6b5a54]">
            Pokud potrebujete zmenu kontaktniho e-mailu, je potreba ji resit pres support spolu se zmenou prihlasovacich udaju.
          </div>
        </section>
      </form>

      <section className="rounded-[28px] border border-[#e7d9d1] bg-[#fbf7f3] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.06)] sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A1538]">Provozni pravidla</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eadfd8] bg-white/80 p-4 text-sm leading-6 text-[#6b5a54]">
            Nazev vinarstvi lze zmenit jednou za 6 mesicu.
          </div>
          <div className="rounded-2xl border border-[#eadfd8] bg-white/80 p-4 text-sm leading-6 text-[#6b5a54]">
            Verejnou adresu lze zmenit jednou za 6 mesicu, nezavisle na nazvu.
          </div>
          <div className="rounded-2xl border border-[#eadfd8] bg-white/80 p-4 text-sm leading-6 text-[#6b5a54]">
            Cilem je udrzet stabilni verejne URL a omezit sdileni jednoho uctu mezi vice vinarstvi.
          </div>
        </div>
      </section>
    </div>
  );
}
