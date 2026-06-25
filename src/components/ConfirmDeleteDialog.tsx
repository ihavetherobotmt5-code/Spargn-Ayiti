// src/components/ConfirmDeleteDialog.tsx

import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Props pour le dialogue de confirmation
 */
interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'default';
}

/**
 * Dialogue de confirmation accessible.
 * Gère :
 * - Fermeture avec Escape
 * - Fermeture avec clic extérieur
 * - Navigation avec Tab
 * - Focus automatique sur le bouton de confirmation
 * - Attributs ARIA
 */
export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'danger',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Gestion de la fermeture avec Escape
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Gestion du clic extérieur
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  // Focus automatique sur le bouton de confirmation
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // Ajout/retrait des écouteurs d'événements
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        role="document"
        tabIndex={-1}
      >
        <div className="p-6">
          <h3
            id="confirm-dialog-title"
            className="text-lg font-semibold text-gray-900 mb-2"
          >
            {title}
          </h3>
          <p
            id="confirm-dialog-description"
            className="text-gray-600 mb-6"
          >
            {message}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              aria-label={cancelText}
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                confirmVariant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
              aria-label={confirmText}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
