import { heatmapData } from '../../data/mockData';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;
const DAY_KEYS: (keyof typeof heatmapData[0])[] = ['mon','tue','wed','thu','fri','sat','sun'];

// Map intensity 0–50 → hsl rose gradient
const heatColor = (value: number): { bg: string; text: string } => {
  const t = Math.min(value / 50, 1);
  const lightness = 95 - t * 50;    // 95% (pale) → 45% (deep rose)
  const saturation = 40 + t * 15;   // 40% → 55%
  const bg = `hsl(345, ${saturation}%, ${lightness}%)`;
  const text = lightness < 65 ? '#fff' : '#9E6278';
  return { bg, text };
};

export function TimeHeatmap() {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <div className="chart-card__title">Тепловая карта запросов</div>
          <div className="chart-card__subtitle">по времени и дню недели</div>
        </div>
      </div>

      <div className="heatmap-wrap">
        <div className="heatmap">
          {/* Header row: day labels */}
          <div className="heatmap__row heatmap__row--header">
            <div /> {/* spacer for time labels */}
            {DAYS.map((day) => (
              <div key={day} className="heatmap__day-label">{day}</div>
            ))}
          </div>

          {/* Data rows */}
          {heatmapData.map((row) => (
            <div key={row.time} className="heatmap__row">
              <div className="heatmap__time-label">{row.time}</div>
              {DAY_KEYS.map((key, i) => {
                const val = row[key] as number;
                const { bg, text } = heatColor(val);
                return (
                  <div
                    key={DAYS[i]}
                    className="heatmap__cell"
                    style={{ background: bg, color: text }}
                    title={`${DAYS[i]} ${row.time}: ${val} запросов`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Gradient legend */}
        <div className="heatmap__legend">
          <span>мало</span>
          <div className="heatmap__legend-gradient" />
          <span>много</span>
        </div>
      </div>
    </div>
  );
}
