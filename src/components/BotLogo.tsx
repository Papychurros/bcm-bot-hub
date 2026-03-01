import bobLogo from '@/assets/bot-bob.png';
import cashLogo from '@/assets/bot-cash.png';
import magLogo from '@/assets/bot-mag.png';
import { type BotId } from '@/data/bots';
import { cn } from '@/lib/utils';

const logos: Record<BotId, string> = { bob: bobLogo, cash: cashLogo, mag: magLogo };

interface BotLogoProps {
  botId: BotId;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

export default function BotLogo({ botId, size = 'md', className }: BotLogoProps) {
  return (
    <img
      src={logos[botId]}
      alt={`${botId} logo`}
      className={cn(sizes[size], 'object-contain', className)}
      draggable={false}
    />
  );
}
