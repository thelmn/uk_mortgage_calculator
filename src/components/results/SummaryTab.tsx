'use client';

import React from 'react';
import { ScenarioResult, CHART_COLORS } from '@/types';
import { formatCurrency, formatNumber } from '@/engine';
import { InfoTooltip } from '@/components/ui';
import { SUMMARY_TOOLTIPS } from '@/constants/tooltips';

interface SummaryTabProps {
  results: ScenarioResult[];
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ results }) => {
  return (
    <>
      {/* Summary Table */}
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Monthly Payment Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-600 uppercase">Metric</th>
                {results.map((result, i) => (
                  <th key={i} className="text-left py-3 px-3 text-xs font-medium text-gray-600 uppercase">
                    {result.scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Property Price
                  <InfoTooltip content={SUMMARY_TOOLTIPS.propertyPrice} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.scenario.propertyPrice)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Deposit
                  <InfoTooltip content={SUMMARY_TOOLTIPS.deposit} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.scenario.deposit)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Mortgage Amount
                  <InfoTooltip content={SUMMARY_TOOLTIPS.mortgageAmount} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.principal)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Initial Monthly Payment
                  <InfoTooltip content={SUMMARY_TOOLTIPS.initialPayment} />
                </td>
                {results.map((result, i) => {
                  const minPayment = Math.min(...results.map(r => r.initialPayment));
                  return (
                    <td key={i} className={`py-3 px-3 text-sm font-medium ${result.initialPayment === minPayment ? 'bg-green-100 text-green-800' : ''}`}>
                      {formatCurrency(result.initialPayment)}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Average Monthly Payment
                  <InfoTooltip content={SUMMARY_TOOLTIPS.averagePayment} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.averagePayment)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Payment After Fixed Period
                  <InfoTooltip content={SUMMARY_TOOLTIPS.postFixPayment} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.postFixPayment)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Total Amount Paid
                  <InfoTooltip content={SUMMARY_TOOLTIPS.totalAmountPaid} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.totalPaid)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Total Interest Paid
                  <InfoTooltip content={SUMMARY_TOOLTIPS.totalInterestPaid} />
                </td>
                {results.map((result, i) => {
                  const maxInterest = Math.max(...results.map(r => r.totalInterest));
                  return (
                    <td key={i} className={`py-3 px-3 text-sm font-medium ${result.totalInterest === maxInterest ? 'bg-red-100 text-red-800' : ''}`}>
                      {formatCurrency(result.totalInterest)}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Time to Pay Off
                  <InfoTooltip content={SUMMARY_TOOLTIPS.timeToPayOff} />
                </td>
                {results.map((result, i) => {
                  const minTerm = Math.min(...results.map(r => r.actualTerm));
                  return (
                    <td key={i} className={`py-3 px-3 text-sm font-medium ${result.actualTerm === minTerm ? 'bg-green-100 text-green-800' : ''}`}>
                      {formatNumber(result.actualTerm, 1)} years
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 text-sm flex items-center">
                  Interest Saved (vs base)
                  <InfoTooltip content={SUMMARY_TOOLTIPS.interestSaved} />
                </td>
                {results.map((result, i) => {
                  const baseInterest = results[0].totalInterest;
                  const saved = baseInterest - result.totalInterest;
                  return (
                    <td key={i} className={`py-3 px-3 text-sm font-medium ${saved > 0 ? 'bg-green-100 text-green-800' : ''}`}>
                      {saved > 0 ? formatCurrency(saved) : '—'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded shadow-md p-6">
        <h2 className="text-lg font-medium mb-4">Additional Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-600 uppercase">Detail</th>
                {results.map((result, i) => (
                  <th key={i} className="text-left py-3 px-3 text-xs font-medium text-gray-600 uppercase">
                    {result.scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Fixed Period Payment
                  <InfoTooltip content={SUMMARY_TOOLTIPS.fixedPeriodPayment} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.initialPayment)}/mo</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Post-Fix Payment
                  <InfoTooltip content={SUMMARY_TOOLTIPS.postFixPaymentDetail} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.postFixPayment)}/mo</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Balance After Fixed Period
                  <InfoTooltip content={SUMMARY_TOOLTIPS.balanceAfterFix} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.balanceAfterFix)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Term Reduction
                  <InfoTooltip content={SUMMARY_TOOLTIPS.termReduction} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm bg-green-100 text-green-800 font-medium">
                    {formatNumber(result.termReduction * 12, 0)} months
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Total Overpayments
                  <InfoTooltip content={SUMMARY_TOOLTIPS.totalOverpayments} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.totalOverpayments)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  ERCs Paid
                  <InfoTooltip content={SUMMARY_TOOLTIPS.ercsPaid} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.totalERCs)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-3 text-sm flex items-center">
                  Initial Costs (excl. deposit)
                  <InfoTooltip content={SUMMARY_TOOLTIPS.initialCosts} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm">{formatCurrency(result.initialCosts)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 text-sm flex items-center">
                  Total Costs (incl. initial)
                  <InfoTooltip content={SUMMARY_TOOLTIPS.totalCosts} />
                </td>
                {results.map((result, i) => (
                  <td key={i} className="py-3 px-3 text-sm font-medium">{formatCurrency(result.totalPaid + result.initialCosts)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
