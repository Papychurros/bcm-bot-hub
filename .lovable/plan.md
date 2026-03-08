

## Augmenter légèrement la fréquence des ennemis

Les taux actuels sont un peu bas, surtout dans la tranche 8000-15000. Voici les ajustements (environ +2-3% par palier) :

| Score | Avant | Après |
|-------|-------|-------|
| < 2000 | 0% | 0% (inchangé) |
| 2000-5000 | 3% | 4% |
| 5000-8000 | 5% | 7% |
| 8000-12000 | 7% | 10% |
| 12000-15000 | 8% | 12% |
| 15000-20000 | 10% | 14% |
| 20000-30000 | 12% | 16% |
| 30000+ | 15% | 18% |

Aussi réduire le `minEnemyGap` un peu plus tôt : 350px dès 10000 au lieu de 15000.

### Fichier modifié
`src/components/games/DoodleJumpGame.tsx` — fonctions `getEnemyChance` et `getMinEnemyGap` uniquement.

