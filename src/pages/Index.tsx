import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bots, botList, getBotGradient } from '@/data/bots';
import { cn } from '@/lib/utils';

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      color: ['hsl(262,83%,58%)', 'hsl(160,84%,39%)', 'hsl(45,93%,58%)', 'hsl(330,81%,60%)'][Math.floor(Math.random() * 4)],
    })), []);

  return (
    <>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: `${p.left}%`, bottom: '-10px',
          width: p.size, height: p.size,
          backgroundColor: p.color,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          opacity: 0,
        }} />
      ))}
    </>
  );
}

export default function GuideHome() {
  const navigate = useNavigate();
  const [unlocking, setUnlocking] = useState(false);

  const handleBotClick = (id: string) => {
    setUnlocking(true);
    setTimeout(() => navigate(`/guide/${id}`), 500);
  };

  return (
    <div className={cn(
      "min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 relative overflow-hidden",
      unlocking && "unlock-out"
    )}>
      <Particles />

      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bob/5 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cash/5 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />

      {/* Bienvenue */}
      <div className="animate-fade-in-up opacity-0 stagger-1 relative z-10 mb-2">
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground font-medium text-center">Bienvenue</p>
      </div>

      <div className="text-center mb-12 animate-fade-in-up opacity-0 stagger-2 relative z-10">
        <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-4 leading-tight">
          Guide d'utilisation des{' '}
          <span className="bg-gradient-to-r from-bob via-mag-2 to-cash bg-clip-text text-transparent">
            Bots Telegram
          </span>
        </h1>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground font-medium">
          Sélectionnez un bot pour commencer
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-0 max-w-4xl w-full relative z-10 justify-center animate-fade-in-up opacity-0 stagger-3">
        {botList.map((id, i) => {
          const bot = bots[id];
          return (
            <div key={id} className="flex items-center">
              {i > 0 && (
                <div className="hidden md:block w-px h-24 bg-border/50 mx-6" />
              )}
              {i > 0 && (
                <div className="md:hidden h-px w-24 bg-border/50 my-4" />
              )}
              <button onClick={() => handleBotClick(id)}
                className="glass-hover p-8 text-center group cursor-pointer min-w-[200px] transition-all duration-300 hover:scale-[1.05]">
                <div className={cn(
                  "w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl bg-gradient-to-br shadow-lg transition-all duration-300",
                  getBotGradient(id),
                  `group-hover:shadow-2xl`
                )}>
                  {bot.emoji}
                </div>
                <h2 className={cn("text-2xl font-display font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>
                  {bot.name}
                </h2>
                <p className="text-sm text-muted-foreground">{bot.subtitle}</p>
              </button>
            </div>
          );
        })}
      </div>

      {/* Pulsing hint */}
      <div className="mt-12 blink-hint text-xs text-muted-foreground tracking-widest relative z-10 animate-fade-in-up opacity-0 stagger-4">
        ▼ Cliquez pour explorer ▼
      </div>

      <footer className="mt-8 text-xs text-muted-foreground/50 animate-fade-in-up opacity-0 stagger-5 relative z-10">
        Fait par Alexandre Bertoneche
      </footer>
    </div>
  );
}
