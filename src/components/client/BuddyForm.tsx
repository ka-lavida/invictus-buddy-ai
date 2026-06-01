import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  CLUBS, PROGRAMS, TIME_SLOTS, FORMATS, LEVELS, GOALS, AGE_RANGES, MEMBER_STATUSES,
  defaultFormData,
  type FormData,
  type Club, type Program, type TimeSlot, type Format, type Level, type Goal,
  type AgeRange, type MemberStatus,
} from '../../data/mockData';

// ─── Generic chip-selector ────────────────────────────────────────────────────
interface ChipSelectorProps<T extends string> {
  label:   string;
  options: readonly T[];
  value:   T | '';
  onChange: (v: T) => void;
  note?:   string; // small hint below label
}

function ChipSelector<T extends string>({ label, options, value, onChange, note }: ChipSelectorProps<T>) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {note && <span className="form-label-note">{note}</span>}
      </label>
      <div className="chips">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`chip ${value === opt ? 'chip--active' : ''}`}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── BuddyForm ────────────────────────────────────────────────────────────────
interface BuddyFormProps {
  onSubmit: (data: FormData) => void;
}

export function BuddyForm({ onSubmit }: BuddyFormProps) {
  const [form, setForm] = useState<FormData>(defaultFormData);

  const filled = Object.values(form).filter(Boolean).length;
  const total  = 8; // 8 fields total
  const isReady = filled === total;

  const set = <K extends keyof FormData>(key: K) => (value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReady) onSubmit(form);
  };

  return (
    <section className="form-section">
      <form className="form-card" onSubmit={handleSubmit} noValidate>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="form-card__header">
          <div className="form-card__title">Найдём подругу для тренировки</div>
          <div className="form-card__subtitle">
            Ответь на пару вопросов — мы подберём девушку или мини-группу
            с похожей целью, уровнем и удобным временем.
          </div>
        </div>

        {/* ── Клуб + Возраст (2 колонки на desktop) ─────────────────── */}
        <div className="form-row">
          <ChipSelector<Club>
            label="Клуб"
            options={CLUBS}
            value={form.club}
            onChange={set('club')}
          />
          <ChipSelector<AgeRange>
            label="Возрастной диапазон"
            options={AGE_RANGES}
            value={form.ageRange}
            onChange={set('ageRange')}
          />
        </div>

        <div className="form-divider" />

        {/* ── Программа ─────────────────────────────────────────────── */}
        <ChipSelector<Program>
          label="На что хочешь пойти?"
          options={PROGRAMS}
          value={form.program}
          onChange={set('program')}
          note="можно выбрать 'Не знаю' — подберём под цель"
        />

        <div className="form-divider" />

        {/* ── Время + Формат (2 колонки на desktop) ─────────────────── */}
        <div className="form-row">
          <ChipSelector<TimeSlot>
            label="Удобное время"
            options={TIME_SLOTS}
            value={form.timeSlot}
            onChange={set('timeSlot')}
          />
          <ChipSelector<Format>
            label="Мне комфортнее пойти"
            options={FORMATS}
            value={form.format}
            onChange={set('format')}
          />
        </div>

        <div className="form-divider" />

        {/* ── Уровень + Цель (2 колонки на desktop) ─────────────────── */}
        <div className="form-row">
          <ChipSelector<Level>
            label="Уровень"
            options={LEVELS}
            value={form.level}
            onChange={set('level')}
          />
          <ChipSelector<Goal>
            label="Цель"
            options={GOALS}
            value={form.goal}
            onChange={set('goal')}
          />
        </div>

        <div className="form-divider" />

        {/* ── Статус ────────────────────────────────────────────────── */}
        <ChipSelector<MemberStatus>
          label="Ты сейчас"
          options={MEMBER_STATUSES}
          value={form.memberStatus}
          onChange={set('memberStatus')}
        />

        {/* ── Privacy notice ────────────────────────────────────────── */}
        <div className="privacy-notice">
          <ShieldCheck size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Мы показываем только безопасные данные: имя, возрастной диапазон, клуб,
            программу и время. Контакты не раскрываются без согласия.
          </span>
        </div>

        {/* ── Submit row ────────────────────────────────────────────── */}
        <div className="form-submit-row">
          <div className="form-progress">
            Заполнено: <strong>{filled}/{total}</strong>
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!isReady}
            style={{ opacity: isReady ? 1 : 0.5, transition: 'opacity 0.2s' }}
          >
            Найти подругу
          </button>
        </div>
      </form>
    </section>
  );
}
