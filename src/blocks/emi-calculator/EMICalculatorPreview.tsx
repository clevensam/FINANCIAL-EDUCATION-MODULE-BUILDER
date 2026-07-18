import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { EMIResult } from '@/calculators/emi';
import { formatIndianNumber } from '@/calculators/indian-format';

interface EMICalculatorPreviewProps {
  result: EMIResult;
}

const COLORS = {
  principal: '#2563EB',
  interest: '#F59E0B',
};

export function EMICalculatorPreview({ result }: EMICalculatorPreviewProps) {
  const pieData = [
    { name: 'Principal', value: Math.round(result.totalPayment - result.totalInterest) },
    { name: 'Interest', value: Math.round(result.totalInterest) },
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
                fill={_.name === 'Principal' ? COLORS.principal : COLORS.interest}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatIndianNumber(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
