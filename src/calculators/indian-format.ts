export function formatIndianNumber(value: number): string {
  if (value === 0) return '0';

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const [integerPart, decimalPart] = absValue.toFixed(2).split('.');

  const lastThree = integerPart.slice(-3);
  const rest = integerPart.slice(0, -3);

  let formattedInteger = '';

  if (rest.length > 0) {
    const groups: string[] = [];
    let remaining = rest;

    while (remaining.length > 0) {
      groups.unshift(remaining.slice(-2));
      remaining = remaining.slice(0, -2);
    }

    formattedInteger = groups.join(',') + ',' + lastThree;
  } else {
    formattedInteger = lastThree;
  }

  const result = `₹${formattedInteger}.${decimalPart}`;
  return isNegative ? `-${result}` : result;
}

export function formatIndianNumberShort(value: number): string {
  const absValue = Math.abs(value);
  const isNegative = value < 0;
  const prefix = isNegative ? '-' : '';
  const symbol = '₹';

  if (absValue >= 10000000) {
    return `${prefix}${symbol}${(absValue / 10000000).toFixed(2)} Cr`;
  }
  if (absValue >= 100000) {
    return `${prefix}${symbol}${(absValue / 100000).toFixed(2)} L`;
  }
  if (absValue >= 1000) {
    return `${prefix}${symbol}${(absValue / 1000).toFixed(1)}K`;
  }

  return `${prefix}${symbol}${absValue.toFixed(0)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number): string {
  return formatIndianNumber(value);
}
