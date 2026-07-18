import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SIPResult } from '@/calculators/sip';
import { formatIndianNumber } from '@/calculators/indian-format';

interface SIPCalculatorPreviewProps {
  result: SIPResult;
}

const COLORS = {
  invested: '#475569',
  gains: '#16A34A',
};

export function SIPCalculatorPreview({ result }: SIPCalculatorPreviewProps) {
  const pieData = [
    { name: 'Total Invested', value: Math.round(result.totalInvested) },
    { name: 'Wealth Gained', value: Math.round(result.wealthGained) },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((_) => (
              <Cell
                key={_.name}
                fill={_.name === 'Total Invested' ? COLORS.invested : COLORS.gains}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatIndianNumber(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
