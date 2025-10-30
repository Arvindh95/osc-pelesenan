import React from 'react';

interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

/**
 * TabNavigation Component
 * Displays horizontal tabs for edit page navigation
 * Supports keyboard navigation
 * 
 * @param tabs - Array of tab labels
 * @param activeTab - Currently active tab label
 * @param onChange - Callback when tab is changed
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
}) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    tab: string
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(tab);
    }
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav
        className="-mb-px flex space-x-8"
        aria-label="Tabs"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              onKeyDown={(e) => handleKeyDown(e, tab)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.toLowerCase()}-panel`}
              id={`${tab.toLowerCase()}-tab`}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                transition-colors duration-200
                ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
