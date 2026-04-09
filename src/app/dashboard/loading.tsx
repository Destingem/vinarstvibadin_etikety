export default function DashboardLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3 py-2">
          <div className="h-4 w-28 rounded-full bg-stone-200" />
          <div className="h-10 w-72 rounded-2xl bg-stone-300" />
          <div className="h-5 w-full max-w-xl rounded-full bg-stone-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm"
            >
              <div className="mb-4 h-10 w-10 rounded-2xl bg-stone-200" />
              <div className="mb-2 h-4 w-32 rounded-full bg-stone-200" />
              <div className="h-8 w-24 rounded-full bg-stone-300" />
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
          <div className="mb-4 h-5 w-40 rounded-full bg-stone-200" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-14 rounded-2xl bg-stone-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
