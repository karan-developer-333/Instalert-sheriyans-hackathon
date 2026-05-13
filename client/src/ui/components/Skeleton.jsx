export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-[#37322F]/10 rounded-md ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white border border-[rgba(55,50,47,0.12)] rounded-lg p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonIncidentRow() {
  return (
    <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-lg px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonEmployeeRow() {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-16 h-6 rounded-full" />
    </div>
  );
}

export function SkeletonDashboardHeader() {
  return (
    <div className="flex items-center gap-3 mb-8">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}

export function SkeletonStatsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-[rgba(55,50,47,0.12)] rounded-lg p-4">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-16 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTabs() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <SkeletonIncidentRow key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonFullPage() {
  return (
    <div className="p-4 sm:p-8">
      <SkeletonDashboardHeader />
      <SkeletonTabs />
    </div>
  );
}
