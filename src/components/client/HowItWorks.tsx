import { ChevronLeft, ShieldCheck, Users, Heart, Calendar, CheckCircle, Zap, Star } from 'lucide-react';
import { GIRLS_PROGRAMS } from '../../data/girlsData';

interface HowItWorksProps {
  onFindBuddy: () => void;
  onBack:      () => void;
}

const HOW_STEPS = [
  { num: '01', text: 'Выбираешь город и клуб' },
  { num: '02', text: 'Выбираешь программу и время' },
  { num: '03', text: 'Система подбирает совпадения' },
  { num: '04', text: 'Присоединяешься к паре или мини-группе' },
  { num: '05', text: 'Контакты не раскрываются без согласия' },
  { num: '06', text: 'После тренировки можно ходить вместе регулярно' },
];

const WHY_ITEMS = [
  { icon: Heart,       text: 'Легче прийти на первую тренировку' },
  { icon: Users,       text: 'Меньше страха и неловкости' },
  { icon: Star,        text: 'Можно найти человека с похожей целью' },
  { icon: Zap,         text: 'Проще вернуться после паузы' },
  { icon: Calendar,    text: 'Выше шанс не пропустить занятие' },
  { icon: CheckCircle, text: 'Поддержка с первого дня' },
];

export function HowItWorks({ onFindBuddy, onBack }: HowItWorksProps) {
  const displayPrograms = GIRLS_PROGRAMS.filter(p => p.key !== 'unknown');

  return (
    <div className="hiw">
      {/* Back nav */}
      <div className="hiw__nav">
        <button className="wizard-back" onClick={onBack}>
          <ChevronLeft size={18} />
          <span>На главную</span>
        </button>
      </div>

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="hiw__hero">
        <div className="hero__eyebrow" style={{ marginBottom: 20 }}>
          <span>✦</span>
          <span>Invictus Buddy AI</span>
        </div>
        <h1 className="hiw__hero-title">
          Ты не обязана идти<br />на тренировку <span>одна</span>
        </h1>
        <p className="hiw__hero-sub">
          Invictus Buddy помогает найти девушку или мини-группу с похожей целью,
          уровнем и удобным временем.
        </p>
      </section>

      {/* ── 2. Как работает ─────────────────────────────────────────────────── */}
      <section className="hiw__section">
        <div className="hiw__section-label">Как это работает</div>
        <div className="hiw__steps">
          {HOW_STEPS.map(s => (
            <div key={s.num} className="hiw__step">
              <div className="hiw__step-num">{s.num}</div>
              <div className="hiw__step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Почему удобно ────────────────────────────────────────────────── */}
      <section className="hiw__section hiw__section--alt">
        <div className="hiw__section-label">Почему это удобно</div>
        <div className="hiw__why-grid">
          {WHY_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="hiw__why-item">
              <div className="hiw__why-icon">
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Programs ─────────────────────────────────────────────────────── */}
      <section className="hiw__section">
        <div className="hiw__section-label">Групповые программы</div>
        <div className="hiw__programs-grid">
          {displayPrograms.map(p => (
            <div key={p.key} className="hiw__program-card">
              <div className="hiw__program-name">{p.name}</div>
              <div className="hiw__program-desc">{p.description}</div>
              <div className="hiw__program-footer">
                {p.level && (
                  <span className="badge badge--lavender" style={{ fontSize: 11 }}>{p.level}</span>
                )}
                <span className="badge badge--gold" style={{ fontSize: 11 }}>{p.goal}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  ~{p.calories} ккал
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Privacy ──────────────────────────────────────────────────────── */}
      <section className="hiw__section hiw__section--alt">
        <div className="hiw__privacy">
          <div className="hiw__privacy-icon">
            <ShieldCheck size={28} strokeWidth={1.5} />
          </div>
          <div>
            <div className="hiw__privacy-title">Конфиденциальность</div>
            <p className="hiw__privacy-text">
              Мы показываем только безопасные данные: имя, возрастной диапазон, клуб,
              программу и время. Номер телефона, фамилия и личные контакты не
              раскрываются без согласия.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. CTA ──────────────────────────────────────────────────────────── */}
      <section className="hiw__cta">
        <h2 className="hiw__cta-title">Готова найти свою<br /><span>тренировочную подругу?</span></h2>
        <button className="btn btn--primary btn--lg" onClick={onFindBuddy}>
          Найти подругу
        </button>
      </section>
    </div>
  );
}
