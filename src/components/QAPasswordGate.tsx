import React, { useState, useCallback, useRef } from 'react';
import { Lock, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

const QA_PASSWORD = '1409';
const QA_AUTH_KEY = 'bcm-qa-auth';

const EASTER_EGGS_3: Record<string, { src: string; text?: string }> = {
  '777': { src: '/Casino.gif', text: '🎰 Jackpot !' },
  '666': { src: '/Diablo custom.gif', text: '👹 Enfer !' },
  '420': { src: '/Snoop.gif', text: '💨 Chill...' },
  '404': { src: '/404.gif', text: 'Not Found' },
  '000': { src: '/Chiken.gif', text: '🐔 Poulet !' },
  '123': { src: '/rizz-monkey-flirty-usagif.gif', text: 'Vraiment ?' },
  '321': { src: '/rizz-monkey-flirty-usagif.gif', text: 'Vraiment ?' },
  '159': { src: '/Coolmonkey.gif', text: '🐒 Cool !' },
  '357': { src: '/Jazzdog.gif', text: '🎷 Jazz !' },
  '456': { src: '/thank.gif', text: '🙏 Merci !' },
  '789': { src: '/Pinguin.gif', text: '🐧 Pingouin !' },
  '147': { src: '/angry.gif', text: '😡 Grrr !' },
  '258': { src: '/Hellow.gif', text: '👋 Hello !' },
  '369': { src: '/Simpson.gif', text: '🍩 D\'oh !' },
};

const EASTER_EGGS_4: Record<string, { src: string; text?: string }> = {
  '1974': { src: '/RastaMerlin.gif', text: '🧙 Rasta Merlin !' },
  '1999': { src: '/Love.gif', text: '❤️ Love !' },
};

export function useQAAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const login = () => { setAuthenticated(true); };
  const logout = () => { setAuthenticated(false); };
  return { authenticated, login, logout };
}

export default function QAPasswordGate({ children }: { children: React.ReactNode }) {
  const { authenticated, login } = useQAAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [overlay, setOverlay] = useState<{ src: string; text?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetCode = useCallback(() => {
    setCode('');
    setError(false);
  }, []);

  const triggerOverlay = useCallback((egg: typeof overlay) => {
    setOverlay(egg);
    setDisabled(true);
    inputRef.current?.blur();
    setTimeout(() => {
      setOverlay(null);
      setDisabled(false);
      resetCode();
    }, 5000);
  }, [resetCode]);

  const handleDigit = useCallback((digit: string) => {
    if (disabled) return;
    setError(false);

    const next = code + digit;
    setCode(next);

    // Check 3-digit easter eggs
    if (next.length === 3 && EASTER_EGGS_3[next]) {
      triggerOverlay(EASTER_EGGS_3[next]);
      return;
    }

    // At 4 digits, validate password
    if (next.length === 4) {
      if (next === QA_PASSWORD) {
        login();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => resetCode(), 1500);
      }
    }
  }, [code, disabled, login, triggerOverlay, resetCode]);

  const handleDelete = useCallback(() => {
    if (disabled) return;
    setError(false);
    setCode(prev => prev.slice(0, -1));
  }, [disabled]);

  if (authenticated) return <>{children}</>;

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className={cn("glass p-8 w-full max-w-xs text-center", shake && "animate-shake")}>
        <div className="w-14 h-14 rounded-2xl bg-bob/10 border border-bob/30 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-bob" />
        </div>
        <h2 className="text-xl font-display font-extrabold uppercase mb-1">Développeur</h2>
        <p className="text-xs text-muted-foreground mb-6">Accès restreint</p>

        {/* Hidden readonly input for accessibility */}
        <input ref={inputRef} type="password" value={code} readOnly className="sr-only" tabIndex={-1} />

        {/* Dots display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-150",
                i < code.length
                  ? error ? "bg-destructive border-destructive" : "bg-bob border-bob"
                  : "border-muted-foreground/40 bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive font-medium mb-4 animate-fade-in">Incorrect ❌</p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2">
          {keys.map((key, i) => {
            if (key === '') return <div key={i} />;
            if (key === 'del') {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  disabled={disabled || code.length === 0}
                  className="h-14 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors disabled:opacity-30"
                >
                  <Delete className="w-5 h-5" />
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleDigit(key)}
                disabled={disabled || code.length >= 4}
                className="h-14 rounded-xl bg-secondary/50 border border-border/50 font-mono text-lg font-semibold text-foreground hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-30"
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center overlay (all easter eggs same format) */}
      {overlay && (
        <div className="rizz-overlay">
          <img src={overlay.src} alt="" className="rizz-gif" />
          {overlay.text && <p className="rizz-text">{overlay.text}</p>}
        </div>
      )}
    </div>
  );
}
