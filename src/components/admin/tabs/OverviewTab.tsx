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
    <div style={{
      background: '#fff',
      border: '1px solid var(--ig-border)',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: 'var(--sh)',
      fontSize: 12,
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--ig-black)' }}>{label}</div>
      {payload.map((e: any) => (
        <div key={e.name} style={{ color: e.color, display: 'flex', gap: 8, marginBottom: 2 }}>
          <span>{e.name}:</span>
          <span style={{ fontWeight: 600 }}>{e.value}</span>
        </div>
      ))}
    </div>
  );
};

export function OverviewTab() {
  return (
    <>
      {/* KPI Row */}
      <div className="metrics-grid">
        <MetricCard
          icon={Users}
          iconBg="var(--ig-blue-pale)"
          iconColor="var(--ig-blue-dark)"
          value={adminMetrics.totalRequests}
          label="Запросов на buddy"
          trend={12}
        />
        <MetricCard
          icon={Heart}
          iconBg="var(--ig-fog)"
          iconColor="var(--ig-graphite2)"
          value={adminMetrics.matchesFound}
          label="Матчей найдено"
          trend={9}
        />
        <MetricCard
          icon={Calendar}
          iconBg="var(--gold-light)"
          iconColor="var(--ig-warning)"
          value={adminMetrics.bookedTogether}
          label="Записались вместе"
          trend={18}
        />
        <MetricCard
          icon={CheckCircle}
          iconBg="var(--sage-light)"
          iconColor="var(--ig-success)"
          value={adminMetrics.attended}
          label="Пришли на тренировку"
          trend={5}
        />
        <MetricCard
          icon={TrendingUp}
          iconBg="var(--ig-fog)"
          iconColor="var(--ig-muted)"
          value={`${adminMetrics.conversionRate}%`}
          label="Конверсия в посещение"
          trend={-2}
        />
      </div>

      {/* Weekly trend */}
      <div className="charts-row" style={{ marginBottom: 24 }}>
        <div className="chart-card chart-card--full">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Недельный тренд</div>
              <div style={{ fontSize: 11, color: 'var(--ig-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginTop: 2 }}>
                запросы и матчи по дням
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 2, background: 'var(--ig-black)', borderRadius: 2 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ig-muted)', letterSpacing: '0.06em' }}>Запросы</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 2, background: 'var(--ig-blue)', borderRadius: 2 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ig-muted)', letterSpacing: '0.06em' }}>Матчи</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 8px 16px' }}>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weeklyTrend} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#050505" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#050505" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gMat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4B5269" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4B5269" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--ig-fog)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--ig-muted)', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--ig-muted)', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<AreaTooltip />} />
                <Area type="monotone" dataKey="requests" name="Запросы" stroke="#050505" strokeWidth={2} fill="url(#gReq)" dot={false} />
                <Area type="monotone" dataKey="matches"  name="Матчи"   stroke="#4B5269" strokeWidth={2} fill="url(#gMat)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
