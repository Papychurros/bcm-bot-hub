import { useParams } from 'react-router-dom';
import { bots, getBotGradient, getBotColor, type BotId } from '@/data/bots';
import { qaTests } from '@/data/qa-tests';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function QABotPage() {
  const { botId } = useParams<{ botId: string }>();
  const bot = bots[botId as BotId];
  const { testResults, setTestResult, getBotStats, saveResults } = useApp();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(qaTests[botId as BotId]?.map(c => c.id) || []));
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try { const s = localStorage.getItem(`bcm-notes-${botId}`); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [showNotes, setShowNotes] = useState<Set<string>>(new Set());
  const [summaryOpen, setSummaryOpen] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!bot) return <div className="p-8 text-center text-muted-foreground">Bot introuvable</div>;

  const categories = qaTests[bot.id];
  const stats = getBotStats(bot.id);
  const completed = stats.ok + stats.partial + stats.fail;
  const pct = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0;

  const okPct = stats.total > 0 ? (stats.ok / stats.total) * 100 : 0;
  const partPct = stats.total > 0 ? (stats.partial / stats.total) * 100 : 0;
  const failPct = stats.total > 0 ? (stats.fail / stats.total) * 100 : 0;

  const toggleCat = (id: string) => {
    setExpandedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSummary = (key: string) => {
    setSummaryOpen(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };
  const saveNotes = () => {
    localStorage.setItem(`bcm-notes-${botId}`, JSON.stringify(notes));
    saveResults();
    const now = new Date().toLocaleString('fr-FR');
    localStorage.setItem('bcm-last-save', now);
    toast.success('Progression sauvegardée');
  };
  const copyCmd = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    toast.success('Commande copiée');
    setTimeout(() => setCopiedId(null), 1000);
  };

  const allTests = categories.flatMap(c => c.tests);
  const okTests = allTests.filter(t => testResults[t.id] === 'ok');
  const partialTests = allTests.filter(t => testResults[t.id] === 'partial');
  const failTests = allTests.filter(t => testResults[t.id] === 'fail');

  const getStatusBorder = (testId: string) => {
    const r = testResults[testId];
    if (r === 'ok') return 'border-l-cash';
    if (r === 'partial') return 'border-l-mag-2';
    if (r === 'fail') return 'border-l-destructive';
    return 'border-l-transparent';
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br shrink-0", getBotGradient(bot.id))}>
          {bot.emoji}
        </div>
        <div>
          <h1 className={cn("text-3xl font-display font-extrabold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(bot.id))}>
            {bot.name}
          </h1>
          <span className="text-xs font-mono text-muted-foreground">{bot.version}</span>
        </div>
        <div className="flex-1" />
        <button onClick={saveNotes} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bob-end text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
          <Save className="w-3.5 h-3.5" /> Sauvegarder
        </button>
      </div>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {bot.techTags.map(tag => (
          <span key={tag} className="text-[10px] tracking-wider px-2 py-1 rounded-full border border-border bg-card/50 text-muted-foreground">{tag}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="glass p-4 mb-8">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-muted-foreground">{completed}/{stats.total} tests complétés</span>
          <span className="font-bold">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3 flex">
          {okPct > 0 && <div className="h-full bg-cash transition-all duration-500" style={{ width: `${okPct}%` }} />}
          {partPct > 0 && <div className="h-full bg-mag-2 transition-all duration-500" style={{ width: `${partPct}%` }} />}
          {failPct > 0 && <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${failPct}%` }} />}
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-cash">✅ {stats.ok} Réussis</span>
          <span className="text-mag-2">~ {stats.partial} Partiels</span>
          <span className="text-destructive">❌ {stats.fail} Échoués</span>
        </div>
      </div>

      {/* Test categories */}
      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="glass overflow-hidden">
            <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(bot.id))}>{cat.id}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{cat.tests.length} tests</span>
                {expandedCats.has(cat.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
            {expandedCats.has(cat.id) && (
              <div className="border-t border-border/50 divide-y divide-border/30">
                {cat.tests.map(test => {
                  const result = testResults[test.id] || null;
                  return (
                    <div key={test.id} className={cn(
                      "p-4 border-l-[3px] transition-all",
                      getStatusBorder(test.id),
                      result === 'ok' && "opacity-65"
                    )}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">{test.title}</div>
                          <button onClick={() => copyCmd(test.id, test.command)}
                            className={cn("cmd-tag text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5",
                              copiedId === test.id ? "text-cash" : getBotColor(bot.id))}>
                            $ {test.command}
                            <Copy className="w-3 h-3 opacity-40" />
                          </button>
                          <div className="text-xs text-muted-foreground mt-1">→ 🟩 {test.expected}</div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {(['ok', 'partial', 'fail'] as const).map(status => {
                            const active = result === status;
                            const colors = {
                              ok: active ? 'bg-cash text-card border-cash' : 'border-cash/40 text-cash/60 hover:bg-cash/10',
                              partial: active ? 'bg-mag-2 text-card border-mag-2' : 'border-mag-2/40 text-mag-2/60 hover:bg-mag-2/10',
                              fail: active ? 'bg-destructive text-card border-destructive' : 'border-destructive/40 text-destructive/60 hover:bg-destructive/10',
                            };
                            const labels = { ok: '✓', partial: '~', fail: '✗' };
                            return (
                              <button key={status}
                                onClick={() => setTestResult(test.id, result === status ? null : status)}
                                className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all", colors[status])}>
                                {labels[status]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button onClick={() => setShowNotes(prev => { const n = new Set(prev); n.has(test.id) ? n.delete(test.id) : n.add(test.id); return n; })}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {showNotes.has(test.id) ? '— masquer note' : '+ note'}
                      </button>
                      {showNotes.has(test.id) && (
                        <textarea value={notes[test.id] || ''} onChange={e => setNotes(prev => ({ ...prev, [test.id]: e.target.value }))}
                          placeholder="Ajouter une note..."
                          className="mt-2 w-full bg-secondary/30 rounded-lg p-2 text-xs text-foreground/80 placeholder:text-muted-foreground/50 border border-border/50 resize-none focus:outline-none focus:ring-1 focus:ring-ring" rows={2} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary sections */}
      <div className="mt-8 space-y-3">
        {[
          { key: 'ok', label: '✅ Tests réussis', tests: okTests, borderColor: 'border-l-cash', textColor: 'text-cash' },
          { key: 'partial', label: '~ Tests partiels', tests: partialTests, borderColor: 'border-l-mag-2', textColor: 'text-mag-2' },
          { key: 'fail', label: '❌ Tests échoués', tests: failTests, borderColor: 'border-l-destructive', textColor: 'text-destructive' },
        ].map(({ key, label, tests, borderColor, textColor }) => (
          <div key={key} className={cn("glass border-l-4", borderColor)}>
            <button onClick={() => toggleSummary(key)} className="w-full flex items-center justify-between p-4">
              <span className={cn("text-sm font-medium", textColor)}>{label} ({tests.length})</span>
              {summaryOpen.has(key) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {summaryOpen.has(key) && tests.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {tests.map(t => {
                  const cat = categories.find(c => c.tests.some(tt => tt.id === t.id));
                  return (
                    <div key={t.id} className="text-xs p-2 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2 mb-0.5">
                        {cat && <span className="text-[10px] text-muted-foreground font-mono">{cat.id}</span>}
                        <span className="font-medium text-foreground">{t.title}</span>
                      </div>
                      <div className="text-muted-foreground font-mono text-[10px]">$ {t.command}</div>
                      {notes[t.id] && <div className="text-[10px] text-muted-foreground mt-1 italic">📝 {notes[t.id]}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
