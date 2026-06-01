import { CAPACITY_STATS } from '../../../data/girlsData';

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

export function CapacityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{
        background: 'var(--gold-light)', border: '1px solid rgba(201,169,110,0.35)',
        borderRadius: 'var(--r-sm)', padding: '12px 16px',
        fontSize: 13, color: '#7A5F2A', display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <span>Площадь и capacity можно обновить после ввода фактических квадратных метров. Пока используются расчётные данные.</span>
      </div>

      {CAPACITY_STATS.map(c => {
        const peakColor  = c.peakLoad  >= 85 ? 'var(--coral)' : c.peakLoad  >= 70 ? 'var(--gold)' : 'var(--sage)';
        const avgColor   = c.avgLoad   >= 70 ? 'var(--gold)' : 'var(--sage)';
        const freeColor  = c.daytimeFree >= 40 ? 'var(--sage)' : 'var(--gold)';

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
                <span className="badge badge--gold" style={{ fontSize: 11 }}>
                  Capacity: {c.theoretical} чел.
                </span>
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
    </div>
  );
}
