// ─── Invictus Buddy AI — dev-server AI middleware ─────────────────────────────
// Adds POST /api/ai/explain and /api/ai/icebreakers to the Vite dev server.
// The LLM key stays here (server-side) and never reaches the browser.
//
// Provider is auto-selected from env (one-file swappable adapter):
//   OPENAI_API_KEY    → OpenAI  (default OPENAI_MODEL=gpt-4o-mini)
//   ANTHROPIC_API_KEY → Claude  (default ANTHROPIC_MODEL=claude-haiku-4-5)
//   neither           → 501, and the client falls back to its local generator.
//
// This runs only under `npm run dev`. For a deployed build, port these two
// handlers to a serverless function — the client interface is identical.

import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { SYSTEM_CONTEXT } from './ai-context';

type Env = Record<string, string>;

// JSON schema for structured icebreaker output. Haiku 4.5 supports output_config,
// so the response is guaranteed to be {messages: string[]} — no fragile parsing.
const ICEBREAKER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: { messages: { type: 'array', items: { type: 'string' } } },
  required: ['messages'],
} as const;

const RECOMMEND_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { key: { type: 'string' }, reason: { type: 'string' } },
        required: ['key', 'reason'],
      },
    },
  },
  required: ['recommendations'],
} as const;

// ─── Provider adapter ─────────────────────────────────────────────────────────

async function callLLM(
  env: Env,
  userPrompt: string,
  opts: { schema?: object } = {},
): Promise<string | null> {
  if (env.OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        // OpenAI auto-caches large identical prefixes — no marker needed.
        messages: [
          { role: 'system', content: SYSTEM_CONTEXT },
          { role: 'user', content: userPrompt },
        ],
        ...(opts.schema ? { response_format: { type: 'json_object' } } : {}),
        temperature: 0.8,
        max_tokens: 400,
      }),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  }

  if (env.ANTHROPIC_API_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
        max_tokens: 400,
        // Cached prefix — the context block is identical on every call, so once
        // it's large enough (≥4096 tok on Haiku) repeat calls read it at ~0.1x.
        system: [{ type: 'text', text: SYSTEM_CONTEXT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
        // Structured output → guaranteed {messages: [...]} shape.
        ...(opts.schema ? { output_config: { format: { type: 'json_schema', schema: opts.schema } } } : {}),
      }),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.content?.[0]?.text ?? null;
  }

  return null;
}

// ─── Prompt builders ────────────────────────────────────────────────────────

function explainPrompt(b: any): string {
  const u = b.user ?? {};
  const bu = b.buddy ?? {};
  return [
    'Объясни матч по правилам и в тоне из системного контекста.',
    `Ты: уровень ${u.level || '—'}, цель ${u.goal || '—'}, время ${u.timeSlot || '—'}, статус ${u.memberStatus || '—'}.`,
    `Кандидатка «${bu.name || 'подруга'}»: программа ${bu.program || '—'}, уровень ${bu.level || '—'}, цель ${bu.goal || '—'}, время ${bu.timeSlot || '—'}${bu.isGroup ? ', мини-группа' : ''}.`,
    'Верни только саму фразу, без кавычек и префиксов.',
  ].join('\n');
}

function icebreakerPrompt(b: any): string {
  const u = b.user ?? {};
  const bu = b.buddy ?? {};
  return [
    'Сгенерируй 3 первых сообщения по правилам и в тоне из системного контекста.',
    `Кандидатка: ${bu.name || 'подруга'}${bu.isGroup ? ' (мини-группа)' : ''}, программа ${bu.program || '—'}, общая цель ${bu.goal || u.goal || '—'}, время ${bu.timeSlot || '—'}.`,
    'Верни JSON: {"messages": ["...", "...", "..."]}.',
  ].join('\n');
}

function recommendPrompt(b: any): string {
  const c = b.choices ?? {};
  const eligible: any[] = Array.isArray(b.eligible) ? b.eligible : [];
  const list = eligible
    .map(p => `- key=${p.key}: ${p.name} — ${p.description} (уровень ${p.level}, цели: ${(p.goals || []).join(', ')})`)
    .join('\n');
  return [
    'Подбери и отранжируй групповые программы под выбор девушки, опираясь на правила и тон из системного контекста.',
    'Выбирай ТОЛЬКО из списка доступных программ ниже (по полю key). Не выдумывай программы, которых нет в списке.',
    'Поставь самую подходящую первой. Для каждой дай короткую причину (до 14 слов, на «ты»), почему подойдёт именно ей.',
    `Выбор девушки: цель ${c.goal || '—'}, уровень ${c.level || '—'}, формат ${c.format || '—'}, статус ${c.memberStatus || '—'}, возраст ${c.ageRange || '—'}.`,
    'Доступные программы:',
    list,
    'Верни JSON: {"recommendations":[{"key":"...","reason":"..."}]}. Включи 2–5 самых подходящих (не обязательно все).',
  ].join('\n');
}

// ─── Body reader ──────────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

// Tolerant JSON extraction. OpenAI's json_object mode returns clean JSON, but
// the raw Anthropic API can wrap it in ```json fences or add a sentence first.
function parseJsonLoose(raw: string | null): any {
  if (!raw) return null;
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  if (s[0] !== '{') {
    const a = s.indexOf('{');
    const b = s.lastIndexOf('}');
    if (a !== -1 && b > a) s = s.slice(a, b + 1);
  }
  try { return JSON.parse(s); } catch { return null; }
}

// ─── Plugin ─────────────────────────────────────────────────────────────────

export function aiMiddleware(env: Env): Plugin {
  const hasKey = !!(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY);
  const provider = env.OPENAI_API_KEY ? 'openai' : env.ANTHROPIC_API_KEY ? 'anthropic' : 'none';

  return {
    name: 'invictus-ai-middleware',
    configureServer(server) {
      // One-line boot log so it's obvious whether live AI is on.
      server.config.logger.info(
        `  \x1b[35m➜  Buddy AI:\x1b[0m ${hasKey ? `live (${provider})` : 'deterministic fallback (no key)'}`,
      );

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/ai/')) return next();
        if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
        if (!hasKey) return json(res, 501, { error: 'no AI key configured' });

        try {
          const body = await readBody(req);

          if (req.url.startsWith('/api/ai/explain')) {
            const text = await callLLM(env, explainPrompt(body));
            if (!text) return json(res, 502, { error: 'llm failed' });
            return json(res, 200, { text: text.trim() });
          }

          if (req.url.startsWith('/api/ai/icebreakers')) {
            const raw = await callLLM(env, icebreakerPrompt(body), { schema: ICEBREAKER_SCHEMA });
            if (!raw) return json(res, 502, { error: 'llm failed' });
            const parsed = parseJsonLoose(raw);
            const messages = Array.isArray(parsed?.messages)
              ? parsed.messages.filter((m: unknown) => typeof m === 'string' && m.trim().length > 0)
              : [];
            // Surface nothing on a bad shape so the client falls back cleanly.
            if (!messages.length) return json(res, 502, { error: 'bad json' });
            return json(res, 200, { messages });
          }

          if (req.url.startsWith('/api/ai/recommend-programs')) {
            const raw = await callLLM(env, recommendPrompt(body), { schema: RECOMMEND_SCHEMA });
            if (!raw) return json(res, 502, { error: 'llm failed' });
            const parsed = parseJsonLoose(raw);
            const recommendations = Array.isArray(parsed?.recommendations)
              ? parsed.recommendations.filter((r: any) => r && typeof r.key === 'string' && typeof r.reason === 'string')
              : [];
            if (!recommendations.length) return json(res, 502, { error: 'bad json' });
            return json(res, 200, { recommendations });
          }

          return json(res, 404, { error: 'unknown ai route' });
        } catch (e) {
          return json(res, 502, { error: String(e) });
        }
      });
    },
  };
}
