export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Back button skeleton */}
      <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
      {/* Greeting skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
      </div>
      {/* Menu items skeleton */}
      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="size-8 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
