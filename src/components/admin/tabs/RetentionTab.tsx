import { RETENTION_STATS } from '../../../data/girlsData';

export function RetentionTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="metrics-grid">
        {RETENTION_STATS.map(r => (
          <div key={r.label} className="metric-card">
            <div className="metric-card__top">
              <div />
              {r.trend !== 0 && (
                <div className={`metric-card__trend metric-card__trend--${r.trend > 0 ? 'up' : 'down'}`}>
                  {r.trend > 0 ? '↑' : '↓'} {Math.abs(r.trend)}%
                </div>
              )}
            </div>
            <div className="metric-card__value">{r.value}{r.unit}</div>
            <div className="metric-card__label">{r.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>{r.description}</div>
          </div>
        ))}
      </div>

      {/* Buddy vs no-buddy comparison */}
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 20 }}>С buddy vs без buddy — 30-day retention</div>
        {[
          { label: 'С buddy (нашли пару или группу)', value: 78, color: 'var(--sage)' },
          { label: 'Без buddy',                        value: 48, color: 'var(--rose)' },
          { label: 'Benchmark сети',                   value: 61, color: 'var(--gold)' },
        ].map(b => (
          <div key={b.label} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{b.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: b.color }}>{b.value}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--sage-light)', borderRadius: 10, fontSize: 13, color: '#3A6858', lineHeight: 1.6 }}>
          ✦ Клиентки, которые нашли пару или мини-группу, чаще возвращаются на второе занятие: retention выше на <strong>30 пп</strong>. Buddy-механика — ключевой retention-драйвер.
        </div>
      </div>

      {/* Cohort insight */}
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 16 }}>Когортные инсайты</div>
        {[
          { cohort: 'Новички (1–2 визита)',           retention7: 64, retention30: 31, risk: 'high',   action: 'Buddy intro flow в первые 48 ч' },
          { cohort: 'Пробный доступ',                 retention7: 71, retention30: 38, risk: 'high',   action: 'Buddy match + оффер продления' },
          { cohort: 'Давно не была (90+ дней)',       retention7: 44, retention30: 22, risk: 'critical',action: 'Reactivation email + «мы нашли пару»' },
          { cohort: 'Регулярные (5+ визитов/мес)',    retention7: 91, retention30: 82, risk: 'low',    action: 'Buddy ambassador программа' },
        ].map(r => (
          <div key={r.cohort} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{r.cohort}</span>
            <span style={{ fontSize: 12 }}>7d: <strong>{r.retention7}%</strong></span>
            <span style={{ fontSize: 12 }}>30d: <strong>{r.retention30}%</strong></span>
            <span className={`badge badge--${r.risk === 'critical' ? 'coral' : r.risk === 'high' ? 'rose' : 'sage'}`} style={{ fontSize: 10 }}>
              {r.risk}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
