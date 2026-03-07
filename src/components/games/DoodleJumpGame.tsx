import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Hpad, ActionButton } from './TouchControls';

const W = 360, H = 560;
const PLAT_W = 70, PLAT_H = 14;
const GRAVITY = 0.18, JUMP = -8;
const COLOR = '#a855f7';

type GameState = 'idle' | 'playing' | 'dead';

interface Platform {
  x: number; y: number; w: number; h: number;
  type: 'normal' | 'moving'; dir: number; speed: number;
}

export default function DoodleJumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const stateRef = useRef({
    player: { x: W / 2 - 18, y: H - 120, w: 36, h: 36, vy: JUMP, vx: 0 },
    platforms: [] as Platform[],
    score: 0, best: 0, cameraY: 0,
    state: 'idle' as GameState,
    keys: {} as Record<string, boolean>,
  });

  const genPlatform = useCallback((y: number): Platform => ({
    x: Math.random() * (W - PLAT_W - 20) + 10, y, w: PLAT_W, h: PLAT_H,
    type: Math.random() < 0.15 ? 'moving' : 'normal',
    dir: Math.random() < 0.5 ? 1 : -1, speed: 0.7,
  }), []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.score = 0; s.cameraY = 0;
    s.player = { x: W / 2 - 18, y: H - 120, w: 36, h: 36, vy: JUMP, vx: 0 };
    s.platforms = [{ x: W / 2 - 40, y: H - 60, w: 80, h: PLAT_H, type: 'normal', dir: 1, speed: 0 }];
    for (let i = 0; i < 12; i++) s.platforms.push(genPlatform(H - 80 - i * 60));
    s.state = 'playing'; setGameState('playing');
  }, [genPlatform]);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;

    if (s.keys['ArrowLeft'] || s.keys['a'] || s.keys['left']) s.player.vx = -3;
    else if (s.keys['ArrowRight'] || s.keys['d'] || s.keys['right']) s.player.vx = 3;
    else s.player.vx *= 0.85;

    s.player.vy += GRAVITY;
    s.player.x += s.player.vx;
    s.player.y += s.player.vy;

    if (s.player.x + s.player.w < 0) s.player.x = W;
    if (s.player.x > W) s.player.x = -s.player.w;

    const threshold = H * 0.4;
    if (s.player.y - s.cameraY < threshold) {
      const diff = threshold - (s.player.y - s.cameraY);
      s.cameraY -= diff;
      s.score += Math.floor(diff * 0.1);
    }

    if (s.player.vy > 0) {
      for (const p of s.platforms) {
        const py = s.player.y - s.cameraY;
        const ppy = p.y - s.cameraY;
        if (s.player.x + s.player.w > p.x && s.player.x < p.x + p.w &&
            py + s.player.h > ppy && py + s.player.h < ppy + PLAT_H + 12) {
          s.player.vy = JUMP;
        }
      }
    }

    for (const p of s.platforms) {
      if (p.type === 'moving') {
        p.x += p.dir * p.speed;
        if (p.x <= 0 || p.x + p.w >= W) p.dir *= -1;
      }
    }

    const topY = s.cameraY;
    while (s.platforms[s.platforms.length - 1].y > topY + 60) {
      s.platforms.push(genPlatform(s.platforms[s.platforms.length - 1].y - 55 - Math.random() * 30));
    }
    s.platforms = s.platforms.filter(p => p.y - s.cameraY < H + 100);

    if (s.player.y - s.cameraY > H + 50) {
      if (s.score > s.best) s.best = s.score;
      s.state = 'dead'; setGameState('dead');
    }
  }, [genPlatform]);

  const drawRobot = useCallback((ctx: CanvasRenderingContext2D, px: number, py: number) => {
    ctx.save();
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 14;

    // Legs
    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(px + 8, py + 32, 7, 9);
    ctx.fillRect(px + 21, py + 32, 7, 9);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(px + 6, py + 39, 10, 4);
    ctx.fillRect(px + 20, py + 39, 10, 4);

    // Body
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath(); ctx.roundRect(px + 5, py + 18, 26, 16, 4); ctx.fill();
    ctx.fillStyle = '#a855f7';
    ctx.beginPath(); ctx.roundRect(px + 11, py + 21, 14, 8, 2); ctx.fill();
    ctx.fillStyle = '#e879f9'; ctx.shadowColor = '#e879f9'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(px + 18, py + 25, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 14; ctx.shadowColor = '#a855f7';

    // Arms
    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(px - 2, py + 20, 7, 5);
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(px - 4, py + 20, 4, 4);
    ctx.fillStyle = '#6d28d9'; ctx.fillRect(px + 31, py + 20, 7, 5);
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(px + 36, py + 20, 4, 4);

    // Neck
    ctx.fillStyle = '#6d28d9'; ctx.fillRect(px + 14, py + 14, 8, 6);

    // Head bulb
    ctx.fillStyle = '#5b21b6';
    ctx.beginPath(); ctx.roundRect(px + 11, py + 10, 14, 6, 2); ctx.fill();
    const bcx = px + 18, bcy = py + 4;
    ctx.fillStyle = 'rgba(196,132,252,0.25)';
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.ellipse(bcx, bcy, 11, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 14; ctx.shadowColor = '#a855f7';

    // Filament
    ctx.strokeStyle = '#fde68a'; ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 8; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bcx - 3, bcy + 5); ctx.lineTo(bcx - 1, bcy + 2); ctx.lineTo(bcx - 3, bcy - 1);
    ctx.lineTo(bcx - 1, bcy - 4); ctx.lineTo(bcx + 1, bcy - 4); ctx.lineTo(bcx + 3, bcy - 1);
    ctx.lineTo(bcx + 1, bcy + 2); ctx.lineTo(bcx + 3, bcy + 5);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = '#0f0f1a';
    ctx.beginPath(); ctx.arc(bcx - 4, bcy + 3, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bcx + 4, bcy + 3, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e879f9';
    ctx.beginPath(); ctx.arc(bcx - 3.2, bcy + 2.2, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bcx + 4.8, bcy + 2.2, 0.9, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(bcx - 4, bcy - 5, 3.5, 5, -0.4, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    update();

    ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(168,85,247,0.3)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + s.cameraY * 0.1) % W + W) % W;
      const sy = ((i * 97 + s.cameraY * 0.05) % H + H) % H;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Platforms
    for (const p of s.platforms) {
      const py = p.y - s.cameraY;
      if (py > H + 20 || py < -20) continue;
      ctx.fillStyle = p.type === 'moving' ? '#f59e0b' : '#a855f7';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(p.x, py, p.w, p.h, 4); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Player
    drawRobot(ctx, s.player.x, s.player.y - s.cameraY);

    // HUD
    ctx.font = "bold 13px monospace"; ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${String(s.score).padStart(4, '0')}`, 10, 18);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'right';
    ctx.fillText(`BEST  ${String(s.best).padStart(4, '0')}`, W - 10, 18);

    rafRef.current = requestAnimationFrame(render);
  }, [update, drawRobot]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H); }
    rafRef.current = requestAnimationFrame(render);

    const onKey = (e: KeyboardEvent) => { stateRef.current.keys[e.key] = true; e.preventDefault(); };
    const onKeyUp = (e: KeyboardEvent) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
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
            <div className="text-[34px]">🚀</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>DOODLE JUMP</div>
            <div className="text-[11px] text-muted-foreground">← → pour bouger</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
            <div className="text-[11px] text-muted-foreground">MEILLEUR : {stateRef.current.best}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <Hpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
