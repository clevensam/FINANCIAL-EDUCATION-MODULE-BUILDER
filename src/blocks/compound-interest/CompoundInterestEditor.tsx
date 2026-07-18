import { useState, useCallback, useMemo } from 'react';
import type { Block, CompoundingFrequency } from '@/calculators';
import { useStore } from '@/store';
import { calculateCompoundInterest } from '@/calculators/compound-interest';
import { formatIndianNumber } from '@/calculators/indian-format';
import { CompoundInterestPreview } from './CompoundInterestPreview';

interface CompoundInterestEditorProps {
  block: Block;
}

const FREQUENCIES: { value: CompoundingFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-Yearly' },
  { value: 'annually', label: 'Annually' },
];

export function CompoundInterestEditor({ block }: CompoundInterestEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as {
    principal: number;
    annualRate: number;
    timeYears: number;
    compoundingFrequency: CompoundingFrequency;
  };

  const [principal, setPrincipal] = useState(content.principal);
  const [rate, setRate] = useState(content.annualRate);
  const [time, setTime] = useState(content.timeYears);
  const [frequency, setFrequency] = useState<CompoundingFrequency>(content.compoundingFrequency);

  const handlePrincipalChange = useCallback(
    (value: number) => {
      setPrincipal(value);
      updateBlockContent(block.id, {
        principal: value,
        annualRate: rate,
        timeYears: time,
        compoundingFrequency: frequency,
      });
    },
    [block.id, rate, time, frequency, updateBlockContent],
  );

  const handleRateChange = useCallback(
    (value: number) => {
      setRate(value);
      updateBlockContent(block.id, {
        principal,
        annualRate: value,
        timeYears: time,
        compoundingFrequency: frequency,
      });
    },
    [block.id, principal, time, frequency, updateBlockContent],
  );

  const handleTimeChange = useCallback(
    (value: number) => {
      setTime(value);
      updateBlockContent(block.id, {
        principal,
        annualRate: rate,
        timeYears: value,
        compoundingFrequency: frequency,
      });
    },
    [block.id, principal, rate, frequency, updateBlockContent],
  );

  const handleFrequencyChange = useCallback(
    (value: CompoundingFrequency) => {
      setFrequency(value);
      updateBlockContent(block.id, {
        principal,
        annualRate: rate,
        timeYears: time,
        compoundingFrequency: value,
      });
    },
    [block.id, principal, rate, time, updateBlockContent],
  );

  const result = useMemo(
    () => calculateCompoundInterest(principal, rate, time, frequency),
    [principal, rate, time, frequency],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Principal (₹)</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => handlePrincipalChange(Number(e.target.value))}
            min={1000}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Principal amount"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Annual Rate (%)</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            min={0.1}
            max={100}
            step={0.1}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Annual interest rate"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Time (years)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => handleTimeChange(Number(e.target.value))}
            min={1}
            max={50}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Time in years"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Compounding</label>
          <select
            value={frequency}
            onChange={(e) => handleFrequencyChange(e.target.value as CompoundingFrequency)}
            className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none bg-white"
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

      <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#2563EB]">
            {formatIndianNumber(result.maturityAmount)}
          </div>
          <div className="text-xs text-[#64748B]">Maturity Amount</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#F59E0B]">
            {formatIndianNumber(result.totalInterest)}
          </div>
          <div className="text-xs text-[#64748B]">Total Interest</div>
        </div>
      </div>

      <CompoundInterestPreview result={result} />
    </div>
  );
}
