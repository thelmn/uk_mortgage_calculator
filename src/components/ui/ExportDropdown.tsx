'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScenarioResult } from '@/types';
import { exportToExcel } from '@/engine/exportExcel';
import { exportToPdf } from '@/engine/exportPdf';

interface ExportDropdownProps {
  results: ScenarioResult[];
  disabled?: boolean;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  results,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportExcel = async () => {
    setIsExporting('excel');
    setIsOpen(false);
    try {
      await exportToExcel(results);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting('pdf');
    setIsOpen(false);
    try {
      await exportToPdf(results);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export to PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting !== null}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
          transition-colors duration-150
          ${disabled || isExporting !== null
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
          }
        `}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
            <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9.5 16.5v-3l1.75 1.5L13 13.5v3h-1v-1.5l-.75.75-.75-.75V16.5h-1z"/>
              </svg>
              <span>Export to Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM10.5 11v5h1v-2h.5c.83 0 1.5-.67 1.5-1.5S12.83 11 12 11h-1.5zm1 2v-1h.5c.28 0 .5.22.5.5s-.22.5-.5.5h-.5z"/>
              </svg>
              <span>Export to PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
