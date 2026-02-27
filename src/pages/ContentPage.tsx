import { useParams } from 'react-router-dom';
import { bots, getBotGradient, getBotColor, type BotId } from '@/data/bots';
import { guideContent, type ContentSection } from '@/data/guide-content';
import { cn } from '@/lib/utils';

function SectionRenderer({ section, botId }: { section: ContentSection; botId: BotId }) {
  switch (section.type) {
    case 'text':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{section.content}</div>
        </div>
      );
    case 'commands':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="space-y-2">
            {section.commands.map((cmd, i) => (
              <div key={i} className="glass p-3 flex flex-col sm:flex-row sm:items-start gap-2">
                <code className={cn("cmd-tag shrink-0", getBotColor(botId))}>
                  {cmd.cmd}
                  {cmd.params?.map(p => <span key={p} className="text-mag-2"> [{p}]</span>)}
                </code>
                <span className="text-xs text-muted-foreground">{cmd.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'callout':
      return (
        <div className={cn("mb-6", section.variant === 'info' ? 'callout-info' : 'callout-warning')}>
          {section.title && <div className="text-sm font-bold mb-1">{section.title}</div>}
          <div className="text-sm text-foreground/80">{section.content}</div>
        </div>
      );
    case 'table':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {section.headers.map(h => <th key={h} className="text-left py-2 px-3 text-xs tracking-wider text-muted-foreground font-bold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {row.map((cell, j) => <td key={j} className={cn("py-2 px-3", j === 0 && getBotColor(botId) + ' font-medium')}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="relative pl-6 border-l-2 border-border space-y-6">
            {section.entries.map((entry, i) => (
              <div key={i} className="relative">
                <div className={cn("absolute -left-[1.55rem] w-3 h-3 rounded-full bg-gradient-to-br", getBotGradient(botId))} />
                <div className={cn("inline-block px-2 py-0.5 rounded text-xs font-mono font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(botId))}>{entry.version}</div>
                <div className="text-xs text-muted-foreground mb-2">{entry.date}</div>
                <ul className="space-y-1">
                  {entry.changes.map((c, j) => <li key={j} className="text-sm text-foreground/80 flex items-start gap-2"><span className="text-muted-foreground mt-1">•</span>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case 'flowchart':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="glass p-6 overflow-x-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {section.nodes.map(node => (
                <div key={node.id} className={cn(
                  "px-4 py-2 rounded-lg text-xs font-mono font-medium border",
                  node.type === 'trigger' && "bg-cash/10 border-cash/30 text-cash",
                  node.type === 'process' && "bg-bob/10 border-bob/30 text-bob",
                  node.type === 'condition' && "bg-mag-2/10 border-mag-2/30 text-mag-2",
                  node.type === 'output' && "bg-bob-end/10 border-bob-end/30 text-bob-end",
                )}>
                  {node.label}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-[10px] text-muted-foreground">
              {section.connections.map(([from, to], i) => {
                const fromNode = section.nodes.find(n => n.id === from);
                const toNode = section.nodes.find(n => n.id === to);
                return fromNode && toNode ? <span key={i} className="inline-block mx-1">{fromNode.label} → {toNode.label}</span> : null;
              })}
            </div>
          </div>
        </div>
      );
    case 'limits':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="space-y-3">
            {section.limits.map((limit, i) => (
              <div key={i} className="glass p-4 flex items-start gap-3">
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                  <div className="font-bold text-sm mb-1">{limit.title}</div>
                  <div className="text-xs text-muted-foreground">{limit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'glossary':
      return (
        <div className="mb-6">
          {section.title && <h3 className="text-lg font-display font-bold mb-3">{section.title}</h3>}
          <div className="space-y-2">
            {section.terms.map((term, i) => (
              <div key={i} className="glass p-3 flex flex-col sm:flex-row gap-2">
                <span className={cn("font-mono font-bold text-sm shrink-0 min-w-[140px]", getBotColor(botId))}>{term.term}</span>
                <span className="text-sm text-foreground/80">{term.definition}</span>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function ContentPage() {
  const { botId, pageSlug } = useParams<{ botId: string; pageSlug: string }>();
  const bot = bots[botId as BotId];
  if (!bot || !pageSlug) return <div className="p-8 text-center text-muted-foreground">Page introuvable</div>;

  const content = guideContent[bot.id]?.[pageSlug];
  if (!content) return <div className="p-8 text-center text-muted-foreground">Contenu non disponible</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{content.icon}</span>
          <h1 className={cn("text-3xl font-display font-extrabold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(bot.id))}>
            {content.title}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
      </div>
      {content.sections.map((section, i) => (
        <SectionRenderer key={i} section={section} botId={bot.id} />
      ))}
    </div>
  );
}
