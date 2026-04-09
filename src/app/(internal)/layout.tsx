import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Internal | etiketa.wine',
  description: 'Interni testovaci a diagnosticke routy mimo bezny produktovy povrch.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.ENABLE_INTERNAL_ROUTES !== 'true') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] px-4 py-10 text-[color:var(--foreground)]">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[color:var(--border)] bg-white/86 p-8 shadow-[0_24px_80px_rgba(36,20,15,0.10)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Internal
        </p>
        {children}
      </div>
    </div>
  );
}
