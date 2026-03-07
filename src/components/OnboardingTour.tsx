import { useState, useEffect, useCallback, useRef } from 'react';

interface TourStep {
  targetSelector: string;
  text: string;
  arrowDirection: 'up' | 'down';
  useRect?: boolean; // use rounded rectangle instead of circle
}

const isMobile = () => window.innerWidth < 1024;

const STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="bot-bob"]',
    text: 'Cliquez sur un logo de bot\npour en apprendre plus\nou descendez pour voir la vidéo\nde présentation !',
    arrowDirection: 'up',
  },
  {
    targetSelector: '[data-tour="bottom-nav"]',
    text: 'Sélectionnez un menu pour\nvous déplacer dans le site.',
    arrowDirection: 'down',
    useRect: true,
  },
];

const TOUR_DONE_KEY = '__bcm_tour_done';
const PAD = 10;
const RECT_RX = 16;

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (sessionStorage.getItem(TOUR_DONE_KEY)) return;
    const t = setTimeout(() => {
      setStep(0);
      setVisible(true);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Block scrolling
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [visible]);

  // Track target
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const update = () => {
      const els = document.querySelectorAll(STEPS[step].targetSelector);
      let el: Element | null = null;
      els.forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) el = e;
      });
      if (el) setTargetRect((el as Element).getBoundingClientRect());
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);

  const next = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      if (step + 1 >= STEPS.length) {
        setVisible(false);
        setStep(-1);
        sessionStorage.setItem(TOUR_DONE_KEY, '1');
      } else {
        setStep(s => s + 1);
      }
      setFading(false);
    }, 300);
  }, [step]);

  if (!visible || step < 0 || !targetRect) return null;

  const current = STEPS[step];
  const useRect = current.useRect && isMobile();

  const cx = targetRect.left + targetRect.width / 2;
  const cy = targetRect.top + targetRect.height / 2;
  const radius = Math.max(targetRect.width, targetRect.height) / 2 + 24;

  // Rect cutout dimensions (for navbar)
  const rx = targetRect.left - PAD;
  const ry = targetRect.top - PAD;
  const rw = targetRect.width + PAD * 2;
  const rh = targetRect.height + PAD * 2;

  // Arrow & tooltip
  const tooltipWidth = 300;
  const arrowLen = 60;
  const isUp = current.arrowDirection === 'up';

  let arrowTipY: number;
  let arrowBaseY: number;
  if (useRect) {
    arrowTipY = ry - 4;
    arrowBaseY = ry - arrowLen;
  } else if (isUp) {
    arrowTipY = cy - radius + 4;
    arrowBaseY = cy - radius - arrowLen;
  } else {
    arrowTipY = cy + radius - 4;
    arrowBaseY = cy + radius + arrowLen;
  }

  // Tooltip always above arrow
  const tooltipTop = Math.max(16, Math.min(
    (useRect ? arrowBaseY : isUp ? arrowBaseY : arrowBaseY) - 160,
    window.innerHeight - 200
  ));
  const tooltipLeft = Math.max(16, Math.min(cx - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onClick={e => e.stopPropagation()}
      onTouchMove={e => e.preventDefault()}
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease', touchAction: 'none' }}
    >
      {/* Click blocker */}
      <div className="absolute inset-0" style={{ pointerEvents: 'all' }} />

      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {useRect ? (
              <rect x={rx - 4} y={ry - 4} width={rw + 8} height={rh + 8} rx={RECT_RX} fill="black" />
            ) : (
              <circle cx={cx} cy={cy} r={radius + 8} fill="black" />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-mask)" />
      </svg>

      {/* Animated border */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        {useRect ? (
          <>
            <rect
              x={rx} y={ry} width={rw} height={rh} rx={RECT_RX}
              fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 6"
            />
            <rect
              x={rx - 3} y={ry - 3} width={rw + 6} height={rh + 6} rx={RECT_RX + 2}
              fill="none" stroke="hsl(262, 83%, 58%)" strokeWidth="3" opacity="0.35"
              style={{ animation: 'tour-glow 2s ease-in-out infinite', filter: 'blur(4px)' }}
            />
          </>
        ) : (
          <>
            <circle
              cx={cx} cy={cy} r={radius}
              fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 6"
              style={{ animation: 'tour-rotate 12s linear infinite', transformOrigin: `${cx}px ${cy}px` }}
            />
            <circle
              cx={cx} cy={cy} r={radius + 6}
              fill="none" stroke="hsl(262, 83%, 58%)" strokeWidth="3" opacity="0.35"
              style={{ animation: 'tour-glow 2s ease-in-out infinite', filter: 'blur(4px)', transformOrigin: `${cx}px ${cy}px` }}
            />
          </>
        )}
      </svg>

      {/* Arrow */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <line x1={cx} y1={arrowBaseY} x2={cx} y2={arrowTipY} stroke="white" strokeWidth="2" strokeDasharray="6 4" />
        <polygon
          points={
            isUp || useRect
              ? `${cx},${arrowTipY} ${cx - 6},${arrowTipY - 10} ${cx + 6},${arrowTipY - 10}`
              : `${cx},${arrowTipY} ${cx - 6},${arrowTipY + 10} ${cx + 6},${arrowTipY + 10}`
          }
          fill="white"
        />
      </svg>

      {/* Tooltip */}
      <div
        className="absolute flex flex-col items-center gap-3"
        style={{ top: tooltipTop, left: tooltipLeft, width: tooltipWidth, pointerEvents: 'all', zIndex: 10000 }}
      >
        <div
          className="rounded-xl px-6 py-4 text-center text-sm font-medium text-white whitespace-pre-line leading-relaxed"
          style={{
            background: 'rgba(15, 15, 26, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {current.text}
        </div>
        <button
          onClick={next}
          className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer"
          style={{ pointerEvents: 'all', zIndex: 10001 }}
        >
          C'est compris !
        </button>
      </div>

      <style>{`
        @keyframes tour-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tour-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
