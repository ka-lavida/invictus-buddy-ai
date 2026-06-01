import { ShieldCheck } from 'lucide-react';

interface DwhBadgeProps {
  variant?: 'pill' | 'card'; // pill — для header, card — для admin
}

export function DwhBadge({ variant = 'pill' }: DwhBadgeProps) {
  if (variant === 'card') {
    return (
      <div className="dwh-card">
        <div className="dwh-card__header">
          <ShieldCheck size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span className="dwh-card__title">
            DWH verified via MCP · Demo uses mock export
          </span>
          <span className="dwh-card__dot" />
        </div>
        <p className="dwh-card__desc">
          DWH используется read-only. Buddy requests и matches хранятся
          локально и не записываются в DWH.
        </p>
      </div>
    );
  }

  // pill — compact header badge
  return (
    <div className="dwh-pill" title="DWH verified via MCP · Demo uses mock export">
      <span className="dwh-pill__dot" />
      <span className="dwh-pill__text">DWH · MCP</span>
    </div>
  );
}
