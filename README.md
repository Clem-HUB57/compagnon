# Compagnon

> De petites quêtes aujourd’hui. Des compétences pour la vie.

Application web ludique (prototype) qui aide les enfants à réaliser leurs routines du quotidien, étape par étape, accompagnés d’une petite créature qui évolue sur son île.

**Compagnon n’est pas un dispositif médical.** Il ne diagnostique, ne traite et ne guérit aucun trouble. C’est un outil pour faciliter le quotidien, destiné à des tests en famille.

## Démarrage rapide

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install          # installe les dépendances
npm run dev          # lance l’application en développement → http://localhost:5173
```

Pour l’ouvrir sur un téléphone du même réseau Wi-Fi : `npm run dev -- --host`, puis ouvrir l’adresse « Network » affichée.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Version de production installable (PWA) dans `dist/` |
| `npm run preview` | Sert la version de production → http://localhost:4173 |
| `npm run build:demo` | Version « fichier unique » sans service worker dans `dist-demo/` (pour un lien de démonstration) |
| `npm test` | Tests unitaires et d’interface (Vitest) |
| `npm run build && npx playwright test` | Tests de bout en bout (Playwright, mobile + ordinateur) |

## Installer sur téléphone ou tablette

Hébergez le dossier `dist/` sur n’importe quel hébergement statique en HTTPS (GitHub Pages, Netlify, Cloudflare Pages…), puis :

- **iPhone / iPad** : Safari → bouton Partager → « Sur l’écran d’accueil ». Important : une fois installée, l’application garde ses données plus durablement (Safari peut effacer les données d’un site peu visité).
- **Android** : Chrome → menu ⋮ → « Installer l’application ».

Un appareil = un enfant. Les données restent sur l’appareil ; pensez à exporter une sauvegarde (Espace parent → Données).

## Architecture

```
src/
  types.ts            Modèle de données (Routine, Step, Session, Progression, Preferences…)
  data/               Contenu : routines d’exemple, objets à gagner, compagnons, messages
  logic/
    engine.ts         Logique métier pure (sessions, XP, niveaux, trouvailles, estompage, import/export)
    progression.ts    Seuils de niveaux et paliers du monde
  store/
    useApp.ts         État global (Zustand) + navigation
    storage.ts        Persistance IndexedDB (idb-keyval)
  art/                Illustrations SVG originales (compagnons, accessoires, île, routines)
  components/         Composants d’interface réutilisables
  screens/            Écrans enfant (accueil, aventures, mission, fin, cabane) et espace parent
  lib/                Sons synthétisés, lecture à voix haute, préférences d’animation
tests/                Vitest (logique, stockage, parcours d’interface)
e2e/                  Playwright (parcours complet avec actualisation)
```

Choix structurants :

- **Aucun backend, aucune API externe.** Tout fonctionne hors ligne une fois chargé. Stockage local IndexedDB, écrit immédiatement après chaque action.
- **Logique métier pure et testée**, séparée de l’interface : une étape ne rapporte des XP qu’une fois par session, les XP ne diminuent jamais, une session interrompue reprend où elle s’était arrêtée.
- **Illustrations 100 % SVG locales**, aucune image externe.
- **Sons générés par le navigateur** (Web Audio) et **voix** via la synthèse vocale du système : gratuits et sans réseau.

## Principes de conception appliqués

- Une seule étape à l’écran ; liste complète accessible discrètement.
- Récompense immédiate et brève (1–2 s) ; célébration plus riche en fin de routine.
- Aide au démarrage : étape plus facile, consigne pour commencer, pause sans pénalité.
- Aucune série quotidienne, aucun classement, aucun compte à rebours, aucune perte de progression.
- Récompenses : l’île pousse à chaque routine ; à chaque niveau, l’enfant **choisit** un objet parmi 2 ou 3 ; des **trouvailles** (bouteille sur la plage) récompensent des stratégies (reprendre après une pause, demander de l’aide, essayer une nouvelle routine, passer en autonomie). Jamais de tirage au sort ni de boutique.
- **Estompage** : après 3 réussites, l’app propose le mode condensé (2–3 blocs), puis autonome (une seule validation, avec un écusson). Toujours proposé, jamais imposé, réversible.
- Messages qui valorisent l’effort et la stratégie, formulés sans genre.

## Données d’exemple

Les 7 routines fournies (3 « école/rangement » demandées + 4 tâches de maison) sont marquées **Exemple** dans l’espace parent et entièrement modifiables. « Réinitialiser la démonstration » les restaure.

## Limites connues

- Pas de synchronisation entre appareils (choix de confidentialité pour le MVP).
- La protection de l’espace parent est une simple question de calcul, pas une authentification.
- La qualité de la voix dépend des voix françaises installées sur l’appareil.
- Dans la version « lien de démonstration », l’export JSON peut être bloqué par le cadre d’affichage ; il fonctionne dans la version installée.
