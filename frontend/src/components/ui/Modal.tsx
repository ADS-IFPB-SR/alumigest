import React from 'react';

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
 footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-xs sm:p-md bg-black/60 backdrop-blur-sm transition-opacity">
 <div className="bg-surface border border-outline-variant rounded-lg w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
 
 {/* Header */}
 <div className="flex items-center justify-between p-md border-b border-outline-variant">
 <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">{title}</h2>
 <button 
 onClick={onClose}
 className="p-xs text-on-surface-variant hover:bg-surface-container-highest :bg-surface-variant/30 rounded-full transition-colors flex items-center justify-center"
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
 <div className="flex justify-end items-center gap-sm p-md border-t border-outline-variant bg-surface-container-low rounded-b-lg">
 {footer}
 </div>
 )}
 </div>
 </div>
 );
}
