import React from 'react';
import { useVault } from '../../context/VaultContext';

export const Toast: React.FC = () => {
  const { toast } = useVault();

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-inverse-surface text-inverse-on-surface px-3.5 py-2 rounded-lg shadow-xl text-[12px] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 border border-inverse-surface/30">
      <span className="material-symbols-outlined text-[16px] text-primary-fixed">
        {toast.icon || 'check_circle'}
      </span>
      <span>{toast.message}</span>
    </div>
  );
};
