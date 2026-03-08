

## Correctif ennemis B.O.B Jump — Comportement Doodle Jump

### Problème
Les ennemis sont spawnés via des rolls aléatoires **à chaque frame** (4 types × check indépendant = plusieurs ennemis d'un coup). Résultat : clusters d'ennemis qui apparaissent en ligne. Dans le vrai Doodle Jump, les ennemis sont **placés sur ou près des plateformes**, espacés verticalement, comme des obstacles statiques.

### Solution
Passer d'un système de spawn par frame à un système **lié aux plateformes** :

1. **Supprimer le spawn par frame** (lignes 247-277) — plus de `getEnemySpawnRate` ni de rolls aléatoires par tick

2. **Attacher les ennemis aux plateformes à la génération** — dans la boucle `while` qui génère les plateformes (lignes 236-243), après avoir créé une plateforme, rouler un dé pour y placer un ennemi :
   - Score < 2000 : aucun ennemi
   - Score 2000-5000 : 3% de chance → `ground` uniquement
   - Score 5000-8000 : 5% de chance → `ground` ou `flying`
   - Score 8000-12000 : 7% → `ground`, `flying`, ou `ufo`
   - Score 12000+ : 8% → tous types y compris `blackhole`
   - **Minimum 400px d'écart vertical** entre deux ennemis (via `lastEnemySpawnY`)
   - Ne pas placer d'ennemi sur les plateformes `breakable` ou `vanishing`

3. **Comportement des ennemis** :
   - `ground` : marche sur sa plateforme (déjà OK)
   - `flying` : spawn 30-50px au-dessus de la plateforme, oscille horizontalement (déjà OK)
   - `ufo` : spawn au-dessus, **ne traque plus le joueur** — oscille lentement horizontalement comme dans le vrai jeu
   - `blackhole` : statique au-dessus de la plateforme (déjà OK sans le tracking)

4. **Supprimer `getEnemySpawnRate`** — plus nécessaire

### Fichier modifié
`src/components/games/DoodleJumpGame.tsx` — refonte du système de spawn ennemi

