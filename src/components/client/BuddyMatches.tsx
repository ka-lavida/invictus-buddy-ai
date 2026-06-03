import { useState, useEffect } from 'react';
import { Search, Calendar, Bell, Sparkles, Send, Repeat } from 'lucide-react';
import type { MatchResult } from '../../utils/matching';
import type { FormData, MemberStatus, BuddyRequest } from '../../data/mockData';
import { api } from '../../utils/api';
import { suggestIcebreakers, explainMatch, suggestGroupClass, recommendPrograms } from '../../utils/ai';
import { getEligiblePrograms } from '../../data/girlsData';
import { InviteFriend } from './InviteFriend';

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
  const base = suggestGroupClass(formData);
  const [klass, setKlass] = useState<{ name: string; club: string; when: string; aiWhy?: string }>(
    { name: base.name, club: base.club, when: base.when },
  );

  // AI personalizes which class to join while waiting; falls back to the base pick.
  useEffect(() => {
    let alive = true;
    const eligible = getEligiblePrograms(formData.clubKey, formData.level);
    if (!eligible.length) return;
    recommendPrograms(
      { goal: formData.goal, level: formData.level, format: formData.format, memberStatus: formData.memberStatus, ageRange: formData.ageRange, club: formData.clubKey },
      eligible.map(p => ({ key: p.key, name: p.name, description: p.description, level: p.level, goals: p.goals })),
    ).then(picks => {
      if (!alive || !picks || !picks.length) return;
      const top = eligible.find(p => p.key === picks[0].key);
      if (top) setKlass({ name: top.name, club: base.club, when: base.when, aiWhy: picks[0].reason });
    });
    return () => { alive = false; };
  }, []);

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
        Пока подбираем тебе пару
      </div>
      <div className="matches-empty__subtitle">
        Не нужно ждать в одиночку. Запишись на групповую — там легко познакомиться вживую,
        а мы напишем, как только появится подходящая подруга в твоём клубе.
      </div>

      {/* Meanwhile — join a group class to meet people now */}
      <div className="meanwhile-card">
        <div className="meanwhile-card__icon"><Calendar size={18} strokeWidth={2} /></div>
        <div className="meanwhile-card__body">
          <div className="meanwhile-card__label">Пока ищем — познакомься на групповой</div>
          <div className="meanwhile-card__name">{klass.name}</div>
          <div className="meanwhile-card__meta">{klass.club} · {klass.when}</div>
          {klass.aiWhy && <div className="meanwhile-card__why">✦ {klass.aiWhy}</div>}
        </div>
        <button
          className="btn btn--white btn--sm"
          onClick={() => onAction(`Записали на ${klass.name}. Познакомишься там вживую!`)}
        >
          Записаться
        </button>
      </div>

      <div className="matches-empty__actions">
        <button
          className="btn btn--primary"
          onClick={handleCreateRequest}
          disabled={sending}
          style={{ opacity: sending ? 0.7 : 1 }}
        >
          {sending ? 'Создаём…' : 'Создать запрос на пару'}
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => onAction('Уведомим, когда появится подходящая подруга.')}
        >
          <Bell size={14} strokeWidth={2} /> Уведомить меня
        </button>
      </div>

      {/* Thin pool → invite your own friend for a bonus */}
      <div style={{ marginTop: 18, textAlign: 'left' }}>
        <InviteFriend formData={formData} onAction={onAction} tone="thin" />
      </div>
    </div>
  );
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#5BD0A0';            // brighter green for dark bg
  if (score >= 65) return 'var(--ig-blue-soft)';
  return 'rgba(255,255,255,0.55)';
}

// ─── Single Match Card ────────────────────────────────────────────────────────

interface MatchCardProps {
  result:   MatchResult;
  index:    number;
  isBest:   boolean;
  user:     FormData;
  onAction: (msg: string) => void;
}

function MatchCard({ result, index, isBest, user, onAction }: MatchCardProps) {
  const { request: r, score, reason } = result;

  const [aiReason, setAiReason]   = useState(reason);
  const [showIce, setShowIce]     = useState(false);
  const [iceLoading, setIceLoading] = useState(false);
  const [ice, setIce]             = useState<string[]>([]);
  const [booked, setBooked]       = useState(false);
  const [repeat, setRepeat]       = useState(false);

  // Upgrade every match's explanation via the AI layer (warmer, LLM-written when
  // a key is wired; otherwise the deterministic reason stays).
  useEffect(() => {
    let alive = true;
    explainMatch(user, r as BuddyRequest).then(t => { if (alive && t) setAiReason(t); });
    return () => { alive = false; };
  }, [user, r]);

  const openIcebreakers = async () => {
    setShowIce(v => !v);
    if (ice.length || iceLoading) return;
    setIceLoading(true);
    const msgs = await suggestIcebreakers(user, r as BuddyRequest);
    setIce(msgs);
    setIceLoading(false);
  };

  const sendIcebreaker = () => {
    setShowIce(false);
    onAction(`Сообщение отправлено — ${r.name.split(' ')[0]} получит уведомление. Удачи!`);
  };

  const book = () => {
    setBooked(true);
    onAction(r.isGroup ? 'Ты в группе! Увидимся на тренировке.' : 'Запись оформлена! Ждём вас обеих.');
  };

  const bookRepeat = () => {
    setRepeat(true);
    onAction('Записали вас обеих и на следующую неделю — так и формируется привычка 💪');
  };

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
            <div className="match-name">
              {r.name}
            </div>
            <div className="match-club">
              <div className="match-club__brand">
                invictus girls
              </div>
              <div className="match-club__name">
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
              color: 'var(--ig-rose)',
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
          <div className="match-score-label">
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
          <span>{aiReason}</span>
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
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.04em',
          marginBottom: 14,
        }}>
          Контакты откроются только после взаимного согласия.
        </div>

        {/* Actions */}
        <div className="match-card__actions">
          {booked ? (
            <span className="match-booked">✓ {r.isGroup ? 'Ты в группе' : 'Записаны вместе'}</span>
          ) : (
            <button className="btn btn--primary btn--sm" onClick={book}>
              {r.isGroup ? 'Присоединиться' : 'Записаться вместе'}
            </button>
          )}
          <button
            className="btn btn--ghost btn--sm icebreaker-btn"
            onClick={openIcebreakers}
            aria-expanded={showIce}
          >
            <Sparkles size={13} strokeWidth={2} /> С чего начать
          </button>
          {!booked && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => onAction('Напомним за 2 часа до тренировки.')}
            >
              Напоминание
            </button>
          )}
        </div>

        {/* Repeat-together — turn a good first session into a habit */}
        {booked && (
          <div className="habit-prompt">
            {repeat ? (
              <div className="habit-prompt__done">✓ Закрепили на следующей неделе — так и рождается привычка 💪</div>
            ) : (
              <>
                <div className="habit-prompt__text">
                  Понравилось? Сделайте это <strong>привычкой</strong> — запишитесь вдвоём и на следующей неделе.
                </div>
                <button className="btn btn--white btn--sm" onClick={bookRepeat}>
                  <Repeat size={13} strokeWidth={2} /> И на след. неделю
                </button>
              </>
            )}
          </div>
        )}

        {/* Icebreaker panel — AI-suggested first messages */}
        {showIce && (
          <div className="icebreakers">
            <div className="icebreakers__label">
              <Sparkles size={11} strokeWidth={2} /> Подскажем, с чего начать переписку
            </div>
            {iceLoading ? (
              <div className="icebreakers__loading">Подбираем варианты…</div>
            ) : (
              ice.map((msg, i) => (
                <button key={i} className="icebreaker-option" onClick={sendIcebreaker}>
                  <span>{msg}</span>
                  <Send size={13} strokeWidth={2} className="icebreaker-option__send" />
                </button>
              ))
            )}
          </div>
        )}
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
      <div className="matches-inner">
      <div className="matches-header">
        <div className="matches-title">
          {hasResults ? (
            <>
              <span style={{ fontFamily: 'var(--font-numeric)' }}>{matches.length}</span>
              {' '}{plural(matches.length, 'матч', 'матча', 'матчей')} найдено
            </>
          ) : (
            'Матчи не найдены'
          )}
        </div>
        <div className="matches-subtitle">
          {[formData.program, formData.timeSlot, formData.city].filter(Boolean).join(' · ')}
        </div>
      </div>

      {hasResults ? (
        <>
          <div className="matches-list">
            {matches.map((m, i) => (
              <MatchCard
                key={m.request.id}
                result={m}
                index={i}
                isBest={i === 0}
                user={formData}
                onAction={onAction}
              />
            ))}
          </div>
          {/* Confidence moment — invite a friend for a bonus */}
          <div style={{ marginTop: 16 }}>
            <InviteFriend formData={formData} onAction={onAction} />
          </div>
        </>
      ) : (
        <EmptyState formData={formData} onAction={onAction} />
      )}

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button className="btn btn--ghost btn--sm" onClick={onReset}>
          Изменить параметры
        </button>
      </div>
      </div>
    </section>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}
