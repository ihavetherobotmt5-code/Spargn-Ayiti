# 📂 Centre de Documentation de Spargn Ayiti

Bienvenue dans le répertoire de documentation de **Spargn Ayiti**. Afin de préserver la propreté de la racine du projet et d'offrir une clarté maximale aux développeurs et aux agents d'IA, la documentation est organisée ici de manière structurée.

---

## 📋 Table des Matières

1. [**Charte de l'IA (AGENTS.md)**](../AGENTS.md) : Les règles d'or et consignes de développement que chaque agent intelligent doit suivre avant toute modification de code.
2. [**Vision & Fonctionnalités (PROJECT.md)**](../PROJECT.md) : Présentation générale, public cible, et description des modules actuels de l'application.
3. [**Feuille de Route (ROADMAP.md)**](../ROADMAP.md) : Liste priorisée des futures versions de l'application (court, moyen et long terme).
4. [**Histoirique des Modifications (CHANGELOG.md)**](../CHANGELOG.md) : Journal de bord de toutes les modifications et versions publiées.
5. [**Stratégie de Produit (PRODUCT_STRATEGY.md)**](../PRODUCT_STRATEGY.md) : Stratégie d'engagement quotidien et adoption de l'application dans l'écosystème haïtien.

---

## 🛠️ Instructions de Pratique d'Ingénierie

Avant de modifier le code de cette application, assurez-vous de toujours :

1. **Lire `AGENTS.md`** à la racine pour vous conformer aux garde-fous de production.
2. **Lire `PROJECT.md`** à la racine pour comprendre l'écosystème fonctionnel.
3. **Lire `ROADMAP.md`** à la racine pour comprendre les prochaines étapes de l'architecture.
4. **Lire `CHANGELOG.md`** à la racine pour connaître les derniers ajouts.
5. **Lire `PRODUCT_STRATEGY.md`** à la racine pour aligner les fonctionnalités avec le parcours d'adoption.

---

## 🔒 Règles Cruciales de Déploiement (Railway)

* Le fichier `server.ts` et `package.json` sont configurés pour des constructions déterministes.
* Ne modifiez pas les scripts de démarrage de production sans validation.
* Assurez-vous d'avoir testé les dépendances localement avant chaque intégration continue.
