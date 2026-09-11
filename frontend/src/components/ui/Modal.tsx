import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-xs sm:p-md animate-fadeIn">
      {/* Backdrop cobrindo 100% da viewport */}
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-xs transition-opacity cursor-default border-0"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />

      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container-low flex-none">
          <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">{title}</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-md overflow-y-auto flex-1 flex flex-col gap-md">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end items-center gap-sm p-md border-t border-outline-variant bg-surface-container-low rounded-b-xl flex-none">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
