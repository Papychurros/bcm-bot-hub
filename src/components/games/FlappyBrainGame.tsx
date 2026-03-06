import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const W = 380, H = 480;
const GRAVITY = 0.15, JUMP = -4.2, PIPE_W = 52, GAP = 165, PIPE_SPEED = 1.5, SPAWN_INT = 140;
const COLOR = '#a855f7';

type GameState = 'idle' | 'playing' | 'dead';

interface Pipe { x: number; top: number; bottom: number; passed: boolean; }

export default function FlappyBrainGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const stateRef = useRef({
    brain: { x: 90, y: H / 2, vy: 0, r: 18 },
    pipes: [] as Pipe[], score: 0, hiScore: 0, frame: 0, state: 'idle' as GameState,
  });

  const resetState = useCallback(() => {
    const s = stateRef.current;
    s.brain = { x: 90, y: H / 2, vy: 0, r: 18 };
    s.pipes = []; s.score = 0; s.frame = 0; s.state = 'idle';
    setGameState('idle');
  }, []);

  const tap = useCallback(() => {
    const s = stateRef.current;
    if (s.state === 'idle' || s.state === 'dead') {
      s.brain = { x: 90, y: H / 2, vy: 0, r: 18 };
      s.pipes = []; s.score = 0; s.frame = 0;
      s.state = 'playing'; setGameState('playing');
    } else if (s.state === 'playing') {
      s.brain.vy = JUMP;
    }
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.brain = { x: 90, y: H / 2, vy: 0, r: 18 };
    s.pipes = []; s.score = 0; s.frame = 0;
    s.state = 'playing'; setGameState('playing');
  }, []);

  const die = useCallback(() => {
    const s = stateRef.current;
    if (s.score > s.hiScore) s.hiScore = s.score;
    s.state = 'dead'; setGameState('dead');
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    s.frame++;
    s.brain.vy += GRAVITY;
    s.brain.y += s.brain.vy;

    if (s.frame % SPAWN_INT === 0) {
      const top = 70 + Math.random() * (H - GAP - 140);
      s.pipes.push({ x: W, top, bottom: top + GAP, passed: false });
    }
    s.pipes.forEach(p => p.x -= PIPE_SPEED);
    s.pipes = s.pipes.filter(p => p.x > -PIPE_W);
    s.pipes.forEach(p => { if (!p.passed && p.x + PIPE_W < s.brain.x) { p.passed = true; s.score++; } });

    if (s.brain.y + s.brain.r > H || s.brain.y - s.brain.r < 0) { die(); return; }
    for (const p of s.pipes) {
      if (s.brain.x + s.brain.r > p.x && s.brain.x - s.brain.r < p.x + PIPE_W) {
        if (s.brain.y - s.brain.r < p.top || s.brain.y + s.brain.r > p.bottom) { die(); return; }
      }
    }
  }, [die]);

  const drawBrain = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number) => {
    ctx.save(); ctx.translate(x, y);
    ctx.rotate(Math.max(-0.4, Math.min(0.6, angle)));
    ctx.shadowBlur = 18; ctx.shadowColor = '#a855f7';
    ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(-r * .28, 0, r * .45, r * .65, -0.1, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#c084fc';
    ctx.beginPath(); ctx.ellipse(r * .28, 0, r * .45, r * .65, 0.1, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,150,255,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -r * .6); ctx.lineTo(0, r * .6); ctx.stroke();
    const nodes: [number, number, string][] = [[-r * .35, -r * .3, '#4a9eff'], [r * .35, -r * .3, '#c084fc'], [-r * .5, r * .1, '#4a9eff'], [r * .5, r * .1, '#c084fc']];
    nodes.forEach(([nx, ny, nc]) => { ctx.fillStyle = nc; ctx.shadowColor = nc; ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;

    update();
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#050010'); bg.addColorStop(1, '#0a0030');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(168,85,247,.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Pipes
    s.pipes.forEach(p => {
      const pg = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      pg.addColorStop(0, '#4c1d95'); pg.addColorStop(.5, '#7c3aed'); pg.addColorStop(1, '#4c1d95');
      ctx.fillStyle = pg; ctx.shadowBlur = 12; ctx.shadowColor = '#a855f7';
      ctx.beginPath(); ctx.roundRect(p.x, 0, PIPE_W, p.top, [0, 0, 8, 8]); ctx.fill();
      ctx.beginPath(); ctx.roundRect(p.x, p.bottom, PIPE_W, H - p.bottom, [8, 8, 0, 0]); ctx.fill();
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, 0, PIPE_W, p.top); ctx.strokeRect(p.x, p.bottom, PIPE_W, H - p.bottom);
      ctx.shadowBlur = 0;
    });

    drawBrain(ctx, s.brain.x, s.brain.y, s.brain.r, s.brain.vy * 0.06);

    // Score
    ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
    ctx.fillStyle = '#a855f7'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
    ctx.fillText(String(s.score), W / 2, 40);
    ctx.font = '10px monospace'; ctx.fillStyle = 'rgba(168,85,247,.5)';
    ctx.fillText('BEST: ' + s.hiScore, W / 2, 58); ctx.shadowBlur = 0;

    // Overlays
    if (s.state === 'idle') {
      ctx.fillStyle = 'rgba(5,0,16,.75)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#a855f7'; ctx.shadowBlur = 20; ctx.shadowColor = '#a855f7';
      ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center';
      ctx.fillText('FLAPPY BRAIN', W / 2, H / 2 - 20); ctx.shadowBlur = 0;
      ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(200,150,255,.7)';
      ctx.fillText('TAP / 🧠 / ESPACE pour démarrer', W / 2, H / 2 + 14);
    }
    if (s.state === 'dead') {
      ctx.fillStyle = 'rgba(5,0,16,.82)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4af8'; ctx.shadowBlur = 20; ctx.shadowColor = '#ff4af8';
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText('CONNEXION PERDUE', W / 2, H / 2 - 36); ctx.shadowBlur = 0;
      ctx.fillStyle = '#a855f7'; ctx.font = 'bold 44px monospace';
      ctx.fillText(String(s.score), W / 2, H / 2 + 16);
      ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(200,150,255,.6)';
      ctx.fillText('TAP / 🧠 pour rejouer', W / 2, H / 2 + 46);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [update, drawBrain]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const canvas = canvasRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); tap(); }
    };
    const onPointerDown = () => tap();

    window.addEventListener('keydown', onKey);
    canvas?.addEventListener('pointerdown', onPointerDown);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      canvas?.removeEventListener('pointerdown', onPointerDown);
    };
  }, [render, tap]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[380px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        {/* Tap button */}
        <button
          onPointerDown={(e) => { e.stopPropagation(); tap(); }}
          className="w-16 h-16 rounded-full bg-secondary border-2 text-2xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88] active:shadow-lg"
          style={{ borderColor: COLOR, color: COLOR }}
        >🧠</button>
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
