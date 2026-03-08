

## Correctif M.A.G Casse-Labels — 2 problèmes

### Fichier modifié : `src/components/games/BreakoutGame.tsx`

### Fix 1 — Positionnement canvas

Le canvas garde le ratio `BASE_W/BASE_H` mais ne remplit pas tout l'espace. Le problème : le ResizeObserver calcule une taille proportionnelle mais ne force pas le canvas à remplir 100% du conteneur.

Changements :
- Supprimer le ratio fixe `BASE_W/BASE_H` dans le ResizeObserver — le canvas prend directement `wrap.clientWidth` × `wrap.clientHeight` sans contrainte d'aspect ratio
- Le conteneur `canvasWrapRef` passe à `flex-1 w-full` sans `items-center justify-center` (pas de centrage, remplissage total)
- Canvas : `style={{ width: '100%', height: '100%' }}`
- Grille de briques commence à `y = 10` (au lieu de `y = 28`)
- Raquette à `y = H - 30` (déjà le cas via `getPadY`)
- Balle démarre à `padY - BALL_R - 2` (déjà le cas)
- HUD score/vies/level positionné à `y = 20` au lieu de `y = 16`
- Supprimer le `bg-black` et `rounded-lg` superflus du wrapper, garder `overflow-hidden`

### Fix 2 — Couleurs mélangées

Actuellement ligne 106-108 : `const li = (r * cfg.cols + c) % LABELS.length` assigne les couleurs de façon déterministe par position, créant des bandes.

Changements dans `makeBricks` :
- Remplacer `const li = (r * cfg.cols + c) % LABELS.length` par `const li = Math.floor(Math.random() * LABELS.length)` pour les briques normales et résistantes
- Après la boucle de génération, appliquer un shuffle Fisher-Yates sur le tableau `bricks` pour mélanger aussi les positions des types spéciaux

```ts
// Fisher-Yates shuffle
for (let i = bricks.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  // Swap positions (x, y, col, row) but keep type/color/label
  const tmpX = bricks[i].x, tmpY = bricks[i].y, tmpC = bricks[i].col, tmpR = bricks[i].row;
  bricks[i].x = bricks[j].x; bricks[i].y = bricks[j].y; bricks[i].col = bricks[j].col; bricks[i].row = bricks[j].row;
  bricks[j].x = tmpX; bricks[j].y = tmpY; bricks[j].col = tmpC; bricks[j].row = tmpR;
}
```

Cela garantit que couleurs et types sont uniformément distribués sur la grille.

