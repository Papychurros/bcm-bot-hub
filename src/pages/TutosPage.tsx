import { Youtube, ExternalLink } from 'lucide-react';

const tutorials = [
  { id: 'lJcrXFLo9R8', title: 'Agent IA Telegram + Google Calendar : Créer un Assistant Personnel avec n8n (Partie 1/2)' },
  { id: '62Z5TUxOtlE', title: 'Agent IA Telegram + Google Calendar : Créer un Assistant Personnel avec n8n (Partie 2/2)' },
  { id: 'djEe0jKTe7s', title: 'Comment Configurer Supabase et Postgres sur n8n pour un Agent IA' },
  { id: 'VgITvqCFsTQ', title: 'Automatise ta boite mail de ZÉRO avec N8N' },
  { id: 'uRfAt8M5ZOg', title: "MAITRISE 80% d'N8N avec ces 18 modules" },
  { id: 'nC5MrVKPdYY', title: 'Quel modèle LLM choisir pour tes automatisations' },
];

export default function TutosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20 lg:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Youtube className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Tutos YouTube</h1>
          <p className="text-sm text-muted-foreground">Vidéos pour maîtriser n8n et les agents IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tutorials.map((tuto, i) => (
          <a
            key={tuto.id}
            href={`https://www.youtube.com/watch?v=${tuto.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="relative aspect-video bg-black">
              <img
                src={`https://img.youtube.com/vi/${tuto.id}/hqdefault.jpg`}
                alt={tuto.title}
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5 fill-white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {tuto.title}
              </p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <ExternalLink className="w-3 h-3" /> YouTube
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
