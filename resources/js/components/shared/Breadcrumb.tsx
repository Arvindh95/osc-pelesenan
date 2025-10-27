import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();

  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Dashboard', href: '/dashboard' },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip dashboard as it's already added as home
      if (segment === 'dashboard') return;

      let name = segment;
      const href = currentPath;

      // Map route segments to readable names
      switch (segment) {
        case 'identity':
          name = 'Identity Verification';
          break;
        case 'companies':
          name = 'Company Management';
          break;
        case 'verify':
          name = 'Verify Company';
          break;
        case 'link':
          name = 'Link Company';
          break;
        case 'settings':
          name = 'Account Settings';
          break;
        case 'deactivate':
          name = 'Deactivate Account';
          break;
        case 'admin':
          name = 'Admin Panel';
          break;
        case 'users':
          name = 'User Management';
          break;
        case 'audit':
          name = 'Audit Logs';
          break;
        case 'audit-logs':
          name = 'Audit Logs';
          break;
        default:
          // Capitalize first letter and replace hyphens with spaces
          name =
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, ' ');
      }

      // Don't add href for the last item (current page)
      const isLast = index === pathSegments.length - 1;
      breadcrumbs.push({
        name,
        href: isLast ? undefined : href,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs for dashboard or single-level pages
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <Link
              to="/dashboard"
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </div>
        </li>
        {breadcrumbItems.slice(1).map(item => (
          <li key={item.name}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {item.href ? (
                <Link
                  to={item.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className="ml-4 text-sm font-medium text-gray-900"
                  aria-current="page"
                >
                  {item.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
