import { ReactNode, useState, useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
  requireConfirmation?: boolean;
  confirmationValue?: string;
  confirmationPlaceholder?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 text-white',
  isLoading = false,
  requireConfirmation = false,
  confirmationValue = '',
  confirmationPlaceholder = '',
}: ConfirmDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] =
    useState(requireConfirmation);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (requireConfirmation) {
      setIsConfirmDisabled(
        confirmationInput !== confirmationValue || isLoading
      );
    } else {
      setIsConfirmDisabled(isLoading);
    }
  }, [confirmationInput, confirmationValue, requireConfirmation, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmationInput('');
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the cancel button when dialog opens
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 0);
    } else {
      // Return focus to the previously focused element when dialog closes
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not(:disabled), input:not(:disabled)'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div 
        ref={dialogRef}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 
            id="dialog-title"
            className="text-lg font-medium text-gray-900"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Tutup dialog"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div 
            id="dialog-description"
            className="text-sm text-gray-600"
          >
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>

          {requireConfirmation && (
            <div className="mt-4">
              <label htmlFor="confirmation-input" className="sr-only">
                {confirmationPlaceholder}
              </label>
              <input
                id="confirmation-input"
                type="text"
                value={confirmationInput}
                onChange={e => setConfirmationInput(e.target.value)}
                placeholder={confirmationPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isLoading}
                aria-label={confirmationPlaceholder}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${confirmButtonClass}`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
