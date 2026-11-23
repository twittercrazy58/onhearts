'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface FeedbackContextValue {
  notify: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({
      title,
      description,
      variant = 'success',
    }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  function handleConfirmDecision(result: boolean) {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  }

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}

      {/* Floating Toast Stack (Bottom-Right) */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const styles = {
            success: {
              border: 'border-emerald-200',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            },
            error: {
              border: 'border-rose-200',
              icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            },
            info: {
              border: 'border-[#E8DFD3]',
              icon: <Info className="w-5 h-5 text-[#B8925A] shrink-0" />,
            },
          }[toast.variant];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl bg-white/95 backdrop-blur-md border ${styles.border} p-4 shadow-lg text-[#2C2520] animate-[fadeIn_0.2s_ease-out]`}
            >
              {styles.icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-[#7A6F67] mt-0.5 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-[#7A6F67] hover:text-[#2C2520]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => handleConfirmDecision(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border border-[#E8DFD3] p-6 sm:p-7 shadow-xl text-[#2C2520]"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  confirmState.options.destructive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-[#B8925A]/15 text-[#B8925A]'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold">
                  {confirmState.options.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#7A6F67] leading-relaxed">
                  {confirmState.options.description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleConfirmDecision(false)}
                className="rounded-full border border-[#E8DFD3] px-5 py-2.5 text-xs font-semibold text-[#2C2520] hover:bg-[#FAF8F5] transition"
              >
                {confirmState.options.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDecision(true)}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold text-white transition ${
                  confirmState.options.destructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#B8925A] hover:bg-[#A37F49]'
                }`}
              >
                {confirmState.options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used inside <FeedbackProvider>');
  }
  return ctx;
}