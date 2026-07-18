import { useState, useCallback, useMemo } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import { calculateEMI } from '@/calculators/emi';
import { formatIndianNumber } from '@/calculators/indian-format';
import { EMICalculatorPreview } from './EMICalculatorPreview';

interface EMICalculatorEditorProps {
  block: Block;
}

export function EMICalculatorEditor({ block }: EMICalculatorEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as { principal: number; annualRate: number; tenureMonths: number };

  const [principal, setPrincipal] = useState(content.principal);
  const [annualRate, setAnnualRate] = useState(content.annualRate);
  const [tenureMonths, setTenureMonths] = useState(content.tenureMonths);
  const [showAll, setShowAll] = useState(false);

  const handlePrincipalChange = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 10000), 100000000);
      setPrincipal(clamped);
      updateBlockContent(block.id, { principal: clamped, annualRate, tenureMonths });
    },
    [block.id, annualRate, tenureMonths, updateBlockContent],
  );

  const handleRateChange = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 1), 36);
      setAnnualRate(clamped);
      updateBlockContent(block.id, { principal, annualRate: clamped, tenureMonths });
    },
    [block.id, principal, tenureMonths, updateBlockContent],
  );

  const handleTenureChange = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(Math.round(value), 1), 360);
      setTenureMonths(clamped);
      updateBlockContent(block.id, { principal, annualRate, tenureMonths: clamped });
    },
    [block.id, principal, annualRate, updateBlockContent],
  );

  const result = useMemo(
    () => calculateEMI(principal, annualRate, tenureMonths),
    [principal, annualRate, tenureMonths],
  );

  const interestToPrincipalRatio = result.totalInterest / principal;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Principal (₹)</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => handlePrincipalChange(Number(e.target.value))}
            min={10000}
            max={100000000}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Loan principal amount"
          />
          <input
            type="range"
            value={principal}
            onChange={(e) => handlePrincipalChange(Number(e.target.value))}
            min={10000}
            max={100000000}
            step={10000}
            className="w-full mt-1"
            aria-label="Principal slider"
          />
          <span className="text-xs text-[#64748B]">{formatIndianNumber(principal)}</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Annual Rate (%)</label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            min={1}
            max={36}
            step={0.1}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Annual interest rate"
          />
          <input
            type="range"
            value={annualRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            min={1}
            max={36}
            step={0.1}
            className="w-full mt-1"
            aria-label="Rate slider"
          />
          <span className="text-xs text-[#64748B]">{annualRate.toFixed(1)}%</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Tenure (months)</label>
          <input
            type="number"
            value={tenureMonths}
            onChange={(e) => handleTenureChange(Number(e.target.value))}
            min={1}
            max={360}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Loan tenure in months"
          />
          <input
            type="range"
            value={tenureMonths}
            onChange={(e) => handleTenureChange(Number(e.target.value))}
            min={1}
            max={360}
            className="w-full mt-1"
            aria-label="Tenure slider"
          />
          <span className="text-xs text-[#64748B]">
            {tenureMonths} mo ({Math.floor(tenureMonths / 12)}y {tenureMonths % 12}m)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2563EB]">{formatIndianNumber(result.emi)}</div>
          <div className="text-xs text-[#64748B]">Monthly EMI</div>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${
              interestToPrincipalRatio > 2
                ? 'text-[#DC2626]'
                : interestToPrincipalRatio > 1
                  ? 'text-[#F59E0B]'
                  : 'text-[#16A34A]'
            }`}
          >
            {formatIndianNumber(result.totalInterest)}
          </div>
          <div className="text-xs text-[#64748B]">Total Interest</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#0F172A]">
            {formatIndianNumber(result.totalPayment)}
          </div>
          <div className="text-xs text-[#64748B]">Total Payment</div>
        </div>
      </div>

      <EMICalculatorPreview result={result} />

      <div>
        <h4 className="text-xs font-medium text-[#64748B] mb-2">Amortization Schedule</h4>
        <div className="max-h-[400px] overflow-y-auto border border-[#E2E8F0] rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-[#F8FAFC] sticky top-0">
              <tr>
                <th className="px-2 py-1 text-left font-medium text-[#64748B]">#</th>
                <th className="px-2 py-1 text-right font-medium text-[#64748B]">Opening</th>
                <th className="px-2 py-1 text-right font-medium text-[#64748B]">EMI</th>
                <th className="px-2 py-1 text-right font-medium text-[#64748B]">Principal</th>
                <th className="px-2 py-1 text-right font-medium text-[#64748B]">Interest</th>
                <th className="px-2 py-1 text-right font-medium text-[#64748B]">Closing</th>
              </tr>
            </thead>
            <tbody>
              {(showAll
                ? result.amortizationSchedule
                : result.amortizationSchedule.slice(0, 12)
              ).map((row) => (
                <tr key={row.month} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                  <td className="px-2 py-1 text-[#64748B]">{row.month}</td>
                  <td className="px-2 py-1 text-right">{formatIndianNumber(row.openingBalance)}</td>
                  <td className="px-2 py-1 text-right">{formatIndianNumber(row.emi)}</td>
                  <td className="px-2 py-1 text-right">
                    {formatIndianNumber(row.principalComponent)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {formatIndianNumber(row.interestComponent)}
                  </td>
                  <td className="px-2 py-1 text-right">{formatIndianNumber(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.amortizationSchedule.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          >
            {showAll
              ? 'Show first 12 months'
              : `Show all ${result.amortizationSchedule.length} months`}
          </button>
        )}
      </div>
    </div>
  );
}
