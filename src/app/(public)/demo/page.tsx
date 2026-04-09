import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Internal demo | etiketa.wine',
  description: 'Interni demo a diagnosticky vstup za flagem.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoPage() {
  if (process.env.ENABLE_INTERNAL_ROUTES !== 'true') {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[color:var(--border)] bg-white/80 p-8 shadow-[0_24px_80px_rgba(52,25,12,0.10)] backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--brand)]">
          Internal demo
        </p>
        <h1 className="mt-4 font-display text-4xl text-[color:var(--foreground)]">
          Demo povrch je uzavreny
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
          Public demo flow byl odstraněn z produkčního povrchu. Tato adresa
          zůstává jen jako interní diagnostický vstup, pokud je aktivní
          `ENABLE_INTERNAL_ROUTES=true`.
        </p>
      </div>
    </div>
  );
}
