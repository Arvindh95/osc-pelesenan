import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import AppLayout from '../components/layouts/AppLayout';
import { ConfirmDialog } from '../components/shared';

function AccountSettingsPage() {
  const { user, updateProfile, deactivateAccount, isLoading } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'deactivate'
  >('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      addNotification({
        type: 'success',
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        addNotification({
          type: 'error',
          message: error.message || 'Failed to update profile',
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      await deactivateAccount();
      addNotification({
        type: 'success',
        message:
          'Your account has been deactivated successfully. You will be redirected to the login page.',
      });
      // The deactivateAccount function in AuthContext will handle logout and redirect
    } catch (error: any) {
      setIsDeactivating(false);
      setShowDeactivateDialog(false);
      addNotification({
        type: 'error',
        message:
          error.message || 'Failed to deactivate account. Please try again.',
      });
    }
  };

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: 'user' },
    { id: 'security' as const, name: 'Security', icon: 'shield' },
    {
      id: 'deactivate' as const,
      name: 'Account Deactivation',
      icon: 'warning',
    },
  ];

  const renderIcon = (iconType: string, className: string = 'w-5 h-5') => {
    switch (iconType) {
      case 'user':
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case 'shield':
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout title="Account Settings">
      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {renderIcon(tab.icon)}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Profile Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Update your account&apos;s profile information and email address.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter your full name"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium py-2">
                          {user?.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.email
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            placeholder="Enter your email address"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium py-2">
                          {user?.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Read-only fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IC Number
                      </label>
                      <p className="text-gray-900 font-medium font-mono py-2">
                        {user?.ic_no}
                      </p>
                      <p className="text-xs text-gray-500">
                        IC number cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Role
                      </label>
                      <p className="text-gray-900 font-medium py-2">
                        {user?.role === 'PENTADBIR_SYS'
                          ? 'System Administrator'
                          : 'Applicant'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Status
                      </label>
                      <div className="flex items-center space-x-2 py-2">
                        {user?.status_verified_person ? (
                          <>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                            <span className="text-sm text-gray-500">
                              Identity confirmed
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Verification
                            </span>
                            <span className="text-sm text-gray-500">
                              Identity verification required
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <p className="text-gray-900 font-medium py-2">
                        {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Security Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage your account security and authentication settings.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Security Features Coming Soon
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Password change and additional security features will
                          be available in a future update. Your account is
                          currently secured with industry-standard
                          authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Password
                      </h4>
                      <p className="text-sm text-gray-500">
                        Last updated: Not available
                      </p>
                    </div>
                    <button
                      disabled
                      className="px-3 py-1 text-sm font-medium text-gray-400 bg-gray-200 rounded-md cursor-not-allowed"
                    >
                      Change Password (Coming Soon)
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      disabled
                      className="px-3 py-1 text-sm font-medium text-gray-400 bg-gray-200 rounded-md cursor-not-allowed"
                    >
                      Enable 2FA (Coming Soon)
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Login Sessions
                      </h4>
                      <p className="text-sm text-gray-500">
                        Manage your active login sessions
                      </p>
                    </div>
                    <button
                      disabled
                      className="px-3 py-1 text-sm font-medium text-gray-400 bg-gray-200 rounded-md cursor-not-allowed"
                    >
                      View Sessions (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Deactivation Tab */}
            {activeTab === 'deactivate' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Account Deactivation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Permanently deactivate your account and remove all
                    associated data.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Warning: This action cannot be undone
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Account deactivation will permanently remove your
                          access to the OSC Pelesenan system. This action is
                          irreversible and will result in the loss of all your
                          data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    What happens when you deactivate your account:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Your account will be immediately logged out and access
                      will be revoked
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      All personal information and verification status will be
                      removed
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Company associations and business data will be unlinked
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      You will not be able to recover your account or data
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>A new
                      registration will be required to use the system again
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeactivateDialog(true)}
                    disabled={isLoading || isDeactivating}
                    className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Deactivation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleDeactivateAccount}
        title="Confirm Account Deactivation"
        confirmText="Yes, Deactivate My Account"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        isLoading={isDeactivating}
        requireConfirmation={true}
        confirmationValue={user?.email || ''}
        confirmationPlaceholder={`Type ${user?.email} to confirm`}
        message={
          <div className="space-y-4">
            <p className="text-gray-900 font-medium">
              Are you absolutely sure you want to deactivate your account?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </h4>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your account will be permanently deleted</li>
                      <li>
                        All personal data and verification status will be
                        removed
                      </li>
                      <li>Company associations will be unlinked</li>
                      <li>You will be immediately logged out</li>
                      <li>
                        A new registration will be required to use the system
                        again
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Please type your email address <strong>{user?.email}</strong>{' '}
              below to confirm this action.
            </p>
          </div>
        }
      />
    </AppLayout>
  );
}

export default AccountSettingsPage;
