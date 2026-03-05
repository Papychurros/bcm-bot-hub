import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import archi1 from '@/assets/cash-archi-1.png';

interface AboutCashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AboutCashModal({ open, onOpenChange }: AboutCashModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0f0f1a] border-cash/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-extrabold bg-gradient-to-r from-cash to-cash-end bg-clip-text text-transparent">
            À propos de C.A.S.H
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* YouTube Video */}
          <div className="aspect-video rounded-lg overflow-hidden border border-border/50">
            <iframe
              src="https://www.youtube.com/embed/n7mZ2myohro"
              title="Présentation C.A.S.H"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Architecture Image */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-muted-foreground tracking-wider">ARCHITECTURE</h3>
            <img src={archi1} alt="Architecture C.A.S.H — Vue détaillée" className="w-full rounded-lg border border-border/50" />
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-2">
            <Button asChild variant="outline" className="gap-2 border-cash/40 text-cash hover:bg-cash/10 font-mono">
              <a href="https://bcm-hub.fr/C_A_S_H_Dossier_Technique.pdf" download>
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
