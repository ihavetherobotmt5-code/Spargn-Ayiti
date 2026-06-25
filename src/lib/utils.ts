// src/lib/utils.ts

/**
 * Génère un identifiant unique simple.
 * Compatible avec tous les navigateurs.
 * Évite l'utilisation de crypto.randomUUID().
 */
export function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

/**
 * Formate une date selon la locale de l'utilisateur.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat().format(date);
}

/**
 * Formate un nombre sans symbole monétaire.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}
