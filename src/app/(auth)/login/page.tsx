import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Prihlaseni",
  description: "Prihlaste se do etiketa.wine a pokracujte do workspace vinarstvi.",
  robots: {
    index: false,
    follow: false,
  },
};

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[color:var(--border)] bg-white/75 p-8 shadow-[0_24px_80px_rgba(52,25,12,0.10)] backdrop-blur-xl">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-full bg-black/10" />
          <div className="h-8 w-3/4 rounded-2xl bg-black/10" />
          <div className="h-4 w-full rounded-full bg-black/10" />
        </div>
        <div className="space-y-4">
          <div className="h-12 rounded-2xl bg-black/10" />
          <div className="h-12 rounded-2xl bg-black/10" />
          <div className="h-12 rounded-full bg-black/10" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
          Prihlaseni
        </span>
        <div className="space-y-3">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Pokracujte do
            <br />
            pracovni plochy vinarstvi.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            Prihlaseni vede rovnou k vinum, QR exportum a nastaveni vinarstvi.
            Pokud ucet jeste nemate, zalozte si pristup pro svoje vinarstvi.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/register"
          className="rounded-full px-1 py-2 font-medium text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
        >
          Nemate ucet? Zalozit vinarstvi
        </Link>
      </div>

      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>

      <div className="border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted)]">
        <p>
          Nemate ucet?{" "}
          <Link
            href="/register"
            className="font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
          >
            Zalozit vinarsky ucet
          </Link>
        </p>
        <p className="mt-2">
          Potrebujete pristup?{" "}
          <Link
            href="/register"
            className="font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
          >
            Zalozit ucet
          </Link>
        </p>
      </div>
    </section>
  );
}
