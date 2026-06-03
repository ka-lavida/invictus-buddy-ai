import { useState } from 'react';
import { X, Sparkles, Repeat, Gift } from 'lucide-react';
import type { BuddyRequest } from '../../data/mockData';

interface SessionFeedbackProps {
  buddy:    BuddyRequest;
  onClose:  () => void;
  onRebook: () => void;
  onInvite: () => void;
}

// Post-session feedback ("ОС о занятии" from the CJM): the 4 questions whose
// answers drive the retention loop — rebook with the same buddy, invite a
// friend, and a "learns your taste" signal (the self-learning match input).
export function SessionFeedback({ buddy, onClose, onRebook, onInvite }: SessionFeedbackProps) {
  // Group entries are named like "Группа Stretching" — don't use that as a name.
  const name = buddy.isGroup ? 'девочками' : buddy.name.split(' ')[0];
  const [a, setA] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const QUESTIONS = [
    { key: 'trainer', q: 'Как тренер?',                        opts: ['Огонь', 'Норм', 'Так себе'] },
    { key: 'session', q: 'Как прошло само занятие?',           opts: ['Супер', 'Норм', 'Не очень'] },
    { key: 'buddy',   q: `Понравилось тренироваться с ${name}?`, opts: ['Да, очень', 'Скорее да', 'Не очень'] },
    { key: 'again',   q: `Сходили бы ещё раз с ${name}?`,        opts: ['Да', 'Возможно', 'Нет'] },
  ] as const;

  const allAnswered = QUESTIONS.every(q => a[q.key]);
  const wantsAgain = a.again !== 'Нет';
  const likedBuddy = a.buddy === 'Да, очень' || a.buddy === 'Скорее да';

  return (
    <div className="feedback-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <button className="feedback-close" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>

        {!done ? (
          <>
            <div className="feedback-eyebrow">Отзыв о занятии</div>
            <div className="feedback-title">Как всё прошло?</div>
            <div className="feedback-sub">Пара вопросов — поможем подобрать ещё точнее в следующий раз.</div>

            <div className="feedback-questions">
              {QUESTIONS.map(q => (
                <div key={q.key} className="feedback-q">
                  <div className="feedback-q__label">{q.q}</div>
                  <div className="feedback-q__opts">
                    {q.opts.map(o => (
                      <button
                        key={o}
                        className={`feedback-chip ${a[q.key] === o ? 'feedback-chip--active' : ''}`}
                        onClick={() => setA(prev => ({ ...prev, [q.key]: o }))}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`btn btn--white btn--lg feedback-submit ${!allAnswered ? 'feedback-submit--disabled' : ''}`}
              disabled={!allAnswered}
              onClick={() => setDone(true)}
            >
              Отправить отзыв
            </button>
          </>
        ) : (
          <div className="feedback-done">
            <div className="feedback-done__icon"><Sparkles size={22} strokeWidth={2} /></div>
            <div className="feedback-title">Спасибо!</div>
            <div className="feedback-sub">
              {likedBuddy
                ? `Учли, что с ${name} тебе зашло — будем чаще предлагать похожие пары.`
                : 'Учли твой отзыв — следующие матчи станут точнее.'}
            </div>

            <div className="feedback-actions">
              {wantsAgain && (
                <button className="btn btn--white btn--lg" onClick={() => { onRebook(); onClose(); }}>
                  <Repeat size={15} strokeWidth={2} /> Записаться с {name} снова
                </button>
              )}
              <button className="btn btn--white-outline btn--lg" onClick={() => { onInvite(); onClose(); }}>
                <Gift size={15} strokeWidth={2} /> Позвать свою подругу
              </button>
              <button className="btn btn--ghost btn--sm" onClick={onClose}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
