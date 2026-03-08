

## Ajustements gameplay B.O.B Jump

### 1. Plateformes trop éloignées
`getPlatSpacing` (ligne 46-50) retourne jusqu'à `[100, 150]` et le `maxGap` (ligne 239) est `178 * 0.85 = 151px`. Le saut standard (`JUMP = -8`, `GRAVITY = 0.18`) permet d'atteindre ~178px de hauteur max. Avec 151px de gap, il n'y a quasiment aucune marge d'erreur.

**Fix** : Réduire les espacements et le maxGap :
- Score < 3000 : `[50, 75]` (était `[60, 90]`)
- Score < 8000 : `[65, 100]` (était `[80, 120]`)
- Score 8000+ : `[80, 125]` (était `[100, 150]`)
- maxGap : `178 * 0.72` soit ~128px (était 151px)

### 2. Plateformes cassables — un rebond avant de casser
Ligne 194 : `if (p.type === 'breakable') { p.broken = true; continue; }` — la plateforme casse immédiatement sans laisser le joueur sauter.

**Fix** : Ajouter un compteur `bounceCount` à l'interface `Platform`. Au premier contact, incrémenter le compteur et permettre le saut normal. Au deuxième contact (ou si `bounceCount >= 1`), casser la plateforme. Visuellement, la plateforme tremble/clignote après le premier rebond.

### 3. Mouvement horizontal plus rapide
Ligne 151-152 : `vx = 3` pour gauche/droite.

**Fix** : Passer à `vx = 4` (était 3).

### 4. Projectiles plus rapides
Ligne 272 : `y: p.y - 6` — vitesse de tir.

**Fix** : Passer à `y: p.y - 9` (était -6, +50% plus rapide).

### Fichier modifié
`src/components/games/DoodleJumpGame.tsx` — 4 zones modifiées, aucun nouveau fichier.

