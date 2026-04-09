"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="rounded-[2rem] border border-rose-200 bg-white/85 p-8 shadow-xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-rose-700">
          Dashboard
        </p>
        <h1 className="mb-3 text-3xl font-semibold text-stone-900">
          Operativní data se nepodařilo načíst
        </h1>
        <p className="mb-6 max-w-2xl text-stone-600">
          {error.message || 'Zkuste požadavek zopakovat. Pokud problém trvá, zkontrolujte Appwrite a runtime konfiguraci.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-[#7a2433] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#641b29]"
        >
          Zkusit znovu
        </button>
      </div>
    </div>
  );
}
