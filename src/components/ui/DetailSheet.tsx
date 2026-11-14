import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const DetailSheet: React.FC<DetailSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full lg:w-[460px] max-h-[88vh] lg:max-h-none lg:h-full bg-[var(--np-surface)] border-t lg:border-t-0 lg:border-l border-[var(--np-border)] rounded-t-3xl lg:rounded-none flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-slate-400/40" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--np-border-subtle)]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--np-text-primary)] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[var(--np-text-secondary)] mt-0.5 truncate font-mono">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">{children}</div>

        {/* Sticky Footer Actions */}
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--np-border-subtle)] bg-[var(--np-surface)] pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
