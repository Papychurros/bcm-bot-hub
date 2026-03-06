

## Plan : Auth session-only + sauvegarde manuelle des résultats

### Problèmes actuels
1. **Auth** : utilise `sessionStorage` — ok pour ne pas persister entre sessions, mais l'utilisateur veut que ça se reset aussi au rechargement. `sessionStorage` persiste au rechargement (elle ne se vide qu'à la fermeture de l'onglet). Il faut passer à un simple state React sans aucun stockage.
2. **Résultats QA** : auto-sauvegardés dans localStorage à chaque changement (ligne 51-53). L'utilisateur veut que la sauvegarde ne se fasse **que** au clic sur le bouton "Sauvegarder".

### Modifications

**1. `src/components/QAPasswordGate.tsx`**
- Supprimer `sessionStorage` de `useQAAuth`. L'état `authenticated` sera un simple `useState(false)` sans persistance. Chaque rechargement = re-saisie du mot de passe.

**2. `src/contexts/AppContext.tsx`**
- Supprimer le `useEffect` d'auto-save (lignes 50-53)
- L'initialisation depuis localStorage reste (pour charger les résultats sauvegardés précédemment)
- `saveResults` reste le seul moyen de persister dans localStorage (au clic bouton)

