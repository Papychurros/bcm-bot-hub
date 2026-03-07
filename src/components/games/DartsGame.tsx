import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const W = 360, H = 320;
const CX = W / 2, CY = H / 2 - 10;
const COLOR = '#06b6d4';

const ZONES = [
  { r: 18, pts: 50, label: 'BULL', color: '#ef4444' },
  { r: 34, pts: 25, label: '25', color: '#f97316' },
  { r: 62, pts: 20, label: '20', color: '#06b6d4' },
  { r: 84, pts: 15, label: '15', color: '#0e7490' },
  { r: 106, pts: 10, label: '10', color: '#06b6d4' },
  { r: 124, pts: 5, label: '5', color: '#0e7490' },
  { r: 140, pts: 1, label: '1', color: '#06b6d4' },
];

const MAX_ROUNDS = 5, DARTS_PER_ROUND = 3;

type GameState = 'idle' | 'playing' | 'ended';

export default function DartsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [finalScore, setFinalScore] = useState(0);

  const stateRef = useRef({
    totalScore: 0, round: 1, roundDarts: DARTS_PER_ROUND,
    darts: [] as { x: number; y: number; pts: number }[],
    holding: false, holdStart: 0, aimX: CX, aimY: CY,
    wobble: { x: 0, y: 0 }, wobbleT: 0, thrown: false,
    throwAnim: null as { sx: number; sy: number; tx: number; ty: number; t: number; done: boolean } | null,
    frame: 0, state: 'idle' as GameState,
    scoreFx: null as { x: number; y: number; text: string; timer: number; color: string } | null,
  });

  const calcScore = (x: number, y: number) => {
    const dx = x - CX, dy = y - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    for (const z of ZONES) if (dist <= z.r) return { pts: z.pts, label: z.label };
    return { pts: 0, label: 'RATÉ' };
  };

  const start = useCallback(() => {
    const s = stateRef.current;
    s.totalScore = 0; s.round = 1; s.roundDarts = DARTS_PER_ROUND;
    s.darts = []; s.holding = false; s.thrown = false; s.throwAnim = null; s.frame = 0;
    s.scoreFx = null;
    s.state = 'playing'; setGameState('playing');
  }, []);

  const nextRound = useCallback(() => {
    const s = stateRef.current;
    if (s.round >= MAX_ROUNDS) {
      s.state = 'ended'; setGameState('ended'); setFinalScore(s.totalScore);
      return;
    }
    s.round++; s.roundDarts = DARTS_PER_ROUND; s.darts = [];
  }, []);

  const landDart = useCallback((tx: number, ty: number) => {
    const s = stateRef.current;
    const { pts, label } = calcScore(tx, ty);
    s.totalScore += pts;
    s.roundDarts--;
    s.darts.push({ x: tx, y: ty, pts });
    s.throwAnim = null; s.thrown = false;
    s.scoreFx = { x: tx, y: ty - 20, text: (pts > 0 ? '+' : '') + pts + ' ' + label, timer: 40, color: pts >= 50 ? '#fde68a' : pts >= 25 ? '#f97316' : pts > 0 ? COLOR : '#888' };
    if (s.roundDarts <= 0) setTimeout(() => nextRound(), 800);
  }, [nextRound]);

  const update = useCallback(() => {
    const s = stateRef.current;
    s.frame++;

    if (s.holding) {
      const dur = Date.now() - s.holdStart;
      const mastery = Math.min(dur / 1500, 1);
      const amplitude = 28 * (1 - mastery * 0.75);
      const speed = 3 + mastery * 2;
      s.wobbleT += speed * 0.05;
      s.wobble = {
        x: Math.sin(s.wobbleT * 1.7) * amplitude + Math.cos(s.wobbleT * 2.3) * amplitude * 0.5,
        y: Math.cos(s.wobbleT * 1.3) * amplitude + Math.sin(s.wobbleT * 2.7) * amplitude * 0.4,
      };
    }

    if (s.throwAnim && !s.throwAnim.done) {
      s.throwAnim.t += 0.08;
      if (s.throwAnim.t >= 1) {
        s.throwAnim.t = 1; s.throwAnim.done = true;
        landDart(s.throwAnim.tx, s.throwAnim.ty);
      }
    }

    if (s.scoreFx) { s.scoreFx.timer--; if (s.scoreFx.timer <= 0) s.scoreFx = null; }
  }, [landDart]);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    if (s.state === 'playing') update();

    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);

    // Target bg
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(CX, CY, 150, 0, Math.PI * 2); ctx.fill();

    // Zones
    for (let i = ZONES.length - 1; i >= 0; i--) {
      const z = ZONES[i];
      ctx.fillStyle = z.color;
      ctx.beginPath(); ctx.arc(CX, CY, z.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(CX, CY, z.r, 0, Math.PI * 2); ctx.stroke();
    }

    // Cross
    const R = ZONES[ZONES.length - 1].r;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CX - R, CY); ctx.lineTo(CX + R, CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY - R); ctx.lineTo(CX, CY + R); ctx.stroke();

    // Darts on board
    for (const d of s.darts) {
      ctx.save(); ctx.translate(d.x, d.y);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 0); ctx.stroke();
      ctx.fillStyle = COLOR;
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(0, -8); ctx.lineTo(4, -12); ctx.stroke();
      ctx.restore();
    }

    // Flying dart
    if (s.throwAnim && !s.throwAnim.done) {
      const t = s.throwAnim.t;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = s.throwAnim.sx + (s.throwAnim.tx - s.throwAnim.sx) * ease;
      const y = s.throwAnim.sy + (s.throwAnim.ty - s.throwAnim.sy) * ease - Math.sin(t * Math.PI) * 40;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 6); ctx.stroke();
      ctx.fillStyle = COLOR; ctx.beginPath(); ctx.arc(0, -14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Crosshair
    if (s.holding && !s.thrown) {
      const ax = s.aimX + s.wobble.x, ay = s.aimY + s.wobble.y;
      ctx.strokeStyle = 'rgba(6,182,212,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(CX, H - 20); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ax - 10, ay); ctx.lineTo(ax + 10, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, ay - 10); ctx.lineTo(ax, ay + 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(ax, ay, 6, 0, Math.PI * 2); ctx.stroke();
    }

    // Score FX
    if (s.scoreFx) {
      ctx.fillStyle = s.scoreFx.color;
      ctx.globalAlpha = s.scoreFx.timer / 40;
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(s.scoreFx.text, s.scoreFx.x, s.scoreFx.y - (40 - s.scoreFx.timer) * 0.8);
      ctx.globalAlpha = 1;
    }

    // HUD
    ctx.fillStyle = 'rgba(6,182,212,0.1)'; ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = COLOR; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('MANCHE ' + s.round + '/' + MAX_ROUNDS, 8, 11);
    ctx.textAlign = 'right';
    ctx.fillText('TOTAL: ' + s.totalScore, W - 8, 11);
    ctx.textAlign = 'center';
    for (let i = 0; i < DARTS_PER_ROUND; i++) {
      ctx.fillStyle = i < s.roundDarts ? COLOR : '#333';
      ctx.fillText('🎯', W / 2 + (i - 1) * 20, 11);
    }

    // Charge bar
    if (s.holding) {
      const dur = Date.now() - s.holdStart;
      const pct = Math.min(dur / 1500, 1);
      ctx.fillStyle = 'rgba(6,182,212,0.1)'; ctx.fillRect(10, H - 14, W - 20, 8);
      ctx.fillStyle = COLOR; ctx.fillRect(10, H - 14, (W - 20) * pct, 8);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [update]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);

    const canvas = canvasRef.current!;
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width, scaleY = H / rect.height;
      if ('touches' in e && e.touches.length > 0) {
        return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
      }
      if ('clientX' in e) {
        return { x: ((e as MouseEvent).clientX - rect.left) * scaleX, y: ((e as MouseEvent).clientY - rect.top) * scaleY };
      }
      return { x: CX, y: CY };
    };

    const startHold = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (s.state !== 'playing' || s.thrown || s.throwAnim || s.roundDarts <= 0) return;
      const pos = getPos(e);
      s.aimX = pos.x; s.aimY = pos.y;
      s.holding = true; s.holdStart = Date.now(); s.wobbleT = Math.random() * 100;
    };
    const moveAim = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (!s.holding) return;
      const pos = getPos(e);
      s.aimX = pos.x; s.aimY = pos.y;
    };
    const release = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (!s.holding || s.thrown) return;
      const ax = s.aimX + s.wobble.x, ay = s.aimY + s.wobble.y;
      s.thrown = true; s.holding = false;
      s.throwAnim = { sx: CX, sy: H - 20, tx: ax, ty: ay, t: 0, done: false };
    };

    canvas.addEventListener('mousedown', startHold);
    canvas.addEventListener('mousemove', moveAim);
    canvas.addEventListener('mouseup', release);
    canvas.addEventListener('mouseleave', release);
    canvas.addEventListener('touchstart', startHold, { passive: false });
    canvas.addEventListener('touchmove', moveAim, { passive: false });
    canvas.addEventListener('touchend', release, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousedown', startHold);
      canvas.removeEventListener('mousemove', moveAim);
      canvas.removeEventListener('mouseup', release);
      canvas.removeEventListener('mouseleave', release);
      canvas.removeEventListener('touchstart', startHold);
      canvas.removeEventListener('touchmove', moveAim);
      canvas.removeEventListener('touchend', release);
    };
  }, [render]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🎯</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>FLÉCHETTES</div>
            <div className="text-[11px] text-muted-foreground text-center px-4">Maintenir pour viser<br/>Relâcher pour lancer</div>
          </div>
        )}
        {gameState === 'ended' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold" style={{ color: COLOR }}>PARTIE TERMINÉE</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{finalScore}</div>
            <div className="text-[11px] text-muted-foreground">
              GRADE : {finalScore >= 500 ? 'S' : finalScore >= 350 ? 'A' : finalScore >= 200 ? 'B' : finalScore >= 100 ? 'C' : 'D'}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
        <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
      </div>
    </div>
  );
}
