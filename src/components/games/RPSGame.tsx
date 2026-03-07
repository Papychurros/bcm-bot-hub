import React, { useState, useCallback } from 'react';
import { ActionButton } from './TouchControls';

const COLOR = '#06b6d4';
const EMOJIS: Record<string, string> = { pierre: '✊', feuille: '🖐', ciseaux: '✌️' };
const CHOICES = ['pierre', 'feuille', 'ciseaux'];
const BEATS: Record<string, string> = { pierre: 'ciseaux', ciseaux: 'feuille', feuille: 'pierre' };

type GameState = 'idle' | 'playing' | 'ended';

export default function RPSGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [pScore, setPScore] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [round, setRound] = useState(0);
  const [playerHand, setPlayerHand] = useState('🤜');
  const [aiHand, setAiHand] = useState('🤜');
  const [result, setResult] = useState('— CHOISIS —');
  const [resultClass, setResultClass] = useState('');
  const [history, setHistory] = useState<{ player: string; ai: string; result: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const maxRounds = 5;

  const startGame = useCallback(() => {
    setPScore(0); setAScore(0); setRound(0);
    setPlayerHand('🤜'); setAiHand('🤜');
    setResult('— CHOISIS —'); setResultClass('');
    setHistory([]); setBusy(false);
    setGameState('playing');
  }, []);

  const play = useCallback((choice: string) => {
    if (busy || round >= maxRounds || gameState !== 'playing') return;
    setBusy(true);
    const newRound = round + 1;
    setRound(newRound);

    setPlayerHand('🤜'); setAiHand('🤜');
    setShaking(true);

    const aiChoice = history.length > 0 && Math.random() < 0.4
      ? CHOICES.find(c => BEATS[c] === history[history.length - 1].player)!
      : CHOICES[Math.floor(Math.random() * 3)];

    const res = choice === aiChoice ? 'draw' : BEATS[choice] === aiChoice ? 'win' : 'lose';

    setTimeout(() => {
      setShaking(false);
      setPlayerHand(EMOJIS[choice]);
      setAiHand(EMOJIS[aiChoice]);

      let newPScore = pScore, newAScore = aScore;
      if (res === 'win') {
        newPScore = pScore + 1; setPScore(newPScore);
        setResult('✅ TU GAGNES !'); setResultClass('win');
      } else if (res === 'lose') {
        newAScore = aScore + 1; setAScore(newAScore);
        setResult('❌ B.O.B GAGNE !'); setResultClass('lose');
      } else {
        setResult('🤝 ÉGALITÉ !'); setResultClass('draw');
      }

      const newHistory = [...history, { player: choice, ai: aiChoice, result: res }];
      setHistory(newHistory);

      if (newRound >= maxRounds || newPScore >= 3 || newAScore >= 3) {
        setTimeout(() => setGameState('ended'), 800);
      } else {
        setTimeout(() => setBusy(false), 600);
      }
    }, 600);
  }, [busy, round, gameState, history, pScore, aScore]);

  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 w-full font-mono">
        <div className="text-[40px]">✊🖐✌️</div>
        <div className="text-lg font-bold" style={{ color: COLOR }}>PIERRE FEUILLE CISEAUX</div>
        <div className="text-[11px] text-muted-foreground text-center">Premier à 3 victoires gagne<br/>5 manches par partie</div>
        <ActionButton label="▶ Jouer" primary color={COLOR} onClick={startGame} />
      </div>
    );
  }

  if (gameState === 'ended') {
    const title = pScore > aScore ? '🏆 VICTOIRE !' : aScore > pScore ? '💀 DÉFAITE !' : '🤝 MATCH NUL !';
    return (
      <div className="flex flex-col items-center gap-4 w-full font-mono">
        <div className="text-xl font-bold" style={{ color: COLOR }}>{title}</div>
        <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{pScore} — {aScore}</div>
        <div className="flex gap-2">
          {history.map((h, i) => (
            <div key={i} className="w-4 h-4 rounded-full" style={{
              background: h.result === 'win' ? COLOR : h.result === 'lose' ? '#ef4444' : '#555',
              boxShadow: `0 0 6px ${h.result === 'win' ? COLOR : h.result === 'lose' ? '#ef4444' : '#555'}`,
            }} />
          ))}
        </div>
        <ActionButton label="▶ Rejouer" primary color={COLOR} onClick={startGame} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full font-mono">
      {/* Scoreboard */}
      <div className="flex justify-between w-full max-w-[360px] rounded-lg p-3 border" style={{ borderColor: `${COLOR}4d`, background: `${COLOR}12` }}>
        <div className="text-center"><div className="text-[9px] text-muted-foreground">TOI</div><div className="text-xl font-bold" style={{ color: COLOR }}>{pScore}</div></div>
        <div className="text-center"><div className="text-[9px] text-muted-foreground">MANCHES</div><div className="text-xl font-bold text-foreground">{round}/{maxRounds}</div></div>
        <div className="text-center"><div className="text-[9px] text-muted-foreground">B.O.B</div><div className="text-xl font-bold text-destructive">{aScore}</div></div>
      </div>

      {/* Arena */}
      <div className="flex items-center justify-around w-full max-w-[360px] h-[160px] rounded-xl border-2" style={{ borderColor: `${COLOR}4d`, background: `${COLOR}06` }}>
        <div className="flex flex-col items-center gap-2">
          <div className={`text-[56px] leading-none ${shaking ? 'animate-bounce' : ''}`}>{playerHand}</div>
          <div className="text-[9px] text-muted-foreground">TOI</div>
        </div>
        <div className="text-sm font-bold" style={{ color: COLOR }}>VS</div>
        <div className="flex flex-col items-center gap-2" style={{ transform: 'scaleX(-1)' }}>
          <div className={`text-[56px] leading-none ${shaking ? 'animate-bounce' : ''}`}>{aiHand}</div>
          <div className="text-[9px] text-muted-foreground" style={{ transform: 'scaleX(-1)' }}>B.O.B</div>
        </div>
      </div>

      {/* Result */}
      <div className={`w-full max-w-[360px] text-center py-2 rounded-lg border font-bold text-sm ${resultClass === 'win' ? 'border-cyan-500 text-cyan-400' : resultClass === 'lose' ? 'border-red-500 text-red-400' : 'border-border text-muted-foreground'}`}>
        {result}
      </div>

      {/* Choices */}
      <div className="flex gap-3 w-full max-w-[360px]">
        {CHOICES.map(c => (
          <button key={c} onClick={() => play(c)}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 cursor-pointer transition-all active:scale-95"
            style={{ borderColor: `${COLOR}4d`, background: `${COLOR}0d` }}>
            <span className="text-3xl">{EMOJIS[c]}</span>
            <span className="text-[9px] uppercase" style={{ color: COLOR }}>{c}</span>
          </button>
        ))}
      </div>

      {/* History */}
      <div className="flex gap-2">
        {history.map((h, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-full" style={{
            background: h.result === 'win' ? COLOR : h.result === 'lose' ? '#ef4444' : '#555',
            boxShadow: `0 0 6px ${h.result === 'win' ? COLOR : h.result === 'lose' ? '#ef4444' : '#555'}`,
          }} />
        ))}
      </div>
    </div>
  );
}
