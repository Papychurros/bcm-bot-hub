import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const QA_PASSWORD = '1409';
const QA_AUTH_KEY = 'bcm-qa-auth';

export function useQAAuth() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(QA_AUTH_KEY) === 'true');

  const login = () => {
    sessionStorage.setItem(QA_AUTH_KEY, 'true');
    setAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(QA_AUTH_KEY);
    setAuthenticated(false);
  };

  return { authenticated, login, logout };
}

export default function QAPasswordGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { authenticated, login } = useQAAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [hellfire, setHellfire] = useState(false);
  const [rizz, setRizz] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerHellfire = useCallback(() => {
    setHellfire(true);
    setInputDisabled(true);
    inputRef.current?.blur();
    setTimeout(() => {
      setHellfire(false);
      setInputDisabled(false);
      setPassword('');
    }, 5000);
  }, []);

  const triggerRizz = useCallback(() => {
    setRizz(true);
    setTimeout(() => {
      setRizz(false);
      setPassword('');
    }, 5000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setError(false);
    if (val === '666' && !hellfire) {
      triggerHellfire();
    }
    if ((val === '123' || val === '321') && !rizz) {
      triggerRizz();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === QA_PASSWORD) {
      login();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => navigate('/'), 1200);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className={cn(
        "glass p-8 w-full max-w-sm text-center",
        shake && "animate-shake"
      )}>
        <div className="w-14 h-14 rounded-2xl bg-bob/10 border border-bob/30 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-bob" />
        </div>
        <h2 className="text-xl font-display font-extrabold uppercase mb-1">Développeur</h2>
        <p className="text-xs text-muted-foreground mb-6">Accès restreint — entrez le mot de passe</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={handleChange}
            placeholder="Mot de passe"
            autoFocus
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-secondary/50 border text-center font-mono text-lg tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-bob/50 transition-colors",
              error ? "border-destructive text-destructive" : "border-border"
            )}
          />
          {error && (
            <p className="text-xs text-destructive animate-fade-in">Mot de passe incorrect — redirection...</p>
          )}
          <button
            type="submit"
            disabled={!password || error}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bob text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <FlaskConical className="w-4 h-4" /> Accéder
          </button>
        </form>
      </div>

      {hellfire && (
        <div className="hellfire-overlay">
          <img src="/fire-15.gif" alt="" className="hellfire-gif" />
        </div>
      )}

      {rizz && (
        <div className="rizz-overlay">
          <img src="/rizz-monkey-flirty-usagif.gif" alt="" className="rizz-gif" />
          <p className="rizz-text">Vraiment ?</p>
        </div>
      )}
    </div>
  );
}
