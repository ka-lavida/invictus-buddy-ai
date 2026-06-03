import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MapPin, Sparkles, Users, User } from 'lucide-react';
import {
  GIRLS_CITIES, GIRLS_PROGRAMS, CLUB_PROGRAMS,
  getClubsByCity, type GirlsCity, type ProgramInfo,
} from '../../data/girlsData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { distanceToClub } from '../../utils/proximity';
import { recommendPrograms, type ProgramPick } from '../../utils/ai';
import type { WizardPrefill } from './ClientWizard';

interface GroupProgramFinderProps {
  onFindBuddy: (prefill?: WizardPrefill) => void; // bridge into the buddy flow
  onBack:      () => void;
  onAction:    (msg: string) => void;
}

// ─── The 6 questions from the board ───────────────────────────────────────────
const QUESTIONS = [
  { key: 'feel',   q: 'Что хочешь почувствовать после тренировки?', hint: 'Твой результат — наш ориентир',     opts: ['Тело в тонусе', 'Лёгкость и энергия', 'Я снова в режиме'] },
  { key: 'class',  q: 'Какой class тебе сейчас нужен?',             hint: 'Интенсивность под настроение',        opts: ['Мягкий старт', 'Сильная тренировка', 'Динамика и драйв'] },
  { key: 'rhythm', q: 'В каком ты сейчас ритме?',                   hint: 'Подберём подходящий уровень',         opts: ['Начинаю с нуля', 'Возвращаюсь после паузы', 'Уже в форме'] },
  { key: 'focus',  q: 'На чём делаем акцент?',                      hint: 'Куда направим энергию',               opts: ['Ягодицы и форма', 'Core, осанка, контроль', 'Всё тело и выносливость'] },
  { key: 'time',   q: 'Когда твой time slot?',                      hint: 'Удобное время — половина успеха',      opts: ['Утро', 'День', 'Вечер / выходные'] },
  { key: 'who',    q: 'Хочешь идти одна или с подругой?',           hint: 'Можем подобрать компанию',            opts: ['Пойду одна', 'Хочу с одной девушкой', 'Хочу в mini-group', 'Хочу с подругой'] },
] as const;

const TOTAL = QUESTIONS.length + 1; // city + 6 questions

const LEVEL_BY_RHYTHM: Record<string, string> = {
  'Начинаю с нуля':           'Новичок',
  'Возвращаюсь после паузы':  'Средний',
  'Уже в форме':              'Уверенный',
};
const GOAL_BY_FOCUS: Record<string, string> = {
  'Ягодицы и форма':         'Ягодицы',
  'Core, осанка, контроль':  'Тонус',
  'Всё тело и выносливость': 'Похудение',
};
const FORMAT_BY_WHO: Record<string, string> = {
  'Хочу с одной девушкой': 'с одной девушкой',
  'Хочу в mini-group':     'в мини-группе (3–5 чел.)',
  'Хочу с подругой':       'с одной девушкой',
};

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`wizard-chip ${selected ? 'wizard-chip--active' : ''}`} onClick={onClick} aria-pressed={selected}>
      <span className="wizard-chip__label">{label}</span>
    </button>
  );
}

export function GroupProgramFinder({ onFindBuddy, onBack, onAction }: GroupProgramFinderProps) {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState<GirlsCity | ''>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const geo = useGeolocation();

  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); }, []);

  const advance = (apply: () => void) => {
    apply();
    if (advanceRef.current) clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => setStep(s => Math.min(s + 1, TOTAL)), 320);
  };

  const back = () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (step === 0) onBack();
    else setStep(s => s - 1);
  };

  const isResults = step === TOTAL;
  const progress = Math.min((step + 1) / TOTAL, 1) * 100;

  // ─── Results ────────────────────────────────────────────────────────────────
  if (isResults) {
    return (
      <GroupResults
        city={city as GirlsCity}
        answers={answers}
        geo={geo}
        onBack={() => setStep(TOTAL - 1)}
        onFindBuddy={onFindBuddy}
        onAction={onAction}
      />
    );
  }

  // ─── Quiz ─────────────────────────────────────────────────────────────────
  const q = step === 0 ? null : QUESTIONS[step - 1];

  return (
    <section className="wizard-section">
      <div className="wizard-card">
        <div className="wizard-header">
          <button className="wizard-back" onClick={back} aria-label="Назад">
            <ChevronLeft size={18} /><span>Назад</span>
          </button>
          <div className="wizard-step-counter">Шаг {step + 1} из {TOTAL}</div>
        </div>

        <div className="wizard-progress">
          <div className="wizard-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="wizard-body" key={step}>
          <div className="gp-eyebrow">Твой class · Твой ритм · Твоя girls-зона</div>

          {step === 0 ? (
            <div className="wizard-step">
              <div className="wizard-step__question">В каком городе ищем class?</div>
              <div className="wizard-step__hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Покажем группы и ближайшие клубы</span>
                {geo.status === 'loading' && <span className="wizard-geo-hint"><MapPin size={11} /> определяем геолокацию…</span>}
                {geo.status === 'denied' && <span className="wizard-geo-hint wizard-geo-hint--off"><MapPin size={11} /> геолокация недоступна</span>}
              </div>
              <div className="wizard-chips">
                {GIRLS_CITIES.map(c => (
                  <Chip key={c} label={c} selected={city === c} onClick={() => advance(() => setCity(c))} />
                ))}
              </div>
            </div>
          ) : q ? (
            <div className="wizard-step">
              <div className="wizard-step__question">{q.q}</div>
              <div className="wizard-step__hint">{q.hint}</div>
              <div className="wizard-chips">
                {q.opts.map(o => (
                  <Chip key={o} label={o} selected={answers[q.key] === o}
                    onClick={() => advance(() => setAnswers(a => ({ ...a, [q.key]: o })))} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="wizard-footer">
          <div className="wizard-autohint">Выбери вариант — перейдём дальше автоматически</div>
        </div>
      </div>
    </section>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────
function GroupResults({
  city, answers, geo, onBack, onFindBuddy, onAction,
}: {
  city: GirlsCity;
  answers: Record<string, string>;
  geo: ReturnType<typeof useGeolocation>;
  onBack: () => void;
  onFindBuddy: (prefill?: WizardPrefill) => void;
  onAction: (msg: string) => void;
}) {
  const level = LEVEL_BY_RHYTHM[answers.rhythm] ?? '';
  const goal  = GOAL_BY_FOCUS[answers.focus] ?? '';
  const wantsBuddy = answers.who !== undefined && answers.who !== 'Пойду одна';

  const userLat = geo.status === 'granted' ? geo.lat : null;
  const userLng = geo.status === 'granted' ? geo.lng : null;

  const cityClubs = getClubsByCity(city);
  const cityKeys = [...new Set(cityClubs.flatMap(c => CLUB_PROGRAMS[c.key] ?? []))];
  const eligible: ProgramInfo[] = GIRLS_PROGRAMS.filter(p =>
    p.key !== 'unknown' && cityKeys.includes(p.key) && (level !== 'Новичок' || p.dwhLevel === 1),
  );

  const [aiPicks, setAiPicks] = useState<ProgramPick[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    recommendPrograms(
      { goal, level, format: FORMAT_BY_WHO[answers.who] ?? '', memberStatus: answers.rhythm ?? '', ageRange: '', club: '' },
      eligible.map(p => ({ key: p.key, name: p.name, description: p.description, level: p.level, goals: p.goals })),
    ).then(picks => { if (alive) { setAiPicks(picks); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const reasonByKey: Record<string, string> = {};
  let ranked: ProgramInfo[];
  if (aiPicks && aiPicks.length) {
    aiPicks.forEach(p => { reasonByKey[p.key] = p.reason; });
    ranked = aiPicks.map(p => p.key).map(k => eligible.find(p => p.key === k)).filter((p): p is ProgramInfo => !!p);
  } else {
    ranked = eligible.filter(p => goal !== '' && p.goals.includes(goal));
    if (!ranked.length) ranked = eligible.slice(0, 4);
  }

  // Clubs in the city that offer a program, with nearest distance.
  const clubsFor = (key: string) => {
    const clubs = cityClubs.filter(c => (CLUB_PROGRAMS[c.key] ?? []).includes(key));
    const withDist = clubs.map(c => ({
      label: c.label,
      dist: distanceToClub(userLat, userLng, c.lat, c.lng),
    }));
    // nearest first when geo is available
    withDist.sort((a, b) => {
      if (a.dist && b.dist) return parseDist(a.dist) - parseDist(b.dist);
      return 0;
    });
    return withDist;
  };

  // Carry the class-quiz answers into the buddy flow so it finds buddies for
  // THIS class/city without re-asking (CJM: class → buddy-matches-for-the-class).
  const prefill: WizardPrefill = {
    city,
    level:      level || undefined,
    goal:       goal || undefined,
    format:     FORMAT_BY_WHO[answers.who] || undefined,
    programKey: ranked[0]?.key,
  };

  return (
    <section className="matches-section">
      <div className="matches-inner">
        <div className="matches-header">
          <div className="matches-title">Твои занятия</div>
          <div className="matches-subtitle">
            {[goal, level, answers.time].filter(Boolean).join(' · ')} · {city}
          </div>
        </div>

        {loading && (
          <div className="wizard-ai-loading" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <Sparkles size={12} strokeWidth={2} /> ИИ подбирает занятия под твои ответы…
          </div>
        )}

        <div className="gp-results">
          {ranked.slice(0, 5).map(p => {
            const clubs = clubsFor(p.key);
            const nearest = clubs[0];
            const extra = clubs.length - 1;
            return (
              <article key={p.key} className="gp-class-card">
                <div className="gp-class-card__head">
                  <div className="gp-class-card__name">{p.name}</div>
                  <span className="gp-class-card__level">{p.level}</span>
                </div>
                <div className="gp-class-card__desc">
                  {reasonByKey[p.key] ? <>✦ {reasonByKey[p.key]}</> : p.description}
                </div>
                {nearest && (
                  <div className="gp-class-card__clubs">
                    <MapPin size={12} strokeWidth={2} />
                    <span>
                      {nearest.label}{nearest.dist ? ` · ${nearest.dist}` : ''}
                      {extra > 0 && <span className="gp-class-card__extra"> · +{extra} {plural(extra, 'клуб', 'клуба', 'клубов')}</span>}
                    </span>
                  </div>
                )}
                <button className="btn btn--white btn--sm" onClick={() => onAction(`Записали на ${p.name} в ${nearest?.label ?? city}!`)}>
                  Записаться
                </button>
              </article>
            );
          })}
        </div>

        {/* Bridge — alone or with a buddy (board Q6) */}
        <div className="gp-bridge">
          {wantsBuddy ? (
            <>
              <div className="gp-bridge__icon"><Users size={18} strokeWidth={2} /></div>
              <div className="gp-bridge__body">
                <div className="gp-bridge__title">Не хочешь идти одна?</div>
                <div className="gp-bridge__text">Подберём девушку или мини-группу с похожей целью на эти же занятия.</div>
              </div>
              <button className="btn btn--white btn--sm" onClick={() => onFindBuddy(prefill)}>Найти подругу</button>
            </>
          ) : (
            <>
              <div className="gp-bridge__icon"><User size={18} strokeWidth={2} /></div>
              <div className="gp-bridge__body">
                <div className="gp-bridge__title">Готово — занятия под твой ритм</div>
                <div className="gp-bridge__text">Передумаешь идти одна — в любой момент подберём компанию.</div>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => onFindBuddy(prefill)}>Найти подругу</button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn btn--ghost btn--sm" onClick={onBack}>Изменить ответы</button>
        </div>
      </div>
    </section>
  );
}

// "350 м" / "2.3 км" → comparable number (metres)
function parseDist(d: string): number {
  const n = parseFloat(d.replace(',', '.'));
  return d.includes('км') ? n * 1000 : n;
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}
