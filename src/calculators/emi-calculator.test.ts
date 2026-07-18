import { describe, it, expect } from 'vitest';
import { calculateEMI, roundToTwo } from './emi';

describe('EMI Calculator', () => {
  it('should calculate EMI correctly for standard case (₹5L, 8.5%, 240 months)', () => {
    const result = calculateEMI(500000, 8.5, 240);
    expect(result.emi).toBeCloseTo(4339.12, 0);
  });

  it('should calculate EMI correctly for ₹10L, 10%, 120 months', () => {
    const result = calculateEMI(1000000, 10, 120);
    expect(result.emi).toBeCloseTo(13215.07, 0);
  });

  it('should calculate EMI correctly for ₹25L, 7.5%, 180 months', () => {
    const result = calculateEMI(2500000, 7.5, 180);
    expect(result.emi).toBeCloseTo(23175.31, 0);
  });

  it('should calculate EMI correctly for ₹50L, 12%, 360 months', () => {
    const result = calculateEMI(5000000, 12, 360);
    expect(result.emi).toBeCloseTo(51430.63, 0);
  });

  it('should calculate EMI correctly for ₹1L, 36%, 360 months', () => {
    const result = calculateEMI(100000, 36, 360);
    expect(result.emi).toBeCloseTo(3000.07, 0);
  });

  it('should handle zero interest rate (EMI = Principal / Tenure)', () => {
    const result = calculateEMI(500000, 0, 240);
    expect(result.emi).toBeCloseTo(2083.33, 1);
    expect(result.totalInterest).toBe(0);
  });

  it('should calculate total payment correctly', () => {
    const result = calculateEMI(500000, 8.5, 240);
    expect(result.totalPayment).toBeGreaterThan(1000000);
    expect(result.totalPayment - result.emi * 240).toBeLessThan(1);
  });

  it('should calculate total interest correctly', () => {
    const result = calculateEMI(500000, 8.5, 240);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - 500000, 1);
  });

  it('should generate amortization schedule with correct length', () => {
    const result = calculateEMI(500000, 8.5, 240);
    expect(result.amortizationSchedule).toHaveLength(240);
  });

  it('should have closing balance of 0 at end of amortization', () => {
    const result = calculateEMI(500000, 8.5, 240);
    const lastRow = result.amortizationSchedule[result.amortizationSchedule.length - 1];
    expect(lastRow.closingBalance).toBeCloseTo(0, 1);
  });

  it('should handle minimum principal (10K)', () => {
    const result = calculateEMI(10000, 8.5, 1);
    expect(result.emi).toBeGreaterThan(0);
  });

  it('should handle maximum principal (10Cr) with 1 month tenure', () => {
    const result = calculateEMI(100000000, 1, 1);
    expect(result.emi).toBeGreaterThan(0);
  });

  it('should handle short tenure of 1 month', () => {
    const result = calculateEMI(500000, 8.5, 1);
    expect(result.totalPayment).toBeCloseTo(result.emi, 1);
  });

  it('should handle high rate (36%) correctly', () => {
    const result = calculateEMI(100000, 36, 12);
    expect(result.emi).toBeGreaterThan(0);
  });

  it('should return rounded values to 2 decimal places', () => {
    const result = calculateEMI(500000, 8.5, 240);
    const decimalStr = result.emi.toString();
    const decimalPart = decimalStr.split('.')[1];
    if (decimalPart) {
      expect(decimalPart.length).toBeLessThanOrEqual(2);
    }
  });

  it('amortization first month should have correct opening balance', () => {
    const result = calculateEMI(500000, 8.5, 240);
    expect(result.amortizationSchedule[0].openingBalance).toBeCloseTo(500000, 1);
  });
});

describe('roundToTwo', () => {
  it('should round to 2 decimal places', () => {
    expect(roundToTwo(1.234)).toBe(1.23);
    expect(roundToTwo(1.235)).toBe(1.24);
    expect(roundToTwo(1.2)).toBe(1.2);
    expect(roundToTwo(1)).toBe(1);
  });
});
