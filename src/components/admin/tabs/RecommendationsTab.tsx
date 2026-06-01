import { RECOMMENDATIONS } from '../../../data/girlsData';

const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: 'var(--coral-light)',    color: 'var(--coral)',    label: 'Высокий' },
  medium: { bg: 'var(--gold-light)',     color: '#8B6930',         label: 'Средний' },
  low:    { bg: 'var(--sage-light)',     color: 'var(--sage)',     label: 'Низкий'  },
};

export function RecommendationsTab() {
  const grouped = {
    high:   RECOMMENDATIONS.filter(r => r.priority === 'high'),
    medium: RECOMMENDATIONS.filter(r => r.priority === 'medium'),
    low:    RECOMMENDATIONS.filter(r => r.priority === 'low'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {(['high', 'medium', 'low'] as const).map(priority => {
        const items = grouped[priority];
        if (!items.length) return null;
        const style = PRIORITY_STYLE[priority];

        return (
          <div key={priority}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                background: style.bg, color: style.color,
              }}>
                {style.label} приоритет
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{items.length} рекомендации</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(rec => (
                <div
                  key={rec.id}
                  className="chart-card"
                  style={{ padding: 20, borderLeft: `4px solid ${style.color}` }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>
                    {rec.problem}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Причина</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{rec.cause}</div>
                    </div>
                    <div style={{ background: 'var(--rose-pale)', borderRadius: 'var(--r-sm)', padding: '10px 12px', border: '1px solid var(--rose-light)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rose-dark)', marginBottom: 4 }}>Действие</div>
                      <div style={{ fontSize: 13, color: 'var(--rose-dark)', fontWeight: 500 }}>{rec.action}</div>
                    </div>
                    <div style={{ background: 'var(--sage-light)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 4 }}>Эффект</div>
                      <div style={{ fontSize: 13, color: '#3A6858' }}>{rec.effect}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ответственный:</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: 'var(--lavender-light)', color: 'var(--lavender)',
                    }}>{rec.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
