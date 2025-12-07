'use client';

import React from 'react';
import { ScenarioResult } from '@/types';
import { Tabs } from '@/components/ui';
import { SummaryTab } from './SummaryTab';
import { VisualizationsTab } from './VisualizationsTab';
import { ScheduleTab } from './ScheduleTab';

interface ResultsPanelProps {
  results: ScenarioResult[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Results Tabs */}
      <Tabs
        tabs={['Summary', 'Visualizations', 'Schedule']}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-normal mb-2 text-gray-500">No Results Yet</h3>
            <p className="text-sm">Click &quot;Show Results&quot; to calculate your mortgage</p>
          </div>
        ) : (
          <>
            {activeTab === 'Summary' && <SummaryTab results={results} />}
            {activeTab === 'Visualizations' && <VisualizationsTab results={results} />}
            {activeTab === 'Schedule' && <ScheduleTab results={results} />}
          </>
        )}
      </div>
    </div>
  );
};
