import { CLUB_STATS } from '../../../data/girlsData';

function Pill({ value, good }: { value: number; good: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: good ? 'var(--sage-light)' : 'var(--coral-light)',
      color: good ? 'var(--sage)' : 'var(--coral)',
    }}>{value}%</span>
  );
}

export function ClubsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0' }}>
        Данные: mock export · подтверждены структурой DWH (mongo.clubs, mongo.visits)
      </div>

      {CLUB_STATS.map(c => (
        <div key={c.key} className="chart-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{c.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.city}</div>
            </div>
            <span className="badge badge--rose">{c.topProgram}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Активных клиенток', value: c.activeClients },
              { label: 'Ходят на группы',   value: c.groupClients },
              { label: 'Визитов/месяц',     value: c.avgVisitsMonth },
              { label: 'Buddy demand',       value: `${c.buddyDemand}%` },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{m.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Attendance</span>
            <Pill value={c.attendanceRate} good={c.attendanceRate >= 75} />
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Retention 30d</span>
            <Pill value={c.retention30d} good={c.retention30d >= 65} />
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Churn risk</span>
            <Pill value={c.churnRisk} good={c.churnRisk <= 15} />
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>No-show</span>
            <Pill value={c.noShowRate} good={c.noShowRate <= 15} />
          </div>

          <div style={{ background: 'var(--rose-pale)', border: '1px solid var(--rose-light)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 12, color: 'var(--rose-dark)' }}>
            ✦ {c.aiNote}
          </div>
        </div>
      ))}
    </div>
  );
}
