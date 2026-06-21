# CHANGELOG.md - Historique des Versions de Spargn Ayiti

Toutes les modifications notables apportées au projet **Spargn Ayiti** seront consignées dans ce fichier. Le format est inspiré par [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet respecte les principes de versionnage sémantique.

---

## [1.2.5] - 2026-06-20
### Ajouté / Modifié
- **Restructuration de la Feuille de Route (`ROADMAP.md` / `docs/ROADMAP.md`) :**
  - Alignement des priorités de développement sur un cadre stricte de versions jalonnées de v1.3 à v1.7.
  - Définition fonctionnelle du **Budget Intelligent (v1.3)** basé sur de petites rentrées fluides avec Enveloppes budgétaires automatiques ajustables et introduction du **Score de Santé Financière**.
  - Intégration de la philosophie d'ingénierie produit senior (*Product Engineer*) suggérant des évolutions justifiées par la valeur ajoutée pour l'utilisateur, préservant la rétrocompatibilité et favorisant la persistance locale *Offline-First* résiliente.

---

## [1.2.0] - 2026-06-20
### Ajouté
- Établissement de la documentation technique et d'engagements à la racine :
  - **`ARCHITECTURE.md`** : Guide complet sur l'architecture technique, structure des dossiers, conventions de nommage et sécurité par code PIN.
  - **`USER_JOURNEYS.md`** : Modélisation des parcours d'utilisation types (Onboarding, Routine Quotidienne rapide de 15 secondes, Analyse Hebdomadaire guidée par Pyas).
- Mise à jour du centre de documentation dans `/docs/` avec les nouveaux guides de planification technique et produit.

---

## [1.1.0] - 2026-06-20
### Ajouté
- Création de la documentation structurelle à la racine du projet :
  - **`AGENTS.md`** : Règles de développement et d'ingénierie pour les agents d'IA.
  - **`PROJECT.md`** : Alignement de la vision globale, des fonctionnalités principales et des objectifs de Spargn Ayiti.
  - **`ROADMAP.md`** : Feuille de route hiérarchisée des futures fonctionnalités à développer par priorité.
  - **`PRODUCT_STRATEGY.md`** : Stratégie d'engagement quotidien et adoption de l'application dans l'écosystème haïtien doté d'une économie majoritairement informelle.
  - **`CHANGELOG.md`** : Fichier de suivi de version pour documenter de manière rigoureuse chaque modification.
- Configuration du projet pour supporter les clés serveur globales avec la variable réseau `GEMINI_API_KEYa` pour le chatbot.

---

## [1.0.0] - 2026-06-20
### Ajouté
- **Pyas Chatbot 💬** : Chatbot intelligent intégré avec l'API Gemini prenant en charge le créole haïtien et le français.
- **Gestionnaire d'Épargne 🎯** : Ajout d'objectifs personnalisés, de barres de progression dynamiques, et suivi des contributions (dépôts/retraits).
- **Graphiques de Projection 📈** : Graphique d'évolution prévisionnelle d'épargne avec Recharts.
- **Sécurité PIN 🔒** : Écran de verrouillage par code PIN pour protéger la confidentialité des comptes locaux.
- **Sélecteur de Devises ⚙️** : Intégration dans les paramètres du choix entre la Gourde haïtienne (HTG) et le Dollar américain/haïtien (USD/DS).
- **Structure Full-Stack 🚀** : Serveur Express (`server.ts`) configuré pour le routage de l'API chatbot et l'environnement de production optimisé pour Railway.
- **Fichier de configuration** : Initialisation d'un fichier `.env.example` propre pour modéliser les clés API secrètes de l'assistant.
