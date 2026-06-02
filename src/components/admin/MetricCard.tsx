import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon:      LucideIcon;
  iconBg:    string;
  iconColor: string;
  value:     string | number;
  label:     string;
  trend?:    number; // positive = up, negative = down (%)
  note?:     string;
}

export function MetricCard({ icon: Icon, iconBg, iconColor, value, label, trend, note }: MetricCardProps) {
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <div className="metric-card">
      <div className="metric-card__top">
        <div className="metric-card__icon" style={{ background: iconBg }}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: trendUp ? 'var(--ig-success)' : 'var(--ig-danger)',
          }}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="metric-card__label">{label}</div>

      <div className="metric-card__value">{value}</div>

      {note && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--ig-muted)',
          marginTop: 2,
          letterSpacing: '0.04em',
        }}>
          {note}
        </div>
      )}
    </div>
  );
}
