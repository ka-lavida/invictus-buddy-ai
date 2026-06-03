// ─── Invictus Buddy AI — AI layer ─────────────────────────────────────────────
// Provider-agnostic. The frontend calls same-origin /api/ai/* (served by the
// Vite middleware in scripts/ai-middleware.ts when an LLM key is configured).
// If no key / no network, every function degrades to a deterministic local
// generator so the demo always works offline and on stage.
//
// Wire a real model by setting OPENAI_API_KEY (or ANTHROPIC_API_KEY) in .env —
// see .env.example. The key stays server-side; it never reaches the browser.

import type { FormData, BuddyRequest } from '../data/mockData';
import { CLUB_PROGRAMS, GIRLS_PROGRAMS, getClubByKey } from '../data/girlsData';

const AI_BASE = import.meta.env.VITE_AI_URL ?? '';

async function tryRemote<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${AI_BASE}/api/ai/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Fail fast so the deterministic fallback feels instant.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeLabel(slot: string): string {
  if (slot.startsWith('Утро'))     return 'утром';
  if (slot.startsWith('День'))     return 'днём';
  if (slot.startsWith('Вечер'))    return 'вечером';
  if (slot.startsWith('Выходные')) return 'в выходные';
  return slot.toLowerCase();
}

function statusPhrase(s: string): string {
  if (s === 'давно не была')                return 'обе возвращаетесь после паузы';
  if (s === 'впервые иду в Invictus Girls')  return 'обе впервые в зале';
  if (s === 'купила пробный доступ')         return 'обе на пробном';
  return '';
}

// Shared attributes between the user and a candidate, as short human phrases.
function sharedTraits(user: FormData, buddy: BuddyRequest): string[] {
  const t: string[] = [];
  if (user.level && user.level === buddy.level)         t.push(`уровень «${buddy.level}»`);
  if (user.goal && user.goal === buddy.goal)            t.push(`цель «${buddy.goal}»`);
  if (user.timeSlot && user.timeSlot === buddy.timeSlot) t.push(`тренируетесь ${timeLabel(buddy.timeSlot)}`);
  if (user.memberStatus === buddy.memberStatus) {
    const p = statusPhrase(buddy.memberStatus);
    if (p) t.push(p);
  }
  return t;
}

// ─── 1. Match explanation ─────────────────────────────────────────────────────

export function localExplain(user: FormData, buddy: BuddyRequest): string {
  const traits = sharedTraits(user, buddy);
  const prog = buddy.program;

  if (traits.length >= 2) {
    return `Вы подходите: ${traits.slice(0, 3).join(', ')}. ${prog} — отличный повод начать вместе.`;
  }
  if (traits.length === 1) {
    return `Вы подходите — ${traits[0]}. Вместе на ${prog} будет легче не бросить.`;
  }
  if (buddy.isGroup) {
    return `Мини-группа на ${prog} в одном с тобой клубе — поддержка с первого занятия.`;
  }
  return `Один клуб и ${prog} — можно синхронизировать расписание и ходить вместе.`;
}

/** Returns a warmer, LLM-written explanation when a key is wired; else the local one. */
export async function explainMatch(user: FormData, buddy: BuddyRequest): Promise<string> {
  const remote = await tryRemote<{ text?: string }>('explain', {
    user:  { level: user.level, goal: user.goal, timeSlot: user.timeSlot, memberStatus: user.memberStatus, format: user.format },
    buddy: { name: buddy.name, program: buddy.program, level: buddy.level, goal: buddy.goal, timeSlot: buddy.timeSlot, memberStatus: buddy.memberStatus, isGroup: buddy.isGroup },
  });
  const text = remote?.text?.trim();
  return text && text.length > 0 ? text : localExplain(user, buddy);
}

// ─── 2. Icebreakers (first-message suggestions) ────────────────────────────────

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

// First-person, singular self-intro (grammatical inside "Привет! …").
function selfIntro(status: string): string {
  if (status === 'давно не была')                return 'я тоже давно не была';
  if (status === 'впервые иду в Invictus Girls')  return 'я первый раз иду';
  if (status === 'купила пробный доступ')         return 'я сейчас на пробном';
  return 'я только начинаю';
}

export function localIcebreakers(buddy: BuddyRequest): string[] {
  const prog = buddy.program;
  const goal = buddy.goal;
  const tl   = buddy.timeSlot ? timeLabel(buddy.timeSlot) : 'на неделе';
  // Group entries have names like "Группа Stretching" — don't address them by a first name.
  const greeting = buddy.isGroup ? 'Привет всем!' : `Привет, ${buddy.name.split(' ')[0]}!`;

  return [
    `${greeting} Тоже на ${prog}? Давай вместе — вдвоём не так страшно начать 😊`,
    `Привет! У нас общая цель — «${goal}». Может, возьмём ${prog} ${tl} вместе?`,
    `Привет! ${capitalize(selfIntro(buddy.memberStatus))} — будем поддерживать друг друга на ${prog}?`,
  ];
}

/** Returns 3 LLM-written openers when a key is wired; else 3 local ones. */
export async function suggestIcebreakers(user: FormData, buddy: BuddyRequest): Promise<string[]> {
  const remote = await tryRemote<{ messages?: string[] }>('icebreakers', {
    user:  { goal: user.goal, level: user.level, memberStatus: user.memberStatus },
    buddy: { name: buddy.name, program: buddy.program, goal: buddy.goal, timeSlot: buddy.timeSlot, isGroup: buddy.isGroup },
  });
  const msgs = remote?.messages?.filter(m => typeof m === 'string' && m.trim().length > 0);
  return (msgs && msgs.length ? msgs : localIcebreakers(buddy)).slice(0, 3);
}

// ─── 3. AI program recommendation (wizard step + "Не знаю" + empty state) ──────

export interface ProgramPick { key: string; reason: string; }

export interface RecChoices {
  goal: string; level: string; format: string;
  memberStatus: string; ageRange: string; club: string;
}

export interface EligibleProgram {
  key: string; name: string; description: string; level: string; goals: string[];
}

/**
 * AI-ranked program shortlist with a personalized reason each. The model ranks
 * and explains; the hard constraints (club availability, level gate) are applied
 * by the caller via `eligible`, and we validate AI output against those keys so a
 * hallucinated program can never slip through. Returns null → caller falls back
 * to its deterministic split.
 */
export async function recommendPrograms(
  choices: RecChoices,
  eligible: EligibleProgram[],
): Promise<ProgramPick[] | null> {
  if (!eligible.length) return null;
  const remote = await tryRemote<{ recommendations?: ProgramPick[] }>('recommend-programs', { choices, eligible });
  if (!remote?.recommendations) return null;

  const valid = new Set(eligible.map(p => p.key));
  const seen = new Set<string>();
  const picks = remote.recommendations.filter(r =>
    r && typeof r.key === 'string' && valid.has(r.key) &&
    typeof r.reason === 'string' && r.reason.trim().length > 0 &&
    !seen.has(r.key) && seen.add(r.key),
  );
  return picks.length ? picks : null;
}

// ─── 4. Group class to join while a match is pending (smart empty state) ───────

const BEGINNER_FRIENDLY = ['yoga', 'stretching', 'pilates', 'barre'];

export interface GroupClassSuggestion {
  name:  string;
  when:  string;
  club:  string;
  why:   string;
}

export function suggestGroupClass(user: FormData): GroupClassSuggestion {
  const clubKey = user.clubKey || '';
  const available = CLUB_PROGRAMS[clubKey] ?? [];
  const pick =
    BEGINNER_FRIENDLY.find(k => available.includes(k)) ??
    available[0] ??
    'yoga';
  const prog = GIRLS_PROGRAMS.find(p => p.key === pick);
  const club = getClubByKey(clubKey);

  return {
    name: prog?.name ?? 'Yoga',
    when: 'ближайшая суббота, 11:00',
    club: club?.label ?? user.city ?? 'твой клуб',
    why:  'Групповые занятия — самый простой способ познакомиться вживую, пока мы подбираем тебе пару.',
  };
}

// ─── 4. Referral / invite-a-friend bonus ───────────────────────────────────────

export interface ReferralOffer {
  bonus: string;
  code:  string;
  link:  string;
}

const BONUSES = [
  'заморозка абонемента на 7 дней',
  '2 бесплатных посещения',
  'скидка 15% на продление',
];

export function makeReferralOffer(user: FormData): ReferralOffer {
  // Deterministic-ish, human-readable code from the club + a short random tail.
  const clubTag = (user.clubKey || 'IG').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'IG';
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  const code = `${clubTag}-${tail}`;
  return {
    bonus: BONUSES[0],
    code,
    link:  `https://invictus.kz/girls/buddy?ref=${code}`,
  };
}
