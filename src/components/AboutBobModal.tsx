import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import archi1 from '@/assets/bob-archi-1.png';
import archi2 from '@/assets/bob-archi-2.png';

interface AboutBobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AboutBobModal({ open, onOpenChange }: AboutBobModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0f0f1a] border-bob/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-extrabold bg-gradient-to-r from-bob to-bob-end bg-clip-text text-transparent">
            À propos de B.O.B
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* YouTube Video */}
          <div className="aspect-video rounded-lg overflow-hidden border border-border/50">
            <iframe
              src="https://www.youtube.com/embed/efM7mGOaPtc"
              title="Présentation B.O.B"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Architecture Images */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-muted-foreground tracking-wider">ARCHITECTURE</h3>
            <img src={archi1} alt="Architecture B.O.B — Vue détaillée" className="w-full rounded-lg border border-border/50" />
            <img src={archi2} alt="Architecture B.O.B — Écosystème" className="w-full rounded-lg border border-border/50" />
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-2">
            <Button asChild variant="outline" className="gap-2 border-bob/40 text-bob hover:bg-bob/10 font-mono">
              <a href="https://bcm-hub.fr/BOB_Dossier_Technique.pdf" download>
                <Download className="w-4 h-4" />
                Télécharger le Dossier Technique
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
