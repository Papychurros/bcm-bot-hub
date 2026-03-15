import { Link } from 'react-router-dom';
import { bots, botList, getBotGradient } from '@/data/bots';
import { useApp } from '@/contexts/AppContext';
import BotLogo from '@/components/BotLogo';
import { cn } from '@/lib/utils';
import { Save, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import EmojiCodesModal from '@/components/EmojiCodesModal';

export default function QAHome() {
  const { getGlobalStats, getBotStats, saveResults } = useApp();
  const global = getGlobalStats();
  const completed = global.ok + global.partial + global.fail;
  const [lastSave, setLastSave] = useState<string | null>(() => localStorage.getItem('bcm-last-save'));

  const handleSave = () => {
    saveResults();
    const now = new Date().toLocaleString('fr-FR');
    localStorage.setItem('bcm-last-save', now);
    setLastSave(now);
    toast.success('Progression sauvegardée');
  };

  const okPct = global.total > 0 ? (global.ok / global.total) * 100 : 0;
  const partialPct = global.total > 0 ? (global.partial / global.total) * 100 : 0;
  const failPct = global.total > 0 ? (global.fail / global.total) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center gap-3 mb-4">
          {botList.map(id => (
            <BotLogo key={id} botId={id} size="sm" className="w-14 h-14" />
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-2">
          <span className="text-bob">B</span>.<span className="text-cash">C</span>.<span className="text-mag-2">M</span>
        </h1>
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Batterie de tests — Suivi qualité</p>
      </div>

      {/* Save + last save */}
      <div className="flex items-center justify-between mb-6">
        {lastSave && <span className="text-[10px] text-muted-foreground">💾 Dernière sauvegarde : {lastSave}</span>}
        <div className="flex-1" />
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bob-end text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Sauvegarder
        </button>
      </div>

      {/* Global progress */}
      <div className="glass p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold">Progression globale</span>
          <span className="text-2xl font-display font-extrabold">{global.total} <span className="text-sm text-muted-foreground font-normal">tests</span></span>
        </div>
        {/* Segmented progress */}
        <div className="h-3 rounded-full bg-secondary overflow-hidden mb-4 flex">
          {okPct > 0 && <div className="h-full bg-cash transition-all duration-500" style={{ width: `${okPct}%` }} />}
          {partialPct > 0 && <div className="h-full bg-mag-2 transition-all duration-500" style={{ width: `${partialPct}%` }} />}
          {failPct > 0 && <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${failPct}%` }} />}
        </div>
        <div className="flex gap-6 justify-center text-sm">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cash" /> <span className="font-bold">{global.ok}</span> <span className="text-muted-foreground">Réussis</span></span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-mag-2" /> <span className="font-bold">{global.partial}</span> <span className="text-muted-foreground">Partiels</span></span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <span className="font-bold">{global.fail}</span> <span className="text-muted-foreground">Échoués</span></span>
        </div>
      </div>

      {/* Bot cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {botList.map(id => {
          const bot = bots[id];
          const stats = getBotStats(id);
          const completed = stats.ok + stats.partial + stats.fail;
          const pct = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0;
          const okW = stats.total > 0 ? (stats.ok / stats.total) * 100 : 0;
          const partW = stats.total > 0 ? (stats.partial / stats.total) * 100 : 0;
          const failW = stats.total > 0 ? (stats.fail / stats.total) * 100 : 0;
          return (
            <Link key={id} to={`/qa/${id}`} className="glass-hover overflow-hidden group">
              {/* Gradient top bar */}
              <div className={cn("h-1 bg-gradient-to-r", getBotGradient(id))} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <BotLogo botId={id} size="sm" />
                  <div>
                    <div className={cn("font-display font-bold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>{bot.name}</div>
                    <div className="text-[10px] text-muted-foreground">{bot.subtitle}</div>
                  </div>
                </div>
                {/* Segmented bar */}
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3 flex">
                  {okW > 0 && <div className="h-full bg-cash transition-all" style={{ width: `${okW}%` }} />}
                  {partW > 0 && <div className="h-full bg-mag-2 transition-all" style={{ width: `${partW}%` }} />}
                  {failW > 0 && <div className="h-full bg-destructive transition-all" style={{ width: `${failW}%` }} />}
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">{completed}/{stats.total} complétés</span>
                  <span className="font-bold">{pct}%</span>
                </div>
                {/* Mini stat boxes */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center py-1.5 rounded-lg bg-cash/10 border border-cash/20">
                    <div className="text-sm font-bold text-cash">{stats.ok}</div>
                    <div className="text-[9px] text-muted-foreground">OK</div>
                  </div>
                  <div className="text-center py-1.5 rounded-lg bg-mag-2/10 border border-mag-2/20">
                    <div className="text-sm font-bold text-mag-2">{stats.partial}</div>
                    <div className="text-[9px] text-muted-foreground">Partiel</div>
                  </div>
                  <div className="text-center py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="text-sm font-bold text-destructive">{stats.fail}</div>
                    <div className="text-[9px] text-muted-foreground">Échoué</div>
                  </div>
                </div>
                <div className={cn("text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(id))}>
                  Ouvrir les tests →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
