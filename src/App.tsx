import { useState, useEffect } from 'react';
import { ModeToggle }      from './components/shared/ModeToggle';
import { DwhBadge }        from './components/shared/DwhBadge';
import { HeroBlock }       from './components/client/HeroBlock';
import { ClientWizard }    from './components/client/ClientWizard';
import { HowItWorks }      from './components/client/HowItWorks';
import { BuddyMatches }    from './components/client/BuddyMatches';
import { AdminDashboard }  from './components/admin/AdminDashboard';
import { defaultFormData, buddyPool, type FormData } from './data/mockData';
import { findBuddyMatches, type MatchResult } from './utils/matching';

type Mode  = 'client' | 'admin';
type Stage = 'hero' | 'wizard' | 'how-it-works' | 'matches';

export default function App() {
  const [mode,      setMode]      = useState<Mode>('client');
  const [stage,     setStage]     = useState<Stage>('hero');
  const [formData,  setFormData]  = useState<FormData>(defaultFormData);
  const [matches,   setMatches]   = useState<MatchResult[]>([]);
  const [toast,     setToast]     = useState('');
  const [toastShow, setToastShow] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setToastShow(true);
    const timer = setTimeout(() => {
      setToastShow(false);
      setTimeout(() => setToast(''), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const handleModeChange = (m: Mode) => {
    setMode(m);
    if (m === 'client') {
      setStage('hero');
      setFormData(defaultFormData);
      setMatches([]);
    }
  };

  const handleWizardSubmit = (data: FormData) => {
    const results = findBuddyMatches(data, buddyPool);
    setFormData(data);
    setMatches(results);
    setStage('matches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setStage('wizard');
    setFormData(defaultFormData);
    setMatches([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHero = () => {
    setStage('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          <div className="header__logo-mark">♡</div>
          <div className="header__logo-text">
            <span className="header__logo-brand">Invictus</span>
            <span className="header__logo-sub">Buddy AI</span>
          </div>
        </div>
        <DwhBadge variant="pill" />
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </header>

      <main style={{ flex: 1 }}>
        {mode === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {stage === 'hero' && (
              <HeroBlock
                onFindBuddy={() => setStage('wizard')}
                onHowItWorks={() => setStage('how-it-works')}
              />
            )}
            {stage === 'wizard' && (
              <ClientWizard
                onSubmit={handleWizardSubmit}
                onBack={goHero}
              />
            )}
            {stage === 'how-it-works' && (
              <HowItWorks
                onFindBuddy={() => setStage('wizard')}
                onBack={goHero}
              />
            )}
            {stage === 'matches' && (
              <BuddyMatches
                matches={matches}
                formData={formData}
                onAction={showToast}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>

      {toast && (
        <div className={`toast ${toastShow ? 'toast--visible' : ''}`} aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
