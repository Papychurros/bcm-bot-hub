import { useParams, Link } from 'react-router-dom';
import { bots, botList, getBotGradient, getBotColor, type BotId } from '@/data/bots';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function AnimatedStat({ value, label, botId, delay }: { value: string; label: string; botId: BotId; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={cn(
      "text-center glass p-4 transition-all duration-500",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
    )}>
      <div className={cn("text-3xl md:text-4xl font-display font-extrabold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(botId))}>{value}</div>
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const botGlowStyle: Record<BotId, React.CSSProperties> = {
  bob: { filter: 'drop-shadow(0 0 30px hsl(262 83% 58% / 0.4))' },
  cash: { filter: 'drop-shadow(0 0 30px hsl(160 84% 39% / 0.4))' },
  mag: { filter: 'drop-shadow(0 0 30px hsl(45 93% 58% / 0.3))' },
};

export default function BotHome() {
  const { botId } = useParams<{ botId: string }>();
  const bot = bots[botId as BotId];
  if (!bot) return <div className="p-8 text-center text-muted-foreground">Bot introuvable</div>;

  const otherBots = botList.filter(id => id !== bot.id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className={cn(
          "w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl animate-fade-in-up opacity-0 stagger-1",
          getBotGradient(bot.id)
        )}>
          {bot.emoji}
        </div>
        <h1
          className={cn("text-6xl md:text-8xl lg:text-[clamp(72px,10vw,108px)] font-display font-extrabold mb-3 bg-gradient-to-r bg-clip-text text-transparent animate-fade-in-up opacity-0 stagger-2", getBotGradient(bot.id))}
          style={botGlowStyle[bot.id]}
        >
          {bot.name}
        </h1>
        <div className="inline-block px-4 py-1 rounded-full border border-border bg-card/50 text-xs tracking-[0.15em] text-muted-foreground mb-4 animate-fade-in-up opacity-0 stagger-2">
          {bot.tagline}
        </div>
        <p className="text-sm text-muted-foreground font-mono animate-fade-in-up opacity-0 stagger-3">{bot.fullName} · {bot.version}</p>
        <p className="mt-4 text-foreground/80 leading-relaxed max-w-xl mx-auto text-sm animate-fade-in-up opacity-0 stagger-3">{bot.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-up opacity-0 stagger-4">
        {bot.stats.map((stat, i) => (
          <AnimatedStat key={stat.label} value={stat.value} label={stat.label} botId={bot.id} delay={200 + i * 150} />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground italic mb-12 animate-fade-in-up opacity-0 stagger-5">
        • Utilisez la navigation pour découvrir toutes les fonctionnalités •
      </p>

      {/* Suite Complète */}
      <div className="border-t border-border pt-8">
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground font-bold mb-6 text-center">SUITE COMPLÈTE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherBots.map(id => {
            const other = bots[id];
            return (
              <Link key={id} to={`/guide/${id}`} className="glass-hover p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shrink-0", getBotGradient(id))}>
                  {other.emoji}
                </div>
                <div>
                  <div className={cn("font-display font-bold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>
                    {other.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{other.subtitle}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
