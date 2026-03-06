import { Youtube } from 'lucide-react';

export default function TutosPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
        <Youtube className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground">Tutos YouTube</h1>
      <p className="text-muted-foreground max-w-md">
        Bientôt disponible 🎬
      </p>
    </div>
  );
}
