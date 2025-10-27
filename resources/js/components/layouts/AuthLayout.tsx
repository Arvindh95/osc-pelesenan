import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-4 px-4 sm:py-12 sm:px-6 lg:px-8 touch-manipulation">
      <div className="w-full max-w-sm mx-auto sm:max-w-md">
        {/* OSC Branding */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base sm:text-lg">
                OSC
              </span>
            </div>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Pelesenan PBT
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                One Stop Centre
              </p>
            </div>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mt-6 sm:mt-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>

      {/* Auth Card */}
      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl rounded-lg sm:py-8 sm:px-10 border border-gray-200">
          {children}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <Link
              to="/help"
              className="text-gray-500 hover:text-blue-600 transition-colors touch-manipulation py-2"
            >
              Need Help?
            </Link>
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-blue-600 transition-colors touch-manipulation py-2"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 hover:text-blue-600 transition-colors touch-manipulation py-2"
            >
              Terms of Service
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            © 2024 One Stop Centre Pelesenan PBT. All rights reserved.
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
          />
        </svg>
      </div>
    </div>
  );
}
