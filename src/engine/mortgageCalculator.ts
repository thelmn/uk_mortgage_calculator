import { Scenario, ScheduleEntry, MortgageCalculationResult } from '@/types';

/**
 * Main mortgage calculation function
 * 
 * Implements:
 * - Daily interest accrual with monthly application
 * - Fixed rate period handling
 * - Monthly and lump sum overpayment processing
 * - Early Repayment Charge (ERC) calculation
 * - Payment timing considerations
 */
export const calculateMortgage = (scenario: Scenario): MortgageCalculationResult => {
  const {
    propertyPrice,
    deposit,
    mortgageTerm,
    interestRate,
    fixedPeriod,
    postFixRate,
    paymentDay,
    chargeDay,
    monthlyOverpayment,
    lumpSumOverpayments,
    productFee,
    addFeeToMortgage,
    hasERC,
    annualAllowance,
    ercRates,
  } = scenario;

  // Calculate principal (mortgage amount)
  const principal = addFeeToMortgage 
    ? propertyPrice - deposit + productFee 
    : propertyPrice - deposit;
  
  let balance = principal;
  const monthlyRate = interestRate / 100 / 12;
  const postFixMonthlyRate = postFixRate / 100 / 12;
  const totalMonths = mortgageTerm * 12;
  const fixedMonths = fixedPeriod * 12;

  // Calculate base monthly payment (without overpayments) using standard mortgage formula
  const basePayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const schedule: ScheduleEntry[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let totalOverpayments = 0;
  let totalERCs = 0;
  let month = 0;
  let currentYear = new Date().getFullYear();
  let yearlyOverpayments = 0;

  // Amortization loop
  while (balance > 0.01 && month < totalMonths) {
    const currentMonth = month % 12;
    const isInFixedPeriod = month < fixedMonths;
    const rate = isInFixedPeriod ? monthlyRate : postFixMonthlyRate;

    // Calculate interest for the month (daily accrual simplified)
    const daysInMonth = 30; // Simplified assumption
    const dailyRate = (isInFixedPeriod ? interestRate : postFixRate) / 100 / 365;
    const interest = balance * dailyRate * daysInMonth;

    // Payment timing consideration
    let effectiveBalance = balance;
    if (paymentDay < chargeDay) {
      // Payment before interest charged - slight benefit
      effectiveBalance = balance - basePayment;
    }

    // Recalculate payment if rate changed or overpayments affected term
    const remainingMonths = totalMonths - month;
    const payment = remainingMonths > 0 
      ? Math.min(balance + interest, balance * (rate * Math.pow(1 + rate, remainingMonths)) / 
          (Math.pow(1 + rate, remainingMonths) - 1))
      : balance + interest;

    let actualPayment = Math.min(payment + monthlyOverpayment, balance + interest);
    
    // Check for lump sum overpayments this month
    let lumpSum = 0;
    lumpSumOverpayments.forEach(overpayment => {
      const [overpayYear, overpayMonth] = overpayment.date.split('-').map(Number);
      if (overpayYear === currentYear && overpayMonth - 1 === currentMonth) {
        lumpSum += overpayment.amount;
      }
    });

    actualPayment += lumpSum;
    // Ensure we don't overpay beyond balance + interest
    actualPayment = Math.min(actualPayment, balance + interest);
    
    const overpaymentThisMonth = Math.max(0, actualPayment - payment);
    
    // Track yearly overpayments for ERC calculation
    if (currentMonth === 0) {
      yearlyOverpayments = 0;
    }
    yearlyOverpayments += overpaymentThisMonth;

    // Calculate ERC if applicable
    let erc = 0;
    if (isInFixedPeriod && hasERC && yearlyOverpayments > 0) {
      const allowance = balance * (annualAllowance / 100);
      if (yearlyOverpayments > allowance) {
        const excess = yearlyOverpayments - allowance;
        const yearInFix = Math.floor(month / 12);
        const ercRate = ercRates[Math.min(yearInFix, ercRates.length - 1)] / 100;
        erc = excess * ercRate;
        totalERCs += erc;
      }
    }

    const principalPaid = actualPayment - interest;
    balance = Math.max(0, balance + interest - actualPayment);

    schedule.push({
      month: month + 1,
      year: currentYear,
      monthName: new Date(currentYear, currentMonth).toLocaleString('en-GB', { month: 'short', year: 'numeric' }),
      openingBalance: effectiveBalance,
      payment: actualPayment,
      interest: interest,
      principal: principalPaid,
      overpayment: overpaymentThisMonth,
      erc: erc,
      closingBalance: balance,
      rate: isInFixedPeriod ? interestRate : postFixRate,
      isFixedPeriod: isInFixedPeriod
    });

    totalInterest += interest;
    totalPaid += actualPayment + erc;
    totalOverpayments += overpaymentThisMonth;

    month++;
    if (currentMonth === 11) currentYear++;
  }

  const actualTerm = month / 12;
  const termReduction = mortgageTerm - actualTerm;
  const interestSaved = (basePayment * totalMonths - principal) - totalInterest;

  // Calculate payment after fixed period
  const balanceAfterFix = schedule[Math.min(fixedMonths - 1, schedule.length - 1)]?.closingBalance || 0;
  const remainingAfterFix = totalMonths - fixedMonths;
  const postFixPayment = remainingAfterFix > 0
    ? balanceAfterFix * (postFixMonthlyRate * Math.pow(1 + postFixMonthlyRate, remainingAfterFix)) / 
        (Math.pow(1 + postFixMonthlyRate, remainingAfterFix) - 1)
    : 0;

  return {
    schedule,
    initialPayment: basePayment + monthlyOverpayment,
    averagePayment: month > 0 ? totalPaid / month : 0,
    postFixPayment: postFixPayment + monthlyOverpayment,
    totalPaid,
    totalInterest,
    actualTerm,
    termReduction,
    interestSaved,
    totalOverpayments,
    totalERCs,
    principal,
    balanceAfterFix
  };
};
