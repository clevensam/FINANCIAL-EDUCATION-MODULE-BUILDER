import { useState, useCallback, useMemo } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import { calculateSIP } from '@/calculators/sip';
import { formatIndianNumber } from '@/calculators/indian-format';
import { SIPCalculatorPreview } from './SIPCalculatorPreview';

interface SIPCalculatorEditorProps {
  block: Block;
}

export function SIPCalculatorEditor({ block }: SIPCalculatorEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as {
    monthlyInvestment: number;
    annualReturn: number;
    durationYears: number;
  };

  const [investment, setInvestment] = useState(content.monthlyInvestment);
  const [returnRate, setReturnRate] = useState(content.annualReturn);
  const [duration, setDuration] = useState(content.durationYears);

  const handleInvestmentChange = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 500), 1000000);
      setInvestment(clamped);
      updateBlockContent(block.id, {
        monthlyInvestment: clamped,
        annualReturn: returnRate,
        durationYears: duration,
      });
    },
    [block.id, returnRate, duration, updateBlockContent],
  );

  const handleRateChange = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 1), 30);
      setReturnRate(clamped);
      updateBlockContent(block.id, {
        monthlyInvestment: investment,
        annualReturn: clamped,
        durationYears: duration,
      });
    },
    [block.id, investment, duration, updateBlockContent],
  );

  const handleDurationChange = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(Math.round(value), 1), 40);
      setDuration(clamped);
      updateBlockContent(block.id, {
        monthlyInvestment: investment,
        annualReturn: returnRate,
        durationYears: clamped,
      });
    },
    [block.id, investment, returnRate, updateBlockContent],
  );

  const result = useMemo(
    () => calculateSIP(investment, returnRate, duration),
    [investment, returnRate, duration],
  );

  const gainPercent =
    result.totalInvested > 0 ? (result.wealthGained / result.totalInvested) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">
            Monthly Investment (₹)
          </label>
          <input
            type="number"
            value={investment}
            onChange={(e) => handleInvestmentChange(Number(e.target.value))}
            min={500}
            max={1000000}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Monthly investment amount"
          />
          <input
            type="range"
            value={investment}
            onChange={(e) => handleInvestmentChange(Number(e.target.value))}
            min={500}
            max={1000000}
            step={500}
            className="w-full mt-1"
            aria-label="Investment slider"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">
            Expected Return (%)
          </label>
          <input
            type="number"
            value={returnRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            min={1}
            max={30}
            step={0.5}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Expected annual return rate"
          />
          <input
            type="range"
            value={returnRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            min={1}
            max={30}
            step={0.5}
            className="w-full mt-1"
            aria-label="Return rate slider"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Duration (years)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            min={1}
            max={40}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Investment duration in years"
          />
          <input
            type="range"
            value={duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            min={1}
            max={40}
            className="w-full mt-1"
            aria-label="Duration slider"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#16A34A]">
            {formatIndianNumber(result.futureValue)}
          </div>
          <div className="text-xs text-[#64748B]">Future Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#475569]">
            {formatIndianNumber(result.totalInvested)}
          </div>
          <div className="text-xs text-[#64748B]">Total Invested</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2563EB]">
            {formatIndianNumber(result.wealthGained)}
          </div>
          <div className="text-xs text-[#64748B]">Wealth Gained ({gainPercent.toFixed(1)}%)</div>
        </div>
      </div>

      <SIPCalculatorPreview result={result} />

      {result.growthTable.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#64748B] mb-2">Year-by-Year Growth</h4>
          <div className="max-h-[300px] overflow-y-auto border border-[#E2E8F0] rounded-md">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FAFC] sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-[#64748B]">Year</th>
                  <th className="px-2 py-1 text-right font-medium text-[#64748B]">
                    Total Invested
                  </th>
                  <th className="px-2 py-1 text-right font-medium text-[#64748B]">Future Value</th>
                  <th className="px-2 py-1 text-right font-medium text-[#64748B]">Wealth Gained</th>
                </tr>
              </thead>
              <tbody>
                {result.growthTable.map((row) => (
                  <tr key={row.year} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-2 py-1 text-[#64748B]">{row.year}</td>
                    <td className="px-2 py-1 text-right">
                      {formatIndianNumber(row.totalInvested)}
                    </td>
                    <td className="px-2 py-1 text-right">{formatIndianNumber(row.futureValue)}</td>
                    <td className="px-2 py-1 text-right">{formatIndianNumber(row.wealthGained)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
