import { PROGRAM_STATS } from '../../../data/girlsData';

export function GroupProgramsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Данные: mock export · структура готова к замене на DWH (mongo.events + mongo.grouptrainings)
      </div>

      {PROGRAM_STATS.map(p => (
        <div key={p.name} className="chart-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {p.trend > 0
                ? <span className="badge badge--sage">↑ +{p.trend}%</span>
                : <span className="badge badge--coral">↓ {p.trend}%</span>}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.topSlot}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Записей',      value: p.bookings,                      color: 'var(--rose)' },
              { label: 'Пришли',       value: p.attended,                      color: 'var(--sage)' },
              { label: 'Attendance',   value: `${p.attendanceRate}%`,           color: p.attendanceRate >= 75 ? 'var(--sage)' : 'var(--coral)' },
              { label: 'Repeat rate',  value: `${p.repeatRate}%`,              color: 'var(--gold)' },
              { label: 'No-show',      value: `${p.noShowRate}%`,              color: p.noShowRate <= 15 ? 'var(--sage)' : 'var(--coral)' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 10, padding: '10px 8px' }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
            Лучший клуб: <strong>{p.bestClub}</strong>
          </div>

          <div style={{ background: 'var(--rose-pale)', border: '1px solid var(--rose-light)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--rose-dark)' }}>
            ✦ {p.aiNote}
          </div>
        </div>
      ))}
    </div>
  );
}
