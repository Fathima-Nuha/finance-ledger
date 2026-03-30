import './Onboarding.css';
import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const STEPS = [
  {
    selector: '.balance-stats-grid > div:first-child',
    title: 'Set Your Monthly Salary',
    description: 'Tap the pencil icon next to the salary value to enter your income. Your total balance will fill automatically.',
  },
  {
    selector: '.balance-card-top > div:first-child',
    title: 'Your Total Balance',
    description: 'This is your running balance — it starts equal to your salary and decreases each time you log a spend.',
  },
  {
    selector: '.add-category-btn',
    title: 'Create a Category',
    description: 'Tap + to add spending categories like Rent, Food, or Savings. You can create as many as you need.',
  },
  {
    selector: '.category-row',
    title: 'Set a Spending Limit',
    description: 'Click the Limit value inside a category to set a budget for it. The balance will start at that amount.',
  },
  {
    selector: '.category-spend-group',
    title: 'Log Spending & Submit',
    description: 'Enter an amount in the field and hit Submit. It deducts from both the category balance and your total balance.',
  },
];

const PAD = 10;

function SwirlArrow({ pointDown }) {
  return (
    <div className={`tour-arrow-wrap ${pointDown ? 'tour-arrow-bottom' : 'tour-arrow-top'}`}>
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none" aria-hidden="true">
        {pointDown ? (
          <>
            <path
              d="M22 4 C 6 10, 38 24, 22 31"
              stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3"
              strokeLinecap="round" fill="none"
              className="tour-swirl-path"
            />
            <path d="M16 27 L22 34 L28 27" stroke="#94a3b8" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : (
          <>
            <path
              d="M22 32 C 6 26, 38 12, 22 5"
              stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3"
              strokeLinecap="round" fill="none"
              className="tour-swirl-path"
            />
            <path d="M16 9 L22 2 L28 9" stroke="#94a3b8" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        )}
      </svg>
    </div>
  );
}

function Onboarding({ onDismiss }) {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);

  const measureStep = useCallback((stepIndex) => {
    const el = document.querySelector(STEPS[stepIndex].selector);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setSpotlight({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
        centerX: r.left + r.width / 2,
        centerY: r.top + r.height / 2,
      });
    }, 360);
  }, []);

  useEffect(() => { measureStep(step); }, [step, measureStep]);

  useEffect(() => {
    const handler = () => measureStep(step);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [step, measureStep]);

  const goNext = () => {
    if (step < STEPS.length - 1) { setSpotlight(null); setStep(s => s + 1); }
    else onDismiss();
  };
  const goPrev = () => { if (step > 0) { setSpotlight(null); setStep(s => s - 1); } };

  const isInBottomHalf = spotlight
    ? spotlight.centerY > window.innerHeight / 2
    : false;

  const getTooltipStyle = () => {
    const W = 304;
    if (!spotlight) return { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
    const left = Math.max(12, Math.min(spotlight.centerX - W / 2, window.innerWidth - W - 12));
    return isInBottomHalf
      ? { bottom: window.innerHeight - spotlight.top + 12, left }
      : { top: spotlight.top + spotlight.height + 12, left };
  };

  const current = STEPS[step];

  return (
    <div className="tour-overlay">
      {spotlight && (
        <div
          className="tour-spotlight"
          style={{ top: spotlight.top, left: spotlight.left, width: spotlight.width, height: spotlight.height }}
        />
      )}

      <div className="tour-tooltip" style={{ position: 'fixed', width: 304, ...getTooltipStyle() }}>
        <button className="tour-close" onClick={onDismiss} aria-label="Skip tour"><X size={14} /></button>

        {!isInBottomHalf && spotlight && <SwirlArrow pointDown={false} />}

        <p className="tour-step-count">{step + 1} / {STEPS.length}</p>
        <p className="tour-title">{current.title}</p>
        <p className="tour-desc">{current.description}</p>

        <div className="tour-actions">
          {step > 0 && <button className="tour-btn-back" onClick={goPrev}>Back</button>}
          <button className="tour-btn-next" onClick={goNext}>
            {step === STEPS.length - 1 ? "Let's go!" : 'Next ?'}
          </button>
        </div>

        <div className="tour-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`tour-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        {isInBottomHalf && spotlight && <SwirlArrow pointDown={true} />}
      </div>
    </div>
  );
}

export default Onboarding;
