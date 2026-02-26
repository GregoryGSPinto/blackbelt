// ============================================================
// SkeletonLoader — Loading state para abas de configurações
// ============================================================

export function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-white/10 rounded w-1/3" />
      <div className="h-4 bg-white/10 rounded w-2/3" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
