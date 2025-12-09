# 🧠 SUPER PROMPT — SPÉCIFICATION COMPLÈTE V2  
### Generator README AI — Cahier des charges ultra détaillé pour GitHub Copilot  
**But :** Ce document est destiné à être collé tel quel dans GitHub Copilot (ou un fichier de contexte) pour générer l’architecture complète du projet, le code frontend + backend, ainsi que les fichiers de configuration et de documentation.

---

## 0. RÔLE ET COMPORTEMENT ATTENDU DE COPILOT

Tu es GitHub Copilot exécuté dans un environnement de développement.  
Tu dois :

- Lire **tout** ce document comme une **spécification contractuelle** du projet.  
- Ne pas ignorer de section.  
- Générer un code **complet, cohérent, typé, structuré**.  
- Créer **deux projets distincts** :
  - Un **frontend** (Next.js) dans un repo dédié.
  - Un **backend** (Node.js + Fastify + OpenAI GPT) dans un autre repo dédié.
- Implémenter :
  - le workflow Q&A côté frontend,
  - la logique IA côté backend,
  - la détection d’incohérences,
  - la génération du README,
  - les tests,
  - un fichier TODO.md,
  - la configuration Git et les commandes de push.

À chaque fois que c’est possible, tu dois :

- Écrire du code robuste, typé (TypeScript).
- Ajouter des commentaires explicites.
- Prévoir la lisibilité et l’évolutivité du projet.

---

## 1. OBJECTIF FONCTIONNEL DU PRODUIT

Le projet est un **assistant de génération de contexte de projet** pour développeurs.  
Il permet à un utilisateur de :

1. Répondre à une série de **questions structurées** (workflow Q&A).  
2. Construire un **JSON interne de description de projet** extrêmement complet.  
3. Envoyer ce JSON à un backend Node.js.  
4. Le backend utilise **GPT (API OpenAI)** pour :
   - enrichir le contexte,
   - détecter les incohérences,
   - proposer des compléments,
   - générer un **README.md** complet, prêt à être utilisé comme contexte pour Claude / Cursor / Copilot.  
5. Afficher le README dans le frontend, avec :
   - affichage Markdown,
   - possibilité de copier,
   - possibilité de télécharger,
   - possibilité de regénérer après modification des réponses.

**Important :**  
Dans cette version MVP, **aucune base de données** n’est utilisée.  
Le JSON de projet est maintenu côté frontend (Zustand) et transmis au backend à la demande.

---

## 2. ARCHITECTURE GLOBALE – VUE D’ENSEMBLE

### 2.1. Vue macro

Deux repos séparés :

- Repo 1 : `Generator-README-AI---Front`
- Repo 2 : `Generator-README-AI---Back`

Communication :

- Frontend → Backend via HTTP (fetch/axios).
- Backend → OpenAI API (GPT).

### 2.2. Frontend

- Framework : **Next.js 15+** (App Router).
- Langage : **TypeScript strict**.
- UI : **Tailwind CSS** + **shadcn/ui**.
- State management : **Zustand**.
- Forms : **React Hook Form** + **Zod**.
- Rendu Markdown : une lib type `react-markdown` ou équivalent.

### 2.3. Backend

- Node.js 22+.
- Framework HTTP : **Fastify** (ou Express si nécessaire, mais privilégier Fastify).
- Langage : **TypeScript strict**.
- OpenAI : SDK officiel `openai` (modèles GPT récents, par ex. gpt-4.1 ou gpt-4.1-mini selon besoin).
- Validation : Zod pour les payloads.

---

## 3. JSON INTERNE – SCHÉMA OFFICIEL ET DÉTAILLÉ

Ce JSON représente **la vérité absolue du projet** côté frontend et backend.  
Il doit être défini dans un type TypeScript partagé (répliqué sur front et back).

### 3.1. Schéma détaillé

```json
{
  "meta": {
    "projectName": "",
    "summary": "",
    "tooling": {
      "primaryAI": "gpt",
      "generateAIConfigs": true
    }
  },

  "stack": {
    "type": "frontend | backend | fullstack",
    "frontend": {
      "framework": "",
      "language": "",
      "libraries": []
    },
    "backend": {
      "framework": "",
      "language": "",
      "libraries": []
    },
    "database": {
      "type": null,
      "provider": null,
      "schemaFormat": "mermaid"
    },
    "architecture": "monolith | microservices | serverless | event-driven"
  },

  "auth": {
    "enabled": false,
    "methods": [],
    "roles": [],
    "permissions": {},
    "security": {
      "passwordPolicy": null,
      "rateLimiting": false,
      "twoFactorAuth": false
    }
  },

  "features": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "entities": [],
      "dependencies": [],
      "settings": {}
    }
  ],

  "entities": [
    {
      "name": "string",
      "description": "string",
      "fields": [
        {
          "name": "string",
          "type": "string | number | boolean | date | enum | json",
          "required": false,
          "unique": false,
          "default": null
        }
      ],
      "relations": [
        {
          "type": "one-to-one | one-to-many | many-to-many",
          "target": "string",
          "field": "string",
          "reverseField": "string"
        }
      ]
    }
  ],

  "api": {
    "type": "rest | graphql | none",
    "endpoints": [
      {
        "id": "string",
        "entity": "string",
        "path": "string",
        "methods": ["GET", "POST"],
        "authRequired": true,
        "description": "string"
      }
    ],
    "documentation": "swagger | postman | none"
  },

  "tests": {
    "unit": true,
    "integration": true,
    "e2e": true,
    "manualChecklists": true,
    "frameworks": ["jest", "playwright"]
  },

  "deployment": {
    "platform": "vercel | netlify | render | flyio | railway | aws",
    "ci": {
      "enabled": true,
      "provider": "github-actions | gitlab-ci | other"
    }
  },

  "documentation": {
    "readmeFormat": "full",
    "includeInstallGuide": true,
    "includeApiDocs": true,
    "includeArchitecture": true,
    "includeTests": true
  },

  "aiFiles": {
    "claude": {
      "enabled": false,
      "files": {}
    },
    "cursor": {
      "enabled": false,
      "files": {}
    },
    "copilot": {
      "enabled": true,
      "agents": []
    }
  },

  "integrity": {
    "conflicts": [],
    "warnings": [],
    "suggestions": []
  }
}
```

### 3.2. Implémentation TypeScript

Copilot doit :

- Créer un fichier `projectSchema.ts` côté frontend et backend.
- Y définir :
  - un type `ProjectSpec`.
  - un schéma Zod `projectSpecSchema`.
- Garantir la **synchronisation** des types front/back (copier-coller au besoin).

---

## 4. WORKFLOW Q&A — LISTE ÉTENDUE DES QUESTIONS

Le frontend doit implémenter un **workflow en plusieurs étapes**.  
Chaque étape correspond à une section du JSON interne.

### 4.1. Étape 1 — Informations générales

Questions :

1. `projectName`  
   - Type : texte court  
   - Obligatoire  
2. `summary`  
   - Type : texte long  
   - Obligatoire  
3. Type de projet ?
   - Options : frontend seul / backend seul / fullstack
4. Public cible ?
   - Type : texte long

### 4.2. Étape 2 — Stack technique

Questions :

1. Framework frontend principal ? (Next.js, React SPA, autre)  
   - Par défaut : Next.js  
2. Langage frontend ? (TypeScript, JavaScript)  
3. Framework backend ? (Express, Fastify, Nest, autre)  
4. Langage backend ? (TypeScript, JavaScript)  
5. Architecture :
   - monolith
   - microservices
   - serverless
   - event-driven  
6. Base de données (dans cette version : **toujours null** mais l’UI peut poser la question pour l’avenir).

### 4.3. Étape 3 — Authentification

Questions :

1. Activer l’authentification ? (oui/non)  
2. Si oui :  
   - Méthodes : email/password, OAuth, magic link, etc.  
   - Rôles : admin, user, guest, custom.  

### 4.4. Étape 4 — Fonctionnalités

L’utilisateur peut entrer une liste libre de fonctionnalités.  
Exemples :

- Gestion de projets
- Kanban
- Chat interne
- Upload de fichiers
- Notifications
- API publique
- Dashboard analytics

Le frontend doit présenter une liste de **fonctionnalités “basiques” prédéfinies** avec des checkboxes (auth, CRUD, recherche, filtres, tags, uploads, dashboard, notifications, etc.) et un champ texte libre.

### 4.5. Étape 5 — Entités & données

L’utilisateur peut :

- Ajouter des entités (User, Project, Task, etc.).  
- Pour chaque entité :
  - Nom
  - Description
  - Champs (nom, type, requis, unique, default)
  - Relations pré-définies (sélecteur simple)

### 4.6. Étape 6 — API

Questions :

1. Faut-il une API REST ?  
2. Faut-il une API GraphQL ?  
3. Pour chaque entité, auto-générer les endpoints CRUD (option booléenne).  
4. Possibilité d’énumérer des endpoints custom.

### 4.7. Étape 7 — Tests & qualité

Questions :

1. Souhaites-tu des tests unitaires ?  
2. Souhaites-tu des tests d’intégration ?  
3. Souhaites-tu des tests end-to-end ?  
4. Niveau de priorité : “fortement recommandé” ou “facultatif”.

### 4.8. Étape 8 — Résumé & validation

- Afficher un résumé complet du JSON interne.  
- Permettre d’éditer rapidement en cliquant sur une section.  
- Bouton “Générer le README”.

---

## 5. FRONTEND – SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES

### 5.1. Structure des dossiers

```
frontend/
  app/
    layout.tsx
    page.tsx              # accueil / introduction
    qna/
      layout.tsx          # layout pour toutes les étapes
      step-1-general/
      step-2-stack/
      step-3-auth/
      step-4-features/
      step-5-entities/
      step-6-api/
      step-7-tests/
      summary/
    result/
      page.tsx            # affichage du README
  components/
    ui/                   # composants shadcn
    form/                 # composants de formulaires
    qna/
      Stepper.tsx
      QuestionCard.tsx
      SectionHeader.tsx
      ConflictList.tsx
  lib/
    store/
      projectStore.ts
    api/
      backendClient.ts
  styles/
    globals.css
  README.md
```

### 5.2. Zustand – `projectStore.ts`

Le store doit contenir :

- `project: ProjectSpec`
- `updateMeta`, `updateStack`, `updateAuth`, `updateFeatures`, etc.
- `resetProject`
- `setConflicts` (pour recevoir les conflits renvoyés par le backend)

### 5.3. Comportement de navigation

- Utiliser le routeur Next (App Router).
- Empêcher l’accès au résumé si les étapes obligatoires ne sont pas complétées.
- Gérer les étapes via un enum interne ou un tableau d’étapes.

### 5.4. Appels au backend

Créer un module `backendClient.ts` avec fonctions :

- `generateReadme(project: ProjectSpec): Promise<string>`
- `detectConflicts(project: ProjectSpec): Promise<IntegrityResult>`
- `generateTestsPlan(project: ProjectSpec): Promise<TestsPlan>`

Aller-retour JSON strict, gestion des erreurs, affichage d’erreurs utilisateur.

### 5.5. Affichage du README

- Utiliser `react-markdown` (ou similaire).
- Présenter le README dans une `<div>` scrollable.
- Ajouter boutons :
  - “Copier”
  - “Télécharger (.md)”
  - “Régénérer”

---

## 6. BACKEND – SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES

### 6.1. Structure

```
backend/
  src/
    index.ts
    routes/
      generate.ts
      conflicts.ts
      tests.ts
    services/
      openaiClient.ts
      readmeBuilder.ts
      conflictDetector.ts
      testsPlanner.ts
    types/
      project.ts          # ProjectSpec (copié depuis le front)
  .env.example
  tsconfig.json
  package.json
  README.md
```

### 6.2. Routes

#### `POST /api/generate`

- Input : `ProjectSpec` complet.
- Action :
  - Valider le payload avec Zod.
  - Appeler `readmeBuilder` qui lui-même appelle l’API OpenAI.
  - Renvoi : `{ readme: string, conflicts?: IntegrityResult }`.

#### `POST /api/detect-conflicts`

- Input : `ProjectSpec`.
- Action :
  - Appeler `conflictDetector`.
- Renvoi : `{ conflicts: Conflict[], warnings: Warning[], suggestions: Suggestion[] }`.

#### `POST /api/tests-plan`

- Input : `ProjectSpec`.
- Action :
  - Appeler `testsPlanner`.
- Renvoi :
  ```json
  {
    "unitTests": [],
    "integrationTests": [],
    "e2eTests": [],
    "manualChecks": []
  }
  ```

### 6.3. Intégration OpenAI GPT

Créer `openaiClient.ts` :

- Charger `OPENAI_API_KEY` via `process.env`.
- Exporter une fonction `callGpt(prompt: string, options?: object)` qui :
  - Appelle l’API OpenAI (modèle gpt-4.1 ou gpt-4.1-mini).
  - Gère les erreurs.
  - Retourne le texte généré.

---

## 7. PROMPTING GPT – COMPORTEMENT

### 7.1. Génération du README

Le backend doit construire un prompt pour GPT qui inclut :

- Le JSON `ProjectSpec` (sous forme compressée ou résumé).
- Une consigne claire :
  - Générer un README structuré.
  - Respecter une structure imposée (voir ci-dessous).
  - Ne pas inventer de features non demandées sans les marquer comme “suggestions”.

### 7.2. Structure du README généré

Sections obligatoires :

1. Titre du projet  
2. Résumé  
3. Stack technique  
4. Fonctionnalités principales  
5. Détails fonctionnels  
6. Modèle de données (texte + pseudo-MCD)  
7. API (liste d’endpoints si présents)  
8. Tests recommandés  
9. Roadmap  
10. Notes complémentaires

---

## 8. DÉTECTION D’INCOHÉRENCES – RÈGLES TECHNIQUES

Le fichier `conflictDetector.ts` doit implémenter des règles **synchrones** (sans GPT) sur le JSON, par exemple :

1. **Auth sans roles**  
   - Condition : `auth.enabled === true` && `auth.roles.length === 0`  
   - Résultat : `conflict` avec suggestion : ajouter au moins un rôle.

2. **API sans backend**  
   - Condition : `api.type !== "none"` && `stack.type === "frontend"`  
   - Résultat : avertissement.

3. **Features mais aucune entité**  
   - Condition : `features.length > 0` && `entities.length === 0`  
   - Résultat : warning.

4. **Tests E2E activés sans API**  
   - Condition : `tests.e2e === true` && `api.type === "none"`  
   - Résultat : suggestion d’ajouter des endpoints.

Le résultat doit être structuré :

```ts
type Conflict = {
  type: "error" | "warning";
  code: string;
  message: string;
  suggestion?: string;
};
```

---

## 9. TESTS – EXIGENCES

### 9.1. Backend

- Tests unitaires sur `conflictDetector.ts`.
- Tests unitaires sur `readmeBuilder.ts` (sans appeler vraiment OpenAI → utiliser un mock).
- Tests d’intégration :
  - `POST /api/generate` avec un payload complet.
  - `POST /api/detect-conflicts` avec un payload volontairement incorrect.

Framework recommandé : **Jest**.

### 9.2. Frontend

- Tests de composants (au minimum Stepper + Form).  
- Tests E2E (Playwright ou Cypress) :
  - Parcourir toutes les étapes du Q&A.
  - Valider le bouton “Générer”.
  - Vérifier l’affichage du README.

---

## 10. INITIALISATION GIT & REPOS

### 10.1. FRONTEND

À la racine du projet frontend :

```bash
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:Matth-Ben/Generator-README-AI---Front.git
git push -u origin main
```

### 10.2. BACKEND

À la racine du projet backend :

```bash
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:Matth-Ben/Generator-README-AI---Back.git
git push -u origin main
```

---

## 11. FICHIER TODO.md (TÂCHES HORS CODE)

Copilot doit créer dans chaque repo un fichier `TODO.md` listant les tâches hors code.

### Contenu minimal attendu :

```md
# Tâches hors-code

## 1. OpenAI API
- Créer un compte sur platform.openai.com
- Créer une API key
- Ajouter la variable d'environnement dans le backend :
  - OPENAI_API_KEY="sk-..."

## 2. Frontend (Vercel)
- Créer un projet Vercel
- Connecter le repo GitHub Frontend
- Définir NEXT_PUBLIC_BACKEND_URL avec l’URL du backend

## 3. Backend (Render / Fly.io / Railway)
- Créer un service
- Déployer le backend
- Configurer OPENAI_API_KEY
- Autoriser CORS pour le domaine du frontend

## 4. Tests manuels
- Tester le Q&A complet
- Tester la génération du README
- Tester les scénarios avec incohérences
- Tester la re-génération après modification

## 5. Documentation interne
- Documenter comment ajouter une nouvelle question au workflow
- Documenter comment modifier le template du README
```

---

## 12. EXIGENCES FINALES POUR COPILOT

Copilot doit :

- Générer **tout le code** décrit dans ce document.
- Créer la structure des projets frontend et backend.
- Implémenter la logique du store, des routes, des appels API.
- Ajouter les fichiers de config nécessaires (tsconfig, eslint si possible, etc.).
- Générer un README initial pour chaque projet.
- Créer le fichier `TODO.md` avec les tâches hors code.
- Ajouter les commandes Git et préparer les projets pour push.

Le résultat attendu :  
Deux projets **fonctionnels**, **typiques d’un SaaS moderne**, directement exploitables, sans bugs structurels évidents, et alignés à 100 % avec cette spécification.
