export default function DetailLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-24">
      {/* Back button skeleton */}
      <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
      {/* Profile card skeleton */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6">
        <div className="size-16 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      </div>
      {/* Details table skeleton */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
