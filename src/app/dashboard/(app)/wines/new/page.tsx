import WineForm from '@/components/WineForm';

export default function NewWinePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[2rem] border border-stone-200 bg-white/80 px-5 py-6 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">Katalog / nové víno</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-900">Přidat nové víno</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          Jakmile víno uložíte, otevře se jeho detail a odtud navazuje QR workflow i další editace.
        </p>
      </div>

      <WineForm />
    </div>
  );
}
