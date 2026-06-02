// ─── DWH Snapshot — Invictus Girls ───────────────────────────────────────────
// Generated via MCP read-only queries against Invictus DWH (PostgreSQL 15)
// Period: last 30 days relative to snapshot date 2026-06-01
// Sources: mongo.events, mongo.usersubscriptions, mongo.visits, mongo.clubs,
//          mongo.grouptrainings
// ⚠️  No PII stored. No phones, names, birth_dates. Only aggregates.
// buddy_demand: LOCAL ONLY (not from DWH)

export const DWH_SNAPSHOT_DATE = '2026-06-01';
export const DWH_PERIOD_DAYS = 30;

// ─── Club IDs (verified from mongo.clubs) ────────────────────────────────────
export const CLUB_IDS = {
  Crystal:   '68c14ef824acbd015e2bc852',
  Tole_bi:   '69032e8a20c1f805985d5bbd',
  Orynbor:   '6576f7a426f20202bd273ebd',
  Qonayev:   '63b85152053d7a00ccf5a611',
  Sfera:     '693fe563bda05da33d2bf063',
  Karaganda: '69a5246364580ebbac2be7cb',
} as const;

// ─── Club aggregate stats ─────────────────────────────────────────────────────
// All metrics from DWH except buddy_demand (local-only)
export interface DwhClubStats {
  clubId:               string;
  key:                  string;   // display key (e.g. 'Crystal')
  label:                string;
  city:                 string;
  cityLabel:            string;
  dwhName:              string;

  // Subscribers
  activeSubscribers:    number;   // mongo.usersubscriptions: is_active + not deleted

  // Visits (mongo.visits, last 30d)
  totalVisits30d:       number;
  totalVisits7d:        number;
  totalVisits90d:       number;

  // Group class activity (from events.participants, last 30d)
  uniqueGroupVisitors:  number;   // unique users who booked ≥1 group event
  totalBookings:        number;   // SUM(array_length(participants))
  totalCapacity:        number;   // SUM(max_person)
  fillRate:             number;   // bookings / capacity %

  // Retention proxy (comparison: prev 30d vs current 30d group class participants)
  retained30d:          number;   // users in BOTH current and prev 30d periods
  newOrReturned30d:     number;   // users in current period NOT seen in prev period
  retentionRate30d:     number;   // retained / uniqueGroupVisitors %
  churnProxy30d:        number;   // newOrReturned / uniqueGroupVisitors % (lapsed/new)

  // Top programs (excl. Свободная тренировка)
  topPrograms:          string[];

  // Peak hours (local UTC+5)
  peakHoursLocal:       number[];  // sorted by bookings desc, top 3

  // Buddy demand: LOCAL mock only — not from DWH
  buddyDemand:          number | null;

  source: 'dwh';
}

export const DWH_CLUB_STATS: DwhClubStats[] = [
  {
    clubId: '68c14ef824acbd015e2bc852',
    key: 'Crystal', label: 'Crystal', city: 'Алматы', cityLabel: 'Almaty',
    dwhName: 'Invictus Girls Crystal',
    activeSubscribers: 1035,
    totalVisits30d: 993, totalVisits7d: 24, totalVisits90d: 39,
    uniqueGroupVisitors: 1096,
    totalBookings: 6311, totalCapacity: 13062, fillRate: 48.3,
    retained30d: 775, newOrReturned30d: 321, retentionRate30d: 70.7, churnProxy30d: 29.3,
    topPrograms: ['INVICTUS BOOTCAMP', 'Stretching', 'INVICTUS GLUTE LAB', 'Pilates mat', 'Cycle'],
    peakHoursLocal: [19, 20, 18],
    buddyDemand: 87,
    source: 'dwh',
  },
  {
    clubId: '69032e8a20c1f805985d5bbd',
    key: 'Tole bi', label: 'Tole bi', city: 'Астана', cityLabel: 'Astana',
    dwhName: 'Invictus Girls Tole bi',
    activeSubscribers: 957,
    totalVisits30d: 857, totalVisits7d: 19, totalVisits90d: 25,
    uniqueGroupVisitors: 1126,
    totalBookings: 6054, totalCapacity: 8847, fillRate: 68.4,
    retained30d: 789, newOrReturned30d: 337, retentionRate30d: 70.1, churnProxy30d: 29.9,
    topPrograms: ['INVICTUS BOOTCAMP', 'INVICTUS GLUTE LAB', 'Skinny bitches', 'Pilates mat', 'Cycle'],
    peakHoursLocal: [19, 20, 9],
    buddyDemand: 62,
    source: 'dwh',
  },
  {
    clubId: '6576f7a426f20202bd273ebd',
    key: 'Orynbor', label: 'Orynbor', city: 'Астана', cityLabel: 'Astana',
    dwhName: 'Invictus Girls Orynbor',
    activeSubscribers: 634,
    totalVisits30d: 733, totalVisits7d: 7, totalVisits90d: 11,
    uniqueGroupVisitors: 786,
    totalBookings: 3873, totalCapacity: 7953, fillRate: 48.7,
    retained30d: 559, newOrReturned30d: 227, retentionRate30d: 71.1, churnProxy30d: 28.9,
    topPrograms: ['Girls bootcamp', 'INVICTUS BOOTCAMP', 'Skinny bitches', 'Здоровая спина', 'Pilates mat'],
    peakHoursLocal: [11, 20, 13],
    buddyDemand: 54,
    source: 'dwh',
  },
  {
    clubId: '63b85152053d7a00ccf5a611',
    key: 'Kunaeva', label: 'Kunaeva', city: 'Астана', cityLabel: 'Astana',
    dwhName: 'Invictus Girls Qonayev',
    activeSubscribers: 523,
    totalVisits30d: 642, totalVisits7d: 9, totalVisits90d: 21,
    uniqueGroupVisitors: 688,
    totalBookings: 3400, totalCapacity: 12043, fillRate: 28.2,
    retained30d: 489, newOrReturned30d: 199, retentionRate30d: 71.1, churnProxy30d: 28.9,
    topPrograms: ['Skinny bitches', 'INVICTUS BOOTCAMP', 'Pilates mat', 'INVICTUS STRONG', 'Yoga'],
    peakHoursLocal: [19, 18, 20],
    buddyDemand: 59,
    source: 'dwh',
  },
  {
    clubId: '693fe563bda05da33d2bf063',
    key: 'Sfera', label: 'Sfera', city: 'Астана', cityLabel: 'Astana',
    dwhName: 'Invictus Girls Sfera',
    activeSubscribers: 656,
    totalVisits30d: 1227, totalVisits7d: 15, totalVisits90d: 28,
    uniqueGroupVisitors: 907,
    totalBookings: 4394, totalCapacity: 13549, fillRate: 32.4,
    retained30d: 598, newOrReturned30d: 309, retentionRate30d: 65.9, churnProxy30d: 34.1,
    topPrograms: ['INVICTUS BOOTCAMP', 'INVICTUS GLUTE LAB', 'Skinny bitches', 'Pilates mat', 'Stretching'],
    peakHoursLocal: [20, 19, 18],
    buddyDemand: 47,
    source: 'dwh',
  },
  {
    clubId: '69a5246364580ebbac2be7cb',
    key: 'Karaganda', label: 'Karaganda', city: 'Караганда', cityLabel: 'Karaganda',
    dwhName: 'Invictus Girls Karagandy',
    activeSubscribers: 529,
    totalVisits30d: 2367, totalVisits7d: 29, totalVisits90d: 41,
    uniqueGroupVisitors: 691,
    totalBookings: 4808, totalCapacity: 11137, fillRate: 43.2,
    retained30d: 393, newOrReturned30d: 298, retentionRate30d: 56.9, churnProxy30d: 43.1,
    topPrograms: ['Pilates Reformers', 'INVICTUS BOOTCAMP', 'FUNCTIONAL TRAINING', 'INVICTUS STRONG', 'Stretching'],
    peakHoursLocal: [19, 10, 20],
    buddyDemand: 71,
    source: 'dwh',
  },
];

// ─── Programs per club (last 30d, excl. Свободная тренировка) ─────────────────
export interface DwhClubProgram {
  clubId:     string;
  clubName:   string;
  program:    string;
  events:     number;
  bookings:   number;
  capacity:   number;
  fillRate:   number;  // bookings/capacity %
}

export const DWH_CLUB_PROGRAMS: DwhClubProgram[] = [
  // ── Crystal ──────────────────────────────────────────────────────────────────
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'INVICTUS BOOTCAMP',    events:94,  bookings:1035, capacity:1503, fillRate:68.9 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Stretching',            events:62,  bookings:652,  capacity:982,  fillRate:66.4 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'INVICTUS GLUTE LAB',    events:55,  bookings:639,  capacity:803,  fillRate:79.6 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Pilates mat',           events:41,  bookings:474,  capacity:667,  fillRate:71.1 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Cycle',                 events:54,  bookings:375,  capacity:702,  fillRate:53.4 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'INVICTUS STRONG',       events:31,  bookings:314,  capacity:374,  fillRate:83.9 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'МФР',                   events:33,  bookings:289,  capacity:477,  fillRate:60.6 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Yoga',                  events:30,  bookings:283,  capacity:504,  fillRate:56.2 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Bachata',               events:17,  bookings:138,  capacity:228,  fillRate:60.5 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Brazillian Butt',       events:15,  bookings:125,  capacity:182,  fillRate:68.7 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Zumba',                 events:8,   bookings:109,  capacity:144,  fillRate:75.7 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'BodySculpt',            events:14,  bookings:100,  capacity:169,  fillRate:59.2 },
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   program:'Core',                  events:15,  bookings:98,   capacity:181,  fillRate:54.1 },
  // ── Tole bi ──────────────────────────────────────────────────────────────────
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'INVICTUS BOOTCAMP',    events:72,  bookings:1036, capacity:1440, fillRate:71.9 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'INVICTUS GLUTE LAB',    events:68,  bookings:669,  capacity:816,  fillRate:82.0 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Skinny bitches',        events:39,  bookings:438,  capacity:732,  fillRate:59.8 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Pilates mat',           events:26,  bookings:361,  capacity:494,  fillRate:73.1 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Cycle',                 events:29,  bookings:320,  capacity:580,  fillRate:55.2 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Aerostretching',        events:21,  bookings:258,  capacity:273,  fillRate:94.5 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Stretching',            events:17,  bookings:243,  capacity:323,  fillRate:75.2 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Yoga',                  events:13,  bookings:201,  capacity:248,  fillRate:81.1 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Stretching & Mobility', events:13,  bookings:175,  capacity:247,  fillRate:70.9 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'МФР',                   events:20,  bookings:173,  capacity:380,  fillRate:45.5 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'INVICTUS STRONG',       events:9,   bookings:158,  capacity:180,  fillRate:87.8 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'FUNCTIONAL TRAINING',   events:13,  bookings:126,  capacity:156,  fillRate:80.8 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Oriental Dance',        events:12,  bookings:119,  capacity:240,  fillRate:49.6 },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   program:'Girls bootcamp',        events:14,  bookings:116,  capacity:140,  fillRate:82.9 },
  // ── Orynbor ───────────────────────────────────────────────────────────────────
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Girls bootcamp',        events:71,  bookings:630,  capacity:852,  fillRate:73.9 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'INVICTUS BOOTCAMP',    events:77,  bookings:597,  capacity:1386, fillRate:43.1 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Skinny bitches',        events:71,  bookings:594,  capacity:852,  fillRate:69.7 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Здоровая спина',        events:33,  bookings:320,  capacity:528,  fillRate:60.6 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Pilates mat',           events:24,  bookings:301,  capacity:384,  fillRate:78.4 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Women health',          events:29,  bookings:269,  capacity:464,  fillRate:58.0 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Aerostretching',        events:17,  bookings:147,  capacity:255,  fillRate:57.6 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Stretching',            events:16,  bookings:122,  capacity:256,  fillRate:47.7 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Cycle',                 events:16,  bookings:109,  capacity:240,  fillRate:45.4 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'INVICTUS STRONG',       events:12,  bookings:91,   capacity:180,  fillRate:50.6 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Yoga',                  events:13,  bookings:87,   capacity:208,  fillRate:41.8 },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   program:'Fly Yoga',              events:13,  bookings:86,   capacity:195,  fillRate:44.1 },
  // ── Kunaeva (Qonayev) ─────────────────────────────────────────────────────────
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Skinny bitches',        events:53,  bookings:537,  capacity:1049, fillRate:51.2 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'INVICTUS BOOTCAMP',    events:34,  bookings:345,  capacity:704,  fillRate:49.0 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Pilates mat',           events:32,  bookings:218,  capacity:576,  fillRate:37.8 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'INVICTUS STRONG',       events:21,  bookings:186,  capacity:252,  fillRate:73.8 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Yoga',                  events:23,  bookings:171,  capacity:374,  fillRate:45.7 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Здоровая спина',        events:19,  bookings:149,  capacity:342,  fillRate:43.6 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Girls bootcamp',        events:18,  bookings:142,  capacity:333,  fillRate:42.6 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Gymnastic Stretching',  events:19,  bookings:133,  capacity:342,  fillRate:38.9 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Stretching',            events:13,  bookings:119,  capacity:206,  fillRate:57.8 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'FUNCTIONAL TRAINING',   events:18,  bookings:119,  capacity:234,  fillRate:50.9 },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   program:'Aerostretching',        events:21,  bookings:117,  capacity:168,  fillRate:69.6 },
  // ── Sfera ─────────────────────────────────────────────────────────────────────
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'INVICTUS BOOTCAMP',    events:82,  bookings:862,  capacity:1312, fillRate:65.7 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'INVICTUS GLUTE LAB',    events:55,  bookings:398,  capacity:660,  fillRate:60.3 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'Skinny bitches',        events:55,  bookings:382,  capacity:440,  fillRate:86.8 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'Pilates mat',           events:43,  bookings:356,  capacity:1290, fillRate:27.6 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'Stretching',            events:42,  bookings:327,  capacity:1260, fillRate:25.9 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'Cycle',                 events:31,  bookings:228,  capacity:465,  fillRate:49.0 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'Yoga',                  events:35,  bookings:190,  capacity:1050, fillRate:18.1 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'INVICTUS STRONG',       events:19,  bookings:184,  capacity:570,  fillRate:32.3 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'Women health',          events:18,  bookings:134,  capacity:540,  fillRate:24.8 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'МФР',                   events:17,  bookings:118,  capacity:510,  fillRate:23.1 },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     program:'INVICTUS DANCE',        events:23,  bookings:108,  capacity:690,  fillRate:15.7 },
  // ── Karaganda ────────────────────────────────────────────────────────────────
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'Pilates Reformers',     events:177, bookings:1531, capacity:1947, fillRate:78.6 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'INVICTUS BOOTCAMP',    events:100, bookings:855,  capacity:1600, fillRate:53.4 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'FUNCTIONAL TRAINING',   events:46,  bookings:385,  capacity:552,  fillRate:69.7 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'INVICTUS STRONG',       events:33,  bookings:379,  capacity:561,  fillRate:67.6 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'Stretching',            events:15,  bookings:163,  capacity:300,  fillRate:54.3 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'ABL',                   events:15,  bookings:150,  capacity:247,  fillRate:60.7 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'Yoga',                  events:13,  bookings:104,  capacity:195,  fillRate:53.3 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'Здоровая спина',        events:12,  bookings:88,   capacity:216,  fillRate:40.7 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'МФР',                   events:13,  bookings:84,   capacity:195,  fillRate:43.1 },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', program:'Pilates mat',           events:13,  bookings:83,   capacity:221,  fillRate:37.6 },
];

// ─── Network-wide programs (last 60 days, all Girls clubs) ───────────────────
export interface DwhNetworkProgram {
  program:     string;
  totalEvents: number;
  bookings:    number;
  capacity:    number;
  fillRate:    number;
  clubsActive: number;
}

export const DWH_NETWORK_PROGRAMS: DwhNetworkProgram[] = [
  { program:'INVICTUS BOOTCAMP',    totalEvents:864,  bookings:9869, capacity:15037, fillRate:65.6, clubsActive:6 },
  { program:'Skinny bitches',       totalEvents:434,  bookings:4200, capacity:6131,  fillRate:68.5, clubsActive:4 },
  { program:'Pilates mat',          totalEvents:336,  bookings:3725, capacity:6756,  fillRate:55.1, clubsActive:6 },
  { program:'INVICTUS GLUTE LAB',   totalEvents:362,  bookings:3658, capacity:4644,  fillRate:78.8, clubsActive:3 },
  { program:'Stretching',           totalEvents:330,  bookings:3457, capacity:6597,  fillRate:52.4, clubsActive:6 },
  { program:'INVICTUS STRONG',      totalEvents:243,  bookings:2677, capacity:4114,  fillRate:65.1, clubsActive:6 },
  { program:'Cycle',                totalEvents:256,  bookings:2354, capacity:3911,  fillRate:60.2, clubsActive:4 },
  { program:'Yoga',                 totalEvents:246,  bookings:2233, capacity:5039,  fillRate:44.3, clubsActive:6 },
  { program:'Pilates Reformers',    totalEvents:227,  bookings:2009, capacity:2496,  fillRate:80.5, clubsActive:1 },
  { program:'Girls bootcamp',       totalEvents:225,  bookings:1993, capacity:2818,  fillRate:70.7, clubsActive:4 },
  { program:'МФР',                  totalEvents:202,  bookings:1726, capacity:3741,  fillRate:46.1, clubsActive:6 },
  { program:'Здоровая спина',       totalEvents:161,  bookings:1616, capacity:2964,  fillRate:54.5, clubsActive:5 },
  { program:'Aerostretching',       totalEvents:119,  bookings:1133, capacity:1375,  fillRate:82.4, clubsActive:3 },
  { program:'Women health',         totalEvents:127,  bookings:965,  capacity:2427,  fillRate:39.8, clubsActive:4 },
  { program:'FUNCTIONAL TRAINING',  totalEvents:105,  bookings:864,  capacity:1278,  fillRate:67.6, clubsActive:3 },
  { program:'INVICTUS RACE',        totalEvents:122,  bookings:850,  capacity:1794,  fillRate:47.4, clubsActive:4 },
  { program:'Stretching & Mobility',totalEvents:72,   bookings:625,  capacity:1550,  fillRate:40.3, clubsActive:4 },
  { program:'Fly Yoga',             totalEvents:74,   bookings:549,  capacity:899,   fillRate:61.1, clubsActive:3 },
  { program:'Brazillian Butt',      totalEvents:54,   bookings:526,  capacity:906,   fillRate:58.1, clubsActive:3 },
  { program:'Core',                 totalEvents:71,   bookings:524,  capacity:1083,  fillRate:48.4, clubsActive:3 },
  { program:'Gymnastic Stretching', totalEvents:55,   bookings:503,  capacity:1006,  fillRate:50.0, clubsActive:2 },
  { program:'High Heels',           totalEvents:87,   bookings:405,  capacity:1344,  fillRate:30.1, clubsActive:5 },
  { program:'INVICTUS BALANCE',     totalEvents:46,   bookings:392,  capacity:883,   fillRate:44.4, clubsActive:4 },
  { program:'Zumba',                totalEvents:32,   bookings:379,  capacity:601,   fillRate:63.1, clubsActive:4 },
  { program:'BodySculpt',           totalEvents:34,   bookings:301,  capacity:464,   fillRate:64.9, clubsActive:3 },
  { program:'Bachata',              totalEvents:36,   bookings:300,  capacity:486,   fillRate:61.7, clubsActive:1 },
  { program:'Oriental Dance',       totalEvents:26,   bookings:273,  capacity:519,   fillRate:52.6, clubsActive:1 },
  { program:'ABL',                  totalEvents:25,   bookings:246,  capacity:401,   fillRate:61.3, clubsActive:1 },
  { program:'INVICTUS DANCE',       totalEvents:43,   bookings:221,  capacity:1290,  fillRate:17.1, clubsActive:1 },
  { program:"WOMEN'S HEALTH",       totalEvents:23,   bookings:216,  capacity:437,   fillRate:49.4, clubsActive:1 },
  { program:'INVICTUS KICK',        totalEvents:34,   bookings:181,  capacity:600,   fillRate:30.2, clubsActive:3 },
  { program:'Dancehall',            totalEvents:25,   bookings:147,  capacity:502,   fillRate:29.3, clubsActive:3 },
  { program:'Yoga Nidra',           totalEvents:19,   bookings:139,  capacity:333,   fillRate:41.7, clubsActive:2 },
  { program:'Barre arms+core',      totalEvents:9,    bookings:91,   capacity:126,   fillRate:72.2, clubsActive:1 },
  { program:'Barre Booty',          totalEvents:8,    bookings:86,   capacity:112,   fillRate:76.8, clubsActive:1 },
  { program:'Upper Body',           totalEvents:8,    bookings:69,   capacity:92,    fillRate:75.0, clubsActive:1 },
  { program:'Yoga FOR HER',         totalEvents:16,   bookings:66,   capacity:288,   fillRate:22.9, clubsActive:1 },
  { program:'Yoga Nidra в гамаках', totalEvents:9,    bookings:37,   capacity:72,    fillRate:51.4, clubsActive:1 },
];

// ─── Peak hours by club (local UTC+5, last 30d) ──────────────────────────────
// hour → bookings for that hour across all days
export type ClubHourMap = Record<string, Record<number, number>>;

export const DWH_PEAK_HOURS: ClubHourMap = {
  '68c14ef824acbd015e2bc852': { 7:93, 8:210, 9:256, 10:230, 11:348, 12:383, 13:443, 14:260, 15:261, 16:314, 17:390, 18:653, 19:1182, 20:1025, 21:263 },
  '69032e8a20c1f805985d5bbd': { 7:89, 8:121, 9:466, 10:462, 11:372, 12:350, 13:432, 14:378, 15:233, 16:225, 17:262, 18:443, 19:1000, 20:887,  21:334 },
  '6576f7a426f20202bd273ebd': { 7:60, 8:16,  9:148, 10:315, 11:502, 12:275, 13:474, 14:323, 15:248, 16:58,  17:34,  18:219, 19:455,  20:475,  21:271 },
  '63b85152053d7a00ccf5a611': { 7:108,8:15,  9:37,  10:136, 11:179, 12:185, 13:408, 14:262, 15:179, 16:141, 17:124, 18:494, 19:637,  20:425,  21:70  },
  '693fe563bda05da33d2bf063': { 7:63, 8:68,  9:247, 10:454, 11:189, 12:115, 13:229, 14:361, 15:356, 16:299, 17:341, 18:467, 19:537,  20:601,  21:67  },
  '69a5246364580ebbac2be7cb': { 7:104,8:156, 9:412, 10:470, 11:318, 12:335, 13:349, 14:334, 15:177, 16:355, 17:314, 18:349, 19:571,  20:433,  21:131 },
};

// ─── Retention by club (30d proxy via group class activity) ──────────────────
export interface DwhRetention {
  clubId:          string;
  clubName:        string;
  visitors30d:     number;  // unique group class participants this period
  visitorsPrev30d: number;  // unique participants in previous 30d period
  retained:        number;  // in BOTH periods
  newOrReturned:   number;  // in current but NOT in prev
  retentionRate:   number;  // retained / visitors30d %
  note: string;
}

export const DWH_RETENTION: DwhRetention[] = [
  { clubId:'68c14ef824acbd015e2bc852', clubName:'Crystal',   visitors30d:1096, visitorsPrev30d:775, retained:775, newOrReturned:321, retentionRate:70.7, note:'MVP proxy: % current visitors who also attended last month' },
  { clubId:'69032e8a20c1f805985d5bbd', clubName:'Tole bi',   visitors30d:1126, visitorsPrev30d:789, retained:789, newOrReturned:337, retentionRate:70.1, note:'MVP proxy' },
  { clubId:'6576f7a426f20202bd273ebd', clubName:'Orynbor',   visitors30d:786,  visitorsPrev30d:559, retained:559, newOrReturned:227, retentionRate:71.1, note:'MVP proxy' },
  { clubId:'63b85152053d7a00ccf5a611', clubName:'Kunaeva',   visitors30d:688,  visitorsPrev30d:489, retained:489, newOrReturned:199, retentionRate:71.1, note:'MVP proxy' },
  { clubId:'693fe563bda05da33d2bf063', clubName:'Sfera',     visitors30d:907,  visitorsPrev30d:598, retained:598, newOrReturned:309, retentionRate:65.9, note:'MVP proxy' },
  { clubId:'69a5246364580ebbac2be7cb', clubName:'Karaganda', visitors30d:691,  visitorsPrev30d:393, retained:393, newOrReturned:298, retentionRate:56.9, note:'MVP proxy' },
];
