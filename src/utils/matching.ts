// ─── Invictus Buddy AI — Matching Engine ──────────────────────────────────────
//
// Scoring model (max 100 points):
//   Club         +40  — обязательное условие (порог 40)
//   Program      +25  — "Не знаю, подберите мне" засчитывает очки с любой программой
//   TimeSlot     +15
//   Level        +10
//   Goal          +5
//   Format        +5  — "без разницы" засчитывает очки с любым форматом
//
// Rules:
//   • score < 40 → не показываем (разные клубы)
//   • сортировка по score desc
//   • максимум 5 матчей

import type { FormData, BuddyRequest } from '../data/mockData';

export interface MatchResult {
  request: BuddyRequest;
  score:   number;
  reason:  string;
}

// ─── Score ────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  club:     40,
  program:  25,
  timeSlot: 15,
  level:    10,
  goal:      5,
  format:    5,
} as const;

function computeScore(user: FormData, buddy: BuddyRequest): number {
  let score = 0;
  if (user.club === buddy.club) score += WEIGHTS.club;

  // "Не знаю, подберите мне" → принимаем любую программу
  if (user.program === 'Не знаю, подберите мне' || user.program === buddy.program)
    score += WEIGHTS.program;

  if (user.timeSlot === buddy.timeSlot) score += WEIGHTS.timeSlot;
  if (user.level    === buddy.level)    score += WEIGHTS.level;
  if (user.goal     === buddy.goal)     score += WEIGHTS.goal;

  // "без разницы" → принимаем любой формат
  if (user.format === 'без разницы' || user.format === buddy.format)
    score += WEIGHTS.format;

  return score;
}

// ─── Reason generator ─────────────────────────────────────────────────────────

function buildReason(user: FormData, buddy: BuddyRequest): string {
  const unknownProg = user.program === 'Не знаю, подберите мне';
  const prog   = !unknownProg && user.program      === buddy.program;
  const time   = user.timeSlot     === buddy.timeSlot;
  const lvl    = user.level         === buddy.level;
  const goal   = user.goal          === buddy.goal;
  const status = user.memberStatus  === buddy.memberStatus;

  // ── Специальный случай: "Не знаю, подберите мне" ─────────────────────────
  if (unknownProg) {
    if (time && goal) return `Подберём ${buddy.program} — совпадает время ${timeLabel(buddy.timeSlot)} и цель «${buddy.goal}»`;
    if (goal && lvl)  return `${buddy.program} подойдёт под твою цель «${buddy.goal}» и уровень ${buddy.level}`;
    if (time)         return `${buddy.program} ${timeLabel(buddy.timeSlot)} — попробуй, подберём вместе`;
    return `${buddy.program} в ${buddy.club} — хорошее начало для твоей цели`;
  }

  // ── Три совпадения ────────────────────────────────────────────────────────
  if (prog && time && goal)  return `Вы обе хотите ${buddy.program} ${timeLabel(buddy.timeSlot)} — цель «${buddy.goal}» совпадает`;
  if (prog && time && lvl)   return `Одна программа, одно время, одинаковый уровень — идеальный матч`;
  if (prog && lvl  && goal)  return `${buddy.program} для «${buddy.goal}» на уровне ${buddy.level} — три совпадения из трёх`;

  // ── Два совпадения ────────────────────────────────────────────────────────
  if (prog && time) return `Вы обе хотите ${buddy.program} ${timeLabel(buddy.timeSlot)} в ${buddy.club}`;
  if (prog && goal) return `Одна программа и цель — ${buddy.program} для «${buddy.goal.toLowerCase()}»`;
  if (prog && lvl)  return `${buddy.program} на уровне «${buddy.level}» — синхронизируетесь без дискомфорта`;
  if (time && goal) return `Похожая цель «${buddy.goal}» и удобное время — ${timeLabel(buddy.timeSlot)}`;
  if (lvl  && goal) return `Похожий уровень и цель — ${buddy.level} / «${buddy.goal}». Комфортный старт`;

  // ── Дополнительный контекст через memberStatus ────────────────────────────
  if (prog && status) {
    const statusHint = statusPhrase(buddy.memberStatus);
    return `Обе выбрали ${buddy.program}${statusHint ? ` и ${statusHint}` : ''} — хороший старт`;
  }

  // ── Одно совпадение ───────────────────────────────────────────────────────
  if (prog) return `Обе выбрали ${buddy.program} в ${buddy.club}`;
  if (goal && buddy.isGroup) return `Мини-группа с целью «${buddy.goal.toLowerCase()}» — поддержка с первого дня`;
  if (buddy.isGroup)         return `Мини-группа в ${buddy.club} — легче начать вместе`;
  if (goal)                  return `Общая цель «${buddy.goal.toLowerCase()}» — отличная основа для дуэта`;
  if (time)                  return `Одинаковое удобное время — ${timeLabel(buddy.timeSlot)} в ${buddy.club}`;

  // ── Только клуб (score = 40) ──────────────────────────────────────────────
  return `Обе в ${buddy.club} — можем синхронизировать расписание`;
}

// Кратко: "Вечер (17–22)" → "вечером"
function timeLabel(slot: string): string {
  if (slot.startsWith('Утро'))     return 'утром';
  if (slot.startsWith('День'))     return 'днём';
  if (slot.startsWith('Вечер'))    return 'вечером';
  if (slot.startsWith('Выходные')) return 'в выходные';
  return slot.toLowerCase();
}

// Фраза для memberStatus в reason
function statusPhrase(s: string): string {
  if (s === 'давно не была')               return 'обе возвращаетесь';
  if (s === 'впервые иду в Invictus Girls') return 'обе приходите впервые';
  if (s === 'купила пробный доступ')        return 'обе на пробном';
  return '';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function findBuddyMatches(
  user: FormData,
  pool: BuddyRequest[],
): MatchResult[] {
  return pool
    .map((buddy) => ({
      request: buddy,
      score:   computeScore(user, buddy),
      reason:  buildReason(user, buddy),
    }))
    .filter((m) => m.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
