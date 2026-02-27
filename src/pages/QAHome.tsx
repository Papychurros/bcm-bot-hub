import { Link } from 'react-router-dom';
import { bots, botList, getBotGradient } from '@/data/bots';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Save } from 'lucide-react';

export default function QAHome() {
  const { getGlobalStats, getBotStats, saveResults } = useApp();
  const global = getGlobalStats();
  const completed = global.ok + global.partial + global.fail;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center gap-3 mb-4">
          {botList.map(id => (
            <span key={id} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br", getBotGradient(id))}>
              {bots[id].emoji}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-2 bg-gradient-to-r from-bob via-mag-2 to-cash bg-clip-text text-transparent">
          B.C.M
        </h1>
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Batterie de tests — Suivi qualité</p>
      </div>

      {/* Save button */}
      <div className="flex justify-end mb-6">
        <button onClick={saveResults} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bob-end text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Sauvegarder
        </button>
      </div>

      {/* Global progress */}
      <div className="glass p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold">Progression globale</span>
          <span className="text-2xl font-display font-extrabold">{global.total} <span className="text-sm text-muted-foreground font-normal">tests</span></span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gradient-to-r from-cash to-cash-end transition-all duration-500"
            style={{ width: `${global.total > 0 ? (completed / global.total) * 100 : 0}%` }} />
        </div>
        <div className="flex gap-6 justify-center text-sm">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cash" /> <span className="font-bold">{global.ok}</span> <span className="text-muted-foreground">Réussis</span></span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-mag-2" /> <span className="font-bold">{global.partial}</span> <span className="text-muted-foreground">Partiels</span></span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> <span className="font-bold">{global.fail}</span> <span className="text-muted-foreground">Échoués</span></span>
        </div>
      </div>

      {/* Bot cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {botList.map(id => {
          const bot = bots[id];
          const stats = getBotStats(id);
          const completed = stats.ok + stats.partial + stats.fail;
          const pct = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0;
          return (
            <Link key={id} to={`/qa/${id}`} className="glass-hover p-5 group">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br", getBotGradient(id))}>
                  {bot.emoji}
                </div>
                <div>
                  <div className={cn("font-display font-bold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>{bot.name}</div>
                  <div className="text-[10px] text-muted-foreground">{bot.subtitle}</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
                <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", getBotGradient(id))} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{completed}/{stats.total} complétés</span>
                <span className="font-bold">{pct}%</span>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-cash">✅ {stats.ok}</span>
                <span className="text-mag-2">~ {stats.partial}</span>
                <span className="text-destructive">❌ {stats.fail}</span>
              </div>
              <div className={cn("mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>
                Ouvrir les tests →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
