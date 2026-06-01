import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  iconBg:    string; // CSS color for icon background
  iconColor: string; // CSS color for icon fill
  value:     string | number;
  label:     string;
  trend?:    number; // positive = up, negative = down (%)
}

export function MetricCard({ icon: Icon, iconBg, iconColor, value, label, trend }: MetricCardProps) {
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <div className="metric-card">
      <div className="metric-card__top">
        {/* Colored icon container */}
        <div className="metric-card__icon" style={{ background: iconBg }}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className={`metric-card__trend metric-card__trend--${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="metric-card__value">{value}</div>
      <div className="metric-card__label">{label}</div>
    </div>
  );
}
