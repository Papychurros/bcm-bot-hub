

## Bouton "Code GIF" + Modal Emoji Codes

### Fichiers à créer
**`src/components/EmojiCodesModal.tsx`** — Modal Dialog (même pattern que `AboutBobModal`) contenant les 15 cartes emoji codes recréées en JSX/Tailwind (pas d'iframe HTML brut). Données en tableau inline, grille responsive, style néon sombre fidèle au HTML fourni.

### Fichiers à modifier
**`src/pages/QAHome.tsx`** — Ajouter un bouton "Code GIF" (icône `Keyboard`) à gauche du bouton Sauvegarder, avec state `useState` pour ouvrir/fermer le modal.

**`src/pages/QABotPage.tsx`** — Idem, bouton "Code GIF" à côté de Sauvegarder.

### Détails
- Le bouton aura un style outline avec bordure dorée `#f0c040` pour rappeler le thème du HTML
- La modal affiche une grille de cartes avec code, label, emoji et bordure colorée par thème — tout en React/Tailwind, pas d'iframe
- Les 15 entrées (777 Casino, 666 Diablo, 420 Snoop, etc.) sont codées en dur dans le composant modal

