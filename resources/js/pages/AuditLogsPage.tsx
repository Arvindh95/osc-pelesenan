import AppLayout from '../components/layouts/AppLayout';
import { AuditLogDisplay } from '../components/shared';

export default function AuditLogsPage() {
  return (
    <AppLayout title="Activity Logs">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account Activity
          </h2>
          <p className="text-gray-600">
            View your complete account activity history including logins,
            verifications, and system interactions.
          </p>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AuditLogDisplay
            limit={20}
            showPagination={true}
            showFilters={true}
            autoRefresh={true}
            refreshInterval={60000}
          />
        </div>
      </div>
    </AppLayout>
  );
}
