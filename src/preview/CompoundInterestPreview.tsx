import { useState, useMemo } from 'react';
import type { Block } from '@/types';
import type { CompoundingFrequency } from '@/calculators/compound-interest';
import { calculateCompoundInterest } from '@/calculators/compound-interest';
import { formatIndianNumber } from '@/calculators/indian-format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CompoundInterestPreviewProps {
  block: Block;
}

const FREQUENCIES: { value: CompoundingFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half Yearly' },
  { value: 'annually', label: 'Annually' },
];

export function CompoundInterestPreview({ block }: CompoundInterestPreviewProps) {
  const content = block.content as {
    principal: number;
    annualRate: number;
    timeYears: number;
    compoundingFrequency: CompoundingFrequency;
  };
  const [principal, setPrincipal] = useState(content.principal);
  const [annualRate, setAnnualRate] = useState(content.annualRate);
  const [timeYears, setTimeYears] = useState(content.timeYears);
  const [frequency, setFrequency] = useState<CompoundingFrequency>(content.compoundingFrequency);

  const result = useMemo(
    () => calculateCompoundInterest(principal, annualRate, timeYears, frequency),
    [principal, annualRate, timeYears, frequency],
  );

  const rateLabelMap: Record<CompoundingFrequency, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    'half-yearly': 'Half-Yearly',
    annually: 'Annually',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">Principal Amount</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Principal amount"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">
            Annual Interest Rate
          </label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Annual interest rate"
            min={0}
            max={100}
            step={0.1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">
            Time Period (years)
          </label>
          <input
            type="number"
            value={timeYears}
            onChange={(e) => setTimeYears(Number(e.target.value))}
            className="w-full px-3 py-1.5 text-sm border border-[#E2E8F0] rounded"
            aria-label="Time period years"
            min={1}
            max={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-1">
            Compounding Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
            className="w-full px-3 py-1.5 text-sm border border-[#E2E8F0] rounded bg-white"
            aria-label="Compounding frequency"
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Maturity Amount</p>
          <p className="text-2xl font-bold text-[#0F172A]">
            {formatIndianNumber(result.maturityAmount)}
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-4">
          <p className="text-sm text-[#64748B]">Total Interest</p>
          <p className="text-2xl font-bold text-[#16A34A]">
            {formatIndianNumber(result.totalInterest)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-[#E2E8F0]">
        <p className="text-sm font-medium text-[#475569] mb-3">
          Growth Over Time ({rateLabelMap[frequency]} Compounding)
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickFormatter={(v) => `Y${v}`}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip
                formatter={(value: number) => formatIndianNumber(value)}
                labelFormatter={(v) => `Year ${v}`}
              />
              <Line
                type="monotone"
                dataKey="maturityAmount"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3 }}
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="principal"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
