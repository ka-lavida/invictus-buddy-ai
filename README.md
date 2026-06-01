# Invictus Buddy AI

Хакатон-проект для Invictus Girls: **"Подруга для тренировки"**.  
Клиентке психологически легче прийти, если она видит, что другая девушка с похожей целью тоже идёт на эту программу.

---

## Быстрый старт

### Frontend (React + TypeScript + Vite)

```bash
# в корне проекта
npm install
npm run dev
# → http://localhost:5173
```

### Backend (Node.js + Express)

```bash
cd server

# 1. Создай .env из примера
cp .env.example .env
# Заполни DB_* переменные, если есть доступ к DWH.
# Без них сервер запускается в mock-режиме — всё работает.

# 2. Запуск
npm run dev        # с --watch (авто-рестарт при изменениях)
npm start          # для prod
# → http://localhost:3001
```

Оба сервиса запускаются независимо — фронтенд сейчас работает на mock данных без бэкенда.

---

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `GET`  | `/api/health` | Статус сервера и источника данных |
| `GET`  | `/api/buddy/profile/:clientId` | Профиль клиента из DWH |
| `POST` | `/api/buddy/find` | Матчинг — возвращает топ-5 совпадений |
| `POST` | `/api/buddy/join` | Записаться / присоединиться / напоминание |
| `GET`  | `/api/admin/metrics` | KPI дашборд |
| `GET`  | `/api/admin/funnel` | Воронка + недельный тренд |

### POST /api/buddy/find — тело запроса

```json
{
  "clientId":     "optional-crm-id",
  "club":         "Girls Crystal",
  "program":      "Barre",
  "timeSlot":     "Вечер (17–22)",
  "format":       "с одной девушкой",
  "level":        "Средний",
  "goal":         "Тонус",
  "ageRange":     "26–30",
  "memberStatus": "хожу иногда"
}
```

### Пример ответа

```json
{
  "ok": true,
  "source": "mock",
  "matches": [
    {
      "id": "gc1",
      "anonymizedName": "Аружан",
      "club": "Girls Crystal",
      "program": "Barre",
      "timeSlot": "Вечер (17–22)",
      "time": "19:00",
      "day": "Четверг",
      "level": "Средний",
      "goal": "Тонус",
      "ageRange": "26–30",
      "memberStatus": "хожу иногда",
      "score": 100,
      "reason": "Вы обе хотите Barre вечером с целью «Тонус»",
      "cta": "Записаться вместе"
    }
  ]
}
```

---

## Архитектура

```
invictus-buddy-ai/
├── src/                    # React frontend (Vite)
│   ├── data/mockData.ts    # Mock данные + типы
│   ├── utils/matching.ts   # Matching engine (client-side)
│   └── components/
│       ├── client/         # HeroBlock, BuddyForm, BuddyMatches
│       └── admin/          # Dashboard, Charts, Heatmap, AIInsights
│
└── server/                 # Node.js backend
    ├── index.js            # Express app + startup
    ├── db.js               # PostgreSQL pool + mock fallback
    ├── matching.js         # Server-side scoring engine
    ├── mock.js             # Fallback данные
    └── routes/
        ├── buddy.js        # /api/buddy/*
        └── admin.js        # /api/admin/*
```

---

## DWH подключение

Сервер подключается к **read-only** реплике PostgreSQL (DWH Invictus).

- Все запросы выполняются в транзакциях `BEGIN READ ONLY`
- Секреты только через `.env`, никогда в коде
- Если DWH недоступен → автоматический fallback на mock data
- Когда таблица `buddy_requests` будет создана в DWH → `source` в ответе переключится с `"mock"` на `"dwh"` автоматически

### Scoring model (server)

| Параметр | Очки | Логика |
|----------|------|--------|
| Клуб | +30 | Обязательное условие (порог отсечения) |
| Программа | +20 | «Не знаю» → засчитывается с любой программой |
| Время | +15 | Точное совпадение категории |
| Возраст | +10 | Та же группа; соседняя → +5 |
| Уровень | +10 | |
| Цель | +5 | |
| Статус | +5 | |
| Формат | +5 | «без разницы» → засчитывается с любым форматом |

**Максимум: 100 очков. Порог показа: ≥ 30 (тот же клуб).**

---

## Архитектура данных MVP

### DWH Invictus — только read-only через MCP

```
Claude Code чат  ──MCP OAuth──▶  DWH Invictus (PostgreSQL 15)
                                  db=master, user=entryx_report
```

- DWH **подтверждён через MCP** в ходе discovery: схемы `mongo`, `public`, `gymbuddy`
- Используется **исключительно для анализа** (SELECT/WITH/EXPLAIN)
- **Запрещено:** CREATE, INSERT, UPDATE, DELETE, DROP, ALTER — заблокированы на трёх уровнях:
  1. Regex-guard в `server/dwh/realDwhClient.js`
  2. `BEGIN READ ONLY` транзакция
  3. Роль `entryx_report` имеет только SELECT

### Новые сущности MVP — только локально

| Файл | Содержимое | Пишем в DWH? |
|---|---|---|
| `server/data/buddy_requests.json` | Заявки на buddy | ❌ Никогда |
| `server/data/buddy_matches.json` | Подтверждённые матчи | ❌ Никогда |
| `server/data/buddy_events.json` | Buddy-события | ❌ Никогда |

### Режимы сервера

| Режим | Условие | `/api/health` |
|---|---|---|
| `mock` | `server/.env` не заполнен | `"dwh": { "mode": "mock" }` |
| `real` | Все `DB_*` переменные заполнены | `"dwh": { "mode": "real", "user": "entryx_report" }` |

Для хакатона сервер работает в **mock mode** — данные реалистичные, DWH не нужен для запуска.
