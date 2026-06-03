import { useState } from 'react';
import { Gift, Check } from 'lucide-react';
import { makeReferralOffer } from '../../utils/ai';
import type { FormData } from '../../data/mockData';

interface InviteFriendProps {
  formData: FormData;
  onAction: (msg: string) => void;
  /** 'thin' framing nudges harder when the candidate pool is small. */
  tone?: 'default' | 'thin';
}

// Referral branch — surfaced at moments of confidence (after a match) or when
// the pool is thin. Reward is the core product (freeze / free visits), which
// research shows converts better than cash for fitness referrals.
export function InviteFriend({ formData, onAction, tone = 'default' }: InviteFriendProps) {
  const [offer] = useState(() => makeReferralOffer(formData));
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = `Пойдём тренироваться вместе в Invictus Girls! Мой код: ${offer.code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Invictus Girls — Buddy', text, url: offer.link });
      } else {
        await navigator.clipboard.writeText(`${text} ${offer.link}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      onAction(`Приглашение готово. Подруга получит бонус, ты — ${offer.bonus}.`);
    } catch {
      /* share dialog dismissed — no-op */
    }
  };

  return (
    <div className="invite-card">
      <div className="invite-card__icon"><Gift size={18} strokeWidth={2} /></div>
      <div className="invite-card__body">
        <div className="invite-card__title">
          {tone === 'thin' ? 'Мало кандидаток рядом? Позови свою' : 'Позови свою подругу'}
        </div>
        <div className="invite-card__text">
          Приведёшь подругу — обе получаете бонус: <strong>{offer.bonus}</strong>.
        </div>
        <div className="invite-card__code-row">
          <code className="invite-card__code">{offer.code}</code>
          <button className="btn btn--white btn--sm" onClick={share}>
            {copied ? <><Check size={14} /> Скопировано</> : 'Поделиться'}
          </button>
        </div>
      </div>
    </div>
  );
}
