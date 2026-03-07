import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Dpad, ActionButton } from './TouchControls';

const W = 360, H = 360;
const COLS = 9, ROWS = 9, TILE = 40;
const COLOR = '#22c55e';

const ROW_TYPES = ['goal','river','river','river','safe','road','road','road','safe'];

type GameState = 'idle' | 'playing' | 'dead';

export default function FroggerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');

  const stateRef = useRef({
    frog: { row: 8, col: 4, x: 4 * TILE + TILE / 2, y: 8 * TILE + TILE / 2, onLog: false, logVx: 0, dead: false, deadTimer: 0, targetX: 4 * TILE + TILE / 2, targetY: 8 * TILE + TILE / 2, prevX: 4 * TILE + TILE / 2, prevY: 8 * TILE + TILE / 2 },
    lanes: [] as any[],
    score: 0, lives: 3, level: 1, frame: 0,
    particles: [] as any[],
    moveQueue: [] as any[],
    moving: false, moveTimer: 0,
    state: 'idle' as GameState,
  });

  const MOVE_FRAMES = 8;

  const makeLanes = useCallback((lvl: number) => {
    const spd = 1 + lvl * 0.3;
    return [
      { row: 1, type: 'log', dir: 1, speed: spd * 0.7, objs: [{ x: 0, w: 3 }, { x: 4.5, w: 2.5 }, { x: 8, w: 3 }] },
      { row: 2, type: 'lily', dir: -1, speed: spd * 0.9, objs: [{ x: 1, w: 1 }, { x: 3, w: 1 }, { x: 6, w: 1 }, { x: 8.5, w: 1 }] },
      { row: 3, type: 'log', dir: 1, speed: spd * 1.1, objs: [{ x: 0.5, w: 2 }, { x: 3.5, w: 2 }, { x: 7, w: 2 }] },
      { row: 5, type: 'car', dir: -1, speed: spd * 0.8, objs: [{ x: 1, w: 1.5 }, { x: 4, w: 1.5 }, { x: 7, w: 1.5 }] },
      { row: 6, type: 'truck', dir: 1, speed: spd * 0.6, objs: [{ x: 0, w: 2.5 }, { x: 5, w: 2.5 }] },
      { row: 7, type: 'car', dir: 1, speed: spd * 1.2, objs: [{ x: 0.5, w: 1 }, { x: 3, w: 1 }, { x: 5.5, w: 1 }, { x: 8, w: 1 }] },
    ];
  }, []);

  const initFrog = () => ({ row: 8, col: 4, x: 4 * TILE + TILE / 2, y: 8 * TILE + TILE / 2, onLog: false, logVx: 0, dead: false, deadTimer: 0, targetX: 4 * TILE + TILE / 2, targetY: 8 * TILE + TILE / 2, prevX: 4 * TILE + TILE / 2, prevY: 8 * TILE + TILE / 2 });

  const start = useCallback(() => {
    const s = stateRef.current;
    s.score = 0; s.lives = 3; s.level = 1; s.frame = 0; s.particles = [];
    s.lanes = makeLanes(1);
    s.frog = initFrog();
    s.moveQueue = []; s.moving = false;
    s.state = 'playing'; setGameState('playing');
  }, [makeLanes]);

  const tryMove = useCallback((dr: number, dc: number) => {
    const s = stateRef.current;
    if (s.state !== 'playing' || s.frog.dead) return;
    const nr = s.frog.row + dr, nc = s.frog.col + dc;
    if (nr < 0 || nr > 8 || nc < 0 || nc > 8) return;
    s.moveQueue.push({ dr, dc });
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      s.particles.push({ x, y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4 - 2, life: 25, color });
    }
  };

  const die = useCallback(() => {
    const s = stateRef.current;
    if (s.frog.dead) return;
    s.frog.dead = true; s.frog.deadTimer = 40;
    s.lives--;
    spawnParticles(s.frog.x, s.frog.y, '#ef4444');
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    s.frame++;

    if (s.moving) {
      s.moveTimer++;
      const t = s.moveTimer / MOVE_FRAMES;
      s.frog.x = s.frog.prevX + (s.frog.targetX - s.frog.prevX) * Math.min(t, 1);
      s.frog.y = s.frog.prevY + (s.frog.targetY - s.frog.prevY) * Math.min(t, 1);
      if (s.moveTimer >= MOVE_FRAMES) {
        s.frog.x = s.frog.targetX; s.frog.y = s.frog.targetY;
        s.moving = false; s.moveTimer = 0;
        // check collision
        if (!s.frog.dead && ROW_TYPES[s.frog.row] === 'road') {
          for (const lane of s.lanes) {
            if (lane.row !== s.frog.row) continue;
            for (const o of lane.objs) {
              const ox = o.x * TILE, ow = o.w * TILE;
              if (s.frog.x > ox + 4 && s.frog.x < ox + ow - 4) { die(); return; }
            }
          }
        }
      }
    } else if (s.moveQueue.length > 0 && !s.frog.dead) {
      const { dr, dc } = s.moveQueue.shift()!;
      s.frog.row += dr; s.frog.col += dc;
      s.frog.row = Math.max(0, Math.min(8, s.frog.row));
      s.frog.col = Math.max(0, Math.min(8, s.frog.col));
      s.frog.prevX = s.frog.x; s.frog.prevY = s.frog.y;
      s.frog.targetX = s.frog.col * TILE + TILE / 2;
      s.frog.targetY = s.frog.row * TILE + TILE / 2;
      s.moving = true; s.moveTimer = 0;
    }

    for (const lane of s.lanes) {
      for (const o of lane.objs) {
        o.x += lane.dir * lane.speed / TILE;
        const totalW = COLS + 2;
        if (lane.dir > 0 && o.x > COLS + 1) o.x -= totalW + o.w;
        if (lane.dir < 0 && o.x + o.w < -1) o.x += totalW + o.w;
      }
    }

    s.frog.onLog = false; s.frog.logVx = 0;
    if (!s.frog.dead && ROW_TYPES[s.frog.row] === 'river') {
      for (const lane of s.lanes) {
        if (lane.row !== s.frog.row) continue;
        for (const o of lane.objs) {
          const ox = o.x * TILE, ow = o.w * TILE;
          if (s.frog.x > ox + 4 && s.frog.x < ox + ow - 4) {
            s.frog.onLog = true;
            s.frog.logVx = lane.dir * lane.speed;
          }
        }
      }
      if (!s.frog.dead && !s.frog.onLog && !s.moving) { die(); return; }
      if (s.frog.onLog && !s.moving) {
        s.frog.x += s.frog.logVx;
        s.frog.targetX = s.frog.x;
        s.frog.col = Math.round((s.frog.x - TILE / 2) / TILE);
        if (s.frog.x < 4 || s.frog.x > W - 4) { die(); return; }
      }
    }

    if (s.frog.dead) {
      s.frog.deadTimer--;
      if (s.frog.deadTimer <= 0) {
        if (s.lives <= 0) { s.state = 'dead'; setGameState('dead'); return; }
        s.frog = initFrog(); s.moveQueue = []; s.moving = false;
      }
      return;
    }

    if (s.frog.row === 0 && !s.moving) {
      s.score += 50 * s.level;
      spawnParticles(s.frog.x, s.frog.y, '#4ade80');
      s.level++;
      s.lanes = makeLanes(s.level);
      s.frog = initFrog(); s.moveQueue = []; s.moving = false;
    }

    s.particles = s.particles.filter((p: any) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; return p.life > 0; });
  }, [die, makeLanes]);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    update();

    ctx.clearRect(0, 0, W, H);

    for (let r = 0; r < ROWS; r++) {
      const y = r * TILE;
      const type = ROW_TYPES[r];
      if (type === 'goal') ctx.fillStyle = '#052e16';
      else if (type === 'river') ctx.fillStyle = '#0c1a3a';
      else if (type === 'road') ctx.fillStyle = '#1c1c1c';
      else ctx.fillStyle = '#14200a';
      ctx.fillRect(0, y, W, TILE);

      if (type === 'road' && r < ROWS - 1 && ROW_TYPES[r + 1] === 'road') {
        ctx.fillStyle = '#fde68a'; ctx.globalAlpha = 0.5;
        for (let i = 0; i < 9; i++) ctx.fillRect(i * 40 + 8, y + TILE - 3, 24, 3);
        ctx.globalAlpha = 1;
      }
      if (type === 'river') {
        ctx.fillStyle = 'rgba(6,182,212,0.08)';
        for (let i = 0; i < 6; i++) {
          const wx = ((i * 60 + s.frame * 0.5) % W + W) % W;
          ctx.fillRect(wx, y + TILE * 0.3, 40, 4);
        }
      }
      if (type === 'goal') {
        ctx.fillStyle = COLOR; ctx.shadowColor = COLOR; ctx.shadowBlur = 8;
        for (let c = 1; c < 9; c += 2) {
          ctx.beginPath(); ctx.ellipse(c * TILE + TILE / 2, y + TILE / 2, TILE * 0.38, TILE * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#4ade80'; ctx.font = '10px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let c = 1; c < 9; c += 2) ctx.fillText('🏁', c * TILE + TILE / 2, y + TILE / 2);
      }
    }

    for (const lane of s.lanes) {
      const y = lane.row * TILE;
      for (const o of lane.objs) {
        const x = o.x * TILE, w = o.w * TILE;
        if (lane.type === 'log') {
          ctx.fillStyle = '#78350f'; ctx.shadowColor = '#92400e'; ctx.shadowBlur = 4;
          ctx.beginPath(); ctx.roundRect(x + 2, y + 8, w - 4, TILE - 16, 6); ctx.fill();
          ctx.fillStyle = '#a16207'; ctx.fillRect(x + 6, y + 14, w - 12, 6);
          ctx.shadowBlur = 0;
        } else if (lane.type === 'car') {
          ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.roundRect(x + 2, y + 10, w - 4, TILE - 20, 5); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 8, y + 13, 12, 8);
          ctx.fillStyle = '#fde68a';
          if (lane.dir > 0) ctx.fillRect(x + w - 8, y + 14, 5, 6);
          else ctx.fillRect(x + 3, y + 14, 5, 6);
          ctx.shadowBlur = 0;
        } else if (lane.type === 'truck') {
          ctx.fillStyle = '#7c3aed'; ctx.shadowColor = '#7c3aed'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.roundRect(x + 2, y + 8, w - 4, TILE - 16, 5); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x + 8, y + 12, 16, 10);
          ctx.fillStyle = '#fde68a';
          if (lane.dir > 0) ctx.fillRect(x + w - 8, y + 13, 5, 8);
          else ctx.fillRect(x + 3, y + 13, 5, 8);
          ctx.shadowBlur = 0;
        } else if (lane.type === 'lily') {
          ctx.fillStyle = '#14532d'; ctx.shadowColor = COLOR; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.ellipse(x + TILE * 0.42, y + TILE / 2, TILE * 0.35, TILE * 0.27, 0, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Frog
    if (!s.frog.dead || s.frame % 4 < 2) {
      ctx.save(); ctx.translate(s.frog.x, s.frog.y);
      const c = s.frog.dead ? '#ef4444' : COLOR;
      const c2 = s.frog.dead ? '#f87171' : '#4ade80';
      ctx.shadowColor = c; ctx.shadowBlur = 10;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(0, 4, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, -6, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.ellipse(-8, -12, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8, -12, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
      if (!s.frog.dead) {
        ctx.fillStyle = '#0f0f1a';
        ctx.beginPath(); ctx.arc(-8, -12, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -12, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(-16, 0, 7, 4, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(16, 0, 7, 4, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-14, 12, 5, 8, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(14, 12, 5, 8, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.restore();
    }

    for (const p of s.particles) {
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 25;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // HUD
    ctx.font = 'bold 13px monospace'; ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${String(s.score).padStart(4, '0')}`, 10, 18);
    ctx.fillStyle = '#fde68a'; ctx.textAlign = 'center';
    ctx.fillText(`NV ${s.level}`, W / 2, 18);
    ctx.fillStyle = '#ef4444'; ctx.textAlign = 'right';
    ctx.fillText('❤'.repeat(Math.max(0, s.lives)), W - 10, 18);

    rafRef.current = requestAnimationFrame(render);
  }, [update]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H); }
    rafRef.current = requestAnimationFrame(render);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { tryMove(-1, 0); e.preventDefault(); }
      if (e.key === 'ArrowDown') { tryMove(1, 0); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { tryMove(0, -1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { tryMove(0, 1); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', onKey); };
  }, [render, tryMove]);

  const handleDirection = useCallback((dir: string, type: 'down' | 'up') => {
    if (type === 'down') {
      if (dir === 'up') tryMove(-1, 0);
      if (dir === 'down') tryMove(1, 0);
      if (dir === 'left') tryMove(0, -1);
      if (dir === 'right') tryMove(0, 1);
    }
  }, [tryMove]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🐸</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>FROGGER</div>
            <div className="text-[11px] text-muted-foreground">↑↓←→ pour bouger</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
            <div className="text-[11px] text-muted-foreground">NIVEAU : {stateRef.current.level}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <Dpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
