interface DwhBadgeProps {
  variant?: 'pill' | 'card';
}

export function DwhBadge({ variant = 'pill' }: DwhBadgeProps) {
  if (variant === 'card') {
    return (
      <div className="dwh-info">
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: 'var(--ig-blue-pale)',
          border: '1px solid var(--ig-blue-mist)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ig-blue-dark)', fontWeight: 600 }}>
            DWH
          </span>
        </div>
        <div>
          <div className="dwh-info__title">DWH verified via MCP · Demo uses mock export</div>
          <div className="dwh-info__text">
            DWH используется read-only. Buddy requests и matches хранятся
            локально и не записываются в DWH.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dwh-pill" title="DWH verified via MCP · Demo uses mock export">
      <span className="dwh-pill__dot" />
      <span>DWH · MCP</span>
    </div>
  );
}
