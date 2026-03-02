import type { BotId } from './bots';

export interface ArchOrchestratorCard {
  type: 'orchestrator';
  label: string;
  name: string;
  description: string;
  badges: { icon: string; label: string }[];
}

export interface ArchArrow {
  type: 'arrow';
  label: string;
}

export interface ArchAgent {
  name: string;
  color: 'green' | 'red' | 'blue' | 'orange' | 'purple';
  subtitle: string;
  tools: string[];
}

export interface ArchAgentsGrid {
  type: 'agents-grid';
  agents: ArchAgent[];
}

export interface ArchCallout {
  type: 'callout';
  variant: 'info' | 'warning';
  title?: string;
  content: string;
}

export interface ArchSeparator {
  type: 'separator';
}

export interface ArchWorkflowStep {
  number: string;
  icon: string;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
}

export interface ArchWorkflow {
  type: 'workflow';
  title: string;
  steps: ArchWorkflowStep[];
}

export interface ArchConditional {
  type: 'conditional';
  label: string;
  branches: {
    label: string;
    variant: 'positive' | 'negative';
    items: { icon: string; title: string; description: string }[];
  }[];
}

export interface ArchStackItem {
  icon: string;
  label: string;
  value: string;
}

export interface ArchStackGrid {
  type: 'stack-grid';
  title: string;
  items: ArchStackItem[];
}

export type ArchSection =
  | ArchOrchestratorCard
  | ArchArrow
  | ArchAgentsGrid
  | ArchCallout
  | ArchSeparator
  | ArchWorkflow
  | ArchConditional
  | ArchStackGrid;

export interface ArchitectureData {
  title: string;
  icon: string;
  subtitle: string;
  sections: ArchSection[];
}

export const architectureData: Record<BotId, ArchitectureData> = {
  bob: {
    title: 'Architecture',
    icon: '⚙️',
    subtitle: 'Système multi-agent — comment B.O.B fonctionne',
    sections: [
      {
        type: 'orchestrator',
        label: 'ORCHESTRATEUR PRINCIPAL',
        name: 'B.O.B',
        description: 'gpt-4o-mini · Mémoire Supabase · 100 demandes internet/mois',
        badges: [
          { icon: '📱', label: 'Telegram' },
          { icon: '🎙️', label: 'Whisper' },
          { icon: '🔊', label: 'OpenAI TTS' },
        ],
      },
      { type: 'arrow', label: 'route vers le bon agent' },
      {
        type: 'agents-grid',
        agents: [
          {
            name: 'Search Easy Agent',
            color: 'green',
            subtitle: 'gpt-4o-mini · Mode Normal',
            tools: ['🔧 SerpAPI — Recherche web', '🔧 Calculator — Calculs', '🔧 Date & Time — Heure/date', '🔧 ↳ Weather Easy Agent', '   🔧 get_temperature'],
          },
          {
            name: 'Search Hard Agent',
            color: 'red',
            subtitle: 'gpt-4o · Mode Précis',
            tools: ['🔧 SerpAPI — 2-3 recherches', '🔧 ↳ Weather Hard Agent', '   🔧 get_temperature', '   🔧 get_precipitation', '   🔧 get_wind', '   🔧 get_atmosphere', '   🔧 get_uv'],
          },
          {
            name: 'Calendar Agent',
            color: 'green',
            subtitle: 'gpt-4o-mini · Google Calendar',
            tools: ['🔧 Get events — Lecture', '🔧 Create event — Création', '🔧 Update event — Modif.', '🔧 Delete event — Suppression'],
          },
          {
            name: 'Gmail Agent',
            color: 'green',
            subtitle: 'gpt-4o-mini · Gmail + Sheets',
            tools: ['🔧 Get/Send/Delete — Gmail', '🔧 Google Sheets — Contacts'],
          },
          {
            name: 'YouTube Agent',
            color: 'red',
            subtitle: 'gpt-4o-mini · YouTube Data API v3',
            tools: ['🔧 Search videos — 3 résultats', '🔧 Add to playlist — 14 listes', '🔧 Add to #ALL# — Global'],
          },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Données météo :',
        content: 'Open-Meteo avec modèle AROME/ARPEGE de Météo France. Prévisions sur 7 jours, données horaires disponibles.',
      },
      { type: 'separator' },
      {
        type: 'workflow',
        title: 'WORKFLOW DE B.O.B',
        steps: [
          { number: '01', icon: '📱', title: 'Télégram Trigger', description: 'Reçoit le message — texte ou vocal', color: 'blue' },
          { number: '02', icon: '🔀', title: 'Switch — texte / vocal', description: 'Détecte le type de message', color: 'gray' },
          { number: '03', icon: '🎙️', title: 'Whisper', description: "Transcrit l'audio en texte", color: 'green' },
          { number: '04', icon: '🧠', title: 'B.O.B — Orchestrateur', description: 'Comprend et route vers le bon agent', color: 'purple' },
        ],
      },
      {
        type: 'conditional',
        label: 'IF vocal ?',
        branches: [
          {
            label: 'VOCAL',
            variant: 'positive',
            items: [
              { icon: '🔊', title: 'TTS', description: 'Synthèse vocale' },
              { icon: '📱', title: 'Send Audio', description: 'Fichier audio' },
            ],
          },
          {
            label: 'TEXTE',
            variant: 'negative',
            items: [
              { icon: '📱', title: 'Send Text', description: 'Message texte' },
            ],
          },
        ],
      },
      { type: 'separator' },
      {
        type: 'stack-grid',
        title: 'STACK TECHNIQUE',
        items: [
          { icon: '🧠', label: 'MODÈLE PRINCIPAL', value: 'gpt-4o-mini' },
          { icon: '🎯', label: 'MODÈLE PRÉCIS', value: 'gpt-4o' },
          { icon: '⚙️', label: 'ORCHESTRATION', value: 'n8n self-hosted' },
          { icon: '🖥️', label: 'HÉBERGEMENT', value: 'Hostinger KVM2' },
          { icon: '💾', label: 'MÉMOIRE', value: 'Supabase (Postgres)' },
          { icon: '🎙️', label: 'VOCAL', value: 'Whisper + OpenAI TTS' },
          { icon: '🌤️', label: 'MÉTÉO', value: 'Open-Meteo / Météo France' },
          { icon: '📱', label: 'INTERFACE', value: 'Télégram' },
        ],
      },
    ],
  },
  cash: {
    title: 'Architecture',
    icon: '⚙️',
    subtitle: 'Workflow n8n — comment C.A.S.H fonctionne',
    sections: [
      {
        type: 'orchestrator',
        label: 'AGENT PRINCIPAL',
        name: 'C.A.S.H',
        description: 'gpt-4o-mini · Base Supabase · Détection automatique d\'intention',
        badges: [
          { icon: '📱', label: 'Telegram' },
          { icon: '💾', label: 'Supabase' },
        ],
      },
      { type: 'arrow', label: 'détecte l\'intention' },
      {
        type: 'agents-grid',
        agents: [
          {
            name: 'Module Ajout',
            color: 'green',
            subtitle: 'Ajout de dépenses',
            tools: ['🔧 Détection catégorie IA', '🔧 Insert Supabase', '🔧 Confirmation Telegram'],
          },
          {
            name: 'Module Consultation',
            color: 'blue',
            subtitle: 'Lecture & recherche',
            tools: ['🔧 Select Supabase', '🔧 Filtrage par date/montant', '🔧 Formatage Telegram'],
          },
          {
            name: 'Module Modification',
            color: 'orange',
            subtitle: 'Modifier & supprimer',
            tools: ['🔧 Update Supabase', '🔧 Delete Supabase', '🔧 Confirmation Telegram'],
          },
          {
            name: 'Module Bilan',
            color: 'purple',
            subtitle: 'Bilan mensuel auto',
            tools: ['🔧 Agrégation par catégorie', '🔧 Comparaison mois-1', '🔧 Envoi Telegram formaté'],
          },
        ],
      },
      { type: 'separator' },
      {
        type: 'workflow',
        title: 'WORKFLOW DE C.A.S.H',
        steps: [
          { number: '01', icon: '📱', title: 'Télégram Trigger', description: 'Reçoit le message de l\'utilisateur', color: 'blue' },
          { number: '02', icon: '🧠', title: 'Agent IA Principal', description: 'Comprend l\'intention (ajout, consult, modif, suppression)', color: 'green' },
          { number: '03', icon: '💾', title: 'Supabase', description: 'Exécute l\'opération sur la base de données', color: 'purple' },
          { number: '04', icon: '📱', title: 'Réponse Telegram', description: 'Envoie la confirmation formatée', color: 'blue' },
        ],
      },
      { type: 'separator' },
      {
        type: 'stack-grid',
        title: 'STACK TECHNIQUE',
        items: [
          { icon: '🧠', label: 'MODÈLE IA', value: 'gpt-4o-mini' },
          { icon: '⚙️', label: 'ORCHESTRATION', value: 'n8n self-hosted' },
          { icon: '💾', label: 'BASE DE DONNÉES', value: 'Supabase (Postgres)' },
          { icon: '📱', label: 'INTERFACE', value: 'Télégram' },
        ],
      },
    ],
  },
  mag: {
    title: 'Architecture',
    icon: '⚙️',
    subtitle: 'Workflow n8n — comment M.A.G fonctionne',
    sections: [
      {
        type: 'orchestrator',
        label: 'TRIEUR AUTOMATIQUE',
        name: 'M.A.G',
        description: 'gpt-4o-mini · Gmail API · Polling toutes les minutes',
        badges: [
          { icon: '📧', label: 'Gmail' },
          { icon: '📱', label: 'Telegram' },
        ],
      },
      { type: 'arrow', label: 'catégorise chaque email' },
      {
        type: 'agents-grid',
        agents: [
          {
            name: '📢 Pub',
            color: 'red',
            subtitle: 'Silencieux',
            tools: ['Label Gmail appliqué', 'Retiré de INBOX', '❌ Pas de notification'],
          },
          {
            name: '🌐 Réseaux Sociaux',
            color: 'blue',
            subtitle: 'Silencieux',
            tools: ['Label Gmail appliqué', 'Retiré de INBOX', '❌ Pas de notification'],
          },
          {
            name: '💼 Travail',
            color: 'green',
            subtitle: 'Notification',
            tools: ['Label Gmail appliqué', 'Retiré de INBOX', '✅ Notification Telegram'],
          },
          {
            name: '👤 Perso',
            color: 'green',
            subtitle: 'Notification',
            tools: ['Label Gmail appliqué', 'Retiré de INBOX', '✅ Notification Telegram'],
          },
        ],
      },
      { type: 'separator' },
      {
        type: 'workflow',
        title: 'WORKFLOW DE M.A.G',
        steps: [
          { number: '01', icon: '📧', title: 'Gmail Polling', description: 'Vérifie les nouveaux mails toutes les minutes', color: 'blue' },
          { number: '02', icon: '🔍', title: 'Filtre nouveaux mails', description: 'Ignore les mails déjà traités', color: 'gray' },
          { number: '03', icon: '🧠', title: 'Agent IA Catégorisation', description: 'Analyse expéditeur, objet et contenu', color: 'green' },
          { number: '04', icon: '🏷️', title: 'Apply Label + Remove INBOX', description: 'Classe le mail dans Gmail', color: 'purple' },
        ],
      },
      {
        type: 'conditional',
        label: 'Notification nécessaire ?',
        branches: [
          {
            label: 'OUI (Travail / Perso / Autre)',
            variant: 'positive',
            items: [
              { icon: '📱', title: 'Send Telegram Notif', description: 'Alerte avec expéditeur, objet et catégorie' },
            ],
          },
          {
            label: 'NON (Pub / Réseaux / Moi)',
            variant: 'negative',
            items: [
              { icon: '🔇', title: 'Silencieux', description: 'Aucune notification envoyée' },
            ],
          },
        ],
      },
      { type: 'separator' },
      {
        type: 'stack-grid',
        title: 'STACK TECHNIQUE',
        items: [
          { icon: '🧠', label: 'MODÈLE IA', value: 'gpt-4o-mini' },
          { icon: '⚙️', label: 'ORCHESTRATION', value: 'n8n self-hosted' },
          { icon: '📧', label: 'EMAIL', value: 'Gmail API' },
          { icon: '📱', label: 'NOTIFICATIONS', value: 'Télégram Bot API' },
        ],
      },
    ],
  },
};
