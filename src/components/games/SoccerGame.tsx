import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Dpad, ActionButton } from './TouchControls';

const W = 360, H = 260;
const COLOR = '#ef4444';
const FIELD = { x: 10, y: 20, w: 340, h: 220 };
const GOAL_W = 14, GOAL_H = 70;
const GOAL_L = { x: FIELD.x - GOAL_W, y: FIELD.y + FIELD.h / 2 - GOAL_H / 2, w: GOAL_W, h: GOAL_H };
const GOAL_R = { x: FIELD.x + FIELD.w, y: FIELD.y + FIELD.h / 2 - GOAL_H / 2, w: GOAL_W, h: GOAL_H };

type GameState = 'idle' | 'playing' | 'ended';

export default function SoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [gameState, setGameState] = useState<GameState>('idle');

  const stateRef = useRef({
    ball: { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 10 },
    player: { x: 100, y: H / 2, vx: 0, vy: 0, w: 18, h: 18, spd: 3 },
    ai: { x: 260, y: H / 2, vx: 0, vy: 0, w: 18, h: 18, spd: 2.2 },
    pScore: 0, aScore: 0, timeLeft: 60, frame: 0,
    goalAnim: 0, goalMsg: '',
    keys: {} as Record<string, boolean>,
    state: 'idle' as GameState,
  });

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  const resetPositions = () => {
    const s = stateRef.current;
    s.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 10 };
    s.player = { x: 100, y: H / 2, vx: 0, vy: 0, w: 18, h: 18, spd: 3 };
    s.ai = { x: 260, y: H / 2, vx: 0, vy: 0, w: 18, h: 18, spd: 2.2 };
  };

  const start = useCallback(() => {
    const s = stateRef.current;
    s.pScore = 0; s.aScore = 0; s.timeLeft = 60; s.frame = 0; s.goalAnim = 0;
    resetPositions();
    s.state = 'playing'; setGameState('playing');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      s.timeLeft--;
      if (s.timeLeft <= 0) {
        clearInterval(timerRef.current);
        s.state = 'ended'; setGameState('ended');
      }
    }, 1000);
  }, []);

  const goal = useCallback((scorer: string) => {
    const s = stateRef.current;
    if (s.goalAnim > 0) return;
    if (scorer === 'player') { s.pScore++; s.goalMsg = '⚽ BUT !'; }
    else { s.aScore++; s.goalMsg = '💀 RATÉ !'; }
    s.goalAnim = 90;
    setTimeout(resetPositions, 1200);
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing' || s.goalAnim > 60) return;
    if (s.goalAnim > 0) { s.goalAnim--; return; }
    s.frame++;

    const K = s.keys;
    if (K.up) s.player.vy -= s.player.spd * 0.4;
    if (K.down) s.player.vy += s.player.spd * 0.4;
    if (K.left) s.player.vx -= s.player.spd * 0.4;
    if (K.right) s.player.vx += s.player.spd * 0.4;

    // Move player
    s.player.x += s.player.vx; s.player.y += s.player.vy;
    s.player.vx *= 0.8; s.player.vy *= 0.8;
    s.player.x = clamp(s.player.x, FIELD.x + s.player.w / 2, FIELD.x + FIELD.w - s.player.w / 2);
    s.player.y = clamp(s.player.y, FIELD.y + s.player.h / 2, FIELD.y + FIELD.h - s.player.h / 2);

    // AI
    const bx = s.ball.x;
    let gx: number, gy: number;
    if (bx > s.ai.x) { gx = bx + 30; gy = s.ball.y; }
    else {
      const dx = bx - (GOAL_L.x + GOAL_L.w + 10), dy = s.ball.y - (GOAL_L.y + GOAL_L.h / 2);
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      gx = bx + (dx / d) * 30; gy = s.ball.y + (dy / d) * 30;
    }
    gx += Math.sin(s.frame * 0.04) * 20;
    gy += Math.cos(s.frame * 0.03) * 15;
    const adx = gx - s.ai.x, ady = gy - s.ai.y;
    const ad = Math.sqrt(adx * adx + ady * ady) || 1;
    s.ai.vx += (adx / ad) * s.ai.spd * 0.4;
    s.ai.vy += (ady / ad) * s.ai.spd * 0.4;
    s.ai.x += s.ai.vx; s.ai.y += s.ai.vy;
    s.ai.vx *= 0.8; s.ai.vy *= 0.8;
    s.ai.x = clamp(s.ai.x, FIELD.x + s.ai.w / 2, FIELD.x + FIELD.w - s.ai.w / 2);
    s.ai.y = clamp(s.ai.y, FIELD.y + s.ai.h / 2, FIELD.y + FIELD.h - s.ai.h / 2);

    // Ball push
    const pushBall = (e: any, strength: number) => {
      const dx = s.ball.x - e.x, dy = s.ball.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = s.ball.r + e.w / 2;
      if (dist < minDist && dist > 0.1) {
        const nx = dx / dist, ny = dy / dist;
        s.ball.x = e.x + nx * minDist; s.ball.y = e.y + ny * minDist;
        s.ball.vx += nx * strength + e.vx * 0.5;
        s.ball.vy += ny * strength + e.vy * 0.5;
      }
    };
    pushBall(s.player, 3.5);
    pushBall(s.ai, 2.8);

    // Ball physics
    s.ball.vx *= 0.98; s.ball.vy *= 0.98;
    s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;

    if (s.ball.x - s.ball.r < FIELD.x) {
      if (s.ball.y > GOAL_L.y && s.ball.y < GOAL_L.y + GOAL_L.h) {
        if (s.ball.x - s.ball.r < GOAL_L.x) { goal('ai'); return; }
      } else { s.ball.x = FIELD.x + s.ball.r; s.ball.vx *= -0.6; }
    }
    if (s.ball.x + s.ball.r > FIELD.x + FIELD.w) {
      if (s.ball.y > GOAL_R.y && s.ball.y < GOAL_R.y + GOAL_R.h) {
        if (s.ball.x + s.ball.r > GOAL_R.x + GOAL_R.w) { goal('player'); return; }
      } else { s.ball.x = FIELD.x + FIELD.w - s.ball.r; s.ball.vx *= -0.6; }
    }
    if (s.ball.y - s.ball.r < FIELD.y) { s.ball.y = FIELD.y + s.ball.r; s.ball.vy *= -0.6; }
    if (s.ball.y + s.ball.r > FIELD.y + FIELD.h) { s.ball.y = FIELD.y + FIELD.h - s.ball.r; s.ball.vy *= -0.6; }
  }, [goal]);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    update();

    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0d2e0d'; ctx.fillRect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.beginPath(); ctx.moveTo(W / 2, FIELD.y); ctx.lineTo(W / 2, FIELD.y + FIELD.h); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 36, 0, Math.PI * 2); ctx.stroke();

    // Goals
    ctx.fillStyle = 'rgba(239,68,68,0.15)'; ctx.fillRect(GOAL_L.x, GOAL_L.y, GOAL_L.w, GOAL_L.h);
    ctx.fillStyle = 'rgba(150,150,150,0.15)'; ctx.fillRect(GOAL_R.x, GOAL_R.y, GOAL_R.w, GOAL_R.h);
    ctx.strokeStyle = 'rgba(239,68,68,0.8)'; ctx.lineWidth = 2; ctx.strokeRect(GOAL_L.x, GOAL_L.y, GOAL_L.w, GOAL_L.h);
    ctx.strokeStyle = 'rgba(200,200,200,0.6)'; ctx.strokeRect(GOAL_R.x, GOAL_R.y, GOAL_R.w, GOAL_R.h);

    // Player
    ctx.fillStyle = COLOR; ctx.fillRect(s.player.x - s.player.w / 2, s.player.y - s.player.h / 2, s.player.w, s.player.h);
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.strokeRect(s.player.x - s.player.w / 2, s.player.y - s.player.h / 2, s.player.w, s.player.h);

    // AI
    ctx.fillStyle = '#555'; ctx.fillRect(s.ai.x - s.ai.w / 2, s.ai.y - s.ai.h / 2, s.ai.w, s.ai.h);
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.strokeRect(s.ai.x - s.ai.w / 2, s.ai.y - s.ai.h / 2, s.ai.w, s.ai.h);

    // Ball
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, s.ball.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, s.ball.r * 0.4, 0, Math.PI * 2); ctx.fill();

    // Goal anim
    if (s.goalAnim > 0) {
      const alpha = Math.min(s.goalAnim / 30, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.goalMsg.includes('BUT') ? COLOR : '#888';
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.goalMsg, W / 2, H / 2);
      ctx.globalAlpha = 1;
    }

    // HUD
    ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = COLOR; ctx.fillText(String(s.pScore), W / 2 - 30, 2);
    ctx.fillStyle = '#555'; ctx.fillText('—', W / 2, 2);
    ctx.fillStyle = '#888'; ctx.fillText(String(s.aScore), W / 2 + 30, 2);
    ctx.fillStyle = s.timeLeft <= 10 ? '#ef4444' : '#fde68a'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'right';
    ctx.fillText(s.timeLeft + 's', W - 10, 6);

    rafRef.current = requestAnimationFrame(render);
  }, [update]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const onKey = (e: KeyboardEvent) => {
      const K = stateRef.current.keys;
      if (e.key === 'ArrowUp') { K.up = true; e.preventDefault(); }
      if (e.key === 'ArrowDown') { K.down = true; e.preventDefault(); }
      if (e.key === 'ArrowLeft') { K.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { K.right = true; e.preventDefault(); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const K = stateRef.current.keys;
      if (e.key === 'ArrowUp') K.up = false;
      if (e.key === 'ArrowDown') K.down = false;
      if (e.key === 'ArrowLeft') K.left = false;
      if (e.key === 'ArrowRight') K.right = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [render]);

  const handleDirection = useCallback((dir: string, type: 'down' | 'up') => {
    stateRef.current.keys[dir] = type === 'down';
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">⚽</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>SOCCER</div>
            <div className="text-[11px] text-muted-foreground">↑↓←→ pour bouger</div>
          </div>
        )}
        {gameState === 'ended' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold" style={{ color: COLOR }}>
              {stateRef.current.pScore > stateRef.current.aScore ? '🏆 VICTOIRE !' : stateRef.current.pScore === stateRef.current.aScore ? '🤝 MATCH NUL' : '💀 DÉFAITE !'}
            </div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.pScore} — {stateRef.current.aScore}</div>
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
