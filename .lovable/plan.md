

## Plan : Améliorer l'alignement des cartes Mini Jeux

### Changements dans `src/pages/MiniJeuxPage.tsx` — composant `GameCard`

**1. Tags : texte centré et plus gros**
- Changer le tag `span` : ajouter `text-center w-fit` et augmenter la taille de `text-[10px]` à `text-xs`, ainsi qu'un padding vertical plus généreux (`py-1.5 px-4`).

**2. Aligner titres et descriptions avec des hauteurs fixes**
- Donner au titre une hauteur minimale fixe (`min-h-[56px]`) pour que tous les titres occupent le même espace vertical, même si "M.A.G Casse-Briques" prend 2 lignes.
- Donner à la description une hauteur minimale fixe (`min-h-[72px]`) pour uniformiser l'espace avant les tags.
- Cela remplace le `flex-1` sur la description : on garde `flex-1` mais on ajoute `min-h` pour garantir l'alignement.

### Résumé des modifications (fichier unique)

```
Ligne 50 (titre) :
- avant : className="text-xl font-bold tracking-tight mb-2.5"
- après : className="text-xl font-bold tracking-tight mb-2.5 min-h-[56px] flex items-start"

Ligne 51 (description) :
- avant : className="font-mono text-xs leading-relaxed text-muted-foreground flex-1"
- après : className="font-mono text-xs leading-relaxed text-muted-foreground flex-1 min-h-[72px]"

Lignes 52-54 (tag) :
- avant : className="inline-block mt-auto pt-5 font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full border"
- après : className="inline-flex items-center justify-center mt-auto pt-5 font-mono text-xs tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border"
```

