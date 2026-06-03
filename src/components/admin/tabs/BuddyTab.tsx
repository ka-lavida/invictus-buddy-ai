import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Heart, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { adminMetrics, weeklyTrend, PAIR_RETENTION } from '../../../data/mockData';
import { BUDDY_FUNNEL } from '../../../data/girlsData';
import { DWH_RETENTION } from '../../../data/dwhSnapshot';
import { MetricCard }      from '../MetricCard';
import { ProgramsChart }   from '../ProgramsChart';
import { TimeHeatmap }     from '../TimeHeatmap';
import { AIInsights }      from '../AIInsights';
import { RecentRequests }  from '../RecentRequests';
import { RecommendationsList } from '../RecommendationsList';
import { DwhBadge }        from '../../shared/DwhBadge';

const FUNNEL_MAX = BUDDY_FUNNEL[0].count;
const NET_RET_AVG = Math.round(
  DWH_RETENTION.reduce((s, r) => s + r.retentionRate, 0) / DWH_RETENTION.length,
);

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

const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--ig-border)', borderRadius: 8,
      padding: '10px 14px', boxShadow: 'var(--sh)', fontSize: 12, fontFamily: 'var(--font-body)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--ig-black)' }}>{label}</div>
      {payload.map((e: any) => (
        <div key={e.name} style={{ color: e.color, display: 'flex', gap: 8, marginBottom: 2 }}>
          <span>{e.name}:</span>
          <span style={{ fontWeight: 600 }}>{e.value}</span>
        </div>
      ))}
    </div>
  );
};

export function BuddyTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── KPI row ───────────────────────────────────────────── */}
      <div className="metrics-grid">
        <MetricCard icon={Users}       iconBg="var(--ig-blue-pale)" iconColor="var(--ig-blue-dark)" value={adminMetrics.totalRequests}        label="Запросов на buddy"      trend={12} />
        <MetricCard icon={Heart}       iconBg="var(--ig-fog)"       iconColor="var(--ig-graphite2)" value={adminMetrics.matchesFound}         label="Матчей найдено"         trend={9}  />
        <MetricCard icon={Calendar}    iconBg="var(--gold-light)"   iconColor="var(--ig-warning)"   value={adminMetrics.bookedTogether}       label="Записались вместе"      trend={18} />
        <MetricCard icon={CheckCircle} iconBg="var(--sage-light)"   iconColor="var(--ig-success)"   value={adminMetrics.attended}             label="Пришли на тренировку"   trend={5}  />
        <MetricCard icon={TrendingUp}  iconBg="var(--ig-fog)"       iconColor="var(--ig-muted)"     value={`${adminMetrics.conversionRate}%`} label="Конверсия в посещение"  trend={-2} />
      </div>

      {/* ── Weekly trend ──────────────────────────────────────── */}
      <div className="chart-card chart-card--full">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Недельный тренд</div>
            <div style={{ fontSize: 11, color: 'var(--ig-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginTop: 2 }}>
              запросы и матчи по дням
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 2, background: 'var(--ig-black)', borderRadius: 2 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ig-muted)', letterSpacing: '0.06em' }}>Запросы</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 2, background: 'var(--ig-blue)', borderRadius: 2 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ig-muted)', letterSpacing: '0.06em' }}>Матчи</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 8px 16px' }}>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={weeklyTrend} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#050505" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#050505" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gMat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4B5269" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#4B5269" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--ig-fog)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--ig-muted)', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--ig-muted)', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<AreaTooltip />} />
              <Area type="monotone" dataKey="requests" name="Запросы" stroke="#050505" strokeWidth={2} fill="url(#gReq)" dot={false} />
              <Area type="monotone" dataKey="matches"  name="Матчи"   stroke="#4B5269" strokeWidth={2} fill="url(#gMat)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Funnel ────────────────────────────────────────────── */}
      <SectionLabel>Воронка подбора</SectionLabel>

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
                  <div className="funnel-row__bar" style={{ width: `${(s.count / FUNNEL_MAX) * 100}%` }} />
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

      <div className="metrics-grid">
        {[
          { label: 'Match rate',            value: '76.5%', sub: 'из начавших получили матч',   color: 'var(--sage)' },
          { label: 'No-match rate',         value: '23.5%', sub: 'без подходящего совпадения',   color: 'var(--coral)' },
          { label: 'Wizard completion',     value: '51.3%', sub: 'завершили все 8 шагов',        color: 'var(--gold)' },
          { label: 'Request creation rate', value: '18.4%', sub: 'создали запрос при no-match',  color: 'var(--lavender)' },
          { label: 'Join rate',             value: '70.9%', sub: 'из матчей присоединились',     color: 'var(--rose)' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-card__value" style={{ color: m.color, fontSize: 26 }}>{m.value}</div>
            <div className="metric-card__label" style={{ fontWeight: 700 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-card__title" style={{ marginBottom: 16 }}>Drop-off инсайты</div>
        {[
          { step: 'Увидели → Нажали (33%)',    insight: 'Низкий CTR. A/B тест заголовка и CTA кнопки. Попробовать "Найди свою группу".' },
          { step: 'Начали → Завершили (51%)',  insight: 'Drop-off на шаге "На что хочешь пойти?" — слишком много вариантов. Сократить до 5 программ + "Не знаю".' },
          { step: 'Матч → Пришли (73%)',       insight: 'Хорошая конверсия, но можно улучшить: push за 2 ч до тренировки с именем buddy.' },
        ].map(d => (
          <div key={d.step} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose-dark)', minWidth: 160, flexShrink: 0 }}>{d.step}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{d.insight}</div>
          </div>
        ))}
      </div>

      {/* ── Program + time demand ─────────────────────────────── */}
      <SectionLabel>Спрос: программы и время</SectionLabel>
      <div className="charts-row">
        <ProgramsChart />
        <TimeHeatmap />
      </div>

      {/* ── Buddy effect on retention ─────────────────────────── */}
      <SectionLabel>Эффект buddy на retention</SectionLabel>
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 4 }}>С buddy vs без buddy — 30-day retention</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          ⚠️ Источник: локальные buddy-данные (mock/export) — не из DWH
        </div>
        {[
          { label: 'С buddy (нашли пару или группу)', value: 78,          color: 'var(--ig-success)' },
          { label: 'Без buddy',                        value: 48,          color: 'var(--ig-muted)' },
          { label: 'Benchmark сети (DWH proxy avg)',   value: NET_RET_AVG, color: 'var(--ig-blue)' },
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
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--ig-blue-pale)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--ig-blue-dark)', lineHeight: 1.6 }}>
          ✦ Клиентки с buddy-механикой возвращаются значительно чаще. Средний retention по сети (DWH proxy): <strong>{NET_RET_AVG}%</strong>. Buddy-effect даёт прирост ~<strong>+8–10 пп</strong>.
        </div>
      </div>

      {/* ── Pair retention + reactivation (Tier 2) ────────────── */}
      <SectionLabel>Удержание пар</SectionLabel>
      <div className="metrics-grid">
        {[
          { label: 'Пар сматчилось',               value: PAIR_RETENTION.matched,             color: 'var(--ig-black)',   sub: 'взаимный матч' },
          { label: 'Сходили вместе',               value: PAIR_RETENTION.trainedTogether,     color: 'var(--ig-blue)',    sub: '≥1 совместная тренировка' },
          { label: 'Вместе через 30 дней',         value: PAIR_RETENTION.together30d,         color: 'var(--ig-success)', sub: 'продолжают ходить парой' },
          { label: 'Повторных совместных записей', value: PAIR_RETENTION.repeatJointBookings, color: 'var(--ig-black)',   sub: 'записались вдвоём снова' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-card__value" style={{ color: m.color, fontSize: 26 }}>{m.value}</div>
            <div className="metric-card__label" style={{ fontWeight: 700 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Renewal: pairs vs solo — the core business hypothesis */}
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 4 }}>Продление абонемента — пары vs одиночки</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          ⚠️ Локальные buddy-данные (mock/export) — гипотеза для пилота, не из DWH
        </div>
        {[
          { label: 'Клиентки в паре (нашли buddy)', value: PAIR_RETENTION.renewalPair, color: 'var(--ig-success)' },
          { label: 'Клиентки без пары',              value: PAIR_RETENTION.renewalSolo, color: 'var(--ig-muted)' },
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
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--sage-light)', borderRadius: 'var(--r-sm)', fontSize: 13, color: '#3A6858', lineHeight: 1.6 }}>
          ✦ Пары продлевают абонемент на <strong>+{PAIR_RETENTION.renewalPair - PAIR_RETENTION.renewalSolo} пп</strong> чаще. Ядро бизнес-гипотезы: матч → привычка → продление.
        </div>
      </div>

      {/* Reactivation automation (idea #6) */}
      <div className="chart-card" style={{ padding: 24 }}>
        <div className="chart-card__title" style={{ marginBottom: 4 }}>Реактивация пар</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          Авто-напоминание парам, которые сматчились, но не дошли до тренировки
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { k: 'Сматчились, но не пришли',       v: PAIR_RETENTION.matched - PAIR_RETENTION.trainedTogether },
            { k: 'Отправлено напоминаний',         v: PAIR_RETENTION.matched - PAIR_RETENTION.trainedTogether },
            { k: 'Вернулись после напоминания',    v: PAIR_RETENTION.reactivated },
          ].map(x => (
            <div key={x.k} style={{ flex: 1, minWidth: 150, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 22, fontWeight: 700, color: 'var(--ig-black)', letterSpacing: '-0.02em' }}>{x.v}</div>
              <div style={{ fontSize: 11, color: 'var(--ig-muted)', marginTop: 2 }}>{x.k}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 14px', background: 'var(--ig-blue-pale)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--ig-blue-dark)', lineHeight: 1.6 }}>
          Текст напоминания: «Вы с Даной так и не сходили вместе 💬 Перенесём на эту неделю? Подберём удобное время.»
        </div>
      </div>

      {/* ── AI insights ───────────────────────────────────────── */}
      <SectionLabel>AI-инсайты</SectionLabel>
      <AIInsights />

      {/* ── Recent requests ───────────────────────────────────── */}
      <div className="chart-card">
        <RecentRequests />
      </div>

      {/* ── Recommendations (buddy) ───────────────────────────── */}
      <SectionLabel>Рекомендации — Buddy</SectionLabel>
      <RecommendationsList category="buddy" />

      <DwhBadge variant="card" />
    </div>
  );
}
