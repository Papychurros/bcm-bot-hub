import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const W = 480, H = 320;
const PAD_H = 64, PAD_W = 10, BALL_R = 7, WIN_SCORE = 7;
const PLAYER_SPEED = 5, BOT_SPEED = 1.8, BALL_INIT = 2.8, BALL_MAX = 8;
const COLOR = '#00e5ff';

type GameState = 'idle' | 'playing' | 'gameover';

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const stateRef = useRef({
    playerY: H / 2 - PAD_H / 2, botY: H / 2 - PAD_H / 2,
    ball: { x: W / 2, y: H / 2, vx: BALL_INIT, vy: 0 },
    playerScore: 0, botScore: 0, state: 'idle' as GameState,
    keys: {} as Record<string, boolean>,
    dirKeys: { up: false, down: false },
  });

  const resetBall = useCallback((dir: number) => {
    const angle = Math.random() * 0.5 - 0.25;
    stateRef.current.ball = { x: W / 2, y: H / 2, vx: dir * BALL_INIT, vy: Math.sin(angle) * 2 };
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.playerY = H / 2 - PAD_H / 2; s.botY = H / 2 - PAD_H / 2;
    s.playerScore = 0; s.botScore = 0; s.state = 'idle';
    resetBall(1);
    setGameState('idle');
  }, [resetBall]);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.playerY = H / 2 - PAD_H / 2; s.botY = H / 2 - PAD_H / 2;
    s.playerScore = 0; s.botScore = 0;
    resetBall(1);
    s.state = 'playing';
    setGameState('playing');
  }, [resetBall]);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;

    if (s.keys['ArrowUp'] || s.keys['KeyW'] || s.dirKeys.up) s.playerY -= PLAYER_SPEED;
    if (s.keys['ArrowDown'] || s.keys['KeyS'] || s.dirKeys.down) s.playerY += PLAYER_SPEED;
    s.playerY = clamp(s.playerY, 0, H - PAD_H);

    const botCenter = s.botY + PAD_H / 2;
    const diff = s.ball.y - botCenter;
    s.botY += clamp(diff * 0.06, -BOT_SPEED, BOT_SPEED);
    s.botY = clamp(s.botY, 0, H - PAD_H);

    s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;
    if (s.ball.y - BALL_R < 0) { s.ball.y = BALL_R; s.ball.vy *= -1; }
    if (s.ball.y + BALL_R > H) { s.ball.y = H - BALL_R; s.ball.vy *= -1; }

    // Player paddle
    if (s.ball.x - BALL_R < 28 + PAD_W && s.ball.x > 20 && s.ball.y > s.playerY && s.ball.y < s.playerY + PAD_H) {
      s.ball.vx = Math.abs(s.ball.vx) * 1.04;
      s.ball.vy = ((s.ball.y - (s.playerY + PAD_H / 2)) / (PAD_H / 2)) * 4.5;
      s.ball.vx = clamp(s.ball.vx, -BALL_MAX, BALL_MAX);
    }
    // Bot paddle
    if (s.ball.x + BALL_R > W - 28 - PAD_W && s.ball.x < W - 20 && s.ball.y > s.botY && s.ball.y < s.botY + PAD_H) {
      s.ball.vx = -Math.abs(s.ball.vx) * 1.03;
      s.ball.vy = ((s.ball.y - (s.botY + PAD_H / 2)) / (PAD_H / 2)) * 4.5;
      s.ball.vx = clamp(s.ball.vx, -BALL_MAX, BALL_MAX);
    }

    if (s.ball.x < 0) { s.botScore++; if (s.botScore >= WIN_SCORE) { s.state = 'gameover'; setGameState('gameover'); } else resetBall(1); }
    if (s.ball.x > W) { s.playerScore++; if (s.playerScore >= WIN_SCORE) { s.state = 'gameover'; setGameState('gameover'); } else resetBall(-1); }
  }, [resetBall]);

  const drawPad = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.shadowBlur = 16; ctx.shadowColor = color;
    const g = ctx.createLinearGradient(x, y, x + PAD_W, y + PAD_H);
    g.addColorStop(0, color); g.addColorStop(1, color + '88');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, y, PAD_W, PAD_H, 5); ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;

    update();
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#000820'); bg.addColorStop(1, '#001020');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(0,229,255,.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    drawPad(ctx, 20, s.playerY, '#00e5ff');
    drawPad(ctx, W - 20 - PAD_W, s.botY, '#ff4af8');

    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,229,255,.35)'; ctx.fillText('JOUEUR', 60, H - 8);
    ctx.fillStyle = 'rgba(255,74,248,.35)'; ctx.fillText('BOT', W - 60, H - 8);

    if (s.state === 'playing') {
      ctx.shadowBlur = 20; ctx.shadowColor = '#fff';
      const bg2 = ctx.createRadialGradient(s.ball.x, s.ball.y, 0, s.ball.x, s.ball.y, BALL_R);
      bg2.addColorStop(0, '#fff'); bg2.addColorStop(1, '#00e5ff');
      ctx.fillStyle = bg2;
      ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,229,255,.12)';
      ctx.beginPath(); ctx.arc(s.ball.x - s.ball.vx * 2, s.ball.y - s.ball.vy * 2, BALL_R * .7, 0, Math.PI * 2); ctx.fill();
    }

    ctx.shadowBlur = 15; ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 34px monospace'; ctx.textAlign = 'center';
    ctx.fillText(String(s.playerScore), W / 2 - 55, 42);
    ctx.shadowColor = '#ff4af8'; ctx.fillStyle = '#ff4af8';
    ctx.fillText(String(s.botScore), W / 2 + 55, 42); ctx.shadowBlur = 0;

    if (s.state === 'idle') {
      ctx.fillStyle = 'rgba(0,8,32,.78)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00e5ff'; ctx.shadowBlur = 20; ctx.shadowColor = '#00e5ff';
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText('TENNIS DE BOT', W / 2, H / 2 - 18); ctx.shadowBlur = 0;
      ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(0,229,255,.6)';
      ctx.fillText('▶ Jouer ou ESPACE pour démarrer', W / 2, H / 2 + 12);
    }
    if (s.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,8,32,.85)'; ctx.fillRect(0, 0, W, H);
      const won = s.playerScore >= WIN_SCORE;
      const wc = won ? '#ffd700' : '#ff4af8';
      ctx.fillStyle = wc; ctx.shadowBlur = 25; ctx.shadowColor = wc;
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText(won ? '🏆 VICTOIRE !' : 'LE BOT GAGNE', W / 2, H / 2 - 24); ctx.shadowBlur = 0;
      ctx.font = 'bold 13px monospace'; ctx.fillStyle = 'rgba(0,229,255,.7)';
      ctx.fillText(s.playerScore + ' — ' + s.botScore, W / 2, H / 2 + 10);
      ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(0,229,255,.4)';
      ctx.fillText('TAP ▶ Jouer pour rejouer', W / 2, H / 2 + 34);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [update, drawPad]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const s = stateRef.current;

    const onKey = (e: KeyboardEvent) => {
      s.keys[e.code] = true;
      if (e.code === 'Space' && s.state !== 'playing') start();
    };
    const onKeyUp = (e: KeyboardEvent) => { s.keys[e.code] = false; };

    // Touch drag on canvas
    const canvas = canvasRef.current;
    const onTouchMove = (e: TouchEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const y = (e.touches[0].clientY - rect.top) * (H / rect.height);
      s.playerY = clamp(y - PAD_H / 2, 0, H - PAD_H);
      e.preventDefault();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    canvas?.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      canvas?.removeEventListener('touchmove', onTouchMove);
    };
  }, [render, start]);

  const handleDir = useCallback((dir: string, active: boolean) => {
    const s = stateRef.current;
    if (dir === 'up') s.dirKeys.up = active;
    if (dir === 'down') s.dirKeys.down = active;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[480px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        {/* Vertical pad: up/down only */}
        <div className="flex gap-3">
          <button
            className="w-14 h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => handleDir('up', true)}
            onPointerUp={() => handleDir('up', false)}
            onPointerLeave={() => handleDir('up', false)}
          >▲</button>
          <button
            className="w-14 h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => handleDir('down', true)}
            onPointerUp={() => handleDir('down', false)}
            onPointerLeave={() => handleDir('down', false)}
          >▼</button>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
        </div>
      </div>
    </div>
  );
}
