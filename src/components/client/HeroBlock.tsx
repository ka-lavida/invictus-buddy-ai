interface HeroBlockProps {
  onFindBuddy:   () => void;
  onHowItWorks:  () => void;
}

export function HeroBlock({ onFindBuddy, onHowItWorks }: HeroBlockProps) {
  return (
    <section className="hero">
      <div className="hero__inner">

        {/* Logo mark */}
        <div className="hero__logo">
          <svg viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 72, width: 'auto' }}>
            <polygon points="45,4 82,25 82,75 45,96 8,75 8,25" fill="#4B5269"/>
            <polygon points="45,20 66,32 66,56 45,68 24,56 24,32" fill="white" fillOpacity="0.12"/>
            <polygon points="45,28 60,37 60,55 45,64 30,55 30,37" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>

        {/* Eyebrow */}
        <div className="hero__eyebrow">
          <span>✦</span>
          <span>Invictus Girls · Buddy AI</span>
        </div>

        {/* Main headline */}
        <div className="hero__title">Найди свою</div>
        <div className="hero__title-sub">
          для <span className="hero__title-accent">тренировки</span>
        </div>

        {/* Sub */}
        <p className="hero__subtitle">
          Выбери город, клуб, программу и удобное время —
          мы подберём девушку или мини-группу с похожей целью.
        </p>

        {/* CTA */}
        <div className="hero__cta-row">
          <button className="btn btn--white btn--lg" onClick={onFindBuddy}>
            Найти подругу
          </button>
          <button className="btn btn--white-outline btn--lg" onClick={onHowItWorks}>
            Как это работает
          </button>
        </div>

        {/* Stats */}
        <div className="hero__stats">
          <div className="hero__stat">
            <div className="hero__stat-value">247</div>
            <div className="hero__stat-label">запросов / мес</div>
          </div>
          <div className="hero__stat-sep" />
          <div className="hero__stat">
            <div className="hero__stat-value">189</div>
            <div className="hero__stat-label">матчей найдено</div>
          </div>
          <div className="hero__stat-sep" />
          <div className="hero__stat">
            <div className="hero__stat-value">73%</div>
            <div className="hero__stat-label">пришли вместе</div>
          </div>
        </div>

        {/* Preview cards */}
        <div className="hero__preview">
          <div className="hero__preview-card">
            <div className="hero__preview-name">Аружан · Glute Lab</div>
            <div className="hero__preview-meta">19:00 · Crystal · Алматы</div>
          </div>
          <div className="hero__preview-card">
            <div className="hero__preview-name">+3 girls · Bootcamp</div>
            <div className="hero__preview-meta">same goal · same time</div>
          </div>
          <div className="hero__preview-card">
            <div className="hero__preview-name">Жансая · Stretching</div>
            <div className="hero__preview-meta">11:00 · Tole bi · score 92</div>
          </div>
        </div>

      </div>

      {/* Trust strip */}
      <div className="hero__trust">
        <div className="hero__trust-item">
          <span>🔒</span>
          <span>Контакты только с согласия</span>
        </div>
        <div className="hero__trust-item">
          <span>👤</span>
          <span>Только безопасные данные</span>
        </div>
        <div className="hero__trust-item">
          <span>♀</span>
          <span>Girls-only space</span>
        </div>
      </div>
    </section>
  );
}
