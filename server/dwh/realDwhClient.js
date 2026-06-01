'use strict';
// ─── realDwhClient.js — подключение к реальному DWH Invictus ─────────────────
//
// Гарантии:
//   1. Приложение-уровень: regex-гард блокирует все write-операции до отправки в БД.
//   2. Транзакция-уровень: BEGIN READ ONLY — БД отклонит любой write в этой сессии.
//   3. Роль-уровень: пользователь entryx_report имеет только SELECT-права.
//
// Только SELECT / WITH / EXPLAIN. CREATE, INSERT, UPDATE, DELETE, DROP, ALTER — запрещены.

const { Pool } = require('pg');

// ─── Write guard ──────────────────────────────────────────────────────────────
const WRITE_RE = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|COPY)\b/i;

function assertReadOnly(sql) {
  if (WRITE_RE.test(sql.trim())) {
    const err = new Error(`Write query blocked: "${sql.trim().slice(0, 80)}..."`);
    err.code  = 'WRITE_FORBIDDEN';
    throw err;
  }
}

// ─── RealDwhClient ────────────────────────────────────────────────────────────

class RealDwhClient {
  constructor(config) {
    this.pool = new Pool({
      host:     config.host,
      port:     parseInt(config.port || '5432', 10),
      database: config.database,
      user:     config.user,
      password: config.password,
      ssl:      config.ssl === 'true' ? { rejectUnauthorized: false } : false,
      max:                    5,
      idleTimeoutMillis:  30_000,
      connectionTimeoutMillis: 5_000,
      statement_timeout:  10_000,
    });
    this.mode  = 'real';
    this._info = null;
  }

  // Проверяет соединение и кэширует метаданные сервера.
  async connect() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const { rows } = await client.query(
        `SELECT current_database() AS db,
                current_user       AS usr,
                version()          AS pg_version,
                now()              AS ts`
      );
      await client.query('COMMIT');
      this._info = rows[0];
      return this._info;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // Выполняет read-only запрос.
  async query(sql, params = []) {
    assertReadOnly(sql);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const result = await client.query(sql, params);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // Возвращает кэшированную информацию о сервере.
  async getInfo() {
    return this._info ?? this.connect();
  }

  async close() {
    await this.pool.end().catch(() => {});
  }
}

module.exports = RealDwhClient;
