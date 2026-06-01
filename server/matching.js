'use strict';
// ─── matching.js — Server-side buddy scoring engine ───────────────────────────
//
// Scoring model (max 100):
//   Club          +30  — обязательное условие (порог отсечения)
//   Program       +20  — "Не знаю, подберите мне" засчитывает баллы с любой программой
//   TimeSlot      +15
//   CompatAge     +10  — та же возрастная группа (+10), соседняя (+5)
//   Level         +10
//   Goal          + 5
//   MemberStatus  + 5
//   Format        + 5  — "без разницы" засчитывает баллы с любым форматом

const WEIGHTS = {
  club:         30,
  program:      20,
  timeSlot:     15,
  ageRange:     10,
  level:        10,
  goal:          5,
  memberStatus:  5,
  format:        5,
};

// Порядок возрастных диапазонов для определения «соседних» групп
const AGE_ORDER = ['16–20', '21–25', '26–30', '31–35', '36–40', '40–50', '50+'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageScore(a, b) {
  if (!a || !b)    return 0;
  if (a === b)     return WEIGHTS.ageRange;
  const ia = AGE_ORDER.indexOf(a);
  const ib = AGE_ORDER.indexOf(b);
  if (ia === -1 || ib === -1) return 0;
  return Math.abs(ia - ib) === 1 ? Math.floor(WEIGHTS.ageRange / 2) : 0; // соседняя → +5
}

function timeLabel(slot) {
  if (!slot)                      return '';
  if (slot.startsWith('Утро'))     return 'утром';
  if (slot.startsWith('День'))     return 'днём';
  if (slot.startsWith('Вечер'))    return 'вечером';
  if (slot.startsWith('Выходные')) return 'в выходные';
  return slot;
}

function statusPhrase(s) {
  if (s === 'давно не была')                return 'обе возвращаетесь';
  if (s === 'впервые иду в Invictus Girls') return 'обе приходите впервые';
  if (s === 'купила пробный доступ')        return 'обе на пробном';
  return '';
}

// ─── Score ────────────────────────────────────────────────────────────────────

function computeScore(user, candidate) {
  let score = 0;

  if (user.club === candidate.club) score += WEIGHTS.club;

  // "Не знаю, подберите мне" → принимаем любую программу из пула
  if (!user.program || user.program === 'Не знаю, подберите мне' || user.program === candidate.program)
    score += WEIGHTS.program;

  if (user.timeSlot && user.timeSlot === candidate.timeSlot)
    score += WEIGHTS.timeSlot;

  score += ageScore(user.ageRange, candidate.ageRange);

  if (user.level && user.level === candidate.level) score += WEIGHTS.level;
  if (user.goal  && user.goal  === candidate.goal)  score += WEIGHTS.goal;

  if (user.memberStatus && user.memberStatus === candidate.memberStatus)
    score += WEIGHTS.memberStatus;

  // "без разницы" → принимаем любой формат из пула
  if (!user.format || user.format === 'без разницы' || user.format === candidate.format)
    score += WEIGHTS.format;

  return score;
}

// ─── Reason ───────────────────────────────────────────────────────────────────

function buildReason(user, buddy) {
  const unknownProg = !user.program || user.program === 'Не знаю, подберите мне';
  const prog   = !unknownProg && user.program === buddy.program;
  const time   = user.timeSlot     === buddy.timeSlot;
  const lvl    = user.level         === buddy.level;
  const goal   = user.goal          === buddy.goal;
  const status = user.memberStatus  === buddy.memberStatus;

  // Случай «не знаю программу»
  if (unknownProg) {
    if (time && goal) return `Подберём ${buddy.program} — совпадает время ${timeLabel(buddy.timeSlot)} и цель «${buddy.goal}»`;
    if (goal && lvl)  return `${buddy.program} подходит под цель «${buddy.goal}» и уровень ${buddy.level}`;
    if (time)         return `${buddy.program} ${timeLabel(buddy.timeSlot)} — попробуем вместе`;
    return `${buddy.program} в ${buddy.club} — хорошее начало`;
  }

  // Три совпадения
  if (prog && time && goal)  return `Вы обе хотите ${buddy.program} ${timeLabel(buddy.timeSlot)} с целью «${buddy.goal}»`;
  if (prog && time && lvl)   return `Одна программа, одно время, одинаковый уровень — идеальный матч`;
  if (prog && lvl  && goal)  return `${buddy.program} для «${buddy.goal}» на уровне ${buddy.level} — три совпадения`;

  // Два совпадения
  if (prog && time)  return `Вы обе хотите ${buddy.program} ${timeLabel(buddy.timeSlot)} в ${buddy.club}`;
  if (prog && goal)  return `Одна программа и цель — ${buddy.program} для «${buddy.goal}»`;
  if (prog && lvl)   return `${buddy.program} на уровне «${buddy.level}» — синхронизируетесь без дискомфорта`;
  if (time && goal)  return `Похожая цель «${buddy.goal}» и время — ${timeLabel(buddy.timeSlot)}`;
  if (lvl  && goal)  return `Похожий уровень и цель — ${buddy.level} / «${buddy.goal}». Комфортный старт`;

  // С учётом статуса
  if (prog && status) {
    const hint = statusPhrase(buddy.memberStatus);
    return `Обе выбрали ${buddy.program}${hint ? ` — ${hint}` : ''} — хороший старт`;
  }

  // Одно совпадение
  if (prog)             return `Обе выбрали ${buddy.program} в ${buddy.club}`;
  if (buddy.isGroup)    return `Мини-группа в ${buddy.club} — легче начать вместе`;
  if (goal)             return `Общая цель «${buddy.goal}» — отличная основа для дуэта`;
  if (time)             return `Одинаковое время — ${timeLabel(buddy.timeSlot)} в ${buddy.club}`;

  // Только клуб (score = 30)
  return `Обе в ${buddy.club} — можем синхронизировать расписание`;
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function buildCta(buddy) {
  return buddy.isGroup ? 'Присоединиться' : 'Записаться вместе';
}

// ─── Main export ──────────────────────────────────────────────────────────────

function findMatches(user, pool) {
  return pool
    .map(buddy => ({
      id:             buddy.id,
      anonymizedName: buddy.anonymizedName,
      initials:       buddy.initials,
      club:           buddy.club,
      program:        buddy.program,
      timeSlot:       buddy.timeSlot,
      time:           buddy.time,
      day:            buddy.day,
      format:         buddy.format,
      level:          buddy.level,
      goal:           buddy.goal,
      ageRange:       buddy.ageRange,
      memberStatus:   buddy.memberStatus,
      isGroup:        buddy.isGroup,
      groupSize:      buddy.groupSize,
      score:          computeScore(user, buddy),
      reason:         buildReason(user, buddy),
      cta:            buildCta(buddy),
    }))
    .filter(m => m.score >= 30)           // минимум: тот же клуб
    .sort((a, b) => b.score - a.score)    // лучшие — первыми
    .slice(0, 5);
}

module.exports = { findMatches, computeScore };
