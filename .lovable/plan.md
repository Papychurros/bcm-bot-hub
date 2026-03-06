

## Plan : Nouvelle sidebar principale à gauche + sidebar contextuelle déplacée à droite

### Résumé
Remplacer le toggle GUIDE/DÉV. du header par une sidebar principale étroite à **gauche** (icônes + labels) avec 4 sections (Guide, Mini Jeux, Tutos YouTube, Développeur). La sidebar contextuelle existante (navigation bot/QA) sera déplacée à **droite** du contenu.

### Architecture visuelle

```text
┌──────────────────────────────────────────────────┐
│  HEADER (sans toggle GUIDE/DÉV.)                │
├────────┬──────────────────────────┬──────────────┤
│ MAIN   │                         │ CONTEXTUAL   │
│ SIDEBAR│    CONTENU PRINCIPAL     │ SIDEBAR      │
│ (left) │                         │ (right)      │
│ w-16   │                         │ w-64         │
│        │                         │              │
│ 📖Guide│                         │ Bot tabs     │
│ 🎮Jeux │                         │ Nav items    │
│ 🎬Tutos│                         │ ...          │
│ 🧪Dév. │                         │              │
└────────┴──────────────────────────┴──────────────┘
```

### Modifications

**1. `src/components/Layout.tsx`**
- Supprimer le bloc toggle GUIDE/DÉV. (lignes 90-105) du header
- Ajouter une sidebar principale **à gauche** : barre étroite (w-16) toujours visible (sauf sur mobile où elle reste dans le hamburger). 4 items : Guide (`/`), Mini Jeux (`/mini-jeux`), Tutos (`/tutos`), Développeur (`/qa`). Item actif surligné selon la route.
- Déplacer la sidebar contextuelle existante (lignes 110-221) **à droite** du contenu : `right-0` au lieu de `left-0`, `border-l` au lieu de `border-r`. Visible uniquement sur pages guide/qa avec contenu.
- Sur mobile : le hamburger ouvre les deux navigations (sidebar principale en haut + contextuelle en dessous, ou un seul panneau combiné).

**2. `src/pages/MiniJeuxPage.tsx`** (nouveau)
- Page placeholder : titre "Mini Jeux", message "Bientôt disponible 🎮"

**3. `src/pages/TutosPage.tsx`** (nouveau)
- Page placeholder : titre "Tutos YouTube", message "Bientôt disponible 🎬"

**4. `src/App.tsx`**
- Ajouter les routes `/mini-jeux` et `/tutos` dans le Layout

### Détails sidebar principale (gauche)
- Largeur fixe `w-16`, fond `bg-sidebar`, `border-r`
- 4 boutons empilés verticalement avec icône (lucide) + label court en dessous (text-[10px])
- Item actif : fond accent + couleur primaire
- Toujours visible sur desktop (y compris page home), dans le hamburger sur mobile

### Détails sidebar contextuelle (droite)
- Même contenu qu'aujourd'hui (bot tabs + nav groups pour guide, bot list pour QA)
- Position : `right-0`, `border-l` au lieu de `left-0 border-r`
- Sur mobile : slide depuis la droite (ou intégrée au menu hamburger)
- Cachée sur home et sur QA non authentifié (même logique actuelle)

