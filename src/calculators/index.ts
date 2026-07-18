export { calculateEMI } from './emi';
export type { EMIResult, AmortizationRow } from './emi';

export { calculateSIP } from './sip';
export type { SIPResult, GrowthRow } from './sip';

export { calculateCompoundInterest } from './compound-interest';
export type { CIResult, GrowthDataPoint, CompoundingFrequency } from './compound-interest';

export {
  formatIndianNumber,
  formatIndianNumberShort,
  formatPercentage,
  formatCurrency,
} from './indian-format';
