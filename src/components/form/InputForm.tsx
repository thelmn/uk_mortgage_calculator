'use client';

import React from 'react';
import { Scenario, LumpSumOverpayment, SURVEY_OPTIONS } from '@/types';
import { formatCurrency, calculateLTV, calculateStampDuty } from '@/engine';
import { Tabs, InputField, SelectField, CheckboxField, Button, CollapsibleSection, InfoTooltip } from '@/components/ui';
import { INPUT_TOOLTIPS } from '@/constants/tooltips';

interface InputFormProps {
  scenario: Scenario;
  scenarios: Scenario[];
  currentScenario: number;
  activeTab: string;
  showInitialCosts: boolean;
  onTabChange: (tab: string) => void;
  onShowInitialCostsChange: (show: boolean) => void;
  onUpdateScenario: (field: keyof Scenario, value: unknown) => void;
  onAddLumpSum: () => void;
  onUpdateLumpSum: (index: number, field: keyof LumpSumOverpayment, value: string | number) => void;
  onRemoveLumpSum: (index: number) => void;
  onCalculateResults: () => void;
  onAddNewScenario: () => void;
  onToggleScenario: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  onToggleLock: (index: number) => void;
  onDeleteScenario: (index: number) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  scenario,
  scenarios,
  currentScenario,
  activeTab,
  showInitialCosts,
  onTabChange,
  onShowInitialCostsChange,
  onUpdateScenario,
  onAddLumpSum,
  onUpdateLumpSum,
  onRemoveLumpSum,
  onCalculateResults,
  onAddNewScenario,
  onToggleScenario,
  onToggleVisibility,
  onToggleLock,
  onDeleteScenario,
}) => {
  const ltv = calculateLTV(scenario.propertyPrice, scenario.deposit);
  
  const estimatedInitialCosts = 
    calculateStampDuty(scenario.propertyPrice, scenario.isFirstTimeBuyer, scenario.isAdditionalProperty, scenario.isNonResident) +
    scenario.solicitorFees + scenario.disbursements + 
    (scenario.surveyType === 'custom' ? scenario.surveyCost : 
      { none: 0, basic: 300, homebuyer: 600, full: 1200 }[scenario.surveyType]) +
    scenario.brokerFee + scenario.valuationFee + scenario.buildingsInsurance +
    scenario.movingCosts + scenario.furnitureRenovation +
    (!scenario.addFeeToMortgage ? scenario.productFee : 0) + scenario.bookingFee;

  const fixedPeriodOptions = [
    { value: 0, label: 'None' },
    { value: 2, label: '2 years' },
    { value: 3, label: '3 years' },
    { value: 5, label: '5 years' },
    { value: 7, label: '7 years' },
    { value: 10, label: '10 years' },
  ];

  // Other scenarios (not the currently selected one)
  const otherScenarios = scenarios.filter((_, index) => index !== currentScenario);

  return (
    <div className="w-96 bg-white border-r border-gray-300 flex flex-col">
      {/* ===== CURRENT SCENARIO SECTION (fills available height) ===== */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Scenario Header */}
        <div className="px-6 py-3 bg-primary text-white border-b border-gray-300">
          <h2 className="font-medium text-lg">{scenario.name}</h2>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={['Simple', 'Advanced']}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {/* Form Content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {!scenario.locked ? (
            <>
              {/* Property Details */}
              <div className="mb-8">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-4">Property Details</h3>
                <div className="space-y-5">
                  <InputField
                    label="Property Price"
                    type="number"
                    value={scenario.propertyPrice}
                    onChange={(v) => onUpdateScenario('propertyPrice', v)}
                    tooltip={INPUT_TOOLTIPS.propertyPrice}
                  />
                  <div className="flex gap-3">
                    <InputField
                      label="Deposit"
                      type="number"
                      value={scenario.deposit}
                      onChange={(v) => onUpdateScenario('deposit', v)}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.deposit}
                    />
                    <InputField
                      label="LTV"
                      type="text"
                      value={`${ltv}%`}
                      disabled
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.ltv}
                    />
                  </div>
                </div>
              </div>

              {/* Mortgage Details */}
              <div className="mb-8">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-4">Mortgage Details</h3>
                <div className="space-y-5">
                  <InputField
                    label="Mortgage Amount"
                    type="text"
                    value={formatCurrency(scenario.propertyPrice - scenario.deposit)}
                    disabled
                    highlightClass="bg-green-50"
                    tooltip={INPUT_TOOLTIPS.mortgageAmount}
                  />
                  <div className="flex gap-3">
                    <InputField
                      label="Term (years)"
                      type="number"
                      value={scenario.mortgageTerm}
                      onChange={(v) => onUpdateScenario('mortgageTerm', v)}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.mortgageTerm}
                    />
                    <InputField
                      label="Interest Rate (%)"
                      type="number"
                      step="0.01"
                      value={scenario.interestRate}
                      onChange={(v) => onUpdateScenario('interestRate', v)}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.interestRate}
                    />
                  </div>
                  <div className="flex gap-3">
                    <SelectField
                      label="Fixed Period (years)"
                      value={scenario.fixedPeriod}
                      options={fixedPeriodOptions}
                      onChange={(v) => onUpdateScenario('fixedPeriod', Number(v))}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.fixedPeriod}
                    />
                    <InputField
                      label="Rate After Fix (%)"
                      type="number"
                      step="0.01"
                      value={scenario.postFixRate}
                      onChange={(v) => onUpdateScenario('postFixRate', v)}
                      disabled={scenario.fixedPeriod === 0}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.postFixRate}
                    />
                  </div>
                  <div className="flex gap-3">
                    <InputField
                      label="Payment Date"
                      type="number"
                      min={1}
                      max={28}
                      value={scenario.paymentDay}
                      onChange={(v) => onUpdateScenario('paymentDay', v)}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.paymentDay}
                    />
                    <InputField
                      label="Interest Charge Date"
                      type="number"
                      min={1}
                      max={28}
                      value={scenario.chargeDay}
                      onChange={(v) => onUpdateScenario('chargeDay', v)}
                      className="flex-1"
                      tooltip={INPUT_TOOLTIPS.chargeDay}
                    />
                  </div>
                </div>
              </div>

              {/* Overpayments */}
              <div className="mb-8">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-4">Overpayments</h3>
                <div className="space-y-5">
                  <InputField
                    label="Regular Monthly Overpayment"
                    type="number"
                    value={scenario.monthlyOverpayment}
                    onChange={(v) => onUpdateScenario('monthlyOverpayment', v)}
                    tooltip={INPUT_TOOLTIPS.monthlyOverpayment}
                  />
                  
                  {scenario.lumpSumOverpayments.map((ls, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <InputField
                        label="Date (YYYY-MM)"
                        type="text"
                        value={ls.date}
                        onChange={(v) => onUpdateLumpSum(index, 'date', String(v))}
                        placeholder="2025-06"
                        className="flex-1"
                        tooltip={index === 0 ? INPUT_TOOLTIPS.lumpSumDate : undefined}
                      />
                      <InputField
                        label="Amount"
                        type="number"
                        value={ls.amount}
                        onChange={(v) => onUpdateLumpSum(index, 'amount', Number(v))}
                        className="flex-1"
                        tooltip={index === 0 ? INPUT_TOOLTIPS.lumpSumAmount : undefined}
                      />
                      <button
                        onClick={() => onRemoveLumpSum(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <Button variant="secondary" onClick={onAddLumpSum} className="w-full">
                    + Add Lump Sum
                  </Button>
                </div>
              </div>

              {/* Advanced Options */}
              {activeTab === 'Advanced' && (
                <div className="mb-8">
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-4">Product Fees</h3>
                  <div className="space-y-5">
                    <InputField
                      label="Product/Arrangement Fee"
                      type="number"
                      value={scenario.productFee}
                      onChange={(v) => onUpdateScenario('productFee', v)}
                      tooltip={INPUT_TOOLTIPS.productFee}
                    />
                    <CheckboxField
                      label="Add fee to mortgage"
                      checked={scenario.addFeeToMortgage}
                      onChange={(v) => onUpdateScenario('addFeeToMortgage', v)}
                      tooltip={INPUT_TOOLTIPS.addFeeToMortgage}
                    />
                    <InputField
                      label="Booking Fee"
                      type="number"
                      value={scenario.bookingFee}
                      onChange={(v) => onUpdateScenario('bookingFee', v)}
                      tooltip={INPUT_TOOLTIPS.bookingFee}
                    />
                  </div>

                  <h3 className="flex items-center text-xs font-medium text-gray-600 uppercase tracking-wide mb-4 mt-8">
                    Early Repayment Charges
                    <InfoTooltip content={INPUT_TOOLTIPS.ercRates} />
                  </h3>
                  <div className="space-y-5">
                    <CheckboxField
                      label="ERCs apply"
                      checked={scenario.hasERC}
                      onChange={(v) => onUpdateScenario('hasERC', v)}
                      tooltip={INPUT_TOOLTIPS.hasERC}
                    />
                    {scenario.hasERC && (
                      <>
                        <InputField
                          label="Annual Overpayment Allowance (%)"
                          type="number"
                          value={scenario.annualAllowance}
                          onChange={(v) => onUpdateScenario('annualAllowance', v)}
                          tooltip={INPUT_TOOLTIPS.annualAllowance}
                        />
                        <div className="space-y-2">
                          <label className="block text-xs text-gray-600">ERC Rates by Year (%)</label>
                          {scenario.ercRates.map((rate, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-16">Year {i + 1}:</span>
                              <input
                                type="number"
                                step="0.1"
                                value={rate}
                                onChange={(e) => {
                                  const newRates = [...scenario.ercRates];
                                  newRates[i] = Number(e.target.value);
                                  onUpdateScenario('ercRates', newRates);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-primary focus:border-2"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Initial Costs */}
              <div className="mb-6">
                <CollapsibleSection
                  title="Initial Costs"
                  subtitle={`Estimated: ${formatCurrency(estimatedInitialCosts)}`}
                  isOpen={showInitialCosts}
                  onToggle={() => onShowInitialCostsChange(!showInitialCosts)}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 uppercase mb-3">Buyer Type</h4>
                      <div className="space-y-2">
                        <CheckboxField
                          label="First-time buyer"
                          checked={scenario.isFirstTimeBuyer}
                          onChange={(v) => onUpdateScenario('isFirstTimeBuyer', v)}
                          tooltip={INPUT_TOOLTIPS.isFirstTimeBuyer}
                        />
                        <CheckboxField
                          label="Additional property"
                          checked={scenario.isAdditionalProperty}
                          onChange={(v) => onUpdateScenario('isAdditionalProperty', v)}
                          tooltip={INPUT_TOOLTIPS.isAdditionalProperty}
                        />
                        <CheckboxField
                          label="Non-UK resident"
                          checked={scenario.isNonResident}
                          onChange={(v) => onUpdateScenario('isNonResident', v)}
                          tooltip={INPUT_TOOLTIPS.isNonResident}
                        />
                      </div>
                    </div>
                    
                    <InputField
                      label="Stamp Duty (auto-calculated)"
                      type="text"
                      value={formatCurrency(calculateStampDuty(scenario.propertyPrice, scenario.isFirstTimeBuyer, scenario.isAdditionalProperty, scenario.isNonResident))}
                      disabled
                      highlightClass="bg-green-50"
                      tooltip={INPUT_TOOLTIPS.stampDuty}
                    />
                    
                    <InputField
                      label="Solicitor/Conveyancer Fees"
                      type="number"
                      value={scenario.solicitorFees}
                      onChange={(v) => onUpdateScenario('solicitorFees', v)}
                      tooltip={INPUT_TOOLTIPS.solicitorFees}
                    />
                    
                    <InputField
                      label="Disbursements"
                      type="number"
                      value={scenario.disbursements}
                      onChange={(v) => onUpdateScenario('disbursements', v)}
                      tooltip={INPUT_TOOLTIPS.disbursements}
                    />
                    
                    <SelectField
                      label="Survey Type"
                      value={scenario.surveyType}
                      options={SURVEY_OPTIONS}
                      onChange={(v) => onUpdateScenario('surveyType', v)}
                      tooltip={INPUT_TOOLTIPS.surveyType}
                    />
                    
                    {scenario.surveyType === 'custom' && (
                      <InputField
                        label="Custom Survey Cost"
                        type="number"
                        value={scenario.surveyCost}
                        onChange={(v) => onUpdateScenario('surveyCost', v)}
                        tooltip={INPUT_TOOLTIPS.surveyCost}
                      />
                    )}
                    
                    <InputField
                      label="Mortgage Broker Fee"
                      type="number"
                      value={scenario.brokerFee}
                      onChange={(v) => onUpdateScenario('brokerFee', v)}
                      tooltip={INPUT_TOOLTIPS.brokerFee}
                    />
                    
                    <InputField
                      label="Valuation Fee"
                      type="number"
                      value={scenario.valuationFee}
                      onChange={(v) => onUpdateScenario('valuationFee', v)}
                      tooltip={INPUT_TOOLTIPS.valuationFee}
                    />
                    
                    <InputField
                      label="Buildings Insurance (annual)"
                      type="number"
                      value={scenario.buildingsInsurance}
                      onChange={(v) => onUpdateScenario('buildingsInsurance', v)}
                      tooltip={INPUT_TOOLTIPS.buildingsInsurance}
                    />
                    
                    <InputField
                      label="Moving Costs"
                      type="number"
                      value={scenario.movingCosts}
                      onChange={(v) => onUpdateScenario('movingCosts', v)}
                      tooltip={INPUT_TOOLTIPS.movingCosts}
                    />
                    
                    <InputField
                      label="Furniture/Renovation"
                      type="number"
                      value={scenario.furnitureRenovation}
                      onChange={(v) => onUpdateScenario('furnitureRenovation', v)}
                      tooltip={INPUT_TOOLTIPS.furnitureRenovation}
                    />
                  </div>
                </CollapsibleSection>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-12">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">Scenario Locked</p>
              <p className="text-sm mt-2">Unlock to edit parameters</p>
            </div>
          )}
        </div>

        {/* Form Actions (pinned to bottom of current scenario section) */}
        <div className="p-4 border-t border-gray-300 bg-white flex-shrink-0">
          <Button onClick={onCalculateResults} className="w-full">
            Show Results
          </Button>
          {scenario.hasResults && (
            <Button variant="secondary" onClick={onAddNewScenario} className="w-full mt-2">
              + New Scenario
            </Button>
          )}
        </div>
      </div>

      {/* ===== OTHER SCENARIOS LIST (pinned to bottom) ===== */}
      {otherScenarios.length > 0 && (
        <div className="border-t-2 border-gray-300 bg-gray-50 flex-shrink-0">
          <div className="px-4 py-2 bg-gray-200 border-b border-gray-300">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Other Scenarios ({otherScenarios.length})
            </h3>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {scenarios.map((s, index) => {
              if (index === currentScenario) return null;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition"
                >
                  <button
                    onClick={() => onToggleScenario(index)}
                    className="flex-1 text-left font-medium text-sm text-gray-700 hover:text-primary"
                  >
                    {s.name}
                    {s.hasResults && (
                      <span className="ml-2 text-xs text-green-600">✓</span>
                    )}
                  </button>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => onToggleVisibility(index)}
                      className={`p-1.5 rounded transition ${s.visible ? 'text-primary hover:bg-primary/10' : 'text-gray-400 hover:bg-gray-200'}`}
                      title={s.visible ? 'Hide from results' : 'Show in results'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        {s.visible ? (
                          <>
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </>
                        ) : (
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleLock(index)}
                      className={`p-1.5 rounded transition ${s.locked ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-200'}`}
                      title={s.locked ? 'Unlock' : 'Lock'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        {s.locked ? (
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        ) : (
                          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteScenario(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete scenario"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
