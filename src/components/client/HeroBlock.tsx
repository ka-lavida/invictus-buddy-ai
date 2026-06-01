// Hero-секция клиентского режима с CTA "Найти подругу"
interface HeroBlockProps {
  onFindBuddy: () => void;
}

export function HeroBlock({ onFindBuddy }: HeroBlockProps) {
  return (
    <section className="hero">
      {/* Eyebrow tag */}
      <div className="hero__eyebrow">
        <span>✦</span>
        <span>Invictus Girls — Новая фича</span>
      </div>

      {/* Main headline */}
      <h1 className="hero__title">
        Найди <span>подругу</span><br />для тренировки
      </h1>

      <p className="hero__subtitle">
        Тренироваться вдвоём легче. Выбери программу, время и формат —
        мы подберём девушку с похожими целями из твоего клуба.
      </p>

      {/* CTA buttons */}
      <div className="hero__cta-row">
        <button className="btn btn--primary btn--lg" onClick={onFindBuddy}>
          Найти подругу
        </button>
        <button className="btn btn--ghost btn--lg">
          Как это работает
        </button>
      </div>

      {/* Social proof stats */}
      <div className="hero__stats">
        <div className="hero__stat">
          <div className="hero__stat-value">247</div>
          <div className="hero__stat-label">запросов этот месяц</div>
        </div>
        <div className="hero__stat-sep" />
        <div className="hero__stat">
          <div className="hero__stat-value">189</div>
          <div className="hero__stat-label">матчей найдено</div>
        </div>
        <div className="hero__stat-sep" />
        <div className="hero__stat">
          <div className="hero__stat-value">73%</div>
          <div className="hero__stat-label">пришли на тренировку</div>
        </div>
      </div>
    </section>
  );
}
