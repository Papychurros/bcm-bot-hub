import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const W = 360, H = 400;
const COLOR = '#a855f7';
const GRAV = 0.45, JUMP = -10, SPD = 3.2, TILE = 32;

type GameState = 'idle' | 'playing' | 'dead';

const LEVELS = [
  { platforms: [{ x: 0, y: 11, w: 5 }, { x: 6, y: 11, w: 4 }, { x: 11, y: 11, w: 5 }, { x: 2, y: 8, w: 3 }, { x: 7, y: 7, w: 3 }, { x: 10, y: 6, w: 3 }, { x: 1, y: 4, w: 2 }, { x: 5, y: 3, w: 3 }, { x: 9, y: 4, w: 2 }, { x: 0, y: 12, w: 12 }],
    enemies: [{ x: 7, y: 10, dir: 1 }, { x: 11, y: 11, dir: -1 }],
    stars: [{ x: 3, y: 7 }, { x: 8, y: 6 }, { x: 10, y: 5 }, { x: 6, y: 2 }, { x: 2, y: 3 }],
    goal: { x: 10, y: 3 }, startX: 1, startY: 10 },
  { platforms: [{ x: 0, y: 12, w: 3 }, { x: 4, y: 12, w: 3 }, { x: 8, y: 12, w: 4 }, { x: 1, y: 9, w: 2 }, { x: 5, y: 8, w: 2 }, { x: 9, y: 9, w: 2 }, { x: 2, y: 6, w: 3 }, { x: 7, y: 5, w: 3 }, { x: 4, y: 3, w: 3 }, { x: 0, y: 4, w: 2 }],
    enemies: [{ x: 5, y: 11, dir: 1 }, { x: 9, y: 11, dir: -1 }, { x: 3, y: 8, dir: 1 }],
    stars: [{ x: 2, y: 8 }, { x: 6, y: 7 }, { x: 8, y: 4 }, { x: 5, y: 2 }, { x: 1, y: 3 }, { x: 10, y: 8 }],
    goal: { x: 5, y: 2 }, startX: 1, startY: 11 },
  { platforms: [{ x: 0, y: 12, w: 2 }, { x: 3, y: 12, w: 2 }, { x: 6, y: 12, w: 2 }, { x: 9, y: 12, w: 3 }, { x: 1, y: 10, w: 2 }, { x: 4, y: 9, w: 2 }, { x: 7, y: 8, w: 2 }, { x: 2, y: 7, w: 2 }, { x: 5, y: 6, w: 2 }, { x: 9, y: 6, w: 2 }, { x: 0, y: 4, w: 3 }, { x: 4, y: 3, w: 3 }, { x: 8, y: 4, w: 3 }, { x: 5, y: 1, w: 2 }],
    enemies: [{ x: 4, y: 11, dir: 1 }, { x: 7, y: 11, dir: -1 }, { x: 3, y: 9, dir: 1 }, { x: 6, y: 7, dir: -1 }],
    stars: [{ x: 2, y: 9 }, { x: 5, y: 8 }, { x: 10, y: 5 }, { x: 1, y: 3 }, { x: 5, y: 2 }, { x: 9, y: 3 }, { x: 6, y: 0 }],
    goal: { x: 5, y: 0 }, startX: 0, startY: 11 },
];

export default function PlatformerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');

  const stateRef = useRef({
    player: { x: 0, y: 0, w: 24, h: 30, vx: 0, vy: 0, onGround: false, dir: 1, frame: 0, frameTimer: 0, invincible: 0 },
    platforms: [] as any[], enemies: [] as any[], stars: [] as any[],
    goal: { x: 0, y: 0, w: 28, h: 28, anim: 0 },
    score: 0, lives: 3, level: 1, camX: 0,
    particles: [] as any[],
    keys: {} as Record<string, boolean>,
    state: 'idle' as GameState,
  });

  const loadLevel = useCallback((lvl: number) => {
    const data = LEVELS[(lvl - 1) % LEVELS.length];
    const s = stateRef.current;
    s.platforms = data.platforms.map(p => ({ x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: TILE }));
    s.enemies = data.enemies.map(e => ({ x: e.x * TILE, y: e.y * TILE, w: 24, h: 24, dir: e.dir, vx: 0, vy: 0, onGround: false, dead: false, deadTimer: 0 }));
    s.stars = data.stars.map(st => ({ x: st.x * TILE, y: st.y * TILE, r: 8, collected: false, anim: Math.random() * Math.PI * 2 }));
    s.goal = { x: data.goal.x * TILE, y: data.goal.y * TILE, w: 28, h: 28, anim: 0 };
    s.player = { x: data.startX * TILE, y: data.startY * TILE, w: 24, h: 30, vx: 0, vy: 0, onGround: false, dir: 1, frame: 0, frameTimer: 0, invincible: 0 };
    s.camX = 0; s.particles = [];
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.score = 0; s.lives = 3; s.level = 1;
    loadLevel(1);
    s.state = 'playing'; setGameState('playing');
  }, [loadLevel]);

  const spawnP = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      s.particles.push({ x, y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 2, life: 20, color });
    }
  };

  const resolveY = (obj: any) => {
    for (const p of stateRef.current.platforms) {
      if (obj.x + obj.w > p.x && obj.x < p.x + p.w) {
        if (obj.y + obj.h > p.y && obj.y + obj.h < p.y + p.h + obj.vy + 2 && obj.vy >= 0) {
          obj.y = p.y - obj.h; obj.vy = 0; obj.onGround = true;
        }
        if (obj.y < p.y + p.h && obj.y > p.y && obj.vy < 0) { obj.y = p.y + p.h; obj.vy = 0; }
      }
    }
  };
  const resolveX = (obj: any) => {
    for (const p of stateRef.current.platforms) {
      if (obj.y + obj.h > p.y + 4 && obj.y < p.y + p.h - 4) {
        if (obj.x + obj.w > p.x && obj.x < p.x + p.w) {
          if (obj.vx > 0) obj.x = p.x - obj.w; else obj.x = p.x + p.w;
          obj.vx = 0;
        }
      }
    }
  };

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    const K = s.keys;
    const p = s.player;

    if ((K[' '] || K.jump) && p.onGround) p.vy = JUMP;
    p.onGround = false;
    if (K.left) { p.vx = -SPD; p.dir = -1; }
    else if (K.right) { p.vx = SPD; p.dir = 1; }
    else p.vx *= 0.75;

    p.vy += GRAV; p.vy = Math.min(p.vy, 12);
    p.x += p.vx; resolveX(p);
    p.y += p.vy; resolveY(p);
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > 12 * TILE) p.x = 12 * TILE - p.w;

    if (Math.abs(p.vx) > 0.5 && p.onGround) { p.frameTimer++; if (p.frameTimer > 8) { p.frameTimer = 0; p.frame = (p.frame + 1) % 2; } }
    else if (p.onGround) p.frame = 0;
    if (p.invincible > 0) p.invincible--;

    const targetCam = p.x - W / 2 + p.w / 2;
    s.camX += (targetCam - s.camX) * 0.12;
    s.camX = Math.max(0, Math.min(s.camX, 12 * TILE - W));

    for (const e of s.enemies) {
      if (e.dead) { e.deadTimer--; continue; }
      e.vy += GRAV; e.vy = Math.min(e.vy, 12);
      e.onGround = false;
      e.x += e.dir * 1.5; resolveX(e);
      e.y += e.vy; resolveY(e);
      if (!e.onGround && e.vy > 0) e.dir *= -1;
      if (e.x < 0 || e.x + e.w > 12 * TILE) e.dir *= -1;
    }

    for (const st of s.stars) {
      st.anim += 0.08;
      if (!st.collected && Math.abs(p.x + p.w / 2 - st.x) < 18 && Math.abs(p.y + p.h / 2 - st.y) < 18) {
        st.collected = true; s.score += 10; spawnP(st.x, st.y, '#c084fc');
      }
    }

    s.goal.anim += 0.06;
    if (Math.abs(p.x + p.w / 2 - s.goal.x) < 26 && Math.abs(p.y + p.h / 2 - s.goal.y) < 26) {
      s.score += 50 * s.level; s.level++;
      spawnP(s.goal.x, s.goal.y, '#fde68a');
      loadLevel(s.level); return;
    }

    for (const e of s.enemies) {
      if (e.dead) continue;
      if (p.x + p.w - 4 > e.x && p.x + 4 < e.x + e.w && p.y + p.h > e.y && p.y < e.y + e.h) {
        if (p.vy > 0 && p.y + p.h < e.y + e.h / 2 + 6) {
          e.dead = true; e.deadTimer = 20; s.score += 20;
          p.vy = JUMP * 0.6; spawnP(e.x + e.w / 2, e.y + e.h / 2, '#ef4444');
        } else if (p.invincible === 0) {
          s.lives--; p.invincible = 90; p.vy = JUMP * 0.5;
          spawnP(p.x + p.w / 2, p.y + p.h / 2, COLOR);
          if (s.lives <= 0) { s.state = 'dead'; setGameState('dead'); return; }
        }
      }
    }

    if (p.y > H + 200) {
      s.lives--;
      if (s.lives <= 0) { s.state = 'dead'; setGameState('dead'); return; }
      loadLevel(s.level);
    }

    s.particles = s.particles.filter((pt: any) => { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.2; pt.life--; return pt.life > 0; });
  }, [loadLevel]);

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = i * Math.PI / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      i === 0 ? ctx.moveTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad)
        : ctx.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
    }
    ctx.closePath(); ctx.fill();
  };

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    update();

    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(168,85,247,0.15)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137 - s.camX * 0.1) % W + W) % W;
      const sy = (i * 97) % H;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    ctx.save(); ctx.translate(-s.camX, 0);

    for (const p of s.platforms) {
      ctx.fillStyle = '#581c87'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = COLOR; ctx.fillRect(p.x, p.y, p.w, 4);
    }

    for (const st of s.stars) {
      if (st.collected) continue;
      const pulse = Math.sin(st.anim) * 2;
      ctx.fillStyle = '#fde68a'; ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 10 + pulse;
      drawStar(ctx, st.x, st.y, st.r + pulse * 0.3);
      ctx.shadowBlur = 0;
    }

    const gp = Math.sin(s.goal.anim) * 4;
    ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 16 + gp;
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.goal.x, s.goal.y, 14 + gp * 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(253,230,138,0.15)'; ctx.fill();
    ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⭐', s.goal.x, s.goal.y);
    ctx.shadowBlur = 0;

    for (const e of s.enemies) {
      if (e.dead && e.deadTimer <= 0) continue;
      if (e.dead) { ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x, e.y + e.h - 8, e.w, 8); continue; }
      ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.ellipse(e.x + 12, e.y + 16, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(e.x + 2, e.y + 10, 20, 12);
      ctx.beginPath(); ctx.ellipse(e.x + 12, e.y + 8, 11, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(e.x + 4, e.y + 4, 6, 5); ctx.fillRect(e.x + 14, e.y + 4, 6, 5);
      ctx.fillStyle = '#0f0f1a'; ctx.fillRect(e.x + 6, e.y + 5, 3, 3); ctx.fillRect(e.x + 16, e.y + 5, 3, 3);
      ctx.shadowBlur = 0;
    }

    for (const pt of s.particles) {
      ctx.fillStyle = pt.color; ctx.globalAlpha = pt.life / 20;
      ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;

    // Player
    const p = s.player;
    const inv = p.invincible > 0 && Math.floor(p.invincible / 5) % 2 === 0;
    if (!inv) {
      ctx.shadowColor = COLOR; ctx.shadowBlur = 10;
      ctx.save();
      if (p.dir === -1) { ctx.scale(-1, 1); ctx.translate(-(p.x * 2 + p.w), 0); }
      ctx.fillStyle = COLOR; ctx.fillRect(p.x + 2, p.y + 12, 20, 18);
      ctx.fillStyle = '#c084fc'; ctx.fillRect(p.x + 4, p.y, 16, 14);
      ctx.fillStyle = '#0f0f1a'; ctx.fillRect(p.x + 7, p.y + 4, 4, 4); ctx.fillRect(p.x + 13, p.y + 4, 4, 4);
      ctx.fillStyle = '#e879f9'; ctx.fillRect(p.x + 8, p.y + 5, 2, 2); ctx.fillRect(p.x + 14, p.y + 5, 2, 2);
      ctx.fillStyle = '#c084fc'; ctx.fillRect(p.x + 10, p.y - 4, 4, 5); ctx.fillRect(p.x + 8, p.y - 6, 8, 3);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(p.x + 4, p.y + 28, 8, 8); ctx.fillRect(p.x + 12, p.y + 28, 8, 8);
      ctx.restore(); ctx.shadowBlur = 0;
    }

    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(168,85,247,0.15)'; ctx.fillRect(0, 0, W, 28);
    ctx.fillStyle = COLOR; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('NV ' + s.level, 10, 14);
    ctx.textAlign = 'center';
    ctx.fillText('⭐ ' + s.stars.filter((st: any) => !st.collected).length, W / 2, 14);
    ctx.textAlign = 'right';
    ctx.fillText(s.score + ' pts  ❤' + s.lives, W - 10, 14);

    rafRef.current = requestAnimationFrame(render);
  }, [update]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const onKey = (e: KeyboardEvent) => {
      const K = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a') K.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') K.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp') { K.jump = true; K[' '] = true; }
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const K = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a') K.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') K.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp') { K.jump = false; K[' '] = false; }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [render]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🤖</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>PLATFORMER</div>
            <div className="text-[11px] text-muted-foreground">← → bouger • ESPACE sauter</div>
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
        <div className="flex gap-3">
          <button className="w-[70px] h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => { stateRef.current.keys.left = true; }} onPointerUp={() => { stateRef.current.keys.left = false; }} onPointerLeave={() => { stateRef.current.keys.left = false; }}>◀</button>
          <button className="w-[70px] h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => { stateRef.current.keys.jump = true; stateRef.current.keys[' '] = true; }} onPointerUp={() => { stateRef.current.keys.jump = false; stateRef.current.keys[' '] = false; }} onPointerLeave={() => { stateRef.current.keys.jump = false; stateRef.current.keys[' '] = false; }}>▲</button>
          <button className="w-[70px] h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => { stateRef.current.keys.right = true; }} onPointerUp={() => { stateRef.current.keys.right = false; }} onPointerLeave={() => { stateRef.current.keys.right = false; }}>▶</button>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
