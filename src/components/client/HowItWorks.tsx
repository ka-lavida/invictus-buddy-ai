import { ChevronLeft, ShieldCheck, Users, Heart, Calendar, CheckCircle, Zap, Star } from 'lucide-react';
import { GIRLS_PROGRAMS } from '../../data/girlsData';

interface HowItWorksProps {
  onFindBuddy: () => void;
  onBack:      () => void;
}

const HOW_STEPS = [
  { num: '01', text: 'Выбираешь город и клуб Invictus Girls' },
  { num: '02', text: 'Выбираешь программу и удобное время' },
  { num: '03', text: 'Система подбирает совпадения по цели, уровню и расписанию' },
  { num: '04', text: 'Присоединяешься к паре или мини-группе' },
  { num: '05', text: 'Приходишь на тренировку без неловкости' },
  { num: '06', text: 'После можно ходить вместе регулярно' },
];

const WHY_ITEMS = [
  { icon: Heart,       text: 'Легче прийти на первую тренировку' },
  { icon: Users,       text: 'Меньше страха и неловкости' },
  { icon: Star,        text: 'Человек с похожей целью и уровнем' },
  { icon: Zap,         text: 'Проще вернуться после паузы' },
  { icon: Calendar,    text: 'Выше шанс не пропустить занятие' },
  { icon: CheckCircle, text: 'Поддержка с первого дня' },
];

const QUOTES = [
  { text: 'Я здесь не одна.', sub: 'invictus girls · buddy ai' },
  { text: 'Первый шаг легче, когда рядом своя.', sub: 'strong start · real support' },
];

export function HowItWorks({ onFindBuddy, onBack }: HowItWorksProps) {
  const displayPrograms = GIRLS_PROGRAMS.filter(p => p.key !== 'unknown');

  return (
    <div className="hiw">

      {/* Back nav */}
      <div className="hiw__nav">
        <button className="wizard-back" onClick={onBack}>
          <ChevronLeft size={16} />
          <span>На главную</span>
        </button>
      </div>

      {/* ── 1. Dark Hero ────────────────────────────────────────────── */}
      <section className="hiw__hero">
        <div className="hiw__hero-inner">
          {/* Mini logo mark */}
          <svg viewBox="0 0 44 48" fill="none" style={{ height: 40, marginBottom: 20 }}>
            <polygon points="22,2 40,12 40,36 22,46 4,36 4,12" fill="#4B5269"/>
            <polygon points="22,14 30,19 30,29 22,34 14,29 14,19" fill="white" fillOpacity="0.9"/>
          </svg>

          <div className="hiw__hero-label">Invictus Buddy AI</div>

          <h1 className="hiw__hero-title">
            Ты не обязана идти<br/>на тренировку <span>одна</span>
          </h1>

          <p className="hiw__hero-sub">
            Invictus Buddy помогает найти девушку или мини-группу с похожей
            целью, уровнем и удобным временем.
          </p>

          <button className="btn btn--white btn--lg" onClick={onFindBuddy}>
            Найти подругу
          </button>

          {/* Quote */}
          <div className="hiw__quote">
            <div className="hiw__quote-text">"{QUOTES[0].text}"</div>
            <div className="hiw__quote-sub">{QUOTES[0].sub}</div>
          </div>
        </div>
      </section>

      {/* ── 2. Как работает ─────────────────────────────────────────── */}
      <section className="hiw__section">
        <div className="hiw__section-label">Как это работает</div>
        <h2 className="hiw__section-title">Шесть шагов<br/>до первой совместной тренировки</h2>
        <div className="hiw__steps">
          {HOW_STEPS.map(s => (
            <div key={s.num} className="hiw__step">
              <div className="hiw__step-num">{s.num}</div>
              <div className="hiw__step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Почему удобно ────────────────────────────────────────── */}
      <section className="hiw__section hiw__section--alt">
        <div className="hiw__section-label">Почему это работает</div>
        <h2 className="hiw__section-title">Тренироваться легче,<br/>когда рядом своя</h2>
        <div className="hiw__why-grid">
          {WHY_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="hiw__why-item">
              <div className="hiw__why-icon">
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Programs — dark cards ─────────────────────────────────── */}
      <section className="hiw__section">
        <div className="hiw__section-label">Групповые программы</div>
        <h2 className="hiw__section-title">Выбери формат<br/>по душе</h2>
        <div className="hiw__programs-grid">
          {displayPrograms.map(p => (
            <div key={p.key} className="hiw__program-card">
              <div className="hiw__program-card__label">invictus girls</div>
              <div className="hiw__program-name">{p.name}</div>
              <div className="hiw__program-desc">{p.description}</div>
              <div className="hiw__program-footer">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                    padding: '2px 6px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 99,
                  }}
                >
                  {p.level}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                    marginLeft: 'auto',
                  }}
                >
                  ~{p.calories} ккал
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Privacy ──────────────────────────────────────────────── */}
      <section className="hiw__section hiw__section--alt">
        <div className="hiw__privacy">
          <div className="hiw__privacy-icon">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="hiw__privacy-title">Твои данные под защитой</div>
            <p className="hiw__privacy-text">
              Мы показываем только безопасные данные: имя, возрастной диапазон, клуб,
              программу и время. Номер телефона, фамилия и личные контакты не
              раскрываются без взаимного согласия.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Second quote ─────────────────────────────────────────── */}
      <section className="hiw__section" style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ig-muted)',
            marginBottom: 12,
          }}
        >
          Girls-only space · Real support · Strong start
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'var(--ig-blue)',
            letterSpacing: '-0.01em',
            marginBottom: 8,
          }}
        >
          Өзгеріс осы жерде басталады
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--ig-muted)',
          }}
        >
          Изменения начинаются здесь.
        </div>
      </section>

      {/* ── 7. CTA dark ─────────────────────────────────────────────── */}
      <section className="hiw__cta">
        <div className="hiw__cta-eyebrow">Готова начать?</div>
        <h2 className="hiw__cta-title">
          Подберём компанию<br/>под твой ритм
        </h2>
        <button className="btn btn--white btn--lg" onClick={onFindBuddy}>
          Найти подругу
        </button>
      </section>

    </div>
  );
}
