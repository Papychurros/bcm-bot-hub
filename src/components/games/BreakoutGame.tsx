import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Hpad, ActionButton } from './TouchControls';

const W = 480, H = 400;
const PAD_W = 80, PAD_H = 10, PAD_Y = H - 30, PAD_SPEED = 7;
const BALL_R = 7;
const COLS_B = 9, ROWS_B = 6, BRICK_W = 48, BRICK_H = 20, BRICK_GAP = 5;
const BRICK_OFF_X = (480 - (9 * 48 + 8 * 5)) / 2, BRICK_OFF_Y = 28;
const COLOR = '#ff6a00';
const BALL_COLOR = '#ffffff';
const LIBELLES = [
  { label: 'Autre', color: '#F9A825' },
  { label: 'Moi', color: '#1E88E5' },
  { label: 'Perso', color: '#43A047' },
  { label: 'Pub', color: '#9E9E9E' },
  { label: 'Réseau Soc.', color: '#546E7A' },
  { label: 'Travail', color: '#E53935' },
];

type GameState = 'idle' | 'playing' | 'paused' | 'dead' | 'won';

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const scoreRef = useRef(0);
  const hiScoreRef = useRef(0);

  const stateRef = useRef<{
    pad: { x: number; y: number; w: number };
    ball: { x: number; y: number; vx: number; vy: number };
    bricks: { x: number; y: number; alive: boolean; color: string; label: string }[];
    score: number; hiScore: number; lives: number;
    running: boolean; paused: boolean; dead: boolean; won: boolean;
    loop: number | null; keys: Record<string, boolean>;
    lastTime: number; accumulator: number;
  }>({
    pad: { x: 0, y: PAD_Y, w: PAD_W }, ball: { x: 0, y: 0, vx: 0, vy: 0 },
    bricks: [], score: 0, hiScore: 0, lives: 3,
    running: false, paused: false, dead: false, won: false,
    loop: null, keys: {}, lastTime: 0, accumulator: 0
  });

  const makeBricks = useCallback(() => {
    const total = ROWS_B * COLS_B;
    const pool: typeof LIBELLES = [];
    for (let i = 0; i < Math.ceil(total / LIBELLES.length); i++) LIBELLES.forEach(l => pool.push(l));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const bricks: typeof stateRef.current.bricks = [];
    let idx = 0;
    for (let r = 0; r < ROWS_B; r++) {
      for (let col = 0; col < COLS_B; col++) {
        const lib = pool[idx++];
        bricks.push({ x: BRICK_OFF_X + col * (BRICK_W + BRICK_GAP), y: BRICK_OFF_Y + r * (BRICK_H + BRICK_GAP), alive: true, color: lib.color, label: lib.label });
      }
    }
    return bricks;
  }, []);

  const brickRR = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  };

  const drawStatic = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    drawStatic();
    // HUD
    ctx.font = "bold 13px 'DM Mono',monospace";
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${String(s.score).padStart(4, '0')}`, 10, 18);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'center';
    ctx.fillText('❤'.repeat(s.lives), W / 2, 18);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'right';
    ctx.fillText(`BEST  ${String(s.hiScore).padStart(4, '0')}`, W - 10, 18);
    // Bricks
    for (const b of s.bricks) {
      if (!b.alive) continue;
      ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = b.color; ctx.fillStyle = b.color;
      ctx.beginPath(); brickRR(ctx, b.x + 1, b.y + 1, BRICK_W - 2, BRICK_H - 2, 3); ctx.fill();
      ctx.globalAlpha = .18; ctx.fillStyle = '#fff'; ctx.fillRect(b.x + 3, b.y + 2, BRICK_W - 6, 4);
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = "bold 8px 'DM Mono',monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x + BRICK_W / 2, b.y + BRICK_H / 2 + 1);
      ctx.restore();
    }
    // Pad
    ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = COLOR;
    const grad = ctx.createLinearGradient(s.pad.x, 0, s.pad.x + s.pad.w, 0);
    grad.addColorStop(0, '#ff9a3c'); grad.addColorStop(.5, COLOR); grad.addColorStop(1, '#ff9a3c');
    ctx.fillStyle = grad; brickRR(ctx, s.pad.x, s.pad.y, s.pad.w, PAD_H, 5); ctx.fill(); ctx.restore();
    // Ball
    ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = COLOR; ctx.fillStyle = BALL_COLOR;
    ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .3; ctx.shadowBlur = 8; ctx.fillStyle = COLOR;
    ctx.beginPath(); ctx.arc(s.ball.x - s.ball.vx * 1.5, s.ball.y - s.ball.vy * 1.5, BALL_R * .7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }, [drawStatic]);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.keys['ArrowLeft'] || s.keys['left']) s.pad.x = Math.max(0, s.pad.x - PAD_SPEED);
    if (s.keys['ArrowRight'] || s.keys['right']) s.pad.x = Math.min(W - s.pad.w, s.pad.x + PAD_SPEED);
    s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;
    if (s.ball.x - BALL_R <= 0) { s.ball.x = BALL_R; s.ball.vx = Math.abs(s.ball.vx); }
    if (s.ball.x + BALL_R >= W) { s.ball.x = W - BALL_R; s.ball.vx = -Math.abs(s.ball.vx); }
    if (s.ball.y - BALL_R <= 0) { s.ball.y = BALL_R; s.ball.vy = Math.abs(s.ball.vy); }
    if (s.ball.y + BALL_R >= H) {
      s.lives--;
      if (s.lives <= 0) { s.running = false; s.dead = true; if (s.score > s.hiScore) s.hiScore = s.score; scoreRef.current = s.score; hiScoreRef.current = s.hiScore; setTimeout(() => setGameState('dead'), 400); return; }
      s.ball.x = s.pad.x + s.pad.w / 2; s.ball.y = PAD_Y - BALL_R - 2;
      s.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 1.9; s.ball.vy = -3.2;
    }
    // Pad collision
    if (s.ball.vy > 0 && s.ball.y + BALL_R >= s.pad.y && s.ball.y - BALL_R < s.pad.y + PAD_H && s.ball.x + BALL_R > s.pad.x && s.ball.x - BALL_R < s.pad.x + s.pad.w) {
      const SPEED = 3.6;
      const rel = (s.ball.x - (s.pad.x + s.pad.w / 2)) / (s.pad.w / 2);
      const angle = rel * Math.PI / 3;
      s.ball.vx = SPEED * Math.sin(angle); s.ball.vy = -SPEED * Math.cos(angle);
      s.ball.y = s.pad.y - BALL_R - 1;
    }
    // Brick collision
    let alive = 0;
    for (const b of s.bricks) {
      if (!b.alive) continue;
      alive++;
      if (s.ball.x + BALL_R > b.x && s.ball.x - BALL_R < b.x + BRICK_W && s.ball.y + BALL_R > b.y && s.ball.y - BALL_R < b.y + BRICK_H) {
        b.alive = false; s.score += 10; if (s.score > s.hiScore) s.hiScore = s.score;
        const overlapL = s.ball.x + BALL_R - b.x; const overlapR = b.x + BRICK_W - (s.ball.x - BALL_R);
        const overlapT = s.ball.y + BALL_R - b.y; const overlapB = b.y + BRICK_H - (s.ball.y - BALL_R);
        const minH = Math.min(overlapL, overlapR); const minV = Math.min(overlapT, overlapB);
        if (minH < minV) s.ball.vx *= -1; else s.ball.vy *= -1;
        const bspd = Math.sqrt(s.ball.vx ** 2 + s.ball.vy ** 2);
        s.ball.vx = s.ball.vx / bspd * 3.6; s.ball.vy = s.ball.vy / bspd * 3.6;
        break;
      }
    }
    if (alive === 0) { s.running = false; s.won = true; if (s.score > s.hiScore) s.hiScore = s.score; scoreRef.current = s.score; hiScoreRef.current = s.hiScore; setTimeout(() => setGameState('won'), 300); }
  }, []);

  const tickRef = useRef<(ts: number) => void>();
  tickRef.current = (ts: number) => {
    const s = stateRef.current;
    if (!s.running) return;
    if (s.lastTime) {
      s.accumulator += Math.min(ts - s.lastTime, 50);
      const STEP = 1000 / 60;
      while (s.accumulator >= STEP) { update(); s.accumulator -= STEP; }
    }
    s.lastTime = ts;
    draw();
    s.loop = requestAnimationFrame(tickRef.current!);
  };

  const start = useCallback(() => {
    const s = stateRef.current;
    if (s.loop) cancelAnimationFrame(s.loop);
    s.pad = { x: W / 2 - PAD_W / 2, y: PAD_Y, w: PAD_W };
    s.ball = { x: W / 2, y: PAD_Y - BALL_R - 2, vx: 1.9, vy: -3.2 };
    s.score = 0; s.lives = 3; s.bricks = makeBricks();
    s.running = true; s.paused = false; s.dead = false; s.won = false;
    s.lastTime = 0; s.accumulator = 0;
    setGameState('playing');
    s.loop = requestAnimationFrame(tickRef.current!);
  }, [makeBricks, update, draw]);

  useEffect(() => {
    drawStatic();
    const onKey = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      const s = stateRef.current;
      if (s.loop) cancelAnimationFrame(s.loop);
      s.running = false; s.keys = {};
    };
  }, [drawStatic]);

  const handleDirection = useCallback((dir: string, active: boolean) => {
    stateRef.current.keys[dir] = active;
  }, []);

  return (
    <div className="flex gap-5 items-start flex-col sm:flex-row">
      <div className="relative flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden min-h-[420px]">
        <canvas ref={canvasRef} width={W} height={H} className="block max-w-full max-h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🎯</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>CASSE-BRIQUES NÉON</div>
            <div className="text-[11px] text-muted-foreground">← → ou boutons pour déplacer la raquette</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{scoreRef.current}</div>
            <div className="text-[11px] text-muted-foreground">MEILLEUR : {hiScoreRef.current}</div>
          </div>
        )}
        {gameState === 'won' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🏆</div>
            <div className="text-base font-bold text-[#ffd700]">FÉLICITATIONS !</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{scoreRef.current}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0 self-center sm:self-start">
        <Hpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
