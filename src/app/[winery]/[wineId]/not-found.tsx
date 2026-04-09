import Link from 'next/link';

export default function WineNotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf6f1_0%,#f6efe7_48%,#fbf8f4_100%)] px-4 py-10 text-stone-900 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[rgba(110,54,36,0.12)] bg-white/82 p-8 text-center shadow-[0_28px_80px_rgba(56,30,18,0.10)] backdrop-blur-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgb(112,24,42)]">
          Digitalni etiketa
        </p>
        <h1 className="mt-5 font-serif text-4xl text-stone-900 sm:text-5xl">Vino nenalezeno</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
          Pozadovana verejna etiketa neni dostupna. Odkaz muze byt neplatny, vino uz nemusi byt
          zverejnene nebo je v URL nespravny identifikator.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[rgb(112,24,42)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(92,18,35)]"
          >
            Zpet na uvod
          </Link>
        </div>
      </div>
    </main>
  );
}
