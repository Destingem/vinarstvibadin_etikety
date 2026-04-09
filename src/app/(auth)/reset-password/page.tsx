"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Heslo musi mit alespon 6 znaku" }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hesla se neshoduji",
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
    const userIdParam = searchParams.get("userId");
    const secretParam = searchParams.get("secret");

    if (!userIdParam || !secretParam) {
      setError(
        "Odkaz pro obnoveni hesla neni platny. Pozadejte o novy e-mail s obnovou."
      );
      return;
    }

    setUserId(userIdParam);
    setSecret(secretParam);
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!userId || !secret) {
      setError("Chybi udaje pro obnoveni hesla.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(result.message || "Zmena hesla se nepodarila");
      }

      setSuccess(result.message);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2600);
    } catch (err: any) {
      setError(err.message || "Nastala chyba pri zmene hesla");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[color:var(--border)] bg-[rgba(255,251,246,0.86)] p-8 shadow-[0_24px_80px_rgba(52,25,12,0.10)] backdrop-blur-xl">
      <div className="mb-8 space-y-3">
        <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
          Obnoveni pristupu
        </span>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          Nastavte nove heslo.
        </h1>
        <p className="text-sm leading-6 text-[color:var(--muted)] sm:text-base">
          Po ulozeni vas vratime zpet na prihlaseni, kde se uz muzete prihlasit
          novym heslem.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{success}</p>
          <p className="mt-1 text-xs text-emerald-600">
            Za chvili budete presmerovani na prihlaseni.
          </p>
        </div>
      )}

      {!success ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[color:var(--foreground)]"
            >
              Nove heslo
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 transition focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passwordConfirm"
              className="text-sm font-medium text-[color:var(--foreground)]"
            >
              Potvrzeni hesla
            </label>
            <input
              id="passwordConfirm"
              type="password"
              {...register("passwordConfirm")}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 transition focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20"
              placeholder="••••••••"
            />
            {errors.passwordConfirm && (
              <p className="text-sm text-red-600">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !userId || !secret}
            className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Menim heslo..." : "Zmenit heslo"}
          </button>
        </form>
      ) : null}

      <div className="mt-6 border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted)]">
        <Link
          href="/login"
          className="font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
        >
          Zpet na prihlaseni
        </Link>
      </div>
    </div>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[color:var(--border)] bg-[rgba(255,251,246,0.86)] p-8 shadow-[0_24px_80px_rgba(52,25,12,0.10)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="h-3 w-28 rounded-full bg-black/10" />
        <div className="h-8 w-3/4 rounded-2xl bg-black/10" />
        <div className="h-4 w-full rounded-full bg-black/10" />
        <div className="h-12 rounded-2xl bg-black/10" />
        <div className="h-12 rounded-2xl bg-black/10" />
        <div className="h-12 rounded-full bg-black/10" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
          Bezpecne obnoveni
        </span>
        <div className="space-y-3">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Obnovte pristup
            <br />
            bez dalsiho stresu.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            Tato stranka slouzi jen pro nove heslo. Jakmile ho ulozite,
            vratime vas zpet na prihlaseni a pokracujete do aplikace.
          </p>
        </div>
      </div>

      <Suspense fallback={<ResetPasswordSkeleton />}>
        <ResetPasswordForm />
      </Suspense>

      <div className="border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted)]">
        <p>
          Potrebujete novy e-mail s obnovou?{" "}
          <Link
            href="/login"
            className="font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
          >
            Vratit se na prihlaseni
          </Link>
        </p>
      </div>
    </section>
  );
}
