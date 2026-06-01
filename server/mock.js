'use strict';
// ─── mock.js — Fallback data when DWH is unavailable ─────────────────────────

// ─── Buddy pool (other users' active requests) ────────────────────────────────
const buddyPool = [
  // ── Girls Crystal ──────────────────────────────────────────────────────────
  { id: 'gc1',  anonymizedName: 'Аружан',            initials: 'АС', club: 'Girls Crystal', program: 'Barre',      timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Четверг',     format: 'с одной девушкой',        level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',                  isGroup: false },
  { id: 'gc2',  anonymizedName: 'Дана и Айя',        initials: '+2', club: 'Girls Crystal', program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '19:30', day: 'Пятница',     format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Ягодицы',           ageRange: '21–25', memberStatus: 'хожу иногда',                  isGroup: true,  groupSize: 2 },
  { id: 'gc3',  anonymizedName: 'Камила',             initials: 'КМ', club: 'Girls Crystal', program: 'Barre',      timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Среда',       format: 'с одной девушкой',        level: 'Новичок',   goal: 'Тонус',             ageRange: '21–25', memberStatus: 'купила пробный доступ',        isGroup: false },
  { id: 'gc4',  anonymizedName: 'Группа BootCamp',   initials: '+3', club: 'Girls Crystal', program: 'BootCamp',   timeSlot: 'Вечер (17–22)', time: '18:30', day: 'Вторник',     format: 'в мини-группе (3–5 чел.)', level: 'Уверенный', goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу регулярно',               isGroup: true,  groupSize: 3 },
  { id: 'gc5',  anonymizedName: 'Айгерим',            initials: 'АЖ', club: 'Girls Crystal', program: 'Yoga',       timeSlot: 'Утро (7–12)',   time: '8:00',  day: 'Суббота',     format: 'с одной девушкой',        level: 'Новичок',   goal: 'Растяжка',          ageRange: '16–20', memberStatus: 'впервые иду в Invictus Girls', isGroup: false },
  { id: 'gc6',  anonymizedName: 'Группа Stretching', initials: '+3', club: 'Girls Crystal', program: 'Stretching', timeSlot: 'Выходные',      time: '11:00', day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Растяжка',          ageRange: '31–35', memberStatus: 'давно не была',                isGroup: true,  groupSize: 3 },
  { id: 'gc7',  anonymizedName: 'Малика',             initials: 'МБ', club: 'Girls Crystal', program: 'Pilates',    timeSlot: 'День (12–17)',  time: '13:00', day: 'Понедельник', format: 'с одной девушкой',        level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',                  isGroup: false },
  { id: 'gc8',  anonymizedName: 'Диана',              initials: 'ДН', club: 'Girls Crystal', program: 'Glute Lab',  timeSlot: 'Утро (7–12)',   time: '7:30',  day: 'Среда',       format: 'с одной девушкой',        level: 'Новичок',   goal: 'Ягодицы',           ageRange: '21–25', memberStatus: 'купила пробный доступ',        isGroup: false },
  { id: 'gc9',  anonymizedName: 'Жансая',             initials: 'ЖС', club: 'Girls Crystal', program: 'Barre',      timeSlot: 'Вечер (17–22)', time: '20:00', day: 'Среда',       format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Вернуться в режим', ageRange: '26–30', memberStatus: 'давно не была',                isGroup: true,  groupSize: 2 },
  { id: 'gc10', anonymizedName: 'Томирис',            initials: 'ТА', club: 'Girls Crystal', program: 'BootCamp',   timeSlot: 'Утро (7–12)',   time: '7:00',  day: 'Понедельник', format: 'с одной девушкой',        level: 'Уверенный', goal: 'Похудение',         ageRange: '31–35', memberStatus: 'хожу регулярно',               isGroup: false },

  // ── Samal ──────────────────────────────────────────────────────────────────
  { id: 'sm1',  anonymizedName: 'Назерке',            initials: 'НА', club: 'Samal', program: 'Barre',      timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Среда',       format: 'с одной девушкой',        level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',           isGroup: false },
  { id: 'sm2',  anonymizedName: 'Группа Pilates',    initials: '+4', club: 'Samal', program: 'Pilates',    timeSlot: 'Выходные',      time: '10:00', day: 'Воскресенье', format: 'в мини-gruppе (3–5 чел.)', level: 'Средний',   goal: 'Вернуться в режим', ageRange: '31–35', memberStatus: 'давно не была',         isGroup: true,  groupSize: 4 },
  { id: 'sm3',  anonymizedName: 'Айдана',             initials: 'АТ', club: 'Samal', program: 'BootCamp',   timeSlot: 'Утро (7–12)',   time: '8:30',  day: 'Понедельник', format: 'с одной девушкой',        level: 'Уверенный', goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу регулярно',        isGroup: false },
  { id: 'sm4',  anonymizedName: 'Сания',              initials: 'СК', club: 'Samal', program: 'Stretching', timeSlot: 'Вечер (17–22)', time: '20:00', day: 'Пятница',     format: 'с одной девушкой',        level: 'Новичок',   goal: 'Растяжка',          ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: false },
  { id: 'sm5',  anonymizedName: 'Дильназ',            initials: 'ДИ', club: 'Samal', program: 'Glute Lab',  timeSlot: 'День (12–17)',  time: '14:30', day: 'Четверг',     format: 'с одной девушкой',        level: 'Средний',   goal: 'Ягодицы',           ageRange: '26–30', memberStatus: 'хожу иногда',           isGroup: false },

  // ── Gagarin ────────────────────────────────────────────────────────────────
  { id: 'gg1',  anonymizedName: 'Мадина',             initials: 'МА', club: 'Gagarin', program: 'Yoga',      timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Вторник',  format: 'с одной девушкой',        level: 'Новичок',   goal: 'Вернуться в режим', ageRange: '31–35', memberStatus: 'давно не была',         isGroup: false },
  { id: 'gg2',  anonymizedName: 'Группа Barre',      initials: '+3', club: 'Gagarin', program: 'Barre',     timeSlot: 'Вечер (17–22)', time: '19:30', day: 'Четверг',  format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу иногда',           isGroup: true,  groupSize: 3 },
  { id: 'gg3',  anonymizedName: 'Асем',               initials: 'АО', club: 'Gagarin', program: 'Glute Lab', timeSlot: 'День (12–17)',  time: '14:00', day: 'Среда',    format: 'с одной девушкой',        level: 'Средний',   goal: 'Ягодицы',           ageRange: '26–30', memberStatus: 'хожу иногда',           isGroup: false },
  { id: 'gg4',  anonymizedName: 'Гульнара',           initials: 'ГА', club: 'Gagarin', program: 'Stretching',timeSlot: 'Выходные',      time: '10:30', day: 'Суббота',  format: 'с одной девушкой',        level: 'Новичок',   goal: 'Растяжка',          ageRange: '36–40', memberStatus: 'хожу иногда',           isGroup: false },
  { id: 'gg5',  anonymizedName: 'Камила и Айгерим',  initials: '+2', club: 'Gagarin', program: 'Pilates',   timeSlot: 'Вечер (17–22)', time: '18:00', day: 'Среда',    format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Тонус',             ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: true,  groupSize: 2 },

  // ── Green Mall ─────────────────────────────────────────────────────────────
  { id: 'gm1',  anonymizedName: 'Группа Stretching', initials: '+4', club: 'Green Mall', program: 'Stretching',timeSlot: 'Выходные',      time: '11:00', day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Растяжка',          ageRange: '26–30', memberStatus: 'давно не была',         isGroup: true,  groupSize: 4 },
  { id: 'gm2',  anonymizedName: 'Алия',               initials: 'АС', club: 'Green Mall', program: 'Yoga',       timeSlot: 'Выходные',      time: '10:30', day: 'Воскресенье', format: 'с одной девушкой',        level: 'Новичок',   goal: 'Растяжка',          ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: false },
  { id: 'gm3',  anonymizedName: 'Бота',               initials: 'БА', club: 'Green Mall', program: 'BootCamp',   timeSlot: 'Вечер (17–22)', time: '18:00', day: 'Понедельник', format: 'с одной девушкой',        level: 'Уверенный', goal: 'Похудение',         ageRange: '31–35', memberStatus: 'хожу регулярно',        isGroup: false },
  { id: 'gm4',  anonymizedName: 'Группа Pilates',    initials: '+3', club: 'Green Mall', program: 'Pilates',    timeSlot: 'Утро (7–12)',   time: '9:30',  day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',           isGroup: true,  groupSize: 3 },
  { id: 'gm5',  anonymizedName: 'Зарина',             initials: 'ЗА', club: 'Green Mall', program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Вторник',     format: 'с одной девушкой',        level: 'Средний',   goal: 'Ягодицы',           ageRange: '26–30', memberStatus: 'хожу иногда',           isGroup: false },
  { id: 'gm6',  anonymizedName: 'Меруерт',            initials: 'МС', club: 'Green Mall', program: 'Barre',      timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Пятница',     format: 'с одной девушкой',        level: 'Средний',   goal: 'Вернуться в режим', ageRange: '36–40', memberStatus: 'давно не была',         isGroup: false },
];

// ─── Admin metrics ────────────────────────────────────────────────────────────
const adminMetrics = {
  totalRequests:  247,
  matchesFound:   189,
  bookedTogether: 134,
  attended:       98,
  conversionRate: 73.1,
};

// ─── Funnel breakdown ─────────────────────────────────────────────────────────
const funnelData = [
  { stage: 'Запросы на buddy',     count: 247, pct: 100.0 },
  { stage: 'Матчи найдены',        count: 189, pct: 76.5  },
  { stage: 'Записались вместе',    count: 134, pct: 54.3  },
  { stage: 'Пришли на тренировку', count: 98,  pct: 39.7  },
];

// ─── Weekly trend ─────────────────────────────────────────────────────────────
const weeklyTrend = [
  { day: 'Пн', requests: 28, matches: 21 },
  { day: 'Вт', requests: 32, matches: 26 },
  { day: 'Ср', requests: 41, matches: 33 },
  { day: 'Чт', requests: 38, matches: 29 },
  { day: 'Пт', requests: 52, matches: 43 },
  { day: 'Сб', requests: 35, matches: 28 },
  { day: 'Вс', requests: 21, matches: 17 },
];

module.exports = { buddyPool, adminMetrics, funnelData, weeklyTrend };
