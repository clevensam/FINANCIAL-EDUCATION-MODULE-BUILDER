import { useState, useMemo, useCallback } from 'react';
import type { Block } from '@/types';
import { calculateSIP } from '@/calculators/sip';
import { formatIndianNumber } from '@/calculators/indian-format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SIPPreviewProps {
  block: Block;
}

const COLORS = ['#2563EB', '#E2E8F0'];

export function SIPPreview({ block }: SIPPreviewProps) {
  const content = block.content as {
    monthlyInvestment: number;
    annualReturn: number;
    durationYears: number;
  };
  const [monthlyInvestment, setMonthlyInvestment] = useState(content.monthlyInvestment);
  const [annualReturn, setAnnualReturn] = useState(content.annualReturn);
  const [durationYears, setDurationYears] = useState(content.durationYears);

  const result = useMemo(
    () => calculateSIP(monthlyInvestment, annualReturn, durationYears),
    [monthlyInvestment, annualReturn, durationYears],
  );

  const pieData = useMemo(
    () => [
      { name: 'Total Invested', value: result.totalInvested },
      { name: 'Wealth Gained', value: result.wealthGained },
    ],
    [result.totalInvested, result.wealthGained],
  );

  const handleSlider = useCallback(
    (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(Number(e.target.value));
    },
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">
            Monthly Investment
          </label>
          <input
            type="range"
            min={500}
            max={500000}
            step={500}
            value={monthlyInvestment}
            onChange={handleSlider(setMonthlyInvestment)}
            className="w-full accent-[#2563EB]"
            aria-label="Monthly investment"
          />
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Monthly investment value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">Expected Return</label>
          <input
            type="range"
            min={1}
            max={30}
            step={0.5}
            value={annualReturn}
            onChange={handleSlider(setAnnualReturn)}
            className="w-full accent-[#2563EB]"
            aria-label="Expected return"
          />
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Expected return value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">Duration (years)</label>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={durationYears}
            onChange={handleSlider(setDurationYears)}
            className="w-full accent-[#2563EB]"
            aria-label="Duration years"
          />
          <input
            type="number"
            value={durationYears}
            onChange={(e) => setDurationYears(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Duration years value"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Total Invested</p>
          <p className="text-2xl font-bold text-[#0F172A]">
            {formatIndianNumber(result.totalInvested)}
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Wealth Gained</p>
          <p className="text-2xl font-bold text-[#16A34A]">
            {formatIndianNumber(result.wealthGained)}
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Future Value</p>
          <p className="text-2xl font-bold text-[#0F172A]">
            {formatIndianNumber(result.futureValue)}
          </p>
        </div>
      </div>

      <div className="flex gap-8 items-center">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                animationDuration={800}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatIndianNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
            <span className="text-sm text-[#475569]">
              Invested: {formatIndianNumber(result.totalInvested)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E2E8F0]" />
            <span className="text-sm text-[#475569]">
              Gains: {formatIndianNumber(result.wealthGained)}
            </span>
          </div>
        </div>
      </div>

      <details className="group">
        <summary className="text-sm font-medium text-[#2563EB] cursor-pointer select-none">
          View Year-by-Year Growth
        </summary>
        <div className="mt-3 max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-[#F8FAFC] sticky top-0">
              <tr>
                <th className="px-2 py-1.5 text-left text-[#475569] font-medium">Year</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Invested</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Future Value</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Wealth Gain</th>
              </tr>
            </thead>
            <tbody>
              {result.growthTable.map((row) => (
                <tr key={row.year} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                  <td className="px-2 py-1 text-[#64748B]">{row.year}</td>
                  <td className="px-2 py-1 text-right">{formatIndianNumber(row.totalInvested)}</td>
                  <td className="px-2 py-1 text-right font-medium">
                    {formatIndianNumber(row.futureValue)}
                  </td>
                  <td className="px-2 py-1 text-right text-[#16A34A]">
                    {formatIndianNumber(row.wealthGained)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
