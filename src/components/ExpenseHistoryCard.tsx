// src/components/ExpenseHistoryCard.tsx

import React from 'react';
import { ArchivedExpense } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';
import { Undo2, Trash2, Calendar, Tag, Archive } from 'lucide-react';

/**
 * Props pour la carte d'historique des dépenses
 */
interface ExpenseHistoryCardProps {
  archived: ArchivedExpense & { inTrash?: boolean };
  onRestore: () => void;
  onArchiveAction: () => void;
  canRestore: boolean;
  inTrash: boolean;
}

/**
 * Carte pour afficher une dépense archivée ou dans la corbeille.
 * Design responsive et accessible.
 */
export const ExpenseHistoryCard: React.FC<ExpenseHistoryCardProps> = ({
  archived,
  onRestore,
  onArchiveAction,
  canRestore,
  inTrash,
}) => {
  /**
   * Retourne le libellé de la raison d'archivage
   */
  const getReasonLabel = (): string => {
    switch (archived.reason) {
      case 'user_deleted':
        return 'Supprimée par l\'utilisateur';
      case 'correction':
        return 'Correction';
      default:
        return 'Archive';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* En-tête de la carte */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-lg">
              {archived.expense.description}
            </h3>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {archived.expense.category}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              inTrash
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
            aria-label={inTrash ? 'Dans la corbeille' : 'Archivée'}
          >
            {inTrash ? 'Corbeille' : 'Archivée'}
          </span>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-4">
        {/* Détails de la dépense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Date: {formatDate(archived.expense.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="h-4 w-4 flex-shrink-0" />
            <span>Raison: {getReasonLabel()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Archive className="h-4 w-4 flex-shrink-0" />
            <span>Archivée le: {formatDate(archived.archivedAt)}</span>
          </div>
        </div>

        {/* Montant et actions */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-teal-700">
            {formatCurrency(archived.expense.amount)}
          </div>

          <div className="flex gap-2">
            {canRestore && (
              <button
                onClick={onRestore}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 text-sm"
                aria-label="Restaurer la dépense"
                title="Restaurer"
              >
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Restaurer</span>
              </button>
            )}

            <button
              onClick={onArchiveAction}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm ${
                inTrash
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={
                inTrash
                  ? 'Supprimer définitivement la dépense'
                  : 'Déplacer dans la corbeille'
              }
              title={inTrash ? 'Supprimer définitivement' : 'Déplacer dans la corbeille'}
            >
              {inTrash ? (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Supprimer</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">Corbeille</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
