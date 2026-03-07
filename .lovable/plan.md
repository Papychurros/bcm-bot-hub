

## Correctif IA — Tennis de Bot

### Probleme
L'IA utilise `clamp(bdiff * 0.06, -diff.botSpeed, diff.botSpeed)` — un mouvement proportionnel amorti qui donne un comportement flottant/aléatoire au lieu d'un suivi direct de la balle.

De plus, l'IA suit `s.ball.y` (position verticale) alors que les raquettes sont horizontales et se déplacent sur l'axe X — elle devrait suivre `s.ball.x`.

### Changements — `src/components/games/PongGame.tsx`

**1. Mettre à jour les vitesses de réaction dans DIFFICULTIES**

| Difficulté | Actuel | Nouveau |
|---|---|---|
| Facile | 1.2 | 1.5 |
| Moyen | 1.8 | 3.5 |
| Difficile | 3.2 | 6.5 |
| MDR | 999 | 999 |

**2. Réécrire la logique IA (lignes 88-96)**

Remplacer le calcul proportionnel par un suivi direct :
- Cibler `s.ball.x` (pas `s.ball.y`) car les raquettes se déplacent horizontalement
- Calculer `diff = targetX - botCenter`
- Si `|diff| > 2` : déplacer de `sign(diff) * min(|diff|, aiReactionSpeed)`
- Sinon : ne pas bouger (dead zone pour éviter le jitter)
- Clamper entre `0` et `W - botPadH`
- MDR : téléportation instantanée sur `s.ball.x`

