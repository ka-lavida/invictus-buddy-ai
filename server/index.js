'use strict';
// ─── Invictus Buddy AI — Backend Server ──────────────────────────────────────
//
// ┌─ Как запускать ─────────────────────────────────────────────────────────────
// │
// │  1. Скопируй .env.example → .env и заполни DB_* переменные (если есть DWH).
// │     Без .env сервер стартует в mock-режиме — всё работает без базы.
// │
// │  2. Запуск:
// │       cd server && npm run dev       # с --watch (авто-рестарт)
// │       cd server && npm start         # без --watch (prod)
// │
// │  3. Frontend (в отдельном терминале):
// │       cd .. && npm run dev           # http://localhost:5173
// │
// │  4. Backend API:          http://localhost:3001
// │     Health check:         http://localhost:3001/api/health
// │     Swagger/docs:         not yet
// │
// └─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const dwh        = require('./dwh');       // единственный источник DWH
const buddyRouter = require('./routes/buddy');
const adminRouter = require('./routes/admin');

const app  = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '256kb' }));

// Request logger (dev-friendly, one line per request)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/health — статус сервера и DWH
app.get('/api/health', async (_req, res) => {
  const dwhMode = dwh.mode();                    // 'real' | 'mock' | 'mock_fallback'
  const info    = { mode: dwhMode, connected: dwhMode === 'real' };

  if (dwhMode === 'real') {
    try {
      const meta   = await dwh.getInfo();
      info.user    = meta.usr;
      info.db      = meta.db;
      info.version = meta.pg_version ? meta.pg_version.split(',')[0] : null;
    } catch (err) {
      info.connected = false;
      info.error     = err.message;
    }
  }

  res.json({
    ok:        true,
    server:    'running',
    dwh:       info,
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
  });
});

app.use('/api/buddy', buddyRouter);
app.use('/api/admin', adminRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ ok: false, error: err.message || 'Internal server error' });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function start() {
  await dwh.connect();   // инициализация DWH (не бросает — при ошибке → mock)

  app.listen(PORT, () => {
    const label = dwh.useMock() ? '⚠️  mock data' : '✅  DWH live';
    console.log(`\n[server] Invictus Buddy AI backend`);
    console.log(`[server] http://localhost:${PORT}   ${label}\n`);
  });
}

start().catch(err => {
  console.error('[fatal]', err);
  process.exit(1);
});
