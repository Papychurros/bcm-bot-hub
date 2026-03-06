import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ActionButton } from './TouchControls';
import botBob from '@/assets/bot-bob.png';
import botCash from '@/assets/bot-cash.png';
import botMag from '@/assets/bot-mag.png';

const COLOR = '#00e5ff';

interface CardDef {
  type: 'img' | 'emoji';
  src?: string;
  char?: string;
  label: string;
  bg: string;
}

const CARD_DEFS: CardDef[] = [
  { type: 'img', src: botCash, label: 'C.A.S.H', bg: '#0a1a0a' },
  { type: 'img', src: botMag, label: 'M.A.G', bg: '#0a0a1a' },
  { type: 'img', src: botBob, label: 'B.O.B', bg: '#1a0a1a' },
  { type: 'emoji', char: '🤖', label: 'Robot', bg: '#0a1a1a' },
  { type: 'emoji', char: '⚡', label: 'Énergie', bg: '#1a1a0a' },
  { type: 'emoji', char: '🧠', label: 'IA', bg: '#1a0a0f' },
];

interface Card extends CardDef {
  id: number;
  revealed: boolean;
  done: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [matched, setMatched] = useState(0);
  const [won, setWon] = useState(false);
  const flippedRef = useRef<number[]>([]);
  const lockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartedRef = useRef(false);

  const newGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    timerStartedRef.current = false;
    flippedRef.current = [];
    lockedRef.current = false;
    setMoves(0);
    setSeconds(0);
    setMatched(0);
    setWon(false);
    const deck = shuffle([...CARD_DEFS, ...CARD_DEFS].map((d, i) => ({ ...d, id: i, revealed: false, done: false })));
    setCards(deck);
  }, []);

  useEffect(() => {
    newGame();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [newGame]);

  const flip = useCallback((idx: number) => {
    if (lockedRef.current) return;
    setCards(prev => {
      const card = prev[idx];
      if (card.revealed || card.done) return prev;

      // Start timer on first flip
      if (!timerStartedRef.current && flippedRef.current.length === 0) {
        timerStartedRef.current = true;
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      }

      const next = prev.map((c, i) => i === idx ? { ...c, revealed: true } : c);
      flippedRef.current.push(idx);

      if (flippedRef.current.length === 2) {
        setMoves(m => m + 1);
        lockedRef.current = true;
        const [a, b] = flippedRef.current;
        if (next[a].label === next[b].label) {
          setTimeout(() => {
            setCards(p => p.map((c, i) => (i === a || i === b) ? { ...c, done: true } : c));
            setMatched(m => {
              const newMatched = m + 1;
              if (newMatched === CARD_DEFS.length) {
                if (timerRef.current) clearInterval(timerRef.current);
                setWon(true);
                setSeconds(s => {
                  setBestTime(bt => (bt === null || s < bt) ? s : bt);
                  return s;
                });
              }
              return newMatched;
            });
            flippedRef.current = [];
            lockedRef.current = false;
          }, 400);
        } else {
          setTimeout(() => {
            setCards(p => p.map((c, i) => (i === a || i === b) ? { ...c, revealed: false } : c));
            flippedRef.current = [];
            lockedRef.current = false;
          }, 900);
        }
      }

      return next;
    });
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex gap-6 font-mono text-xs text-foreground">
        <span>COUPS <span className="font-bold" style={{ color: COLOR }}>{moves}</span></span>
        <span>TEMPS <span className="font-bold" style={{ color: COLOR }}>{formatTime(seconds)}</span></span>
        <span>MEILLEUR <span className="font-bold text-muted-foreground">{bestTime !== null ? formatTime(bestTime) : '—'}</span></span>
      </div>

      {won && (
        <div className="font-mono text-sm font-bold tracking-wider text-[#ffd700]">
          🏆 GAGNÉ en {moves} coups · {formatTime(seconds)}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-[480px]">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className="relative aspect-square cursor-pointer"
            style={{ perspective: '600px' }}
            onClick={() => flip(idx)}
          >
            <div
              className="relative w-full h-full transition-transform duration-[450ms]"
              style={{
                transformStyle: 'preserve-3d',
                transform: card.revealed || card.done ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Back */}
              <div
                className="absolute inset-0 rounded-lg border border-border flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  background: '#12121a',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,.5)',
                }}
              >
                <span className="text-2xl opacity-30 font-bold text-muted-foreground">BCM</span>
              </div>
              {/* Face */}
              <div
                className="absolute inset-0 rounded-lg border flex flex-col items-center justify-center gap-1"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: card.bg,
                  borderColor: `color-mix(in srgb, ${COLOR} 30%, transparent)`,
                  boxShadow: card.done ? `0 0 16px -4px ${COLOR}` : 'none',
                  filter: card.done ? `drop-shadow(0 0 8px ${COLOR})` : 'none',
                }}
              >
                {card.type === 'img' ? (
                  <img src={card.src} alt={card.label} className="w-[65%] h-[65%] object-contain" />
                ) : (
                  <div className="text-[clamp(22px,5vw,36px)] leading-none">{card.char}</div>
                )}
                <div className="font-mono text-[9px] tracking-wider" style={{ color: COLOR }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <ActionButton label="▶ Nouvelle partie" primary color={COLOR} onClick={newGame} />
      </div>
    </div>
  );
}
