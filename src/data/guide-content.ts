export interface PageContent {
  title: string;
  icon: string;
  subtitle: string;
  sections: ContentSection[];
}

export type ContentSection =
  | { type: 'text'; title?: string; content: string }
  | { type: 'commands'; title?: string; commands: { cmd: string; desc: string; params?: string[] }[] }
  | { type: 'callout'; variant: 'info' | 'warning'; title?: string; content: string }
  | { type: 'table'; title?: string; headers: string[]; rows: string[][] }
  | { type: 'timeline'; title?: string; entries: { version: string; date: string; changes: string[] }[] }
  | { type: 'flowchart'; title?: string; nodes: { id: string; label: string; type: 'trigger' | 'process' | 'condition' | 'output'; }[]; connections: [string, string][] }
  | { type: 'limits'; title?: string; limits: { title: string; description: string }[] }
  | { type: 'glossary'; title?: string; terms: { term: string; definition: string }[] };

export const guideContent: Record<string, Record<string, PageContent>> = {
  bob: {
    'mode-normal': {
      title: 'Mode Normal',
      icon: '🟢',
      subtitle: 'Toutes vos demandes quotidiennes — aucun mot clé requis',
      sections: [
        { type: 'text', title: '☀️ Météo Simple', content: "Réponse en une phrase naturelle" },
        { type: 'commands', commands: [
          { cmd: 'La météo à', desc: '', params: ['ville'] },
          { cmd: 'Quel temps à', desc: 'demain', params: ['ville'] },
          { cmd: 'Il fait quoi à', desc: '', params: ['ville', 'heure'] },
          { cmd: 'Météo', desc: 'cette semaine', params: ['ville'] },
        ]},
        { type: 'text', title: '🔍 Recherche Internet', content: "Réponse courte et directe" },
        { type: 'commands', commands: [
          { cmd: 'Cherche', desc: '', params: ['sujet'] },
          { cmd: 'Trouve-moi', desc: '', params: ['info'] },
          { cmd: 'C\'est quoi', desc: '', params: ['terme'] },
          { cmd: 'Qui est', desc: '', params: ['personne'] },
        ]},
        { type: 'text', title: '🧮 Calcul', content: "Avec explication si demandée" },
        { type: 'commands', commands: [
          { cmd: 'Calcule', desc: '', params: ['opération'] },
          { cmd: 'Combien font', desc: '', params: ['X × Y'] },
          { cmd: 'Explique-moi le calcul', desc: '' },
        ]},
        { type: 'text', title: '🕐 Date & Heure', content: "Heure, jour et date en temps réel" },
        { type: 'commands', commands: [
          { cmd: 'Quelle heure est-il ?', desc: '' },
          { cmd: 'On est quel jour ?', desc: '' },
          { cmd: 'Quelle est la date ?', desc: '' },
        ]},
        { type: 'callout', variant: 'info', title: 'Bon à savoir', content: "En Mode Normal, B.O.B utilise un seul agent IA avec un contexte réduit pour des réponses plus rapides. Pour des recherches approfondies, passez en Mode Précis." },
        { type: 'callout', variant: 'warning', title: 'Attention', content: "B.O.B ne répond qu'en français et utilise le vouvoiement. Il n'inventera jamais d'information — s'il ne sait pas, il le dira." },
      ],
    },
    'mode-precis': {
      title: 'Mode Précis',
      icon: '🔴',
      subtitle: 'Analyses approfondies — toujours commencer par "passe en mode précis et..."',
      sections: [
        { type: 'text', title: 'Qu\'est-ce que le Mode Précis ?', content: "Le Mode Précis active les agents spécialisés de B.O.B pour fournir des réponses plus détaillées et structurées. Il utilise plusieurs sous-agents pour traiter votre demande en profondeur." },
        { type: 'callout', variant: 'info', title: 'Phrase de déclenchement', content: 'Commencez toujours par : "Passe en mode précis et..."\npuis enchaînez avec votre demande.' },
        { type: 'text', title: '🌦️ Météo Détaillée', content: "Rapport météo complet" },
        { type: 'commands', title: 'MÉTÉO COMPLÈTE', commands: [
          { cmd: '...donne moi la météo pour', desc: 'demain', params: ['ville'] },
          { cmd: '...météo complète', desc: '', params: ['ville', 'heure'] },
          { cmd: '...prévisions', desc: 'cette semaine', params: ['ville'] },
        ]},
        { type: 'callout', variant: 'info', content: "Inclut : températures min/max, ressenti, précipitations, probabilité de pluie, vent, rafales, direction, pression, couverture nuageuse, indice UV." },
        { type: 'text', title: '🔎 Recherche Approfondie', content: "Synthèse structurée et détaillée — GPT-4o" },
        { type: 'commands', title: 'RECHERCHE AVANCÉE', commands: [
          { cmd: '...fais une recherche sur', desc: '', params: ['sujet'] },
          { cmd: '...analyse', desc: '', params: ['sujet'] },
          { cmd: '...compare', desc: '', params: ['A', 'B'] },
          { cmd: '...fais-moi un résumé complet sur', desc: '', params: ['sujet'] },
        ]},
        { type: 'callout', variant: 'info', content: "Modèle : GPT-4o — effectue 2 à 3 recherches avec des angles différents pour une réponse approfondie." },
        { type: 'text', title: 'Différences avec le Mode Normal', content: "▪ Réponses plus longues et structurées\n▪ Utilisation de plusieurs agents spécialisés\n▪ Recherche web approfondie\n▪ Données météo complètes avec prévisions horaires\n▪ Temps de réponse plus long (5-15 secondes)" },
        { type: 'callout', variant: 'info', content: "Le mode précis est particulièrement utile pour les prévisions météo détaillées, les explications techniques, et les recherches approfondies." },
      ],
    },
    'agenda-mails': {
      title: 'Agenda & Mails',
      icon: '📅',
      subtitle: 'Gestion Google Calendar et Gmail',
      sections: [
        { type: 'text', title: '📅 Google Calendar', content: "Voir, créer, modifier, supprimer" },
        { type: 'commands', title: 'VOIR', commands: [
          { cmd: 'Mes rendez-vous cette semaine', desc: '' },
          { cmd: "Qu'est-ce que j'ai demain ?", desc: '' },
        ]},
        { type: 'commands', title: 'CRÉER', commands: [
          { cmd: 'Crée un RDV', desc: '', params: ['titre', 'date', 'heure'] },
        ]},
        { type: 'commands', title: 'MODIFIER / SUPPRIMER', commands: [
          { cmd: 'Modifie', desc: '', params: ['événement', 'heure'] },
          { cmd: 'Supprime', desc: '', params: ['événement'] },
        ]},
        { type: 'text', title: '✉️ Gmail', content: "Lire, envoyer, supprimer" },
        { type: 'commands', title: 'LIRE', commands: [
          { cmd: 'Mes nouveaux mails', desc: '' },
          { cmd: 'Lis mes emails', desc: '' },
          { cmd: 'Résume mes mails en une phrase', desc: '' },
          { cmd: 'Résume le mail de', desc: '', params: ['contact'] },
        ]},
        { type: 'text', content: "BOB rédige, vous validez avant envoi" },
        { type: 'commands', title: 'ENVOYER — RÉDACTION ASSISTÉE', commands: [
          { cmd: 'Envoie un mail à', desc: '', params: ['contact'] },
          { cmd: 'Réponds à', desc: '', params: ['contact'] },
        ]},
        { type: 'callout', variant: 'warning', title: 'CONFIRMATION OBLIGATOIRE', content: "→ Suppression d'un événement Calendar\n→ Suppression d'un mail\n→ Envoi d'un mail\n→ Modification d'un événement" },
        { type: 'callout', variant: 'warning', content: "Évitez de demander à BOB de traiter toute votre boîte mail d'un coup. Préférez travailler par petits groupes : \"Lis mes 5 derniers mails\" ou \"Traite les 10 premiers non lus\"." },
      ],
    },
    'musique': {
      title: 'Musique',
      icon: '🎵',
      subtitle: 'Agent YouTube Music — ajout de titres à vos playlists',
      sections: [
        { type: 'text', title: 'Fonctionnement', content: "L'agent YouTube de B.O.B vous permet d'ajouter des morceaux à vos playlists YouTube directement depuis Telegram. Il recherche le titre sur YouTube, vous propose le meilleur résultat, puis l'ajoute à la playlist de votre choix." },
        { type: 'commands', title: 'Commandes', commands: [
          { cmd: 'Ajoute [titre] [artiste] dans mes playlists', desc: 'Recherche et ajoute un morceau', params: ['titre', 'artiste'] },
        ]},
        { type: 'text', title: 'Processus', content: "1. B.O.B recherche le titre sur YouTube\n2. Il vous présente le résultat trouvé\n3. Vous confirmez ou refusez\n4. Il vous demande dans quelle playlist l'ajouter\n5. Le morceau est ajouté et vous recevez une confirmation" },
        { type: 'callout', variant: 'warning', content: "L'agent YouTube nécessite une connexion OAuth valide. Si l'ajout échoue, vérifiez que le token n'a pas expiré." },
      ],
    },
    'mini-bob-info': {
      title: 'Mini B.O.B Info',
      icon: '📰',
      subtitle: 'Récap matinal automatique et veille actualités',
      sections: [
        { type: 'text', title: 'Récap Matinal', content: "Chaque matin à 8h00, Mini B.O.B Info vous envoie automatiquement un récapitulatif contenant : la météo du jour, vos rendez-vous, et un résumé de l'actualité." },
        { type: 'text', title: 'Veille Actualités', content: "Après le récap matinal (1 minute de délai), B.O.B vous envoie une veille actualités avec les dernières news pertinentes, triées par catégorie." },
        { type: 'commands', title: 'Commande Liens', commands: [
          { cmd: 'liens', desc: 'Affiche les liens des dernières actualités envoyées' },
          { cmd: 'liens [X] [Y]', desc: 'Affiche les liens des actualités numéro X à Y', params: ['X', 'Y'] },
        ]},
        { type: 'callout', variant: 'info', content: "Le récap matinal est entièrement automatique — il se déclenche via un cron n8n à 8h00 tous les jours." },
      ],
    },
    'architecture': {
      title: 'Architecture',
      icon: '🏗️',
      subtitle: 'Workflow n8n et architecture multi-agent',
      sections: [
        { type: 'flowchart', title: 'Architecture générale de B.O.B', nodes: [
          { id: '1', label: 'Telegram Trigger', type: 'trigger' },
          { id: '2', label: 'Router Principal', type: 'process' },
          { id: '3', label: 'Détection Mode', type: 'condition' },
          { id: '4', label: 'Agent Normal', type: 'process' },
          { id: '5', label: 'Agent Précis', type: 'process' },
          { id: '6', label: 'Agent Météo', type: 'process' },
          { id: '7', label: 'Agent Agenda', type: 'process' },
          { id: '8', label: 'Agent Mail', type: 'process' },
          { id: '9', label: 'Agent YouTube', type: 'process' },
          { id: '10', label: 'Formateur Réponse', type: 'output' },
          { id: '11', label: 'Telegram Reply', type: 'output' },
        ], connections: [['1','2'],['2','3'],['3','4'],['3','5'],['4','6'],['4','7'],['4','8'],['4','9'],['5','6'],['6','10'],['7','10'],['8','10'],['9','10'],['10','11']] },
        { type: 'text', title: 'Stack technique', content: "• Orchestration : n8n (self-hosted)\n• IA : OpenAI GPT-4o-mini\n• Base de données : Supabase (PostgreSQL)\n• APIs : Google Calendar, Gmail, YouTube Data API, OpenWeatherMap\n• Messagerie : Telegram Bot API" },
        { type: 'callout', variant: 'info', content: "B.O.B utilise 8 sous-agents IA spécialisés, chacun avec son propre prompt système et ses outils dédiés. Le Router Principal détermine quel agent appeler en fonction de la demande." },
      ],
    },
    'patch-notes': {
      title: 'Patch Notes',
      icon: '📋',
      subtitle: "Historique des versions de B.O.B",
      sections: [
        { type: 'timeline', title: 'Historique des versions', entries: [
          { version: 'V2.1.18', date: 'Février 2026', changes: ['Ajout de l\'agent YouTube Music', 'Amélioration du formatage Telegram', 'Correction du bug de double réponse'] },
          { version: 'V2.1.0', date: 'Janvier 2026', changes: ['Mode Précis avec agents spécialisés', 'Intégration Google Calendar complète', 'Mini B.O.B Info — récap matinal'] },
          { version: 'V2.0.0', date: 'Décembre 2025', changes: ['Refonte complète en multi-agent', 'Migration vers GPT-4o-mini', 'Nouvelle architecture n8n'] },
          { version: 'V1.0.0', date: 'Septembre 2025', changes: ['Première version de B.O.B', 'Questions-réponses basiques', 'Météo simple'] },
        ]},
      ],
    },
    'limites': {
      title: 'Limites connues',
      icon: '⚠️',
      subtitle: 'Limitations et bugs connus de B.O.B',
      sections: [
        { type: 'limits', limits: [
          { title: 'Temps de réponse en Mode Précis', description: 'Le mode précis peut prendre jusqu\'à 15 secondes pour les requêtes complexes nécessitant plusieurs agents.' },
          { title: 'Token YouTube expirable', description: 'Le token OAuth YouTube expire régulièrement et doit être renouvelé manuellement dans n8n.' },
          { title: 'Météo limitée à la France', description: 'La météo fonctionne principalement pour les villes françaises. Les villes internationales peuvent donner des résultats imprécis.' },
          { title: 'Pas de mémoire conversationnelle longue', description: 'B.O.B ne retient pas les conversations passées au-delà de la session en cours (buffer limité).' },
          { title: 'Gestion des fuseaux horaires', description: 'L\'agenda utilise le fuseau Europe/Paris par défaut. Les événements dans d\'autres fuseaux peuvent être décalés.' },
        ]},
      ],
    },
    'glossaire': {
      title: 'Glossaire',
      icon: '📖',
      subtitle: 'Termes techniques utilisés dans la documentation',
      sections: [
        { type: 'glossary', terms: [
          { term: 'Agent IA', definition: 'Sous-module intelligent spécialisé dans une tâche précise (météo, agenda, mail, etc.)' },
          { term: 'n8n', definition: 'Plateforme d\'automatisation open-source utilisée pour orchestrer les workflows de B.O.B' },
          { term: 'GPT-4o-mini', definition: 'Modèle de langage d\'OpenAI utilisé par B.O.B pour comprendre et répondre aux requêtes' },
          { term: 'Supabase', definition: 'Base de données PostgreSQL hébergée, utilisée pour stocker les contacts, préférences et données' },
          { term: 'Router', definition: 'Composant n8n qui analyse la demande et la dirige vers le bon agent spécialisé' },
          { term: 'TTS', definition: 'Text-to-Speech — synthèse vocale pour les réponses audio de B.O.B' },
          { term: 'Polling', definition: 'Vérification périodique (toutes les minutes) de nouvelles données entrantes' },
          { term: 'OAuth', definition: 'Protocole d\'authentification utilisé pour connecter Gmail, Calendar et YouTube' },
          { term: 'Buffer', definition: 'Mémoire temporaire de conversation permettant à B.O.B de suivre le contexte' },
        ]},
      ],
    },
  },
  cash: {
    'ajouter': {
      title: 'Ajouter une dépense',
      icon: '➕',
      subtitle: 'Ajouter des abonnements, courses, factures et autres dépenses',
      sections: [
        { type: 'text', title: 'Types de dépenses', content: "C.A.S.H reconnaît automatiquement 4 types de dépenses :\n• Abonnement : dépenses récurrentes (Netflix, Spotify, iCloud...)\n• Courses : achats alimentaires et quotidiens\n• Facture : factures ponctuelles (EDF, loyer, assurance...)\n• Autre : tout ce qui ne rentre pas dans les catégories ci-dessus" },
        { type: 'commands', title: 'Commandes d\'ajout', commands: [
          { cmd: 'J\'ai payé [montant]€ pour [description]', desc: 'Ajout rapide d\'une dépense', params: ['montant', 'description'] },
          { cmd: 'Abonnement Netflix 15.99€ par mois', desc: 'Ajout d\'un abonnement mensuel avec montant' },
          { cmd: 'Courses Lidl 47.30€', desc: 'Ajout de courses avec enseigne et montant' },
          { cmd: 'Facture EDF 89€', desc: 'Ajout d\'une facture avec type et montant' },
        ]},
        { type: 'callout', variant: 'info', content: "C.A.S.H détecte automatiquement la catégorie de la dépense grâce à l'IA. Vous n'avez pas besoin de la préciser." },
        { type: 'callout', variant: 'warning', content: "Si aucune date n'est précisée, C.A.S.H utilise la date du jour par défaut." },
      ],
    },
    'consulter-rechercher': {
      title: 'Consulter & Rechercher',
      icon: '🔍',
      subtitle: 'Consultez vos dépenses et recherchez par mot-clé ou montant',
      sections: [
        { type: 'commands', title: 'Commandes de consultation', commands: [
          { cmd: 'Combien j\'ai dépensé ce mois-ci ?', desc: 'Total des dépenses du mois en cours' },
          { cmd: 'Récap de mes abonnements', desc: 'Liste de tous les abonnements actifs' },
          { cmd: 'Bilan complet', desc: 'Vue d\'ensemble de toutes les dépenses par catégorie' },
        ]},
        { type: 'commands', title: 'Recherche par mot-clé', commands: [
          { cmd: 'Cherche Netflix', desc: 'Trouve toutes les dépenses contenant "Netflix"' },
          { cmd: 'Cherche EDF', desc: 'Trouve toutes les factures EDF' },
        ]},
        { type: 'commands', title: 'Recherche par montant', commands: [
          { cmd: 'Quelles dépenses dépassent 50€ ?', desc: 'Filtre par montant minimum' },
          { cmd: 'Factures de plus de 300€', desc: 'Filtre les factures par seuil' },
        ]},
      ],
    },
    'modifier-supprimer': {
      title: 'Modifier & Supprimer',
      icon: '✏️',
      subtitle: 'Modifiez ou supprimez des dépenses existantes',
      sections: [
        { type: 'commands', title: 'Modification', commands: [
          { cmd: 'Modifie la dépense [ID] : montant [nouveau montant]', desc: 'Modifie le montant d\'une dépense', params: ['ID', 'nouveau montant'] },
          { cmd: 'Modifie la dépense [ID] : description [nouvelle desc]', desc: 'Modifie la description', params: ['ID', 'nouvelle desc'] },
        ]},
        { type: 'commands', title: 'Suppression', commands: [
          { cmd: 'Supprime la dépense [ID]', desc: 'Supprime une dépense par son identifiant', params: ['ID'] },
        ]},
        { type: 'callout', variant: 'warning', title: 'Important', content: "Un ID valide est nécessaire pour modifier ou supprimer. Utilisez la consultation pour trouver l'ID de la dépense." },
        { type: 'callout', variant: 'info', content: "Après suppression, C.A.S.H confirme l'opération et met à jour les totaux automatiquement." },
      ],
    },
    'bilan-mensuel': {
      title: 'Bilan Mensuel',
      icon: '📊',
      subtitle: 'Rapport automatique de fin de mois',
      sections: [
        { type: 'text', title: 'Fonctionnement', content: "Chaque fin de mois, C.A.S.H génère automatiquement un bilan mensuel détaillé comprenant :\n• Total des dépenses\n• Répartition par catégorie (abonnements, courses, factures, autre)\n• Top 5 des plus grosses dépenses\n• Comparaison avec le mois précédent\n• Graphique de tendance" },
        { type: 'callout', variant: 'info', content: "Le bilan est envoyé automatiquement le 1er de chaque mois à 9h00 via Telegram." },
      ],
    },
    'architecture': {
      title: 'Architecture',
      icon: '🏗️',
      subtitle: 'Workflow n8n de C.A.S.H',
      sections: [
        { type: 'flowchart', title: 'Architecture de C.A.S.H', nodes: [
          { id: '1', label: 'Telegram Trigger', type: 'trigger' },
          { id: '2', label: 'Agent IA Principal', type: 'process' },
          { id: '3', label: 'Détection Intent', type: 'condition' },
          { id: '4', label: 'Module Ajout', type: 'process' },
          { id: '5', label: 'Module Consultation', type: 'process' },
          { id: '6', label: 'Module Modification', type: 'process' },
          { id: '7', label: 'Supabase DB', type: 'output' },
          { id: '8', label: 'Formateur Telegram', type: 'output' },
        ], connections: [['1','2'],['2','3'],['3','4'],['3','5'],['3','6'],['4','7'],['5','7'],['6','7'],['7','8']] },
        { type: 'text', title: 'Stack technique', content: "• Orchestration : n8n\n• IA : OpenAI GPT-4o-mini\n• Base de données : Supabase (PostgreSQL)\n• Messagerie : Telegram Bot API" },
      ],
    },
    'patch-notes': {
      title: 'Patch Notes',
      icon: '📋',
      subtitle: "Historique des versions de C.A.S.H",
      sections: [
        { type: 'timeline', entries: [
          { version: 'V1.4.7', date: 'Février 2026', changes: ['Ajout recherche par montant', 'Correction du format des bilans', 'Amélioration de la détection de catégorie'] },
          { version: 'V1.3.0', date: 'Janvier 2026', changes: ['Bilan mensuel automatique', 'Recherche par mot-clé', 'Export CSV'] },
          { version: 'V1.0.0', date: 'Novembre 2025', changes: ['Première version de C.A.S.H', 'Ajout/consultation de dépenses', 'Intégration Supabase'] },
        ]},
      ],
    },
    'limites': {
      title: 'Limites connues',
      icon: '⚠️',
      subtitle: 'Limitations de C.A.S.H',
      sections: [
        { type: 'limits', limits: [
          { title: 'Pas de multi-devises', description: 'C.A.S.H ne gère que les euros (€). Les dépenses en d\'autres devises doivent être converties manuellement.' },
          { title: 'Détection de catégorie imparfaite', description: 'L\'IA peut parfois mal catégoriser une dépense. Vérifiez la catégorie après ajout.' },
          { title: 'Pas de pièces jointes', description: 'Impossible d\'ajouter des photos de tickets ou factures aux dépenses.' },
          { title: 'Historique limité à 12 mois', description: 'Les bilans comparatifs ne remontent qu\'à 12 mois en arrière.' },
        ]},
      ],
    },
    'glossaire': {
      title: 'Glossaire',
      icon: '📖',
      subtitle: 'Termes techniques C.A.S.H',
      sections: [
        { type: 'glossary', terms: [
          { term: 'Abonnement', definition: 'Dépense récurrente avec fréquence (mensuel, annuel)' },
          { term: 'Bilan mensuel', definition: 'Rapport automatique généré le 1er de chaque mois' },
          { term: 'Intent', definition: 'Intention détectée par l\'IA (ajouter, consulter, modifier, supprimer)' },
          { term: 'ID dépense', definition: 'Identifiant unique attribué à chaque dépense dans Supabase' },
          { term: 'Supabase', definition: 'Base de données cloud utilisée pour stocker toutes les dépenses' },
        ]},
      ],
    },
  },
  mag: {
    'categories': {
      title: 'Catégories',
      icon: '🏷️',
      subtitle: 'Les 6 catégories de tri automatique de M.A.G',
      sections: [
        { type: 'text', title: 'Système de tri', content: "M.A.G analyse chaque email entrant et le classe automatiquement dans l'une des 6 catégories suivantes. Le label Gmail correspondant est appliqué et le mail est retiré de la boîte de réception (INBOX)." },
        { type: 'table', title: 'Catégories', headers: ['Catégorie', 'Description', 'Exemple'], rows: [
          ['📢 Pub', 'Newsletters, promotions, offres commerciales', 'Newsletter Zara, code promo Uber'],
          ['🌐 Réseaux Sociaux', 'Notifications de réseaux sociaux', 'LinkedIn, Instagram, Discord'],
          ['📤 Moi', 'Emails envoyés à soi-même', 'Notes personnelles, transferts'],
          ['💼 Travail', 'Emails professionnels importants', 'Offre d\'emploi, Pôle Emploi, fiche de paie'],
          ['👤 Perso', 'Messages personnels de proches', 'Message d\'un ami, invitation'],
          ['📦 Autre', 'Tout ce qui ne rentre pas dans les catégories', 'Newsletter technique, notification système'],
        ]},
        { type: 'callout', variant: 'info', content: "La catégorisation est effectuée par GPT-4o-mini qui analyse l'expéditeur, l'objet et le contenu du mail." },
      ],
    },
    'notifications': {
      title: 'Notifications',
      icon: '🔔',
      subtitle: 'Règles de notification Telegram de M.A.G',
      sections: [
        { type: 'text', title: 'Logique de notification', content: "M.A.G n'envoie PAS de notification pour toutes les catégories. Seules les catégories importantes déclenchent une alerte Telegram." },
        { type: 'table', title: 'Règles de notification', headers: ['Catégorie', 'Notification', 'Raison'], rows: [
          ['📢 Pub', '❌ Silencieux', 'Pas besoin d\'être alerté pour les pubs'],
          ['🌐 Réseaux Sociaux', '❌ Silencieux', 'Les notifications sociales ne sont pas urgentes'],
          ['📤 Moi', '❌ Silencieux', 'Vous savez déjà que vous l\'avez envoyé'],
          ['💼 Travail', '✅ Notification', 'Les emails pro peuvent être urgents'],
          ['👤 Perso', '✅ Notification', 'Les messages personnels méritent une alerte'],
          ['📦 Autre', '✅ Notification', 'Par défaut, mieux vaut prévenir'],
        ]},
        { type: 'text', title: 'Format de notification', content: "Chaque notification Telegram contient :\n• 📬 Emoji identifiant\n• De : nom de l'expéditeur\n• Sujet : objet du mail\n• Catégorie : label attribué" },
        { type: 'callout', variant: 'info', content: "M.A.G vérifie les nouveaux emails toutes les minutes via un polling n8n." },
      ],
    },
    'architecture': {
      title: 'Architecture',
      icon: '🏗️',
      subtitle: 'Workflow n8n de M.A.G',
      sections: [
        { type: 'flowchart', title: 'Architecture de M.A.G', nodes: [
          { id: '1', label: 'Gmail Polling (1 min)', type: 'trigger' },
          { id: '2', label: 'Filtre nouveaux mails', type: 'condition' },
          { id: '3', label: 'Agent IA Catégorisation', type: 'process' },
          { id: '4', label: 'Apply Gmail Label', type: 'process' },
          { id: '5', label: 'Remove INBOX', type: 'process' },
          { id: '6', label: 'Check notification rules', type: 'condition' },
          { id: '7', label: 'Send Telegram Notif', type: 'output' },
        ], connections: [['1','2'],['2','3'],['3','4'],['4','5'],['5','6'],['6','7']] },
        { type: 'text', title: 'Stack technique', content: "• Orchestration : n8n\n• IA : OpenAI GPT-4o-mini\n• Email : Gmail API\n• Notifications : Telegram Bot API" },
        { type: 'callout', variant: 'warning', content: "M.A.G est complètement indépendant de B.O.B. Il utilise un workflow n8n séparé et son propre bot Telegram." },
      ],
    },
    'patch-notes': {
      title: 'Patch Notes',
      icon: '📋',
      subtitle: "Historique des versions de M.A.G",
      sections: [
        { type: 'timeline', entries: [
          { version: 'V1.2.3', date: 'Février 2026', changes: ['Ajout de la catégorie "Moi"', 'Amélioration de la catégorisation IA', 'Fix du removeINBOX pour toutes catégories'] },
          { version: 'V1.1.0', date: 'Janvier 2026', changes: ['Notifications Telegram pour Travail/Perso/Autre', 'Format de notification enrichi', 'Gestion des emails simultanés'] },
          { version: 'V1.0.0', date: 'Décembre 2025', changes: ['Première version de M.A.G', 'Tri automatique en 4 catégories', 'Polling Gmail toutes les 5 min'] },
        ]},
      ],
    },
    'limites': {
      title: 'Limites connues',
      icon: '⚠️',
      subtitle: 'Limitations de M.A.G',
      sections: [
        { type: 'limits', limits: [
          { title: 'Catégorisation parfois ambiguë', description: 'Certains emails peuvent être difficiles à catégoriser (ex: newsletter technique vs pub). L\'IA fait au mieux.' },
          { title: 'Polling toutes les minutes', description: 'Les emails ne sont pas traités instantanément. Délai maximum de 1 minute entre réception et tri.' },
          { title: 'Emails sans objet', description: 'Les emails sans objet ou avec un contenu vide peuvent être mal catégorisés.' },
          { title: 'Un seul compte Gmail', description: 'M.A.G ne gère qu\'un seul compte Gmail à la fois.' },
        ]},
      ],
    },
    'glossaire': {
      title: 'Glossaire',
      icon: '📖',
      subtitle: 'Termes techniques M.A.G',
      sections: [
        { type: 'glossary', terms: [
          { term: 'Polling', definition: 'Vérification périodique de la boîte Gmail pour détecter de nouveaux emails' },
          { term: 'Label Gmail', definition: 'Étiquette appliquée aux emails pour les organiser dans Gmail' },
          { term: 'INBOX', definition: 'Boîte de réception Gmail. M.A.G retire les mails triés de l\'INBOX.' },
          { term: 'Catégorisation IA', definition: 'Processus d\'analyse du contenu d\'un email pour déterminer sa catégorie' },
          { term: 'Notification silencieuse', definition: 'Email trié sans envoi de notification Telegram (Pub, Réseaux Sociaux, Moi)' },
        ]},
      ],
    },
  },
};
