import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-300 bg-gray-100 flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-4 text-sm font-medium uppercase transition ${
            activeTab === tab
              ? 'text-primary border-b-2 border-primary bg-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
