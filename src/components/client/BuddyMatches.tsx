import { useState } from 'react';
import { Search } from 'lucide-react';
import type { MatchResult } from '../../utils/matching';
import type { FormData, MemberStatus } from '../../data/mockData';
import { api } from '../../utils/api';

// ─── Compact label for member status ────────────────────────────────────────
const STATUS_SHORT: Record<MemberStatus, string> = {
  'впервые иду в Invictus Girls': 'первый раз',
  'купила пробный доступ':        'пробный',
  'давно не была':                'давно не была',
  'хожу иногда':                  'иногда',
  'хожу регулярно':               'регулярная',
};

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  formData: FormData;
  onAction: (msg: string) => void;
}

function EmptyState({ formData, onAction }: EmptyStateProps) {
  const [sending, setSending] = useState(false);

  const handleCreateRequest = async () => {
    setSending(true);
    try {
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
      // demo fallback
    } finally {
      setSending(false);
    }
    onAction('Запрос создан. Уведомим, когда появится подходящая подруга или мини-группа.');
  };

  return (
    <div className="matches-empty">
      <div className="matches-empty__icon">
        <Search size={26} strokeWidth={1.5} />
      </div>
      <div className="matches-empty__title">
        Пока нет идеального совпадения
      </div>
      <div className="matches-empty__subtitle">
        Мы можем собрать мини-группу под тебя — оставь запрос и уведомим,
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
          onClick={() => onAction('Напомним, когда появится подходящая группа.')}
        >
          Получить уведомление
        </button>
      </div>
    </div>
  );
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--ig-success)';
  if (score >= 65) return 'var(--ig-blue)';
  return 'var(--ig-muted)';
}

// ─── Single Match Card ────────────────────────────────────────────────────────

interface MatchCardProps {
  result:   MatchResult;
  index:    number;
  isBest:   boolean;
  onAction: (msg: string) => void;
}

function MatchCard({ result, index, isBest, onAction }: MatchCardProps) {
  const { request: r, score, reason } = result;

  // Club short key from club string like "Girls Crystal" → "crystal"
  const clubShort = r.club
    .replace('Girls ', '')
    .replace('Invictus Girls ', '')
    .toLowerCase();

  return (
    <article
      className={`match-card${isBest ? ' match-card--best' : ''}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Card header strip */}
      <div className="match-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className={`match-avatar ${r.isGroup ? 'match-avatar--group' : ''}`}>
            {r.initials}
          </div>
          <div>
            <div
              className="match-name"
              style={{ color: isBest ? 'var(--ig-white)' : 'var(--ig-black)' }}
            >
              {r.name}
            </div>
            <div className="match-club">
              <div
                className="match-club__brand"
                style={{ color: isBest ? 'rgba(255,255,255,0.35)' : undefined }}
              >
                invictus girls
              </div>
              <div
                className="match-club__name"
                style={{ color: isBest ? 'rgba(255,255,255,0.7)' : undefined }}
              >
                {clubShort}
              </div>
            </div>
          </div>
        </div>

        {/* Score + best badge */}
        <div style={{ textAlign: 'right' }}>
          {isBest && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 2,
            }}>
              best match
            </div>
          )}
          <div
            className="match-score-value"
            style={{ color: isBest ? 'var(--ig-white)' : scoreColor(score) }}
          >
            {score}%
          </div>
          <div
            className="match-score-label"
            style={{ color: isBest ? 'rgba(255,255,255,0.4)' : undefined }}
          >
            совпадение
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="match-card__body">
        {/* Meta row */}
        <div className="match-meta" style={{ marginBottom: 12 }}>
          <span>{r.ageRange} лет</span>
          <span className="match-dot" />
          <span>{r.day}</span>
          <span className="match-dot" />
          <span>{r.time}</span>
          <span className="match-dot" />
          <span>{r.program}</span>
        </div>

        {/* AI reason */}
        <div className="match-reason">
          <span className="match-reason__icon">✦</span>
          <span>{reason}</span>
        </div>

        {/* Why we matched */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 14,
        }}>
          <span className="badge badge--blue-pale">Один клуб</span>
          <span className="badge badge--outline">{r.level}</span>
          <span className="badge badge--outline">{r.goal}</span>
          <span className="badge badge--outline">{STATUS_SHORT[r.memberStatus]}</span>
          {r.isGroup && r.groupSize && (
            <span className="badge badge--dark">{r.groupSize} девушки</span>
          )}
        </div>

        {/* Privacy micro */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--ig-muted)',
          letterSpacing: '0.04em',
          marginBottom: 14,
        }}>
          Контакты откроются только после взаимного согласия.
        </div>

        {/* Actions */}
        <div className="match-card__actions">
          {r.isGroup ? (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => onAction('Ты в группе! Увидимся на тренировке.')}
            >
              Присоединиться
            </button>
          ) : (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => onAction('Запись оформлена! Ждём вас обеих.')}
            >
              Записаться вместе
            </button>
          )}
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => onAction('Напомним за 2 часа до тренировки.')}
          >
            Напоминание
          </button>
        </div>
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
            ? `${matches.length} ${plural(matches.length, 'матч', 'матча', 'матчей')} найдено`
            : 'Матчи не найдены'}
        </div>
        <div className="matches-subtitle">
          {[formData.program, formData.timeSlot, formData.city].filter(Boolean).join(' · ')}
        </div>
      </div>

      {hasResults ? (
        <div className="matches-list">
          {matches.map((m, i) => (
            <MatchCard
              key={m.request.id}
              result={m}
              index={i}
              isBest={i === 0}
              onAction={onAction}
            />
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
