'use client';

import React, { useEffect, useRef } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="help-modal-title" className="text-xl font-semibold text-gray-800">
            How to Use This Calculator
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Quick Start */}
          <section className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-2">🚀 Quick Start</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Enter your <strong>property price</strong> and <strong>deposit</strong> (or LTV percentage)</li>
              <li>Set your <strong>mortgage term</strong> and <strong>interest rate</strong></li>
              <li>Click <strong>Calculate</strong> to see your results</li>
              <li>View the <strong>Summary</strong>, <strong>Visualizations</strong>, and <strong>Schedule</strong> tabs</li>
            </ol>
          </section>

          {/* Comparing Scenarios */}
          <section className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-2">📊 Comparing Scenarios</h3>
            <p className="text-gray-700 mb-2">
              Compare up to 4 different mortgage scenarios side-by-side:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Click <strong>+ Add Scenario</strong> to create additional scenarios</li>
              <li>Each scenario can have different rates, terms, or overpayment strategies</li>
              <li>Use the <strong>duplicate</strong> button to copy an existing scenario as a starting point</li>
              <li>Charts and tables update automatically to compare all scenarios</li>
            </ul>
          </section>

          {/* Overpayments */}
          <section className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-2">💰 Overpayments</h3>
            <p className="text-gray-700 mb-2">
              See how extra payments can save you money:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li><strong>Monthly overpayment:</strong> A fixed extra amount paid each month</li>
              <li><strong>Lump sum:</strong> A one-off payment at a specific date</li>
              <li>Most lenders allow 10% overpayment per year without penalty</li>
              <li>Enable <strong>ERCs</strong> to see charges for exceeding your annual allowance</li>
            </ul>
            <div className="mt-2 p-3 bg-blue-50 rounded text-sm text-blue-800">
              <strong>Tip:</strong> Compare a scenario with overpayments to one without to see your potential savings.
            </div>
          </section>

          {/* Understanding Results */}
          <section className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-2">📈 Understanding Your Results</h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <strong>Summary Tab:</strong> Key figures including monthly payments, total interest, 
                and how much you could save with overpayments.
              </div>
              <div>
                <strong>Visualizations Tab:</strong> Charts showing your balance over time, 
                payment timeline, and how interest vs capital changes throughout the mortgage.
              </div>
              <div>
                <strong>Schedule Tab:</strong> Month-by-month breakdown of every payment, 
                showing exactly how your balance decreases over time.
              </div>
            </div>
          </section>

          {/* Initial Costs */}
          <section className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-2">🏠 Initial Costs</h3>
            <p className="text-gray-700 mb-2">
              Expand the <strong>Initial Purchase Costs</strong> section to estimate all upfront expenses:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li><strong>Stamp Duty:</strong> Automatically calculated based on property price and buyer status</li>
              <li><strong>Legal fees:</strong> Solicitor costs and disbursements</li>
              <li><strong>Survey costs:</strong> Choose your survey type</li>
              <li><strong>Other costs:</strong> Moving, furniture, broker fees, etc.</li>
            </ul>
          </section>

          {/* Exporting */}
          <section className="mb-6">
            <h3 className="text-lg font-medium text-primary mb-2">📤 Exporting Results</h3>
            <p className="text-gray-700 mb-2">
              Use the <strong>Export</strong> button in the top-right corner:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li><strong>Excel:</strong> Full data with separate sheets for summary, schedule, and initial costs</li>
              <li><strong>PDF:</strong> Printable report with summary tables and charts</li>
            </ul>
          </section>

          {/* Tips */}
          <section className="mb-2">
            <h3 className="text-lg font-medium text-primary mb-2">💡 Pro Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Click the <strong>ℹ️ info icons</strong> next to any field for detailed explanations</li>
              <li>Set a realistic <strong>post-fix rate</strong> (typically SVR at 7-8%) to see true long-term costs</li>
              <li>The <strong>Interest Saved</strong> metric shows savings compared to Scenario 1</li>
              <li>Consider adding fees to mortgage vs paying upfront—the calculator shows the impact</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
