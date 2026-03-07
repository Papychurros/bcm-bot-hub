import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Dpad, ActionButton } from './TouchControls';

const CELL = 20;
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,3,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,2,1],
  [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,2,1,1,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
  [1,1,1,1,2,1,0,0,4,4,4,4,0,0,1,2,1,1,1,1,1],
  [1,1,1,1,2,0,0,1,4,4,4,4,1,0,0,2,1,1,1,1,1],
  [2,2,2,2,2,0,0,1,4,4,4,4,1,0,0,2,2,2,2,2,2],
  [1,1,1,1,2,0,0,1,1,1,1,1,1,0,0,2,1,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,2,1],
  [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const MROWS = MAP.length, MCOLS = MAP[0].length;
const W = MCOLS * CELL, H = MROWS * CELL;
const COLOR = '#a855f7';

type GameState = 'idle' | 'playing' | 'win' | 'over';

interface Ghost {
  x: number; y: number; dx: number; dy: number;
  color: string; scared: number; sx: number; sy: number;
}

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const stateRef = useRef({
    grid: MAP.map(r => [...r]),
    pac: { x: 10, y: 16, dx: 0, dy: 0, ndx: 0, ndy: 0, mouth: 0.25, mdir: 1 },
    ghosts: [] as Ghost[],
    score: 0, best: 0, lives: 3, dots: 0,
    state: 'idle' as GameState,
    pacInterval: null as ReturnType<typeof setInterval> | null,
    ghostInterval: null as ReturnType<typeof setInterval> | null,
  });

  const isBlocked = useCallback((x: number, y: number, grid: number[][]) => {
    x = (x + MCOLS) % MCOLS;
    if (y < 0 || y >= MROWS) return true;
    return grid[y][x] === 1 || grid[y][x] === 4;
  }, []);

  const initGame = useCallback(() => {
    const s = stateRef.current;
    if (s.pacInterval) clearInterval(s.pacInterval);
    if (s.ghostInterval) clearInterval(s.ghostInterval);

    s.grid = MAP.map(r => [...r]);
    s.dots = 0;
    for (let r = 0; r < MROWS; r++)
      for (let c = 0; c < MCOLS; c++)
        if (s.grid[r][c] === 2 || s.grid[r][c] === 3) s.dots++;

    s.pac = { x: 10, y: 16, dx: 0, dy: 0, ndx: 0, ndy: 0, mouth: 0.25, mdir: 1 };
    s.ghosts = [
      { x: 9, y: 9, dx: 1, dy: 0, color: '#ff6b6b', scared: 0, sx: 9, sy: 9 },
      { x: 10, y: 9, dx: -1, dy: 0, color: '#ff9ff3', scared: 0, sx: 10, sy: 9 },
      { x: 9, y: 10, dx: 0, dy: 1, color: '#54a0ff', scared: 0, sx: 9, sy: 10 },
      { x: 10, y: 10, dx: 0, dy: -1, color: '#ffd32a', scared: 0, sx: 10, sy: 10 },
    ];
    s.score = 0; s.lives = 3; s.state = 'playing';
    setGameState('playing');

    s.pacInterval = setInterval(() => {
      if (s.state !== 'playing') return;
      const nx = s.pac.x + s.pac.ndx, ny = s.pac.y + s.pac.ndy;
      if (!isBlocked(nx, ny, s.grid)) { s.pac.dx = s.pac.ndx; s.pac.dy = s.pac.ndy; }
      const mx = s.pac.x + s.pac.dx, my = s.pac.y + s.pac.dy;
      if (!isBlocked(mx, my, s.grid)) {
        s.pac.x = (mx + MCOLS) % MCOLS;
        s.pac.y = (my + MROWS) % MROWS;
      }
      const v = s.grid[s.pac.y]?.[s.pac.x];
      if (v === 2) { s.grid[s.pac.y][s.pac.x] = 0; s.score += 10; s.dots--; }
      else if (v === 3) { s.grid[s.pac.y][s.pac.x] = 0; s.score += 50; s.dots--; s.ghosts.forEach(g => g.scared = 30); }
      if (s.dots <= 0) endGame(true);
    }, 200);

    s.ghostInterval = setInterval(() => {
      if (s.state !== 'playing') return;
      s.ghosts.forEach(g => {
        if (g.scared > 0) g.scared--;
        const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
        let valid = dirs.filter(d => {
          if (d.dx === -g.dx && d.dy === -g.dy) return false;
          const nx2 = (g.x + d.dx + MCOLS) % MCOLS;
          const ny2 = g.y + d.dy;
          if (ny2 < 0 || ny2 >= MROWS) return false;
          return s.grid[ny2][nx2] !== 1;
        });
        if (valid.length === 0) {
          valid = dirs.filter(d => {
            const nx2 = (g.x + d.dx + MCOLS) % MCOLS;
            const ny2 = g.y + d.dy;
            if (ny2 < 0 || ny2 >= MROWS) return false;
            return s.grid[ny2][nx2] !== 1;
          });
        }
        if (valid.length === 0) return;

        let chosen;
        if (g.scared > 0) {
          chosen = valid.reduce((b, d) => {
            const nx2 = (g.x + d.dx + MCOLS) % MCOLS;
            const ny2 = g.y + d.dy;
            const dist = Math.abs(nx2 - s.pac.x) + Math.abs(ny2 - s.pac.y);
            return dist > b.dist ? { d, dist } : b;
          }, { d: valid[0], dist: -1 }).d;
        } else if (Math.random() < 0.8) {
          chosen = valid.reduce((b, d) => {
            const nx2 = (g.x + d.dx + MCOLS) % MCOLS;
            const ny2 = g.y + d.dy;
            const dist = Math.abs(nx2 - s.pac.x) + Math.abs(ny2 - s.pac.y);
            return dist < b.dist ? { d, dist } : b;
          }, { d: valid[0], dist: 9999 }).d;
        } else {
          chosen = valid[Math.floor(Math.random() * valid.length)];
        }

        g.dx = chosen.dx; g.dy = chosen.dy;
        g.x = (g.x + g.dx + MCOLS) % MCOLS;
        g.y = Math.max(0, Math.min(MROWS - 1, g.y + g.dy));

        if (g.x === s.pac.x && g.y === s.pac.y) {
          if (g.scared > 0) {
            s.score += 200;
            g.x = g.sx; g.y = g.sy; g.scared = 0;
          } else {
            s.lives--;
            if (s.lives <= 0) endGame(false);
            else {
              s.pac.x = 10; s.pac.y = 16; s.pac.dx = 0; s.pac.dy = 0; s.pac.ndx = 0; s.pac.ndy = 0;
              s.ghosts.forEach(gh => { gh.x = gh.sx; gh.y = gh.sy; gh.scared = 0; });
            }
          }
        }
      });
    }, 280);
  }, [isBlocked]);

  const endGame = useCallback((win: boolean) => {
    const s = stateRef.current;
    if (s.pacInterval) clearInterval(s.pacInterval);
    if (s.ghostInterval) clearInterval(s.ghostInterval);
    s.state = win ? 'win' : 'over';
    if (win) s.score += 1000;
    if (s.score > s.best) s.best = s.score;
    setGameState(win ? 'win' : 'over');
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;

    ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H);

    for (let r = 0; r < MROWS; r++) {
      for (let c = 0; c < MCOLS; c++) {
        const v = s.grid[r][c];
        const x = c * CELL, y = r * CELL;
        if (v === 1) {
          ctx.fillStyle = '#1e0a3c'; ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = '#6d28d9'; ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
        } else if (v === 2) {
          ctx.fillStyle = '#a855f7'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 4;
          ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        } else if (v === 3) {
          const t = Date.now() / 400;
          ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 10 + Math.sin(t) * 5;
          ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2, 5 + Math.sin(t), 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Pac-Man
    s.pac.mouth += 0.12 * s.pac.mdir;
    if (s.pac.mouth > 0.45 || s.pac.mouth < 0.02) s.pac.mdir *= -1;
    const angle = Math.atan2(s.pac.dy, s.pac.dx) || 0;
    const px = s.pac.x * CELL + CELL / 2, py = s.pac.y * CELL + CELL / 2;
    ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(px, py);
    ctx.arc(px, py, CELL / 2 - 1, angle + s.pac.mouth, angle + Math.PI * 2 - s.pac.mouth);
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;

    // Ghosts
    s.ghosts.forEach(g => {
      const gx = g.x * CELL + CELL / 2, gy = g.y * CELL + CELL / 2;
      const r2 = CELL / 2 - 1;
      let color;
      if (g.scared > 0) {
        color = g.scared < 8 ? (Math.floor(Date.now() / 200) % 2 ? '#fff' : '#3b82f6') : '#3b82f6';
      } else { color = g.color; }
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(gx, gy - 1, r2, Math.PI, 0);
      ctx.lineTo(gx + r2, gy + r2 + 1);
      for (let i = 3; i >= 0; i--) {
        const tx2 = gx - r2 + (i + 0.5) * (r2 * 2 / 3);
        ctx.arc(tx2, gy + r2 + 1, r2 / 3, 0, Math.PI, true);
      }
      ctx.lineTo(gx - r2, gy + r2 + 1);
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      if (g.scared === 0) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(gx - 4, gy - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx + 4, gy - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(gx - 4 + g.dx * 1.5, gy - 2 + g.dy * 1.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx + 4 + g.dx * 1.5, gy - 2 + g.dy * 1.5, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    });

    // HUD
    ctx.shadowBlur = 0;
    ctx.font = "bold 11px monospace"; ctx.textAlign = 'left';
    ctx.fillStyle = COLOR; ctx.fillText(`SCORE: ${s.score}`, 4, H - 4);
    ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'center';
    ctx.fillText('♥'.repeat(Math.max(0, s.lives)), W / 2, H - 4);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${s.best}`, W - 4, H - 4);

    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === 'ArrowLeft') { s.pac.ndx = -1; s.pac.ndy = 0; }
      if (e.key === 'ArrowRight') { s.pac.ndx = 1; s.pac.ndy = 0; }
      if (e.key === 'ArrowUp') { s.pac.ndx = 0; s.pac.ndy = -1; }
      if (e.key === 'ArrowDown') { s.pac.ndx = 0; s.pac.ndy = 1; }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      const s = stateRef.current;
      if (s.pacInterval) clearInterval(s.pacInterval);
      if (s.ghostInterval) clearInterval(s.ghostInterval);
    };
  }, [render]);

  const handleDirection = useCallback((dir: string, type: 'down' | 'up') => {
    if (type !== 'down') return;
    const s = stateRef.current;
    const m: Record<string, { dx: number; dy: number }> = {
      up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 },
    };
    const d = m[dir]; if (!d) return;
    s.pac.ndx = d.dx; s.pac.ndy = d.dy;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[420px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">👾</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>PAC-MAN</div>
            <div className="text-[11px] text-muted-foreground">Flèches ou D-pad pour jouer</div>
          </div>
        )}
        {gameState === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
            <div className="text-[11px] text-muted-foreground">MEILLEUR : {stateRef.current.best}</div>
          </div>
        )}
        {gameState === 'win' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🏆</div>
            <div className="text-base font-bold text-[#ffd700]">🎉 VICTOIRE !</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <Dpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={initGame} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={initGame} />
        </div>
      </div>
    </div>
  );
}
