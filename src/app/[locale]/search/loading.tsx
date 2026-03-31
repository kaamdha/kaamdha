export default function SearchLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Back button skeleton */}
      <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
      {/* Search bar skeleton */}
      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
      {/* Category pills skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-slate-200" />
        ))}
      </div>
      {/* Result cards skeleton */}
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
