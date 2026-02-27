import { useParams } from 'react-router-dom';
import { bots, getBotGradient, getBotColor, type BotId } from '@/data/bots';
import { qaTests } from '@/data/qa-tests';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';

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

  if (!bot) return <div className="p-8 text-center text-muted-foreground">Bot introuvable</div>;

  const categories = qaTests[bot.id];
  const stats = getBotStats(bot.id);
  const completed = stats.ok + stats.partial + stats.fail;
  const pct = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0;

  const toggleCat = (id: string) => {
    setExpandedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSummary = (key: string) => {
    setSummaryOpen(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const saveNotes = () => {
    localStorage.setItem(`bcm-notes-${botId}`, JSON.stringify(notes));
    saveResults();
  };

  const allTests = categories.flatMap(c => c.tests);
  const okTests = allTests.filter(t => testResults[t.id] === 'ok');
  const partialTests = allTests.filter(t => testResults[t.id] === 'partial');
  const failTests = allTests.filter(t => testResults[t.id] === 'fail');

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
          <span key={tag} className="text-[10px] tracking-wider px-2 py-1 rounded-full border border-white/10 bg-card/50 text-muted-foreground">{tag}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="glass p-4 mb-8">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-muted-foreground">{completed}/{stats.total} tests complétés</span>
          <span className="font-bold">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
          <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", getBotGradient(bot.id))} style={{ width: `${pct}%` }} />
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
            <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
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
                    <div key={test.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">{test.title}</div>
                          <code className={cn("cmd-tag text-xs", getBotColor(bot.id))}>$ {test.command}</code>
                          <div className="text-xs text-muted-foreground mt-1">→ 🟩 {test.expected}</div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setTestResult(test.id, result === 'ok' ? null : 'ok')}
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all",
                              result === 'ok' ? "bg-cash/20 text-cash ring-1 ring-cash/50" : "bg-secondary/50 text-muted-foreground hover:bg-cash/10")}>
                            ✅
                          </button>
                          <button onClick={() => setTestResult(test.id, result === 'partial' ? null : 'partial')}
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all",
                              result === 'partial' ? "bg-mag-2/20 text-mag-2 ring-1 ring-mag-2/50" : "bg-secondary/50 text-muted-foreground hover:bg-mag-2/10")}>
                            ~
                          </button>
                          <button onClick={() => setTestResult(test.id, result === 'fail' ? null : 'fail')}
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all",
                              result === 'fail' ? "bg-destructive/20 text-destructive ring-1 ring-destructive/50" : "bg-secondary/50 text-muted-foreground hover:bg-destructive/10")}>
                            ❌
                          </button>
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
          { key: 'ok', label: '✅ Tests réussis', tests: okTests, color: 'text-cash border-cash/30' },
          { key: 'partial', label: '~ Tests partiels', tests: partialTests, color: 'text-mag-2 border-mag-2/30' },
          { key: 'fail', label: '❌ Tests échoués', tests: failTests, color: 'text-destructive border-destructive/30' },
        ].map(({ key, label, tests, color }) => (
          <div key={key} className={cn("glass border-l-4", color.split(' ')[1])}>
            <button onClick={() => toggleSummary(key)} className="w-full flex items-center justify-between p-4">
              <span className={cn("text-sm font-medium", color.split(' ')[0])}>{label} ({tests.length})</span>
              {summaryOpen.has(key) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {summaryOpen.has(key) && tests.length > 0 && (
              <div className="px-4 pb-4 space-y-1">
                {tests.map(t => <div key={t.id} className="text-xs text-foreground/70">• {t.title}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
