import { calculateStampDuty, getStampDutyBreakdown } from '../stampDuty';

describe('Stamp Duty Calculator', () => {
  describe('calculateStampDuty', () => {
    // Standard purchase (not first-time buyer, not additional, UK resident)
    describe('Standard Purchase', () => {
      it('should return 0 for property under £125,000', () => {
        expect(calculateStampDuty(100000, false, false, false)).toBe(0);
        expect(calculateStampDuty(125000, false, false, false)).toBe(0);
      });

      it('should calculate correctly for property between £125,001 and £250,000', () => {
        // £150,000: £25,000 at 2% = £500
        expect(calculateStampDuty(150000, false, false, false)).toBe(500);
        // £200,000: £75,000 at 2% = £1,500
        expect(calculateStampDuty(200000, false, false, false)).toBe(1500);
        // £250,000: £125,000 at 2% = £2,500
        expect(calculateStampDuty(250000, false, false, false)).toBe(2500);
      });

      it('should calculate correctly for property between £250,001 and £925,000', () => {
        // £300,000: £125,000 at 2% + £50,000 at 5% = £2,500 + £2,500 = £5,000
        expect(calculateStampDuty(300000, false, false, false)).toBe(5000);
        // £500,000: £125,000 at 2% + £250,000 at 5% = £2,500 + £12,500 = £15,000
        expect(calculateStampDuty(500000, false, false, false)).toBe(15000);
        // £925,000: £125,000 at 2% + £675,000 at 5% = £2,500 + £33,750 = £36,250
        expect(calculateStampDuty(925000, false, false, false)).toBe(36250);
      });

      it('should calculate correctly for property between £925,001 and £1,500,000', () => {
        // £1,000,000: £125,000 at 2% + £675,000 at 5% + £75,000 at 10%
        // = £2,500 + £33,750 + £7,500 = £43,750
        expect(calculateStampDuty(1000000, false, false, false)).toBe(43750);
        // £1,500,000: £125,000 at 2% + £675,000 at 5% + £575,000 at 10%
        // = £2,500 + £33,750 + £57,500 = £93,750
        expect(calculateStampDuty(1500000, false, false, false)).toBe(93750);
      });

      it('should calculate correctly for property over £1,500,000', () => {
        // £2,000,000: £125,000 at 2% + £675,000 at 5% + £575,000 at 10% + £500,000 at 12%
        // = £2,500 + £33,750 + £57,500 + £60,000 = £153,750
        expect(calculateStampDuty(2000000, false, false, false)).toBe(153750);
      });
    });

    // First-time buyer relief (properties up to £500,000)
    describe('First-Time Buyer', () => {
      it('should return 0 for property under £300,000', () => {
        expect(calculateStampDuty(100000, true, false, false)).toBe(0);
        expect(calculateStampDuty(200000, true, false, false)).toBe(0);
        expect(calculateStampDuty(300000, true, false, false)).toBe(0);
      });

      it('should calculate correctly for property between £300,001 and £500,000', () => {
        // £400,000: £100,000 at 5% = £5,000
        expect(calculateStampDuty(400000, true, false, false)).toBe(5000);
        // £500,000: £200,000 at 5% = £10,000
        expect(calculateStampDuty(500000, true, false, false)).toBe(10000);
      });

      it('should use standard rates for property over £500,000', () => {
        // First-time buyer relief doesn't apply for properties over £500k
        // £600,000 at standard rates: £125,000 at 2% + £350,000 at 5% = £2,500 + £17,500 = £20,000
        expect(calculateStampDuty(600000, true, false, false)).toBe(20000);
      });

      it('should compare first-time buyer vs standard for same property', () => {
        // £450,000 - First-time buyer: £150,000 at 5% = £7,500
        const ftbDuty = calculateStampDuty(450000, true, false, false);
        // £450,000 - Standard: £125,000 at 2% + £200,000 at 5% = £2,500 + £10,000 = £12,500
        const standardDuty = calculateStampDuty(450000, false, false, false);
        
        expect(ftbDuty).toBe(7500);
        expect(standardDuty).toBe(12500);
        expect(ftbDuty).toBeLessThan(standardDuty);
      });
    });

    // Additional property surcharge (5%)
    describe('Additional Property', () => {
      it('should add 5% surcharge on full property price', () => {
        // £200,000 standard: £1,500
        // Plus 5% surcharge: £10,000
        // Total: £11,500
        expect(calculateStampDuty(200000, false, true, false)).toBe(11500);
      });

      it('should add surcharge even for properties under £125,000', () => {
        // £100,000 standard: £0
        // Plus 5% surcharge: £5,000
        expect(calculateStampDuty(100000, false, true, false)).toBe(5000);
      });

      it('should combine with standard rates correctly', () => {
        // £500,000 standard: £15,000
        // Plus 5% surcharge: £25,000
        // Total: £40,000
        expect(calculateStampDuty(500000, false, true, false)).toBe(40000);
      });

      it('should apply surcharge even for first-time buyers (additional property)', () => {
        // This scenario is unusual but tests the calculation
        // £300,000 first-time buyer: £0
        // Plus 5% surcharge: £15,000
        expect(calculateStampDuty(300000, true, true, false)).toBe(15000);
      });
    });

    // Non-resident surcharge (2%)
    describe('Non-UK Resident', () => {
      it('should add 2% surcharge on full property price', () => {
        // £200,000 standard: £1,500
        // Plus 2% surcharge: £4,000
        // Total: £5,500
        expect(calculateStampDuty(200000, false, false, true)).toBe(5500);
      });

      it('should add surcharge to properties under £125,000', () => {
        // £100,000 standard: £0
        // Plus 2% surcharge: £2,000
        expect(calculateStampDuty(100000, false, false, true)).toBe(2000);
      });
    });

    // Combined surcharges
    describe('Combined Surcharges', () => {
      it('should combine additional property and non-resident surcharges', () => {
        // £300,000 standard: £5,000
        // Plus 5% additional: £15,000
        // Plus 2% non-resident: £6,000
        // Total: £26,000
        expect(calculateStampDuty(300000, false, true, true)).toBe(26000);
      });

      it('should apply all surcharges for high-value properties', () => {
        // £1,000,000 standard: £43,750
        // Plus 5% additional: £50,000
        // Plus 2% non-resident: £20,000
        // Total: £113,750
        expect(calculateStampDuty(1000000, false, true, true)).toBe(113750);
      });

      it('should apply surcharges to first-time buyer additional property', () => {
        // £400,000 FTB: £5,000
        // Plus 5% additional: £20,000
        // Plus 2% non-resident: £8,000
        // Total: £33,000
        expect(calculateStampDuty(400000, true, true, true)).toBe(33000);
      });
    });

    // Edge cases
    describe('Edge Cases', () => {
      it('should return 0 for property price of 0', () => {
        expect(calculateStampDuty(0, false, false, false)).toBe(0);
      });

      it('should handle very small property prices', () => {
        expect(calculateStampDuty(1, false, false, false)).toBe(0);
        expect(calculateStampDuty(1, false, true, false)).toBe(0); // 5% of £1 rounds to 0
      });

      it('should handle exact threshold values', () => {
        // Exactly at first-time buyer £500k threshold
        expect(calculateStampDuty(500000, true, false, false)).toBe(10000);
        // Just over - should use standard rates
        expect(calculateStampDuty(500001, true, false, false)).toBe(15000); // Standard rates apply
      });

      it('should round to nearest pound', () => {
        // £125,001 would be £0.02 at 2% - rounds to 0
        const duty = calculateStampDuty(125001, false, false, false);
        expect(Number.isInteger(duty)).toBe(true);
      });
    });
  });

  describe('getStampDutyBreakdown', () => {
    it('should return breakdown for standard purchase', () => {
      const breakdown = getStampDutyBreakdown(300000, false, false, false);
      
      // Should have entries for each applicable band
      expect(breakdown.length).toBeGreaterThan(0);
      
      // Find the bands
      const band0to125k = breakdown.find(b => b.band.includes('125,000'));
      const band125to250k = breakdown.find(b => b.band.includes('125,001'));
      const band250to925k = breakdown.find(b => b.band.includes('250,001'));
      
      expect(band0to125k?.amount).toBe(0);
      expect(band0to125k?.rate).toBe('0%');
      expect(band125to250k?.amount).toBe(2500);
      expect(band125to250k?.rate).toBe('2%');
      expect(band250to925k?.amount).toBe(2500);
      expect(band250to925k?.rate).toBe('5%');
    });

    it('should return breakdown for first-time buyer', () => {
      const breakdown = getStampDutyBreakdown(400000, true, false, false);
      
      // First-time buyer has different bands
      const band0to300k = breakdown.find(b => b.band.includes('300,000'));
      const band300to500k = breakdown.find(b => b.band.includes('300,001'));
      
      expect(band0to300k?.amount).toBe(0);
      expect(band300to500k?.amount).toBe(5000);
    });

    it('should include additional property surcharge in breakdown', () => {
      const breakdown = getStampDutyBreakdown(200000, false, true, false);
      
      const additionalSurcharge = breakdown.find(b => b.band.includes('Additional'));
      expect(additionalSurcharge).toBeDefined();
      expect(additionalSurcharge?.amount).toBe(10000);
      expect(additionalSurcharge?.rate).toBe('5%');
    });

    it('should include non-resident surcharge in breakdown', () => {
      const breakdown = getStampDutyBreakdown(200000, false, false, true);
      
      const nonResidentSurcharge = breakdown.find(b => b.band.includes('Non-resident'));
      expect(nonResidentSurcharge).toBeDefined();
      expect(nonResidentSurcharge?.amount).toBe(4000);
      expect(nonResidentSurcharge?.rate).toBe('2%');
    });
  });
});
