// ─── Invictus Buddy AI — Mock Data ───────────────────────────────────────────

// ─── Form option constants ────────────────────────────────────────────────────

export const CLUBS = ['Crystal', 'Tole bi', 'Orynbor', 'Kunaeva', 'Sfera', 'Karaganda'] as const;

// Pool-buddies have a specific program; user can also pick "Не знаю"
export const PROGRAM_CLASSES = ['Barre', 'Glute Lab', 'BootCamp', 'Stretching', 'Yoga', 'Pilates'] as const;
export const PROGRAMS        = [...PROGRAM_CLASSES, 'Не знаю, подберите мне'] as const;

export const TIME_SLOTS = ['Утро (7–12)', 'День (12–17)', 'Вечер (17–22)', 'Выходные'] as const;

// Pool-buddies have a specific format; user can also pick "без разницы"
export const POOL_FORMATS = ['с одной девушкой', 'в мини-группе (3–5 чел.)'] as const;
export const FORMATS      = [...POOL_FORMATS, 'без разницы'] as const;

export const LEVELS   = ['Новичок', 'Средний', 'Уверенный'] as const;
export const GOALS    = ['Похудение', 'Тонус', 'Ягодицы', 'Растяжка', 'Вернуться в режим', 'Просто начать'] as const;
export const AGE_RANGES = ['16–20', '21–25', '26–30', '31–35', '36–40', '40–50', '50+'] as const;
export const MEMBER_STATUSES = [
  'впервые иду в Invictus Girls',
  'купила пробный доступ',
  'давно не была',
  'хожу иногда',
  'хожу регулярно',
] as const;

// ─── Derived types ────────────────────────────────────────────────────────────

export type Club         = typeof CLUBS[number];
export type ProgramClass = typeof PROGRAM_CLASSES[number];
export type Program      = typeof PROGRAMS[number];
export type TimeSlot     = typeof TIME_SLOTS[number];
export type PoolFormat   = typeof POOL_FORMATS[number];
export type Format       = typeof FORMATS[number];
export type Level        = typeof LEVELS[number];
export type Goal         = typeof GOALS[number];
export type AgeRange     = typeof AGE_RANGES[number];
export type MemberStatus = typeof MEMBER_STATUSES[number];

// ─── Form shape ───────────────────────────────────────────────────────────────

export interface FormData {
  city:         string;       // display-only (e.g. 'Алматы')
  clubKey:      string;       // display-only club key (e.g. 'Crystal')
  club:         Club         | '';  // matchName for engine (e.g. 'Girls Crystal')
  program:      Program      | '';
  timeSlot:     TimeSlot     | '';
  format:       Format       | '';
  level:        Level        | '';
  goal:         Goal         | '';
  ageRange:     AgeRange     | '';
  memberStatus: MemberStatus | '';
}

export const defaultFormData: FormData = {
  city: '', clubKey: '', club: '', program: '', timeSlot: '',
  format: '', level: '', goal: '', ageRange: '', memberStatus: '',
};

// ─── Buddy Request Pool ───────────────────────────────────────────────────────
// Пул запросов других пользователей — источник для matching engine.

export interface BuddyRequest {
  id:           string;
  name:         string;
  initials:     string;
  club:         Club;
  program:      ProgramClass; // specific class (no "Не знаю")
  timeSlot:     TimeSlot;     // category for matching
  time:         string;       // specific time for display
  day:          string;       // day for display
  format:       PoolFormat;   // specific format (no "без разницы")
  level:        Level;
  goal:         Goal;
  ageRange:     AgeRange;
  memberStatus: MemberStatus;
  isGroup:      boolean;
  groupSize?:   number;
}

export const buddyPool: BuddyRequest[] = [
  // ── Crystal (Алматы) ──────────────────────────────────────────────────────
  { id: 'gc1',  name: 'Аружан',            initials: 'АС', club: 'Crystal',   program: 'BootCamp',   timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Четверг',     format: 'с одной девушкой',         level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',                  isGroup: false },
  { id: 'gc2',  name: 'Дана и Айя',        initials: '+2', club: 'Crystal',   program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '19:30', day: 'Пятница',     format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Ягодицы',           ageRange: '21–25', memberStatus: 'хожу иногда',                  isGroup: true,  groupSize: 2 },
  { id: 'gc3',  name: 'Камила',            initials: 'КМ', club: 'Crystal',   program: 'BootCamp',   timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Среда',       format: 'с одной девушкой',         level: 'Новичок',   goal: 'Тонус',             ageRange: '21–25', memberStatus: 'купила пробный доступ',        isGroup: false },
  { id: 'gc4',  name: 'Группа BootCamp',   initials: '+3', club: 'Crystal',   program: 'BootCamp',   timeSlot: 'Вечер (17–22)', time: '18:30', day: 'Вторник',     format: 'в мини-группе (3–5 чел.)', level: 'Уверенный', goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу регулярно',               isGroup: true,  groupSize: 3 },
  { id: 'gc5',  name: 'Айгерим',           initials: 'АЖ', club: 'Crystal',   program: 'Yoga',       timeSlot: 'Утро (7–12)',   time: '8:00',  day: 'Суббота',     format: 'с одной девушкой',         level: 'Новичок',   goal: 'Растяжка',          ageRange: '16–20', memberStatus: 'впервые иду в Invictus Girls', isGroup: false },
  { id: 'gc6',  name: 'Группа Stretching', initials: '+3', club: 'Crystal',   program: 'Stretching', timeSlot: 'Выходные',      time: '11:00', day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Растяжка',          ageRange: '31–35', memberStatus: 'давно не была',                isGroup: true,  groupSize: 3 },
  { id: 'gc7',  name: 'Малика',            initials: 'МБ', club: 'Crystal',   program: 'Pilates',    timeSlot: 'День (12–17)',  time: '13:00', day: 'Понедельник', format: 'с одной девушкой',         level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',                  isGroup: false },
  { id: 'gc8',  name: 'Диана',             initials: 'ДН', club: 'Crystal',   program: 'Glute Lab',  timeSlot: 'Утро (7–12)',   time: '7:30',  day: 'Среда',       format: 'с одной девушкой',         level: 'Новичок',   goal: 'Ягодицы',           ageRange: '21–25', memberStatus: 'купила пробный доступ',        isGroup: false },
  { id: 'gc9',  name: 'Жансая',            initials: 'ЖС', club: 'Crystal',   program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '20:00', day: 'Среда',       format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Вернуться в режим', ageRange: '26–30', memberStatus: 'давно не была',                isGroup: true,  groupSize: 2 },
  { id: 'gc10', name: 'Томирис',           initials: 'ТА', club: 'Crystal',   program: 'BootCamp',   timeSlot: 'Утро (7–12)',   time: '7:00',  day: 'Понедельник', format: 'с одной девушкой',         level: 'Уверенный', goal: 'Похудение',         ageRange: '31–35', memberStatus: 'хожу регулярно',               isGroup: false },

  // ── Tole bi (Астана) ──────────────────────────────────────────────────────
  { id: 'tb1',  name: 'Назерке',           initials: 'НА', club: 'Tole bi',   program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Среда',       format: 'с одной девушкой',         level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: false },
  { id: 'tb2',  name: 'Бота',              initials: 'БА', club: 'Tole bi',   program: 'BootCamp',   timeSlot: 'Вечер (17–22)', time: '18:00', day: 'Понедельник', format: 'с одной девушкой',         level: 'Уверенный', goal: 'Похудение',         ageRange: '31–35', memberStatus: 'хожу регулярно',       isGroup: false },
  { id: 'tb3',  name: 'Группа Glute Lab',  initials: '+3', club: 'Tole bi',   program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '19:30', day: 'Четверг',     format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Ягодицы',           ageRange: '21–25', memberStatus: 'хожу иногда',          isGroup: true,  groupSize: 3 },
  { id: 'tb4',  name: 'Айдана',            initials: 'АТ', club: 'Tole bi',   program: 'BootCamp',   timeSlot: 'Утро (7–12)',   time: '8:30',  day: 'Понедельник', format: 'с одной девушкой',         level: 'Уверенный', goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу регулярно',       isGroup: false },

  // ── Orynbor (Астана) ──────────────────────────────────────────────────────
  { id: 'or1',  name: 'Сания',             initials: 'СК', club: 'Orynbor',   program: 'Stretching', timeSlot: 'Вечер (17–22)', time: '20:00', day: 'Пятница',     format: 'с одной девушкой',         level: 'Новичок',   goal: 'Растяжка',          ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: false },
  { id: 'or2',  name: 'Группа Stretching', initials: '+4', club: 'Orynbor',   program: 'Stretching', timeSlot: 'Выходные',      time: '11:00', day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Растяжка',          ageRange: '26–30', memberStatus: 'давно не была',        isGroup: true,  groupSize: 4 },
  { id: 'or3',  name: 'Жулдыз',            initials: 'ЖТ', club: 'Orynbor',   program: 'BootCamp',   timeSlot: 'Утро (7–12)',   time: '8:30',  day: 'Вторник',     format: 'с одной девушкой',         level: 'Средний',   goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: false },
  { id: 'or4',  name: 'Группа Pilates',    initials: '+3', club: 'Orynbor',   program: 'Pilates',    timeSlot: 'День (12–17)',  time: '12:00', day: 'Среда',       format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Тонус',             ageRange: '31–35', memberStatus: 'давно не была',        isGroup: true,  groupSize: 3 },

  // ── Kunaeva (Астана) ──────────────────────────────────────────────────────
  { id: 'ku1',  name: 'Дильназ',           initials: 'ДИ', club: 'Kunaeva',   program: 'BootCamp',   timeSlot: 'День (12–17)',  time: '14:30', day: 'Четверг',     format: 'с одной девушкой',         level: 'Средний',   goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: false },
  { id: 'ku2',  name: 'Группа Pilates',    initials: '+4', club: 'Kunaeva',   program: 'Pilates',    timeSlot: 'Выходные',      time: '10:00', day: 'Воскресенье', format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Вернуться в режим', ageRange: '31–35', memberStatus: 'давно не была',        isGroup: true,  groupSize: 4 },
  { id: 'ku3',  name: 'Алуа',              initials: 'АД', club: 'Kunaeva',   program: 'Barre',      timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Среда',       format: 'с одной девушкой',         level: 'Новичок',   goal: 'Тонус',             ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: false },
  { id: 'ku4',  name: 'Группа Yoga',       initials: '+3', club: 'Kunaeva',   program: 'Yoga',       timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Растяжка',          ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: true,  groupSize: 3 },

  // ── Sfera (Астана) ────────────────────────────────────────────────────────
  { id: 'sf1',  name: 'Алия',              initials: 'АС', club: 'Sfera',     program: 'Yoga',       timeSlot: 'Выходные',      time: '10:30', day: 'Воскресенье', format: 'с одной девушкой',         level: 'Новичок',   goal: 'Растяжка',          ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: false },
  { id: 'sf2',  name: 'Меруерт',           initials: 'МС', club: 'Sfera',     program: 'Stretching', timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Пятница',     format: 'с одной девушкой',         level: 'Средний',   goal: 'Вернуться в режим', ageRange: '36–40', memberStatus: 'давно не была',        isGroup: false },
  { id: 'sf3',  name: 'Зарина',            initials: 'ЗА', club: 'Sfera',     program: 'Glute Lab',  timeSlot: 'Вечер (17–22)', time: '19:00', day: 'Вторник',     format: 'с одной девушкой',         level: 'Средний',   goal: 'Ягодицы',           ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: false },
  { id: 'sf4',  name: 'Группа Pilates',    initials: '+3', club: 'Sfera',     program: 'Pilates',    timeSlot: 'Утро (7–12)',   time: '9:30',  day: 'Суббота',     format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Тонус',             ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: true,  groupSize: 3 },

  // ── Karaganda ─────────────────────────────────────────────────────────────
  { id: 'kg1',  name: 'Мадина',            initials: 'МА', club: 'Karaganda', program: 'Yoga',       timeSlot: 'Утро (7–12)',   time: '9:00',  day: 'Вторник',     format: 'с одной девушкой',         level: 'Новичок',   goal: 'Вернуться в режим', ageRange: '31–35', memberStatus: 'давно не была',        isGroup: false },
  { id: 'kg2',  name: 'Группа BootCamp',   initials: '+3', club: 'Karaganda', program: 'BootCamp',   timeSlot: 'Вечер (17–22)', time: '19:30', day: 'Четверг',     format: 'в мини-группе (3–5 чел.)', level: 'Средний',   goal: 'Похудение',         ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: true,  groupSize: 3 },
  { id: 'kg3',  name: 'Асем',              initials: 'АО', club: 'Karaganda', program: 'Stretching', timeSlot: 'День (12–17)',  time: '14:00', day: 'Среда',       format: 'с одной девушкой',         level: 'Средний',   goal: 'Растяжка',          ageRange: '26–30', memberStatus: 'хожу иногда',          isGroup: false },
  { id: 'kg4',  name: 'Гульнара',          initials: 'ГА', club: 'Karaganda', program: 'Stretching', timeSlot: 'Выходные',      time: '10:30', day: 'Суббота',     format: 'с одной девушкой',         level: 'Новичок',   goal: 'Растяжка',          ageRange: '36–40', memberStatus: 'хожу иногда',          isGroup: false },
  { id: 'kg5',  name: 'Камила и Айгерим',  initials: '+2', club: 'Karaganda', program: 'Pilates',    timeSlot: 'Вечер (17–22)', time: '18:00', day: 'Среда',       format: 'в мини-группе (3–5 чел.)', level: 'Новичок',   goal: 'Тонус',             ageRange: '21–25', memberStatus: 'купила пробный доступ', isGroup: true,  groupSize: 2 },
];

// ─── Legacy static matches (used nowhere in new flow, kept for reference) ─────

export interface BuddyMatch {
  id: string; name: string; program: ProgramClass; club: Club;
  time: string; day: string; level: Level; goal: Goal;
  initials: string; isGroup: boolean; groupSize?: number; matchScore: number;
}

// ─── Admin: KPI Metrics ───────────────────────────────────────────────────────

export interface AdminMetrics {
  totalRequests:  number;
  matchesFound:   number;
  bookedTogether: number;
  attended:       number;
  conversionRate: number;
}

export const adminMetrics: AdminMetrics = {
  totalRequests: 247, matchesFound: 189, bookedTogether: 134, attended: 98, conversionRate: 73.1,
};

// ─── Admin: Program Popularity ────────────────────────────────────────────────

export interface ProgramStat { program: string; requests: number; matches: number; attended: number; }

export const programStats: ProgramStat[] = [
  { program: 'Barre',      requests: 72, matches: 58, attended: 44 },
  { program: 'Glute Lab',  requests: 65, matches: 51, attended: 38 },
  { program: 'BootCamp',   requests: 43, matches: 32, attended: 22 },
  { program: 'Stretching', requests: 38, matches: 29, attended: 21 },
  { program: 'Yoga',       requests: 19, matches: 13, attended: 10 },
  { program: 'Pilates',    requests: 10, matches: 6,  attended: 5  },
];

// ─── Admin: Time Heatmap ──────────────────────────────────────────────────────

export interface HeatmapRow {
  time: string;
  mon: number; tue: number; wed: number; thu: number;
  fri: number; sat: number; sun: number;
}

export const heatmapData: HeatmapRow[] = [
  { time: '7:00',  mon: 12, tue: 8,  wed: 14, thu: 6,  fri: 9,  sat: 22, sun: 18 },
  { time: '9:00',  mon: 18, tue: 15, wed: 19, thu: 12, fri: 14, sat: 32, sun: 28 },
  { time: '12:00', mon: 8,  tue: 11, wed: 7,  thu: 9,  fri: 10, sat: 15, sun: 12 },
  { time: '15:00', mon: 6,  tue: 8,  wed: 9,  thu: 7,  fri: 11, sat: 14, sun: 10 },
  { time: '18:00', mon: 35, tue: 28, wed: 42, thu: 38, fri: 45, sat: 20, sun: 16 },
  { time: '20:00', mon: 29, tue: 32, wed: 38, thu: 41, fri: 48, sat: 12, sun: 9  },
];

// ─── Admin: AI Insights ───────────────────────────────────────────────────────

export type InsightType = 'demand' | 'opportunity' | 'suggestion' | 'warning';

export interface AIInsight {
  id: string; type: InsightType; title: string; description: string; action: string;
}

export const aiInsights: AIInsight[] = [
  { id: '1', type: 'demand',      title: 'Высокий спрос на Barre по вечерам',  description: 'В чт и пт 18:00–20:00 — 47 запросов без матча. Дефицит слотов.',            action: 'Добавить 2 дополнительных слота' },
  { id: '2', type: 'opportunity', title: 'Glute Lab растёт +23% за месяц',      description: 'Набирает аудиторию среди девушек с целью "Ягодицы". Уровень: средний.',      action: 'Запустить Glute Lab Express (45 мин)' },
  { id: '3', type: 'suggestion',  title: 'Суббота 11:00 — лучший buddy-слот',   description: 'Конверсия матч → запись = 84%. Группы по 3–4 человека.',                     action: 'Создать регулярный buddy-формат' },
  { id: '4', type: 'warning',     title: 'Yoga — доходимость 52%',              description: 'Из 19 записей через buddy пришли только 10. Нет напоминаний.',                action: 'Push-напоминание за 2 часа' },
];

// ─── Admin: Weekly Trend ──────────────────────────────────────────────────────

export const weeklyTrend = [
  { day: 'Пн', requests: 28, matches: 21 },
  { day: 'Вт', requests: 32, matches: 26 },
  { day: 'Ср', requests: 41, matches: 33 },
  { day: 'Чт', requests: 38, matches: 29 },
  { day: 'Пт', requests: 52, matches: 43 },
  { day: 'Сб', requests: 35, matches: 28 },
  { day: 'Вс', requests: 21, matches: 17 },
];
