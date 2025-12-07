'use client';

import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx';
import { ScenarioResult } from '@/types';

// Summary row type - each row has metric + value per scenario
interface SummaryRow {
  metric: string;
  scenario_0?: number | string;
  scenario_1?: number | string;
  scenario_2?: number | string;
  scenario_3?: number | string;
  scenario_4?: number | string;
}

// Input row type - each row has category, field, + value per scenario
interface InputRow {
  category: string;
  field: string;
  scenario_0?: number | string;
  scenario_1?: number | string;
  scenario_2?: number | string;
  scenario_3?: number | string;
  scenario_4?: number | string;
}

// Amortization row type
interface AmortRow {
  month: number;
  year: number;
  monthName: string;
  opening_0?: number | string;
  payment_0?: number | string;
  interest_0?: number | string;
  principal_0?: number | string;
  overpayment_0?: number | string;
  erc_0?: number | string;
  closing_0?: number | string;
  rate_0?: number | string;
  fixed_0?: string;
  opening_1?: number | string;
  payment_1?: number | string;
  interest_1?: number | string;
  principal_1?: number | string;
  overpayment_1?: number | string;
  erc_1?: number | string;
  closing_1?: number | string;
  rate_1?: number | string;
  fixed_1?: string;
  opening_2?: number | string;
  payment_2?: number | string;
  interest_2?: number | string;
  principal_2?: number | string;
  overpayment_2?: number | string;
  erc_2?: number | string;
  closing_2?: number | string;
  rate_2?: number | string;
  fixed_2?: string;
  opening_3?: number | string;
  payment_3?: number | string;
  interest_3?: number | string;
  principal_3?: number | string;
  overpayment_3?: number | string;
  erc_3?: number | string;
  closing_3?: number | string;
  rate_3?: number | string;
  fixed_3?: string;
  opening_4?: number | string;
  payment_4?: number | string;
  interest_4?: number | string;
  principal_4?: number | string;
  overpayment_4?: number | string;
  erc_4?: number | string;
  closing_4?: number | string;
  rate_4?: number | string;
  fixed_4?: string;
}

// Helper to create summary table data
function createPaymentSummaryData(results: ScenarioResult[]): SummaryRow[] {
  const metrics: Array<{ metric: string; getValue: (r: ScenarioResult, i: number, results: ScenarioResult[]) => number | string }> = [
    { metric: 'Property Price', getValue: (r) => r.scenario.propertyPrice },
    { metric: 'Deposit', getValue: (r) => r.scenario.deposit },
    { metric: 'Mortgage Amount', getValue: (r) => r.principal },
    { metric: 'Initial Monthly Payment', getValue: (r) => r.initialPayment },
    { metric: 'Average Monthly Payment', getValue: (r) => r.averagePayment },
    { metric: 'Payment After Fixed Period', getValue: (r) => r.postFixPayment },
    { metric: 'Total Amount Paid', getValue: (r) => r.totalPaid },
    { metric: 'Total Interest Paid', getValue: (r) => r.totalInterest },
    { metric: 'Time to Pay Off (years)', getValue: (r) => Math.round(r.actualTerm * 10) / 10 },
    { metric: 'Interest Saved (vs base)', getValue: (r, i, all) => i === 0 ? 0 : Math.round((all[0].totalInterest - r.totalInterest) * 100) / 100 },
  ];
  
  return metrics.map(({ metric, getValue }) => {
    const row: SummaryRow = { metric };
    results.forEach((r, i) => {
      if (i === 0) row.scenario_0 = getValue(r, i, results);
      if (i === 1) row.scenario_1 = getValue(r, i, results);
      if (i === 2) row.scenario_2 = getValue(r, i, results);
      if (i === 3) row.scenario_3 = getValue(r, i, results);
      if (i === 4) row.scenario_4 = getValue(r, i, results);
    });
    return row;
  });
}

function createAdditionalDetailsData(results: ScenarioResult[]): SummaryRow[] {
  const metrics: Array<{ metric: string; getValue: (r: ScenarioResult) => number | string }> = [
    { metric: 'Fixed Period Payment', getValue: (r) => r.initialPayment },
    { metric: 'Post-Fix Payment', getValue: (r) => r.postFixPayment },
    { metric: 'Balance After Fixed Period', getValue: (r) => r.balanceAfterFix },
    { metric: 'Term Reduction (months)', getValue: (r) => Math.round(r.termReduction * 12) },
    { metric: 'Total Overpayments', getValue: (r) => r.totalOverpayments },
    { metric: 'ERCs Paid', getValue: (r) => r.totalERCs },
    { metric: 'Initial Costs (excl. deposit)', getValue: (r) => r.initialCosts },
    { metric: 'Total Costs (incl. initial)', getValue: (r) => r.totalPaid + r.initialCosts },
  ];
  
  return metrics.map(({ metric, getValue }) => {
    const row: SummaryRow = { metric };
    results.forEach((r, i) => {
      if (i === 0) row.scenario_0 = getValue(r);
      if (i === 1) row.scenario_1 = getValue(r);
      if (i === 2) row.scenario_2 = getValue(r);
      if (i === 3) row.scenario_3 = getValue(r);
      if (i === 4) row.scenario_4 = getValue(r);
    });
    return row;
  });
}

function createInitialCostsData(results: ScenarioResult[]): SummaryRow[] {
  const metrics: Array<{ metric: string; getValue: (r: ScenarioResult) => number | string }> = [
    { metric: 'Stamp Duty', getValue: (r) => r.stampDuty },
    { metric: 'Solicitor Fees', getValue: (r) => r.scenario.solicitorFees },
    { metric: 'Disbursements', getValue: (r) => r.scenario.disbursements },
    { metric: 'Survey Cost', getValue: (r) => r.scenario.surveyCost },
    { metric: 'Broker Fee', getValue: (r) => r.scenario.brokerFee },
    { metric: 'Valuation Fee', getValue: (r) => r.scenario.valuationFee },
    { metric: 'Product Fee (if not added to mortgage)', getValue: (r) => r.scenario.addFeeToMortgage ? 0 : r.scenario.productFee },
    { metric: 'Booking Fee', getValue: (r) => r.scenario.bookingFee },
    { metric: 'Buildings Insurance', getValue: (r) => r.scenario.buildingsInsurance },
    { metric: 'Moving Costs', getValue: (r) => r.scenario.movingCosts },
    { metric: 'Furniture & Renovation', getValue: (r) => r.scenario.furnitureRenovation },
    { metric: 'Total Initial Costs', getValue: (r) => r.initialCosts },
  ];
  
  return metrics.map(({ metric, getValue }) => {
    const row: SummaryRow = { metric };
    results.forEach((r, i) => {
      if (i === 0) row.scenario_0 = getValue(r);
      if (i === 1) row.scenario_1 = getValue(r);
      if (i === 2) row.scenario_2 = getValue(r);
      if (i === 3) row.scenario_3 = getValue(r);
      if (i === 4) row.scenario_4 = getValue(r);
    });
    return row;
  });
}

function createInputsData(results: ScenarioResult[]): InputRow[] {
  const inputs: Array<{ category: string; field: string; getValue: (s: ScenarioResult['scenario'], r: ScenarioResult) => number | string }> = [
    // Property Details
    { category: 'Property Details', field: 'Property Price', getValue: (s) => s.propertyPrice },
    { category: 'Property Details', field: 'Deposit', getValue: (s) => s.deposit },
    { category: 'Property Details', field: 'Loan-to-Value (%)', getValue: (s) => Math.round((s.propertyPrice - s.deposit) / s.propertyPrice * 10000) / 100 },
    
    // Mortgage Details
    { category: 'Mortgage Details', field: 'Mortgage Term (years)', getValue: (s) => s.mortgageTerm },
    { category: 'Mortgage Details', field: 'Interest Rate (%)', getValue: (s) => s.interestRate },
    { category: 'Mortgage Details', field: 'Fixed Period (years)', getValue: (s) => s.fixedPeriod },
    { category: 'Mortgage Details', field: 'Post-Fix Rate (%)', getValue: (s) => s.postFixRate },
    { category: 'Mortgage Details', field: 'Payment Day', getValue: (s) => s.paymentDay },
    { category: 'Mortgage Details', field: 'Charge Day', getValue: (s) => s.chargeDay },
    
    // Overpayments
    { category: 'Overpayments', field: 'Monthly Overpayment', getValue: (s) => s.monthlyOverpayment },
    { category: 'Overpayments', field: 'Lump Sum Overpayments', getValue: (s) => 
      s.lumpSumOverpayments.length > 0 
        ? s.lumpSumOverpayments.map(l => `${l.date}: £${l.amount}`).join('; ')
        : 'None'
    },
    
    // Fees
    { category: 'Fees', field: 'Product Fee', getValue: (s) => s.productFee },
    { category: 'Fees', field: 'Add Fee to Mortgage', getValue: (s) => s.addFeeToMortgage ? 'Yes' : 'No' },
    { category: 'Fees', field: 'Booking Fee', getValue: (s) => s.bookingFee },
    
    // ERC
    { category: 'ERC', field: 'Has ERC', getValue: (s) => s.hasERC ? 'Yes' : 'No' },
    { category: 'ERC', field: 'Annual Allowance (%)', getValue: (s) => s.annualAllowance },
    { category: 'ERC', field: 'ERC Rates (%)', getValue: (s) => s.ercRates.join(', ') },
    
    // Initial Costs
    { category: 'Initial Costs', field: 'First Time Buyer', getValue: (s) => s.isFirstTimeBuyer ? 'Yes' : 'No' },
    { category: 'Initial Costs', field: 'Additional Property', getValue: (s) => s.isAdditionalProperty ? 'Yes' : 'No' },
    { category: 'Initial Costs', field: 'Non-Resident', getValue: (s) => s.isNonResident ? 'Yes' : 'No' },
    { category: 'Initial Costs', field: 'Solicitor Fees', getValue: (s) => s.solicitorFees },
    { category: 'Initial Costs', field: 'Disbursements', getValue: (s) => s.disbursements },
    { category: 'Initial Costs', field: 'Survey Cost', getValue: (s) => s.surveyCost },
    { category: 'Initial Costs', field: 'Broker Fee', getValue: (s) => s.brokerFee },
    { category: 'Initial Costs', field: 'Valuation Fee', getValue: (s) => s.valuationFee },
    { category: 'Initial Costs', field: 'Buildings Insurance', getValue: (s) => s.buildingsInsurance },
    { category: 'Initial Costs', field: 'Moving Costs', getValue: (s) => s.movingCosts },
    { category: 'Initial Costs', field: 'Furniture & Renovation', getValue: (s) => s.furnitureRenovation },
    
    // Calculated
    { category: 'Calculated', field: 'Stamp Duty', getValue: (_, r) => r.stampDuty },
    { category: 'Calculated', field: 'Total Initial Costs', getValue: (_, r) => r.initialCosts },
  ];
  
  return inputs.map(({ category, field, getValue }) => {
    const row: InputRow = { category, field };
    results.forEach((r, i) => {
      if (i === 0) row.scenario_0 = getValue(r.scenario, r);
      if (i === 1) row.scenario_1 = getValue(r.scenario, r);
      if (i === 2) row.scenario_2 = getValue(r.scenario, r);
      if (i === 3) row.scenario_3 = getValue(r.scenario, r);
      if (i === 4) row.scenario_4 = getValue(r.scenario, r);
    });
    return row;
  });
}

function createAmortizationData(results: ScenarioResult[]): AmortRow[] {
  const maxLength = Math.max(...results.map(r => r.schedule.length));
  const rows: AmortRow[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const row: AmortRow = {
      month: i + 1,
      year: Math.floor(i / 12) + 1,
      monthName: '',
    };
    
    results.forEach((result, idx) => {
      const entry = result.schedule[i];
      if (entry) {
        if (idx === 0) row.monthName = entry.monthName;
        
        if (idx === 0) {
          row.opening_0 = Math.round(entry.openingBalance * 100) / 100;
          row.payment_0 = Math.round(entry.payment * 100) / 100;
          row.interest_0 = Math.round(entry.interest * 100) / 100;
          row.principal_0 = Math.round(entry.principal * 100) / 100;
          row.overpayment_0 = Math.round(entry.overpayment * 100) / 100;
          row.erc_0 = Math.round(entry.erc * 100) / 100;
          row.closing_0 = Math.round(entry.closingBalance * 100) / 100;
          row.rate_0 = entry.rate;
          row.fixed_0 = entry.isFixedPeriod ? 'Yes' : 'No';
        }
        if (idx === 1) {
          row.opening_1 = Math.round(entry.openingBalance * 100) / 100;
          row.payment_1 = Math.round(entry.payment * 100) / 100;
          row.interest_1 = Math.round(entry.interest * 100) / 100;
          row.principal_1 = Math.round(entry.principal * 100) / 100;
          row.overpayment_1 = Math.round(entry.overpayment * 100) / 100;
          row.erc_1 = Math.round(entry.erc * 100) / 100;
          row.closing_1 = Math.round(entry.closingBalance * 100) / 100;
          row.rate_1 = entry.rate;
          row.fixed_1 = entry.isFixedPeriod ? 'Yes' : 'No';
        }
        if (idx === 2) {
          row.opening_2 = Math.round(entry.openingBalance * 100) / 100;
          row.payment_2 = Math.round(entry.payment * 100) / 100;
          row.interest_2 = Math.round(entry.interest * 100) / 100;
          row.principal_2 = Math.round(entry.principal * 100) / 100;
          row.overpayment_2 = Math.round(entry.overpayment * 100) / 100;
          row.erc_2 = Math.round(entry.erc * 100) / 100;
          row.closing_2 = Math.round(entry.closingBalance * 100) / 100;
          row.rate_2 = entry.rate;
          row.fixed_2 = entry.isFixedPeriod ? 'Yes' : 'No';
        }
        if (idx === 3) {
          row.opening_3 = Math.round(entry.openingBalance * 100) / 100;
          row.payment_3 = Math.round(entry.payment * 100) / 100;
          row.interest_3 = Math.round(entry.interest * 100) / 100;
          row.principal_3 = Math.round(entry.principal * 100) / 100;
          row.overpayment_3 = Math.round(entry.overpayment * 100) / 100;
          row.erc_3 = Math.round(entry.erc * 100) / 100;
          row.closing_3 = Math.round(entry.closingBalance * 100) / 100;
          row.rate_3 = entry.rate;
          row.fixed_3 = entry.isFixedPeriod ? 'Yes' : 'No';
        }
        if (idx === 4) {
          row.opening_4 = Math.round(entry.openingBalance * 100) / 100;
          row.payment_4 = Math.round(entry.payment * 100) / 100;
          row.interest_4 = Math.round(entry.interest * 100) / 100;
          row.principal_4 = Math.round(entry.principal * 100) / 100;
          row.overpayment_4 = Math.round(entry.overpayment * 100) / 100;
          row.erc_4 = Math.round(entry.erc * 100) / 100;
          row.closing_4 = Math.round(entry.closingBalance * 100) / 100;
          row.rate_4 = entry.rate;
          row.fixed_4 = entry.isFixedPeriod ? 'Yes' : 'No';
        }
      }
    });
    
    rows.push(row);
  }
  
  return rows;
}

export async function exportToExcel(results: ScenarioResult[]): Promise<void> {
  const scenarioNames = results.map(r => r.scenario.name);
  
  // Build summary schema
  const summarySchema = ExcelSchemaBuilder.create<SummaryRow>()
    .column('metric', { key: 'metric', label: 'Metric' })
    .column('scenario_0', { key: 'scenario_0', label: scenarioNames[0] || 'Scenario 1', format: '"£"#,##0.00' })
    .column('scenario_1', { key: 'scenario_1', label: scenarioNames[1] || 'Scenario 2', format: '"£"#,##0.00' })
    .column('scenario_2', { key: 'scenario_2', label: scenarioNames[2] || 'Scenario 3', format: '"£"#,##0.00' })
    .column('scenario_3', { key: 'scenario_3', label: scenarioNames[3] || 'Scenario 4', format: '"£"#,##0.00' })
    .column('scenario_4', { key: 'scenario_4', label: scenarioNames[4] || 'Scenario 5', format: '"£"#,##0.00' })
    .build();
  
  // Build inputs schema
  const inputsSchema = ExcelSchemaBuilder.create<InputRow>()
    .column('category', { key: 'category', label: 'Category' })
    .column('field', { key: 'field', label: 'Input' })
    .column('scenario_0', { key: 'scenario_0', label: scenarioNames[0] || 'Scenario 1' })
    .column('scenario_1', { key: 'scenario_1', label: scenarioNames[1] || 'Scenario 2' })
    .column('scenario_2', { key: 'scenario_2', label: scenarioNames[2] || 'Scenario 3' })
    .column('scenario_3', { key: 'scenario_3', label: scenarioNames[3] || 'Scenario 4' })
    .column('scenario_4', { key: 'scenario_4', label: scenarioNames[4] || 'Scenario 5' })
    .build();
  
  // Build amortization schema
  const amortSchemaBuilder = ExcelSchemaBuilder.create<AmortRow>()
    .column('month', { key: 'month', label: 'Month #' })
    .column('year', { key: 'year', label: 'Year' })
    .column('monthName', { key: 'monthName', label: 'Date' });
  
  // Add columns for each scenario
  for (let i = 0; i < Math.min(results.length, 5); i++) {
    const name = results[i].scenario.name;
    if (i === 0) {
      amortSchemaBuilder
        .column('opening_0', { key: 'opening_0', label: `${name} - Opening`, format: '"£"#,##0.00' })
        .column('payment_0', { key: 'payment_0', label: `${name} - Payment`, format: '"£"#,##0.00' })
        .column('interest_0', { key: 'interest_0', label: `${name} - Interest`, format: '"£"#,##0.00' })
        .column('principal_0', { key: 'principal_0', label: `${name} - Principal`, format: '"£"#,##0.00' })
        .column('overpayment_0', { key: 'overpayment_0', label: `${name} - Overpayment`, format: '"£"#,##0.00' })
        .column('erc_0', { key: 'erc_0', label: `${name} - ERC`, format: '"£"#,##0.00' })
        .column('closing_0', { key: 'closing_0', label: `${name} - Closing`, format: '"£"#,##0.00' })
        .column('rate_0', { key: 'rate_0', label: `${name} - Rate %`, format: '0.00"%"' })
        .column('fixed_0', { key: 'fixed_0', label: `${name} - Fixed?` });
    }
    if (i === 1) {
      amortSchemaBuilder
        .column('opening_1', { key: 'opening_1', label: `${name} - Opening`, format: '"£"#,##0.00' })
        .column('payment_1', { key: 'payment_1', label: `${name} - Payment`, format: '"£"#,##0.00' })
        .column('interest_1', { key: 'interest_1', label: `${name} - Interest`, format: '"£"#,##0.00' })
        .column('principal_1', { key: 'principal_1', label: `${name} - Principal`, format: '"£"#,##0.00' })
        .column('overpayment_1', { key: 'overpayment_1', label: `${name} - Overpayment`, format: '"£"#,##0.00' })
        .column('erc_1', { key: 'erc_1', label: `${name} - ERC`, format: '"£"#,##0.00' })
        .column('closing_1', { key: 'closing_1', label: `${name} - Closing`, format: '"£"#,##0.00' })
        .column('rate_1', { key: 'rate_1', label: `${name} - Rate %`, format: '0.00"%"' })
        .column('fixed_1', { key: 'fixed_1', label: `${name} - Fixed?` });
    }
    if (i === 2) {
      amortSchemaBuilder
        .column('opening_2', { key: 'opening_2', label: `${name} - Opening`, format: '"£"#,##0.00' })
        .column('payment_2', { key: 'payment_2', label: `${name} - Payment`, format: '"£"#,##0.00' })
        .column('interest_2', { key: 'interest_2', label: `${name} - Interest`, format: '"£"#,##0.00' })
        .column('principal_2', { key: 'principal_2', label: `${name} - Principal`, format: '"£"#,##0.00' })
        .column('overpayment_2', { key: 'overpayment_2', label: `${name} - Overpayment`, format: '"£"#,##0.00' })
        .column('erc_2', { key: 'erc_2', label: `${name} - ERC`, format: '"£"#,##0.00' })
        .column('closing_2', { key: 'closing_2', label: `${name} - Closing`, format: '"£"#,##0.00' })
        .column('rate_2', { key: 'rate_2', label: `${name} - Rate %`, format: '0.00"%"' })
        .column('fixed_2', { key: 'fixed_2', label: `${name} - Fixed?` });
    }
    if (i === 3) {
      amortSchemaBuilder
        .column('opening_3', { key: 'opening_3', label: `${name} - Opening`, format: '"£"#,##0.00' })
        .column('payment_3', { key: 'payment_3', label: `${name} - Payment`, format: '"£"#,##0.00' })
        .column('interest_3', { key: 'interest_3', label: `${name} - Interest`, format: '"£"#,##0.00' })
        .column('principal_3', { key: 'principal_3', label: `${name} - Principal`, format: '"£"#,##0.00' })
        .column('overpayment_3', { key: 'overpayment_3', label: `${name} - Overpayment`, format: '"£"#,##0.00' })
        .column('erc_3', { key: 'erc_3', label: `${name} - ERC`, format: '"£"#,##0.00' })
        .column('closing_3', { key: 'closing_3', label: `${name} - Closing`, format: '"£"#,##0.00' })
        .column('rate_3', { key: 'rate_3', label: `${name} - Rate %`, format: '0.00"%"' })
        .column('fixed_3', { key: 'fixed_3', label: `${name} - Fixed?` });
    }
    if (i === 4) {
      amortSchemaBuilder
        .column('opening_4', { key: 'opening_4', label: `${name} - Opening`, format: '"£"#,##0.00' })
        .column('payment_4', { key: 'payment_4', label: `${name} - Payment`, format: '"£"#,##0.00' })
        .column('interest_4', { key: 'interest_4', label: `${name} - Interest`, format: '"£"#,##0.00' })
        .column('principal_4', { key: 'principal_4', label: `${name} - Principal`, format: '"£"#,##0.00' })
        .column('overpayment_4', { key: 'overpayment_4', label: `${name} - Overpayment`, format: '"£"#,##0.00' })
        .column('erc_4', { key: 'erc_4', label: `${name} - ERC`, format: '"£"#,##0.00' })
        .column('closing_4', { key: 'closing_4', label: `${name} - Closing`, format: '"£"#,##0.00' })
        .column('rate_4', { key: 'rate_4', label: `${name} - Rate %`, format: '0.00"%"' })
        .column('fixed_4', { key: 'fixed_4', label: `${name} - Fixed?` });
    }
  }
  
  const amortSchema = amortSchemaBuilder.build();
  
  // Prepare data
  const paymentSummaryData = createPaymentSummaryData(results);
  const additionalDetailsData = createAdditionalDetailsData(results);
  const initialCostsData = createInitialCostsData(results);
  const inputsData = createInputsData(results);
  const amortizationData = createAmortizationData(results);
  
  // Filter columns based on actual number of scenarios
  const summarySelect: Record<string, boolean> = { metric: true };
  const inputsSelect: Record<string, boolean> = { category: true, field: true };
  for (let i = 0; i < results.length; i++) {
    summarySelect[`scenario_${i}`] = true;
    inputsSelect[`scenario_${i}`] = true;
  }
  
  // Build workbook
  const buffer = ExcelBuilder
    .create()
    .sheet('Summary')
    .addTable({
      title: 'Monthly Payment Summary',
      data: paymentSummaryData,
      schema: summarySchema,
      select: summarySelect,
    })
    .addTable({
      title: 'Additional Details',
      data: additionalDetailsData,
      schema: summarySchema,
      select: summarySelect,
    })
    .addTable({
      title: 'Initial Costs',
      data: initialCostsData,
      schema: summarySchema,
      select: summarySelect,
    })
    .sheet('Scenario Inputs')
    .addTable({
      title: 'Scenario Configuration',
      data: inputsData,
      schema: inputsSchema,
      select: inputsSelect,
    })
    .sheet('Amortization Schedule')
    .addTable({
      title: 'Full Amortization Schedule',
      data: amortizationData,
      schema: amortSchema,
    })
    .build({ output: 'buffer' });
  
  // Download the file
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mortgage_comparison_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
