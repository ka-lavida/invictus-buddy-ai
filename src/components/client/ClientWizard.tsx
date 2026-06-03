import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import {
  GIRLS_CITIES, GIRLS_CLUBS, GIRLS_PROGRAMS,
  getClubsByCity, getEligiblePrograms, type GirlsCity, type ClubInfo, type ProgramInfo,
} from '../../data/girlsData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { distanceToClub } from '../../utils/proximity';
import { recommendPrograms, type ProgramPick } from '../../utils/ai';
import {
  FORMATS, LEVELS, GOALS, AGE_RANGES, MEMBER_STATUSES,
  type FormData, type Format, type Level, type Goal,
  type AgeRange, type MemberStatus,
} from '../../data/mockData';

// Answers carried in from another flow (e.g. the group-program finder), so we
// don't re-ask them. Field names match the wizard's option values.
export interface WizardPrefill {
  city?: string; clubKey?: string; ageRange?: string; format?: string;
  level?: string; goal?: string; memberStatus?: string; programKey?: string;
}

interface ClientWizardProps {
  onSubmit: (data: FormData) => void;
  onBack:   () => void;
  prefill?: WizardPrefill;
}

const TOTAL_STEPS = 8;

// ─── Reusable option chip ────────────────────────────────────────────────────
function OptionChip({
  label, sublabel, selected, onClick,
}: { label: string; sublabel?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`wizard-chip ${selected ? 'wizard-chip--active' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="wizard-chip__label">{label}</span>
      {sublabel && <span className="wizard-chip__sub">{sublabel}</span>}
    </button>
  );
}

// ─── Program card (step 4) ───────────────────────────────────────────────────
function ProgramCard({
  name, description, level, tags, aiReason, selected, onClick,
}: {
  name: string; description: string; level: string;
  tags: string[]; aiReason?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`wizard-program-card ${selected ? 'wizard-program-card--active' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="wizard-program-card__name">{name}</div>
      {aiReason
        ? <div className="wizard-program-card__ai">✦ {aiReason}</div>
        : <div className="wizard-program-card__desc">{description}</div>}
      <div className="wizard-program-card__footer">
        {level && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: selected ? 'rgba(255,255,255,0.45)' : 'var(--ig-muted)',
            padding: '2px 7px',
            border: `1px solid ${selected ? 'rgba(255,255,255,0.15)' : 'var(--ig-border)'}`,
            borderRadius: 99,
          }}>{level}</span>
        )}
        {tags.slice(0, 2).map(t => (
          <span key={t} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.10em',
            color: selected ? 'rgba(255,255,255,0.35)' : 'var(--ig-muted)',
          }}>{t}</span>
        ))}
      </div>
    </button>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function WizardProgress({ step }: { step: number }) {
  return (
    <div className="wizard-progress">
      <div className="wizard-progress__bar" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
    </div>
  );
}

function sectionLabel(text: string, muted = false) {
  return (
    <div style={{
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      fontFamily: 'var(--font-mono)',
      color: muted ? 'rgba(255,255,255,0.30)' : 'var(--ig-rose)',
      padding: '10px 0 6px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      marginBottom: 8,
    }}>
      {text}
    </div>
  );
}

// ─── Program step (case 7) — AI-ranked recommendation ────────────────────────
// Hard constraints (club availability + level gate) are applied here via
// getEligiblePrograms; the AI only ranks + explains within that eligible set,
// and recommendPrograms() validates its keys. Falls back to a deterministic
// goal-based split if the AI is unavailable.
function ProgramStep({
  clubKey, level, goal, format, memberStatus, ageRange, programKey, onSelect,
}: {
  clubKey: string; level: string; goal: string; format: string;
  memberStatus: string; ageRange: string; programKey: string;
  onSelect: (key: string) => void;
}) {
  const realPrograms = getEligiblePrograms(clubKey, level);
  const unknownProg = GIRLS_PROGRAMS.find(p => p.key === 'unknown')!;

  const [aiPicks, setAiPicks] = useState<ProgramPick[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    recommendPrograms(
      { goal, level, format, memberStatus, ageRange, club: clubKey },
      realPrograms.map(p => ({ key: p.key, name: p.name, description: p.description, level: p.level, goals: p.goals })),
    ).then(picks => { if (alive) { setAiPicks(picks); setLoading(false); } });
    return () => { alive = false; };
  }, []); // choices are fixed once we reach this step — fetch once

  const reasonByKey: Record<string, string> = {};
  let recommended: ProgramInfo[];
  let others: ProgramInfo[];

  if (aiPicks && aiPicks.length) {
    aiPicks.forEach(p => { reasonByKey[p.key] = p.reason; });
    const ranked = aiPicks.map(p => p.key);
    recommended = ranked.map(k => realPrograms.find(p => p.key === k)).filter((p): p is ProgramInfo => !!p);
    const recSet = new Set(ranked);
    others = realPrograms.filter(p => !recSet.has(p.key));
  } else {
    recommended = realPrograms.filter(p => goal !== '' && p.goals.includes(goal));
    const recSet = new Set(recommended.map(p => p.key));
    others = realPrograms.filter(p => !recSet.has(p.key));
  }

  const topPick = aiPicks && aiPicks.length ? realPrograms.find(p => p.key === aiPicks[0].key) : null;

  const renderCard = (p: ProgramInfo) => (
    <ProgramCard
      key={p.key}
      name={p.name}
      description={p.description}
      level={p.level}
      tags={p.tags}
      aiReason={reasonByKey[p.key]}
      selected={programKey === p.key}
      onClick={() => onSelect(p.key)}
    />
  );

  return (
    <div className="wizard-step">
      <div className="wizard-step__question">Выбери программу</div>
      <div className="wizard-step__hint">
        {aiPicks
          ? 'Подобрано ИИ под твой профиль — или выбери любую другую'
          : recommended.length > 0
            ? 'Подобрано под твою цель — или выбери любую другую'
            : `Программы клуба ${clubKey || ''}`}
      </div>
      <div className="wizard-programs">
        {loading && (
          <div className="wizard-ai-loading">
            <Sparkles size={12} strokeWidth={2} /> ИИ подбирает программы под твои ответы…
          </div>
        )}
        {recommended.length > 0 && (
          <>
            {sectionLabel(aiPicks ? 'Рекомендует ИИ' : 'Рекомендуем')}
            {recommended.map(renderCard)}
          </>
        )}
        {others.length > 0 && (
          <>
            {recommended.length > 0 && sectionLabel('Другие программы', true)}
            {others.map(renderCard)}
          </>
        )}
        <ProgramCard
          key="unknown"
          name={unknownProg.name}
          description={topPick ? `✦ ИИ предлагает начать с ${topPick.name}` : unknownProg.description}
          level=""
          tags={[]}
          selected={programKey === 'unknown'}
          onClick={() => onSelect('unknown')}
        />
      </div>
    </div>
  );
}

// ─── ClientWizard ────────────────────────────────────────────────────────────
export function ClientWizard({ onSubmit, onBack, prefill }: ClientWizardProps) {
  // Steps already answered by a prefill are skipped (program step 7 never is).
  const prefilledSteps = useMemo(() => {
    const s = new Set<number>();
    if (prefill?.city)         s.add(0);
    if (prefill?.clubKey)      s.add(1);
    if (prefill?.ageRange)     s.add(2);
    if (prefill?.format)       s.add(3);
    if (prefill?.level)        s.add(4);
    if (prefill?.memberStatus) s.add(5);
    if (prefill?.goal)         s.add(6);
    return s;
  }, []);
  const firstOpenStep = () => { for (let i = 0; i < TOTAL_STEPS; i++) if (!prefilledSteps.has(i)) return i; return TOTAL_STEPS - 1; };
  const nextOpenStep  = (from: number) => { let n = from + 1; while (n < TOTAL_STEPS - 1 && prefilledSteps.has(n)) n++; return n; };
  const prevOpenStep  = (from: number) => { let n = from - 1; while (n >= 0 && prefilledSteps.has(n)) n--; return n; };

  const [step, setStep] = useState(firstOpenStep);
  const geo = useGeolocation();

  const userLat = geo.status === 'granted' ? geo.lat : null;
  const userLng = geo.status === 'granted' ? geo.lng : null;

  const clubSublabel = (c: ClubInfo): string => {
    const dist = distanceToClub(userLat, userLng, c.lat, c.lng);
    return dist ? `${c.address} · ${dist}` : c.address;
  };

  // Selections per step (seeded from any prefill carried in from another flow)
  const [city,         setCity]         = useState<GirlsCity | ''>((prefill?.city as GirlsCity) ?? '');
  const [clubKey,      setClubKey]      = useState(prefill?.clubKey ?? '');
  const [ageRange,     setAgeRange]     = useState<AgeRange | ''>((prefill?.ageRange as AgeRange) ?? '');
  const [programKey,   setProgramKey]   = useState(prefill?.programKey ?? '');
  const [format,       setFormat]       = useState<Format | ''>((prefill?.format as Format) ?? '');
  const [level,        setLevel]        = useState<Level | ''>((prefill?.level as Level) ?? '');
  const [goal,         setGoal]         = useState<Goal | ''>((prefill?.goal as Goal) ?? '');
  const [memberStatus, setMemberStatus] = useState<MemberStatus | ''>((prefill?.memberStatus as MemberStatus) ?? '');

  const clubsForCity = city ? getClubsByCity(city) : [];

  // Order: city, club, age, format, level, memberStatus, goal, program
  const stepValue = [
    city, clubKey, ageRange, format, level, memberStatus, goal, programKey,
  ];
  const isStepDone = stepValue[step] !== '';

  const canGoNext = isStepDone;

  const handleNext = () => {
    if (!canGoNext) return;
    if (step < TOTAL_STEPS - 1) {
      if (step === 0) { setClubKey(''); setProgramKey(''); }   // city changed
      if (step === 1) setProgramKey('');                        // club changed
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  // Auto-advance to the next question shortly after a selection
  // (board spec: "авто переход между вопросами"). Runs the step's reset first.
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); }, []);

  const pickAdvance = (apply: () => void, fromStep: number) => {
    apply();
    if (fromStep === 0) { setClubKey(''); setProgramKey(''); } // city changed
    if (fromStep === 1) setProgramKey('');                      // club changed
    if (advanceRef.current) clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => setStep(nextOpenStep(fromStep)), 320);
  };

  const handleBack = () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    const prev = prevOpenStep(step);
    if (prev < 0) onBack();
    else setStep(prev);
  };

  const handleSubmit = () => {
    const selectedClub = GIRLS_CLUBS.find(c => c.key === clubKey);
    const selectedProg = GIRLS_PROGRAMS.find(p => p.key === programKey);

    const data: FormData = {
      city:         city as string,
      clubKey,
      club:         (selectedClub?.matchName ?? '') as FormData['club'],
      program:      (selectedProg?.matchProgram ?? '') as FormData['program'],
      timeSlot:     '',
      format:       format as FormData['format'],
      level:        level as FormData['level'],
      goal:         goal as FormData['goal'],
      ageRange:     ageRange as FormData['ageRange'],
      memberStatus: memberStatus as FormData['memberStatus'],
    };
    onSubmit(data);
  };

  // ─── Step configs ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="wizard-step">
          <div className="wizard-step__question">Сначала выберем город</div>
          <div className="wizard-step__hint">Где тебе удобнее тренироваться?</div>
          <div className="wizard-chips">
            {GIRLS_CITIES.map(c => (
              <OptionChip key={c} label={c} selected={city === c} onClick={() => pickAdvance(() => setCity(c), 0)} />
            ))}
          </div>
        </div>
      );

      case 1: return (
        <div className="wizard-step">
          <div className="wizard-step__question">Выбери свой клуб</div>
          <div className="wizard-step__hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Invictus Girls в {city}</span>
            {geo.status === 'loading' && (
              <span className="wizard-geo-hint">
                <MapPin size={11} /> определяем геолокацию…
              </span>
            )}
            {geo.status === 'denied' && (
              <span className="wizard-geo-hint wizard-geo-hint--off">
                <MapPin size={11} /> геолокация недоступна
              </span>
            )}
          </div>
          <div className="wizard-chips">
            {clubsForCity.map(c => (
              <OptionChip
                key={c.key}
                label={c.label}
                sublabel={clubSublabel(c)}
                selected={clubKey === c.key}
                onClick={() => pickAdvance(() => setClubKey(c.key), 1)}
              />
            ))}
          </div>
        </div>
      );

      case 2: return (
        <div className="wizard-step">
          <div className="wizard-step__question">Твой возраст?</div>
          <div className="wizard-step__hint">Покажем только тех, кто в похожей категории</div>
          <div className="wizard-chips wizard-chips--grid">
            {AGE_RANGES.map(a => (
              <OptionChip key={a} label={a + ' лет'} selected={ageRange === a} onClick={() => pickAdvance(() => setAgeRange(a), 2)} />
            ))}
          </div>
        </div>
      );

      case 3: return (
        <div className="wizard-step">
          <div className="wizard-step__question">С кем тебе комфортнее?</div>
          <div className="wizard-step__hint">Выбери формат, который тебе подходит</div>
          <div className="wizard-chips">
            {FORMATS.map(f => (
              <OptionChip key={f} label={f} selected={format === f} onClick={() => pickAdvance(() => setFormat(f), 3)} />
            ))}
          </div>
        </div>
      );

      case 4: return (
        <div className="wizard-step">
          <div className="wizard-step__question">Какой у тебя уровень?</div>
          <div className="wizard-step__hint">Честно — мы подберём тех, кто на одном уровне</div>
          <div className="wizard-chips">
            {LEVELS.map(l => (
              <OptionChip key={l} label={l} selected={level === l} onClick={() => pickAdvance(() => setLevel(l), 4)} />
            ))}
          </div>
        </div>
      );

      case 5: return (
        <div className="wizard-step">
          <div className="wizard-step__question">Ты сейчас в каком ритме?</div>
          <div className="wizard-step__hint">Подберём того, кто в похожей ситуации</div>
          <div className="wizard-chips">
            {MEMBER_STATUSES.map(s => (
              <OptionChip key={s} label={s} selected={memberStatus === s} onClick={() => pickAdvance(() => setMemberStatus(s), 5)} />
            ))}
          </div>
        </div>
      );

      case 6: return (
        <div className="wizard-step">
          <div className="wizard-step__question">Что хочешь почувствовать после?</div>
          <div className="wizard-step__hint">Твоя цель — наш главный фильтр</div>
          <div className="wizard-chips wizard-chips--grid">
            {GOALS.map(g => (
              <OptionChip key={g} label={g} selected={goal === g} onClick={() => pickAdvance(() => setGoal(g), 6)} />
            ))}
          </div>
        </div>
      );

      case 7:
        return (
          <ProgramStep
            clubKey={clubKey}
            level={level}
            goal={goal}
            format={format}
            memberStatus={memberStatus}
            ageRange={ageRange}
            programKey={programKey}
            onSelect={setProgramKey}
          />
        );

      default: return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <section className="wizard-section">
      <div className="wizard-card">
        {/* Header */}
        <div className="wizard-header">
          <button className="wizard-back" onClick={handleBack} aria-label="Назад">
            <ChevronLeft size={18} />
            <span>Назад</span>
          </button>
          <div className="wizard-step-counter">
            Шаг {step + 1} из {TOTAL_STEPS}
          </div>
        </div>

        <WizardProgress step={step} />

        {/* Content */}
        <div className="wizard-body" key={step}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <div className="privacy-notice">
            <ShieldCheck size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Контакты не раскрываются без согласия</span>
          </div>

          {isLastStep ? (
            <button
              className={`btn btn--primary btn--lg wizard-next-btn ${!canGoNext ? 'wizard-next-btn--disabled' : ''}`}
              onClick={handleNext}
              disabled={!canGoNext}
            >
              Найти подругу
            </button>
          ) : (
            <div className="wizard-autohint">Выбери вариант — перейдём дальше автоматически</div>
          )}
        </div>
      </div>
    </section>
  );
}
