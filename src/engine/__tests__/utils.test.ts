import { formatCurrency, formatNumber, calculateLTV, generateId } from '../utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as GBP currency', () => {
      expect(formatCurrency(1000)).toBe('£1,000');
      expect(formatCurrency(250000)).toBe('£250,000');
      expect(formatCurrency(1500000)).toBe('£1,500,000');
    });

    it('should format 0 correctly', () => {
      expect(formatCurrency(0)).toBe('£0');
    });

    it('should round to nearest pound (no decimals)', () => {
      expect(formatCurrency(1234.56)).toBe('£1,235');
      expect(formatCurrency(1234.44)).toBe('£1,234');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-£500');
    });

    it('should format very large numbers', () => {
      expect(formatCurrency(10000000)).toBe('£10,000,000');
    });

    it('should format small numbers', () => {
      expect(formatCurrency(1)).toBe('£1');
      expect(formatCurrency(99)).toBe('£99');
    });
  });

  describe('formatNumber', () => {
    it('should format number with default 2 decimal places', () => {
      expect(formatNumber(1234.567)).toBe('1,234.57');
      expect(formatNumber(1234.5)).toBe('1,234.50');
      expect(formatNumber(1234)).toBe('1,234.00');
    });

    it('should format number with specified decimal places', () => {
      expect(formatNumber(1234.567, 1)).toBe('1,234.6');
      expect(formatNumber(1234.567, 3)).toBe('1,234.567');
      expect(formatNumber(1234.567, 0)).toBe('1,235');
    });

    it('should handle 0', () => {
      expect(formatNumber(0)).toBe('0.00');
      expect(formatNumber(0, 0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('should round correctly', () => {
      expect(formatNumber(1.555, 2)).toBe('1.56');
      expect(formatNumber(1.554, 2)).toBe('1.55');
    });
  });

  describe('calculateLTV', () => {
    it('should calculate LTV correctly for typical scenarios', () => {
      // £200,000 property with £40,000 deposit = 80% LTV
      expect(calculateLTV(200000, 40000)).toBe('80.0');
      
      // £300,000 property with £45,000 deposit = 85% LTV
      expect(calculateLTV(300000, 45000)).toBe('85.0');
      
      // £500,000 property with £50,000 deposit = 90% LTV
      expect(calculateLTV(500000, 50000)).toBe('90.0');
    });

    it('should calculate LTV for high deposit scenarios', () => {
      // £200,000 property with £100,000 deposit = 50% LTV
      expect(calculateLTV(200000, 100000)).toBe('50.0');
      
      // £200,000 property with £190,000 deposit = 5% LTV
      expect(calculateLTV(200000, 190000)).toBe('5.0');
    });

    it('should calculate LTV for low deposit scenarios', () => {
      // £200,000 property with £10,000 deposit = 95% LTV
      expect(calculateLTV(200000, 10000)).toBe('95.0');
    });

    it('should return 0 for zero property price', () => {
      expect(calculateLTV(0, 0)).toBe('0.0');
      expect(calculateLTV(0, 10000)).toBe('0.0');
    });

    it('should handle 100% LTV (no deposit)', () => {
      expect(calculateLTV(200000, 0)).toBe('100.0');
    });

    it('should handle fractional LTV', () => {
      // £300,000 property with £67,500 deposit = 77.5% LTV
      expect(calculateLTV(300000, 67500)).toBe('77.5');
    });

    it('should return string with one decimal place', () => {
      const ltv = calculateLTV(200000, 40000);
      expect(ltv).toMatch(/^\d+\.\d$/);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should return a number', () => {
      const id = generateId();
      expect(typeof id).toBe('number');
    });

    it('should return positive numbers', () => {
      const id = generateId();
      expect(id).toBeGreaterThan(0);
    });

    it('should generate IDs based on timestamp', () => {
      const before = Date.now();
      const id = generateId();
      const after = Date.now() + 1;
      
      // ID should be close to current timestamp (plus small random)
      expect(id).toBeGreaterThanOrEqual(before);
      expect(id).toBeLessThan(after + 1);
    });
  });
});
