interface StampDutyBand {
  threshold: number;
  rate: number;
  max: number;
}

/**
 * Calculate Stamp Duty Land Tax for England/Northern Ireland
 * 
 * Implements:
 * - Standard rates
 * - First-time buyer relief
 * - Additional property surcharge (5%)
 * - Non-resident surcharge (2%)
 */
export const calculateStampDuty = (
  price: number,
  isFirstTime: boolean,
  isAdditional: boolean,
  isNonResident: boolean
): number => {
  // Define bands based on buyer type
  const bands: StampDutyBand[] = isFirstTime && price <= 500000
    ? [
        // First-time buyer rates (up to £500k property)
        { threshold: 0, rate: 0, max: 300000 },
        { threshold: 300000, rate: 0.05, max: 500000 },
        { threshold: 500000, rate: 0.05, max: 925000 },
        { threshold: 925000, rate: 0.10, max: 1500000 },
        { threshold: 1500000, rate: 0.12, max: Infinity }
      ]
    : [
        // Standard rates
        { threshold: 0, rate: 0, max: 125000 },
        { threshold: 125000, rate: 0.02, max: 250000 },
        { threshold: 250000, rate: 0.05, max: 925000 },
        { threshold: 925000, rate: 0.10, max: 1500000 },
        { threshold: 1500000, rate: 0.12, max: Infinity }
      ];

  // Calculate base stamp duty
  let duty = 0;
  for (const band of bands) {
    if (price > band.threshold) {
      const taxableInBand = Math.min(price, band.max) - band.threshold;
      duty += taxableInBand * band.rate;
    }
  }

  // Add surcharges
  if (isAdditional) {
    duty += price * 0.05; // 5% additional property surcharge
  }
  if (isNonResident) {
    duty += price * 0.02; // 2% non-resident surcharge
  }

  return Math.round(duty);
};

/**
 * Get a breakdown of stamp duty by band
 */
export const getStampDutyBreakdown = (
  price: number,
  isFirstTime: boolean,
  isAdditional: boolean,
  isNonResident: boolean
): { band: string; amount: number; rate: string }[] => {
  const breakdown: { band: string; amount: number; rate: string }[] = [];
  
  const bands = isFirstTime && price <= 500000
    ? [
        { threshold: 0, rate: 0, max: 300000, label: '£0 - £300,000' },
        { threshold: 300000, rate: 0.05, max: 500000, label: '£300,001 - £500,000' },
      ]
    : [
        { threshold: 0, rate: 0, max: 125000, label: '£0 - £125,000' },
        { threshold: 125000, rate: 0.02, max: 250000, label: '£125,001 - £250,000' },
        { threshold: 250000, rate: 0.05, max: 925000, label: '£250,001 - £925,000' },
        { threshold: 925000, rate: 0.10, max: 1500000, label: '£925,001 - £1,500,000' },
        { threshold: 1500000, rate: 0.12, max: Infinity, label: 'Over £1,500,000' }
      ];

  for (const band of bands) {
    if (price > band.threshold) {
      const taxableInBand = Math.min(price, band.max) - band.threshold;
      const amount = taxableInBand * band.rate;
      if (taxableInBand > 0) {
        breakdown.push({
          band: band.label,
          amount: Math.round(amount),
          rate: `${(band.rate * 100).toFixed(0)}%`
        });
      }
    }
  }

  if (isAdditional) {
    breakdown.push({
      band: 'Additional property surcharge',
      amount: Math.round(price * 0.05),
      rate: '5%'
    });
  }

  if (isNonResident) {
    breakdown.push({
      band: 'Non-resident surcharge',
      amount: Math.round(price * 0.02),
      rate: '2%'
    });
  }

  return breakdown;
};
