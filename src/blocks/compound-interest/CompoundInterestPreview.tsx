import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CIResult } from '@/calculators/compound-interest';
import { formatIndianNumber } from '@/calculators/indian-format';

interface CompoundInterestPreviewProps {
  result: CIResult;
}

export function CompoundInterestPreview({ result }: CompoundInterestPreviewProps) {
  const chartData = result.growthData.map((d) => ({
    year: d.year,
    Amount: Math.round(d.maturityAmount),
    'Total Interest': Math.round(d.totalInterest),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="year" stroke="#64748B" fontSize={12} />
          <YAxis stroke="#64748B" fontSize={12} />
          <Tooltip formatter={(value: number) => formatIndianNumber(value)} />
          <Line
            type="monotone"
            dataKey="Amount"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ fill: '#2563EB', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Total Interest"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: '#F59E0B', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
