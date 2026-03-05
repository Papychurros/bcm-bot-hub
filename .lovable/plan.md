

## Easter egg "666" — Animation de flammes

### Comportement
- Quand l'utilisateur tape "666" dans le champ mot de passe, une animation plein écran de flammes se déclenche pendant 5 secondes
- Les flammes montent depuis le bas avec des couleurs orange/rouge/jaune
- Après 5 secondes, les flammes disparaissent en fade-out et le champ se vide
- Pas de navigation, pas d'accès à la page

### Implémentation technique

**`src/components/QAPasswordGate.tsx`** :
- Ajouter un state `hellfire` (boolean)
- Dans le `onChange` du champ, détecter quand la valeur vaut `"666"` → déclencher l'animation (`setHellfire(true)`)
- Après 5 secondes via `setTimeout` : `setHellfire(false)` + `setPassword('')`
- Rendre un overlay conditionnel `{hellfire && <div className="hellfire-overlay">...</div>}` en `fixed inset-0 z-50` avec plusieurs `<div>` de flammes animées (pseudo-layers de gradients qui montent)

**`src/index.css`** — Ajouter les keyframes et classes :
- `@keyframes flame-rise` : translateY de 100% à -20% avec oscillation d'opacité
- `@keyframes flame-flicker` : légère variation de scale/opacity pour effet organique
- `.hellfire-overlay` : fixed, plein écran, z-50, pointer-events-none
- 3-4 layers de flammes avec des gradients `radial-gradient` rouge/orange/jaune, décalés en timing pour un effet réaliste
- Animation de fade-out à la fin

### Fichiers modifiés
1. `src/components/QAPasswordGate.tsx` — Logique de détection "666" + rendu overlay flammes
2. `src/index.css` — Keyframes et classes CSS pour l'animation de flammes

