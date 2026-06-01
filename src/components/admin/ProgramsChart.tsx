import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { programStats } from '../../data/mockData';

// Custom tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #EDE9E5',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(30,27,46,0.10)',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#1E1B2E' }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.name} style={{ color: entry.color, display: 'flex', gap: 8, marginBottom: 2 }}>
          <span>{entry.name}:</span>
          <span style={{ fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ProgramsChart() {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <div className="chart-card__title">Популярность программ</div>
          <div className="chart-card__subtitle">запросы · матчи · посещения</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={programStats}
          layout="vertical"      /* Horizontal bars — better for long labels */
          margin={{ left: 12, right: 16, top: 0, bottom: 0 }}
          barCategoryGap="30%"
          barGap={3}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDE9E5" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#A09EB0' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="program" tick={{ fontSize: 12, fill: '#6B6880', fontWeight: 500 }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196,135,154,0.06)' }} />
          <Legend
            formatter={(v) => <span style={{ fontSize: 12, color: '#6B6880' }}>{v}</span>}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="requests" name="Запросы"  fill="#C4879A" radius={[0,4,4,0]} />
          <Bar dataKey="matches"  name="Матчи"    fill="#C9A96E" radius={[0,4,4,0]} />
          <Bar dataKey="attended" name="Пришли"   fill="#7BAE9E" radius={[0,4,4,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
