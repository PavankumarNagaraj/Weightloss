import { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning'
  });

  const confirm = ({
    title,
    message,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
  }) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      type
    });
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    confirmState,
    confirm,
    closeConfirm
  };
};
