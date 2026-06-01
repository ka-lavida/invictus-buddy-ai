import { TrendingUp, Zap, Lightbulb, AlertTriangle } from 'lucide-react';
import { aiInsights, type InsightType } from '../../data/mockData';

// Icon and class per insight type
const TYPE_CONFIG: Record<InsightType, { icon: typeof TrendingUp; label: string }> = {
  demand:      { icon: TrendingUp,    label: 'Спрос' },
  opportunity: { icon: Zap,           label: 'Возможность' },
  suggestion:  { icon: Lightbulb,     label: 'Идея' },
  warning:     { icon: AlertTriangle, label: 'Внимание' },
};

export function AIInsights() {
  return (
    <div className="insights-section">
      <div className="insights-section__title">
        <span style={{ fontSize: 18 }}>✦</span>
        AI Insights
        <span className="badge badge--rose" style={{ marginLeft: 4 }}>
          {aiInsights.length} сигнала
        </span>
      </div>

      <div className="insights-grid">
        {aiInsights.map((insight) => {
          const { icon: Icon, label } = TYPE_CONFIG[insight.type];
          return (
            <div key={insight.id} className={`insight-card insight-card--${insight.type}`}>
              <div className="insight-card__header">
                <div className="insight-card__icon">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>
                    {label}
                  </div>
                  <div className="insight-card__title">{insight.title}</div>
                </div>
              </div>

              <div className="insight-card__desc">{insight.description}</div>

              <button className="insight-card__action">
                → {insight.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
