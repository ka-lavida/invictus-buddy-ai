'use strict';
// ─── store.js — локальное JSON-хранилище ─────────────────────────────────────
// Все новые сущности (buddy_requests, buddy_matches, buddy_events) хранятся
// только на локальной машине в server/data/*.json.
// В DWH ничего не пишем — только read-only SELECT.

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Убеждаемся, что папка существует при первом импорте
fs.mkdirSync(DATA_DIR, { recursive: true });

function fp(name) {
  return path.join(DATA_DIR, name.endsWith('.json') ? name : `${name}.json`);
}

// Читает весь массив из JSON-файла. Возвращает [] если файл отсутствует.
function read(name) {
  try {
    return JSON.parse(fs.readFileSync(fp(name), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Перезаписывает весь файл новым массивом.
function write(name, data) {
  fs.writeFileSync(fp(name), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Добавляет одну запись в конец массива и сохраняет файл.
function append(name, record) {
  const arr = read(name);
  arr.push(record);
  write(name, arr);
  return record;
}

// Ищет запись по полю id.
function findById(name, id) {
  return read(name).find(r => r.id === id) ?? null;
}

// Обновляет запись по id, возвращает обновлённую запись или null.
function update(name, id, patch) {
  const arr = read(name);
  const idx = arr.findIndex(r => r.id === id);
  if (idx === -1) return null;
  arr[idx] = { ...arr[idx], ...patch, updatedAt: new Date().toISOString() };
  write(name, arr);
  return arr[idx];
}

// Удаляет запись по id (мягкое удаление через статус).
function deactivate(name, id) {
  return update(name, id, { status: 'cancelled' });
}

module.exports = { read, write, append, findById, update, deactivate };
