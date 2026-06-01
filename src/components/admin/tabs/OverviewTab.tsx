import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Heart, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { adminMetrics, weeklyTrend } from '../../../data/mockData';
import { MetricCard }      from '../MetricCard';
import { ProgramsChart }   from '../ProgramsChart';
import { TimeHeatmap }     from '../TimeHeatmap';
import { AIInsights }      from '../AIInsights';
import { RecentRequests }  from '../RecentRequests';
import { DwhBadge }        from '../../shared/DwhBadge';

const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1px solid #EDE9E5', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 16px rgba(30,27,46,0.10)', fontSize:13 }}>
      <div style={{ fontWeight:700, marginBottom:6, color:'#1E1B2E' }}>{label}</div>
      {payload.map((e: any) => (
        <div key={e.name} style={{ color:e.color, display:'flex', gap:8, marginBottom:2 }}>
          <span>{e.name}:</span><span style={{ fontWeight:600 }}>{e.value}</span>
        </div>
      ))}
    </div>
  );
};

export function OverviewTab() {
  return (
    <>
      <div className="metrics-grid">
        <MetricCard icon={Users}       iconBg="var(--rose-light)"    iconColor="var(--rose-dark)" value={adminMetrics.totalRequests}  label="Запросов на buddy"      trend={12} />
        <MetricCard icon={Heart}       iconBg="var(--lavender-light)" iconColor="var(--lavender)"  value={adminMetrics.matchesFound}   label="Матчей найдено"         trend={9}  />
        <MetricCard icon={Calendar}    iconBg="var(--gold-light)"     iconColor="var(--gold)"      value={adminMetrics.bookedTogether} label="Записались вместе"      trend={18} />
        <MetricCard icon={CheckCircle} iconBg="var(--sage-light)"     iconColor="var(--sage)"      value={adminMetrics.attended}       label="Пришли на тренировку"   trend={5}  />
        <MetricCard icon={TrendingUp}  iconBg="var(--surface-2)"      iconColor="var(--text-2)"    value={`${adminMetrics.conversionRate}%`} label="Конверсия в посещение" trend={-2} />
      </div>

      <div className="charts-row" style={{ marginBottom: 24 }}>
        <div className="chart-card chart-card--full">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Недельный тренд</div>
              <div className="chart-card__subtitle">запросы и матчи по дням</div>
            </div>
            <div className="trend-legend">
              <div className="trend-legend__item"><div className="trend-legend__dot" style={{ background:'#C4879A' }} />Запросы</div>
              <div className="trend-legend__item"><div className="trend-legend__dot" style={{ background:'#C9A96E' }} />Матчи</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrend} margin={{ left:-10, right:8, top:4, bottom:0 }}>
              <defs>
                <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C4879A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C4879A" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gMat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A96E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A96E" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:12, fill:'#A09EB0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#A09EB0' }} axisLine={false} tickLine={false} />
              <Tooltip content={<AreaTooltip />} />
              <Area type="monotone" dataKey="requests" name="Запросы" stroke="#C4879A" strokeWidth={2.5} fill="url(#gReq)" dot={false} />
              <Area type="monotone" dataKey="matches"  name="Матчи"   stroke="#C9A96E" strokeWidth={2.5} fill="url(#gMat)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-row" style={{ marginBottom: 24 }}>
        <ProgramsChart />
        <TimeHeatmap />
      </div>

      <AIInsights />

      <div className="chart-card" style={{ marginBottom: 24 }}>
        <RecentRequests />
      </div>

      <DwhBadge variant="card" />
    </>
  );
}
