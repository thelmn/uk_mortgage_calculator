/**
 * Format a number as GBP currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a number with specified decimal places
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Calculate LTV (Loan to Value) percentage
 */
export const calculateLTV = (propertyPrice: number, deposit: number): string => {
  if (propertyPrice <= 0) return '0.0';
  return ((propertyPrice - deposit) / propertyPrice * 100).toFixed(1);
};

/**
 * Generate a unique ID
 */
export const generateId = (): number => {
  return Date.now() + Math.random();
};
