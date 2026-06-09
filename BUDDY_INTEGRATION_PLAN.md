# Girls Match — Production Integration Plan (handoff)

**Status:** analysis complete, data de-risked, key decisions made. No production code written yet.
**Audience:** the next Claude Code instance (assume no memory of prior sessions).
**Goal:** port the validated buddy-matching feature ("Girls Match") from the hackathon demo into the real products — backend `invictusgo` + mobile `invictusv2`, with shared Mongoose models in `@invictusdev/invictus-models`.

---

## 0. Where to start

1. Read this whole doc. Then skim the demo's `src/utils/matching.ts`, `src/components/client/ClientWizard.tsx`, `src/components/client/BuddyMatches.tsx`, `src/utils/ai.ts`, `scripts/ai-context.ts` — that's the UX + logic spec.
2. **Phase 1 = backend.** Build `modules/girls-match/` in `invictusgo` (REST), with models added to `@invictusdev/invictus-models`. It's the riskiest/most foundational tier. Do NOT start with mobile UI — the demo already is the UI spec.
3. **Decisions are made** (see §4): feature name = **Girls Match**; models live in the shared `@invictusdev/invictus-models` package (local checkout). The remaining open items (§8) are policy/infra, not blockers for Phase 1 scaffolding.
4. **Do not edit `invictusv2` / `invictusgo` / `invictus-models` until the user explicitly approves building in them.** This session was analysis-only.

---

## 1. What the feature is

A women-only "training buddy" matcher inside Invictus Girls: a user answers a short quiz (goal, level, format, time, club, program), the system finds compatible women who train at the same club, and — after **mutual consent** — they book a group class together and build a habit. A lighter "pick a group program" entry recommends classes (+ club + proximity) and bridges into buddy-finding.

The full hackathon demo lives in **this repo** (`invictus-buddy-ai`, a Vite/React web app). It is the clickable spec + copy source. Production rebuilds it across mobile + backend tiers.

### Demo files = the spec
| Concern | Demo file |
|---|---|
| Matching engine (weights, threshold, reasons) | `src/utils/matching.ts` |
| Onboarding quiz (8 steps, auto-advance) | `src/components/client/ClientWizard.tsx` |
| Group-program / class finder (6-Q quiz → classes + club + proximity) | `src/components/client/GroupProgramFinder.tsx` |
| Matches list, book-together, repeat, icebreaker | `src/components/client/BuddyMatches.tsx` |
| Post-session feedback (ОС о занятии, 4 Qs → rebook/invite/learn) | `src/components/client/SessionFeedback.tsx` |
| Referral / invite-a-friend | `src/components/client/InviteFriend.tsx` |
| AI layer (explain / icebreakers / recommend-programs) + fallbacks | `src/utils/ai.ts` |
| AI server prompts + cached brand/program context | `scripts/ai-middleware.ts`, `scripts/ai-context.ts` |
| Clubs (GPS), programs (level/goals/desc), CLUB_PROGRAMS | `src/data/girlsData.ts` |
| Proximity (haversine) | `src/utils/proximity.ts` |

### Demo matching model (from `src/utils/matching.ts`)
Weighted score, max 100, threshold 40 (club is mandatory):
`club +40 (required)`, `program +25` ("Не знаю" matches any), `timeSlot +15`, `level +10`, `goal +5`, `format +5` ("без разницы" matches any). Sort desc, top 5. Reasons are templated from which dimensions matched. **Production must adapt this — see §5.3.**

---

## 2. Verified facts about the target codebases

> Confirmed by reading the repos (paths verified). Don't re-discover.

### `invictusgo` (backend) — `C:\Users\mrbqble\Desktop\Invictus\invictusgo`
- **Node.js + Express, NOT Go** (`main: src/index.js`, CommonJS, node ≥20, Babel build to `build/`).
- **Mongoose 8** + MongoDB. **Models come from the shared npm package `@invictusdev/invictus-models`** (see §4 for its local path + convention). Also Postgres (`pg`).
- **Module pattern**: `src/modules/<feature>/{<f>.routes.js, <f>.controller.js, <f>.service.js, <f>.swagger.js, validators/, utils/}`. Services extend `src/common/services/BaseService.js`.
- **Route registration**: central in `src/routes/index.js` (e.g. `app.use('/api/modules/coaches', router)`). Reference module: `src/modules/coaches/`. Async handlers wrapped with `wrapAsync`; validation via `validate(schema)` middleware.
- **Auth**: Passport `user-jwt`; `requireUser`/`requireToken`/`requireAccess` in `src/helpers/roles.js`; authenticated user on `req.user`.
- **Proximity (REUSE)**: `src/modules/clubs/utils/geo-distance.js` (`haversineKm`, `getClubCoordinates` — club coords at `club.mapLink.center = [lng, lat]`) + `src/modules/clubs/club-ranking.service.js` (`attachDistance`, `rank`).
- **AI already integrated (REUSE)**: `src/config/openai.js` + `src/use-cases/healthAI/invivo-recommendations/get-invivo-recommendations.js` (OpenAI chat→JSON). Use this for Girls Match AI server-side — do NOT ship keys to the mobile client.
- **Vector DB available**: `@pinecone-database/pinecone` — path to "self-learning matching" (embeddings) post-MVP.
- **Push / async**: RabbitMQ (`@invictusdev/invictus-rabbitmq`, consumers in `src/consumers/`), in-app `src/modules/pos-notifications/`, external push `src/use-cases/push30/`.
- **Migrations**: `migrate-mongo` (`npm run migration:create` / `up`).

### `invictusv2` (mobile) — `C:\Users\mrbqble\Desktop\Invictus\invictusv2`
- **React Native + Expo + TypeScript**, React Navigation v6, **Apollo (GraphQL) + axios (REST)**, **Zustand** + React **Context** + React **Query**, MMKV storage.
- **API layer**: `src/api/axios.ts` — multiple instances; **`apiAxios` (baseURL = `BASE_URL`) is the main invictusgo backend** → Girls Match endpoints go here. Bearer token auto-injected from MMKV key `inv-token`.
- **Group-class schedule + booking (INTEGRATE HERE)**: `src/Client/features/trainings/groupTrainings/screens/GPSchedule.tsx`, `.../GroupTrainingEventModal.tsx`, `src/Client/features/trainings/api/groupTrainings.ts` (`useAddEventParticipant`, etc.). Where "find a buddy for this class" + "записаться вместе" plug in.
- **Feature pattern**: feature folders under `src/Client/features/<feature>/` with `router/index.tsx` + `router/route.enum.ts`, registered as `Stack.Screen` in `src/Client/router/Router.js`.
- **Reusable**: `src/hooks/useGetLocation.ts` (geo), `src/features/selectors/screens/ClubSelectorScreen.tsx`, `src/components/UI/` (Button, Typography, Avatar, BottomSheet…), `src/navigation/hooks/usePushNotificationListener.ts`, feature flags.
- **⚠️ NAME COLLISION (resolved)**: `src/GymBuddy2.0/` is Invictus's **AI workout-plan player** (WorkoutPlayerV2, TrainingDay, Exercise, Marathon) — a digital coach you subscribe to, **NOT** human buddy-matching. Our feature is named **«Girls Match»** (Russian UI label «Найди подругу») — never "GymBuddy".

---

## 3. Data findings (DWH) — matching is viable and abundant

DWH = PostgreSQL exposing Mongo collections under schema `mongo` (read-only MCP). Validated over the **6 Girls clubs, last 90 days**:

- **Candidate pools are large**: 300–600 distinct co-participants per popular `club × program × time-slot`; **500–1,000 recurring members per club**; avg **9–12 visits/user/90d**; one-offs only ~20%.
- **The constraint is narrowing, not finding.** Quiz prefs + co-attendance do the narrowing.

### What's observable (use directly)
- `mongo.events`: `participants` (varchar[] of user ids), `participants_list` (jsonb `{user, checkedIn, accessType, ...}`), `club_id`, `group_training` (→ `mongo.grouptrainings.name` = program), `time_start`, `max_person`, `coach_id`.
- **Co-attendance** (two users sharing `event.id`) = the strongest "natural buddy" signal — the demo's mock pool couldn't model this; production should weight it heavily.
- `mongo.users.birth_date` → age. Women-only clubs → gender implicit.
- Activity/regularity (memberStatus proxy) = visit-frequency buckets.
- Also: `mongo.v_group_training_users` (convenience view with participants).

### What must be collected via the quiz → stored `GirlsMatchProfile`
- **goal, level, format** (subjective; not in any source).

### Girls club ids (events.club_id)
`Crystal 68c14ef824acbd015e2bc852`, `Tole bi 69032e8a20c1f805985d5bbd`, `Orynbor 6576f7a426f20202bd273ebd`, `Kunaeva 63b85152053d7a00ccf5a611`, `Sfera 693fe563bda05da33d2bf063`, `Karaganda 69a5246364580ebbac2be7cb`.

### Re-runnable validation SQL (proves density)
```sql
WITH girls(club_id, club) AS (VALUES
  ('68c14ef824acbd015e2bc852','Crystal'),('69032e8a20c1f805985d5bbd','Tole bi'),
  ('6576f7a426f20202bd273ebd','Orynbor'),('63b85152053d7a00ccf5a611','Kunaeva'),
  ('693fe563bda05da33d2bf063','Sfera'),('69a5246364580ebbac2be7cb','Karaganda'))
SELECT g.club, gt.name AS program,
  CASE WHEN extract(hour from e.time_start)<12 THEN 'утро'
       WHEN extract(hour from e.time_start)<17 THEN 'день' ELSE 'вечер' END AS slot,
  count(DISTINCT p) distinct_users, count(*) participations, count(DISTINCT e.id) events
FROM mongo.events e
JOIN girls g ON g.club_id=e.club_id
JOIN mongo.grouptrainings gt ON gt.id=e.group_training
CROSS JOIN LATERAL unnest(e.participants) AS p
WHERE e.is_deleted IS NOT TRUE AND e.time_start >= now()-interval '90 days'
GROUP BY 1,2,3 ORDER BY distinct_users DESC LIMIT 25
```
(MCP SQL tool: no trailing `;`.) The real program catalog is broader than the demo's 9 (Cycle, Pilates Reformers, Skinny bitches, Свободная тренировка, Здоровая спина, МФР…) — map the quiz to real `group_training` names/categories per club, not the demo's hardcoded list.

---

## 4. Decisions made

- **Feature name: "Girls Match"** (Russian UI label «Найди подругу»). NOT "GymBuddy" (taken — see §2). Backend module = `girls-match`; mobile feature = `girlsMatch`; models prefixed `GirlsMatch*`.
- **Backend home: a new REST module `src/modules/girls-match/` in `invictusgo`**, reached via `apiAxios` (`/api/modules/girls-match/...`). Mirrors `src/modules/coaches/`.
- **Models live in `@invictusdev/invictus-models`** (the shared package). Local checkout: **`C:\Users\mrbqble\Desktop\Invictus\invictus-models`** (pkg `@invictusdev/invictus-models`, v1.29.2 locally; invictusgo consumes `^1.29.3`). **Verified convention to follow:**
  - One folder per model: `models/<kebab-name>/` containing `<name>.model.js` (Mongoose schema + `model()`), `<name>.constants.js` (enums), and `index.js` (barrel). Examples: `models/coaches/`, `models/clubs/`, `models/community-events/`.
  - Register the new model in the root `index.js` aggregator.
  - Reuse shared sub-schemas from `constants/schemas/` (`timestamps`, `map`, `multilingual-string`).
  - After adding models, run `npm run generate:types` (emits `types/*.d.ts`), bump the package version, then bump invictusgo's dependency to consume them.
  - **Add three models:** `models/girls-match-profiles/` (`GirlsMatchProfile`), `models/girls-matches/` (`GirlsMatch`), `models/girls-match-feedback/` (`GirlsMatchFeedback`).
- **AI runs server-side** in invictusgo (reuse `config/openai.js`). The demo used Anthropic Haiku via a Vite dev middleware; in production keep OpenAI (already wired) or add Anthropic — see §8.
- **Proximity reuses** `modules/clubs` geo utilities (don't re-implement haversine).

---

## 5. Backend design — `modules/girls-match/`

### 5.1 Data model (Mongoose; lives in `@invictusdev/invictus-models` per §4)
**`GirlsMatchProfile`** (`models/girls-match-profiles/`) — one per opted-in user
- `user` (ref Users, unique, indexed), `clubId`, `city`
- `goal` (enum: Похудение|Тонус|Ягодицы|Растяжка|Вернуться в режим|Просто начать)
- `level` (enum: Новичок|Средний|Уверенный)
- `format` (enum: one_on_one | mini_group | any)
- `timeSlots` ([enum: morning|day|evening|weekend])
- `programInterests` ([group_training name or category id])
- `ageRange` (derived from `users.birth_date` at read time, or cached)
- `isActive` (bool), `optedOutUserIds` ([ref]), timestamps

**`GirlsMatch`** (`models/girls-matches/`) — the consent record (see state machine)
- `requester` (ref), `target` (ref), `status` (enum below), `score` (num), `reasons` ([str] snapshot)
- `classContext` (optional `{clubId, groupTraining, eventId}` — "for this class")
- `contactUnlocked` (bool — true ONLY when accepted), `requestedAt`, `respondedAt`, `expiresAt`, timestamps
- unique compound index on sorted `(requester, target)` to prevent dupes

**`GirlsMatchFeedback`** (`models/girls-match-feedback/`) — post-session ОС (feeds self-learning + reactivation)
- `match` (ref GirlsMatch), `user` (ref), `trainerRating`, `sessionRating`, `likedBuddy` (bool), `wouldGoAgain` (bool), timestamps

Put the enums in each model's `<name>.constants.js`.

### 5.2 Consent / privacy state machine (NON-NEGOTIABLE)
`suggested → requested → accepted | declined | expired`
- Candidates are returned **anonymized** (no name/photo/contact) — show only matchable attributes ("Новичок · вечер · цель Тонус · ходит 3×/нед · 350 м").
- `requester` sends a request → `target` gets a push → accept flips `status=accepted` + `contactUnlocked=true` (now both see identity + can book together) or decline.
- Identity/contact is **never** exposed before `accepted`, enforced in the service layer (not the client). This is the trust core of a women-only product.

### 5.3 Matching algorithm
**Candidate pool** for user U: recurring participants at `U.clubId` in last 90d (from `events.participants`), excluding U, declined/blocked users, and non-opted-in users per privacy policy. Aggregate per candidate C: observed `programs`, `timeSlots`, `visitCount`, `lastVisit`, and (if exists) C's `GirlsMatchProfile`.

**Score(U, C)** — adapt the demo's weights, add the data-only signals:
- **co-attendance** (# shared events U & C attended): strongest signal — weight high. 0 for brand-new U (cold-start).
- program overlap (U.programInterests ∩ C.observed programs)
- time-slot overlap (U.timeSlots ∩ C.observed slots)
- goal / level / format match (only when C has a `GirlsMatchProfile`; neutral otherwise)
- age proximity (|age(U)−age(C)|)
- activity compatibility (similar visit frequency)
- club distance (reuse `club-ranking`; mostly relevant for the cross-club group-program finder, since buddies share a club)

Rank desc, keep top N, drop below a quality threshold. **Cold-start**: a brand-new U (no participation) is scored on stated-prefs vs candidates' observed behavior; quality compounds as more users complete the quiz and accrue attendance.

### 5.4 Endpoints (REST, `/api/modules/girls-match`)
- `POST /profile` — create/update Girls Match profile (the quiz result)
- `GET  /profile/me`
- `GET  /matches` — ranked **anonymized** candidates for `req.user`
- `POST /matches/request` `{ targetUserId, classContext? }` — send request
- `POST /matches/:id/accept` · `POST /matches/:id/decline`
- `GET  /matches/mine` — my pending + accepted matches (accepted include identity)
- `POST /matches/:id/icebreakers` — AI openers (server OpenAI; port `ai.ts` + `ai-context.ts`)
- `POST /matches/:id/feedback` — post-session ОС
- `GET  /classes/recommend` — group-program finder output (classes + club + proximity); reuse `club-ranking` + `grouptrainings`
All behind `requireUser`; validate inputs; document in `*.swagger.js`; register in `src/routes/index.js`.

### 5.5 AI (server-side)
Port from the demo: `scripts/ai-context.ts` (SYSTEM_CONTEXT: brand voice + program catalog + matching rubric + few-shot) and the prompt builders in `scripts/ai-middleware.ts` (explain / icebreakers / recommend-programs, structured JSON). Call via `config/openai.js`. Keep deterministic fallbacks (the demo's `localExplain` / `localIcebreakers`) so the feature degrades gracefully.

---

## 6. Mobile design — `invictusv2`
- New feature `src/Client/features/girlsMatch/` ("Girls Match"): `router/index.tsx` + `route.enum.ts`, registered in `src/Client/router/Router.js`.
- `api/girlsMatch.ts` — React Query hooks calling `apiAxios` (the §5.4 endpoints). Zustand `girlsMatchStore` for quiz answers + current match state.
- Screens (port the demo UX, reuse `components/UI/`):
  - **Quiz** (port `ClientWizard` + `GroupProgramFinder`, keep auto-advance)
  - **Matches** (port `BuddyMatches`; show anonymized cards until accepted)
  - **Match detail / consent** (request → accepted reveals identity + "записаться вместе")
  - **Feedback** (port `SessionFeedback`)
  - **Invite** (port `InviteFriend`)
- **Integrate into class booking**: add a "Найти подругу на это занятие" CTA in `groupTrainings/screens/GroupTrainingEventModal.tsx`; "записаться вместе" reuses `useAddEventParticipant`.
- Reuse `useGetLocation` (proximity), extend `usePushNotificationListener` for Girls Match notification types (new request, accepted), gate behind a feature flag for rollout.

---

## 7. Phasing (the "take it from here" sequence)
- **Phase 1 — Backend MVP (start here).** Add models to `invictus-models`; build `modules/girls-match/` candidate query + scoring (+co-attendance) + consent state machine + core endpoints (`/profile`, `/matches`, request/accept/decline). Validate ranking output against staging/DWH data. *This is where the risk is.*
- **Phase 2 — Mobile thin slice.** Quiz + Matches + consent wired to Phase-1 endpoints; integrate the "find a buddy for this class" CTA in the booking modal.
- **Phase 3 — AI.** Server icebreakers + match explanations + class recommendations (reuse `config/openai.js`), with fallbacks; surface in the mobile screens.
- **Phase 4 — Retention loop.** Post-session feedback (ОС), repeat-together, referral/bonus, reactivation nudges (RabbitMQ + push + PosNotifications).
- **Phase 5 — Self-learning (post-MVP).** Use accepted-pair + feedback signals; embed profiles/behavior in Pinecone for similarity-based ranking.

---

## 8. Open decisions (policy/infra — not blockers for Phase 1 scaffolding)
1. ✅ **Model home — DECIDED**: `@invictusdev/invictus-models` (local checkout at `C:\Users\mrbqble\Desktop\Invictus\invictus-models`). Follow the package convention in §4; bump version + invictusgo dependency.
2. ✅ **Feature name — DECIDED**: **Girls Match** (Russian UI «Найди подругу»). Module `girls-match`, mobile feature `girlsMatch`, models `GirlsMatch*`.
3. **AI provider**: OpenAI (already wired in invictusgo) vs Anthropic Haiku (what the demo used). Recommend OpenAI for zero new infra; the prompts/context port either way.
4. **Pre-consent disclosure policy**: exactly which attributes appear on anonymized candidate cards (privacy + legal review for a women-only product).
5. **Eligibility / opt-in**: who appears in the pool (all active members at a Girls club? opt-in only?). Affects privacy posture and pool size.
6. **REST vs GraphQL**: recommend REST (matches the `modules/*` pattern); GymBuddy's GraphQL is a separate service.

---

## 9. Guardrails for the next instance
- Treat `invictusv2`, `invictusgo`, and `invictus-models` as **read-only until the user approves building** in them. This session was analysis-only.
- The demo repo (`invictus-buddy-ai`) is the spec; keep it as the reference artifact.
- Re-verify any file path before editing (repos evolve).
- Privacy/consent is a hard requirement, not a nice-to-have — design the API so identity can't leak pre-consent.
- The demo component `BuddyMatches.tsx` keeps its name (it's an existing file); only the *production* feature is named "Girls Match".
