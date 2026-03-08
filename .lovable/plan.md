

## Correctif B.O.B Jump — 3 problèmes

### 1. Sélection de texte au tactile
- Ajouter `user-select: none`, `-webkit-user-select: none`, `touch-action: none` sur le conteneur principal du jeu (ligne 635-636)
- Ajouter un `touchmove` listener sur `document` avec `preventDefault` et `{ passive: false }` dans le `useEffect` principal (lignes 573-628), nettoyé au démontage

### 2. Plus d'ennemis après 15000
`getEnemyChance` (ligne 44) plafonne à 8% pour score ≥ 12000. Ajouter des paliers supplémentaires :
- 15000+ : 10%, tous types
- 20000+ : 12%, tous types
- 30000+ : 15%, tous types

Réduire aussi l'écart minimum entre ennemis pour les scores élevés : 400px → 350px à 15000+, 300px à 25000+ (ligne 252).

### 3. Plateformes cassables — timer 1s + explosion
Remplacer le système `bounceCount >= 2` par un timer :
- Au premier rebond, enregistrer `p.breakTimer = 60` (1 seconde à 60fps) au lieu d'incrémenter `bounceCount`
- Dans la boucle d'update (après ligne 227), décrémenter `breakTimer` chaque frame ; quand il atteint 0, marquer `p.broken = true` et générer des particules d'explosion
- Pendant le timer, la plateforme clignote (déjà en place ligne 499-501, adapter pour utiliser `breakTimer`)
- Ajouter un tableau `particles` au state pour l'animation d'explosion (petits carrés rouges/orange qui se dispersent pendant ~20 frames)
- Dessiner les particules dans le render

### Fichier modifié
`src/components/games/DoodleJumpGame.tsx` — toutes les modifications dans ce seul fichier.

