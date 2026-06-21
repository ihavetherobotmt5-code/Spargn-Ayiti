# PRODUCT_SPEC_V1_3.md - Spécifications Produit : Budget Intelligent (v1.3)

Ce document décrit de manière exhaustive la conception fonctionnelle, l'expérience utilisateur, les règles métier et l'architecture des données pour la version **v1.3 : Budget Intelligent & Enveloppes Flexibles**. En tant qu'Ingénieur Produit Senior, ce document prépare la transition d'un ensemble de fonctionnalités isolées vers un écosystème cohérent et intelligent.

---

## 🎯 1. Problème Utilisateur & Valeur Ajoutée

### Le Défi Haïtien
La majorité des Haïtiens évolue au sein d’une économie fluide et informelle. Les revenus proviennent du commerce de détail (*ti machann*), d'activités temporaires journalières (*jounalye*), ou de transferts de la diaspora. Demander à un utilisateur de saisir un "revenu mensuel stable" et d'y adosser un plan de dépenses mensuels est déconnecté des réalités quotidiennes.

### La Solution : La Répartition à la Source (Enveloppes Mobiles)
Au lieu de planifier sur l'avenir incertain, Spargn Ayiti propose une **budgétisation instantanée au moment de l’entrée d'argent**. Dès que l'utilisateur reçoit une somme (quelle qu'en soit la taille ou la provenance), il l'enregistre. L'application la distribue immédiatement dans 5 enveloppes de vie par pourcentages.

---

## 🖥️ 2. Écrans & Maquettes Conceptuelles (Wireframes)

L'interface de la version 1.3 sera intégrée dans un onglet dédié ou directement valorisée sur le tableau de bord avec des transitions fluides.

### Écran A : Le Widget "Rentrée d'Argent" (Ajout Rapide)
Un bouton d'ajout flottant (`+ Antre Lajan`) ouvre une boîte de dialogue simplifiée :
```
┌──────────────────────────────────────────────┐
│             SAISI SOU REVNI (HTG/USD)        │
├──────────────────────────────────────────────┤
│ Montant reçu : [ 5,000 ]  Devise : [ HTG ▾ ] │
│                                              │
│ Orijin (Provenance) :                        │
│ ( ) Komès/Vant       ( ) Travay Jounalye   │
│ ( ) Transfè (Fanmi)  (•) Salè Fixe           │
│ ( ) Lòt Orijin                               │
│                                              │
│ Profil Répartition (Profil Distribisyon) :   │
│ [ Mode Normal (Régime Courant) ▾ ]           │
│                                              │
│ Aperçu de la Répartition Auto :              │
│ 🍽️ Manje (35%)       : 1,750 HTG             │
│ 🚌 Wout/Transpò (15%) :   750 HTG             │
│ 🎓 Lekòl/Fanmi (20%)  : 1,000 HTG             │
│ 🏥 Fon Degaje (15%)   :   750 HTG             │
│ 🎯 Spargn (15%)       :   750 HTG             │
│                                              │
│ [ Anrejistre e Distribiye ⚡ ]               │
└──────────────────────────────────────────────┘
```

### Écran B : Le Tableau de Bord des Enveloppes (Anvlòp Finansyè)
Cinq cartes élégantes disposées en grille réactive. Chaque enveloppe présente son montant alloué actuel, son compteur de dépenses et une jauge de progression :
* 🔴 **Manje (Nourriture)** : `Alloué : 3,200 HTG | Dépensé : 1,200 HTG (Reste 2,000 HTG)` (Barre de chargement à 37%)
* 🔵 **Wout (Transport)** : `Alloué : 1,200 HTG | Dépensé : 1,050 HTG` (Barre orange, attention reste 150 HTG)
* 🟢 **Fon Degaje (Fonds d'urgence)** : `Alloué : 2,500 HTG` (Réservoir de sécurité intact)
* 🟡 **Lekòl / Fanmi** : `Alloué : 4,000 HTG | Dépensé : 0 HTG`
* ⭐ **Spargn (Épargne Objectifs)** : `Alloué : 1,940 HTG`

---

## 🛣️ 3. Parcours Utilisateur Détaillé

### Parcours : "Marie reçoit 1 500 Gourdes de son commerce"
1. **Déclencheur :** Marie vient de fermer sa journée de vente au marché de Pétion-Ville. Elle a fait 1 500 HTG de bénéfice net.
2. **Saisie (10 secondes) :** Elle ouvre Spargn Ayiti, tape son code PIN, clique sur `+ Antre Lajan`, tape `1500`, coche `Komès` et valide.
3. **Distribution automatique :** L'application applique le profil "Mode Normal". 
   - 525 HTG vont à la nourriture.
   - 225 HTG au transport.
   - 300 HTG à l'école des enfants.
   - 225 HTG au fonds d'urgence "Fon Degaje".
   - 225 HTG sont mis de côté pour son objectif d'épargne d'achat de marchandise.
4. **Retour Visuel :** Spargn Ayiti affiche un écran félicitant Marie en créole : *"Bèl travay ! 1 500 HTG ou yo byen separe. Epargn ou monte tou !"*. Son graphique d'analyse accumule un nouveau point d'entrée.

---

## 🗄️ 4. Modèles de Données (Data Models TypeScript)

Afin d'assurer la cohérence et de ne causer aucune régression, nous étendons `src/types.ts` avec les structures suivantes :

```typescript
// Provenances culturelles des revenus
export type IncomeSource = 'COMMERCE' | 'DAILY_LABOR' | 'TRANSFER' | 'SALARY' | 'OTHER';

// Modèle d'une entrée d'argent (Revenu)
export interface IncomeTransaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  source: IncomeSource;
  date: string; // YYYY-MM-DD
  profileId: string; // Profil de répartition appliqué
  splits: Record<string, number>; // enveloppeId: montant alloué en devise transaction
  note?: string;
}

// Modèle d'une Enveloppe Budgétaire
export interface BudgetEnvelope {
  id: string; // 'food' | 'transport' | 'family' | 'emergency' | 'saving'
  name: string; // Libellé en Français (ex: "Nourriture")
  nameKreyol: string; // Libellé en Kreyòl (ex: "Manje")
  percentage: number; // Pourcentage appliqué (ex: 35)
  allocatedAmount: number; // Cumul historique alloué (converti dans la devise de base locale, Gourdes)
  spentAmount: number; // Cumul historique dépensé (converti dans la devise de base locale, Gourdes)
  icon: string; // Nom de l'icône Lucide
}

// Profils de Répartition Flexibles
export interface DistributionProfile {
  id: string;
  name: string;
  nameKreyol: string;
  percentages: Record<string, number>; // idEnveloppe: pourcentage (La somme doit faire 100)
}
```

---

## 📐 5. Règles Métier & Logique de Répartition

### Règle 1 : La somme des pourcentages doit toujours égaler 100%
Lorsqu'un utilisateur ajuste manuellement les réglettes (sliders) de ses enveloppes, un recalcul dynamique ajuste temporairement les autres curseurs ou bloque la validation si la somme totale est différente de 100%.

### Règle 2 : Le calcul du "Score de Santé Financière" (Santé Finansyè)
Le score de santé est un indicateur de motivation noté sur 100 points :
1. **Régularité de l'épargne (40 points) :** S'incrémente de 5 points par semaine d'activité continue où au moins une contribution d'épargne a été faite.
2. **Alimentation du "Fon Degaje" (Emergency Reserve) (30 points) :** Proportionnel au volume de sécurité cumulé dans l'enveloppe d'urgence par rapport au niveau de dépenses mensuelles moyennes de l'utilisateur.
3. **Discipline des Enveloppes (30 points) :** Départ de 30 points. Moins 5 points pour chaque enveloppe en solde négatif (overdrawn), pour inciter à stabiliser ses dépenses.
*Aucune pénalité n'est infligée en cas d'absence d'entrées d'argent pour éviter toute culpabilisation de l'utilisateur.*

### Règle 3 : Les Profils de Répartition Flexibles
L'utilisateur peut basculer activement entre plusieurs profils préconçus :
1. **Normal (Régime Courant) :** Nourriture 35%, Épargne 15%, Urgences 15%, Scolarité 20%, Transport 15%.
2. **Kriz (Urgence absolue) :** Nourriture 50%, Urgences (Fon Degaje) 40%, Transport 10%, Scolarité 0%, Épargne 0%.
3. **Lekòl (Rentrée scolaire) :** Scolarité (Écolage) 45%, Nourriture 30%, Transport 10%, Urgences 10%, Épargne 5%.
4. **Biznis (Investissement) :** Épargne/Investissement 40%, Nourriture 30%, Transport 10%, Urgences 10%, Scolarité 10%.

---

## 🛡️ 6. Gestion des Cas Limites (Edge Cases)

### Cas Limite A : L'Inflation et Double Devises (USD / HTG)
* **Comportement attendu :** L'utilisateur peut saisir un revenu en Dollar USD (fréquent pour les transferts de la diaspora). L'application utilise la grille des taux d'échange instantanés (`rates` issus de `AppContext`) pour calculer la répartition exacte, puis convertit et incrémente l'enveloppe selon sa devise cible.

### Cas Limite B : Surcharger une enveloppe (Dépense supérieure au solde)
* **Comportement attendu :** L'application n'empêche jamais l'utilisateur d'acheter ou de déclarer une dépense vitale. Si une enveloppe devient négative, elle s'affiche en rouge et un assistant textuel ou un bouton propose d'effectuer un **"Fon Degaje"** (transférer le montant requis depuis l'enveloppe d'urgence ou de l'enveloppe épargne pour combler le déficit de l'enveloppe courante).

### Cas Limite C : Utilisation Hors-Connexion
* **Comportement attendu :** Toutes les opérations d'entrées et de dépenses par enveloppes s'effectuent via le state React et sont persistées en tâche de fond dans la clé `JSON` sécurisée du `localStorage`. L'absence de réseau n'affecte ni les animations, ni les équilibres mathématiques.

---

## 🧪 7. Spécifications des Tests Fonctionnels (Validation)

Avant toute intégration finale, les scénarios automatisés et manuels suivants devront impérativement être validés pour garantir une régression zéro :

1. **Test de Séparation Arithmétique :**
   * *Donnée d'entrée :* Revenu saisi de `10,000 HTG` sous le profil "Normal".
   * *Résultat attendu :* L'accumulateur de l'enveloppe Manje augmente exactement de `3,500 HTG`, Lekòl de `2,000 HTG`, Transport de `1,500 HTG`, Fon Degaje de `1,500 HTG`, et Epargn de `1,500 HTG`.
2. **Test de Cohérence Multilingue (HT/FR) :**
   * *Donnée d'entrée :* Changement de paramètre linguistique HT <-> FR.
   * *Résultat attendu :* Les titres des enveloppes basculent de "Nourriture" à "Manje" de manière fluide sans perte de mémoire ou d'état alloué.
3. **Test de Rétrocompatibilité :**
   * *Donnée d'entrée :* Objectifs d'épargnes préexistants générés avant la v1.3.
   * *Résultat attendu :* Ils restent intacts, éditables et continuent de comptabiliser leurs contributions déjà enregistrées. L'enveloppe "Spargn" vient nourrir le réservoir global disponible pour être injecté ensuite dans ces buts précis.
