

## Plan : Synchroniser le breadcrumb avec la section active

Le problème : le breadcrumb en haut affiche toujours "GUIDE" même quand on est sur Mini Jeux ou Tutos. Il devrait refléter la section active de la barre latérale gauche.

### Modification dans `src/components/Layout.tsx`

**Breadcrumb (lignes 60-69)** : remplacer la logique pour afficher le nom correct selon la route :
- `/mini-jeux` → "Mini Jeux"
- `/tutos` → "Tutos"  
- `/qa` → "Développeur"
- Sinon → "GUIDE"

```ts
// Avant
if (isQA) parts.push('Développeur');
else parts.push('GUIDE');

// Après
if (isQA) parts.push('Développeur');
else if (location.pathname.startsWith('/mini-jeux')) parts.push('Mini Jeux');
else if (location.pathname.startsWith('/tutos')) parts.push('Tutos');
else parts.push('GUIDE');
```

Un seul fichier modifié, une seule ligne de logique ajoutée.

