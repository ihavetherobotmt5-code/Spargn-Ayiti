# ARCHITECTURE.md - Architecture Technique de Spargn Ayiti

Ce document décrit l'organisation technique, les choix d'architecture et les standards d'ingénierie de l'application **Spargn Ayiti**. Tout développeur ou agent d'IA doit se conformer rigoureusement à ces directives pour garantir la pérennité et la stabilité du système.

---

## 🏛️ 1. Vue d'Ensemble de l'Architecture

Spargn Ayiti utilise une architecture **Full-Stack unifiée (Single-Repo Express + Vite)** conçue pour être déployée instantanément sur **Railway** et d'autres plateformes Cloud Run :

```
                  ┌──────────────────────┐
                  │   Navigateur Client  │
                  │   (Vite + React)     │
                  └──────────┬───────────┘
                             │
            Requêtes HTTP /  │  Ressources Statiques
            API / Chat       │  (JS/HTML/CSS)
                             ▼
                  ┌──────────────────────┐
                  │   Serveur Express    │ (Port 3000, server.ts)
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │   API Google Gemini  │ (Modèle gemini-1.5-flash / gemini-2.0-flash)
                  └──────────────────────┘
```

### Stack Technique Principale
* **Frontend :** React 18, TypeScript, Tailwind CSS, Recharts (visualisation d'épargne), Lucide React (icônes), Motion (animations de transitions fluides).
* **Backend :** Express, Node.js, TS-Node (développement), Esbuild (packaging de production).
* **Intelligence Artificielle :** Google GenAI SDK (ou requêtes serveurs intermédiées) exploitant la clé d'environnement `GEMINI_API_KEY` ou `GEMINI_API_KEYa`.
* **Persistance :** Approche *Offline-First* basée sur l'API `localStorage` du navigateur. Cette décision stratégique évite de dépendre d'une connexion internet stable lors des saisies d'opérations quotidiennes.

---

## 📂 2. Organisation des Dossiers

La structure des fichiers respecte une séparation stricte entre la logique serveur (Backend) et l'interface utilisateur (Frontend) :

```
├── /                       # Racine du projet (Fichiers de configuration globaux)
│   ├── server.ts           # Point d'entrée du serveur Express (Backend)
│   ├── index.html          # HTML principal monté par Vite
│   ├── vite.config.ts      # Configuration du bundle Frontend
│   ├── package.json        # scripts de démarrage, build et dépendances
│   ├── AGENTS.md           # Instructions et règles d'or pour les IA
│   ├── PROJECT.md          # Vision et portée du projet
│   ├── ROADMAP.md          # Feuille de route et priorités d'évolution
│   ├── ARCHITECTURE.md     # Le présent guide technique
│   └── USER_JOURNEYS.md    # Parcours types et cas d'usage des utilisateurs
│
├── /docs/                  # Centre de documentation structuré
│
├── /assets/                # Assets globaux statiques (images, logos)
│
└── /src/                   # Logique applicative Frontend (React)
    ├── main.tsx            # Point d'entrée de montage React
    ├── index.css           # CSS global Tailwind
    ├── types.ts            # Définitions types et interfaces partagés (typescript)
    │
    ├── /pages/             # Écrans principaux (Vues autonomes)
    │   ├── Dashboard.tsx   # Tableau de bord principal (soldes, graphiques, raccourcis)
    │   ├── GoalsPage.tsx   # Liste et gestion des objectifs d'épargne
    │   ├── GoalDetail.tsx  # Analyse détaillée d'un objectif de financement
    │   └── SettingsPage.tsx# Paramètres (PIN, Devises, Mode hors-ligne)
    │
    ├── /components/        # Composants visuels génériques et réutilisables
    │   ├── PyasChatbot.tsx # Composant flottant de conversation IA
    │   ├── Header.tsx      # Barre de navigation et actions de sécurité
    │   └── PinLockScreen.tsx # Écran d'accueil de verrouillage par code PIN
    │
    └── /contexts/          # États globaux applicatifs (Gestion locale)
```

---

## 🔒 3. Gestion des Services et de la Sécurité

### A. Authentification et Confidentialité (Protection PIN)
* **Mécanisme :** Aucun identifiant lourd (email/mot de passe externe) n'est imposé par défaut pour éliminer la barrière d'entrée. 
* **Sécurité locale :** Les données sensibles (soldes, noms d'objectifs) sont protégées par le composant `PinLockScreen` qui gère l'état de verrouillage persistant en mémoire volatile (`sessionStorage`) pour ne pas importuner l'utilisateur à chaque rafraîchissement rapide, mais bloque l'accès si l'application est réouverte après fermeture.

### B. Moteur IA (Pyas Chatbot via Gemini)
* Le chatbot appelle l'API locale `/api/chat`.
* Le backend Express reçoit la requête, injecte l'invite système (*system instruction*) garantissant le ton créole chaleureux et l'orientation éducation financière locale, puis relaye la discussion avec l'API Gemini.
* **Sécurité des clés :** La clé API Gemini ne transite **jamais** en clair côté client. Le serveur utilise `process.env.GEMINI_API_KEY` ou `process.env.GEMINI_API_KEYa`. Si aucune clé n'est provisionnée sur le serveur, le chatbot accepte une clé de secours optionnelle fournie dans les en-têtes HTTP (`x-api-key`) par les utilisateurs avancés dans l'onglet paramètres.

---

## 📐 4. Conventions de Code et Règles Anti-Duplication

* **Clarté TypeScript :** L'usage de `any` est interdit. Tous les objets financiers (Contributions, Objectifs, Budgets) doivent se conformer aux types déclarés dans `src/types.ts`.
* **Pas de Duplication d'Interface :** Avant de créer un bouton, une boîte de dialogue ou un conteneur, vérifiez s'il existe déjà une structure similaire dans `/src/components/` ou utilisez les utilitaires d'assemblage Tailwind directement.
* **Traitement des devises :** Toujours passer par des fonctions de formatage centralisées prenant en compte la sélection utilisateur (Gourdes HTG, Dollar USD, Dollar Haïtien fictif).

---

## ⚡ 5. Principes de Performance et Compatibilité

* **Offline-First :** Les modifications d'état (ajouter une contribution, créer un but) doivent s'appliquer instantanément en local et mettre à jour le state React d'abord. Aucune animation ou transaction ne doit être bloquée par un appel réseau.
* **Légèreté du Bundle :** Limiter l'installation de bibliothèques tierces massives. Préférer assembler manuellement de petites transitions via Tailwind ou l'API native CSS.
* **Compatibilité Railway absolue :** Le script de production s'assure d'une compilation de type `Vite Build` plaçant les actifs statiques dans `/dist`. Le serveur Express (`server.ts`) distribue ces fichiers statiques en mode production. Ne changez pas cette configuration matérielle réseau (Port 3000, Hôte `0.0.0.0`).
