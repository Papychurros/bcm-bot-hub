

## M.A.G Casse-Labels — Refonte complète du Breakout

Réécriture majeure de `src/components/games/BreakoutGame.tsx` pour transformer le casse-briques basique en **M.A.G Casse-Labels** avec 10 niveaux, 5 types de briques, power-ups/malus, pause menu, et palette orange.

### Modifications dans `src/components/games/BreakoutGame.tsx`

**1. Renommage & palette orange**
- Titre → `🤖 M.A.G Casse-Labels`, couleur principale `#f97316`
- Raquette orange avec lueur néon, fond `#0f0f1a`

**2. Anti-sélection tactile**
- `user-select: none`, `touch-action: none` sur le conteneur
- Listener `touchmove` avec `preventDefault` + `{ passive: false }`, nettoyé au démontage

**3. Système de 10 niveaux**
- Tableau de config avec grille, vitesse balle, largeur raquette pour chaque niveau (1-10)
- Niveau 1 : 6×5, 3.5px, 90px → Niveau 10 : 12×10, 8px, 55px
- Calculs dynamiques de `BRICK_W`, `BRICK_OFF_X` basés sur cols/rows du niveau

**4. Bouton Pause (⏸)**
- Bouton rond en haut à droite du canvas
- Overlay pause avec titre, grille 2×5 de sélection de niveau (surbrillance orange), boutons Reprendre et Recommencer
- Changer de niveau relance immédiatement

**5. Types de briques**
- **Normale** : 1 coup, labels M.A.G (`Travail`, `Pub`, `Moi`, `Perso`, `Budget`, `Agenda`, `Mail`, `Réunion`, `Projet`, `Deadline`)
- **Résistante** : 2-4 coups selon niveau, orange foncé `#c2410c`, affiche `×N`
- **Bonus** : 1 coup, dorée `#fbbf24` pulsante, drop power-up/malus
- **Explosive** : 1 coup, rouge `#ef4444`, détruit 8 voisines + particules
- **Indestructible** : gris `#374151`, hachures, rebondit la balle
- Distribution variable selon le niveau (80/15/5 → 45/25/10/10/10)

**6. Power-ups & Malus**
- Blocs tombants depuis briques bonus (2px/frame)
- Power-ups (60%) : Multi-balle (vert), Balle de feu (rouge, traverse 15s), Vie +1 (rose)
- Malus (40%) : Balle accélérée (violet, +40% 8s), Raquette rétrécie (bleu, -30% 10s)
- Badges actifs affichés sous le score avec compte à rebours

**7. Multi-balle**
- Tableau de balles au lieu d'une seule
- Balle principale = première ; perte de vie si elle sort, extras disparaissent

**8. Delta time**
- Déjà en place (accumulateur 16.67ms), vérifier qu'il s'applique à la vitesse de balle variable par niveau

### Modifications dans `src/pages/MiniJeuxPage.tsx`
- Mettre à jour le titre du jeu breakout → `M.A.G Casse-Labels`

### Fichiers modifiés
- `src/components/games/BreakoutGame.tsx` — réécriture quasi-complète
- `src/pages/MiniJeuxPage.tsx` — titre du jeu #3

