import { useState, useEffect, useCallback, useRef } from 'react';

interface TourStep {
  targetSelector: string;
  text: string;
  arrowDirection: 'up' | 'down';
  mobileRadiusExtra?: number;
}

const isMobile = () => window.innerWidth < 1024;

const STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="bot-bob"]',
    text: 'Cliquez sur un logo de bot\npour en apprendre plus\nou descendez pour voir la vidéo\nde présentation !',
    arrowDirection: 'up',
    mobileRadiusExtra: 10,
  },
  {
    targetSelector: '[data-tour="bottom-nav"]',
    text: 'Sélectionnez un menu pour\nvous déplacer dans le site.',
    arrowDirection: 'down',
    mobileRadiusExtra: 8,
  },
];

const TOUR_DONE_KEY = '__bcm_tour_done';

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  // Check sessionStorage so tour only runs once per session (survives tab switches)
  useEffect(() => {
    if (sessionStorage.getItem(TOUR_DONE_KEY)) return;
    const t = setTimeout(() => {
      setStep(0);
      setVisible(true);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Block scrolling while tour is active
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

  // Track target element position
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const update = () => {
      const els = document.querySelectorAll(STEPS[step].targetSelector);
      let el: Element | null = null;
      els.forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) el = e;
      });
      if (el) {
        setTargetRect((el as Element).getBoundingClientRect());
      }
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
  const mobile = isMobile();

  // For mobile step 1, target just the bot card (not parent container)
  const cx = targetRect.left + targetRect.width / 2;
  const cy = targetRect.top + targetRect.height / 2;

  // Mobile: tighter radius for bot card, larger padding for bottom nav
  const extraRadius = mobile ? (current.mobileRadiusExtra || 0) : 0;
  let radius: number;
  if (step === 1 && mobile) {
    // For bottom nav on mobile, extend circle to fully encompass the bar
    radius = Math.max(targetRect.width, targetRect.height) / 2 + 16 + extraRadius;
  } else {
    radius = Math.max(targetRect.width, targetRect.height) / 2 + 24 + extraRadius;
  }

  // Tooltip positioning
  const tooltipWidth = 300;
  const arrowLen = 60;
  const isUp = current.arrowDirection === 'up';

  let tooltipTop: number;
  let arrowStartY: number;
  let arrowEndY: number;

  if (isUp) {
    tooltipTop = cy - radius - arrowLen - 180;
    arrowStartY = cy - radius - arrowLen;
    arrowEndY = cy - radius + 4;
  } else {
    tooltipTop = cy - radius - arrowLen - 180;
    arrowStartY = cy + radius + arrowLen;
    arrowEndY = cy + radius - 4;
  }

  // Clamp tooltip so it stays in viewport
  tooltipTop = Math.max(16, Math.min(tooltipTop, window.innerHeight - 200));
  const tooltipLeft = Math.max(16, Math.min(cx - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onClick={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.preventDefault()}
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.3s ease',
        touchAction: 'none',
      }}
    >
      {/* Full-screen click blocker */}
      <div className="absolute inset-0" style={{ pointerEvents: 'all' }} />

      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <circle cx={cx} cy={cy} r={radius + 8} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-mask)" />
      </svg>

      {/* Animated dashed circle */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="10 6"
          style={{
            animation: 'tour-rotate 12s linear infinite',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
        <circle
          cx={cx} cy={cy} r={radius + 6}
          fill="none"
          stroke="hsl(262, 83%, 58%)"
          strokeWidth="3"
          opacity="0.35"
          style={{
            animation: 'tour-glow 2s ease-in-out infinite',
            filter: 'blur(4px)',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      </svg>

      {/* Arrow */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <line
          x1={cx} y1={arrowStartY} x2={cx} y2={arrowEndY}
          stroke="white" strokeWidth="2" strokeDasharray="6 4"
        />
        <polygon
          points={isUp
            ? `${cx},${arrowEndY} ${cx - 6},${arrowEndY - 10} ${cx + 6},${arrowEndY - 10}`
            : `${cx},${arrowEndY} ${cx - 6},${arrowEndY + 10} ${cx + 6},${arrowEndY + 10}`
          }
          fill="white"
        />
      </svg>

      {/* Tooltip */}
      <div
        className="absolute flex flex-col items-center gap-3"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
          pointerEvents: 'all',
          zIndex: 10000,
        }}
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

      {/* Inline keyframes */}
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
