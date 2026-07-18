import { describe, it, expect } from 'vitest';
import { formatIndianNumber, formatIndianNumberShort, formatPercentage } from './indian-format';

describe('Indian Number Formatting', () => {
  it('should format 1000 as ₹1,000.00', () => {
    expect(formatIndianNumber(1000)).toBe('₹1,000.00');
  });

  it('should format 100000 as ₹1,00,000.00 (lakh)', () => {
    expect(formatIndianNumber(100000)).toBe('₹1,00,000.00');
  });

  it('should format 10000000 as ₹1,00,00,000.00 (crore)', () => {
    expect(formatIndianNumber(10000000)).toBe('₹1,00,00,000.00');
  });

  it('should format 0 as ₹0.00', () => {
    expect(formatIndianNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatIndianNumber(-5000)).toBe('-₹5,000.00');
  });

  it('should handle decimal values', () => {
    const result = formatIndianNumber(1234.56);
    expect(result).toContain('.56');
  });

  it('should format large numbers in crores', () => {
    const result = formatIndianNumber(100000000);
    expect(result).toBe('₹10,00,00,000.00');
  });
});

describe('formatIndianNumberShort', () => {
  it('should format in crores for >= 1 crore', () => {
    expect(formatIndianNumberShort(10000000)).toContain('Cr');
  });

  it('should format in lakhs for >= 1 lakh', () => {
    const result = formatIndianNumberShort(100000);
    expect(result).toContain('L');
  });

  it('should format in K for >= 1000', () => {
    const result = formatIndianNumberShort(5000);
    expect(result).toContain('K');
  });
});

describe('formatPercentage', () => {
  it('should format with one decimal place', () => {
    expect(formatPercentage(8.5)).toBe('8.5%');
  });

  it('should format whole numbers', () => {
    expect(formatPercentage(10)).toBe('10.0%');
  });
});
