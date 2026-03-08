

## Correctif ennemis B.O.B Jump

### Problème 1 — Trop d'ennemis simultanés

**Actuel** (ligne 267): `s.enemies.length < 5` — plafond fixe de 5 ennemis total (y compris hors écran), pas adapté au score.

**Fix**: Cap progressif basé sur le score, comptant uniquement les ennemis **visibles** à l'écran :

| Score | Max ennemis visibles |
|-------|---------------------|
| < 5000 | 2 |
| < 10000 | 3 |
| 10000+ | 4 |

Compter les ennemis dont `ey` est entre `-50` et `H + 50` (zone visible avec marge). Ne spawner que si `visibleEnemies < maxEnemies`.

### Problème 2 — Spawn dans le champ de vision

**Actuel** (ligne 250): `const ey = s.cameraY - 20` — seulement 20px au-dessus du bord visible. Les ennemis pop sous les yeux du joueur. Les ennemis `ground` sont aussi spawnés sur des plateformes **visibles** (`p.y - s.cameraY < H * 0.3`).

**Fix**: Spawn à `cameraY - 80` (80px au-dessus du viewport). Pour les ennemis `ground`, ne chercher des plateformes que dans la zone invisible au-dessus de l'écran (`p.y - s.cameraY` entre `-80` et `-10`). Les blackholes ne reçoivent plus le `+50` en Y.

### Changements — `src/components/games/DoodleJumpGame.tsx`

**Lignes 247-270** — Réécrire le bloc de spawn :

```tsx
// Enemy spawning — progressive max cap & off-screen spawn
const maxEnemies = s.score < 5000 ? 2 : s.score < 10000 ? 3 : 4;
const visibleEnemies = s.enemies.filter(e => {
  const ey = e.y - s.cameraY;
  return ey > -50 && ey < H + 50;
}).length;

const rates = getEnemySpawnRate(s.score);
const spawnMargin = 80;
const spawnEnemy = (type: EnemyType) => {
  const ey = s.cameraY - spawnMargin;
  if (type === 'ground') {
    const candidates = s.platforms.filter(p =>
      p.y - s.cameraY < -10 && p.y - s.cameraY > -spawnMargin && p.type === 'normal'
    );
    if (candidates.length > 0) {
      const cp = candidates[Math.floor(Math.random() * candidates.length)];
      s.enemies.push({ x: cp.x + cp.w/2 - 12, y: cp.y - 24,
        w: 24, h: 24, type, dir: 1, speed: 0.8, hp: 1 });
    }
  } else if (type === 'flying') {
    s.enemies.push({ x: Math.random()*(W-30), y: ey,
      w: 28, h: 20, type, dir: Math.random()<0.5?1:-1, speed: 1.2, hp: 1 });
  } else if (type === 'ufo') {
    s.enemies.push({ x: W/2-18, y: ey,
      w: 36, h: 24, type, dir: 0, speed: 0.5, hp: 3 });
  } else if (type === 'blackhole') {
    s.enemies.push({ x: Math.random()*(W-40)+20, y: ey,
      w: 32, h: 32, type, dir: 0, speed: 0, hp: 999 });
  }
};
for (const [type, rate] of Object.entries(rates)) {
  if (rate > 0 && Math.random() < rate && visibleEnemies < maxEnemies) {
    spawnEnemy(type as EnemyType);
  }
}
```

Un seul bloc remplacé, aucun autre fichier impacté.

