import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ActionButton } from './TouchControls';
import botBob from '@/assets/bot-bob.png';

const GRID = 4;
const COLOR = '#06b6d4';

interface Piece {
  id: number;
  currentPos: number;
  correctPos: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PuzzleGame() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.src = botBob;
    img.onload = () => { imgRef.current = img; };
  }, []);

  const createPieces = useCallback((): Piece[] => {
    const positions = shuffle([...Array(GRID * GRID).keys()]);
    return Array.from({ length: GRID * GRID }, (_, i) => ({
      id: i, currentPos: positions[i], correctPos: i,
    }));
  }, []);

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPieces(createPieces());
    setSelected(null);
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setGameStarted(true);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }, [createPieces]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const onPieceClick = useCallback((id: number) => {
    if (!gameStarted || won) return;
    if (selected === null) {
      setSelected(id);
    } else if (selected === id) {
      setSelected(null);
    } else {
      setPieces(prev => {
        const next = [...prev];
        const a = next.find(p => p.id === selected)!;
        const b = next.find(p => p.id === id)!;
        const tmp = a.currentPos;
        a.currentPos = b.currentPos;
        b.currentPos = tmp;

        // Check win
        const allCorrect = next.every(p => p.currentPos === p.correctPos);
        if (allCorrect) {
          setWon(true);
          setGameStarted(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return [...next];
      });
      setMoves(m => m + 1);
      setSelected(null);
    }
  }, [selected, gameStarted, won]);

  const formatTime = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  const correct = pieces.filter(p => p.currentPos === p.correctPos).length;
  const total = GRID * GRID;
  const pieceSize = `clamp(60px, 18vw, 90px)`;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* HUD */}
      <div className="flex gap-6 font-mono text-xs text-foreground">
        <span>MOVES <span className="font-bold" style={{ color: COLOR }}>{moves}</span></span>
        <span>TEMPS <span className="font-bold" style={{ color: COLOR }}>{formatTime(seconds)}</span></span>
        <span className="font-bold" style={{ color: COLOR }}>{correct}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[360px] h-1 rounded-full overflow-hidden" style={{ background: `color-mix(in srgb, ${COLOR} 20%, transparent)` }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(correct / total) * 100}%`, background: COLOR, boxShadow: `0 0 8px ${COLOR}` }} />
      </div>

      {won && (
        <div className="font-mono text-sm font-bold tracking-wider text-[#ffd700]">
          🧠 BRAVO ! {moves} coups · {formatTime(seconds)}
        </div>
      )}

      {/* Puzzle grid */}
      <div className="relative grid gap-1 rounded-xl border-2 p-1"
        style={{ gridTemplateColumns: `repeat(${GRID}, ${pieceSize})`, borderColor: COLOR, boxShadow: `0 0 30px ${COLOR}40` }}>

        {!gameStarted && !won && (
          <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center bg-black/90 z-10 gap-3 font-mono">
            <div className="text-lg font-bold" style={{ color: COLOR }}>🧩 PUZZLE</div>
            <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Clique 2 pièces pour<br />les échanger !<br />Reconstitue l'image.
            </div>
          </div>
        )}

        {showPreview && imgRef.current && (
          <div className="absolute inset-0 rounded-lg z-20 opacity-85"
            style={{ backgroundImage: `url(${botBob})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}

        {pieces.length > 0 ? pieces.map(piece => {
          const srcRow = Math.floor(piece.correctPos / GRID);
          const srcCol = piece.correctPos % GRID;
          const destRow = Math.floor(piece.currentPos / GRID);
          const destCol = piece.currentPos % GRID;
          const isCorrect = piece.currentPos === piece.correctPos;
          const isSelected = selected === piece.id;

          return (
            <div
              key={piece.id}
              onClick={() => onPieceClick(piece.id)}
              className="cursor-pointer transition-shadow overflow-hidden"
              style={{
                width: pieceSize, height: pieceSize,
                gridRow: destRow + 1, gridColumn: destCol + 1,
                backgroundImage: `url(${botBob})`,
                backgroundSize: `calc(${pieceSize} * ${GRID}) calc(${pieceSize} * ${GRID})`,
                backgroundPosition: `-${srcCol * 100}% -${srcRow * 100}%`,
                border: isSelected ? `3px solid ${COLOR}` : isCorrect ? `1px solid rgba(34,197,94,0.6)` : `1px solid ${COLOR}50`,
                boxShadow: isSelected ? `0 0 0 3px ${COLOR}, 0 0 20px ${COLOR}80` : 'none',
                zIndex: isSelected ? 20 : 1,
              }}
            />
          );
        }) : Array.from({ length: total }, (_, i) => (
          <div key={i} className="bg-black/50" style={{ width: pieceSize, height: pieceSize }} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={startGame} />
        <ActionButton label="⟳ Mélanger" color={COLOR} onClick={startGame} />
        <button
          className="px-4 py-2 rounded-full border font-mono text-xs tracking-wider cursor-pointer select-none transition-all active:scale-[0.92] bg-secondary border-border text-foreground"
          onPointerDown={() => setShowPreview(true)}
          onPointerUp={() => setShowPreview(false)}
          onPointerLeave={() => setShowPreview(false)}
        >
          👁 Aperçu
        </button>
      </div>
    </div>
  );
}
