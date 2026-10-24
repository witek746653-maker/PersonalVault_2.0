import React from 'react';
import { useVault } from '../../context/VaultContext';

export const Header: React.FC = () => {
  const { isVeraCryptMounted, toggleVeraCrypt, setIsSearchModalOpen } = useVault();

  return (
    <header className="fixed top-0 left-0 right-0 h-9 bg-surface-container z-50 flex items-center justify-between px-3 border-b border-surface-container-highest select-none shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {/* Brand & Storage indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-[17px]">lock</span>
          <span className="font-semibold text-[13px] tracking-tight text-on-surface">PersonalVault 2.0</span>
        </div>
        <span className="text-outline-variant text-[11px]">|</span>
        <button
          onClick={toggleVeraCrypt}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
            isVeraCryptMounted
              ? 'bg-surface-container-high border-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest'
              : 'bg-error-container/40 border-error/30 text-error hover:bg-error-container/60'
          }`}
          title="Нажмите для переключения статуса тома VeraCrypt"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isVeraCryptMounted ? 'bg-primary' : 'bg-error animate-pulse'}`}></span>
          <span>{isVeraCryptMounted ? 'Локально • Open + Secret' : 'Secret закрыта (только Open)'}</span>
        </button>
      </div>

      {/* Global quick search trigger */}
      <div className="flex-1 max-w-sm mx-4">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full h-6 px-2.5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface rounded border border-surface-container-highest flex items-center justify-between text-[11px] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-outline">search</span>
            <span>Поиск по хранилищу...</span>
          </div>
          <kbd className="font-code text-[10px] bg-surface-container px-1 rounded text-secondary">Ctrl+K</kbd>
        </button>
      </div>

      {/* Profile & Window Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-secondary font-code mr-1">
          <span className="material-symbols-outlined text-[14px] text-primary">sync_saved_locally</span>
          <span className="hidden sm:inline">Синхронизировано</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[15px]">person</span>
        </div>
        <div className="flex items-center ml-2 border-l border-surface-container-highest pl-1">
          <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Свернуть">
            <span className="material-symbols-outlined text-[13px]">minimize</span>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded transition-colors" title="Развернуть">
            <span className="material-symbols-outlined text-[13px]">crop_square</span>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:bg-error hover:text-on-error rounded transition-colors" title="Закрыть">
            <span className="material-symbols-outlined text-[13px]">close</span>
          </button>
        </div>
      </div>
    </header>
  );
};
