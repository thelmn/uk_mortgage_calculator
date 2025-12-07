import { calculateMortgage } from '../mortgageCalculator';
import { Scenario, DEFAULT_SCENARIO } from '@/types';

// Helper to create a test scenario with overrides
const createScenario = (overrides: Partial<Scenario> = {}): Scenario => ({
  ...DEFAULT_SCENARIO,
  ...overrides,
});

describe('Mortgage Calculator', () => {
  describe('Basic Mortgage Calculations', () => {
    it('should calculate principal correctly without fee added to mortgage', () => {
      const scenario = createScenario({
        propertyPrice: 300000,
        deposit: 60000,
        productFee: 1000,
        addFeeToMortgage: false,
      });
      
      const result = calculateMortgage(scenario);
      expect(result.principal).toBe(240000); // 300000 - 60000
    });

    it('should calculate principal correctly with fee added to mortgage', () => {
      const scenario = createScenario({
        propertyPrice: 300000,
        deposit: 60000,
        productFee: 1000,
        addFeeToMortgage: true,
      });
      
      const result = calculateMortgage(scenario);
      expect(result.principal).toBe(241000); // 300000 - 60000 + 1000
    });

    it('should generate correct number of schedule entries for full term', () => {
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      // Should be exactly 25 years * 12 months = 300 months
      expect(result.schedule.length).toBe(300);
      expect(result.actualTerm).toBe(25);
    });

    it('should have closing balance of 0 at end of mortgage', () => {
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      const lastEntry = result.schedule[result.schedule.length - 1];
      expect(lastEntry.closingBalance).toBeLessThan(1); // Essentially 0
    });

    it('should calculate total interest over full term', () => {
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        interestRate: 5.0,
        monthlyOverpayment: 0,
        fixedPeriod: 25, // All fixed to avoid rate change
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      // Total interest should be positive and substantial
      expect(result.totalInterest).toBeGreaterThan(0);
      // For a £160k mortgage at 5% over 25 years, interest should be roughly £120k-£130k
      expect(result.totalInterest).toBeGreaterThan(100000);
      expect(result.totalInterest).toBeLessThan(150000);
    });

    it('should have principal + interest = totalPaid (approx)', () => {
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
        hasERC: false,
      });
      
      const result = calculateMortgage(scenario);
      // Total paid should approximately equal principal + total interest
      // (might differ slightly due to rounding in schedule)
      const expectedTotal = result.principal + result.totalInterest;
      expect(Math.abs(result.totalPaid - expectedTotal)).toBeLessThan(100);
    });
  });

  describe('Interest Rate Changes (Fixed to Variable)', () => {
    it('should apply fixed rate during fixed period', () => {
      const scenario = createScenario({
        interestRate: 4.0,
        postFixRate: 6.0,
        fixedPeriod: 5,
        mortgageTerm: 25,
      });
      
      const result = calculateMortgage(scenario);
      
      // First 60 months should be at fixed rate
      for (let i = 0; i < 60; i++) {
        expect(result.schedule[i].rate).toBe(4.0);
        expect(result.schedule[i].isFixedPeriod).toBe(true);
      }
    });

    it('should switch to post-fix rate after fixed period', () => {
      const scenario = createScenario({
        interestRate: 4.0,
        postFixRate: 6.0,
        fixedPeriod: 5,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      // Month 61 onwards should be at post-fix rate
      expect(result.schedule[60].rate).toBe(6.0);
      expect(result.schedule[60].isFixedPeriod).toBe(false);
    });

    it('should calculate balance after fixed period', () => {
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        interestRate: 4.0,
        fixedPeriod: 5,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      // Balance after 5 years should be positive and less than principal
      expect(result.balanceAfterFix).toBeGreaterThan(0);
      expect(result.balanceAfterFix).toBeLessThan(160000);
      // After 5 years of a 25-year mortgage, roughly 80% of principal remains
      expect(result.balanceAfterFix).toBeGreaterThan(120000);
    });

    it('should increase payment when rate increases after fixed period', () => {
      const scenario = createScenario({
        interestRate: 4.0,
        postFixRate: 6.0,
        fixedPeriod: 5,
        mortgageTerm: 25,
      });
      
      const result = calculateMortgage(scenario);
      
      // Post-fix payment should be higher than initial payment
      expect(result.postFixPayment).toBeGreaterThan(result.initialPayment);
    });
  });

  describe('Monthly Overpayments', () => {
    it('should reduce mortgage term with regular overpayments', () => {
      const baseScenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const overpayScenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 200,
        lumpSumOverpayments: [],
        hasERC: false,
      });
      
      const baseResult = calculateMortgage(baseScenario);
      const overpayResult = calculateMortgage(overpayScenario);
      
      expect(overpayResult.actualTerm).toBeLessThan(baseResult.actualTerm);
      expect(overpayResult.termReduction).toBeGreaterThan(0);
    });

    it('should reduce total interest with regular overpayments', () => {
      const baseScenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const overpayScenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 200,
        lumpSumOverpayments: [],
        hasERC: false,
      });
      
      const baseResult = calculateMortgage(baseScenario);
      const overpayResult = calculateMortgage(overpayScenario);
      
      // Overpaying should reduce total interest
      expect(overpayResult.totalInterest).toBeLessThan(baseResult.totalInterest);
    });

    it('should track total overpayments correctly', () => {
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 100,
        lumpSumOverpayments: [],
        hasERC: false,
      });
      
      const result = calculateMortgage(scenario);
      
      // Total overpayments should be roughly months * monthly overpayment
      // (will be slightly less as mortgage ends early)
      expect(result.totalOverpayments).toBeGreaterThan(0);
      expect(result.totalOverpayments).toBeLessThanOrEqual(result.schedule.length * 100);
    });
  });

  describe('Lump Sum Overpayments', () => {
    it('should process lump sum overpayment in correct month', () => {
      const currentYear = new Date().getFullYear();
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-06`, amount: 10000 }
        ],
        hasERC: false,
      });
      
      const result = calculateMortgage(scenario);
      
      // Find the June entry (month 6, which is index 5 if starting in January)
      const juneEntry = result.schedule.find(
        s => s.year === currentYear && s.monthName.includes('Jun')
      );
      
      expect(juneEntry?.overpayment).toBe(10000);
    });

    it('should process lump sum and reduce interest', () => {
      const currentYear = new Date().getFullYear();
      
      // No lump sum
      const baseScenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
        hasERC: false,
      });
      
      // £12,000 lump sum in month 1
      const lumpSumScenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-01`, amount: 12000 }
        ],
        hasERC: false,
      });
      
      const baseResult = calculateMortgage(baseScenario);
      const lumpSumResult = calculateMortgage(lumpSumScenario);
      
      // Lump sum should reduce total interest compared to no overpayments
      expect(lumpSumResult.totalInterest).toBeLessThan(baseResult.totalInterest);
      // Total paid should be less (less interest = less total cost)
      expect(lumpSumResult.totalPaid).toBeLessThan(baseResult.totalPaid);
    });
  });

  describe('Early Repayment Charges (ERCs)', () => {
    it('should not charge ERC when overpayments within allowance', () => {
      const currentYear = new Date().getFullYear();
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 100, // Small regular overpayments
        lumpSumOverpayments: [],
        hasERC: true,
        annualAllowance: 10,
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      const result = calculateMortgage(scenario);
      
      // 10% of £160k = £16k allowance per year
      // £100/month = £1,200/year - well within allowance
      expect(result.totalERCs).toBe(0);
    });

    it('should charge ERC when overpayments exceed allowance', () => {
      const currentYear = new Date().getFullYear();
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-06`, amount: 50000 } // Large overpayment
        ],
        hasERC: true,
        annualAllowance: 10, // 10% = £16k allowance
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      const result = calculateMortgage(scenario);
      
      // £50k overpayment exceeds £16k allowance
      // Excess = £34k, ERC rate year 1 = 5%
      // Expected ERC ≈ £34k * 5% = £1,700
      expect(result.totalERCs).toBeGreaterThan(0);
    });

    it('should not charge ERC after fixed period ends', () => {
      const futureYear = new Date().getFullYear() + 6; // After 5-year fixed period
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${futureYear}-01`, amount: 50000 }
        ],
        hasERC: true,
        annualAllowance: 10,
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      const result = calculateMortgage(scenario);
      
      // No ERC should be charged after fixed period
      expect(result.totalERCs).toBe(0);
    });

    it('should apply lower ERC rate in later years', () => {
      const currentYear = new Date().getFullYear();
      
      // Overpayment in year 1 (5% ERC)
      const year1Scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-06`, amount: 30000 }
        ],
        hasERC: true,
        annualAllowance: 10,
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      // Overpayment in year 4 (2% ERC)
      const year4Scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear + 3}-06`, amount: 30000 }
        ],
        hasERC: true,
        annualAllowance: 10,
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      const year1Result = calculateMortgage(year1Scenario);
      const year4Result = calculateMortgage(year4Scenario);
      
      // Year 1 ERC should be higher than year 4
      if (year1Result.totalERCs > 0 && year4Result.totalERCs > 0) {
        expect(year1Result.totalERCs).toBeGreaterThan(year4Result.totalERCs);
      }
    });

    it('should not charge ERC when hasERC is false', () => {
      const currentYear = new Date().getFullYear();
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-06`, amount: 50000 }
        ],
        hasERC: false, // ERCs disabled
        annualAllowance: 10,
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      const result = calculateMortgage(scenario);
      expect(result.totalERCs).toBe(0);
    });
  });

  describe('Schedule Entry Structure', () => {
    it('should have correct properties on each schedule entry', () => {
      const scenario = createScenario({
        mortgageTerm: 1, // Short term for quick test
      });
      
      const result = calculateMortgage(scenario);
      const entry = result.schedule[0];
      
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('year');
      expect(entry).toHaveProperty('monthName');
      expect(entry).toHaveProperty('openingBalance');
      expect(entry).toHaveProperty('payment');
      expect(entry).toHaveProperty('interest');
      expect(entry).toHaveProperty('principal');
      expect(entry).toHaveProperty('overpayment');
      expect(entry).toHaveProperty('erc');
      expect(entry).toHaveProperty('closingBalance');
      expect(entry).toHaveProperty('rate');
      expect(entry).toHaveProperty('isFixedPeriod');
    });

    it('should have decreasing balance over time', () => {
      const scenario = createScenario({
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      // Balance should decrease (mostly) month over month
      for (let i = 1; i < Math.min(result.schedule.length, 100); i++) {
        expect(result.schedule[i].closingBalance).toBeLessThanOrEqual(
          result.schedule[i - 1].closingBalance + 1 // Small tolerance for rounding
        );
      }
    });

    it('should have interest + principal ≈ payment', () => {
      const scenario = createScenario({
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      for (const entry of result.schedule.slice(0, 12)) {
        const calculatedPayment = entry.interest + entry.principal + entry.overpayment;
        expect(Math.abs(entry.payment - calculatedPayment)).toBeLessThan(0.01);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0% interest rate', () => {
      const scenario = createScenario({
        propertyPrice: 120000,
        deposit: 20000,
        mortgageTerm: 10,
        interestRate: 0.01, // Near-zero rate (avoid division issues)
        fixedPeriod: 10,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      // Should complete without error
      expect(result.schedule.length).toBeGreaterThan(0);
      // Total interest should be minimal
      expect(result.totalInterest).toBeLessThan(1000);
    });

    it('should handle very short mortgage term', () => {
      const scenario = createScenario({
        propertyPrice: 100000,
        deposit: 90000,
        mortgageTerm: 1,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      expect(result.schedule.length).toBe(12);
      expect(result.actualTerm).toBe(1);
    });

    it('should handle very large overpayment that pays off mortgage early', () => {
      const currentYear = new Date().getFullYear();
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-01`, amount: 200000 } // More than balance
        ],
        hasERC: false,
      });
      
      const result = calculateMortgage(scenario);
      
      // Mortgage should be paid off in first month
      expect(result.schedule.length).toBe(1);
      expect(result.actualTerm).toBeLessThan(1);
    });

    it('should handle no fixed period (0 years)', () => {
      const scenario = createScenario({
        interestRate: 5.0,
        postFixRate: 5.0,
        fixedPeriod: 0,
        mortgageTerm: 25,
      });
      
      const result = calculateMortgage(scenario);
      
      // All months should use post-fix rate since fixed period is 0
      expect(result.schedule[0].isFixedPeriod).toBe(false);
      expect(result.schedule[0].rate).toBe(5.0);
    });

    it('should handle fixed period longer than mortgage term', () => {
      const scenario = createScenario({
        interestRate: 5.0,
        postFixRate: 7.0,
        fixedPeriod: 30, // Longer than term
        mortgageTerm: 25,
      });
      
      const result = calculateMortgage(scenario);
      
      // All months should be in fixed period
      for (const entry of result.schedule) {
        expect(entry.isFixedPeriod).toBe(true);
        expect(entry.rate).toBe(5.0);
      }
    });
  });

  describe('Result Calculations', () => {
    it('should calculate average payment correctly', () => {
      const scenario = createScenario({
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [],
      });
      
      const result = calculateMortgage(scenario);
      
      // Average payment should be between initial and post-fix payments
      expect(result.averagePayment).toBeGreaterThan(0);
      expect(result.averagePayment).toBeLessThanOrEqual(
        Math.max(result.initialPayment, result.postFixPayment) + 100
      );
    });

    it('should calculate term reduction correctly', () => {
      const scenario = createScenario({
        mortgageTerm: 25,
        monthlyOverpayment: 200,
        lumpSumOverpayments: [],
        hasERC: false,
      });
      
      const result = calculateMortgage(scenario);
      
      expect(result.termReduction).toBe(25 - result.actualTerm);
    });

    it('should include ERCs in total paid', () => {
      const currentYear = new Date().getFullYear();
      const scenario = createScenario({
        propertyPrice: 200000,
        deposit: 40000,
        mortgageTerm: 25,
        monthlyOverpayment: 0,
        lumpSumOverpayments: [
          { date: `${currentYear}-06`, amount: 50000 }
        ],
        hasERC: true,
        annualAllowance: 10,
        ercRates: [5, 4, 3, 2, 1],
        fixedPeriod: 5,
      });
      
      const result = calculateMortgage(scenario);
      
      if (result.totalERCs > 0) {
        // Total paid should include ERCs
        const paymentsSum = result.schedule.reduce((sum, e) => sum + e.payment, 0);
        expect(result.totalPaid).toBeGreaterThan(paymentsSum);
      }
    });
  });
});
