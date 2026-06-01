import { useState } from 'react';
import { ChevronRight, ChevronLeft, Database } from 'lucide-react';
import { DWH_CLUB_STATS, DWH_CLUB_PROGRAMS, DWH_PEAK_HOURS, DWH_RETENTION, type DwhClubStats } from '../../../data/dwhSnapshot';
import { CAPACITY_STATS } from '../../../data/girlsData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Pct({ value, goodAbove, badBelow }: { value: number; goodAbove?: number; badBelow?: number }) {
  const color = goodAbove !== undefined && value >= goodAbove ? 'var(--sage)'
    : badBelow !== undefined && value < badBelow ? 'var(--coral)'
    : 'var(--gold)';
  return (
    <span style={{ padding:'2px 8px', borderRadius:99, fontSize:12, fontWeight:700,
      background: color === 'var(--sage)' ? 'var(--sage-light)' : color === 'var(--coral)' ? 'var(--coral-light)' : 'var(--gold-light)',
      color }}>
      {value}%
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ flex:1, height:6, background:'var(--surface-2)', borderRadius:99 }}>
      <div style={{ height:'100%', width:`${Math.min((value/max)*100,100)}%`, background:color, borderRadius:99 }} />
    </div>
  );
}

// ─── Peak Hours Chart ─────────────────────────────────────────────────────────
function PeakHoursBar({ clubId }: { clubId: string }) {
  const hours = DWH_PEAK_HOURS[clubId];
  if (!hours) return <div style={{ fontSize:12, color:'var(--text-muted)' }}>нет данных</div>;
  const maxVal = Math.max(...Object.values(hours));
  return (
    <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:40 }}>
      {Array.from({length:15}, (_, i) => i + 7).map(h => {
        const v = hours[h] || 0;
        const pct = maxVal > 0 ? (v / maxVal) * 100 : 0;
        const isPeak = pct >= 70;
        return (
          <div key={h} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{ width:'100%', height:`${Math.max(pct * 0.36, 2)}px`,
              background: isPeak ? 'var(--rose)' : 'var(--border)',
              borderRadius:2, transition:'height 0.4s ease' }} />
            {h % 3 === 0 && <span style={{ fontSize:8, color:'var(--text-muted)' }}>{h}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Club Detail View ─────────────────────────────────────────────────────────
function ClubDetail({ club, onBack }: { club: DwhClubStats; onBack: () => void }) {
  const programs = DWH_CLUB_PROGRAMS.filter(p => p.clubId === club.clubId);
  const retention = DWH_RETENTION.find(r => r.clubId === club.clubId);
  const capacity  = CAPACITY_STATS.find(c => c.club === club.key);

  return (
    <div className="club-detail" style={{ animation:'fadeUp 0.25s ease both' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <button className="wizard-back" onClick={onBack}>
          <ChevronLeft size={16} /> Все клубы
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>{club.label}</div>
          <div style={{ fontSize:13, color:'var(--text-muted)', display:'flex', gap:8, marginTop:2 }}>
            <span>{club.city}</span>
            <span>·</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Database size={11} /> DWH real · {new Date().toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
        <span className="badge badge--sage" style={{ fontSize:11 }}>Последние 30 дней</span>
      </div>

      {/* A. Executive Summary */}
      <div className="metrics-grid" style={{ marginBottom:24 }}>
        {[
          { label:'Активных абонементов', value:club.activeSubscribers.toLocaleString(), color:'var(--rose-dark)', note:'is_active subscribers' },
          { label:'Уник. групповых участников', value:club.uniqueGroupVisitors.toLocaleString(), color:'var(--lavender)', note:'из событий за 30д' },
          { label:'Посещений всего (30д)', value:club.totalVisits30d.toLocaleString(), color:'var(--text)', note:'из mongo.visits' },
          { label:'Fill rate занятий', value:`${club.fillRate}%`, color: club.fillRate >= 60 ? 'var(--sage)' : club.fillRate >= 40 ? 'var(--gold)' : 'var(--coral)', note:'записи / вместимость' },
          { label:'Retention 30d (proxy)', value:`${club.retentionRate30d}%`, color: club.retentionRate30d >= 70 ? 'var(--sage)' : 'var(--gold)', note:'повторные из прошлого периода' },
          { label:'Новые / вернувшиеся', value:`${club.churnProxy30d}%`, color: club.churnProxy30d <= 30 ? 'var(--sage)' : 'var(--coral)', note:'не посещали в пред. период' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div style={{ fontSize:24, fontWeight:800, color:m.color, marginBottom:4 }}>{m.value}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{m.label}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>{m.note}</div>
          </div>
        ))}
      </div>

      {/* B. Group Programs */}
      <div className="chart-card" style={{ marginBottom:20 }}>
        <div className="chart-card__header" style={{ marginBottom:16 }}>
          <div>
            <div className="chart-card__title">Групповые программы</div>
            <div className="chart-card__subtitle">записи и fill rate за 30 дней</div>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border-light)' }}>
                {['Программа','Событий','Записей','Вместимость','Fill rate'].map(h => (
                  <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontSize:11,
                    fontWeight:700, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programs.sort((a,b) => b.bookings - a.bookings).map(p => (
                <tr key={p.program} style={{ borderBottom:'1px solid var(--border-light)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={{ padding:'8px', fontWeight:600, color:'var(--text)' }}>{p.program}</td>
                  <td style={{ padding:'8px', color:'var(--text-2)' }}>{p.events}</td>
                  <td style={{ padding:'8px', fontWeight:700, color:'var(--rose-dark)' }}>{p.bookings.toLocaleString()}</td>
                  <td style={{ padding:'8px', color:'var(--text-2)' }}>{p.capacity.toLocaleString()}</td>
                  <td style={{ padding:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:60, height:5, background:'var(--surface-2)', borderRadius:99 }}>
                        <div style={{ height:'100%', width:`${p.fillRate}%`,
                          background: p.fillRate >= 70 ? 'var(--sage)' : p.fillRate >= 50 ? 'var(--gold)' : 'var(--coral)',
                          borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700,
                        color: p.fillRate >= 70 ? 'var(--sage)' : p.fillRate >= 50 ? 'var(--gold)' : 'var(--coral)' }}>
                        {p.fillRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. Peak Hours */}
      <div className="chart-card" style={{ marginBottom:20 }}>
        <div className="chart-card__title" style={{ marginBottom:16 }}>Загрузка по часам (местное время)</div>
        <PeakHoursBar clubId={club.clubId} />
        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>
          Пиковые часы: {club.peakHoursLocal.map(h => `${h}:00`).join(', ')} — максимум записей на групповые
        </div>
      </div>

      {/* D. Retention */}
      {retention && (
        <div className="chart-card" style={{ marginBottom:20 }}>
          <div className="chart-card__title" style={{ marginBottom:4 }}>Retention (MVP proxy)</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:16 }}>
            ⚠️ {retention.note}
          </div>
          {[
            { label:`Участников группов. занятий (30д)`, value:retention.visitors30d, color:'var(--rose)', max:1500 },
            { label:`Были также в предыдущем периоде`,   value:retention.retained,    color:'var(--sage)', max:1500 },
            { label:`Новые или вернувшиеся`,             value:retention.newOrReturned, color:'var(--gold)', max:1500 },
          ].map(r => (
            <div key={r.label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:'var(--text)' }}>{r.label}</span>
                <span style={{ fontSize:13, fontWeight:700, color:r.color }}>{r.value}</span>
              </div>
              <MiniBar value={r.value} max={r.max} color={r.color} />
            </div>
          ))}
          <div style={{ marginTop:16, padding:'12px 14px', background:'var(--sage-light)',
            borderRadius:'var(--r-sm)', fontSize:12, color:'#3A6858', lineHeight:1.6 }}>
            ✦ Retention rate {club.retentionRate30d}% — доля текущих участников, которые также посещали в предыдущем периоде.
          </div>
        </div>
      )}

      {/* E. Capacity */}
      {capacity && (
        <div className="chart-card" style={{ marginBottom:20 }}>
          <div className="chart-card__title" style={{ marginBottom:16 }}>Capacity</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:12, marginBottom:16 }}>
            {[
              { label:'Площадь',          value: capacity.sqm ? `${capacity.sqm} м²` : 'Ожидает ввода' },
              { label:'Теор. вместимость', value: `${capacity.theoretical} чел.` },
              { label:'Пиковая загрузка',  value: `${capacity.peakLoad}%` },
              { label:'Средняя загрузка',  value: `${capacity.avgLoad}%` },
              { label:'Свободно днём',     value: `${capacity.daytimeFree}%` },
            ].map(m => (
              <div key={m.label} style={{ background:'var(--surface-2)', borderRadius:'var(--r-sm)', padding:'10px 12px' }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--text)' }}>{m.value}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{m.label}</div>
              </div>
            ))}
          </div>
          {capacity.primeOverload && (
            <div style={{ background:'var(--coral-light)', border:'1px solid rgba(224,120,120,0.3)',
              borderRadius:'var(--r-sm)', padding:'10px 14px', fontSize:12, color:'#A04040', marginBottom:10 }}>
              ⚠️ Prime-time перегрузка: вечерние часы работают на пределе. Buddy-группы в дневные часы разгрузят пик.
            </div>
          )}
          <div style={{ background:'var(--rose-pale)', border:'1px solid var(--rose-light)',
            borderRadius:'var(--r-sm)', padding:'10px 14px', fontSize:12, color:'var(--rose-dark)' }}>
            ✦ {capacity.aiNote}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Club Card (in list view) ─────────────────────────────────────────────────
function ClubCard({ club, onClick }: { club: DwhClubStats; onClick: () => void }) {
  const maxFill = 100;
  return (
    <div className="chart-card" style={{ cursor:'pointer', transition:'all var(--t)' }}
         onClick={onClick}
         onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--sh)'; }}
         onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{club.label}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{club.city}</div>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {[
          { label:'Абонементы', value:club.activeSubscribers },
          { label:'Участников групп.', value:club.uniqueGroupVisitors },
        ].map(m => (
          <div key={m.label} style={{ background:'var(--surface-2)', borderRadius:'var(--r-sm)', padding:'8px 10px' }}>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>{m.value.toLocaleString()}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontSize:11, color:'var(--text-2)' }}>Fill rate занятий</span>
          <span style={{ fontSize:12, fontWeight:700, color: club.fillRate >= 60 ? 'var(--sage)' : club.fillRate >= 40 ? 'var(--gold)' : 'var(--coral)' }}>
            {club.fillRate}%
          </span>
        </div>
        <MiniBar value={club.fillRate} max={maxFill} color={club.fillRate >= 60 ? 'var(--sage)' : club.fillRate >= 40 ? 'var(--gold)' : 'var(--coral)'} />
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        <Pct value={club.retentionRate30d} goodAbove={70} badBelow={60} />
        <span style={{ fontSize:10, color:'var(--text-muted)', alignSelf:'center' }}>retention 30d</span>
        <Pct value={Math.round(club.churnProxy30d)} badBelow={25} goodAbove={40} />
        <span style={{ fontSize:10, color:'var(--text-muted)', alignSelf:'center' }}>новые/вернувш.</span>
      </div>

      <div style={{ fontSize:11, color:'var(--text-muted)' }}>
        Топ: {club.topPrograms.slice(0,2).join(', ')}
      </div>
    </div>
  );
}

// ─── ClubsTab ─────────────────────────────────────────────────────────────────
export function ClubsTab() {
  const [selectedClub, setSelectedClub] = useState<DwhClubStats | null>(null);

  if (selectedClub) {
    return <ClubDetail club={selectedClub} onBack={() => setSelectedClub(null)} />;
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
        background:'var(--sage-light)', border:'1px solid rgba(123,174,158,0.3)',
        borderRadius:'var(--r-sm)', fontSize:12, color:'#3A6858' }}>
        <Database size={13} />
        <span>Данные из DWH (mongo.events, mongo.usersubscriptions, mongo.visits) · снимок 2026-06-01 · buddy demand — local only</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {DWH_CLUB_STATS.map(club => (
          <ClubCard key={club.clubId} club={club} onClick={() => setSelectedClub(club)} />
        ))}
      </div>
    </div>
  );
}
