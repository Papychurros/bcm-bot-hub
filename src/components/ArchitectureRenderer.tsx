import { cn } from '@/lib/utils';
import { getBotGradient, type BotId } from '@/data/bots';
import type { ArchitectureData, ArchSection } from '@/data/architecture-data';

const botBorderColor: Record<BotId, string> = {
  bob: 'hsl(262,83%,58%)',
  cash: 'hsl(160,84%,39%)',
  mag: 'hsl(25,90%,55%)',
};

const dotColors: Record<string, string> = {
  green: 'bg-[hsl(160,84%,39%)]',
  red: 'bg-[hsl(0,84%,60%)]',
  blue: 'bg-[hsl(210,80%,55%)]',
  orange: 'bg-[hsl(25,90%,55%)]',
  purple: 'bg-[hsl(262,83%,58%)]',
};

const nameColors: Record<string, string> = {
  green: 'text-[hsl(160,84%,45%)]',
  red: 'text-[hsl(0,84%,60%)]',
  blue: 'text-[hsl(210,80%,60%)]',
  orange: 'text-[hsl(25,90%,55%)]',
  purple: 'text-[hsl(262,83%,65%)]',
};

const stepBorderColors: Record<string, string> = {
  blue: 'border-[hsl(210,80%,55%,0.3)] bg-[hsl(210,80%,55%,0.05)]',
  green: 'border-[hsl(160,84%,39%,0.3)] bg-[hsl(160,84%,39%,0.05)]',
  purple: 'border-[hsl(262,83%,58%,0.3)] bg-[hsl(262,83%,58%,0.05)]',
  orange: 'border-[hsl(25,90%,55%,0.3)] bg-[hsl(25,90%,55%,0.05)]',
  gray: 'border-border/40 bg-card/40',
};

const stepTitleColors: Record<string, string> = {
  blue: 'text-[hsl(210,80%,60%)]',
  green: 'text-[hsl(160,84%,45%)]',
  purple: 'text-[hsl(262,83%,65%)]',
  orange: 'text-[hsl(25,90%,55%)]',
  gray: 'text-foreground',
};

const stepNumberBg: Record<string, string> = {
  blue: 'bg-[hsl(210,80%,55%,0.15)] text-[hsl(210,80%,60%)]',
  green: 'bg-[hsl(160,84%,39%,0.15)] text-[hsl(160,84%,45%)]',
  purple: 'bg-[hsl(262,83%,58%,0.15)] text-[hsl(262,83%,65%)]',
  orange: 'bg-[hsl(25,90%,55%,0.15)] text-[hsl(25,90%,55%)]',
  gray: 'bg-muted text-muted-foreground',
};

function SectionBlock({ section, botId, index }: { section: ArchSection; botId: BotId; index: number }) {
  const animClass = 'animate-fade-in-up opacity-0';
  const animStyle = { animationDelay: `${0.15 + index * 0.1}s` };
  const borderColor = botBorderColor[botId];

  switch (section.type) {
    case 'orchestrator':
      return (
        <div className={cn("mb-8", animClass)} style={animStyle}>
          <div
            className="rounded-2xl p-8 text-center border"
            style={{
              borderColor: `color-mix(in srgb, ${borderColor} 40%, transparent)`,
              boxShadow: `0 0 30px -8px color-mix(in srgb, ${borderColor} 30%, transparent), inset 0 0 40px -15px color-mix(in srgb, ${borderColor} 8%, transparent)`,
              background: `color-mix(in srgb, ${borderColor} 6%, hsl(var(--card)))`,
            }}
          >
            <div className="text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">{section.label}</div>
            <h2 className={cn("text-3xl font-display font-extrabold mb-2 bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(botId))}>
              {section.name}
            </h2>
            <p className="text-sm font-mono text-muted-foreground mb-4">{section.description}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {section.badges.map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border/50 bg-secondary/40">
                  <span>{b.icon}</span>
                  <span className="text-foreground/80">{b.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      );

    case 'arrow':
      return (
        <div className={cn("flex items-center justify-center gap-3 mb-8 text-muted-foreground", animClass)} style={animStyle}>
          <span className="text-lg">↓</span>
          <span className="font-mono text-sm">{section.label}</span>
        </div>
      );

    case 'agents-grid':
      return (
        <div className={cn("mb-8", animClass)} style={animStyle}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {section.agents.map((agent) => (
              <div
                key={agent.name}
                className="rounded-xl border border-border/30 p-4"
                style={{
                  boxShadow: `inset 0 0 30px -15px color-mix(in srgb, ${borderColor} 6%, transparent)`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColors[agent.color])} />
                  <span className={cn("font-mono font-bold text-sm", nameColors[agent.color])}>{agent.name}</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground mb-3">{agent.subtitle}</p>
                <div className="space-y-1">
                  {agent.tools.map((tool, i) => (
                    <div key={i} className="text-xs font-mono text-muted-foreground/80">{tool}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'callout':
      return (
        <div
          className={cn(
            "mb-8 p-4 rounded-r-xl border-l-4",
            section.variant === 'info' ? 'border-l-[hsl(210,80%,55%)] bg-[hsl(210,80%,55%,0.05)]' : 'border-l-[hsl(25,90%,55%)] bg-[hsl(25,90%,55%,0.05)]',
            animClass
          )}
          style={animStyle}
        >
          <span className="text-sm">
            {section.title && <strong>{section.title} </strong>}
            <span className="text-foreground/80">{section.content}</span>
          </span>
        </div>
      );

    case 'separator':
      return (
        <div className={cn("my-10", animClass)} style={animStyle}>
          <div className="border-t border-border/30" />
        </div>
      );

    case 'workflow':
      return (
        <div className={cn("mb-8", animClass)} style={animStyle}>
          <div className="text-xs font-mono tracking-[0.2em] text-muted-foreground mb-6">{section.title}</div>
          <div className="flex flex-col items-center gap-0">
            {section.steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center w-full max-w-2xl">
                <div className={cn("w-full rounded-xl border p-4 flex items-center gap-4", stepBorderColors[step.color])}>
                  <span className={cn("text-xs font-mono font-bold px-2 py-1 rounded-md shrink-0", stepNumberBg[step.color])}>
                    {step.number}
                  </span>
                  <span className="text-lg shrink-0">{step.icon}</span>
                  <div>
                    <div className={cn("font-mono font-bold text-sm", stepTitleColors[step.color])}>{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {i < section.steps.length - 1 && (
                  <div className="flex flex-col items-center my-1">
                    <div className="w-px h-5 bg-border/40" />
                    <span className="text-muted-foreground text-xs">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'conditional':
      return (
        <div className={cn("mb-8", animClass)} style={animStyle}>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <span className="text-sm">↓</span>
            <span className="font-mono text-sm">{section.label}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {section.branches.map((branch) => {
              const isPositive = branch.variant === 'positive';
              const branchBorder = isPositive ? 'border-[hsl(160,84%,39%,0.3)]' : 'border-border/30';
              const branchBg = isPositive ? 'bg-[hsl(160,84%,39%,0.04)]' : 'bg-card/40';
              const headerBg = isPositive ? 'bg-[hsl(160,84%,39%,0.1)]' : 'bg-muted/30';
              const icon = isPositive ? '✓' : '✕';
              const headerTextColor = isPositive ? 'text-[hsl(160,84%,45%)]' : 'text-muted-foreground';

              return (
                <div key={branch.label} className={cn("rounded-xl border overflow-hidden", branchBorder, branchBg)}>
                  <div className={cn("px-4 py-2 text-xs font-mono font-bold flex items-center gap-2", headerBg, headerTextColor)}>
                    <span>{icon}</span>
                    <span>{branch.label}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {branch.items.map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm">{item.icon}</span>
                          <span className={cn("font-mono font-bold text-sm", isPositive ? 'text-[hsl(160,84%,45%)]' : 'text-foreground')}>{item.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-6">{item.description}</div>
                        {i < branch.items.length - 1 && (
                          <div className="flex justify-center my-2">
                            <span className="text-muted-foreground text-xs">↓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'stack-grid':
      return (
        <div className={cn("mb-8", animClass)} style={animStyle}>
          <div className="text-xs font-mono tracking-[0.2em] text-muted-foreground mb-6">{section.title}</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {section.items.map((item) => (
              <div key={item.label} className="glass p-4 flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-[10px] font-mono tracking-wider text-muted-foreground mb-1">{item.label}</div>
                  <div className="text-sm font-mono font-bold text-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function ArchitectureRenderer({ data, botId }: { data: ArchitectureData; botId: BotId }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8 animate-fade-in-up opacity-0 stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{data.icon}</span>
          <h1 className={cn("text-3xl font-display font-extrabold bg-gradient-to-r bg-clip-text text-transparent", getBotGradient(botId))}>
            {data.title}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{data.subtitle}</p>
      </div>
      {data.sections.map((section, i) => (
        <SectionBlock key={i} section={section} botId={botId} index={i} />
      ))}
    </div>
  );
}
