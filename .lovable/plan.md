

## Plan : Mettre les labels du breadcrumb en majuscules

Le breadcrumb affiche "GUIDE" en majuscules mais "Mini Jeux", "Tutos" et "Développeur" en casse mixte. Il faut uniformiser.

### Modification dans `src/components/Layout.tsx`

Changer les labels dans la fonction `breadcrumb()` :
- `'Développeur'` → `'DÉVELOPPEUR'`
- `'Mini Jeux'` → `'MINI JEUX'`
- `'Tutos'` → `'TUTOS'`

