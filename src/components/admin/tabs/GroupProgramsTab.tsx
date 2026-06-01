import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { DWH_NETWORK_PROGRAMS } from '../../../data/dwhSnapshot';

type SortKey = 'bookings' | 'fillRate' | 'clubsActive' | 'totalEvents';
type SortDir = 'asc' | 'desc';

const AI_NOTES: Record<string, string> = {
  'INVICTUS BOOTCAMP':    'Лидер сети — присутствует во всех 6 клубах. Fill rate 65.6%. Buddy-пары увеличивают return rate.',
  'INVICTUS GLUTE LAB':  'Высокий fill rate 78.8%, только в 3 клубах. Расширить на Orynbor и Kunaeva.',
  'Skinny bitches':      'Уникальная программа с fill rate 68.5%. Нет во всех клубах — потенциал роста.',
  'Pilates mat':         'Стабильная доходимость. Внедрить buddy intro flow для новичков.',
  'Stretching':          'Популярна везде, fill rate 52.4%. Суббота 11:00 — лучший buddy-слот (конверсия 84%).',
  'Pilates Reformers':   'Только Karaganda, fill rate 80.5%. Уникальное предложение — изучить тиражирование.',
  'Aerostretching':      'Fill rate 82.4% — перегруженная программа, добавить слоты.',
  'Yoga':                'Fill rate 44.3% — ниже среднего. Push за 2ч + buddy mini-group для роста доходимости.',
  'INVICTUS DANCE':      'Очень низкий fill rate 17.1%. Пересмотреть расписание или формат.',
  'High Heels':          'Fill rate 30.1% — низкий, только в 5 клубах. Возможно, нишевая аудитория.',
  'INVICTUS KICK':       'Fill rate 30.2% — требует внимания. Перенести на более востребованные часы.',
  'Yoga FOR HER':        'Fill rate 22.9% — очень низкий. Объединить с Yoga или пересмотреть слоты.',
};

function getNote(program: string): string {
  return AI_NOTES[program] || `Fill rate ${DWH_NETWORK_PROGRAMS.find(p => p.program === program)?.fillRate ?? '?'}%. Мониторинг динамики.`;
}

export function GroupProgramsTab() {
  const [search,   setSearch]   = useState('');
  const [sortKey,  setSortKey]  = useState<SortKey>('bookings');
  const [sortDir,  setSortDir]  = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    let list = DWH_NETWORK_PROGRAMS.filter(p => {
      if (!p.program) return false;
      if (search && !p.program.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const aVal = a[sortKey] as number;
      const bVal = b[sortKey] as number;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)
      : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* DWH source */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
        background:'var(--sage-light)', border:'1px solid rgba(123,174,158,0.3)',
        borderRadius:'var(--r-sm)', fontSize:12, color:'#3A6858' }}>
        <Database size={13} />
        <span>Все программы Girls-клубов · DWH (mongo.events + mongo.grouptrainings) · 60 дней · {DWH_NETWORK_PROGRAMS.length} программ</span>
      </div>

      {/* Search + Sort controls */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по программе…"
            style={{ width:'100%', paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8,
              border:'1px solid var(--border)', borderRadius:'var(--r-full)',
              fontSize:13, outline:'none', background:'var(--surface)', color:'var(--text)' }}
          />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {(['bookings','fillRate','clubsActive','totalEvents'] as SortKey[]).map(k => (
            <button key={k} onClick={() => handleSort(k)}
              style={{ padding:'6px 12px', borderRadius:'var(--r-full)', fontSize:12, fontWeight:600,
                background: sortKey === k ? 'var(--rose)' : 'var(--surface)',
                color: sortKey === k ? '#fff' : 'var(--text-2)',
                border: sortKey === k ? 'none' : '1px solid var(--border)',
                display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}>
              {{ bookings:'Записей', fillRate:'Fill rate', clubsActive:'Клубов', totalEvents:'Событий' }[k]}
              <SortIcon k={k} />
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ fontSize:12, color:'var(--text-muted)' }}>
        Показано: {sorted.length} из {DWH_NETWORK_PROGRAMS.length} программ
      </div>

      {/* Table */}
      <div className="chart-card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border-light)' }}>
                {[
                  { label:'Программа', key:null },
                  { label:'Событий',   key:'totalEvents' as SortKey },
                  { label:'Записей',   key:'bookings' as SortKey },
                  { label:'Fill rate', key:'fillRate' as SortKey },
                  { label:'Клубов',    key:'clubsActive' as SortKey },
                  { label:'',          key:null },
                ].map(h => (
                  <th key={h.label}
                    onClick={() => h.key && handleSort(h.key)}
                    style={{ padding:'10px 12px', textAlign:'left', fontSize:11, fontWeight:700,
                      color:'var(--text-muted)', whiteSpace:'nowrap',
                      cursor: h.key ? 'pointer' : 'default',
                      userSelect:'none' }}>
                    {h.label} {h.key && <SortIcon k={h.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => {
                const isExp = expanded === p.program;
                const fr = p.fillRate;
                const frColor = fr >= 70 ? 'var(--sage)' : fr >= 50 ? 'var(--gold)' : 'var(--coral)';
                return [
                  <tr key={p.program}
                    style={{ borderBottom:'1px solid var(--border-light)', cursor:'pointer' }}
                    onClick={() => setExpanded(isExp ? null : p.program)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding:'10px 12px', fontWeight:700, color:'var(--text)' }}>
                      {p.program}
                    </td>
                    <td style={{ padding:'10px 12px', color:'var(--text-2)' }}>{p.totalEvents}</td>
                    <td style={{ padding:'10px 12px', fontWeight:700, color:'var(--rose-dark)' }}>
                      {p.bookings.toLocaleString()}
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:50, height:5, background:'var(--surface-2)', borderRadius:99 }}>
                          <div style={{ height:'100%', width:`${Math.min(fr,100)}%`, background:frColor, borderRadius:99 }} />
                        </div>
                        <span style={{ fontWeight:700, color:frColor, fontSize:12 }}>{fr}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ background:'var(--lavender-light)', color:'var(--lavender)',
                        padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700 }}>
                        {p.clubsActive} кл.
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>
                      {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                  </tr>,
                  isExp && (
                    <tr key={`${p.program}-detail`}>
                      <td colSpan={6} style={{ padding:'0 12px 12px', background:'var(--rose-pale)' }}>
                        <div style={{ padding:'12px 16px', borderRadius:'var(--r-sm)',
                          display:'flex', gap:24, flexWrap:'wrap', fontSize:12 }}>
                          <div>
                            <div style={{ color:'var(--text-muted)', marginBottom:2 }}>Вместимость</div>
                            <strong>{p.capacity.toLocaleString()}</strong>
                          </div>
                          <div>
                            <div style={{ color:'var(--text-muted)', marginBottom:2 }}>Свободных мест всего</div>
                            <strong>{(p.capacity - p.bookings).toLocaleString()}</strong>
                          </div>
                          <div style={{ flex:1, minWidth:200 }}>
                            <div style={{ color:'var(--text-muted)', marginBottom:4 }}>AI-рекомендация</div>
                            <div style={{ color:'var(--rose-dark)', fontWeight:500, lineHeight:1.5 }}>
                              ✦ {getNote(p.program)}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ].filter(Boolean);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
