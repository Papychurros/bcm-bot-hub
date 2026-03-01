import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bots, botList, getBotGradient } from '@/data/bots';
import BotLogo from '@/components/BotLogo';
import { cn } from '@/lib/utils';

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1 + Math.random() * 1.5,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 15,
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
          filter: `blur(${0.5 + Math.random() * 0.5}px)`,
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

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bob/5 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cash/5 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />

      <div className="animate-fade-in-up opacity-0 stagger-1 relative z-10 mb-2">
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground font-medium text-center">Bienvenue</p>
      </div>

      <div className="text-center mb-12 animate-fade-in-up opacity-0 stagger-2 relative z-10">
        <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-4 leading-tight">
          Guide d'utilisation des<br />
          <span className="bg-gradient-to-r from-[hsl(330,81%,60%)] to-[hsl(262,83%,58%)] bg-clip-text text-transparent">
            Bots Télégram
          </span>
        </h1>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground font-medium">
          Sélectionnez un bot pour commencer
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-4xl w-full relative z-10 justify-center animate-fade-in-up opacity-0 stagger-3">
        {botList.map((id) => {
          const bot = bots[id];
          const styleMap: Record<string, string> = {
            bob: 'bg-[hsl(262,40%,18%)] border border-[hsl(262,83%,58%,0.4)] shadow-[0_0_18px_-4px_hsl(262,83%,58%,0.5),inset_0_0_30px_-10px_hsl(262,83%,58%,0.12)]',
            cash: 'bg-[hsl(160,40%,14%)] border border-[hsl(160,84%,39%,0.4)] shadow-[0_0_18px_-4px_hsl(160,84%,39%,0.5),inset_0_0_30px_-10px_hsl(160,84%,39%,0.12)]',
            mag: 'bg-[hsl(220,40%,14%)] border border-[hsl(25,90%,55%,0.4)] shadow-[0_0_18px_-4px_hsl(25,90%,55%,0.5),inset_0_0_30px_-10px_hsl(25,90%,55%,0.12)]',
          };
          return (
            <button key={id} onClick={() => handleBotClick(id)}
              className="flex flex-col items-center gap-3 cursor-pointer group transition-transform duration-300 hover:scale-105">
              <div className={cn("w-28 h-28 md:w-32 md:h-32 rounded-[22px] flex items-center justify-center transition-shadow duration-300", styleMap[id])}>
                <BotLogo botId={id} size="xl" className="transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h2 className={cn("text-base font-display font-bold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>
                {bot.name}
              </h2>
              <p className="text-[11px] text-muted-foreground -mt-2">{bot.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-12 blink-hint text-xs text-muted-foreground tracking-widest relative z-10 animate-fade-in-up opacity-0 stagger-4">
        ▼ Cliquez pour explorer ▼
      </div>

      <footer className="mt-8 text-xs text-muted-foreground/50 animate-fade-in-up opacity-0 stagger-5 relative z-10">
        Fait par Alexandre Bertoneche
      </footer>
    </div>
  );
}
