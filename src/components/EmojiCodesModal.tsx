import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmojiCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CODES = [
  { code: '777', label: 'Animation casino', emoji: '🎰', color: '#f0c040' },
  { code: '666', label: 'Diablo', emoji: '😈', color: '#ff3344' },
  { code: '420', label: 'Snoop Dogg nuage de fumée', emoji: '💨', color: '#88cc44' },
  { code: '404', label: 'Gros bug visuel', emoji: '🐛', color: '#44aaff' },
  { code: '0000', label: 'Tête de poulet', emoji: '🐔', color: '#ffaa44' },
  { code: '123 / 321', label: 'Singe "bien tenté"', emoji: '🙈', color: '#cc8844' },
  { code: '159', label: 'Coolmonkey', emoji: '🐒', color: '#00ff88' },
  { code: '357', label: 'Jazzdog', emoji: '🐕', color: '#aa88ff' },
  { code: '456', label: 'Thank', emoji: '🙏', color: '#ffcc88' },
  { code: '789', label: 'Pinguin', emoji: '🐧', color: '#aaddff' },
  { code: '147', label: 'Angry', emoji: '😤', color: '#ff6644' },
  { code: '258', label: 'Hellow', emoji: '👋', color: '#88ffdd' },
  { code: '369', label: 'Simpson', emoji: '🍩', color: '#ffdd00' },
  { code: '1974', label: 'RastaMerlin', emoji: '🧙', color: '#44cc44' },
  { code: '1999', label: 'Love', emoji: '❤️', color: '#ff66aa' },
];

export default function EmojiCodesModal({ open, onOpenChange }: EmojiCodesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0a0a0f] border-[#2a2a3a]">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="font-display font-black text-xl tracking-widest" style={{ color: '#f0c040', textShadow: '0 0 20px rgba(240,192,64,0.5)' }}>
              ⌨ EMOJI CODES
            </span>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1 font-mono font-normal">
              Table de référence · B.O.B
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {CODES.map(({ code, label, emoji, color }) => (
            <div
              key={code}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#12121a] border border-[#2a2a3a] hover:-translate-y-0.5 transition-all cursor-default group"
              style={{ borderLeftWidth: 3, borderLeftColor: color }}
            >
              <span className="font-display font-bold text-sm tracking-wide min-w-[52px]" style={{ color: '#f0c040' }}>
                {code}
              </span>
              <span className="text-muted-foreground text-xs">—</span>
              <span className="text-xs text-[#dde0ff]/85 flex-1">{label}</span>
              <span className="text-xl group-hover:scale-125 group-hover:-rotate-[5deg] transition-transform drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                {emoji}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground tracking-widest mt-2 font-mono">
          15 codes · hover pour animer
        </p>
      </DialogContent>
    </Dialog>
  );
}
