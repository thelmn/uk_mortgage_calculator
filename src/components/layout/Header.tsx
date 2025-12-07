'use client';

import React, { useState } from 'react';
import { ScenarioResult } from '@/types';
import { ExportDropdown, HelpModal } from '@/components/ui';

interface HeaderProps {
  title?: string;
  results?: ScenarioResult[];
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'UK Mortgage Calculator',
  results = [],
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="bg-primary text-white h-15 flex items-center justify-between px-6 shadow-md flex-shrink-0">
        <h1 className="text-xl font-medium">{title}</h1>
        <div className="flex items-center gap-3">
          <ExportDropdown
            results={results}
            disabled={results.length === 0}
          />
          <button 
            className="p-2 rounded-full hover:bg-primary-light transition"
            aria-label="Help"
            onClick={() => setIsHelpOpen(true)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      </header>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};
