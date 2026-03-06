

## Plan : Remettre la SearchBar à sa position d'origine sur desktop/tablette

La SearchBar a été déplacée juste après l'icône Home, ce qui affecte aussi le desktop. Il faut la remettre à sa position d'origine (après le breadcrumb) sur desktop/tablette, tout en gardant l'icône loupe à côté de Home sur mobile.

### Modification dans `src/components/Layout.tsx`

Ligne 87 : déplacer `<SearchBar />` après le breadcrumb, entre le breadcrumb et le premier `<div className="flex-1" />`. L'ordre redevient :

1. Home
2. Breadcrumb (desktop)
3. SearchBar (desktop inline + mobile icône loupe)
4. `flex-1` spacer
5. Logo BCM
6. `flex-1` spacer
7. Theme toggle

