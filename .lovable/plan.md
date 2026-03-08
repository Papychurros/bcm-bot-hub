

## Réduire la hauteur du saut ressort

**Problème** : `JUMP * 3 = -24` propulse le joueur trop haut (~533px), ce qui fait traverser plusieurs écrans d'un coup et atterrir sur des ennemis imprévus.

**Fix** : Réduire le multiplicateur du ressort de `3` à `2` dans `src/components/games/DoodleJumpGame.tsx` (ligne 207).

| | Avant | Après |
|---|---|---|
| Ressort velocity | `JUMP * 3` = -24 | `JUMP * 2` = -16 |
| Hauteur max | ~533px | ~356px |

Cela donne un boost significatif mais contrôlable — le joueur saute environ 2× plus haut qu'un saut normal au lieu de 3×, ce qui laisse le temps de voir et réagir aux ennemis.

### Changement unique
**Ligne 207** : `s.player.vy = JUMP * 3` → `s.player.vy = JUMP * 2`

