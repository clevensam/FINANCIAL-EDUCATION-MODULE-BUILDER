export interface SIPResult {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
  growthTable: GrowthRow[];
}

export interface GrowthRow {
  year: number;
  totalInvested: number;
  futureValue: number;
  wealthGained: number;
}

export function calculateSIP(
  monthlyInvestment: number,
  annualReturn: number,
  durationYears: number,
): SIPResult {
  const monthlyRate = annualReturn / 12 / 100;
  const totalMonths = durationYears * 12;
  const totalInvested = monthlyInvestment * totalMonths;

  if (annualReturn === 0) {
    return {
      futureValue: totalInvested,
      totalInvested,
      wealthGained: 0,
      growthTable: generateSIPGrowthTable(monthlyInvestment, 0, durationYears),
    };
  }

  const compoundedRate = Math.pow(1 + monthlyRate, totalMonths);
  const futureValue = monthlyInvestment * ((compoundedRate - 1) / monthlyRate) * (1 + monthlyRate);
  const wealthGained = futureValue - totalInvested;

  return {
    futureValue: roundToTwo(futureValue),
    totalInvested,
    wealthGained: roundToTwo(wealthGained),
    growthTable: generateSIPGrowthTable(monthlyInvestment, monthlyRate, durationYears),
  };
}

function generateSIPGrowthTable(
  monthlyInvestment: number,
  monthlyRate: number,
  durationYears: number,
): GrowthRow[] {
  const table: GrowthRow[] = [];

  for (let year = 1; year <= durationYears; year++) {
    const totalMonths = year * 12;
    const totalInvested = monthlyInvestment * totalMonths;

    if (monthlyRate === 0) {
      table.push({
        year,
        totalInvested,
        futureValue: totalInvested,
        wealthGained: 0,
      });
    } else {
      const compoundedRate = Math.pow(1 + monthlyRate, totalMonths);
      const futureValue =
        monthlyInvestment * ((compoundedRate - 1) / monthlyRate) * (1 + monthlyRate);
      table.push({
        year,
        totalInvested,
        futureValue: roundToTwo(futureValue),
        wealthGained: roundToTwo(futureValue - totalInvested),
      });
    }
  }

  return table;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
