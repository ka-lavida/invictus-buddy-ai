import { useState, useMemo } from 'react';
import { Database } from 'lucide-react';
import { DWH_RETENTION, DWH_CLUB_STATS } from '../../../data/dwhSnapshot';

type ClubFilter = 'all' | string;

export function RetentionTab() {
  const [clubFilter, setClubFilter] = useState<ClubFilter>('all');

  const clubs = DWH_CLUB_STATS;

  const filtered = useMemo(() =>
    clubFilter === 'all' ? DWH_RETENTION : DWH_RETENTION.filter(r => r.clubName === clubFilter),
    [clubFilter]);

  // Network totals
  const total30d    = DWH_RETENTION.reduce((s, r) => s + r.visitors30d,   0);
  const totalRetained = DWH_RETENTION.reduce((s, r) => s + r.retained,    0);
  const totalNew    = DWH_RETENTION.reduce((s, r) => s + r.newOrReturned, 0);
  const netRetRate  = Math.round((totalRetained / total30d) * 100);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Source banner */}
      <div className="dwh-badge">
        <Database size={11} />
        <span>
          Retention proxy via DWH (mongo.events.participants) · 30д vs предыдущие 30д ·
          % текущих участников, посещавших в предыдущем периоде
        </span>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:12, color:'var(--text-muted)', alignSelf:'center' }}>Клуб:</span>
        {['all', ...clubs.map(c => c.key)].map(k => (
          <button key={k}
            onClick={() => setClubFilter(k)}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--r-full)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              background: clubFilter === k ? 'var(--ig-black)' : 'var(--surface)',
              color: clubFilter === k ? '#fff' : 'var(--ig-muted)',
              border: clubFilter === k ? 'none' : '1px solid var(--ig-border)',
              transition: 'all var(--t)',
            }}>
            {k === 'all' ? 'Все клубы' : k}
          </button>
        ))}
      </div>

      {/* Network summary (only when all clubs shown) */}
      {clubFilter === 'all' && (
        <div className="metrics-grid">
          {[
            { label:'Участников (30д)', value:total30d.toLocaleString(), color:'var(--rose-dark)', note:'уникальных в событиях' },
            { label:'Были в пред. периоде', value:totalRetained.toLocaleString(), color:'var(--sage)', note:'retained посетители' },
            { label:'Новые / вернувшиеся', value:totalNew.toLocaleString(), color:'var(--gold)', note:'не были в прошлом периоде' },
            { label:'Retention rate (сеть)', value:`${netRetRate}%`, color: netRetRate >= 70 ? 'var(--sage)' : 'var(--gold)', note:'% повторных от всех' },
          ].map(m => (
            <div key={m.label} className="metric-card">
              <div style={{ fontSize:24, fontWeight:800, color:m.color }}>{m.value}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginTop:4 }}>{m.label}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>{m.note}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per-club bars */}
      <div className="chart-card" style={{ padding:24 }}>
        <div className="chart-card__title" style={{ marginBottom:4 }}>
          Retention 30d по клубам
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:20 }}>
          ⚠️ MVP proxy: % участников текущего периода, которые также посещали групповые занятия в предыдущем 30-дневном периоде.
          Точный cohort-retention требует дополнительной аналитики по первым визитам.
        </div>

        {filtered.map(r => (
          <div key={r.clubId} style={{ marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--border-light)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{r.clubName}</span>
              <span style={{ fontSize:16, fontWeight:800,
                color: r.retentionRate >= 70 ? 'var(--sage)' : r.retentionRate >= 60 ? 'var(--gold)' : 'var(--coral)' }}>
                {r.retentionRate}%
              </span>
            </div>

            {[
              { label:`Участников 30д: ${r.visitors30d.toLocaleString()}`,  value:r.visitors30d,   max:1500, color:'var(--ig-black)' },
              { label:`Retained: ${r.retained.toLocaleString()}`,           value:r.retained,      max:1500, color:'var(--ig-success)' },
              { label:`Новые/вернувш.: ${r.newOrReturned.toLocaleString()}`,value:r.newOrReturned, max:1500, color:'var(--ig-blue)' },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:11, color:'var(--text-2)' }}>{bar.label}</span>
                </div>
                <div style={{ height:7, background:'var(--surface-2)', borderRadius:99 }}>
                  <div style={{ height:'100%', width:`${Math.min((bar.value/bar.max)*100, 100)}%`,
                    background:bar.color, borderRadius:99, transition:'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Buddy vs no-buddy comparison (local data, clearly labeled) */}
      <div className="chart-card" style={{ padding:24 }}>
        <div className="chart-card__title" style={{ marginBottom:4 }}>С buddy vs без buddy — 30-day retention</div>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:16 }}>
          ⚠️ Источник: локальные buddy-данные (mock/export) — не из DWH
        </div>
        {[
          { label:'С buddy (нашли пару или группу)', value:78, color:'var(--ig-success)' },
          { label:'Без buddy',                        value:48, color:'var(--ig-muted)' },
          { label:'Benchmark сети (DWH proxy avg)',   value:Math.round(DWH_RETENTION.reduce((s,r) => s + r.retentionRate, 0) / DWH_RETENTION.length), color:'var(--ig-blue)' },
        ].map(b => (
          <div key={b.label} style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:13, color:'var(--text)' }}>{b.label}</span>
              <span style={{ fontSize:14, fontWeight:700, color:b.color }}>{b.value}%</span>
            </div>
            <div style={{ height:8, background:'var(--surface-2)', borderRadius:99 }}>
              <div style={{ height:'100%', width:`${b.value}%`, background:b.color, borderRadius:99, transition:'width 0.6s ease' }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--ig-blue-pale)',
          borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--ig-blue-dark)', lineHeight: 1.6 }}>
          ✦ Клиентки с buddy-механикой возвращаются значительно чаще.
          Средний retention по сети (DWH proxy): <strong>{Math.round(DWH_RETENTION.reduce((s,r) => s + r.retentionRate, 0) / DWH_RETENTION.length)}%</strong>.
          Buddy-effect даёт прирост ~<strong>+8–10 пп</strong>.
        </div>
      </div>

      {/* AI insights */}
      <div className="chart-card" style={{ padding:24 }}>
        <div className="chart-card__title" style={{ marginBottom:16 }}>AI-инсайты по retention</div>
        {[
          { club:'Karaganda', rate:56.9, issue:'Ниже всех по сети', action:'Запустить buddy intro flow + push after first visit. Много уникальных новых (43%).' },
          { club:'Sfera',     rate:65.9, issue:'Средний retention', action:'Buddy-механика для новичков + мини-группы для Yoga (fill rate 18.1% — пустой зал).' },
          { club:'Crystal',   rate:70.7, issue:'Лучший в сети',     action:'Масштабировать успешные форматы Bootcamp + Glute Lab на другие клубы.' },
        ].map(i => (
          <div key={i.club} style={{ display:'flex', gap:12, padding:'12px 0',
            borderBottom:'1px solid var(--border-light)' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--rose-dark)', minWidth:80 }}>{i.club}</span>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', minWidth:60 }}>{i.rate}%</span>
            <div>
              <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:2 }}>{i.issue}</div>
              <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.5 }}>→ {i.action}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
