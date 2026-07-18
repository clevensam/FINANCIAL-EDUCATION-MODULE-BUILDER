export type CompoundingFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'annually';

export interface CIResult {
  maturityAmount: number;
  totalInterest: number;
  growthData: GrowthDataPoint[];
}

export interface GrowthDataPoint {
  year: number;
  principal: number;
  maturityAmount: number;
  totalInterest: number;
}

const compoundingMap: Record<CompoundingFrequency, number> = {
  monthly: 12,
  quarterly: 4,
  'half-yearly': 2,
  annually: 1,
};

export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  timeYears: number,
  frequency: CompoundingFrequency,
): CIResult {
  const n = compoundingMap[frequency];
  const r = annualRate / 100;

  if (annualRate === 0) {
    return {
      maturityAmount: principal,
      totalInterest: 0,
      growthData: generateCIGrowthData(principal, 0, n, timeYears),
    };
  }

  const amount = principal * Math.pow(1 + r / n, n * timeYears);
  const totalInterest = amount - principal;

  return {
    maturityAmount: roundToTwo(amount),
    totalInterest: roundToTwo(totalInterest),
    growthData: generateCIGrowthData(principal, r, n, timeYears),
  };
}

function generateCIGrowthData(
  principal: number,
  rate: number,
  compoundingPerYear: number,
  timeYears: number,
): GrowthDataPoint[] {
  const data: GrowthDataPoint[] = [];

  for (let year = 1; year <= timeYears; year++) {
    if (rate === 0) {
      data.push({
        year,
        principal,
        maturityAmount: principal,
        totalInterest: 0,
      });
    } else {
      const amount = principal * Math.pow(1 + rate / compoundingPerYear, compoundingPerYear * year);
      data.push({
        year,
        principal,
        maturityAmount: roundToTwo(amount),
        totalInterest: roundToTwo(amount - principal),
      });
    }
  }

  return data;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
