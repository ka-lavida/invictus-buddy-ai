// ─── Invictus Girls — Data Layer ─────────────────────────────────────────────
// Источник: DWH verified via MCP (подтверждено read-only в ходе discovery).
// В продакшене заменяется на API calls к /api/girls/*
// Все club_id подтверждены через SELECT из mongo.clubs.

// ─── Cities ───────────────────────────────────────────────────────────────────

export const GIRLS_CITIES = ['Алматы', 'Астана', 'Караганда'] as const;
export type GirlsCity = typeof GIRLS_CITIES[number];

// ─── Clubs ────────────────────────────────────────────────────────────────────

export interface ClubInfo {
  key:       string;
  label:     string;           // отображаемое имя
  city:      GirlsCity;
  cityLabel: string;           // "Almaty" / "Astana" / "Karaganda"
  address:   string;
  dwhId:     string;           // подтверждённый mongo.clubs.id
  dwhName:   string;           // полное имя в DWH
  matchName: string;           // для matching engine (buddyPool использует эти названия)
  lat:       number;           // mapLink.center[1] — GeoJSON [lng, lat]
  lng:       number;           // mapLink.center[0]
}

export const GIRLS_CLUBS: ClubInfo[] = [
  { key: 'Crystal',   label: 'Crystal',   city: 'Алматы',    cityLabel: 'Almaty',    address: 'пр. Абая 160, к.3',         dwhId: '68c14ef824acbd015e2bc852', dwhName: 'Invictus Girls Crystal',   matchName: 'Crystal',   lat: 43.2394, lng: 76.9258 },
  { key: 'Tole bi',   label: 'Tole bi',   city: 'Астана',    cityLabel: 'Astana',    address: 'Толе би 40/1',              dwhId: '69032e8a20c1f805985d5bbd', dwhName: 'Invictus Girls Tole bi',   matchName: 'Tole bi',   lat: 51.1326, lng: 71.4118 },
  { key: 'Orynbor',   label: 'Orynbor',   city: 'Астана',    cityLabel: 'Astana',    address: 'Орынбор 12 оф 25',          dwhId: '6576f7a426f20202bd273ebd', dwhName: 'Invictus Girls Orynbor',   matchName: 'Orynbor',   lat: 51.1785, lng: 71.4356 },
  { key: 'Kunaeva',   label: 'Kunaeva',   city: 'Астана',    cityLabel: 'Astana',    address: 'Кунаева 12/1',              dwhId: '63b85152053d7a00ccf5a611', dwhName: 'Invictus Girls Qonayev',   matchName: 'Kunaeva',   lat: 51.1828, lng: 71.4461 },
  { key: 'Sfera',     label: 'Sfera',     city: 'Астана',    cityLabel: 'Astana',    address: 'Керей Жанибек 44/3',        dwhId: '693fe563bda05da33d2bf063', dwhName: 'Invictus Girls Sfera',     matchName: 'Sfera',     lat: 51.1703, lng: 71.4319 },
  { key: 'Karaganda', label: 'Karaganda', city: 'Караганда', cityLabel: 'Karaganda', address: 'Гоголь 34А, БЦ Grey Plaza', dwhId: '69a5246364580ebbac2be7cb', dwhName: 'Invictus Girls Karaganda', matchName: 'Karaganda', lat: 49.8020, lng: 73.0878 },
];

export function getClubsByCity(city: GirlsCity): ClubInfo[] {
  return GIRLS_CLUBS.filter(c => c.city === city);
}

export function getClubByKey(key: string): ClubInfo | undefined {
  return GIRLS_CLUBS.find(c => c.key === key);
}

// ─── Programs available per club ──────────────────────────────────────────────
// Source: DWH mongo.events JOIN mongo.grouptrainings, last 90 days, ≥10 events.
// Keys match GIRLS_PROGRAMS[].key. 'unknown' is always appended in the wizard.
// Barre exists only at Kunaeva (as "Barre Booty" / "Barre arms+core").
export const CLUB_PROGRAMS: Record<string, string[]> = {
  Crystal:   ['bootcamp', 'glute-lab', 'stretching', 'pilates', 'yoga', 'strong', 'brazilian-butt', 'bodysculpt'],
  'Tole bi': ['bootcamp', 'glute-lab', 'stretching', 'pilates', 'yoga', 'strong', 'brazilian-butt'],
  Orynbor:   ['bootcamp', 'stretching', 'pilates', 'yoga', 'strong'],
  Kunaeva:   ['bootcamp', 'barre', 'stretching', 'pilates', 'yoga', 'strong', 'brazilian-butt'],
  Sfera:     ['bootcamp', 'glute-lab', 'stretching', 'pilates', 'yoga', 'strong'],
  Karaganda: ['bootcamp', 'stretching', 'pilates', 'yoga', 'strong', 'bodysculpt'],
};

// ─── Programs ─────────────────────────────────────────────────────────────────
// Верифицированы через MCP: SELECT DISTINCT gt.name FROM mongo.events e
// JOIN mongo.grouptrainings gt ON gt.id = e.group_training
// WHERE c.type = 'Girls' AND e.time_start >= NOW() - INTERVAL '30 days'

export interface ProgramInfo {
  key:         string;
  name:        string;
  description: string;
  level:       'Новичок' | 'Средний' | 'Уверенный' | '';
  dwhLevel:    1 | 2;    // from DWH: 1=beginner, 2=intermediate+
  goals:       string[]; // Goal values this program serves (smart filtering)
  goal:        string;   // primary goal for buddy matching
  calories:    number;
  tags:        string[];
  matchProgram: string;
}

export const GIRLS_PROGRAMS: ProgramInfo[] = [
  {
    key: 'barre',
    name: 'Barre',
    description: 'Грация балета + сила пилатеса. Тонус без ударной нагрузки.',
    level: 'Новичок',
    dwhLevel: 1,
    goals: ['Тонус', 'Ягодицы'],
    goal: 'Тонус',
    calories: 500,
    tags: ['#barre', '#grace'],
    matchProgram: 'Barre',
  },
  {
    key: 'glute-lab',
    name: 'INVICTUS GLUTE LAB',
    description: 'Работа на ягодицы и бёдра с весом и без — результат виден быстро.',
    level: 'Средний',
    dwhLevel: 2,
    goals: ['Ягодицы', 'Тонус'],
    goal: 'Ягодицы',
    calories: 400,
    tags: ['#glutes', '#strength'],
    matchProgram: 'Glute Lab',
  },
  {
    key: 'bootcamp',
    name: 'INVICTUS BOOTCAMP',
    description: 'Интенсивная кардио-силовая тренировка. Сжигаем, тонизируем, работаем.',
    level: 'Средний',
    dwhLevel: 2,
    goals: ['Похудение', 'Тонус'],
    goal: 'Похудение',
    calories: 600,
    tags: ['#cardio', '#fullbody'],
    matchProgram: 'BootCamp',
  },
  {
    key: 'stretching',
    name: 'Stretching',
    description: 'Растяжка, гибкость и расслабление. Мягкий старт или финал дня.',
    level: 'Новичок',
    dwhLevel: 1,
    goals: ['Растяжка', 'Вернуться в режим', 'Просто начать'],
    goal: 'Растяжка',
    calories: 250,
    tags: ['#flex', '#relax'],
    matchProgram: 'Stretching',
  },
  {
    key: 'pilates',
    name: 'Pilates mat',
    description: 'Контроль тела, кор, осанка. Тонус без перегрузки суставов.',
    level: 'Новичок',
    dwhLevel: 1,
    goals: ['Тонус', 'Растяжка', 'Вернуться в режим', 'Просто начать'],
    goal: 'Тонус',
    calories: 250,
    tags: ['#core', '#posture'],
    matchProgram: 'Pilates',
  },
  {
    key: 'yoga',
    name: 'Yoga',
    description: 'Баланс тела и ума, дыхание, гибкость. Отличный способ начать.',
    level: 'Новичок',
    dwhLevel: 1,
    goals: ['Растяжка', 'Вернуться в режим', 'Просто начать'],
    goal: 'Растяжка',
    calories: 250,
    tags: ['#mindful', '#balance'],
    matchProgram: 'Yoga',
  },
  {
    key: 'brazilian-butt',
    name: 'Brazillian Butt',
    description: 'Поднимаем и округляем ягодицы — программа с фокусом на форму.',
    level: 'Средний',
    dwhLevel: 2,
    goals: ['Ягодицы'],
    goal: 'Ягодицы',
    calories: 450,
    tags: ['#booty', '#shape'],
    matchProgram: 'Glute Lab',
  },
  {
    key: 'bodysculpt',
    name: 'BodySculpt',
    description: 'Скульптурирование: рельеф и тонус без изматывающего кардио.',
    level: 'Средний',
    dwhLevel: 2,
    goals: ['Тонус', 'Вернуться в режим'],
    goal: 'Тонус',
    calories: 500,
    tags: ['#sculpt', '#tone'],
    matchProgram: 'Barre',
  },
  {
    key: 'strong',
    name: 'INVICTUS STRONG',
    description: 'Силовая функциональная тренировка для уверенных и мотивированных.',
    level: 'Уверенный',
    dwhLevel: 2,
    goals: ['Тонус', 'Похудение'],
    goal: 'Тонус',
    calories: 600,
    tags: ['#strength', '#power'],
    matchProgram: 'BootCamp',
  },
  {
    key: 'unknown',
    name: 'Не знаю, подберите мне',
    description: 'Не уверена? Система подберёт программу под твою цель.',
    level: '',
    dwhLevel: 1,
    goals: [],
    goal: '',
    calories: 0,
    tags: [],
    matchProgram: 'Не знаю, подберите мне',
  },
];

// ─── Mock stats (для Admin tabs) ──────────────────────────────────────────────

export interface ClubStats {
  key:            string;
  label:          string;
  city:           string;
  activeClients:  number;
  groupClients:   number;
  avgVisitsMonth: number;
  topProgram:     string;
  attendanceRate: number;
  retention30d:   number;
  churnRisk:      number;
  buddyDemand:    number;
  noShowRate:     number;
  aiNote:         string;
}

export const CLUB_STATS: ClubStats[] = [
  { key: 'Crystal',   label: 'Crystal',   city: 'Алматы',    activeClients: 312, groupClients: 198, avgVisitsMonth: 7.2, topProgram: 'Glute Lab', attendanceRate: 78, retention30d: 71, churnRisk: 12, buddyDemand: 87, noShowRate: 14, aiNote: 'Высокий спрос на вечерние buddy-слоты. Рекомендуем добавить 2 слота Glute Lab в 19:00.' },
  { key: 'Tole bi',   label: 'Tole bi',   city: 'Астана',    activeClients: 241, groupClients: 156, avgVisitsMonth: 6.1, topProgram: 'Stretching', attendanceRate: 74, retention30d: 68, churnRisk: 15, buddyDemand: 62, noShowRate: 18, aiNote: 'Высокий no-show по Yoga. Запустить push-напоминания за 2 ч + buddy mini-group.' },
  { key: 'Orynbor',   label: 'Orynbor',   city: 'Астана',    activeClients: 187, groupClients: 124, avgVisitsMonth: 5.8, topProgram: 'Bootcamp',   attendanceRate: 71, retention30d: 65, churnRisk: 18, buddyDemand: 54, noShowRate: 20, aiNote: 'Низкая загрузка дневных слотов. Buddy-группы в 12:00-14:00 могут улучшить attendance.' },
  { key: 'Kunaeva',   label: 'Kunaeva',   city: 'Астана',    activeClients: 203, groupClients: 141, avgVisitsMonth: 6.4, topProgram: 'Pilates',    attendanceRate: 76, retention30d: 70, churnRisk: 14, buddyDemand: 59, noShowRate: 16, aiNote: 'Стабильный клуб. Внедрение buddy-flow увеличит retention на ~8%.' },
  { key: 'Sfera',     label: 'Sfera',     city: 'Астана',    activeClients: 165, groupClients: 108, avgVisitsMonth: 5.4, topProgram: 'Yoga',       attendanceRate: 68, retention30d: 61, churnRisk: 22, buddyDemand: 47, noShowRate: 23, aiNote: 'Риск оттока выше среднего. Приоритет: buddy intro flow для новичков.' },
  { key: 'Karaganda', label: 'Karaganda', city: 'Караганда', activeClients: 228, groupClients: 162, avgVisitsMonth: 6.8, topProgram: 'Bootcamp',   attendanceRate: 73, retention30d: 67, churnRisk: 16, buddyDemand: 71, noShowRate: 17, aiNote: 'Сильный спрос на Bootcamp. Мини-группы в выходные — высокая конверсия 84%.' },
];

export interface ProgramStats {
  name:           string;
  bookings:       number;
  attended:       number;
  attendanceRate: number;
  repeatRate:     number;
  noShowRate:     number;
  topSlot:        string;
  bestClub:       string;
  trend:          number;
  aiNote:         string;
}

export const PROGRAM_STATS: ProgramStats[] = [
  { name: 'INVICTUS GLUTE LAB', bookings: 412, attended: 338, attendanceRate: 82, repeatRate: 68, noShowRate: 12, topSlot: '19:00–20:00', bestClub: 'Crystal', trend: 23, aiNote: 'Растёт +23%. Добавить вечерние слоты и buddy-формат.' },
  { name: 'INVICTUS BOOTCAMP',  bookings: 367, attended: 278, attendanceRate: 76, repeatRate: 54, noShowRate: 18, topSlot: '18:30–19:30', bestClub: 'Karaganda', trend: 8,  aiNote: 'Стабильная программа. Buddy-пары увеличивают return rate.' },
  { name: 'Stretching',         bookings: 298, attended: 214, attendanceRate: 72, repeatRate: 49, noShowRate: 22, topSlot: '11:00–12:00', bestClub: 'Crystal', trend: -3, aiNote: 'Суббота 11:00 — лучший buddy-слот, конверсия 84%.' },
  { name: 'Pilates mat',        bookings: 254, attended: 208, attendanceRate: 82, repeatRate: 61, noShowRate: 11, topSlot: '12:00–13:00', bestClub: 'Kunaeva', trend: 5,  aiNote: 'Высокая доходимость. Внедрить buddy intro flow для новичков.' },
  { name: 'Yoga',               bookings: 189, attended:  98, attendanceRate: 52, repeatRate: 38, noShowRate: 34, topSlot: '09:00–10:00', bestClub: 'Tole bi', trend: -8, aiNote: 'Критическая доходимость 52%. Push за 2 ч + buddy mini-group.' },
  { name: 'Brazillian Butt',    bookings: 176, attended: 143, attendanceRate: 81, repeatRate: 62, noShowRate: 13, topSlot: '09:00–10:00', bestClub: 'Crystal', trend: 12, aiNote: 'Утренний спрос высокий. Buddy-формат для новичков.' },
];

export interface RetentionStats {
  label:       string;
  value:       number;
  unit:        string;
  trend:       number;
  description: string;
}

export const RETENTION_STATS: RetentionStats[] = [
  { label: '7-day retention',      value: 64, unit: '%', trend: 3,  description: 'После первого визита возвращаются в первые 7 дней' },
  { label: '30-day retention',     value: 48, unit: '%', trend: 5,  description: 'Активны через 30 дней после первой записи' },
  { label: 'Пробный → покупка',    value: 31, unit: '%', trend: 7,  description: 'Конверсия из пробного доступа в полный абонемент' },
  { label: '90+ дней без визита',  value: 22, unit: '%', trend: -4, description: 'Клиентки в риске полного оттока' },
  { label: 'С buddy vs без buddy', value: 78, unit: '%', trend: 0,  description: 'Retention через 30 дней у клиенток с buddy' },
  { label: 'Без buddy',            value: 48, unit: '%', trend: 0,  description: 'Retention через 30 дней без buddy-механики' },
];

export interface CapacityStats {
  club:         string;
  city:         string;
  sqm:          number | null;
  theoretical:  number;
  peakLoad:     number;
  avgLoad:      number;
  primeOverload:boolean;
  daytimeFree:  number;
  aiNote:       string;
}

export const CAPACITY_STATS: CapacityStats[] = [
  { club: 'Crystal',   city: 'Алматы',    sqm: null, theoretical: 40, peakLoad: 92, avgLoad: 61, primeOverload: true,  daytimeFree: 38, aiNote: 'Вечерняя загрузка критическая. Buddy-группы в 12:00–17:00 разгрузят пик.' },
  { club: 'Tole bi',   city: 'Астана',    sqm: null, theoretical: 35, peakLoad: 78, avgLoad: 52, primeOverload: false, daytimeFree: 45, aiNote: 'Сбалансированная загрузка. Потенциал дневных buddy-слотов.' },
  { club: 'Orynbor',   city: 'Астана',    sqm: null, theoretical: 30, peakLoad: 68, avgLoad: 44, primeOverload: false, daytimeFree: 52, aiNote: 'Низкая загрузка дней. Приоритет: утренние buddy mini-groups.' },
  { club: 'Kunaeva',   city: 'Астана',    sqm: null, theoretical: 32, peakLoad: 74, avgLoad: 56, primeOverload: false, daytimeFree: 41, aiNote: 'Хорошая загрузка. Внедрить buddy-слоты в выходные.' },
  { club: 'Sfera',     city: 'Астана',    sqm: null, theoretical: 28, peakLoad: 65, avgLoad: 41, primeOverload: false, daytimeFree: 58, aiNote: 'Низкая загрузка. Buddy intro flow + маркетинг утренних часов.' },
  { club: 'Karaganda', city: 'Караганда', sqm: null, theoretical: 38, peakLoad: 88, avgLoad: 64, primeOverload: true,  daytimeFree: 33, aiNote: 'Высокий weekend спрос. Buddy mini-groups в субботу 11:00.' },
];

export interface Recommendation {
  id:       string;
  priority: 'high' | 'medium' | 'low';
  problem:  string;
  cause:    string;
  action:   string;
  effect:   string;
  owner:    string;
}

export const RECOMMENDATIONS: Recommendation[] = [
  { id: 'r1', priority: 'high',   problem: 'Glute Lab — дефицит вечерних слотов',         cause: '47 запросов без матча по чт/пт 18–20ч',            action: 'Добавить 2 слота Glute Lab вечером Crystal + Karaganda',   effect: '+40 записей/мес, -23% no-match rate',         owner: 'Расписание' },
  { id: 'r2', priority: 'high',   problem: 'Yoga — доходимость 52%',                       cause: 'Нет напоминаний, высокий no-show 34%',              action: 'Push за 2 ч + buddy mini-group формат',                    effect: 'Доходимость +20пп → 72%',                     owner: 'CRM / Продукт' },
  { id: 'r3', priority: 'high',   problem: 'Незавершённые wizard-сессии',                   cause: 'Drop-off на шаге выбора программы',                 action: 'Push-напоминание «ты не завершила подбор подруги»',        effect: '+15% completion rate',                        owner: 'Маркетинг' },
  { id: 'r4', priority: 'medium', problem: 'Дневная недозагрузка Crystal и Orynbor',        cause: 'Прим-тайм перегружен, день пустой',                 action: 'Запустить buddy mini-groups 12:00–15:00',                  effect: '+25 посещений/день в low-load период',        owner: 'Управляющий / Расписание' },
  { id: 'r5', priority: 'medium', problem: 'Пробный → покупка конверсия 31%',               cause: 'Нет buddy-сопровождения в первые 30 дней',          action: 'Intro buddy flow: подобрать пару на 1-ю тренировку',       effect: '+12пп конверсии → 43%',                       owner: 'Продукт / CRM' },
  { id: 'r6', priority: 'medium', problem: '22% клиенток 90+ дней без визита',              cause: 'Нет реактивации через buddy-механику',              action: 'Buddy reactivation email + «давно не была» flow',          effect: 'Реактивация 18% спящих',                      owner: 'CRM / Маркетинг' },
  { id: 'r7', priority: 'low',    problem: 'Sfera — retention 61%, ниже сети',              cause: 'Новый клуб, мало постоянных клиенток',              action: 'Запустить buddy intro flow для всех новичков',             effect: 'Retention +8пп через 90 дней',                owner: 'Управляющий / Продукт' },
  { id: 'r8', priority: 'low',    problem: 'Нет данных о sqm и capacity',                  cause: 'Не внесены в систему',                              action: 'Внести sqm по каждому клубу для точных capacity-расчётов', effect: 'Точное управление загрузкой залов',           owner: 'Управляющий' },
];

export const BUDDY_FUNNEL = [
  { stage: 'Увидели блок',        count: 1840, pct: 100  },
  { stage: 'Нажали "Найти"',      count: 612,  pct: 33.3 },
  { stage: 'Начали wizard',       count: 481,  pct: 26.1 },
  { stage: 'Завершили wizard',    count: 247,  pct: 13.4 },
  { stage: 'Получили матч',       count: 189,  pct: 10.3 },
  { stage: 'Присоединились',      count: 134,  pct: 7.3  },
  { stage: 'Записались',          count: 112,  pct: 6.1  },
  { stage: 'Пришли',              count:  98,  pct: 5.3  },
];
