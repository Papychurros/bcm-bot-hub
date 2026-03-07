import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const COLOR = '#00e5ff';
const BOT_COLOR = '#ff4af8';
const WIN_SCORE = 7;
const BALL_R = 7;
const PAD_W = 10;
const BALL_BOUNCE_ACCEL = 1.04;

interface Difficulty {
  label: string;
  emoji: string;
  botSpeed: number;
  botPadH: number;
  ballInit: number;
  ballMax: number;
}

const DIFFICULTIES: Difficulty[] = [
  { label: 'Facile', emoji: '😊', botSpeed: 1.2, botPadH: 60, ballInit: 2.5, ballMax: 6 },
  { label: 'Moyen', emoji: '😐', botSpeed: 1.8, botPadH: 100, ballInit: 2.8, ballMax: 8 },
  { label: 'Difficile', emoji: '😤', botSpeed: 3.2, botPadH: 140, ballInit: 3.2, ballMax: 9 },
  { label: 'MDR', emoji: '💀', botSpeed: 999, botPadH: -1, ballInit: 3.5, ballMax: 10 },
];

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

type GameState = 'idle' | 'playing' | 'gameover';

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [diffIdx, setDiffIdx] = useState(1); // default Moyen
  const [dims, setDims] = useState({ w: 320, h: 480 });

  const stateRef = useRef({
    playerY: 0, botY: 0,
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    playerScore: 0, botScore: 0,
    state: 'idle' as GameState,
    diffIdx: 1,
    dragging: false,
    W: 320, H: 480,
    playerPadH: 80,
  });

  const getDiff = useCallback(() => DIFFICULTIES[stateRef.current.diffIdx], []);

  const resetBall = useCallback((dir: number) => {
    const s = stateRef.current;
    const diff = getDiff();
    const angle = Math.random() * 0.5 - 0.25;
    s.ball = {
      x: s.W / 2, y: s.H / 2,
      vx: Math.sin(angle) * 2,
      vy: dir * diff.ballInit,
    };
  }, [getDiff]);

  const resetPositions = useCallback(() => {
    const s = stateRef.current;
    const diff = getDiff();
    const padH = diff.botPadH === -1 ? s.H : diff.botPadH;
    s.playerY = s.H / 2 - s.playerPadH / 2;
    s.botY = s.H / 2 - padH / 2;
  }, [getDiff]);

  const start = useCallback(() => {
    const s = stateRef.current;
    resetPositions();
    s.playerScore = 0; s.botScore = 0;
    resetBall(1);
    s.state = 'playing';
    setGameState('playing');
  }, [resetBall, resetPositions]);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    const { W, H } = s;
    const diff = getDiff();
    const botPadH = diff.botPadH === -1 ? Math.min(W * 0.9, W - 20) : Math.min(diff.botPadH, W - 20);
    const playerPadH = s.playerPadH;

    // Bot AI
    const botCenter = s.botY + botPadH / 2;
    const bdiff = s.ball.y - botCenter;
    if (diff.botSpeed >= 999) {
      s.botY = clamp(s.ball.y - botPadH / 2, 0, W - botPadH);
    } else {
      s.botY += clamp(bdiff * 0.06, -diff.botSpeed, diff.botSpeed);
      s.botY = clamp(s.botY, 0, W - botPadH);
    }

    // Ball movement
    s.ball.x += s.ball.vx;
    s.ball.y += s.ball.vy;

    // Side walls
    if (s.ball.x - BALL_R < 0) { s.ball.x = BALL_R; s.ball.vx *= -1; }
    if (s.ball.x + BALL_R > W) { s.ball.x = W - BALL_R; s.ball.vx *= -1; }

    // Player paddle (bottom)
    const playerPadTop = H - 28 - PAD_W;
    if (s.ball.y + BALL_R > playerPadTop && s.ball.y < playerPadTop + PAD_W + BALL_R &&
        s.ball.x > s.playerY && s.ball.x < s.playerY + playerPadH) {
      s.ball.vy = -Math.abs(s.ball.vy) * BALL_BOUNCE_ACCEL;
      s.ball.vx += ((s.ball.x - (s.playerY + playerPadH / 2)) / (playerPadH / 2)) * 3;
      s.ball.vy = clamp(s.ball.vy, -diff.ballMax, -1);
      s.ball.y = playerPadTop - BALL_R;
    }

    // Bot paddle (top)
    const botPadBottom = 28 + PAD_W;
    if (s.ball.y - BALL_R < botPadBottom && s.ball.y > 28 - BALL_R &&
        s.ball.x > s.botY && s.ball.x < s.botY + botPadH) {
      s.ball.vy = Math.abs(s.ball.vy) * BALL_BOUNCE_ACCEL;
      s.ball.vx += ((s.ball.x - (s.botY + botPadH / 2)) / (botPadH / 2)) * 3;
      s.ball.vy = clamp(s.ball.vy, 1, diff.ballMax);
      s.ball.y = botPadBottom + BALL_R;
    }

    // Scoring - ball exits top = player scores, bottom = bot scores
    if (s.ball.y < -BALL_R * 2) {
      s.playerScore++;
      if (s.playerScore >= WIN_SCORE) { s.state = 'gameover'; setGameState('gameover'); }
      else resetBall(1);
    }
    if (s.ball.y > H + BALL_R * 2) {
      s.botScore++;
      if (s.botScore >= WIN_SCORE) { s.state = 'gameover'; setGameState('gameover'); }
      else resetBall(-1);
    }
  }, [getDiff, resetBall]);

  const drawPad = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, horizontal: boolean) => {
    ctx.shadowBlur = 16; ctx.shadowColor = color;
    const g = horizontal
      ? ctx.createLinearGradient(x, y, x + w, y)
      : ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, color); g.addColorStop(1, color + '88');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    const { W, H } = s;
    const diff = getDiff();
    const botPadH = diff.botPadH === -1 ? Math.min(W * 0.9, W - 20) : Math.min(diff.botPadH, W - 20);
    const playerPadH = s.playerPadH;

    update();
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#000820'); bg.addColorStop(1, '#001020');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Center line
    ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(0,229,255,.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle (bottom, horizontal)
    const playerPadTop = H - 28 - PAD_W;
    drawPad(ctx, s.playerY, playerPadTop, playerPadH, PAD_W, COLOR, true);

    // Bot paddle (top, horizontal)
    drawPad(ctx, s.botY, 28, botPadH, PAD_W, BOT_COLOR, true);

    // Labels
    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,229,255,.35)'; ctx.fillText('JOUEUR', W / 2, H - 8);
    ctx.fillStyle = 'rgba(255,74,248,.35)'; ctx.fillText('BOT', W / 2, 22);

    // Ball
    if (s.state === 'playing') {
      ctx.shadowBlur = 20; ctx.shadowColor = '#fff';
      const bg2 = ctx.createRadialGradient(s.ball.x, s.ball.y, 0, s.ball.x, s.ball.y, BALL_R);
      bg2.addColorStop(0, '#fff'); bg2.addColorStop(1, COLOR);
      ctx.fillStyle = bg2;
      ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Trail
      ctx.fillStyle = 'rgba(0,229,255,.12)';
      ctx.beginPath(); ctx.arc(s.ball.x - s.ball.vx * 2, s.ball.y - s.ball.vy * 2, BALL_R * .7, 0, Math.PI * 2); ctx.fill();
    }

    // Score
    ctx.shadowBlur = 15; ctx.shadowColor = COLOR;
    ctx.fillStyle = COLOR; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
    ctx.fillText(String(s.playerScore), W / 2 - 45, H / 2 + 35);
    ctx.shadowColor = BOT_COLOR; ctx.fillStyle = BOT_COLOR;
    ctx.fillText(String(s.botScore), W / 2 + 45, H / 2 - 20); ctx.shadowBlur = 0;

    // Overlays
    if (s.state === 'idle') {
      ctx.fillStyle = 'rgba(0,8,32,.78)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = COLOR; ctx.shadowBlur = 20; ctx.shadowColor = COLOR;
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText('TENNIS DE BOT', W / 2, H / 2 - 18); ctx.shadowBlur = 0;
      ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(0,229,255,.6)';
      ctx.fillText('▶ Jouer pour démarrer', W / 2, H / 2 + 12);
      ctx.font = '9px monospace'; ctx.fillStyle = 'rgba(0,229,255,.35)';
      ctx.fillText('Glissez pour déplacer la raquette', W / 2, H / 2 + 34);
    }
    if (s.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,8,32,.85)'; ctx.fillRect(0, 0, W, H);
      const won = s.playerScore >= WIN_SCORE;
      const wc = won ? '#ffd700' : BOT_COLOR;
      ctx.fillStyle = wc; ctx.shadowBlur = 25; ctx.shadowColor = wc;
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText(won ? '🏆 VICTOIRE !' : 'LE BOT GAGNE', W / 2, H / 2 - 24); ctx.shadowBlur = 0;
      ctx.font = 'bold 13px monospace'; ctx.fillStyle = 'rgba(0,229,255,.7)';
      ctx.fillText(s.playerScore + ' — ' + s.botScore, W / 2, H / 2 + 10);
      ctx.font = '11px monospace'; ctx.fillStyle = 'rgba(0,229,255,.4)';
      ctx.fillText('TAP ▶ Jouer pour rejouer', W / 2, H / 2 + 34);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [update, drawPad, getDiff]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height);
        if (w > 0 && h > 0) {
          stateRef.current.W = w;
          stateRef.current.H = h;
          stateRef.current.playerPadH = Math.max(60, Math.min(120, w * 0.25));
          const diff = DIFFICULTIES[stateRef.current.diffIdx];
          if (diff.botPadH === -1) {
            stateRef.current.botY = 0;
          }
          setDims({ w, h });
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Sync diffIdx
  useEffect(() => {
    stateRef.current.diffIdx = diffIdx;
  }, [diffIdx]);

  // Game loop + controls
  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const s = stateRef.current;
    const canvas = canvasRef.current;

    const getCanvasY = (clientX: number, clientY: number) => {
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (s.W / rect.width),
        y: (clientY - rect.top) * (s.H / rect.height),
      };
    };

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      s.dragging = true;
      const { x } = getCanvasY(e.touches[0].clientX, e.touches[0].clientY);
      s.playerY = clamp(x - s.playerPadH / 2, 0, s.W - s.playerPadH);
      e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!s.dragging) return;
      const { x } = getCanvasY(e.touches[0].clientX, e.touches[0].clientY);
      s.playerY = clamp(x - s.playerPadH / 2, 0, s.W - s.playerPadH);
      e.preventDefault();
    };
    const onTouchEnd = () => { s.dragging = false; };

    // Mouse
    const onMouseDown = (e: MouseEvent) => {
      s.dragging = true;
      const { x } = getCanvasY(e.clientX, e.clientY);
      s.playerY = clamp(x - s.playerPadH / 2, 0, s.W - s.playerPadH);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!s.dragging) return;
      const { x } = getCanvasY(e.clientX, e.clientY);
      s.playerY = clamp(x - s.playerPadH / 2, 0, s.W - s.playerPadH);
    };
    const onMouseUp = () => { s.dragging = false; };

    // Keyboard
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && s.state !== 'playing') {
        e.preventDefault();
      }
    };

    canvas?.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas?.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas?.addEventListener('touchend', onTouchEnd);
    canvas?.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas?.removeEventListener('touchstart', onTouchStart);
      canvas?.removeEventListener('touchmove', onTouchMove);
      canvas?.removeEventListener('touchend', onTouchEnd);
      canvas?.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [render]);

  const cycleDifficulty = useCallback(() => {
    setDiffIdx((prev) => {
      const next = (prev + 1) % DIFFICULTIES.length;
      stateRef.current.diffIdx = next;
      return next;
    });
  }, []);

  const diff = DIFFICULTIES[diffIdx];

  return (
    <div className="flex flex-col items-center gap-3 w-full h-full">
      <div ref={containerRef} className="relative w-full flex-1 min-h-0 bg-black rounded-lg overflow-hidden" style={{ maxHeight: '70vh', aspectRatio: '4/3' }}>
        <canvas
          ref={canvasRef}
          width={dims.w}
          height={dims.h}
          className="block w-full h-full rounded-lg"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="flex gap-2 flex-wrap justify-center flex-shrink-0 pb-1">
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
        <ActionButton label="↺ Restart" color={COLOR} onClick={start} />
        <ActionButton
          label={`${diff.emoji} ${diff.label}`}
          color={diffIdx === 3 ? '#ff4444' : COLOR}
          onClick={cycleDifficulty}
        />
      </div>
    </div>
  );
}
