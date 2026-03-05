import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageLightbox from '@/components/ImageLightbox';
import archi1 from '@/assets/mag-archi-1.png';

interface AboutMagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AboutMagModal({ open, onOpenChange }: AboutMagModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0f0f1a] border-mag-2/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-extrabold bg-gradient-to-r from-mag-1 via-mag-2 to-mag-3 bg-clip-text text-transparent">
            À propos de M.A.G
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video rounded-lg overflow-hidden border border-border/50">
            <iframe
              src="https://www.youtube.com/embed/ZWJPIGezQEI"
              title="Présentation M.A.G"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-muted-foreground tracking-wider">ARCHITECTURE</h3>
            <ImageLightbox src={archi1} alt="Architecture M.A.G — Vue détaillée" className="w-full rounded-lg border border-border/50" />
          </div>

          <div className="flex justify-center pt-2">
            <Button asChild variant="outline" className="gap-2 border-mag-2/40 text-mag-2 hover:bg-mag-2/10 font-mono">
              <a href="https://bcm-hub.fr/M_A_G_Dossier_Technique.pdf" download>
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
