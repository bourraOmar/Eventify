'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from '@/components/ui/Toast.module.css';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContextType {
  addToast: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <div className={`${styles.icon}`}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>

            <div className={styles.content}>
              {toast.title && <div className={styles.title}>{toast.title}</div>}
              <div className={styles.message}>{toast.message}</div>
            </div>

            <button
              className={styles.closeButton}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
