import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { bots, botList, getBotColor, type BotId } from '@/data/bots';
import { guideContent } from '@/data/guide-content';
import { cn } from '@/lib/utils';

interface SearchResult {
  botId: BotId;
  pageSlug: string;
  pageTitle: string;
  text: string;
  type: 'command' | 'page';
}

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];
  for (const botId of botList) {
    const pages = guideContent[botId];
    if (!pages) continue;
    for (const [slug, page] of Object.entries(pages)) {
      results.push({ botId, pageSlug: slug, pageTitle: page.title, text: page.title, type: 'page' });
      for (const section of page.sections) {
        if (section.type === 'commands') {
          for (const cmd of section.commands) {
            results.push({ botId, pageSlug: slug, pageTitle: page.title, text: cmd.cmd, type: 'command' });
          }
        }
      }
    }
  }
  return results;
}

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return index.filter(r => r.text.toLowerCase().includes(q)).slice(0, 12);
  }, [query, index]);

  useEffect(() => { setActiveIndex(0); }, [results]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (r: SearchResult) => {
    navigate(`/guide/${r.botId}/${r.pageSlug}`);
    setQuery('');
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { go(results[activeIndex]); }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const highlight = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-mag-2/30 text-foreground rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>;
  };

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Rechercher..."
          className="bg-transparent text-xs w-32 lg:w-48 outline-none text-foreground placeholder:text-muted-foreground"
        />
        {query && <button onClick={() => { setQuery(''); setOpen(false); }}><X className="w-3 h-3 text-muted-foreground" /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 w-72 lg:w-96 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <button key={`${r.botId}-${r.pageSlug}-${r.text}-${i}`}
              onClick={() => go(r)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn("w-full text-left px-4 py-2.5 flex items-center gap-3 text-xs transition-colors",
                i === activeIndex ? "bg-secondary" : "hover:bg-secondary/50")}>
              <span className={cn("text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded", getBotColor(r.botId), "bg-secondary")}>
                {bots[r.botId].name}
              </span>
              <span className="flex-1 min-w-0 truncate">{highlight(r.text)}</span>
              <span className="text-muted-foreground text-[10px] shrink-0">{r.pageTitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
