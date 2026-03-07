import { useState, useEffect, useCallback, useRef } from 'react';

interface TourStep {
  targetSelector: string;
  text: string;
  arrowDirection: 'up' | 'down';
}

const STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="bot-bob"]',
    text: 'Cliquez sur un logo de bot\npour en apprendre plus !',
    arrowDirection: 'up',
  },
  {
    targetSelector: '[data-tour="bottom-nav"]',
    text: 'Sélectionnez un menu pour\nvous déplacer dans le site.',
    arrowDirection: 'down',
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(-1); // -1 = not started
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  // Start after 700ms
  useEffect(() => {
    const t = setTimeout(() => {
      setStep(0);
      setVisible(true);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Track target element position
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const update = () => {
      const el = document.querySelector(STEPS[step].targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
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
      } else {
        setStep(s => s + 1);
      }
      setFading(false);
    }, 300);
  }, [step]);

  if (!visible || step < 0 || !targetRect) return null;

  const current = STEPS[step];
  const cx = targetRect.left + targetRect.width / 2;
  const cy = targetRect.top + targetRect.height / 2;
  const radius = Math.max(targetRect.width, targetRect.height) / 2 + 24;

  // Tooltip positioning
  const tooltipWidth = 300;
  const arrowLen = 60;
  const isUp = current.arrowDirection === 'up';

  // Place tooltip above or below the circle
  let tooltipTop: number;
  let arrowStartY: number;
  let arrowEndY: number;

  if (isUp) {
    // Arrow points up toward target, tooltip above circle
    tooltipTop = cy - radius - arrowLen - 160;
    arrowStartY = cy - radius - arrowLen;
    arrowEndY = cy - radius + 4;
  } else {
    // Arrow points down toward target, tooltip above arrow
    tooltipTop = cy - radius - 160;
    arrowStartY = cy + radius + arrowLen;
    arrowEndY = cy + radius - 4;
  }

  // Clamp tooltip so it stays in viewport
  tooltipTop = Math.max(16, Math.min(tooltipTop, window.innerHeight - 180));
  const tooltipLeft = Math.max(16, Math.min(cx - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
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
        {/* Arrow head */}
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
