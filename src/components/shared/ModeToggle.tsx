// Переключатель режимов: Client ↔ Admin
interface ModeToggleProps {
  mode: 'client' | 'admin';
  onChange: (mode: 'client' | 'admin') => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Режим просмотра">
      <button
        role="tab"
        aria-selected={mode === 'client'}
        className={`mode-toggle__btn ${mode === 'client' ? 'mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('client')}
      >
        Клиент
      </button>
      <button
        role="tab"
        aria-selected={mode === 'admin'}
        className={`mode-toggle__btn ${mode === 'admin' ? 'mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('admin')}
      >
        Админ
      </button>
    </div>
  );
}
