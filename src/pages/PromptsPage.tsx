import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getBotGradient, type BotId } from '@/data/bots';
import { promptsData, type PromptBlock } from '@/data/prompts-data';

function PromptBlockItem({ prompt }: { prompt: PromptBlock }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <span className={cn("text-[11px] font-mono font-bold", prompt.color)}>{prompt.name}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="font-mono text-[9px] bg-white/[0.06] border border-white/[0.15] text-muted-foreground px-2.5 py-1 rounded-[5px] hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            {open ? '▼ Masquer' : '▶ Afficher'}
          </button>
          <button
            onClick={handleCopy}
            className="font-mono text-[9px] bg-white/[0.06] border border-white/[0.15] text-muted-foreground px-2.5 py-1 rounded-[5px] hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            {copied ? '✓ Copié !' : '⎘ Copier'}
          </button>
        </div>
      </div>
      {open && (
        <pre className={cn(
          "rounded-lg p-3.5 text-[10px] leading-[1.7] text-[#c9d1d9] whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto border font-mono",
          "bg-[#0a0a14]",
          prompt.borderColor
        )}>
          {prompt.content}
        </pre>
      )}
    </div>
  );
}

export default function PromptsPage({ botId }: { botId: BotId }) {
  const data = promptsData[botId];
  if (!data) return <div className="p-8 text-center text-muted-foreground">Contenu non disponible</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📋</span>
          <h1 className={cn("text-3xl font-display font-extrabold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(botId))}>
            Prompts
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="animate-fade-in-up opacity-0 stagger-2">
        <div className="glass p-4 sm:p-6">
          {data.prompts.map((prompt) => (
            <PromptBlockItem key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}
