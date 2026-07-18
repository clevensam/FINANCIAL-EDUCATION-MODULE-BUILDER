import { describe, it, expect } from 'vitest';
import { calculateSIP } from './sip';

describe('SIP Calculator', () => {
  it('should calculate future value for standard case', () => {
    const result = calculateSIP(5000, 12, 10);
    expect(result.futureValue).toBeGreaterThan(result.totalInvested);
    expect(result.totalInvested).toBe(5000 * 120);
  });

  it('should handle zero return rate', () => {
    const result = calculateSIP(5000, 0, 10);
    expect(result.futureValue).toBe(result.totalInvested);
    expect(result.wealthGained).toBe(0);
  });

  it('should calculate total invested correctly', () => {
    const result = calculateSIP(10000, 12, 5);
    expect(result.totalInvested).toBe(10000 * 60);
  });

  it('should generate growth table with correct number of years', () => {
    const result = calculateSIP(5000, 12, 10);
    expect(result.growthTable).toHaveLength(10);
  });

  it('should have positive wealth gained for positive return rate', () => {
    const result = calculateSIP(5000, 10, 5);
    expect(result.wealthGained).toBeGreaterThan(0);
  });

  it('should handle minimum investment (500)', () => {
    const result = calculateSIP(500, 12, 1);
    expect(result.futureValue).toBeGreaterThan(0);
  });

  it('should handle maximum investment (10L)', () => {
    const result = calculateSIP(1000000, 12, 1);
    expect(result.futureValue).toBeGreaterThan(0);
  });

  it('should handle minimum duration (1 year)', () => {
    const result = calculateSIP(5000, 12, 1);
    expect(result.growthTable).toHaveLength(1);
  });

  it('should handle maximum duration (40 years)', () => {
    const result = calculateSIP(5000, 12, 40);
    expect(result.growthTable).toHaveLength(40);
  });

  it('year-by-year table should show cumulative growth', () => {
    const result = calculateSIP(5000, 12, 5);
    for (let i = 1; i < result.growthTable.length; i++) {
      expect(result.growthTable[i].futureValue).toBeGreaterThan(
        result.growthTable[i - 1].futureValue,
      );
    }
  });

  it('should handle 30% max return rate', () => {
    const result = calculateSIP(5000, 30, 5);
    expect(result.futureValue).toBeGreaterThan(0);
  });

  it('should produce wealth gained equal to future value minus total invested', () => {
    const result = calculateSIP(5000, 12, 10);
    expect(result.wealthGained).toBeCloseTo(result.futureValue - result.totalInvested, 1);
  });
});
