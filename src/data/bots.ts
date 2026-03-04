export type BotId = 'bob' | 'cash' | 'mag';

export interface NavItem {
  title: string;
  slug: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export interface BotConfig {
  id: BotId;
  name: string;
  fullName: string;
  subtitle: string;
  tagline: string;
  description: string;
  version: string;
  emoji: string;
  stats: { value: string; label: string }[];
  techTags: string[];
  guideNav: NavGroup[];
}

export const bots: Record<BotId, BotConfig> = {
  bob: {
    id: 'bob',
    name: 'B.O.B',
    fullName: "Bot d'Organisation Bureautique",
    subtitle: 'Assistant Personnel',
    tagline: '• ASSISTANT PERSONNEL TÉLÉGRAM •',
    description: "B.O.B est un assistant IA multi-agent connecté à Telegram. Il peut répondre à vos questions, gérer votre agenda Google, lire et envoyer des emails, vous donner la météo, et même ajouter de la musique à vos playlists YouTube.",
    version: 'V2.1.18',
    emoji: '🧠',
    stats: [
      { value: '8', label: 'CERVEAUX' },
      { value: '35', label: 'OUTILS' },
      { value: '2', label: 'MODES' },
      { value: '24/7', label: 'DISPONIBLE' },
    ],
    techTags: ['ASSISTANT MULTI-AGENT', 'TÉLÉGRAM', 'GPT-4O-MINI', 'SUPABASE', 'N8N'],
    guideNav: [
      { group: 'GÉNÉRAL', items: [{ title: 'Accueil', slug: '' }] },
      {
        group: 'FONCTIONNALITÉS', items: [
          { title: 'Mode Normal', slug: 'mode-normal' },
          { title: 'Mode Précis', slug: 'mode-precis' },
          { title: 'Agenda & Mails', slug: 'agenda-mails' },
          { title: 'Musique', slug: 'musique' },
        ]
      },
      {
        group: 'AUTOMATISATION', items: [
          { title: 'Mini B.O.B Info', slug: 'mini-bob-info' },
        ]
      },
      {
        group: 'TECHNIQUE', items: [
          { title: 'Architecture', slug: 'architecture' },
          { title: 'Patch Notes', slug: 'patch-notes' },
          { title: 'Limites connues', slug: 'limites' },
          { title: 'Glossaire', slug: 'glossaire' },
        ]
      },
    ],
  },
  cash: {
    id: 'cash',
    name: 'C.A.S.H',
    fullName: 'Comptabilité Automatisée Smart Hub',
    subtitle: 'Assistant Financier',
    tagline: '• ASSISTANT FINANCIER TÉLÉGRAM •',
    description: "C.A.S.H est un assistant de gestion financière connecté à Telegram. Il vous permet d'ajouter, consulter, modifier et supprimer vos dépenses. Il génère également des bilans mensuels automatiques.",
    version: 'V1.4.7',
    emoji: '💰',
    stats: [
      { value: '4', label: 'MODULES' },
      { value: '12', label: 'COMMANDES' },
      { value: '1', label: 'BASE DE DONNÉES' },
      { value: '24/7', label: 'DISPONIBLE' },
    ],
    techTags: ['GESTION FINANCIÈRE', 'TÉLÉGRAM', 'GPT-4O-MINI', 'SUPABASE', 'N8N'],
    guideNav: [
      { group: 'GÉNÉRAL', items: [{ title: 'Accueil', slug: '' }] },
      {
        group: 'FONCTIONNALITÉS', items: [
          { title: 'Ajouter', slug: 'ajouter' },
          { title: 'Consulter & Rechercher', slug: 'consulter-rechercher' },
          { title: 'Modifier & Supprimer', slug: 'modifier-supprimer' },
          { title: 'Bilan Mensuel', slug: 'bilan-mensuel' },
        ]
      },
      {
        group: 'TECHNIQUE', items: [
          { title: 'Architecture', slug: 'architecture' },
          { title: 'Patch Notes', slug: 'patch-notes' },
          { title: 'Limites connues', slug: 'limites' },
          { title: 'Glossaire', slug: 'glossaire' },
        ]
      },
    ],
  },
  mag: {
    id: 'mag',
    name: 'M.A.G',
    fullName: 'Mail Auto-classement Gmail',
    subtitle: 'Trieur Gmail Automatique',
    tagline: '• AUTO-CLASSEMENT GMAIL •',
    description: "M.A.G est un bot de tri automatique pour Gmail. Il classe vos emails entrants dans les bonnes catégories (Pub, Réseaux Sociaux, Moi, Travail, Perso, Autre) et vous envoie des notifications Telegram pour les messages importants.",
    version: 'V1.2.3',
    emoji: '📬',
    stats: [
      { value: '6', label: 'CATÉGORIES' },
      { value: '3', label: 'NOTIFICATIONS' },
      { value: '1', label: 'POLLING' },
      { value: '24/7', label: 'AUTOMATIQUE' },
    ],
    techTags: ['AUTO-CLASSEMENT', 'GMAIL', 'TÉLÉGRAM', 'GPT-4O-MINI', 'N8N'],
    guideNav: [
      { group: 'GÉNÉRAL', items: [{ title: 'Accueil', slug: '' }] },
      {
        group: 'FONCTIONNEMENT', items: [
          { title: 'Catégories', slug: 'categories' },
          { title: 'Notifications', slug: 'notifications' },
        ]
      },
      {
        group: 'TECHNIQUE', items: [
          { title: 'Architecture', slug: 'architecture' },
          { title: 'Patch Notes', slug: 'patch-notes' },
          { title: 'Limites connues', slug: 'limites' },
          { title: 'Glossaire', slug: 'glossaire' },
        ]
      },
    ],
  },
};

export const botList: BotId[] = ['bob', 'cash', 'mag'];

export function getBotGradient(botId: BotId): string {
  switch (botId) {
    case 'bob': return 'from-bob to-bob-end';
    case 'cash': return 'from-cash to-cash-end';
    case 'mag': return 'from-mag-1 via-mag-2 to-mag-3';
  }
}

export function getBotGlow(botId: BotId): string {
  switch (botId) {
    case 'bob': return 'glow-bob';
    case 'cash': return 'glow-cash';
    case 'mag': return 'glow-mag';
  }
}

export function getBotColor(botId: BotId): string {
  switch (botId) {
    case 'bob': return 'text-bob';
    case 'cash': return 'text-cash';
    case 'mag': return 'text-mag-2';
  }
}
