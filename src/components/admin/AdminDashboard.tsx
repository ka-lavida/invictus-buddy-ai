import { useState } from 'react';
import { BuddyTab }           from './tabs/BuddyTab';
import { GroupAnalyticsTab }  from './tabs/GroupAnalyticsTab';
import { ClubsTab }           from './tabs/ClubsTab';
import { GroupProgramsTab }   from './tabs/GroupProgramsTab';

const TABS = [
  { id: 'buddy',    label: 'Аналитика Buddy' },
  { id: 'group',    label: 'Аналитика групповых' },
  { id: 'clubs',    label: 'Clubs' },
  { id: 'programs', label: 'Group programs' },
] as const;

type TabId = typeof TABS[number]['id'];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('buddy');

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="admin">
      {/* Header */}
      <div className="admin__header">
        <div>
          {/* Location logoblock style */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ig-muted)',
            }}>
              invictus girls
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'lowercase',
              color: 'var(--ig-blue)',
              fontWeight: 600,
            }}>
              buddy ai
            </span>
          </div>
          <div className="admin__title">Дашборд аналитики</div>
          <div className="admin__subtitle">Механика "Подруга для тренировки" · DWH + local data</div>
        </div>
        <div className="admin__date">{today}</div>
      </div>

      {/* Tab Nav */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content" key={activeTab}>
        {activeTab === 'buddy'    && <BuddyTab />}
        {activeTab === 'group'    && <GroupAnalyticsTab />}
        {activeTab === 'clubs'    && <ClubsTab />}
        {activeTab === 'programs' && <GroupProgramsTab />}
      </div>
    </div>
  );
}
