

## Correctif Score B.O.B Jump

### Problème actuel
Line 176: `s.score += Math.floor(diff * 0.1)` — le score augmente proportionnellement au déplacement de la caméra, pas à la hauteur maximale. Cela donne des incréments irréguliers et non proportionnels à la vraie progression.

### Solution

**Ajouter un champ `maxHeight`** au state (initialisé à 0 au `start()`).

**Remplacer le calcul de score basé sur la caméra** (ligne 176) par un système basé sur la hauteur max :

```text
À chaque frame :
  currentHeight = -player.y (plus haut = plus négatif en canvas)
  if currentHeight > maxHeight:
    score += currentHeight - maxHeight
    maxHeight = currentHeight
```

Le score ne diminue jamais car on ne met à jour que quand le joueur dépasse son record de hauteur.

### Changements dans `src/components/games/DoodleJumpGame.tsx`

1. **State** : ajouter `maxHeight: 0` dans `stateRef` (ligne 81)
2. **Reset** : `s.maxHeight = 0` dans `start()` (ligne 121)
3. **Score de hauteur** (ligne 174-177) : remplacer `s.score += Math.floor(diff * 0.1)` par :
   - Calculer `currentHeight = -s.player.y` (position absolue, pas relative à la caméra)
   - Si `currentHeight > s.maxHeight` : `s.score += Math.round(currentHeight - s.maxHeight)`, puis `s.maxHeight = currentHeight`
   - Garder le déplacement caméra tel quel (c'est le viewport, pas le score)
4. **Points bonus inchangés** : power-up (+25), stomp ennemi (+100), projectile kill (+50) restent identiques

