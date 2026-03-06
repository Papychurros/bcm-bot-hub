import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Dpad, ActionButton } from './TouchControls';

const CELL = 20, COLS = 24, ROWS = 20;
const W = CELL * COLS, H = CELL * ROWS;
const COLOR = '#39ff14', FOOD_COLOR = '#ff4fa3';
const SPEED_INIT = 130, SPEED_MIN = 55;

type GameState = 'idle' | 'playing' | 'paused' | 'dead';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    snake: { x: number; y: number }[];
    dir: { x: number; y: number };
    nextDir: { x: number; y: number };
    food: { x: number; y: number };
    score: number;
    hiScore: number;
    loop: ReturnType<typeof setTimeout> | null;
    foodFlash: boolean;
    state: GameState;
  }>({
    snake: [], dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    food: { x: 0, y: 0 }, score: 0, hiScore: 0, loop: null, foodFlash: false, state: 'idle'
  });
  const [gameState, setGameState] = useState<GameState>('idle');

  const drawGrid = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
  }, []);

  const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    drawGrid();
    ctx.font = "bold 13px 'DM Mono',monospace";
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${String(s.score).padStart(3, '0')}`, 10, 18);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'right';
    ctx.fillText(`BEST  ${String(s.hiScore).padStart(3, '0')}`, W - 10, 18);
    // Food
    ctx.save();
    ctx.shadowBlur = s.foodFlash ? 28 : 16; ctx.shadowColor = COLOR;
    ctx.fillStyle = s.foodFlash ? '#fff' : COLOR;
    ctx.font = `bold ${CELL}px 'Syne',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('€', s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2 + 1);
    ctx.restore();
    // Snake
    s.snake.forEach((seg, i) => {
      ctx.save();
      ctx.shadowBlur = i === 0 ? 20 : 8; ctx.shadowColor = COLOR;
      ctx.globalAlpha = i === 0 ? 1 : Math.max(.25, 1 - i * .04);
      ctx.fillStyle = i === 0 ? '#fff' : COLOR;
      rr(ctx, seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, i === 0 ? 6 : 5);
      ctx.fill(); ctx.restore();
    });
  }, [drawGrid]);

  const placeFood = useCallback(() => {
    const s = stateRef.current;
    let p: { x: number; y: number };
    do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (s.snake.some(seg => seg.x === p.x && seg.y === p.y));
    s.food = p;
  }, []);

  const gameOver = useCallback(() => {
    const s = stateRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    s.state = 'dead';
    setGameState('dead');
    if (ctx) { ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#ff0040'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    s.dir = { ...s.nextDir };
    const head = { x: (s.snake[0].x + s.dir.x + COLS) % COLS, y: (s.snake[0].y + s.dir.y + ROWS) % ROWS };
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) { gameOver(); return; }
    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score++; if (s.score > s.hiScore) s.hiScore = s.score;
      placeFood(); s.foodFlash = true; setTimeout(() => { s.foodFlash = false; }, 200);
    } else { s.snake.pop(); }
    draw();
    s.loop = setTimeout(tick, Math.max(SPEED_MIN, SPEED_INIT - s.score * 3));
  }, [draw, placeFood, gameOver]);

  const start = useCallback(() => {
    const s = stateRef.current;
    if (s.loop) clearTimeout(s.loop);
    s.snake = [{ x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 }];
    s.dir = { x: 1, y: 0 }; s.nextDir = { x: 1, y: 0 };
    s.score = 0; s.state = 'playing';
    setGameState('playing');
    placeFood(); tick();
  }, [placeFood, tick]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    s.state = 'paused'; setGameState('paused');
    if (s.loop) clearTimeout(s.loop);
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'paused') return;
    s.state = 'playing'; setGameState('playing');
    tick();
  }, [tick]);

  const togglePause = useCallback(() => {
    stateRef.current.state === 'playing' ? pause() : resume();
  }, [pause, resume]);

  useEffect(() => {
    drawGrid();
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const map: Record<string, { x: number; y: number }> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') { togglePause(); return; }
      const d = map[e.key]; if (!d) return;
      if (d.x !== -s.dir.x || d.y !== -s.dir.y) s.nextDir = d;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const s = stateRef.current;
      if (s.loop) clearTimeout(s.loop);
      s.state = 'idle';
    };
  }, [drawGrid, togglePause]);

  const handleDirection = useCallback((dir: string, type: 'down' | 'up') => {
    if (type !== 'down') return;
    const s = stateRef.current;
    const map: Record<string, { x: number; y: number }> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const d = map[dir]; if (!d) return;
    if (d.x !== -s.dir.x || d.y !== -s.dir.y) s.nextDir = d;
  }, []);

  return (
    <div className="flex gap-5 items-start flex-col sm:flex-row">
      <div className="relative flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden min-h-[420px]">
        <canvas ref={canvasRef} width={W} height={H} className="block max-w-full max-h-full rounded-lg" />
        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🐍</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>SNAKE NÉON</div>
            <div className="text-[11px] text-muted-foreground">Flèches ou D-pad pour jouer</div>
          </div>
        )}
        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-base font-bold" style={{ color: COLOR }}>⏸ PAUSE</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
            <div className="text-[11px] text-muted-foreground">MEILLEUR : {stateRef.current.hiScore}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0 self-center sm:self-start">
        <Dpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
          <ActionButton label="⏸ Pause" color={COLOR} onClick={togglePause} />
        </div>
      </div>
    </div>
  );
}
