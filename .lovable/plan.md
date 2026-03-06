

## Plan : Corriger l'affichage des mini-jeux sur mobile

### Probleme identifié

Deux causes principales :

1. **GameModal ne s'affiche pas au-dessus de la navbar/bottom nav** : contrairement aux modales "À propos" qui utilisent Radix Dialog (rendu via Portal dans `document.body`), le GameModal est rendu dans l'arbre React à l'intérieur de `<main>`. Malgré le `z-[9999]`, des contextes de stacking empêchent le recouvrement correct.

2. **Les canvas des jeux ont des tailles fixes** (480x400, 480x440, 220x440) qui dépassent l'écran mobile, et le layout `flex-row` ne s'adapte pas bien.

### Modifications

**1. `src/components/games/GameModal.tsx` — Rendu via React Portal**

Utiliser `createPortal(modal, document.body)` pour que le modal soit rendu directement dans `document.body`, exactement comme Radix Dialog le fait pour les modales "À propos". Cela garantit que le modal passe au-dessus de tout (navbar, bottom nav, sidebar).

**2. `src/components/games/GameModal.tsx` — Padding bottom pour éviter la bottom nav**

Ajouter un `pb-16 lg:pb-0` sur le body du jeu pour que le contenu ne soit pas caché derrière la bottom nav mobile pendant le chargement (avant le plein écran).

**3. Chaque jeu (TetrisGame, SnakeGame, BreakoutGame) — Canvas responsive sur mobile**

- Wrapper le canvas dans un conteneur qui scale via CSS `transform: scale()` ou utiliser `max-w-full` avec un wrapper à taille contrainte
- Changer le layout mobile : mettre le canvas au-dessus et les contrôles en dessous, avec le canvas qui occupe la largeur disponible via `w-full aspect-ratio` et scaling CSS
- Les canvas gardent leurs dimensions internes (pour le rendu) mais sont affichés avec `width: 100%; height: auto` sur mobile

**4. `src/components/games/MemoryGame.tsx` — Déjà responsive**

Le Memory utilise une grille CSS, pas de canvas fixe. Vérifier juste que `max-w-[480px]` ne cause pas de problème et ajuster si nécessaire.

### Résumé des fichiers modifiés

- `src/components/games/GameModal.tsx` : Portal + layout ajusté
- `src/components/games/TetrisGame.tsx` : Canvas responsive
- `src/components/games/SnakeGame.tsx` : Canvas responsive
- `src/components/games/BreakoutGame.tsx` : Canvas responsive

