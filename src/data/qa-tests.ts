import type { BotId } from './bots';

export interface QATest {
  id: string;
  title: string;
  command: string;
  expected: string;
}

export interface TestCategory {
  id: string;
  name: string;
  tests: QATest[];
}

export const qaTests: Record<BotId, TestCategory[]> = {
  bob: [
    { id: 'T1', name: 'Présentation & Modes', tests: [
      { id: 'bob-1-1', title: 'Présentation', command: '$présente-toi', expected: 'B.O.B se présente avec nom, version et fonctionnalités' },
      { id: 'bob-1-2', title: 'Qui es-tu', command: '$qui es-tu ?', expected: 'Réponse d\'identité courte et claire' },
      { id: 'bob-1-3', title: 'À quoi tu sers', command: '$à quoi tu sers ?', expected: 'Liste des fonctionnalités principales' },
      { id: 'bob-1-4', title: "C'est quoi B.O.B", command: "$c'est quoi b.o.b ?", expected: 'Explication du nom et de la mission' },
    ]},
    { id: 'T2', name: 'Recherche Easy', tests: [
      { id: 'bob-2-1', title: 'Question générale', command: "$Quelle est la capitale de l'Australie ?", expected: 'Canberra — réponse correcte et concise' },
      { id: 'bob-2-2', title: 'Calcul', command: '$Combien font 248 × 37 ?', expected: '9 176 — calcul correct' },
      { id: 'bob-2-3', title: 'Date & Heure', command: '$Quelle heure est-il ?', expected: 'Heure actuelle correcte (fuseau France)' },
      { id: 'bob-2-4', title: 'Date du jour', command: "$Quelle est la date d'aujourd'hui ?", expected: 'Date du jour correcte au format français' },
    ]},
    { id: 'T3', name: 'Météo Easy', tests: [
      { id: 'bob-3-1', title: 'Météo simple Pau', command: '$Quel temps fait-il à Pau ?', expected: 'Température, conditions, humidité pour Pau' },
      { id: 'bob-3-2', title: 'Météo demain Paris', command: '$Quelle météo demain à Paris ?', expected: 'Prévisions du lendemain pour Paris' },
      { id: 'bob-3-3', title: 'Météo heure précise', command: '$Il fera quoi à Lyon à 18h ?', expected: 'Prévision horaire précise pour Lyon' },
      { id: 'bob-3-4', title: 'Météo semaine Bordeaux', command: '$Météo pour la semaine à Bordeaux', expected: 'Prévisions sur 5-7 jours pour Bordeaux' },
    ]},
    { id: 'T4', name: 'Mode Précis', tests: [
      { id: 'bob-4-1', title: 'Activation mode précis', command: '$passe en mode précis et explique-moi les agents IA', expected: 'Réponse détaillée et structurée sur les agents IA' },
      { id: 'bob-4-2', title: 'Météo détaillée', command: '$passe en mode précis et météo complète à Pau aujourd\'hui', expected: 'Météo complète avec prévisions horaires détaillées' },
    ]},
    { id: 'T5', name: 'Agenda', tests: [
      { id: 'bob-5-1', title: 'Prochain rendez-vous', command: '$Quels sont mes prochains rendez-vous ?', expected: 'Liste des prochains événements du calendrier' },
      { id: 'bob-5-2', title: 'Créer événement', command: '$Ajoute un rendez-vous médecin jeudi à 14h', expected: 'Confirmation de création avec titre, date et heure' },
      { id: 'bob-5-3', title: 'Modifier événement', command: '$Déplace mon rendez-vous médecin à vendredi 10h', expected: 'Confirmation de modification avec nouvelles infos' },
      { id: 'bob-5-4', title: 'Supprimer événement', command: '$Supprime mon rendez-vous médecin vendredi', expected: 'Confirmation de suppression' },
    ]},
    { id: 'T6', name: 'Mail Gmail', tests: [
      { id: 'bob-6-1', title: 'Lire derniers mails', command: '$Montre-moi mes 3 derniers mails', expected: 'Liste de 3 mails avec expéditeur, objet, extrait' },
      { id: 'bob-6-2', title: 'Envoyer mail', command: "$Envoie un mail à Pierre pour lui dire que je serai en retard", expected: 'Confirmation d\'envoi avec destinataire et contenu' },
      { id: 'bob-6-3', title: 'Chercher contact', command: '$Envoie un mail à maman', expected: 'Utilise le carnet de contacts Supabase pour trouver l\'adresse' },
      { id: 'bob-6-4', title: 'Supprimer mail', command: '$Supprime le dernier mail de LinkedIn', expected: 'Confirmation de suppression du mail' },
    ]},
    { id: 'T7', name: 'YouTube Agent', tests: [
      { id: 'bob-7-1', title: 'Recherche titre', command: '$Ajoute Blinding Lights The Weeknd dans mes playlists', expected: 'Résultat YouTube trouvé + demande de confirmation' },
      { id: 'bob-7-2', title: 'Ajout double playlist', command: 'Après sélection + playlist Hip-Hop', expected: 'Ajout dans la playlist sélectionnée' },
      { id: 'bob-7-3', title: 'Confirmation ajout', command: 'Vérifier la confirmation', expected: 'Message de confirmation avec lien vidéo et playlist' },
    ]},
    { id: 'T8', name: 'Vocal', tests: [
      { id: 'bob-8-1', title: 'Déclenchement TTS', command: '$réponds vocalement quelle heure est-il', expected: 'Réponse audio (note vocale Telegram)' },
      { id: 'bob-8-2', title: 'Détection VOCAL', command: 'Envoyer une note vocale', expected: 'B.O.B transcrit et répond à la note vocale' },
    ]},
    { id: 'T9', name: 'Routage & Règles', tests: [
      { id: 'bob-9-1', title: 'Pas de JSON brut', command: 'Vérifier toutes les réponses', expected: 'Aucune réponse ne contient de JSON brut visible' },
      { id: 'bob-9-2', title: 'Vouvoiement', command: 'Vérifier toutes les réponses', expected: 'Toutes les réponses utilisent le vouvoiement' },
      { id: 'bob-9-3', title: "Pas d'invention", command: '$Quelle est la météo sur Mars ?', expected: 'B.O.B indique qu\'il ne peut pas répondre (pas d\'invention)' },
      { id: 'bob-9-4', title: "Ignore mot-clé 'liens'", command: '$liens', expected: 'Redirigé vers Mini B.O.B Info (pas le routeur principal)' },
    ]},
    { id: 'T10', name: 'Mini B.O.B Info', tests: [
      { id: 'bob-10-1', title: 'Récap matinal 8h00', command: 'Déclenché automatiquement à 8h', expected: 'Récap météo + agenda + actus envoyé automatiquement' },
      { id: 'bob-10-2', title: 'Veille actualités', command: 'Après récap (1 min délai)', expected: 'Sélection d\'actualités pertinentes envoyée' },
      { id: 'bob-10-3', title: 'Commande liens', command: '$liens', expected: 'Liste des liens des dernières actualités' },
      { id: 'bob-10-4', title: 'Liens ciblés', command: '$liens 3 11', expected: 'Liens des actualités n°3 à n°11' },
    ]},
  ],
  cash: [
    { id: 'T1', name: 'Ajout Abonnements', tests: [
      { id: 'cash-1-1', title: 'Netflix mensuel', command: 'Abonnement Netflix 15.99€ par mois', expected: 'Ajout confirmé : abonnement Netflix, 15.99€, mensuel' },
      { id: 'cash-1-2', title: 'Spotify sans date', command: 'Abonnement Spotify 9.99€', expected: 'Ajout avec date du jour par défaut' },
      { id: 'cash-1-3', title: 'iCloud annuel', command: 'Abonnement iCloud 35.88€ par an', expected: 'Ajout confirmé : abonnement iCloud, annuel' },
    ]},
    { id: 'T2', name: 'Ajout Courses', tests: [
      { id: 'cash-2-1', title: 'Lidl courses', command: 'Courses Lidl 47.30€', expected: 'Ajout confirmé : courses, Lidl, 47.30€' },
      { id: 'cash-2-2', title: 'Boulangerie petit montant', command: "Boulangerie 3.20€", expected: 'Ajout confirmé : courses, 3.20€' },
      { id: 'cash-2-3', title: 'Restaurant', command: 'Restaurant 28.50€ hier soir', expected: 'Ajout avec date de la veille' },
    ]},
    { id: 'T3', name: 'Ajout Factures', tests: [
      { id: 'cash-3-1', title: 'EDF facture', command: 'Facture EDF 89€', expected: 'Ajout confirmé : facture, EDF, 89€' },
      { id: 'cash-3-2', title: 'Loyer', command: 'Loyer 650€', expected: 'Ajout confirmé : facture, loyer, 650€' },
      { id: 'cash-3-3', title: 'Assurance', command: "Assurance auto 45€", expected: 'Ajout confirmé : facture, assurance' },
      { id: 'cash-3-4', title: 'Téléphone', command: 'Facture Free Mobile 19.99€', expected: 'Ajout confirmé : facture, Free Mobile' },
    ]},
    { id: 'T4', name: 'Ajout Autre', tests: [
      { id: 'cash-4-1', title: 'Cadeau anniversaire', command: "Cadeau anniversaire Marie 55€", expected: 'Ajout confirmé : autre, cadeau, 55€' },
      { id: 'cash-4-2', title: 'Remboursement', command: "Remboursement Paul 20€", expected: 'Ajout confirmé : autre, remboursement' },
      { id: 'cash-4-3', title: 'Timbre courrier', command: 'Timbre 1.16€', expected: 'Ajout confirmé : autre, timbre' },
    ]},
    { id: 'T5', name: 'Consultation', tests: [
      { id: 'cash-5-1', title: 'Total dépenses', command: "Combien j'ai dépensé ce mois-ci ?", expected: 'Total mensuel affiché avec répartition' },
      { id: 'cash-5-2', title: 'Récap abonnements', command: 'Récap de mes abonnements', expected: 'Liste de tous les abonnements actifs' },
      { id: 'cash-5-3', title: 'Bilan complet', command: 'Bilan complet', expected: 'Vue d\'ensemble par catégorie avec totaux' },
    ]},
    { id: 'T6', name: 'Recherche mot-clé', tests: [
      { id: 'cash-6-1', title: 'Cherche Netflix', command: 'Cherche Netflix', expected: 'Toutes les dépenses contenant "Netflix"' },
      { id: 'cash-6-2', title: 'Cherche EDF', command: 'Cherche EDF', expected: 'Toutes les factures EDF' },
      { id: 'cash-6-3', title: 'Cherche Spotify', command: 'Cherche Spotify', expected: 'Abonnement Spotify trouvé' },
    ]},
    { id: 'T7', name: 'Recherche par montant', tests: [
      { id: 'cash-7-1', title: 'Dépenses > 50€', command: 'Quelles dépenses dépassent 50€ ?', expected: 'Liste filtrée des dépenses > 50€' },
      { id: 'cash-7-2', title: 'Facture > 300€', command: 'Factures de plus de 300€', expected: 'Factures > 300€ ou message "aucune"' },
    ]},
    { id: 'T8', name: 'Modification', tests: [
      { id: 'cash-8-1', title: 'Modifier montant', command: 'Modifie la dépense #12 : montant 25€', expected: 'Confirmation de modification du montant' },
      { id: 'cash-8-2', title: 'Modifier description', command: 'Modifie la dépense #12 : description "Courses Carrefour"', expected: 'Confirmation de modification de la description' },
      { id: 'cash-8-3', title: 'Modifier les deux', command: 'Modifie #12 : 30€ et "Courses Auchan"', expected: 'Montant et description modifiés' },
    ]},
    { id: 'T9', name: 'Suppression', tests: [
      { id: 'cash-9-1', title: 'Suppression valide', command: 'Supprime la dépense #15', expected: 'Confirmation de suppression avec détails' },
      { id: 'cash-9-2', title: 'Vérification post-suppression', command: 'Affiche la dépense #15', expected: 'Dépense introuvable après suppression' },
    ]},
    { id: 'T10', name: 'Cas limites', tests: [
      { id: 'cash-10-1', title: 'Suppression sans ID', command: 'Supprime la dépense', expected: 'Demande de préciser l\'ID de la dépense' },
      { id: 'cash-10-2', title: 'Modification sans ID', command: 'Modifie le montant à 30€', expected: 'Demande de préciser quelle dépense modifier' },
      { id: 'cash-10-3', title: 'Recherche introuvable', command: 'Cherche XYZABC', expected: 'Message "aucun résultat trouvé"' },
    ]},
    { id: 'T11', name: 'Présentation', tests: [
      { id: 'cash-11-1', title: 'Commande présente-toi', command: '$présente-toi', expected: 'C.A.S.H se présente avec ses fonctionnalités' },
      { id: 'cash-11-2', title: 'Commande aide', command: '$aide', expected: 'Liste des commandes disponibles' },
      { id: 'cash-11-3', title: 'Commande commandes', command: '$commandes', expected: 'Liste complète des commandes' },
    ]},
    { id: 'T12', name: 'Format & Qualité', tests: [
      { id: 'cash-12-1', title: 'Pas de JSON brut', command: 'Vérifier toutes les réponses', expected: 'Aucun JSON brut visible dans les réponses' },
      { id: 'cash-12-2', title: 'Format bloc Telegram', command: 'Vérifier le formatage', expected: 'Réponses bien formatées en blocs Telegram' },
      { id: 'cash-12-3', title: 'Vouvoiement', command: 'Vérifier toutes les réponses', expected: 'Utilisation constante du vouvoiement' },
    ]},
  ],
  mag: [
    { id: 'T1', name: 'Tri automatique Pub', tests: [
      { id: 'mag-1-1', title: 'Newsletter marque', command: 'Envoyer un mail type newsletter d\'une marque', expected: 'Classé en 📢 Pub — pas de notification' },
      { id: 'mag-1-2', title: 'Soldes/offre commerciale', command: 'Envoyer un mail de soldes avec promotion', expected: 'Classé en 📢 Pub — pas de notification' },
      { id: 'mag-1-3', title: 'Code promo', command: 'Envoyer un mail avec un code promo', expected: 'Classé en 📢 Pub — pas de notification' },
    ]},
    { id: 'T2', name: 'Tri automatique Réseau Soc.', tests: [
      { id: 'mag-2-1', title: 'Notification LinkedIn', command: 'Recevoir une notification LinkedIn', expected: 'Classé en 🌐 Réseaux Sociaux — silencieux' },
      { id: 'mag-2-2', title: 'Instagram', command: 'Recevoir un email Instagram', expected: 'Classé en 🌐 Réseaux Sociaux — silencieux' },
      { id: 'mag-2-3', title: 'Discord', command: 'Recevoir une notification Discord', expected: 'Classé en 🌐 Réseaux Sociaux — silencieux' },
    ]},
    { id: 'T3', name: 'Tri automatique Moi', tests: [
      { id: 'mag-3-1', title: 'Mail envoyé à soi-même', command: 'S\'envoyer un email à soi-même', expected: 'Classé en 📤 Moi — silencieux' },
      { id: 'mag-3-2', title: 'Note personnelle', command: 'S\'envoyer une note/mémo par mail', expected: 'Classé en 📤 Moi — silencieux' },
    ]},
    { id: 'T4', name: 'Notifications Travail', tests: [
      { id: 'mag-4-1', title: "Offre d'emploi", command: 'Recevoir un mail d\'offre d\'emploi', expected: 'Classé en 💼 Travail — notification Telegram envoyée' },
      { id: 'mag-4-2', title: 'Email Foundever', command: 'Recevoir un email de Foundever', expected: 'Classé en 💼 Travail — notification envoyée' },
      { id: 'mag-4-3', title: 'Pôle Emploi', command: 'Recevoir un email de France Travail', expected: 'Classé en 💼 Travail — notification envoyée' },
      { id: 'mag-4-4', title: 'Fiche de paie', command: 'Recevoir un email avec fiche de paie', expected: 'Classé en 💼 Travail — notification envoyée' },
    ]},
    { id: 'T5', name: 'Notifications Perso', tests: [
      { id: 'mag-5-1', title: "Message d'un proche", command: 'Recevoir un email d\'un contact personnel', expected: 'Classé en 👤 Perso — notification envoyée' },
      { id: 'mag-5-2', title: 'Invitation personnelle', command: 'Recevoir une invitation par mail', expected: 'Classé en 👤 Perso — notification envoyée' },
      { id: 'mag-5-3', title: 'Conversation quotidienne', command: 'Recevoir un email conversationnel', expected: 'Classé en 👤 Perso — notification envoyée' },
    ]},
    { id: 'T6', name: 'Notifications Autre', tests: [
      { id: 'mag-6-1', title: 'Newsletter non pub', command: 'Recevoir une newsletter technique/info', expected: 'Classé en 📦 Autre — notification envoyée' },
      { id: 'mag-6-2', title: 'Notification système', command: 'Recevoir une alerte système (serveur, etc.)', expected: 'Classé en 📦 Autre — notification envoyée' },
      { id: 'mag-6-3', title: 'Message inclassifiable', command: 'Recevoir un email ambigu/inclassifiable', expected: 'Classé en 📦 Autre — notification envoyée' },
    ]},
    { id: 'T7', name: 'Format notifications Telegram', tests: [
      { id: 'mag-7-1', title: 'Champ De:', command: 'Vérifier le champ De: dans la notification', expected: 'Nom de l\'expéditeur affiché correctement' },
      { id: 'mag-7-2', title: 'Champ Sujet:', command: 'Vérifier le champ Sujet: dans la notification', expected: 'Objet du mail affiché correctement' },
      { id: 'mag-7-3', title: 'Champ Catégorie:', command: 'Vérifier le champ Catégorie:', expected: 'Label de catégorie correct affiché' },
      { id: 'mag-7-4', title: 'Emoji 📬', command: 'Vérifier la présence de l\'emoji', expected: 'Emoji 📬 présent dans la notification' },
    ]},
    { id: 'T8', name: 'Comportements silencieux', tests: [
      { id: 'mag-8-1', title: 'Pub ne notifie pas', command: 'Envoyer un email pub et vérifier Telegram', expected: 'Aucune notification Telegram reçue' },
      { id: 'mag-8-2', title: 'Réseau Soc. ne notifie pas', command: 'Recevoir un email social et vérifier', expected: 'Aucune notification Telegram reçue' },
      { id: 'mag-8-3', title: 'Moi ne notifie pas', command: 'S\'envoyer un mail et vérifier Telegram', expected: 'Aucune notification Telegram reçue' },
    ]},
    { id: 'T9', name: 'INBOX propre', tests: [
      { id: 'mag-9-1', title: 'removeINBOX toutes catégories', command: 'Vérifier que tous les emails triés quittent INBOX', expected: 'Aucun email trié ne reste dans INBOX' },
      { id: 'mag-9-2', title: 'Labels visibles Gmail', command: 'Vérifier les labels dans Gmail', expected: 'Labels correctement appliqués et visibles' },
    ]},
    { id: 'T10', name: 'Robustesse & Déclencheur', tests: [
      { id: 'mag-10-1', title: 'Polling 1 minute', command: 'Envoyer un mail et mesurer le délai de tri', expected: 'Email trié dans les 60 secondes' },
      { id: 'mag-10-2', title: 'Plusieurs emails simultanés', command: 'Envoyer 3+ emails en même temps', expected: 'Tous les emails triés correctement' },
      { id: 'mag-10-3', title: 'Email vide/sans objet', command: 'Envoyer un email sans objet ni contenu', expected: 'Email trié (probablement en Autre) sans erreur' },
      { id: 'mag-10-4', title: 'Indépendance de B.O.B', command: 'Vérifier que M.A.G fonctionne même si B.O.B est off', expected: 'M.A.G trie normalement, indépendamment de B.O.B' },
    ]},
  ],
};

export function getAllTests(botId: BotId): QATest[] {
  return qaTests[botId].flatMap(cat => cat.tests);
}

export function getTotalTestCount(botId: BotId): number {
  return getAllTests(botId).length;
}
