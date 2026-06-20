# CHANGELOG.md - Historique des Versions de Spargn Ayiti

Toutes les modifications notables apportées au projet **Spargn Ayiti** seront consignées dans ce fichier. Le format est inspiré par [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et ce projet respecte les principes de versionnage sémantique.

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
