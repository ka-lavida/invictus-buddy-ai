'use strict';
// ─── mockDwhClient.js — fallback когда .env не заполнен ──────────────────────
//
// Предоставляет тот же интерфейс, что и realDwhClient.
// Метод query() бросает DB_UNAVAILABLE — роутеры перехватывают это и отдают
// данные из mock.js вместо DWH.
// buddy_requests, buddy_matches, buddy_events хранятся в server/data/*.json
// и не зависят от этого клиента.

class MockDwhClient {
  constructor() {
    this.mode = 'mock';
  }

  async connect() {
    // Нет реального соединения — возвращаем нули
    return { db: null, usr: null, pg_version: null, ts: new Date().toISOString() };
  }

  // Роутеры вызывают query() только когда mode === 'real'.
  // Если вызов дошёл сюда — выбрасываем маркерную ошибку.
  async query(_sql, _params) {
    const err = new Error('DWH unavailable (mock mode)');
    err.code  = 'DB_UNAVAILABLE';
    throw err;
  }

  async getInfo() {
    return { db: null, usr: null, pg_version: null, ts: new Date().toISOString() };
  }

  async close() {}
}

module.exports = MockDwhClient;
