import { useState, useEffect } from 'react';
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

interface ClientWizardProps {
  onSubmit: (data: FormData) => void;
  onBack:   () => void;
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
export function ClientWizard({ onSubmit, onBack }: ClientWizardProps) {
  const [step, setStep] = useState(0);
  const geo = useGeolocation();

  const userLat = geo.status === 'granted' ? geo.lat : null;
  const userLng = geo.status === 'granted' ? geo.lng : null;

  const clubSublabel = (c: ClubInfo): string => {
    const dist = distanceToClub(userLat, userLng, c.lat, c.lng);
    return dist ? `${c.address} · ${dist}` : c.address;
  };

  // Selections per step
  const [city,         setCity]         = useState<GirlsCity | ''>('');
  const [clubKey,      setClubKey]      = useState('');
  const [ageRange,     setAgeRange]     = useState<AgeRange | ''>('');
  const [programKey,   setProgramKey]   = useState('');
  const [format,       setFormat]       = useState<Format | ''>('');
  const [level,        setLevel]        = useState<Level | ''>('');
  const [goal,         setGoal]         = useState<Goal | ''>('');
  const [memberStatus, setMemberStatus] = useState<MemberStatus | ''>('');

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

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep(s => s - 1);
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
              <OptionChip key={c} label={c} selected={city === c} onClick={() => setCity(c)} />
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
                onClick={() => setClubKey(c.key)}
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
              <OptionChip key={a} label={a + ' лет'} selected={ageRange === a} onClick={() => setAgeRange(a)} />
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
              <OptionChip key={f} label={f} selected={format === f} onClick={() => setFormat(f)} />
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
              <OptionChip key={l} label={l} selected={level === l} onClick={() => setLevel(l)} />
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
              <OptionChip key={s} label={s} selected={memberStatus === s} onClick={() => setMemberStatus(s)} />
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
              <OptionChip key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />
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

          <button
            className={`btn btn--primary btn--lg wizard-next-btn ${!canGoNext ? 'wizard-next-btn--disabled' : ''}`}
            onClick={handleNext}
            disabled={!canGoNext}
          >
            {isLastStep ? 'Найти подругу' : 'Дальше'}
          </button>
        </div>
      </div>
    </section>
  );
}
