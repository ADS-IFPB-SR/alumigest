import React from 'react';
import { createPortal } from 'react-dom';

interface FullscreenPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  legend?: React.ReactNode;
}

export const FullscreenPreviewModal: React.FC<FullscreenPreviewModalProps> = ({ isOpen, onClose, title, children, legend }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-surface rounded-full text-on-surface hover:text-primary shadow-lg"
      >
        <span className="material-symbols-outlined text-[24px]">close</span>
      </button>
      
      <div className="bg-surface p-lg rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col items-center gap-md">
        <h2 className="text-title-lg font-bold text-on-surface">{title}</h2>
        
        <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-auto p-md" style={{ 
          // Custom styles can be targeted by children
        }}>
          {/* We wrap children in a container that allows the SVG to scale up naturally */}
          <div className="w-full h-full flex items-center justify-center [&>svg]:!max-h-full [&>svg]:!h-full [&>svg]:!w-auto">
             {children}
          </div>
        </div>

        {legend && (
          <div className="flex items-center gap-md text-sm font-data-mono text-on-surface-variant flex-wrap justify-center border-t border-outline-variant w-full pt-md">
            {legend}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
