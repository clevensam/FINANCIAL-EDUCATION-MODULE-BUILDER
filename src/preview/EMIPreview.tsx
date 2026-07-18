import { useState, useMemo, useCallback } from 'react';
import type { Block } from '@/types';
import { calculateEMI } from '@/calculators/emi';
import { formatIndianNumber } from '@/calculators/indian-format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface EMIPreviewProps {
  block: Block;
}

const COLORS = ['#2563EB', '#E2E8F0'];

export function EMIPreview({ block }: EMIPreviewProps) {
  const content = block.content as { principal: number; annualRate: number; tenureMonths: number };
  const [principal, setPrincipal] = useState(content.principal);
  const [annualRate, setAnnualRate] = useState(content.annualRate);
  const [tenureMonths, setTenureMonths] = useState(content.tenureMonths);

  const result = useMemo(
    () => calculateEMI(principal, annualRate, tenureMonths),
    [principal, annualRate, tenureMonths],
  );

  const pieData = useMemo(
    () => [
      { name: 'Principal', value: principal },
      { name: 'Total Interest', value: result.totalInterest },
    ],
    [principal, result.totalInterest],
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
          <label className="block text-sm font-medium text-[#475569] mb-1">Loan Amount</label>
          <input
            type="range"
            min={10000}
            max={10000000}
            step={10000}
            value={principal}
            onChange={handleSlider(setPrincipal)}
            className="w-full accent-[#2563EB]"
            aria-label="Loan amount"
          />
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Loan amount value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">Interest Rate</label>
          <input
            type="range"
            min={0.1}
            max={36}
            step={0.1}
            value={annualRate}
            onChange={handleSlider(setAnnualRate)}
            className="w-full accent-[#2563EB]"
            aria-label="Interest rate"
          />
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Interest rate value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">Tenure (months)</label>
          <input
            type="range"
            min={1}
            max={360}
            step={1}
            value={tenureMonths}
            onChange={handleSlider(setTenureMonths)}
            className="w-full accent-[#2563EB]"
            aria-label="Tenure months"
          />
          <input
            type="number"
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Tenure months value"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Monthly EMI</p>
          <p className="text-2xl font-bold text-[#0F172A]">{formatIndianNumber(result.emi)}</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Total Interest</p>
          <p className="text-2xl font-bold text-[#16A34A]">
            {formatIndianNumber(result.totalInterest)}
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Total Payment</p>
          <p className="text-2xl font-bold text-[#0F172A]">
            {formatIndianNumber(result.totalPayment)}
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
              Principal: {formatIndianNumber(principal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E2E8F0]" />
            <span className="text-sm text-[#475569]">
              Interest: {formatIndianNumber(result.totalInterest)}
            </span>
          </div>
        </div>
      </div>

      <details className="group">
        <summary className="text-sm font-medium text-[#2563EB] cursor-pointer select-none">
          View Amortization Schedule
        </summary>
        <div className="mt-3 max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-[#F8FAFC] sticky top-0">
              <tr>
                <th className="px-2 py-1.5 text-left text-[#475569] font-medium">Month</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Opening</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">EMI</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Principal</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Interest</th>
                <th className="px-2 py-1.5 text-right text-[#475569] font-medium">Closing</th>
              </tr>
            </thead>
            <tbody>
              {result.amortizationSchedule.map((row) => (
                <tr key={row.month} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                  <td className="px-2 py-1 text-[#64748B]">{row.month}</td>
                  <td className="px-2 py-1 text-right">{formatIndianNumber(row.openingBalance)}</td>
                  <td className="px-2 py-1 text-right font-medium">
                    {formatIndianNumber(row.emi)}
                  </td>
                  <td className="px-2 py-1 text-right text-[#16A34A]">
                    {formatIndianNumber(row.principalComponent)}
                  </td>
                  <td className="px-2 py-1 text-right text-[#DC2626]">
                    {formatIndianNumber(row.interestComponent)}
                  </td>
                  <td className="px-2 py-1 text-right">{formatIndianNumber(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
