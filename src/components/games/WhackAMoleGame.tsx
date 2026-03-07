import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ActionButton } from './TouchControls';

const COLOR = '#ef4444';
const HOLES = 9;
const GAME_TIME = 30;

const DIFFS: Record<string, { upTime: [number, number]; interval: number; maxUp: number; pts: number }> = {
  facile: { upTime: [1800, 2400], interval: 900, maxUp: 2, pts: 10 },
  normal: { upTime: [1200, 1800], interval: 650, maxUp: 3, pts: 15 },
  hard: { upTime: [700, 1200], interval: 450, maxUp: 4, pts: 20 },
};

type GameState = 'idle' | 'playing' | 'ended';

export default function WhackAMoleGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [diff, setDiff] = useState('facile');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [moles, setMoles] = useState<boolean[]>(Array(HOLES).fill(false));
  const [whacked, setWhacked] = useState<number[]>([]);
  const [comboText, setComboText] = useState('');

  const scoreRef = useRef(0);
  const comboRef = useRef(1);
  const lastHitRef = useRef(0);
  const molesRef = useRef<boolean[]>(Array(HOLES).fill(false));
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const spawnRef = useRef<ReturnType<typeof setInterval>>();
  const runningRef = useRef(false);

  const cleanup = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(spawnRef.current);
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    runningRef.current = false;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const goDown = useCallback((idx: number, wasWhacked: boolean) => {
    molesRef.current[idx] = false;
    if (wasWhacked) {
      setWhacked(prev => [...prev, idx]);
      setTimeout(() => setWhacked(prev => prev.filter(i => i !== idx)), 200);
    }
    setMoles([...molesRef.current]);
  }, []);

  const popUp = useCallback((idx: number) => {
    const cfg = DIFFS[diff];
    if (molesRef.current[idx]) return;
    molesRef.current[idx] = true;
    setMoles([...molesRef.current]);
    const dur = cfg.upTime[0] + Math.random() * (cfg.upTime[1] - cfg.upTime[0]);
    const t = setTimeout(() => goDown(idx, false), dur);
    timersRef.current.push(t);
  }, [diff, goDown]);

  const spawn = useCallback(() => {
    if (!runningRef.current) return;
    const cfg = DIFFS[diff];
    const upCount = molesRef.current.filter(Boolean).length;
    if (upCount >= cfg.maxUp) return;
    const available = molesRef.current.map((m, i) => m ? null : i).filter(i => i !== null) as number[];
    if (available.length === 0) return;
    popUp(available[Math.floor(Math.random() * available.length)]);
  }, [diff, popUp]);

  const whack = useCallback((idx: number) => {
    if (!runningRef.current || !molesRef.current[idx]) return;
    const now = Date.now();
    const cfg = DIFFS[diff];
    let c = comboRef.current;
    if (now - lastHitRef.current < 1500) c = Math.min(c + 1, 8);
    else c = 1;
    comboRef.current = c;
    lastHitRef.current = now;

    const pts = cfg.pts * c;
    scoreRef.current += pts;
    setScore(scoreRef.current);
    setCombo(c);
    setComboText(c > 1 ? `${c}x COMBO ! +${pts}` : `+${pts}`);
    setTimeout(() => setComboText(''), 600);

    goDown(idx, true);
  }, [diff, goDown]);

  const startGame = useCallback(() => {
    cleanup();
    scoreRef.current = 0; comboRef.current = 1; lastHitRef.current = 0;
    molesRef.current = Array(HOLES).fill(false);
    setScore(0); setCombo(1); setTimeLeft(GAME_TIME); setMoles(Array(HOLES).fill(false));
    setGameState('playing');
    runningRef.current = true;

    const cfg = DIFFS[diff];
    let tl = GAME_TIME;
    intervalRef.current = setInterval(() => {
      tl -= 0.1;
      setTimeLeft(Math.max(0, tl));
      if (tl <= 0) {
        cleanup();
        molesRef.current = Array(HOLES).fill(false);
        setMoles(Array(HOLES).fill(false));
        setGameState('ended');
        setBest(prev => Math.max(prev, scoreRef.current));
      }
    }, 100);

    spawnRef.current = setInterval(spawn, cfg.interval);
    spawn();
  }, [diff, spawn, cleanup]);

  const drawMole = (idx: number, isWhacked: boolean) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();
    return (
      <canvas
        ref={(canvas) => {
          if (!canvas) return;
          const ct = canvas.getContext('2d');
          if (!ct) return;
          ct.clearRect(0, 0, 80, 80);
          const C = isWhacked ? '#fde68a' : '#ef4444';
          ct.fillStyle = C; ct.shadowColor = C; ct.shadowBlur = 10;
          ct.beginPath(); ct.ellipse(40, 58, 28, 22, 0, 0, Math.PI * 2); ct.fill();
          ct.beginPath(); ct.ellipse(40, 36, 22, 20, 0, 0, Math.PI * 2); ct.fill();
          ct.beginPath(); ct.ellipse(22, 24, 8, 10, -0.3, 0, Math.PI * 2); ct.fill();
          ct.beginPath(); ct.ellipse(58, 24, 8, 10, 0.3, 0, Math.PI * 2); ct.fill();
          ct.shadowBlur = 0;
          if (isWhacked) {
            ct.fillStyle = '#fde68a'; ct.font = '14px serif'; ct.textAlign = 'center'; ct.textBaseline = 'middle';
            ct.fillText('★', 20, 15); ct.fillText('★', 60, 12);
            ct.strokeStyle = '#0f0f1a'; ct.lineWidth = 2.5;
            [[30, 30], [50, 30]].forEach(([x, y]) => {
              ct.beginPath(); ct.moveTo(x - 4, y - 4); ct.lineTo(x + 4, y + 4); ct.stroke();
              ct.beginPath(); ct.moveTo(x + 4, y - 4); ct.lineTo(x - 4, y + 4); ct.stroke();
            });
          } else {
            ct.fillStyle = '#0f0f1a';
            ct.beginPath(); ct.ellipse(30, 32, 5, 5, 0, 0, Math.PI * 2); ct.fill();
            ct.beginPath(); ct.ellipse(50, 32, 5, 5, 0, 0, Math.PI * 2); ct.fill();
            ct.fillStyle = '#fff';
            ct.beginPath(); ct.arc(32, 30, 2, 0, Math.PI * 2); ct.fill();
            ct.beginPath(); ct.arc(52, 30, 2, 0, Math.PI * 2); ct.fill();
            ct.fillStyle = '#7f1d1d';
            ct.beginPath(); ct.ellipse(40, 40, 5, 4, 0, 0, Math.PI * 2); ct.fill();
            ct.strokeStyle = '#7f1d1d'; ct.lineWidth = 1.5;
            ct.beginPath(); ct.moveTo(20, 42); ct.lineTo(35, 41); ct.stroke();
            ct.beginPath(); ct.moveTo(45, 41); ct.lineTo(60, 42); ct.stroke();
            ct.fillStyle = '#fff'; ct.fillRect(34, 47, 6, 6); ct.fillRect(41, 47, 6, 6);
          }
        }}
        width={80}
        height={80}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[72%] pointer-events-none select-none transition-[bottom] ${moles[idx] ? 'bottom-0' : '-bottom-full'} ${isWhacked ? 'duration-75' : 'duration-150'}`}
        style={{ transitionTimingFunction: moles[idx] && !isWhacked ? 'cubic-bezier(0.34,1.56,0.64,1)' : 'ease-in' }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* HUD */}
      <div className="flex justify-between w-full max-w-[360px] font-mono text-[11px]" style={{ color: COLOR }}>
        <span>SCORE: {score}</span>
        <span>COMBO: x{combo}</span>
        <span>BEST: {best}</span>
      </div>

      {/* Timer bar */}
      <div className="w-full max-w-[360px] h-2 rounded-full overflow-hidden border" style={{ borderColor: `${COLOR}30`, background: `${COLOR}10` }}>
        <div className="h-full rounded-full transition-all duration-100" style={{
          width: `${(timeLeft / GAME_TIME) * 100}%`,
          background: timeLeft <= 5 ? '#fde68a' : COLOR,
          boxShadow: `0 0 8px ${timeLeft <= 5 ? '#fde68a' : COLOR}`,
        }} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[360px] p-2 rounded-xl border-2" style={{ borderColor: `${COLOR}33`, background: `${COLOR}06` }}>
        {Array.from({ length: HOLES }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-xl relative overflow-hidden cursor-pointer transition-[border-color] ${whacked.includes(i) ? 'border-[#ef4444] shadow-[0_0_16px_rgba(239,68,68,0.6)]' : ''}`}
            style={{ background: '#0a0a14', border: `2px solid ${COLOR}33` }}
            onClick={() => whack(i)}
            onTouchStart={(e) => { e.preventDefault(); whack(i); }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-[40%]" style={{ background: `radial-gradient(ellipse at center bottom, ${COLOR}26 0%, transparent 70%)` }} />
            {(moles[i] || whacked.includes(i)) && drawMole(i, whacked.includes(i))}
          </div>
        ))}
      </div>

      {/* Combo display */}
      <div className="font-mono text-[11px] min-h-[20px]" style={{ color: '#fde68a', textShadow: '0 0 10px #fde68a' }}>{comboText}</div>

      {/* Difficulty + buttons */}
      {(gameState === 'idle' || gameState === 'ended') && (
        <div className="flex gap-2">
          {(['facile', 'normal', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className="px-3 py-1.5 rounded font-mono text-[10px] border cursor-pointer transition-all"
              style={{
                background: diff === d ? COLOR : 'transparent',
                color: diff === d ? '#0f0f1a' : COLOR,
                borderColor: COLOR,
              }}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={startGame} />
        {gameState !== 'idle' && <ActionButton label="⟳ Restart" color={COLOR} onClick={startGame} />}
      </div>

      {gameState === 'ended' && (
        <div className="font-mono text-center">
          <div className="text-lg font-bold" style={{ color: COLOR }}>TEMPS ÉCOULÉ !</div>
          <div className="text-2xl font-extrabold" style={{ color: COLOR }}>{score}</div>
          <div className="text-[11px] text-muted-foreground">BEST: {best} • {diff.toUpperCase()}</div>
        </div>
      )}
    </div>
  );
}
