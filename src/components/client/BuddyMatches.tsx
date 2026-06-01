import { useState } from 'react';
import { Search } from 'lucide-react';
import type { MatchResult } from '../../utils/matching';
import type { FormData, MemberStatus } from '../../data/mockData';
import { api } from '../../utils/api';

// ─── Compact label for member status ─────────────────────────────────────────
const STATUS_SHORT: Record<MemberStatus, string> = {
  'впервые иду в Invictus Girls': 'первый раз',
  'купила пробный доступ':        'пробный доступ',
  'давно не была':                'давно не была',
  'хожу иногда':                  'хожу иногда',
  'хожу регулярно':               'регулярная',
};

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  formData: FormData;
  onAction: (msg: string) => void;
}

function EmptyState({ formData, onAction }: EmptyStateProps) {
  const [sending, setSending] = useState(false);

  const handleCreateRequest = async () => {
    setSending(true);
    try {
      // Сохраняем заявку на бэкенде (server/data/buddy_requests.json)
      await api.post('/api/buddy/request', {
        club:         formData.club,
        program:      formData.program,
        timeSlot:     formData.timeSlot,
        format:       formData.format,
        level:        formData.level,
        goal:         formData.goal,
        ageRange:     formData.ageRange,
        memberStatus: formData.memberStatus,
      });
    } catch {
      // Если сервер недоступен — всё равно показываем успех (demo)
    } finally {
      setSending(false);
    }
    onAction('Запрос создан. Мы уведомим вас, когда появится подходящая подруга или мини-группа 🔔');
  };

  return (
    <div className="matches-empty">
      <div className="matches-empty__icon">
        <Search size={28} strokeWidth={1.5} />
      </div>
      <div className="matches-empty__title">
        Пока нет идеального совпадения
      </div>
      <div className="matches-empty__subtitle">
        Но мы можем собрать мини-группу под тебя — оставь запрос и мы уведомим,
        как только найдётся подходящий матч в твоём клубе.
      </div>
      <div className="matches-empty__actions">
        <button
          className="btn btn--primary"
          onClick={handleCreateRequest}
          disabled={sending}
          style={{ opacity: sending ? 0.7 : 1 }}
        >
          {sending ? 'Создаём…' : 'Создать запрос'}
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => onAction('Напомним, когда появится подходящая группа 🔔')}
        >
          Получить уведомление
        </button>
      </div>
    </div>
  );
}

// ─── Single Match Card ────────────────────────────────────────────────────────

interface MatchCardProps {
  result:   MatchResult;
  index:    number;
  onAction: (msg: string) => void;
}

function MatchCard({ result, index, onAction }: MatchCardProps) {
  const { request: r, score, reason } = result;

  const scoreColor =
    score >= 80 ? 'var(--sage)' :
    score >= 65 ? 'var(--gold)' :
    'var(--rose)';

  return (
    <article
      className="match-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Top: avatar + name/meta + score */}
      <div className="match-card__top">
        <div className={`match-avatar ${r.isGroup ? 'match-avatar--group' : ''}`}>
          {r.initials}
        </div>

        <div className="match-info">
          <div className="match-name">{r.name}</div>
          <div className="match-meta">
            <span>{r.ageRange} лет</span>
            <span className="match-dot" />
            <span>{r.day}</span>
            <span className="match-dot" />
            <span>{r.time}</span>
            <span className="match-dot" />
            <span>{r.club}</span>
          </div>
        </div>

        <div className="match-score-badge">
          <div className="match-score-value" style={{ color: scoreColor }}>{score}%</div>
          <div className="match-score-label">матч</div>
        </div>
      </div>

      {/* AI-generated reason */}
      <div className="match-reason">
        <span className="match-reason__icon">✦</span>
        <span>{reason}</span>
      </div>

      {/* Tags: program · level · goal · age · status · format */}
      <div className="match-card__tags">
        <span className="badge badge--rose">{r.program}</span>
        <span className="badge badge--lavender">{r.level}</span>
        <span className="badge badge--gold">{r.goal}</span>
        <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
          {STATUS_SHORT[r.memberStatus]}
        </span>
        {r.isGroup && r.groupSize && (
          <span className="badge badge--sage">{r.groupSize} чел.</span>
        )}
      </div>

      {/* Actions */}
      <div className="match-card__actions">
        {r.isGroup ? (
          <button
            className="btn btn--primary btn--sm"
            onClick={() => onAction('Ты в группе! Увидимся на тренировке 💪')}
          >
            Присоединиться
          </button>
        ) : (
          <button
            className="btn btn--primary btn--sm"
            onClick={() => onAction('Запись оформлена! Ждём вас обеих 🎉')}
          >
            Записаться вместе
          </button>
        )}
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onAction('Напомним за 2 часа до тренировки 🔔')}
        >
          Напоминание
        </button>
      </div>
    </article>
  );
}

// ─── Matches View ─────────────────────────────────────────────────────────────

interface BuddyMatchesProps {
  matches:  MatchResult[];
  formData: FormData;
  onAction: (msg: string) => void;
  onReset:  () => void;
}

export function BuddyMatches({ matches, formData, onAction, onReset }: BuddyMatchesProps) {
  const hasResults = matches.length > 0;

  return (
    <section className="matches-section">
      <div className="matches-header">
        <div className="matches-title">
          {hasResults
            ? `Нашли ${matches.length} ${plural(matches.length, 'матч', 'матча', 'матчей')}`
            : 'Матчи не найдены'}
        </div>
        <div className="matches-subtitle">
          {formData.program} · {formData.timeSlot} · {formData.club}
        </div>
      </div>

      {hasResults ? (
        <div className="matches-list">
          {matches.map((m, i) => (
            <MatchCard key={m.request.id} result={m} index={i} onAction={onAction} />
          ))}
        </div>
      ) : (
        <EmptyState formData={formData} onAction={onAction} />
      )}

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button className="btn btn--ghost btn--sm" onClick={onReset}>
          Изменить параметры
        </button>
      </div>
    </section>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}
