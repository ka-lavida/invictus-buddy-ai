'use strict';
// ─── server/dwh/index.js — DWH router ────────────────────────────────────────
//
// Выбирает клиент по наличию credentials в server/.env:
//   • Все 4 переменные заполнены → RealDwhClient (PostgreSQL через pg)
//   • Хотя бы одна пустая       → MockDwhClient (fallback)
//
// Логирует в консоль: "DWH mode: real" или "DWH mode: mock"
//
// Экспортирует API, совместимый со старым server/db.js:
//   connect(), query(), useMock(), mode(), isSchemaMissing(), getInfo()

const path = require('path');

// Загружаем server/.env явно по пути — не зависим от CWD
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const RealDwhClient = require('./realDwhClient');
const MockDwhClient = require('./mockDwhClient');

// ─── Выбор клиента ────────────────────────────────────────────────────────────

const REQUIRED = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing  = REQUIRED.filter(k => !process.env[k]?.trim());

let _client;
let _mode;

if (missing.length === 0) {
  _mode   = 'real';
  _client = new RealDwhClient({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT     || '5432',
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl:      process.env.DB_SSL      || 'true',
  });
} else {
  _mode   = 'mock';
  _client = new MockDwhClient();
  console.log(`[dwh] DWH mode: mock  (missing env: ${missing.join(', ')})`);
}

// ─── connect() — вызывается один раз при старте сервера ───────────────────────

async function connect() {
  if (_mode !== 'real') return;   // mock — нечего подключать

  try {
    const info = await _client.connect();
    console.log(`[dwh] DWH mode: real  db="${info.db}"  user="${info.usr}"  pg="${info.pg_version?.split(',')[0]}"`);
  } catch (err) {
    // Если реальное подключение не получилось — переходим на mock
    console.error(`[dwh] Connection failed: ${err.message}`);
    console.log('[dwh] DWH mode: mock  (fallback after connection error)');
    _mode   = 'mock';
    _client = new MockDwhClient();
  }
}

// ─── query() — read-only SELECT/WITH/EXPLAIN ─────────────────────────────────

async function query(sql, params = []) {
  if (_mode !== 'real') {
    const err = new Error('DWH not available (mock mode)');
    err.code  = 'DB_UNAVAILABLE';
    throw err;
  }
  return _client.query(sql, params);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// true  → routes используют mock.js
// false → routes идут в DWH
const useMock = () => _mode !== 'real';

// Текущий режим: 'real' | 'mock' | 'mock_fallback'
const mode = () => _mode;

// Метаданные сервера для /api/health
const getInfo = () => _client.getInfo();

// Коды ошибок PostgreSQL, указывающих на отсутствующий объект в схеме
// 42P01 = undefined_table, 42703 = undefined_column, 42883 = undefined_function
const isSchemaMissing = (err) =>
  ['42P01', '42703', '42883'].includes(err?.code);

// client — used by routes that call mock-specific methods (girls.js)
const getClient = () => _client;

module.exports = { connect, query, useMock, mode, isSchemaMissing, getInfo, get client() { return _client; } };
