export interface EMIResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  amortizationSchedule: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principalComponent: number;
  interestComponent: number;
  closingBalance: number;
}

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): EMIResult {
  if (annualRate === 0) {
    const emi = principal / tenureMonths;
    const totalPayment = principal;
    return {
      emi,
      totalInterest: 0,
      totalPayment,
      amortizationSchedule: generateAmortizationSchedule(principal, 0, tenureMonths),
    };
  }

  const monthlyRate = annualRate / 12 / 100;
  const compoundedRate = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * compoundedRate) / (compoundedRate - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    emi: roundToTwo(emi),
    totalInterest: roundToTwo(totalInterest),
    totalPayment: roundToTwo(totalPayment),
    amortizationSchedule: generateAmortizationSchedule(principal, monthlyRate, tenureMonths),
  };
}

function generateAmortizationSchedule(
  principal: number,
  monthlyRate: number,
  tenureMonths: number,
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let balance = principal;

  if (monthlyRate === 0) {
    const emiPerMonth = principal / tenureMonths;
    for (let month = 1; month <= tenureMonths; month++) {
      const opening = balance;
      const principalComponent = emiPerMonth;
      balance -= principalComponent;
      schedule.push({
        month,
        openingBalance: roundToTwo(opening),
        emi: roundToTwo(emiPerMonth),
        principalComponent: roundToTwo(principalComponent),
        interestComponent: 0,
        closingBalance: roundToTwo(Math.max(0, balance)),
      });
    }
    return schedule;
  }

  const compoundedRate = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * compoundedRate) / (compoundedRate - 1);

  for (let month = 1; month <= tenureMonths; month++) {
    const opening = balance;
    const interestComponent = balance * monthlyRate;
    const principalComponent = emi - interestComponent;
    balance -= principalComponent;

    schedule.push({
      month,
      openingBalance: roundToTwo(opening),
      emi: roundToTwo(emi),
      principalComponent: roundToTwo(principalComponent),
      interestComponent: roundToTwo(interestComponent),
      closingBalance: roundToTwo(Math.max(0, balance)),
    });
  }

  return schedule;
}

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
