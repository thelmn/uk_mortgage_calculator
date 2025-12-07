'use client';

import React, { useState, useMemo } from 'react';
import { ScenarioResult, CHART_COLORS } from '@/types';
import { formatCurrency, formatNumber } from '@/engine';
import { InfoTooltip } from '@/components/ui';
import { SCHEDULE_TOOLTIPS } from '@/constants/tooltips';

interface ScheduleTabProps {
  results: ScenarioResult[];
}

const PAGE_SIZE_OPTIONS = [12, 24, 36, 60, 120]; // 1, 2, 3, 5, 10 years
const DEFAULT_PAGE_SIZE = 36; // 3 years

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ results }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Get the maximum schedule length across all scenarios
  const maxScheduleLength = useMemo(() => {
    return Math.max(...results.map(r => r.schedule.length));
  }, [results]);

  // Calculate total pages
  const totalPages = Math.ceil(maxScheduleLength / pageSize);

  // Get the months to display for the current page
  const displayedMonths = useMemo(() => {
    const startMonth = currentPage * pageSize + 1;
    const endMonth = Math.min(startMonth + pageSize - 1, maxScheduleLength);
    const months: number[] = [];
    for (let m = startMonth; m <= endMonth; m++) {
      months.push(m);
    }
    return months;
  }, [currentPage, pageSize, maxScheduleLength]);

  // Navigation handlers
  const goToFirstPage = () => setCurrentPage(0);
  const goToPrevPage = () => setCurrentPage(p => Math.max(0, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  // Column headers for each scenario
  const scenarioColumns = ['Opening Balance', 'Payment', 'Interest', 'Principal', 'Overpayment', 'Closing Balance', 'Rate'];

  if (results.length === 0) {
    return (
      <div className="bg-white rounded shadow-md p-6">
        <p className="text-gray-500 text-center">No results to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-md p-6">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        Amortization Schedule
        <InfoTooltip content={SCHEDULE_TOOLTIPS.sectionHeader} />
      </h2>
      
      {/* Pagination Controls - Top */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size} ({size / 12} {size === 12 ? 'year' : 'years'})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages} ({maxScheduleLength} months total)
          </span>
          <div className="flex gap-1">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="First page"
            >
              ««
            </button>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Previous page"
            >
              «
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Next page"
            >
              »
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage >= totalPages - 1}
              className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Last page"
            >
              »»
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="text-sm border-collapse min-w-full">
          {/* Header Row 1: Main categories */}
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th 
                className="text-left py-2 px-2 text-xs font-medium text-gray-600 uppercase border-r border-gray-300 sticky left-0 bg-gray-100 z-10"
                rowSpan={2}
              >
                Month
              </th>
              <th 
                className="text-left py-2 px-2 text-xs font-medium text-gray-600 uppercase border-r border-gray-300 sticky left-[52px] bg-gray-100 z-10"
                rowSpan={2}
              >
                Date
              </th>
              {results.map((result, i) => (
                <th 
                  key={i}
                  className="text-center py-2 px-2 text-xs font-medium uppercase border-r border-gray-300 last:border-r-0"
                  colSpan={scenarioColumns.length}
                  style={{ 
                    backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}15`,
                    color: CHART_COLORS[i % CHART_COLORS.length]
                  }}
                >
                  {result.scenario.name}
                </th>
              ))}
            </tr>
            {/* Header Row 2: Column names for each scenario */}
            <tr className="bg-gray-50 border-b border-gray-300">
              {results.map((_, scenarioIdx) => (
                <React.Fragment key={scenarioIdx}>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Opening
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Payment
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Interest
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Principal
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Overpay
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Closing
                  </th>
                  <th className={`text-center py-2 px-2 text-xs font-medium text-gray-600 uppercase whitespace-nowrap ${scenarioIdx < results.length - 1 ? 'border-r border-gray-300' : ''}`}>
                    Rate
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedMonths.map((month) => {
              // Get the first scenario's entry for this month to get the date
              const firstEntry = results[0]?.schedule.find(s => s.month === month);
              const isFixedPeriod = results.some(r => {
                const entry = r.schedule.find(s => s.month === month);
                return entry?.isFixedPeriod;
              });

              return (
                <tr 
                  key={month} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${!isFixedPeriod ? 'bg-amber-50' : ''}`}
                >
                  <td className="py-2 px-2 font-medium sticky left-0 bg-inherit z-10 border-r border-gray-200">
                    {month}
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap sticky left-[52px] bg-inherit z-10 border-r border-gray-200">
                    {firstEntry?.monthName || '—'}
                  </td>
                  {results.map((result, scenarioIdx) => {
                    const entry = result.schedule.find(s => s.month === month);
                    
                    if (!entry) {
                      // Scenario has ended (paid off early)
                      return (
                        <React.Fragment key={scenarioIdx}>
                          <td className="py-2 px-2 text-right text-gray-400" colSpan={7}>
                            Paid off
                          </td>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={scenarioIdx}>
                        <td className="py-2 px-2 text-right whitespace-nowrap">
                          {formatCurrency(entry.openingBalance)}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap">
                          {formatCurrency(entry.payment)}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap text-red-600">
                          {formatCurrency(entry.interest)}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap text-green-600">
                          {formatCurrency(entry.principal)}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap text-blue-600">
                          {entry.overpayment > 0 ? formatCurrency(entry.overpayment) : '—'}
                        </td>
                        <td className="py-2 px-2 text-right whitespace-nowrap font-medium">
                          {formatCurrency(entry.closingBalance)}
                        </td>
                        <td className={`py-2 px-2 text-center whitespace-nowrap ${scenarioIdx < results.length - 1 ? 'border-r border-gray-200' : ''}`}>
                          {formatNumber(entry.rate, 2)}%
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Bottom */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="text-sm text-gray-600">
          Showing months {displayedMonths[0]} - {displayedMonths[displayedMonths.length - 1]} of {maxScheduleLength}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToFirstPage}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            First
          </button>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
          <button
            onClick={goToLastPage}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};
