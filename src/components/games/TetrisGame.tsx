import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Dpad, ActionButton } from './TouchControls';

const COLS = 10, ROWS = 20, CELL = 22;
const W = COLS * CELL, H = ROWS * CELL;
const COLOR = '#a855f7';
const PIECE_COLORS: Record<string, string> = { I: '#00e5ff', O: '#a855f7', T: '#c084fc', S: '#7c3aed', Z: '#e040fb', J: '#6366f1', L: '#d8b4fe' };
const PIECES: Record<string, number[][]> = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};
const TYPES = Object.keys(PIECES);
const DROP_BASE = 800;

type GameState = 'idle' | 'playing' | 'paused' | 'dead';

interface TetrisPiece {
  type: string; color: string; mat: number[][]; x: number; y: number;
}

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);

  const stateRef = useRef<{
    board: (string | null)[][]; piece: TetrisPiece; next: TetrisPiece;
    score: number; hiScore: number; lines: number; level: number;
    running: boolean; paused: boolean; dead: boolean;
    loop: number | null; dropCounter: number; lastTime: number;
  }>({ board: [], piece: null as any, next: null as any, score: 0, hiScore: 0, lines: 0, level: 1, running: false, paused: false, dead: false, loop: null, dropCounter: 0, lastTime: 0 });

  const makeBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const randomPiece = (): TetrisPiece => {
    const t = TYPES[Math.floor(Math.random() * TYPES.length)];
    const mat = PIECES[t].map(r => [...r]);
    return { type: t, color: PIECE_COLORS[t], mat, x: Math.floor(COLS / 2) - Math.floor(mat[0].length / 2), y: 0 };
  };

  const rotateCW = (mat: number[][]) => {
    const N = mat.length, M = mat[0].length;
    const r: number[][] = Array.from({ length: M }, () => Array(N));
    for (let y = 0; y < N; y++) for (let x = 0; x < M; x++) r[x][N - 1 - y] = mat[y][x];
    return r;
  };

  const valid = (p: TetrisPiece, board: (string | null)[][]) => {
    for (let y = 0; y < p.mat.length; y++)
      for (let x = 0; x < p.mat[y].length; x++) {
        if (!p.mat[y][x]) continue;
        const nx = p.x + x, ny = p.y + y;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
        if (ny >= 0 && board[ny][nx]) return false;
      }
    return true;
  };

  const drawCell = (cx: CanvasRenderingContext2D, gx: number, gy: number, col: string, glow: boolean) => {
    const px = gx * CELL, py = gy * CELL;
    cx.save();
    if (glow) { cx.shadowBlur = 10; cx.shadowColor = col; }
    cx.fillStyle = col; cx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    cx.globalAlpha = .25; cx.fillStyle = '#fff'; cx.fillRect(px + 2, py + 2, CELL - 4, 4);
    cx.restore();
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const nCtx = nCanvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx || !s.piece) return;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = .5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
    // Ghost
    let ghost = { ...s.piece, mat: s.piece.mat.map(r => [...r]) };
    while (valid({ ...ghost, y: ghost.y + 1 }, s.board)) ghost = { ...ghost, y: ghost.y + 1 };
    if (ghost.y !== s.piece.y) {
      ghost.mat.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = s.piece.color;
        drawCell(ctx, ghost.x + x, ghost.y + y, s.piece.color, false); ctx.restore();
      }));
    }
    // Board
    s.board.forEach((row, y) => row.forEach((col, x) => { if (col) drawCell(ctx, x, y, col, true); }));
    // Current piece
    s.piece.mat.forEach((row, y) => row.forEach((v, x) => { if (v) drawCell(ctx, s.piece.x + x, s.piece.y + y, s.piece.color, true); }));
    // Next
    if (nCtx && s.next) {
      nCtx.fillStyle = '#0a0a0f'; nCtx.fillRect(0, 0, 80, 80);
      const nc = s.next.mat[0].length, nr = s.next.mat.length;
      const ox = Math.floor((4 - nc) / 2), oy = Math.floor((4 - nr) / 2);
      s.next.mat.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        const px = (ox + x) * 18 + 6, py = (oy + y) * 18 + 6;
        nCtx.save(); nCtx.shadowBlur = 8; nCtx.shadowColor = s.next.color;
        nCtx.fillStyle = s.next.color; nCtx.fillRect(px + 1, py + 1, 16, 16);
        nCtx.globalAlpha = .3; nCtx.fillStyle = '#fff'; nCtx.fillRect(px + 2, py + 2, 14, 4);
        nCtx.restore();
      }));
    }
  }, []);

  const updateHUD = useCallback(() => {
    const s = stateRef.current;
    setScore(s.score); setHiScore(s.hiScore); setLines(s.lines); setLevel(s.level);
  }, []);

  const lockRef = useRef<() => void>();
  lockRef.current = () => {
    const s = stateRef.current;
    s.piece.mat.forEach((row, y) => row.forEach((v, x) => { if (v) s.board[s.piece.y + y][s.piece.x + x] = s.piece.color; }));
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (s.board[y].every(c => c)) { s.board.splice(y, 1); s.board.unshift(Array(COLS).fill(null)); cleared++; y++; }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800];
      s.score += pts[cleared] * s.level; s.lines += cleared; s.level = Math.floor(s.lines / 10) + 1;
      if (s.score > s.hiScore) s.hiScore = s.score;
      updateHUD();
    }
    s.piece = s.next; s.next = randomPiece();
    if (!valid(s.piece, s.board)) { s.dead = true; s.running = false; if (s.score > s.hiScore) s.hiScore = s.score; updateHUD(); setTimeout(() => setGameState('dead'), 400); }
  };

  const drop = useCallback(() => {
    const s = stateRef.current;
    const moved = { ...s.piece, y: s.piece.y + 1 };
    if (valid(moved, s.board)) s.piece = moved;
    else lockRef.current!();
  }, []);

  const tickRef = useRef<(ts: number) => void>();
  tickRef.current = (ts: number) => {
    const s = stateRef.current;
    if (!s.running) return;
    const dt = s.lastTime ? Math.min(ts - s.lastTime, 50) : 0;
    s.lastTime = ts;
    s.dropCounter += dt;
    const dropInterval = Math.max(80, DROP_BASE - ((s.level - 1) * 70));
    if (s.dropCounter >= dropInterval) { s.dropCounter = 0; drop(); }
    draw();
    s.loop = requestAnimationFrame(tickRef.current!);
  };

  const start = useCallback(() => {
    const s = stateRef.current;
    if (s.loop) cancelAnimationFrame(s.loop);
    s.board = makeBoard(); s.score = 0; s.lines = 0; s.level = 1;
    s.piece = randomPiece(); s.next = randomPiece();
    s.dropCounter = 0; s.lastTime = 0;
    s.running = true; s.paused = false; s.dead = false;
    updateHUD(); setGameState('playing');
    s.loop = requestAnimationFrame(tickRef.current!);
  }, [updateHUD, drop, draw]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (!s.running || s.dead) return;
    s.paused = true; s.running = false; if (s.loop) cancelAnimationFrame(s.loop);
    setGameState('paused');
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (!s.paused) return;
    s.paused = false; s.running = true; s.lastTime = 0;
    setGameState('playing');
    s.loop = requestAnimationFrame(tickRef.current!);
  }, []);

  const togglePause = useCallback(() => {
    stateRef.current.running ? pause() : resume();
  }, [pause, resume]);

  const rotateNow = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    const rot = { ...s.piece, mat: rotateCW(s.piece.mat) };
    if (valid(rot, s.board)) s.piece = rot;
    else if (valid({ ...rot, x: rot.x + 1 }, s.board)) s.piece = { ...rot, x: rot.x + 1 };
    else if (valid({ ...rot, x: rot.x - 1 }, s.board)) s.piece = { ...rot, x: rot.x - 1 };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running && !s.paused) return;
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') { togglePause(); e.preventDefault(); return; }
      if (!s.running) return;
      if (e.key === 'ArrowLeft') { const m = { ...s.piece, x: s.piece.x - 1 }; if (valid(m, s.board)) s.piece = m; }
      else if (e.key === 'ArrowRight') { const m = { ...s.piece, x: s.piece.x + 1 }; if (valid(m, s.board)) s.piece = m; }
      else if (e.key === 'ArrowDown') { drop(); }
      else if (e.key === 'ArrowUp' || e.key === 'r' || e.key === 'R') { rotateNow(); }
      else if (e.key === 'Enter') {
        while (valid({ ...s.piece, y: s.piece.y + 1 }, s.board)) s.piece = { ...s.piece, y: s.piece.y + 1 };
        lockRef.current!();
      }
      e.preventDefault?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const s = stateRef.current;
      if (s.loop) cancelAnimationFrame(s.loop);
      s.running = false;
    };
  }, [togglePause, drop, rotateNow]);

  const handleDirection = useCallback((dir: string, type: 'down' | 'up') => {
    if (type !== 'down') return;
    const s = stateRef.current;
    if (!s.running) return;
    if (dir === 'left') { const m = { ...s.piece, x: s.piece.x - 1 }; if (valid(m, s.board)) s.piece = m; }
    else if (dir === 'right') { const m = { ...s.piece, x: s.piece.x + 1 }; if (valid(m, s.board)) s.piece = m; }
    else if (dir === 'down') { drop(); }
    else if (dir === 'up') { rotateNow(); }
  }, [drop, rotateNow]);

  const centerButton = (
    <button
      className="w-14 h-14 rounded-xl bg-secondary border border-border text-foreground text-base flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
      onPointerDown={rotateNow}
    >
      ↻
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[320px] bg-black rounded-lg overflow-hidden p-2">
        <div className="flex items-start justify-center gap-3">
          <div className="relative" style={{ aspectRatio: `${W}/${H}` }}>
            <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-md border border-border" />
          </div>
          <div className="flex flex-col gap-2 min-w-[70px]">
            <div className="font-mono text-[11px] text-foreground leading-relaxed">
              <div className="font-bold" style={{ color: COLOR }}>SCORE</div>
              <div>{String(score).padStart(5, '0')}</div>
              <div className="font-bold mt-1.5" style={{ color: COLOR }}>BEST</div>
              <div>{String(hiScore).padStart(5, '0')}</div>
              <div className="font-bold mt-1.5" style={{ color: COLOR }}>LIGNES</div>
              <div>{lines}</div>
              <div className="font-bold mt-1.5" style={{ color: COLOR }}>NIVEAU</div>
              <div>{level}</div>
            </div>
            <div className="font-mono text-[11px] font-bold mt-1" style={{ color: COLOR }}>NEXT</div>
            <canvas ref={nCanvasRef} width={80} height={80} className="rounded-md border border-border bg-[#0a0a0f] w-[70px] h-[70px]" />
          </div>
        </div>
        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[30px]">🟪</div>
            <div className="text-[17px] font-bold tracking-wider" style={{ color: COLOR }}>B.O.B TETRIS</div>
            <div className="text-[11px] text-muted-foreground">← → ↓ rotation ↑ · Espace = pause</div>
          </div>
        )}
        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold" style={{ color: COLOR }}>⏸ PAUSE</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[14px] font-bold text-destructive">GAME OVER</div>
            <div className="text-[26px] font-extrabold" style={{ color: COLOR }}>{score}</div>
            <div className="text-[11px] text-muted-foreground">MEILLEUR : {hiScore}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <Dpad color={COLOR} onDirection={handleDirection} centerButton={centerButton} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={start} />
          <ActionButton label="⏸ Pause" color={COLOR} onClick={togglePause} />
        </div>
      </div>
    </div>
  );
}
