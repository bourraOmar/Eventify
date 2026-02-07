'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationModal as Modal, ConfirmationModalProps } from '../components/ui/Modal';

// Context definition
interface ConfirmationDialogContextType {
  openDialog: (props: Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>) => void;
  closeDialog: () => void;
}

const ConfirmationDialogContext = createContext<ConfirmationDialogContextType | undefined>(undefined);

// Hook
export const useConfirm = () => {
  const context = useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used with ConfirmationDialogProvider');
  }
  return context;
};

// Provider
export const ConfirmationDialogProvider = ({ children }: { children: ReactNode }) => {
  const [modalProps, setModalProps] = useState<Omit<ConfirmationModalProps, 'isOpen' | 'onClose'> | null>(null);

  const openDialog = (props: Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>) => {
    setModalProps(props);
  };

  const closeDialog = () => {
    setModalProps(null);
  };

  // We need to ensure we don't accidentally override the user's `onConfirm` with logic related to closing
  // But we usually want to close on successful actions or handle errors within the user's function.
  // The simplest pattern is to have the caller handle async logic and closing inside onConfirm if needed,
  // OR the caller can pass an async onConfirm and we handle closing after.

  // Let's adopt a "fire and forget" simpler strategy: user provides `onConfirm`. We wrap it.
  const handleConfirm = async () => {
    if (modalProps?.onConfirm) {
      await modalProps.onConfirm();
    }
    closeDialog();
  };

  return (
    <ConfirmationDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {modalProps && (
        <Modal
          isOpen={true}
          onClose={closeDialog}
          title={modalProps.title}
          description={modalProps.description}
          onConfirm={handleConfirm}
          confirmText={modalProps.confirmText}
          cancelText={modalProps.cancelText}
          variant={modalProps.variant}
        // If the caller wants loading states, they might need to use local state instead of this global simplified one
        // But for simple "Delete?" checks, this is usually enough. If complex, use local state + Modal directly.
        />
      )}
    </ConfirmationDialogContext.Provider>
  );
};
