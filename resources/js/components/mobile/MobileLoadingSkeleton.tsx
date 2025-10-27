interface MobileLoadingSkeletonProps {
  type?: 'card' | 'list' | 'form' | 'dashboard';
  count?: number;
  className?: string;
}

const SkeletonLine = ({
  width = 'w-full',
  height = 'h-4',
}: {
  width?: string;
  height?: string;
}) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-3/4" />
        <SkeletonLine width="w-1/2" height="h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonLine />
      <SkeletonLine width="w-5/6" />
    </div>
    <div className="pt-2">
      <SkeletonLine width="w-24" height="h-8" />
    </div>
  </div>
);

const SkeletonListItem = () => (
  <div className="flex items-center space-x-3 p-3 border-b border-gray-100">
    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    <div className="flex-1 space-y-2">
      <SkeletonLine width="w-3/4" />
      <SkeletonLine width="w-1/2" height="h-3" />
    </div>
    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
  </div>
);

const SkeletonForm = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
    <SkeletonLine width="w-1/3" height="h-6" />
    <div className="space-y-3">
      <div>
        <SkeletonLine width="w-20" height="h-4" />
        <div className="mt-1">
          <SkeletonLine height="h-10" />
        </div>
      </div>
      <div>
        <SkeletonLine width="w-24" height="h-4" />
        <div className="mt-1">
          <SkeletonLine height="h-10" />
        </div>
      </div>
      <div>
        <SkeletonLine width="w-28" height="h-4" />
        <div className="mt-1">
          <SkeletonLine height="h-20" />
        </div>
      </div>
    </div>
    <div className="pt-2">
      <SkeletonLine width="w-32" height="h-10" />
    </div>
  </div>
);

const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine width="w-48" height="h-6" />
          <SkeletonLine width="w-64" height="h-4" />
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <SkeletonCard key={i} />
      ))}
    </div>

    {/* Content section */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-32" height="h-5" />
        <SkeletonLine width="w-20" height="h-4" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default function MobileLoadingSkeleton({
  type = 'card',
  count = 3,
  className = '',
}: MobileLoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return <SkeletonDashboard />;
      case 'form':
        return <SkeletonForm />;
      case 'list':
        return (
          <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        );
      case 'card':
      default:
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        );
    }
  };

  return (
    <div
      className={`animate-pulse ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {renderSkeleton()}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Individual skeleton components for more granular use
export const MobileSkeletonCard = () => <SkeletonCard />;
export const MobileSkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-1">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonListItem key={i} />
    ))}
  </div>
);
export const MobileSkeletonForm = () => <SkeletonForm />;
export const MobileSkeletonDashboard = () => <SkeletonDashboard />;
