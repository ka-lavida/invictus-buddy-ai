import { useState, useMemo } from 'react';
import { Database } from 'lucide-react';
import { DWH_RETENTION, DWH_CLUB_STATS } from '../../../data/dwhSnapshot';
import { CAPACITY_STATS } from '../../../data/girlsData';
import { RecommendationsList } from '../RecommendationsList';

type ClubFilter = 'all' | string;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ig-rose)',
      paddingBottom: 8, borderBottom: '1px solid var(--border-light)', marginTop: 8,
    }}>
      {children}
    </div>
  );
}

function LoadBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

export function GroupAnalyticsTab() {
  const [clubFilter, setClubFilter] = useState<ClubFilter>('all');
  const clubs = DWH_CLUB_STATS;

  const filtered = useMemo(() =>
    clubFilter === 'all' ? DWH_RETENTION : DWH_RETENTION.filter(r => r.clubName === clubFilter),
    [clubFilter]);

  const total30d      = DWH_RETENTION.reduce((s, r) => s + r.visitors30d,   0);
  const totalRetained = DWH_RETENTION.reduce((s, r) => s + r.retained,      0);
  const totalNew      = DWH_RETENTION.reduce((s, r) => s + r.newOrReturned, 0);
  const netRetRate    = Math.round((totalRetained / total30d) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Source banner */}
      <div className="dwh-badge">
        <Database size={11} />
        <span>
          Retention proxy via DWH (mongo.events.participants) · 30д vs предыдущие 30д ·
          % текущих участников, посещавших в предыдущем периоде
        </span>
      </div>

      {/* ── Retention ─────────────────────────────────────────── */}
      <SectionLabel>Retention по сети</SectionLabel>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Клуб:</span>
        {['all', ...clubs.map(c => c.key)].map(k => (
          <button key={k}
            onClick={() => setClubFilter(k)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--r-full)', fontFamily: 'var(--font-mono)',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer',
              background: clubFilter === k ? 'var(--ig-black)' : 'var(--surface)',
              color: clubFilter === k ? '#fff' : 'var(--ig-muted)',
              border: clubFilter === k ? 'none' : '1px solid var(--ig-border)',
              transition: 'all var(--t)',
            }}>
            {k === 'all' ? 'Все клубы' : k}
          </button>
        ))}
      </div>

      {/* Network summary */}
      {clubFilter === 'all' && (
        <div className="metrics-grid">
          {[
            { label: 'Участников (30д)',     value: total30d      >= 1000 ? `${(total30d/1000).toFixed(1)}k`      : total30d,      color: 'var(--ig-black)',   note: 'уникальных в событиях' },
            { label: 'Были в пред. периоде', value: totalRetained >= 1000 ? `${(totalRetained/1000).toFixed(1)}k` : totalRetained, color: 'var(--ig-success)', note: 'retained посетители' },
            { label: 'Новые / вернувшиеся',  value: totalNew      >= 1000 ? `${(totalNew/1000).toFixed(1)}k`      : totalNew,      color: 'var(--ig-blue)',    note: 'не были в прошлом периоде' },
            { label: 'Retention rate (сеть)', value: `${netRetRate}%`, color: netRetRate >= 70 ? 'var(--ig-success)' : 'var(--ig-warning)', note: '% повторных от всех' },
          ].map(m => (
            <div key={m.label} className="metric-card">
              <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 2, letterSpacing: '-0.02em' }}>{m.value}</div>
              <div className="metric-card__label">{m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ig-muted)', marginTop: 4, letterSpacing: '0.04em' }}>{m.note}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per-club retention bars */}
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 4 }}>Retention 30d по клубам</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
          ⚠️ MVP proxy: % участников текущего периода, которые также посещали групповые занятия в предыдущем 30-дневном периоде.
          Точный cohort-retention требует дополнительной аналитики по первым визитам.
        </div>

        {filtered.map(r => (
          <div key={r.clubId} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{r.clubName}</span>
              <span style={{ fontSize: 16, fontWeight: 800,
                color: r.retentionRate >= 70 ? 'var(--sage)' : r.retentionRate >= 60 ? 'var(--gold)' : 'var(--coral)' }}>
                {r.retentionRate}%
              </span>
            </div>

            {[
              { label: `Участников 30д: ${r.visitors30d.toLocaleString()}`,   value: r.visitors30d,   max: 1500, color: 'var(--ig-black)' },
              { label: `Retained: ${r.retained.toLocaleString()}`,            value: r.retained,      max: 1500, color: 'var(--ig-success)' },
              { label: `Новые/вернувш.: ${r.newOrReturned.toLocaleString()}`, value: r.newOrReturned, max: 1500, color: 'var(--ig-blue)' },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{bar.label}</span>
                </div>
                <div style={{ height: 7, background: 'var(--surface-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${Math.min((bar.value/bar.max)*100, 100)}%`, background: bar.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Retention AI insights */}
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 16 }}>AI-инсайты по retention</div>
        {[
          { club: 'Karaganda', rate: 56.9, issue: 'Ниже всех по сети', action: 'Запустить buddy intro flow + push after first visit. Много уникальных новых (43%).' },
          { club: 'Sfera',     rate: 65.9, issue: 'Средний retention', action: 'Buddy-механика для новичков + мини-группы для Yoga (fill rate 18.1% — пустой зал).' },
          { club: 'Crystal',   rate: 70.7, issue: 'Лучший в сети',     action: 'Масштабировать успешные форматы Bootcamp + Glute Lab на другие клубы.' },
        ].map(i => (
          <div key={i.club} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose-dark)', minWidth: 80 }}>{i.club}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', minWidth: 60 }}>{i.rate}%</span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 2 }}>{i.issue}</div>
              <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>→ {i.action}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Capacity ──────────────────────────────────────────── */}
      <SectionLabel>Загрузка залов</SectionLabel>

      <div style={{
        background: 'var(--gold-light)', border: '1px solid rgba(201,169,110,0.35)',
        borderRadius: 'var(--r-sm)', padding: '12px 16px',
        fontSize: 13, color: '#7A5F2A', display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <span>Площадь и capacity можно обновить после ввода фактических квадратных метров. Пока используются расчётные данные.</span>
      </div>

      {CAPACITY_STATS.map(c => {
        const peakColor = c.peakLoad   >= 85 ? 'var(--coral)' : c.peakLoad >= 70 ? 'var(--gold)' : 'var(--sage)';
        const avgColor  = c.avgLoad    >= 70 ? 'var(--gold)'  : 'var(--sage)';
        const freeColor = c.daytimeFree >= 40 ? 'var(--sage)' : 'var(--gold)';

        return (
          <div key={c.club} className="chart-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{c.club}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.city}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {c.primeOverload && (
                  <span className="badge badge--coral" style={{ fontSize: 11 }}>Prime-time перегрузка</span>
                )}
                <span className="badge badge--gold" style={{ fontSize: 11 }}>Capacity: {c.theoretical} чел.</span>
                {c.sqm ? (
                  <span className="badge badge--sage" style={{ fontSize: 11 }}>{c.sqm} м²</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 11 }}>sqm TBD</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Пиковая загрузка</span>
                </div>
                <LoadBar value={c.peakLoad} color={peakColor} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Средняя загрузка</span>
                </div>
                <LoadBar value={c.avgLoad} color={avgColor} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Свободно днём</span>
                </div>
                <LoadBar value={c.daytimeFree} color={freeColor} />
              </div>
            </div>

            <div style={{ background: 'var(--rose-pale)', border: '1px solid var(--rose-light)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 12, color: 'var(--rose-dark)' }}>
              ✦ {c.aiNote}
            </div>
          </div>
        );
      })}

      {/* ── Recommendations (group) ───────────────────────────── */}
      <SectionLabel>Рекомендации — группы и залы</SectionLabel>
      <RecommendationsList category="group" />
    </div>
  );
}
