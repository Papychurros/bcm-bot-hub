import { Link } from 'react-router-dom';
import { bots, botList, getBotGradient } from '@/data/bots';
import { cn } from '@/lib/utils';

export default function GuideHome() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bob/5 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cash/5 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />

      <div className="text-center mb-12 animate-fade-in-up relative z-10" style={{ animationDelay: '0.1s', opacity: 0 }}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full relative z-10">
        {botList.map((id, i) => {
          const bot = bots[id];
          return (
            <Link key={id} to={`/guide/${id}`}
              className="animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s`, opacity: 0 }}>
              <div className={cn("glass-hover p-8 text-center group cursor-pointer", `hover:${bot.id === 'bob' ? 'glow-bob' : bot.id === 'cash' ? 'glow-cash' : 'glow-mag'}`)}>
                <div className={cn("w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl bg-gradient-to-br", getBotGradient(id), "opacity-90 group-hover:opacity-100 transition-opacity shadow-lg")}>
                  {bot.emoji}
                </div>
                <h2 className={cn("text-2xl font-display font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>
                  {bot.name}
                </h2>
                <p className="text-sm text-muted-foreground">{bot.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-16 text-xs text-muted-foreground/50 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
        Fait par Alexandre Bertoneche
      </footer>
    </div>
  );
}
