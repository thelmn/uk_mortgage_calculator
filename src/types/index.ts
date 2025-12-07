// Scenario types for mortgage calculation
export interface LumpSumOverpayment {
  date: string; // Format: YYYY-MM
  amount: number;
}

export interface Scenario {
  id: number;
  name: string;
  visible: boolean;
  locked: boolean;
  expanded: boolean;
  hasResults: boolean;
  
  // Property details
  propertyPrice: number;
  deposit: number;
  
  // Mortgage details
  mortgageTerm: number;
  interestRate: number;
  fixedPeriod: number;
  postFixRate: number;
  paymentDay: number;
  chargeDay: number;
  
  // Overpayments
  monthlyOverpayment: number;
  lumpSumOverpayments: LumpSumOverpayment[];
  
  // Advanced options
  productFee: number;
  addFeeToMortgage: boolean;
  bookingFee: number;
  hasERC: boolean;
  annualAllowance: number;
  ercRates: number[];
  
  // Initial costs
  isFirstTimeBuyer: boolean;
  isAdditionalProperty: boolean;
  isNonResident: boolean;
  solicitorFees: number;
  disbursements: number;
  surveyType: SurveyType;
  surveyCost: number;
  brokerFee: number;
  valuationFee: number;
  buildingsInsurance: number;
  movingCosts: number;
  furnitureRenovation: number;
}

export type SurveyType = 'none' | 'basic' | 'homebuyer' | 'full' | 'custom';

export interface ScheduleEntry {
  month: number;
  year: number;
  monthName: string;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  overpayment: number;
  erc: number;
  closingBalance: number;
  rate: number;
  isFixedPeriod: boolean;
}

export interface MortgageCalculationResult {
  schedule: ScheduleEntry[];
  initialPayment: number;
  averagePayment: number;
  postFixPayment: number;
  totalPaid: number;
  totalInterest: number;
  actualTerm: number;
  termReduction: number;
  interestSaved: number;
  totalOverpayments: number;
  totalERCs: number;
  principal: number;
  balanceAfterFix: number;
}

export interface ScenarioResult extends MortgageCalculationResult {
  scenario: Scenario;
  stampDuty: number;
  initialCosts: number;
}

export interface SurveyOption {
  value: SurveyType;
  label: string;
}

export const DEFAULT_SCENARIO: Scenario = {
  id: 1,
  name: 'Scenario 1',
  visible: true,
  locked: false,
  expanded: true,
  hasResults: false,
  
  // Property details
  propertyPrice: 300000,
  deposit: 45000,
  
  // Mortgage details
  mortgageTerm: 25,
  interestRate: 4.75,
  fixedPeriod: 5,
  postFixRate: 6.50,
  paymentDay: 1,
  chargeDay: 10,
  
  // Overpayments
  monthlyOverpayment: 200,
  lumpSumOverpayments: [],
  
  // Advanced options
  productFee: 999,
  addFeeToMortgage: false,
  bookingFee: 0,
  hasERC: true,
  annualAllowance: 10,
  ercRates: [5, 4, 3, 2, 1],
  
  // Initial costs
  isFirstTimeBuyer: false,
  isAdditionalProperty: false,
  isNonResident: false,
  solicitorFees: 1200,
  disbursements: 350,
  surveyType: 'homebuyer',
  surveyCost: 600,
  brokerFee: 0,
  valuationFee: 300,
  buildingsInsurance: 300,
  movingCosts: 800,
  furnitureRenovation: 0,
};

export const SURVEY_OPTIONS: SurveyOption[] = [
  { value: 'none', label: 'None (£0)' },
  { value: 'basic', label: 'Basic Valuation (£300)' },
  { value: 'homebuyer', label: 'Homebuyer Report (£600)' },
  { value: 'full', label: 'Full Building Survey (£1,200)' },
  { value: 'custom', label: 'Custom Amount' },
];

export const SURVEY_COST_MAP: Record<SurveyType, number> = {
  none: 0,
  basic: 300,
  homebuyer: 600,
  full: 1200,
  custom: 0,
};

export const CHART_COLORS = ['#1976D2', '#F57C00', '#388E3C', '#D32F2F', '#7B1FA2'];
