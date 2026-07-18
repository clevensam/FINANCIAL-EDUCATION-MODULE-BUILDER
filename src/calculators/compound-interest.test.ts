import { describe, it, expect } from 'vitest';
import { calculateCompoundInterest } from './compound-interest';

describe('Compound Interest Calculator', () => {
  it('should calculate for annual compounding', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'annually');
    expect(result.maturityAmount).toBeGreaterThan(100000);
  });

  it('should calculate for monthly compounding', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'monthly');
    expect(result.maturityAmount).toBeGreaterThan(100000);
  });

  it('should calculate for quarterly compounding', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'quarterly');
    expect(result.maturityAmount).toBeGreaterThan(100000);
  });

  it('should calculate for half-yearly compounding', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'half-yearly');
    expect(result.maturityAmount).toBeGreaterThan(100000);
  });

  it('monthly compounding should yield more than annual', () => {
    const monthly = calculateCompoundInterest(100000, 8, 5, 'monthly');
    const annually = calculateCompoundInterest(100000, 8, 5, 'annually');
    expect(monthly.maturityAmount).toBeGreaterThan(annually.maturityAmount);
  });

  it('quarterly compounding should yield more than annual', () => {
    const quarterly = calculateCompoundInterest(100000, 8, 5, 'quarterly');
    const annually = calculateCompoundInterest(100000, 8, 5, 'annually');
    expect(quarterly.maturityAmount).toBeGreaterThan(annually.maturityAmount);
  });

  it('should handle zero rate', () => {
    const result = calculateCompoundInterest(100000, 0, 5, 'annually');
    expect(result.maturityAmount).toBe(100000);
    expect(result.totalInterest).toBe(0);
  });

  it('should generate growth data for each year', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'annually');
    expect(result.growthData).toHaveLength(5);
  });

  it('growth data should show increasing amounts', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'annually');
    for (let i = 1; i < result.growthData.length; i++) {
      expect(result.growthData[i].maturityAmount).toBeGreaterThan(
        result.growthData[i - 1].maturityAmount,
      );
    }
  });

  it('total interest should equal maturity minus principal', () => {
    const result = calculateCompoundInterest(100000, 8, 5, 'monthly');
    expect(result.totalInterest).toBeCloseTo(result.maturityAmount - 100000, 1);
  });
});
