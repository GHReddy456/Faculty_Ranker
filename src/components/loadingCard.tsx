export function LoadingCardComponent() {
  return (
    <div className="glass-card h-full rounded-[1.75rem] p-5">
      <div className="flex gap-4">
        <div className="h-24 w-24 animate-pulse rounded-2xl bg-slate-800" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-800" />
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-800/80" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-800/60" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-800/80" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-800/80" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-800/80" />
      </div>
    </div>
  );
}
