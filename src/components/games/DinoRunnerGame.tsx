import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const W = 360, H = 200;
const COLOR = '#22c55e';
const GROUND = 155;

type GameState = 'idle' | 'playing' | 'dead';

export default function DinoRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');

  const stateRef = useRef({
    dino: { x: 60, y: GROUND, w: 28, h: 36, vy: 0, onGround: true, ducking: false, legFrame: 0, legTimer: 0, dead: false },
    obstacles: [] as any[], clouds: [] as any[],
    score: 0, best: 0, speed: 5, frame: 0, scoreTimer: 0,
    keys: {} as Record<string, boolean>,
    state: 'idle' as GameState,
  });

  const makeObstacle = (speed: number) => {
    if (Math.random() < 0.25 && speed > 6) {
      const birdY = [GROUND - 30, GROUND - 55, GROUND - 80][Math.floor(Math.random() * 3)];
      return { type: 'bird', x: W + 20, y: birdY, w: 34, h: 22, wingUp: true, wingTimer: 0 };
    }
    const count = Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : 3;
    return { type: 'cactus', x: W + 20, y: GROUND, w: 14 * count + 4, h: 36 + Math.floor(Math.random() * 16), count };
  };

  const makeCloud = () => ({ x: W + 20, y: 20 + Math.random() * 60, w: 60 + Math.random() * 40, h: 16, speed: 0.8 + Math.random() * 0.6 });

  const start = useCallback(() => {
    const s = stateRef.current;
    s.dino = { x: 60, y: GROUND, w: 28, h: 36, vy: 0, onGround: true, ducking: false, legFrame: 0, legTimer: 0, dead: false };
    s.obstacles = []; s.clouds = [];
    s.score = 0; s.speed = 5; s.frame = 0; s.scoreTimer = 0;
    for (let i = 0; i < 3; i++) s.clouds.push({ ...makeCloud(), x: Math.random() * W });
    s.state = 'playing'; setGameState('playing');
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing' || s.dino.dead) return;
    if (s.dino.onGround) { s.dino.vy = -11; s.dino.onGround = false; }
  }, []);

  const startDuck = useCallback(() => { if (stateRef.current.state === 'playing') stateRef.current.dino.ducking = true; }, []);
  const endDuck = useCallback(() => { stateRef.current.dino.ducking = false; }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing' || s.dino.dead) return;
    s.frame++; s.scoreTimer++;
    if (s.scoreTimer >= 6) { s.scoreTimer = 0; s.score++; if (s.score > s.best) s.best = s.score; }

    s.speed = 4 + Math.floor(s.score / 150) * 0.4 + s.score * 0.005;
    s.speed = Math.min(s.speed, 11);

    s.dino.h = s.dino.ducking ? 22 : 36;
    s.dino.vy += 0.55;
    s.dino.y += s.dino.vy;
    if (s.dino.y >= GROUND) { s.dino.y = GROUND; s.dino.vy = 0; s.dino.onGround = true; }
    s.dino.legTimer++; if (s.dino.legTimer > 6) { s.dino.legTimer = 0; s.dino.legFrame = (s.dino.legFrame + 1) % 2; }

    s.clouds.forEach((c: any) => c.x -= c.speed);
    s.clouds = s.clouds.filter((c: any) => c.x + c.w > -10);
    if (s.clouds.length < 4 && Math.random() < 0.01) s.clouds.push(makeCloud());

    const minGap = Math.max(220, 380 - s.score * 0.3);
    const lastX = s.obstacles.length > 0 ? s.obstacles[s.obstacles.length - 1].x : 0;
    if (s.obstacles.length === 0 || (lastX < W - minGap && Math.random() < 0.022)) s.obstacles.push(makeObstacle(s.speed));
    s.obstacles.forEach((o: any) => { o.x -= s.speed; if (o.type === 'bird') { o.wingTimer++; if (o.wingTimer > 12) { o.wingTimer = 0; o.wingUp = !o.wingUp; } } });
    s.obstacles = s.obstacles.filter((o: any) => o.x + o.w > -10);

    const dr = { x: s.dino.x + 4, y: s.dino.y - s.dino.h + 4, w: s.dino.w - 8, h: s.dino.h - 8 };
    for (const o of s.obstacles) {
      const or2 = { x: o.x + 2, y: o.y - o.h + 2, w: o.w - 4, h: o.h - 4 };
      if (dr.x < or2.x + or2.w && dr.x + dr.w > or2.x && dr.y < or2.y + or2.h && dr.y + dr.h > or2.y) {
        s.dino.dead = true; s.state = 'dead'; setGameState('dead');
        return;
      }
    }
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    update();

    ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.strokeStyle = '#14532d'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, GROUND + 2); ctx.lineTo(W, GROUND + 2); ctx.stroke();
    ctx.fillStyle = '#14532d';
    for (let i = 0; i < 12; i++) { const sx = ((i * 40 + s.frame * s.speed * 0.3) % W + W) % W; ctx.fillRect(sx, GROUND + 4, 18, 2); }

    // Clouds
    ctx.fillStyle = 'rgba(34,197,94,0.12)';
    for (const c of s.clouds) {
      ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Obstacles
    for (const o of s.obstacles) {
      if (o.type === 'cactus') {
        ctx.fillStyle = COLOR; ctx.shadowColor = COLOR; ctx.shadowBlur = 6;
        ctx.fillRect(o.x + o.w / 2 - 5, o.y - o.h, 10, o.h);
        if (o.count >= 1) { ctx.fillRect(o.x + o.w / 2 - 15, o.y - o.h * 0.6, 10, 6); ctx.fillRect(o.x + o.w / 2 - 15, o.y - o.h * 0.75, 6, o.h * 0.2); }
        if (o.count >= 2) { ctx.fillRect(o.x + o.w / 2 + 5, o.y - o.h * 0.5, 10, 6); ctx.fillRect(o.x + o.w / 2 + 9, o.y - o.h * 0.65, 6, o.h * 0.2); }
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 8;
        ctx.fillRect(o.x + 6, o.y - 10, 22, 10);
        ctx.fillRect(o.x + 24, o.y - 14, 10, 8);
        ctx.fillRect(o.x + 32, o.y - 12, 6, 4);
        ctx.fillStyle = '#0f0f1a'; ctx.fillRect(o.x + 28, o.y - 13, 3, 3);
        ctx.fillStyle = '#4ade80';
        if (o.wingUp) { ctx.fillRect(o.x, o.y - 22, 20, 8); } else { ctx.fillRect(o.x + 2, o.y - 4, 18, 8); }
        ctx.shadowBlur = 0;
      }
    }

    // Dino
    if (!s.dino.dead || s.frame % 4 < 2) {
      const x = s.dino.x, y = s.dino.y;
      ctx.fillStyle = s.dino.dead ? '#ef4444' : COLOR;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
      if (s.dino.ducking) {
        ctx.fillRect(x, y - 22, 36, 20);
        ctx.fillRect(x + 26, y - 28, 14, 10);
        ctx.fillStyle = '#0f0f1a'; ctx.fillRect(x + 34, y - 26, 4, 4);
        ctx.fillStyle = s.dino.dead ? '#ef4444' : COLOR;
        ctx.fillRect(x + 4, y - 4, 8, 4); ctx.fillRect(x + 20, y - 4, 8, 4);
      } else {
        ctx.fillRect(x + 2, y - 30, 22, 20);
        ctx.fillRect(x + 14, y - 38, 16, 14);
        ctx.fillStyle = '#0f0f1a'; ctx.fillRect(x + 24, y - 36, 5, 5);
        ctx.fillStyle = s.dino.dead ? '#ef4444' : COLOR;
        ctx.fillRect(x, y - 24, 8, 8); ctx.fillRect(x - 4, y - 18, 8, 6);
        if (s.dino.onGround) {
          if (s.dino.legFrame === 0) { ctx.fillRect(x + 6, y - 10, 8, 10); ctx.fillRect(x + 18, y - 6, 8, 6); }
          else { ctx.fillRect(x + 6, y - 6, 8, 6); ctx.fillRect(x + 18, y - 10, 8, 10); }
        } else { ctx.fillRect(x + 6, y - 8, 8, 8); ctx.fillRect(x + 18, y - 8, 8, 8); }
      }
      ctx.shadowBlur = 0;
    }

    // HUD
    ctx.font = 'bold 11px monospace'; ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${s.score}`, 10, 16);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'right';
    ctx.fillText(`BEST ${s.best}`, W - 10, 16);

    rafRef.current = requestAnimationFrame(render);
  }, [update]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { jump(); e.preventDefault(); }
      if (e.key === 'ArrowDown') { startDuck(); e.preventDefault(); }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'ArrowDown') endDuck(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);

    const canvas = canvasRef.current!;
    let touchY: number | null = null;
    const onTS = (e: TouchEvent) => { e.preventDefault(); touchY = e.touches[0].clientY; jump(); };
    const onTE = (e: TouchEvent) => { e.preventDefault(); endDuck(); touchY = null; };
    const onTM = (e: TouchEvent) => { e.preventDefault(); if (touchY !== null && e.touches[0].clientY - touchY > 30) startDuck(); };
    canvas.addEventListener('touchstart', onTS, { passive: false });
    canvas.addEventListener('touchend', onTE, { passive: false });
    canvas.addEventListener('touchmove', onTM, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('touchstart', onTS);
      canvas.removeEventListener('touchend', onTE);
      canvas.removeEventListener('touchmove', onTM);
    };
  }, [render, jump, startDuck, endDuck]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🦕</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>DINO RUNNER</div>
            <div className="text-[11px] text-muted-foreground">ESPACE / TAP = Sauter • ↓ = S'accroupir</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
            <div className="text-[11px] text-muted-foreground">BEST : {stateRef.current.best}</div>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
        <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
      </div>
      <div className="text-[10px] font-mono text-muted-foreground text-center">TAP = Sauter • Glisser ↓ = S'accroupir</div>
    </div>
  );
}
