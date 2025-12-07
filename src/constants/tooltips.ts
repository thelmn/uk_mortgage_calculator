/**
 * Centralized tooltip content for the UK Mortgage Calculator
 * Based on uk_mortgage_research.md
 */

// ==================== INPUT FORM TOOLTIPS ====================

export const INPUT_TOOLTIPS = {
  // Property Details
  propertyPrice: 'The full purchase price of the property you are buying.',
  deposit: 'The amount of money you are putting down upfront. A higher deposit typically means better interest rates.',
  ltv: 'Loan-to-Value ratio. The percentage of the property price you are borrowing. Lower LTV (60%, 75%, 80%) often qualifies for better rates.',

  // Mortgage Details
  mortgageAmount: 'The total amount you will borrow. This is the property price minus your deposit, plus any fees added to the mortgage.',
  mortgageTerm: 'The total length of your mortgage in years. Longer terms mean lower monthly payments but more total interest paid.',
  interestRate: 'The annual interest rate during your fixed rate period. This determines your monthly payment amount.',
  fixedPeriod: 'How long your interest rate is guaranteed. After this period, you\'ll move to the lender\'s Standard Variable Rate (SVR) unless you remortgage.',
  postFixRate: 'The expected rate after your fixed period ends. Typically the lender\'s SVR, which is usually 2-5% higher than fixed rates. You can avoid this by remortgaging before your fixed period ends.',
  paymentDay: 'The day of the month your mortgage payment is collected (1-28).',
  chargeDay: 'The day of the month when interest is calculated and added to your balance. If your payment date is before the charge date, your payment reduces the balance before interest is calculated, saving you money.',

  // Overpayments
  monthlyOverpayment: 'An extra amount you pay each month on top of your regular payment. This goes directly to reducing your principal, saving interest and shortening your term.',
  lumpSumDate: 'The month when you plan to make a one-off overpayment (YYYY-MM format).',
  lumpSumAmount: 'A one-off extra payment. Large lump sums can significantly reduce your term and interest, but may incur Early Repayment Charges if they exceed your annual allowance.',

  // Product Fees
  productFee: 'Also called an arrangement fee. Charged by lenders for setting up your mortgage. Can range from £0 to £3,999. Lower rate mortgages often have higher fees.',
  addFeeToMortgage: 'If checked, the product fee is added to your loan amount. This means you\'ll pay interest on the fee over the life of the mortgage, but you don\'t need to pay it upfront.',
  bookingFee: 'A non-refundable fee (typically £100-£250) paid when you apply to reserve a mortgage product. Usually paid upfront.',

  // Early Repayment Charges
  hasERC: 'Early Repayment Charges apply if you overpay more than your annual allowance during the fixed period. Most lenders allow 10% overpayment per year without penalty.',
  annualAllowance: 'The percentage of your outstanding balance you can overpay each year without incurring Early Repayment Charges. Most lenders allow 10%, some (like NatWest) allow 20%.',
  ercRates: `Early Repayment Charge rates by year. ERCs are typically tiered:
• Year 1: 5%
• Year 2: 4%
• Year 3: 3%
• Year 4: 2%
• Year 5: 1%

Example: £200k balance, 10% allowance = £20k free. If you overpay £35k (£15k excess) in Year 1: ERC = £15k × 5% = £750.`,

  // Initial Costs - Buyer Type
  isFirstTimeBuyer: 'First-time buyers get stamp duty relief: 0% on the first £300,000 and 5% on £300,001-£500,000 (for properties up to £500k).',
  isAdditionalProperty: 'Buying a second home or buy-to-let? You\'ll pay an additional 5% stamp duty surcharge on the entire purchase price.',
  isNonResident: 'Non-UK residents pay an additional 2% stamp duty surcharge on top of standard rates.',

  // Initial Costs - Fees
  stampDuty: 'Stamp Duty Land Tax (SDLT) is a tax on property purchases in England and Northern Ireland. It\'s calculated in bands based on the property price and your buyer status.',
  solicitorFees: 'Legal fees for a solicitor or conveyancer who handles the legal transfer of property ownership. Typically £1,000-£2,000 including VAT.',
  disbursements: 'Third-party costs paid by your solicitor: local authority searches (£250-£450), Land Registry fees (£45-£1,105), anti-money laundering checks, and bank transfer fees.',
  surveyType: 'Property surveys range from basic valuations (lender requirement) to full building surveys. More comprehensive surveys cost more but can reveal hidden problems.',
  surveyCost: 'Custom survey cost if your survey type doesn\'t match the standard options.',
  brokerFee: 'Fee charged by a mortgage broker for their services. Many brokers work on commission from lenders and charge nothing to you.',
  valuationFee: 'Fee for the lender\'s valuation survey. Some lenders include this free, others charge £150-£800 depending on property value.',
  buildingsInsurance: 'Annual buildings insurance premium. Required by lenders from exchange of contracts. Typically £200-£500 per year.',
  movingCosts: 'Estimated cost for removal services, temporary storage, van hire, etc. Typically £400-£1,000+.',
  furnitureRenovation: 'Budget for furniture, appliances, or immediate renovations needed after moving in.',
};

// ==================== SUMMARY TABLE TOOLTIPS ====================

export const SUMMARY_TOOLTIPS = {
  // Monthly Payment Summary
  propertyPrice: 'The full purchase price of the property.',
  deposit: 'Your upfront payment toward the property.',
  mortgageAmount: 'Total amount borrowed (property price - deposit + any fees added to loan).',
  initialPayment: 'Your monthly payment during the fixed rate period.',
  averagePayment: 'Average monthly payment over the entire mortgage term, accounting for rate changes.',
  postFixPayment: 'Expected monthly payment after your fixed period ends, based on the post-fix rate.',
  totalAmountPaid: 'Total of all monthly payments over the life of the mortgage.',
  totalInterestPaid: 'Total interest you\'ll pay. This is the "cost" of borrowing - the difference between total paid and the amount borrowed.',
  timeToPayOff: 'How long until the mortgage is fully paid off. Overpayments can reduce this significantly.',
  interestSaved: 'Interest saved compared to the base scenario (Scenario 1). Shows the benefit of different strategies.',

  // Additional Details
  fixedPeriodPayment: 'Monthly payment during your fixed interest rate period.',
  postFixPaymentDetail: 'Monthly payment after the fixed period, calculated at the post-fix rate on the remaining balance.',
  balanceAfterFix: 'Remaining mortgage balance when your fixed period ends. This is what you\'d remortgage.',
  termReduction: 'How many months earlier you\'ll pay off the mortgage compared to the original term, due to overpayments.',
  totalOverpayments: 'Sum of all extra payments made beyond the minimum required payment.',
  ercsPaid: `Early Repayment Charges incurred from overpayments exceeding your annual allowance during the fixed period.

Example: If you overpay £30k on a £200k balance with 10% allowance:
• Allowance = £20k (penalty-free)
• Excess = £10k
• ERC (Year 1 at 5%) = £500`,
  initialCosts: 'Total upfront costs excluding deposit: stamp duty, legal fees, surveys, arrangement fees, insurance, and moving costs.',
  totalCosts: 'Complete cost including all mortgage payments, ERCs, and initial costs.',
};

// ==================== VISUALIZATION TOOLTIPS ====================

export const CHART_TOOLTIPS = {
  mortgageBalance: 'Shows how your outstanding mortgage balance decreases over time. Steeper drops indicate faster payoff due to overpayments.',
  monthlyPayment: 'Displays your monthly payment amount over time. May show a jump when the fixed period ends and you move to the post-fix rate.',
  interestVsCapital: 'Shows the split between interest and principal in each payment. Early payments are mostly interest; later payments are mostly principal.',
  cumulativeInterest: 'Total interest paid over time. The final value is your total interest cost. Compare scenarios to see interest savings.',
  totalCostComparison: 'Stacked bar chart comparing total costs across scenarios: capital repaid, total interest, and initial costs.',
};

// ==================== SCHEDULE TABLE TOOLTIPS ====================

export const SCHEDULE_TOOLTIPS = {
  sectionHeader: 'Month-by-month breakdown of your mortgage. Shows how each payment splits between interest and principal, and how your balance decreases over time.',
  openingBalance: 'Balance at the start of the month, before payment.',
  payment: 'Total amount paid this month (base payment + any overpayment).',
  interest: 'Interest charged for this month, calculated daily on the outstanding balance.',
  principal: 'Amount of your payment that reduces the loan balance.',
  overpayment: 'Extra amount paid beyond the minimum required payment.',
  closingBalance: 'Balance at the end of the month, after payment.',
  rate: 'Annual interest rate applied this month.',
};
