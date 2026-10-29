export function LoadingCardComponent() {
  return (
    <div className="glass-card h-full rounded-[1.75rem] p-5">
      <div className="flex gap-4">
        <div className="skeleton-shimmer h-24 w-24 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <div className="skeleton-shimmer h-5 w-3/4 rounded-full" />
          <div className="skeleton-shimmer h-4 w-full rounded-full opacity-80" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-full opacity-60" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="skeleton-shimmer h-12 rounded-2xl opacity-80" />
        <div className="skeleton-shimmer h-12 rounded-2xl opacity-80" />
        <div className="skeleton-shimmer h-12 rounded-2xl opacity-80" />
      </div>
    </div>
  );
}
