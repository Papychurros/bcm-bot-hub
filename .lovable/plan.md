

## Correctif M.A.G Casse-Labels — 3 problèmes

### Fichier modifié : `src/components/games/BreakoutGame.tsx`

### Fix 1 — Labels réduits à 6
Ligne 11 : remplacer le tableau `LABELS` par `['Travail', 'Pub', 'Moi', 'Perso', 'Budget', 'Agenda']` et `LABEL_COLORS` par 6 couleurs correspondantes.

### Fix 2 — Icônes sur briques spéciales
Dans `draw()` (lignes 175-198), modifier le rendu des briques :
- **Bonus** : afficher `⭐` centré au lieu du label texte
- **Explosive** : afficher `💥` centré
- **Indestructible** : pas de texte, juste les hachures existantes
- **Résistante** : afficher le label normal (pioché dans LABELS) + petit `×N` en bas à droite (au lieu de remplacer le label par `×N`)

Dans `makeBricks` (ligne 98) : les briques résistantes gardent leur label aléatoire au lieu de `×${hits}`. Dans `update` (ligne 345) : ne plus écraser `b.label` quand on décremente les hits.

### Fix 3 — Canvas plein écran
Remplacer le conteneur fixe `max-w-[480px]` + aspect-ratio par un layout flex qui remplit tout l'espace disponible dans le GameModal :
- Conteneur principal : `flex flex-col flex-1 w-full h-full`
- Zone canvas : `flex-1 relative w-full` sans max-width, sans aspect-ratio fixe
- Ajouter un `ResizeObserver` sur le conteneur canvas pour lire `clientWidth`/`clientHeight` et mettre à jour les attributs `width`/`height` du canvas
- Toute la logique interne (briques, raquette, balle) utilise toujours les coordonnées logiques `W`/`H` mais celles-ci deviennent des `ref` dynamiques recalculées au resize
- `PAD_Y`, positions des briques, limites de balle : recalculées proportionnellement
- Les boutons tactiles restent en dessous du canvas

