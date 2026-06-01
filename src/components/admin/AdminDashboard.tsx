import { useState } from 'react';
import { OverviewTab }         from './tabs/OverviewTab';
import { BuddyAnalyticsTab }   from './tabs/BuddyAnalyticsTab';
import { ClubsTab }            from './tabs/ClubsTab';
import { GroupProgramsTab }    from './tabs/GroupProgramsTab';
import { RetentionTab }        from './tabs/RetentionTab';
import { CapacityTab }         from './tabs/CapacityTab';
import { RecommendationsTab }  from './tabs/RecommendationsTab';

const TABS = [
  { id: 'overview',         label: 'Overview' },
  { id: 'buddy',            label: 'Buddy Analytics' },
  { id: 'clubs',            label: 'Clubs' },
  { id: 'programs',         label: 'Group Programs' },
  { id: 'retention',        label: 'Retention' },
  { id: 'capacity',         label: 'Capacity' },
  { id: 'recommendations',  label: 'Recommendations' },
] as const;

type TabId = typeof TABS[number]['id'];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="admin">
      {/* Header */}
      <div className="admin__header">
        <div>
          <div className="admin__title">Buddy AI — Дашборд</div>
          <div className="admin__subtitle">Аналитика по механике "Подруга для тренировки"</div>
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
        {activeTab === 'overview'        && <OverviewTab />}
        {activeTab === 'buddy'           && <BuddyAnalyticsTab />}
        {activeTab === 'clubs'           && <ClubsTab />}
        {activeTab === 'programs'        && <GroupProgramsTab />}
        {activeTab === 'retention'       && <RetentionTab />}
        {activeTab === 'capacity'        && <CapacityTab />}
        {activeTab === 'recommendations' && <RecommendationsTab />}
      </div>
    </div>
  );
}
