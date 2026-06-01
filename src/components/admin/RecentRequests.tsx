import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

interface BuddyRequest {
  id:           string;
  club:         string;
  program:      string;
  timeSlot:     string;
  ageRange:     string;
  goal:         string;
  memberStatus: string;
  status:       string;
  createdAt:    string;
}

// Относительное время: "2 мин назад", "1 час назад", "вчера"
function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)        return `${diff} сек назад`;
  if (diff < 3600)      return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

export function RecentRequests() {
  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/api/admin/requests?limit=5')
      .then(r => setRequests(r.data.requests ?? []))
      .catch(() => {})          // сервер может быть выключен — молча
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="recent-requests">
      <div className="recent-requests__header">
        <div className="chart-card__title">Новые buddy-запросы</div>
        <span className="badge badge--rose">{requests.length} локально</span>
      </div>

      {loading && (
        <div className="recent-requests__empty">Загружаю…</div>
      )}

      {!loading && requests.length === 0 && (
        <div className="recent-requests__empty">
          Запросов пока нет — они появятся после первой анкеты в Client Mode.
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="recent-requests__list">
          {requests.map(r => (
            <div key={r.id} className="request-row">
              <div className="request-row__main">
                <span className="badge badge--rose">{r.club}</span>
                <span className="request-row__program">{r.program || '—'}</span>
                <span className="request-row__dot">·</span>
                <span className="request-row__meta">{r.timeSlot}</span>
              </div>
              <div className="request-row__secondary">
                {r.ageRange && <span className="badge badge--lavender">{r.ageRange}</span>}
                {r.goal     && <span className="badge badge--gold">{r.goal}</span>}
                <span className={`request-row__status request-row__status--${r.status}`}>
                  {r.status === 'active' ? '● активен' : r.status}
                </span>
                <span className="request-row__time">{timeAgo(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
