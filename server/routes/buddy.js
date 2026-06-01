'use strict';
// ─── routes/buddy.js — /api/buddy/* ──────────────────────────────────────────
//
// Правила:
//   • DWH (mongo.*) — только SELECT, read-only, никаких INSERT/UPDATE/DELETE
//   • Новые сущности (requests, matches, events) — только server/data/*.json
//   • Если DWH недоступен — автоматический fallback на mock.buddyPool

const { Router } = require('express');
const db       = require('../db');
const matching = require('../matching');
const mock     = require('../mock');
const store    = require('../store');

const router = Router();

// ─── Маппинг: имя клуба (из формы) → DWH club_id ─────────────────────────────
// Подтверждено через SELECT из mongo.clubs на реальном DWH
const CLUB_ID = {
  'Girls Crystal': '68c14ef824acbd015e2bc852',  // Invictus Girls Crystal
  'Samal':         '62212749097e5c3170553852',  // Invictus Fitness Samal
  'Gagarin':       '62212767097e5c317055385a',  // Invictus Fitness Gagarin
  'Green Mall':    '622127df097e5c3170553868',  // Invictus Fitness Green Mall
};

// ─── Утилиты конвертации DWH → формат нашего matching engine ─────────────────

// UTC timestamp → slot категория (UTC+5 Almaty)
function toTimeSlot(utcTs) {
  const almatyMs = new Date(utcTs).getTime() + 5 * 3600 * 1000;
  const d   = new Date(almatyMs);
  const dow  = d.getUTCDay();   // 0=Вс, 6=Сб
  const hour = d.getUTCHours();
  if (dow === 0 || dow === 6)          return 'Выходные';
  if (hour >= 7  && hour < 12)         return 'Утро (7–12)';
  if (hour >= 12 && hour < 17)         return 'День (12–17)';
  return 'Вечер (17–22)';
}

// UTC timestamp → "14:00" (Almaty)
function formatTime(utcTs) {
  const d = new Date(new Date(utcTs).getTime() + 5 * 3600 * 1000);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

// UTC timestamp → "Сегодня" / "Завтра" / "Понедельник" (Almaty)
function formatDay(utcTs) {
  const almatyNow  = new Date(Date.now() + 5 * 3600 * 1000);
  const almatyDate = new Date(new Date(utcTs).getTime() + 5 * 3600 * 1000);
  const todayStr   = almatyNow.toISOString().slice(0, 10);
  const tomorrowStr= new Date(Date.now() + 5 * 3600 * 1000 + 86_400_000).toISOString().slice(0, 10);
  const dateStr    = almatyDate.toISOString().slice(0, 10);
  if (dateStr === todayStr)    return 'Сегодня';
  if (dateStr === tomorrowStr) return 'Завтра';
  const DAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  return DAYS[almatyDate.getUTCDay()];
}

// Число (1/2/3) → лейбл уровня
function toLevelLabel(n) {
  return ({ '1': 'Новичок', '2': 'Средний', '3': 'Уверенный' })[String(n)] ?? 'Средний';
}

// Возраст (число) → диапазон нашего UI
function toAgeRange(age) {
  if (!age || age < 16) return '';
  if (age <= 20) return '16–20';
  if (age <= 25) return '21–25';
  if (age <= 30) return '26–30';
  if (age <= 35) return '31–35';
  if (age <= 40) return '36–40';
  if (age <= 50) return '40–50';
  return '50+';
}

// Статус по данным из usersubscriptions
function toMemberStatus(sub) {
  if (!sub) return 'купила пробный доступ';
  const visits       = parseInt(sub.visits_count, 10) || 0;
  const daysSinceBuy = sub.purchase_date
    ? Math.floor((Date.now() - new Date(sub.purchase_date).getTime()) / 86_400_000)
    : 9999;
  if (visits === 0)                     return 'впервые иду в Invictus Girls';
  if (daysSinceBuy < 30 && visits < 5) return 'купила пробный доступ';
  if (visits < 8)                       return 'хожу иногда';
  return 'хожу регулярно';
}

// Примерная цель по названию программы (инференс)
const PROGRAM_GOAL = {
  'INVICTUS GLUTE LAB': 'Ягодицы',
  'Brazillian Butt':    'Ягодицы',
  'Barre Booty':        'Ягодицы',
  'INVICTUS BOOTCAMP':  'Похудение',
  'INVICTUS RACE':      'Похудение',
  'Cycle':              'Похудение',
  'Zumba':              'Похудение',
  'INVICTUS STRONG':    'Тонус',
  'BodySculpt':         'Тонус',
  'Core':               'Тонус',
  'Upper Body':         'Тонус',
  'Pilates mat':        'Тонус',
  'Stretching':         'Растяжка',
  'Aerostretching':     'Растяжка',
  'Yoga':               'Растяжка',
  'Yoga Nidra':         'Растяжка',
  'INVICTUS BALANCE':   'Растяжка',
  'МФР':                'Растяжка',
  'Bootcamp Stretching':'Растяжка',
};

// Генератор локальных ID
function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── DWH read-only запросы ────────────────────────────────────────────────────
// Только SELECT. Никаких CREATE / INSERT / UPDATE / DELETE.

async function fetchClientProfile(userId) {
  const { rows } = await db.query(
    `SELECT u.id, u.first_name, u.gender,
            DATE_PART('year', AGE(u.birth_date)) AS age,
            u.subscription_is_active,
            u.subscription_start_date,
            u.clubs,
            CASE WHEN u.expo_push_token IS NOT NULL THEN true ELSE false END AS has_push
     FROM mongo.users u
     WHERE u.id = $1
       AND u.is_deleted IS DISTINCT FROM true`,
    [userId]
  );
  return rows[0] ?? null;
}

async function fetchClientSubscription(userId) {
  const { rows } = await db.query(
    `SELECT us.user, us.visits_count, us.purchase_date, us.is_active, us.club
     FROM mongo.usersubscriptions us
     WHERE us.user = $1
       AND us.is_active = true
       AND us.is_deleted IS DISTINCT FROM true
     ORDER BY us.purchase_date DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

// Ближайшие события клуба с участниками (до 7 дней вперёд)
async function fetchUpcomingEvents(clubId) {
  const { rows } = await db.query(
    `SELECT e.id,
            e.time_start,
            e.time_end,
            e.participants,
            e.max_person,
            gt.name  AS program,
            gt.level AS program_level,
            array_length(e.participants, 1) AS booked_count
     FROM mongo.events e
     JOIN mongo.grouptrainings gt ON gt.id = e.group_training
     WHERE e.club_id = $1
       AND e.time_start BETWEEN NOW() AND NOW() + INTERVAL '7 days'
       AND e.is_deleted IS DISTINCT FROM true
       AND e.participants IS NOT NULL
       AND array_length(e.participants, 1) > 0
     ORDER BY e.time_start
     LIMIT 60`,
    [clubId]
  );
  return rows;
}

// Профили участников — только женщины (Girls-клубы)
async function fetchParticipantProfiles(userIds) {
  if (!userIds?.length) return [];
  const { rows } = await db.query(
    `SELECT u.id,
            u.first_name,
            u.gender,
            DATE_PART('year', AGE(u.birth_date)) AS age,
            u.subscription_is_active,
            u.subscription_start_date
     FROM mongo.users u
     WHERE u.id = ANY($1)
       AND u.gender = 'female'
       AND u.is_deleted IS DISTINCT FROM true`,
    [userIds]
  );
  return rows;
}

// Активные абонементы участников
async function fetchParticipantSubscriptions(userIds) {
  if (!userIds?.length) return [];
  const { rows } = await db.query(
    `SELECT DISTINCT ON (us.user)
            us.user, us.visits_count, us.purchase_date, us.is_active
     FROM mongo.usersubscriptions us
     WHERE us.user = ANY($1)
       AND us.is_active = true
       AND us.is_deleted IS DISTINCT FROM true
     ORDER BY us.user, us.purchase_date DESC`,
    [userIds]
  );
  return rows;
}

// ─── Конвертация DWH events → кандидаты для matching engine ──────────────────

function buildDwhCandidates(events, profiles, subscriptions, clubName) {
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const subMap     = Object.fromEntries(subscriptions.map(s => [s.user, s]));
  const candidates = [];

  for (const ev of events) {
    if (!ev.participants?.length) continue;

    const booked   = parseInt(ev.booked_count, 10) || ev.participants.length;
    const isGroup  = booked > 1;
    const timeSlot = toTimeSlot(ev.time_start);
    const time     = formatTime(ev.time_start);
    const day      = formatDay(ev.time_start);
    const level    = toLevelLabel(ev.program_level);
    const goal     = PROGRAM_GOAL[ev.program] || 'Тонус';

    if (isGroup) {
      // Представляем всю группу одной карточкой
      candidates.push({
        id:             `dwh_${ev.id}_group`,
        anonymizedName: `${booked} девушки`,
        initials:       `+${booked}`,
        club:           clubName,
        program:        ev.program,
        timeSlot,
        time,
        day,
        format:         'в мини-группе (3–5 чел.)',
        level,
        goal,
        ageRange:       '',
        memberStatus:   'хожу иногда',
        isGroup:        true,
        groupSize:      booked,
        source:         'dwh',
        eventId:        ev.id,
      });
    } else {
      // Показываем индивидуальных участников (max 3 per event)
      for (const userId of ev.participants.slice(0, 3)) {
        const p = profileMap[userId];
        if (!p) continue;
        const sub = subMap[userId];
        candidates.push({
          id:             `dwh_${ev.id}_${userId}`,
          anonymizedName: p.first_name || 'Участница',
          initials:       (p.first_name || 'У').charAt(0),
          club:           clubName,
          program:        ev.program,
          timeSlot,
          time,
          day,
          format:         'с одной девушкой',
          level,
          goal,
          ageRange:       toAgeRange(parseFloat(p.age)),
          memberStatus:   toMemberStatus(sub),
          isGroup:        false,
          source:         'dwh',
          eventId:        ev.id,
        });
      }
    }
  }

  return candidates;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

// GET /api/buddy/candidates?club=Girls Crystal&days=7
// Возвращает предстоящие события клуба с участниками (read-only DWH)
router.get('/candidates', async (req, res, next) => {
  const { club = 'Girls Crystal' } = req.query;
  const clubId = CLUB_ID[club];

  if (!clubId) {
    return res.status(400).json({ ok: false, error: `Неизвестный клуб: ${club}` });
  }

  if (db.useMock()) {
    return res.json({
      ok: true, source: 'mock',
      count: mock.buddyPool.filter(b => b.club === club).length,
      events: mock.buddyPool.filter(b => b.club === club).slice(0, 10),
    });
  }

  try {
    const events = await fetchUpcomingEvents(clubId);
    res.json({
      ok:     true,
      source: 'dwh',
      count:  events.length,
      events: events.map(e => ({
        id:          e.id,
        program:     e.program,
        level:       toLevelLabel(e.program_level),
        timeStart:   e.time_start,
        timeLocal:   formatTime(e.time_start),
        dayLocal:    formatDay(e.time_start),
        timeSlot:    toTimeSlot(e.time_start),
        bookedCount: parseInt(e.booked_count, 10) || 0,
        maxPerson:   parseInt(e.max_person, 10) || 0,
        slotsLeft:   (parseInt(e.max_person, 10) || 0) - (parseInt(e.booked_count, 10) || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/buddy/request — сохраняет заявку на buddy в локальный JSON
// НЕ пишет в DWH.
router.post('/request', (req, res) => {
  const {
    clientId, club, program, timeSlot, format,
    level, goal, ageRange, memberStatus, anonymizedName,
  } = req.body;

  if (!club) return res.status(400).json({ ok: false, error: 'club is required' });

  const request = {
    id:             genId('req'),
    clientId:       clientId || null,
    anonymizedName: anonymizedName || 'Участница',
    initials:       anonymizedName ? anonymizedName.charAt(0) : 'У',
    club,
    clubId:         CLUB_ID[club] || null,
    program:        program      || '',
    timeSlot:       timeSlot     || '',
    format:         format       || '',
    level:          level        || '',
    goal:           goal         || '',
    ageRange:       ageRange     || '',
    memberStatus:   memberStatus || '',
    isGroup:        format === 'в мини-группе (3–5 чел.)',
    status:         'active',
    source:         'local',
    createdAt:      new Date().toISOString(),
  };

  store.append('buddy_requests', request);
  console.log(`[buddy/request] Created ${request.id} club=${club} program=${program}`);

  res.status(201).json({ ok: true, request });
});

// POST /api/buddy/find — главный endpoint матчинга
// 1. Профиль клиентки: form data + опциональное обогащение из DWH
// 2. Кандидаты из DWH: mongo.events → participants → users (read-only)
// 3. Кандидаты из локального JSON: buddy_requests.json
// 4. Matching engine → топ-5 результатов
router.post('/find', async (req, res, next) => {
  const {
    clientId, club, program, timeSlot, format,
    level, goal, ageRange, memberStatus,
  } = req.body;

  if (!club) return res.status(400).json({ ok: false, error: 'club is required' });

  const clubId = CLUB_ID[club];

  // 1. Базовый профиль из анкеты
  let userProfile = { club, program, timeSlot, format, level, goal, ageRange, memberStatus };

  // 2. Обогащение из DWH (если clientId передан и DWH доступен)
  if (clientId && !db.useMock()) {
    try {
      const [dwhUser, dwhSub] = await Promise.all([
        fetchClientProfile(clientId).catch(() => null),
        fetchClientSubscription(clientId).catch(() => null),
      ]);
      if (dwhUser) {
        userProfile = {
          ...userProfile,
          ageRange:     userProfile.ageRange     || toAgeRange(parseFloat(dwhUser.age)),
          memberStatus: userProfile.memberStatus || toMemberStatus(dwhSub),
          _dwh: {
            age:         dwhUser.age,
            visitsCount: dwhSub?.visits_count ?? null,
            hasPush:     dwhUser.has_push,
          },
        };
      }
    } catch (err) {
      console.warn(`[buddy/find] DWH profile enrichment failed: ${err.message}`);
    }
  }

  // 3. Кандидаты из DWH — реальные участники событий
  let dwhCandidates = [];
  let source        = 'mock';

  if (!db.useMock() && clubId) {
    try {
      const events = await fetchUpcomingEvents(clubId);

      // Собираем все уникальные participant IDs
      const allIds = [...new Set(events.flatMap(e => e.participants ?? []))];

      const [profiles, subs] = await Promise.all([
        fetchParticipantProfiles(allIds).catch(() => []),
        fetchParticipantSubscriptions(allIds).catch(() => []),
      ]);

      dwhCandidates = buildDwhCandidates(events, profiles, subs, club);
      source = 'dwh';

      console.log(`[buddy/find] DWH: ${events.length} events, ${allIds.length} participants → ${dwhCandidates.length} candidates`);
    } catch (err) {
      console.warn(`[buddy/find] DWH candidates failed: ${err.message} → mock fallback`);
      dwhCandidates = mock.buddyPool.filter(b => b.club === club);
      source = 'mock_fallback';
    }
  } else {
    dwhCandidates = mock.buddyPool.filter(b => b.club === club);
    source = db.useMock() ? 'mock' : 'mock_no_club_id';
  }

  // 4. Локальные заявки из buddy_requests.json
  const localCandidates = store.read('buddy_requests')
    .filter(r => r.club === club && r.status === 'active' && r.clientId !== clientId);

  // 5. Объединяем пулы и запускаем matching
  const allCandidates = [...dwhCandidates, ...localCandidates];
  const matches       = matching.findMatches(userProfile, allCandidates);

  res.json({
    ok: true,
    source,
    profile:        userProfile,
    matches,
    meta: {
      candidateTotal: allCandidates.length,
      dwhCount:       dwhCandidates.length,
      localCount:     localCandidates.length,
    },
  });
});

// POST /api/buddy/join — фиксирует намерение присоединиться к матчу
// Пишет ТОЛЬКО в локальные JSON-файлы. DWH не трогает.
router.post('/join', async (req, res) => {
  const {
    clientId, matchedId, eventId,
    action = 'join',
    program = '', club = '', time = '', day = '',
    score,
  } = req.body;

  if (!matchedId && !eventId) {
    return res.status(400).json({ ok: false, error: 'matchedId или eventId обязателен' });
  }

  const matchRecord = {
    id:          genId('match'),
    requesterId: clientId  || null,
    matchedId:   matchedId || null,
    eventId:     eventId   || null,
    action,
    program,
    club,
    time,
    day,
    score:       score ?? null,
    status:      'confirmed',
    createdAt:   new Date().toISOString(),
  };

  store.append('buddy_matches', matchRecord);
  console.log(`[buddy/join] ${matchRecord.id} action=${action} event=${eventId ?? '—'}`);

  // Если есть eventId — создаём buddy_event
  if (eventId) {
    const buddyEvent = {
      id:           genId('bev'),
      matchId:      matchRecord.id,
      eventId,
      participants: [clientId, matchedId].filter(Boolean),
      program,
      club,
      status:       'scheduled',
      createdAt:    new Date().toISOString(),
    };
    store.append('buddy_events', buddyEvent);
  }

  const MESSAGES = {
    join:   'Ты в группе! Увидимся на тренировке 💪',
    pair:   'Запись оформлена! Ждём вас обеих 🎉',
    remind: 'Напомним за 2 часа до тренировки 🔔',
  };

  res.status(201).json({
    ok:      true,
    match:   matchRecord,
    message: MESSAGES[action] ?? MESSAGES.join,
  });
});

// GET /api/buddy/profile/:clientId — профиль клиентки из DWH (read-only)
router.get('/profile/:clientId', async (req, res, next) => {
  const { clientId } = req.params;

  if (db.useMock()) {
    return res.json({
      ok: true, source: 'mock', profile: null,
      note: 'DWH недоступен — анкета заполняется вручную',
    });
  }

  try {
    const [user, sub] = await Promise.all([
      fetchClientProfile(clientId),
      fetchClientSubscription(clientId),
    ]);

    if (!user) return res.json({ ok: true, source: 'dwh', profile: null });

    res.json({
      ok:      true,
      source:  'dwh',
      profile: {
        firstName:    user.first_name,
        gender:       user.gender,
        age:          user.age ? Math.floor(parseFloat(user.age)) : null,
        ageRange:     toAgeRange(parseFloat(user.age)),
        memberStatus: toMemberStatus(sub),
        hasPushToken: user.has_push,
        subscription: sub ? {
          isActive:    sub.is_active,
          visitsCount: parseInt(sub.visits_count, 10) || 0,
          purchaseDate: sub.purchase_date,
        } : null,
      },
    });
  } catch (err) {
    if (db.isSchemaMissing(err)) {
      return res.json({ ok: true, source: 'mock', profile: null });
    }
    next(err);
  }
});

module.exports = router;
