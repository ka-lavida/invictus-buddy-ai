'use strict';
// ─── routes/admin.js — /api/admin/* ──────────────────────────────────────────

const { Router } = require('express');
const db    = require('../db');
const mock  = require('../mock');
const store = require('../store');

const router = Router();

// ─── DWH queries ──────────────────────────────────────────────────────────────

// KPI-метрики из таблицы buddy_requests (если существует).
async function queryMetrics() {
  const { rows } = await db.query(`
    SELECT
      COUNT(*)                                          AS total_requests,
      COUNT(*) FILTER (WHERE matched_at IS NOT NULL)   AS matches_found,
      COUNT(*) FILTER (WHERE booked_at  IS NOT NULL)   AS booked_together,
      COUNT(*) FILTER (WHERE attended_at IS NOT NULL)  AS attended
    FROM public.buddy_requests
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);
  const r = rows[0];
  const total = parseInt(r.total_requests, 10) || 0;
  return {
    totalRequests:  total,
    matchesFound:   parseInt(r.matches_found,   10) || 0,
    bookedTogether: parseInt(r.booked_together, 10) || 0,
    attended:       parseInt(r.attended,        10) || 0,
    conversionRate: total > 0
      ? Math.round((parseInt(r.attended, 10) / total) * 1000) / 10
      : 0,
  };
}

// Воронка по программам (если существует buddy_requests).
async function queryFunnel() {
  const { rows } = await db.query(`
    SELECT
      COALESCE(program, 'Не указано') AS stage,
      COUNT(*)                        AS requests,
      COUNT(*) FILTER (WHERE matched_at  IS NOT NULL) AS matches,
      COUNT(*) FILTER (WHERE booked_at   IS NOT NULL) AS booked,
      COUNT(*) FILTER (WHERE attended_at IS NOT NULL) AS attended
    FROM public.buddy_requests
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY program
    ORDER BY requests DESC
    LIMIT 10
  `);
  return rows.map(r => ({
    stage:    r.stage,
    requests: parseInt(r.requests, 10),
    matches:  parseInt(r.matches,  10),
    booked:   parseInt(r.booked,   10),
    attended: parseInt(r.attended, 10),
    pct:      parseInt(r.requests, 10) > 0
      ? Math.round((parseInt(r.attended, 10) / parseInt(r.requests, 10)) * 1000) / 10
      : 0,
  }));
}

// ─── GET /api/admin/metrics ───────────────────────────────────────────────────
// KPI: всего запросов, матчей, записей, посещений, конверсия.

router.get('/metrics', async (req, res, next) => {
  if (db.useMock()) {
    return res.json({ ok: true, source: 'mock', data: mock.adminMetrics });
  }

  try {
    const data = await queryMetrics();
    res.json({ ok: true, source: 'dwh', data });
  } catch (err) {
    if (db.isSchemaMissing(err)) {
      console.warn('[admin/metrics] buddy_requests missing → mock');
      return res.json({ ok: true, source: 'mock', data: mock.adminMetrics });
    }
    next(err);
  }
});

// ─── GET /api/admin/funnel ────────────────────────────────────────────────────
// Воронка: запросы → матчи → записи → посещения.
// Также возвращает weekly trend и funnel breakdown из mock/DWH.

router.get('/funnel', async (req, res, next) => {
  if (db.useMock()) {
    return res.json({
      ok: true, source: 'mock',
      funnel: mock.funnelData,
      weekly: mock.weeklyTrend,
    });
  }

  try {
    const funnel = await queryFunnel();
    res.json({
      ok: true, source: 'dwh',
      funnel,
      weekly: mock.weeklyTrend, // weekly trend пока из mock даже при живом DWH
    });
  } catch (err) {
    if (db.isSchemaMissing(err)) {
      console.warn('[admin/funnel] buddy_requests missing → mock');
      return res.json({
        ok: true, source: 'mock',
        funnel: mock.funnelData,
        weekly: mock.weeklyTrend,
      });
    }
    next(err);
  }
});

// ─── GET /api/admin/requests ──────────────────────────────────────────────────
// Последние 5 buddy-запросов из локального JSON (не из DWH).
// Используется в admin-дашборде для отображения активности.

router.get('/requests', (req, res) => {
  const limit    = parseInt(req.query.limit ?? '5', 10);
  const requests = store.read('buddy_requests')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(r => ({
      id:           r.id,
      club:         r.club,
      program:      r.program,
      timeSlot:     r.timeSlot,
      ageRange:     r.ageRange,
      goal:         r.goal,
      memberStatus: r.memberStatus,
      status:       r.status,
      createdAt:    r.createdAt,
    }));

  res.json({ ok: true, count: requests.length, requests });
});

module.exports = router;
