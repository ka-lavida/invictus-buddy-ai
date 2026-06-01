'use strict';
// ─── routes/girls.js — /api/girls/* ──────────────────────────────────────────

const { Router } = require('express');
const dwh = require('../dwh');

const router = Router();

// GET /api/girls/cities
router.get('/cities', async (_req, res, next) => {
  try {
    const cities = await dwh.client.getGirlsCities();
    res.json({ ok: true, source: dwh.mode(), cities });
  } catch (err) {
    next(err);
  }
});

// GET /api/girls/clubs?city=Алматы
router.get('/clubs', async (req, res, next) => {
  try {
    const clubs = await dwh.client.getGirlsClubs(req.query.city || null);
    res.json({ ok: true, source: dwh.mode(), clubs });
  } catch (err) {
    next(err);
  }
});

// GET /api/girls/programs?club=Crystal
router.get('/programs', async (req, res, next) => {
  try {
    const programs = await dwh.client.getGirlsGroupPrograms(req.query.club || null);
    res.json({ ok: true, source: dwh.mode(), programs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
