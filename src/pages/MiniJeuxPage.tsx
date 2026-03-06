import { Gamepad2 } from 'lucide-react';

export default function MiniJeuxPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
        <Gamepad2 className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground">Mini Jeux</h1>
      <p className="text-muted-foreground max-w-md">
        Bientôt disponible 🎮
      </p>
    </div>
  );
}
