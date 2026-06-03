import { useState, useEffect } from 'react';
import { ModeToggle }      from './components/shared/ModeToggle';
import { DwhBadge }        from './components/shared/DwhBadge';
import { HeroBlock }       from './components/client/HeroBlock';
import { ClientWizard, type WizardPrefill } from './components/client/ClientWizard';
import { GroupProgramFinder } from './components/client/GroupProgramFinder';
import { HowItWorks }      from './components/client/HowItWorks';
import { BuddyMatches }    from './components/client/BuddyMatches';
import { AdminDashboard }  from './components/admin/AdminDashboard';
import { defaultFormData, buddyPool, type FormData } from './data/mockData';
import { findBuddyMatches, type MatchResult } from './utils/matching';

type Mode  = 'client' | 'admin';
type Stage = 'hero' | 'wizard' | 'group-program' | 'how-it-works' | 'matches';

export default function App() {
  const [mode,      setMode]      = useState<Mode>('client');
  const [stage,     setStage]     = useState<Stage>('hero');
  const [formData,  setFormData]  = useState<FormData>(defaultFormData);
  const [matches,   setMatches]   = useState<MatchResult[]>([]);
  const [prefill,   setPrefill]   = useState<WizardPrefill | null>(null);
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
    setPrefill(null);
    setStage('wizard');
    setFormData(defaultFormData);
    setMatches([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHero = () => {
    setStage('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enter the buddy wizard, optionally carrying prefilled answers (group-program → buddy).
  const goWizard = (p: WizardPrefill | null = null) => {
    setPrefill(p);
    setStage('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          {/* Inline hex logomark */}
          <svg className="header__hex" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,2 40,12 40,36 22,46 4,36 4,12" fill="#4B5269"/>
            <polygon points="22,10 34,17 34,31 22,38 10,31 10,17" fill="white" fillOpacity="0.15"/>
            <polygon points="22,14 30,19 30,29 22,34 14,29 14,19" fill="white" fillOpacity="0.9"/>
          </svg>
          <div className="header__logo-text">
            <span className="header__logo-brand">Invictus</span>
            <span className="header__logo-name">girls</span>
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
                onFindBuddy={() => goWizard()}
                onFindClass={() => setStage('group-program')}
                onHowItWorks={() => setStage('how-it-works')}
              />
            )}
            {stage === 'wizard' && (
              <ClientWizard
                onSubmit={handleWizardSubmit}
                onBack={goHero}
                prefill={prefill ?? undefined}
              />
            )}
            {stage === 'group-program' && (
              <GroupProgramFinder
                onFindBuddy={goWizard}
                onBack={goHero}
                onAction={showToast}
              />
            )}
            {stage === 'how-it-works' && (
              <HowItWorks
                onFindBuddy={() => goWizard()}
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
