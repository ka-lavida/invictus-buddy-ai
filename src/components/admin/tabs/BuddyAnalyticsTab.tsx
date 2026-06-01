import { BUDDY_FUNNEL } from '../../../data/girlsData';

const MAX = BUDDY_FUNNEL[0].count;

export function BuddyAnalyticsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Funnel */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Buddy Funnel</div>
            <div className="chart-card__subtitle">от показа блока до посещения тренировки</div>
          </div>
        </div>

        <div className="funnel-list">
          {BUDDY_FUNNEL.map((s, i) => {
            const prev = i > 0 ? BUDDY_FUNNEL[i - 1].pct : 100;
            const drop = i > 0 ? Math.round(prev - s.pct) : 0;
            return (
              <div key={s.stage} className="funnel-row">
                <div className="funnel-row__label">
                  <span className="funnel-row__step">{i + 1}</span>
                  <span className="funnel-row__name">{s.stage}</span>
                  {drop > 0 && <span className="funnel-row__drop">−{drop}%</span>}
                </div>
                <div className="funnel-row__bar-wrap">
                  <div className="funnel-row__bar" style={{ width: `${(s.count / MAX) * 100}%` }} />
                </div>
                <div className="funnel-row__numbers">
                  <span className="funnel-row__count">{s.count.toLocaleString()}</span>
                  <span className="funnel-row__pct">{s.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key metrics */}
      <div className="metrics-grid">
        {[
          { label: 'Match rate',             value: '76.5%', sub: 'из начавших получили матч', color: 'var(--sage)' },
          { label: 'No-match rate',          value: '23.5%', sub: 'без подходящего совпадения', color: 'var(--coral)' },
          { label: 'Wizard completion',      value: '51.3%', sub: 'завершили все 8 шагов', color: 'var(--gold)' },
          { label: 'Request creation rate',  value: '18.4%', sub: 'создали запрос при no-match', color: 'var(--lavender)' },
          { label: 'Join rate',              value: '70.9%', sub: 'из матчей присоединились', color: 'var(--rose)' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-card__value" style={{ color: m.color, fontSize: 26 }}>{m.value}</div>
            <div className="metric-card__label" style={{ fontWeight: 700 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Drop-off insight */}
      <div className="chart-card">
        <div className="chart-card__title" style={{ marginBottom: 16 }}>Drop-off инсайты</div>
        {[
          { step: 'Увидели → Нажали (33%)', insight: 'Низкий CTR. A/B тест заголовка и CTA кнопки. Попробовать "Найди свою группу".' },
          { step: 'Начали → Завершили (51%)', insight: 'Drop-off на шаге "На что хочешь пойти?" — слишком много вариантов. Сократить до 5 программ + "Не знаю".' },
          { step: 'Матч → Пришли (73%)', insight: 'Хорошая конверсия, но можно улучшить: push за 2 ч до тренировки с именем buddy.' },
        ].map(d => (
          <div key={d.step} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose-dark)', minWidth: 160, flexShrink: 0 }}>{d.step}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{d.insight}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
