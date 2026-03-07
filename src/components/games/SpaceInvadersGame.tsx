import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Hpad, ActionButton } from './TouchControls';

const W = 360, H = 560;
const COLOR = '#ef4444';

type GameState = 'idle' | 'playing' | 'dead';

export default function SpaceInvadersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');

  const stateRef = useRef({
    player: { x: W / 2, y: H - 50, w: 36, h: 20, cooldown: 0 },
    bullets: [] as any[], eBullets: [] as any[],
    enemies: [] as any[], shields: [] as any[],
    score: 0, best: 0, lives: 3, level: 1,
    eDir: 1, eSpeed: 0.5, eShootTimer: 90, eDescend: 0,
    keys: {} as Record<string, boolean>,
    state: 'idle' as GameState,
  });

  const makeEnemies = (lvl: number) => {
    const rows = 3 + Math.min(lvl - 1, 2), cols = 9;
    const arr: any[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        arr.push({ x: 40 + c * 30, y: 60 + r * 36, w: 22, h: 16, type: r === 0 ? 2 : r <= 1 ? 1 : 0, alive: true, f: 0 });
    return arr;
  };

  const makeShields = () => {
    const sh: any[] = [];
    for (const px of [60, 140, 220, 300]) {
      const blocks: any[] = [];
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 5; col++)
          blocks.push({ x: px + col * 8, y: H - 120 + row * 8, w: 8, h: 8, hp: 3 });
      sh.push(blocks);
    }
    return sh;
  };

  const start = useCallback(() => {
    const s = stateRef.current;
    s.score = 0; s.lives = 3; s.level = 1;
    s.player = { x: W / 2, y: H - 50, w: 36, h: 20, cooldown: 0 };
    s.bullets = []; s.eBullets = [];
    s.enemies = makeEnemies(1); s.shields = makeShields();
    s.eDir = 1; s.eSpeed = 0.5; s.eShootTimer = 90; s.eDescend = 0;
    s.state = 'playing'; setGameState('playing');
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    const K = s.keys;
    const spd = 3.5;
    if (K.left) s.player.x = Math.max(20, s.player.x - spd);
    if (K.right) s.player.x = Math.min(W - 20, s.player.x + spd);

    if (s.player.cooldown > 0) s.player.cooldown--;
    if (K.shoot && s.player.cooldown === 0) {
      s.bullets.push({ x: s.player.x, y: s.player.y - 10, w: 3, h: 12, vy: -9 });
      s.player.cooldown = 18;
    }

    // Player bullets
    s.bullets = s.bullets.filter((b: any) => {
      b.y += b.vy;
      if (b.y < 0) return false;
      for (const e of s.enemies) {
        if (!e.alive) continue;
        if (b.x > e.x - e.w / 2 && b.x < e.x + e.w / 2 && b.y > e.y - e.h / 2 && b.y < e.y + e.h / 2) {
          e.alive = false; e.f = 8;
          s.score += (e.type === 2 ? 30 : e.type === 1 ? 20 : 10) * s.level;
          return false;
        }
      }
      for (const sh of s.shields)
        for (const bl of sh)
          if (bl.hp > 0 && b.x > bl.x && b.x < bl.x + bl.w && b.y > bl.y && b.y < bl.y + bl.h) { bl.hp--; return false; }
      return true;
    });

    const alive = s.enemies.filter((e: any) => e.alive);
    if (alive.length === 0) {
      s.level++; s.bullets = []; s.eBullets = [];
      s.enemies = makeEnemies(s.level);
      s.eDir = 1; s.eSpeed = 0.5 + s.level * 0.15; s.eShootTimer = Math.max(40, 90 - s.level * 8);
      s.eDescend = 0; s.player = { x: W / 2, y: H - 50, w: 36, h: 20, cooldown: 0 };
      return;
    }

    if (s.eDescend > 0) {
      s.enemies.forEach((e: any) => e.alive && (e.y += 1.5));
      s.eDescend--;
      if (s.eDescend === 0) { s.eDir *= -1; s.eSpeed = Math.min(s.eSpeed + 0.08, 4); }
    } else {
      s.enemies.forEach((e: any) => e.alive && (e.x += s.eDir * s.eSpeed));
      const newMinX = Math.min(...alive.map((e: any) => e.x - e.w / 2));
      const newMaxX = Math.max(...alive.map((e: any) => e.x + e.w / 2));
      if (newMaxX > W - 20 || newMinX < 20) s.eDescend = 8;
    }

    const maxY = Math.max(...alive.map((e: any) => e.y + e.h / 2));
    if (maxY > H - 60) { s.lives = 0; s.state = 'dead'; setGameState('dead'); if (s.score > s.best) s.best = s.score; return; }

    s.eShootTimer--;
    if (s.eShootTimer <= 0) {
      s.eShootTimer = Math.max(25, 60 - s.level * 5);
      const shooters = alive.filter((e: any) => {
        const col = alive.filter((a: any) => Math.abs(a.x - e.x) < 5);
        return e === col.sort((a: any, b: any) => b.y - a.y)[0];
      });
      if (shooters.length > 0) {
        const sh = shooters[Math.floor(Math.random() * shooters.length)];
        s.eBullets.push({ x: sh.x, y: sh.y + sh.h / 2, w: 3, h: 10, vy: 4 + s.level * 0.3 });
      }
    }

    s.eBullets = s.eBullets.filter((b: any) => {
      b.y += b.vy;
      if (b.y > H) return false;
      if (b.x > s.player.x - 18 && b.x < s.player.x + 18 && b.y > s.player.y - 10 && b.y < s.player.y + 10) {
        s.lives--;
        if (s.lives <= 0) { s.state = 'dead'; setGameState('dead'); if (s.score > s.best) s.best = s.score; return false; }
        s.player = { x: W / 2, y: H - 50, w: 36, h: 20, cooldown: 0 };
        return false;
      }
      for (const sh of s.shields)
        for (const bl of sh)
          if (bl.hp > 0 && b.x > bl.x && b.x < bl.x + bl.w && b.y > bl.y && b.y < bl.y + bl.h) { bl.hp--; return false; }
      return true;
    });

    s.enemies.forEach((e: any) => { if (e.f > 0) e.f--; });
    if (s.score > s.best) s.best = s.score;
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    update();

    ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(239,68,68,0.2)';
    for (let i = 0; i < 50; i++) {
      const sx = ((i * 137 + performance.now() * 0.005) % W + W) % W;
      const sy = ((i * 97) % H + H) % H;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Ground
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 38); ctx.lineTo(W, H - 38); ctx.stroke();

    // Shields
    for (const sh of s.shields)
      for (const bl of sh) {
        if (bl.hp <= 0) continue;
        const alpha = [0, 0.35, 0.7, 1][bl.hp] || 1;
        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        ctx.fillRect(bl.x, bl.y, bl.w - 1, bl.h - 1);
      }

    // Enemies
    for (const e of s.enemies) {
      if (!e.alive && e.f === 0) continue;
      ctx.save(); ctx.translate(e.x, e.y);
      const col = e.f > 0 ? '#fff' : COLOR;
      ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = e.f > 0 ? 20 : 6;
      if (e.type === 0) {
        ctx.fillRect(-10, -7, 20, 10);
        ctx.fillStyle = '#0f0f1a'; ctx.fillRect(-7, -5, 4, 4); ctx.fillRect(3, -5, 4, 4);
        ctx.fillStyle = col;
        ctx.fillRect(-12, 2, 4, 5); ctx.fillRect(-5, 2, 4, 5); ctx.fillRect(1, 2, 4, 5); ctx.fillRect(8, 2, 4, 5);
        ctx.fillRect(-8, -11, 3, 5); ctx.fillRect(5, -11, 3, 5);
      } else if (e.type === 1) {
        ctx.fillRect(-11, -5, 22, 8);
        ctx.fillStyle = '#0f0f1a'; ctx.fillRect(-8, -3, 4, 3); ctx.fillRect(4, -3, 4, 3);
        ctx.fillStyle = col;
        ctx.fillRect(-13, 2, 5, 4); ctx.fillRect(8, 2, 5, 4);
        ctx.fillRect(-5, 3, 10, 4);
      } else {
        ctx.beginPath(); ctx.ellipse(0, -3, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f0f1a'; ctx.fillRect(-6, -5, 4, 4); ctx.fillRect(2, -5, 4, 4);
        ctx.fillStyle = col;
        ctx.fillRect(-13, 3, 5, 5); ctx.fillRect(8, 3, 5, 5); ctx.fillRect(-4, 4, 8, 4);
      }
      ctx.restore(); ctx.shadowBlur = 0;
    }

    // Player bullets
    ctx.fillStyle = '#f87171'; ctx.shadowColor = '#f87171'; ctx.shadowBlur = 8;
    for (const b of s.bullets) ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h);
    ctx.shadowBlur = 0;

    // Enemy bullets
    ctx.fillStyle = '#fde68a'; ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 6;
    for (const b of s.eBullets) ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h);
    ctx.shadowBlur = 0;

    // Player ship
    ctx.fillStyle = COLOR; ctx.shadowColor = COLOR; ctx.shadowBlur = 10;
    ctx.fillRect(s.player.x - 3, s.player.y - 18, 6, 10);
    ctx.fillRect(s.player.x - 18, s.player.y - 8, 36, 14);
    ctx.fillRect(s.player.x - 14, s.player.y + 4, 28, 6);
    ctx.shadowBlur = 0;

    // HUD
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${String(s.score).padStart(5, '0')}`, 10, 18);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'center';
    ctx.fillText(`NV ${s.level}`, W / 2, 18);
    ctx.fillStyle = '#fde68a'; ctx.textAlign = 'right';
    ctx.fillText(`VIES ${s.lives}`, W - 10, 18);

    rafRef.current = requestAnimationFrame(render);
  }, [update]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const onKey = (e: KeyboardEvent) => {
      const K = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a') K.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') K.right = true;
      if (e.key === ' ') K.shoot = true;
      if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const K = stateRef.current.keys;
      if (e.key === 'ArrowLeft' || e.key === 'a') K.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') K.right = false;
      if (e.key === ' ') K.shoot = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [render]);

  const handleDirection = useCallback((dir: string, active: boolean) => {
    stateRef.current.keys[dir] = active;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">👾</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>SPACE INVADERS</div>
            <div className="text-[11px] text-muted-foreground">← → bouger • ESPACE tirer</div>
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
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <Hpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="🔥 Tirer" primary color={COLOR} onClick={() => { stateRef.current.keys.shoot = true; setTimeout(() => { stateRef.current.keys.shoot = false; }, 80); }} />
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
