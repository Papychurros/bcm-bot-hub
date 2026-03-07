import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ActionButton } from './TouchControls';

const ROWS = 6, COLS = 7;
const COLOR = '#a855f7';
const P2_COLOR = '#f59e0b';

type CellVal = 0 | 1 | 2;
type GameState = 'idle' | 'playing' | 'won' | 'draw';

interface WinCell { r: number; c: number; }

export default function Connect4Game() {
  const [board, setBoard] = useState<CellVal[][]>(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [winner, setWinner] = useState<0 | 1 | 2>(0);
  const [winCells, setWinCells] = useState<WinCell[]>([]);
  const [scores, setScores] = useState([0, 0]);
  const [vsAI, setVsAI] = useState(true);
  const [dropCol, setDropCol] = useState<number | null>(null);
  const aiThinkingRef = useRef(false);

  const initGame = useCallback(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setCurrentPlayer(1);
    setGameState('playing');
    setWinner(0);
    setWinCells([]);
    setDropCol(null);
    aiThinkingRef.current = false;
  }, []);

  const checkWin = useCallback((b: CellVal[][], player: CellVal): WinCell[] | null => {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c] !== player) continue;
        for (const [dr, dc] of dirs) {
          const cells: WinCell[] = [{ r, c }];
          for (let i = 1; i < 4; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[nr][nc] !== player) break;
            cells.push({ r: nr, c: nc });
          }
          if (cells.length === 4) return cells;
        }
      }
    }
    return null;
  }, []);

  const dropPiece = useCallback((b: CellVal[][], col: number, player: CellVal): [CellVal[][], number] => {
    const nb = b.map(r => [...r]);
    for (let r = ROWS - 1; r >= 0; r--) {
      if (nb[r][col] === 0) { nb[r][col] = player; return [nb, r]; }
    }
    return [nb, -1];
  }, []);

  // Minimax AI
  const scoreWindow = useCallback((w: CellVal[], player: CellVal) => {
    const opp = player === 1 ? 2 : 1;
    const pC = w.filter(c => c === player).length;
    const eC = w.filter(c => c === 0).length;
    const oC = w.filter(c => c === opp).length;
    let s = 0;
    if (pC === 4) s += 100;
    else if (pC === 3 && eC === 1) s += 5;
    else if (pC === 2 && eC === 2) s += 2;
    if (oC === 3 && eC === 1) s -= 4;
    return s;
  }, []);

  const scoreBoard = useCallback((b: CellVal[][], player: CellVal) => {
    let s = 0;
    const center = b.map(r => r[Math.floor(COLS / 2)]);
    s += center.filter(c => c === player).length * 3;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c <= COLS - 4; c++)
        s += scoreWindow([b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]], player);
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r <= ROWS - 4; r++)
        s += scoreWindow([b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]], player);
    for (let r = 0; r <= ROWS - 4; r++)
      for (let c = 0; c <= COLS - 4; c++)
        s += scoreWindow([b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]], player);
    for (let r = 3; r < ROWS; r++)
      for (let c = 0; c <= COLS - 4; c++)
        s += scoreWindow([b[r][c], b[r - 1][c + 1], b[r - 2][c + 2], b[r - 3][c + 3]], player);
    return s;
  }, [scoreWindow]);

  const getValid = useCallback((b: CellVal[][]) => [...Array(COLS).keys()].filter(c => b[0][c] === 0), []);

  const isWinning = useCallback((b: CellVal[][], player: CellVal) => {
    return checkWin(b, player) !== null;
  }, [checkWin]);

  const minimax = useCallback((b: CellVal[][], depth: number, alpha: number, beta: number, max: boolean): { score: number; col?: number } => {
    const valid = getValid(b);
    if (depth === 0 || valid.length === 0) return { score: scoreBoard(b, 2 as CellVal) };
    if (isWinning(b, 2 as CellVal)) return { score: 1000 + depth };
    if (isWinning(b, 1 as CellVal)) return { score: -1000 - depth };
    let best = max ? { score: -Infinity } as { score: number; col?: number } : { score: Infinity } as { score: number; col?: number };
    for (const col of valid) {
      const [nb] = dropPiece(b, col, (max ? 2 : 1) as CellVal);
      const result = minimax(nb, depth - 1, alpha, beta, !max);
      if (max) {
        if (result.score > best.score) best = { score: result.score, col };
        alpha = Math.max(alpha, best.score);
      } else {
        if (result.score < best.score) best = { score: result.score, col };
        beta = Math.min(beta, best.score);
      }
      if (beta <= alpha) break;
    }
    return best;
  }, [getValid, scoreBoard, isWinning, dropPiece]);

  const play = useCallback((col: number) => {
    setBoard(prev => {
      if (prev[0][col] !== 0) return prev;
      const player = currentPlayer as CellVal;
      const [nb, row] = dropPiece(prev, col, player);
      if (row === -1) return prev;

      setDropCol(col);
      setTimeout(() => setDropCol(null), 300);

      const win = checkWin(nb, player);
      if (win) {
        setWinCells(win);
        setWinner(player);
        setScores(s => player === 1 ? [s[0] + 1, s[1]] : [s[0], s[1] + 1]);
        setGameState('won');
        return nb;
      }
      if (nb[0].every(c => c !== 0)) {
        setGameState('draw');
        return nb;
      }

      const next = player === 1 ? 2 : 1;
      setCurrentPlayer(next as 1 | 2);

      if (vsAI && next === 2) {
        aiThinkingRef.current = true;
        setTimeout(() => {
          const result = minimax(nb, 5, -Infinity, Infinity, true);
          const aiCol = result.col !== undefined ? result.col : getValid(nb)[0];
          aiThinkingRef.current = false;
          if (aiCol !== undefined) {
            // Trigger AI play
            const [nb2, row2] = dropPiece(nb, aiCol, 2 as CellVal);
            if (row2 !== -1) {
              setDropCol(aiCol);
              setTimeout(() => setDropCol(null), 300);
              const win2 = checkWin(nb2, 2 as CellVal);
              if (win2) {
                setWinCells(win2);
                setWinner(2);
                setScores(s => [s[0], s[1] + 1]);
                setGameState('won');
              } else if (nb2[0].every(c => c !== 0)) {
                setGameState('draw');
              } else {
                setCurrentPlayer(1);
              }
              setBoard(nb2);
            }
          }
        }, 400);
      }

      return nb;
    });
  }, [currentPlayer, vsAI, checkWin, dropPiece, minimax, getValid]);

  const humanPlay = useCallback((col: number) => {
    if (gameState !== 'playing' || aiThinkingRef.current) return;
    if (vsAI && currentPlayer === 2) return;
    play(col);
  }, [gameState, vsAI, currentPlayer, play]);

  const isWinCell = useCallback((r: number, c: number) => winCells.some(w => w.r === r && w.c === c), [winCells]);

  const cellSize = 'clamp(36px, 10vw, 56px)';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Scores */}
      <div className="flex items-center gap-6 font-mono text-xs">
        <div className={`flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-transform ${currentPlayer === 1 && gameState === 'playing' ? 'scale-105' : ''}`}
          style={{ borderColor: COLOR, background: `color-mix(in srgb, ${COLOR} 10%, transparent)` }}>
          <span style={{ color: COLOR }}>JOUEUR 1</span>
          <span className="text-lg font-bold" style={{ color: '#c084fc' }}>{scores[0]}</span>
        </div>
        <span className="text-muted-foreground text-[10px]">VS</span>
        <div className={`flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-transform ${currentPlayer === 2 && gameState === 'playing' ? 'scale-105' : ''}`}
          style={{ borderColor: P2_COLOR, background: `color-mix(in srgb, ${P2_COLOR} 10%, transparent)` }}>
          <span style={{ color: P2_COLOR }}>{vsAI ? 'IA' : 'JOUEUR 2'}</span>
          <span className="text-lg font-bold" style={{ color: '#fcd34d' }}>{scores[1]}</span>
        </div>
      </div>

      {/* Status */}
      <div className="font-mono text-xs h-5 text-center" style={{
        color: gameState === 'won' ? (winner === 1 ? COLOR : P2_COLOR)
          : gameState === 'draw' ? '#888'
          : currentPlayer === 1 ? COLOR : P2_COLOR
      }}>
        {gameState === 'idle' && 'Appuyez sur JOUER'}
        {gameState === 'playing' && (currentPlayer === 1 ? 'À votre tour !' : (vsAI ? "L'IA réfléchit..." : 'Tour du Joueur 2'))}
        {gameState === 'won' && (winner === 1 ? '🎉 Joueur 1 gagne !' : (vsAI ? '🤖 IA gagne !' : '🎉 Joueur 2 gagne !'))}
        {gameState === 'draw' && 'Match nul !'}
      </div>

      {/* Column buttons */}
      {gameState === 'playing' && (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(7, ${cellSize})` }}>
          {Array.from({ length: COLS }, (_, c) => (
            <button key={c} onClick={() => humanPlay(c)}
              className="h-6 rounded border border-transparent text-xs cursor-pointer transition-all hover:border-[#a855f7] hover:bg-[rgba(168,85,247,0.15)]"
              style={{ color: COLOR }}>▼</button>
          ))}
        </div>
      )}

      {/* Board */}
      <div className="grid gap-1.5 p-3 rounded-xl border-2"
        style={{ gridTemplateColumns: `repeat(7, ${cellSize})`, borderColor: COLOR, background: '#1a0a2e', boxShadow: `0 0 40px rgba(168,85,247,0.4)` }}>
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const v = board[r][c];
            const win = isWinCell(r, c);
            return (
              <div key={`${r}-${c}`}
                onClick={() => humanPlay(c)}
                className={`rounded-full border-2 cursor-pointer transition-all ${dropCol === c && r === board.findIndex(row => row[c] !== 0) ? 'animate-bounce' : ''}`}
                style={{
                  width: cellSize, height: cellSize,
                  background: v === 1 ? COLOR : v === 2 ? P2_COLOR : '#0f0f1a',
                  borderColor: v === 1 ? '#c084fc' : v === 2 ? '#fcd34d' : '#2d1b4e',
                  boxShadow: v === 1 ? `0 0 16px rgba(168,85,247,0.8)${win ? ', inset 0 -4px 8px rgba(0,0,0,0.3)' : ''}`
                    : v === 2 ? `0 0 16px rgba(245,158,11,0.8)${win ? ', inset 0 -4px 8px rgba(0,0,0,0.3)' : ''}`
                    : 'none',
                  animation: win ? 'pulse 0.6s infinite alternate' : 'none',
                }}
              />
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={initGame} />
        <ActionButton label="⟳ Nouvelle partie" color={COLOR} onClick={initGame} />
        <ActionButton label={vsAI ? 'Mode: IA' : 'Mode: 2J'} color={P2_COLOR} onClick={() => { setVsAI(!vsAI); initGame(); }} />
      </div>
    </div>
  );
}
