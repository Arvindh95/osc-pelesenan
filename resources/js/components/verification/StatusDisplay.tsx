import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';

interface StatusDisplayProps {
  isVerified: boolean;
  isLoading?: boolean;
  message?: string;
  lastVerified?: string | null;
  showActions?: boolean;
  onRetry?: () => void;
  error?: string | null;
}

function StatusDisplay({
  isVerified,
  isLoading = false,
  message,
  lastVerified,
  showActions = false,
  onRetry,
  error,
}: StatusDisplayProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-yellow-400 mr-3 animate-pulse" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Sedang Memproses
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Pengesahan identiti sedang diproses. Sila tunggu sebentar...
            </p>
            <div className="mt-2">
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Ralat Pengesahan
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            {showActions && onRetry && (
              <div className="mt-3">
                <button
                  onClick={onRetry}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors duration-200"
                >
                  Cuba Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Verified state
  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Identiti Disahkan ✓
            </h3>
            <p className="text-sm text-green-700 mt-1">
              {message ||
                'Identiti anda telah berjaya disahkan dan anda kini boleh mengakses semua ciri sistem.'}
            </p>
            {lastVerified && (
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <span className="mr-1">📅</span>
                Disahkan pada:{' '}
                {new Date(lastVerified).toLocaleString('ms-MY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            <div className="mt-2 flex items-center text-xs text-green-600">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Status: Aktif
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unverified state
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
      <div className="flex items-start">
        <XCircleIcon className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            Identiti Belum Disahkan
          </h3>
          <p className="text-sm text-orange-700 mt-1">
            {message ||
              'Identiti anda belum disahkan. Sila sahkan identiti anda untuk mengakses semua ciri sistem.'}
          </p>
          <div className="mt-2 flex items-center text-xs text-orange-600">
            <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            Status: Menunggu Pengesahan
          </div>
          <div className="mt-3">
            <div className="bg-orange-100 rounded-md p-2">
              <p className="text-xs text-orange-700">
                <strong>Ciri yang terhad:</strong>
              </p>
              <ul className="text-xs text-orange-600 mt-1 space-y-0.5">
                <li>• Pengurusan syarikat</li>
                <li>• Pautan syarikat ke akaun</li>
                <li>• Akses penuh kepada sistem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusDisplay;
