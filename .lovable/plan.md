

## Delta Time Fix pour B.O.B Jump

### Problème
`requestAnimationFrame` appelle `render` → `update` une fois par frame sans tenir compte du temps écoulé. Sur un écran 144hz, la physique tourne 2.4× plus vite que sur 60hz.

### Solution
Ajouter un `lastTime` au state ref. Dans `render`, calculer `delta = now - lastTime`, plafonner à 50ms, puis calculer `dt = delta / (1000/60)` (= 1.0 à 60fps). Passer `dt` à `update` et multiplier toutes les valeurs de physique par `dt`.

### Zones modifiées dans `src/components/games/DoodleJumpGame.tsx`

1. **State ref** : ajouter `lastTime: 0` au stateRef
2. **`render`** (ligne ~593) : calculer le delta, passer `dt` à `update()`, stocker `lastTime`
3. **`start`** : réinitialiser `lastTime = 0`
4. **`update(dt)`** — multiplier par `dt` :
   - Gravité : `GRAVITY * dt`
   - Vitesse joueur : `vx = -4 * dt` / `4 * dt`, friction `0.85^dt` → `Math.pow(0.85, dt)`
   - Jetpack : `vy = -5 * dt` → décrémenter `jetpackTimer -= dt`
   - Déplacement : `player.x += vx * dt`, `player.y += vy * dt` (la gravité est déjà accumulée, donc seul le déplacement est multiplié en plus de l'accumulation)
   - Plateformes mobiles : `p.x += dir * speed * dt`
   - Ennemis : `e.x += dir * speed * dt`
   - Projectiles : `y - 9 * dt`
   - Vanish/break timers : décrémenter par `dt` au lieu de 1
   - Particules : `vx * dt`, `vy * dt`, `gravity * dt`, `life -= dt`

**Approche simplifiée** : plutôt que de multiplier chaque valeur individuellement, on accumule les frames manquées. Si `dt > 1`, on exécute la logique `Math.floor(dt)` fois avec un pas fixe de 1, ce qui garantit un comportement identique au 60fps sans toucher à chaque ligne de physique. C'est plus sûr pour un jeu canvas complexe.

**Implémentation choisie** : fixed timestep accumulator
- Accumuler le delta dans un buffer
- Exécuter `update()` (inchangé) en boucle tant que le buffer ≥ 16.67ms
- Maximum 3 steps par frame pour éviter la spirale de mort
- Aucune modification dans `update()` lui-même → zéro risque de casser le gameplay mobile

### Fichier modifié
`src/components/games/DoodleJumpGame.tsx` — modifications dans `render` et `stateRef` uniquement.

