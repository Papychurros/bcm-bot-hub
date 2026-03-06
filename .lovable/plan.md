

## Plan : Modal jeu en plein écran couvrant toute la page

### Modifications dans `src/components/games/GameModal.tsx`

**1. Meta viewport temporaire**
- À l'ouverture : sauvegarder le `content` actuel de la meta viewport, puis le remplacer par `width=device-width, initial-scale=1, maximum-scale=1`
- À la fermeture : restaurer la valeur d'origine

**2. Container fixed plein écran**
- Remplacer le wrapper actuel (`z-[200]`, `p-4`, centré) par `position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999` — plus de padding, plus de `max-w`, plus de `max-h`, plus de `rounded`
- Le container intérieur devient aussi `w-full h-full` sans bordures arrondies ni max dimensions
- Le body du jeu prend `flex-1 overflow-auto` pour remplir l'espace restant

**3. Nettoyage à la fermeture**
- Restaurer la meta viewport originale
- Quitter le fullscreen (déjà en place)
- Remettre `overflow` sur body (déjà en place)

