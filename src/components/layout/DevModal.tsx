import React from 'react';
import { useVault } from '../../context/VaultContext';

export const DevModal: React.FC = () => {
  const { devModal, closeDevModal } = useVault();

  if (!devModal.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={closeDevModal}
    >
      <div
        className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-[11px] font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>В разработке · DEV-01</span>
          </div>
          <button
            onClick={closeDevModal}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Закрыть"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="px-6 pt-5 pb-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">
              {devModal.featureName === 'Помощник' ? 'smart_toy' : 'vital_signs'}
            </span>
          </div>

          <h2 className="text-[17px] font-bold text-on-surface tracking-tight">В разработке</h2>
          <div className="text-[14px] text-secondary font-medium mt-1 mb-2">
            {devModal.featureName || 'Дополнительный модуль'}
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-4 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
              Автономный режим
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[10px]">
              Локальная изоляция
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[10px]">
              Релиз v2.5
            </span>
          </div>

          <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6 max-w-[340px]">
            {devModal.featureName === 'Помощник'
              ? 'Автономный помощник для контекстного поиска и семантической классификации документов находится на стадии аудита безопасности. Данные не передаются во внешние облачные сервисы.'
              : 'Модуль сводки здоровья для структурированного учёта медицинских выписок, анализов и полисов ДМС появится в следующем обновлении после стабилизации локального криптоядра.'}
          </p>

          <button
            onClick={closeDevModal}
            className="w-full h-9 bg-primary hover:bg-primary-container text-on-primary font-semibold text-[13px] rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Понятно</span>
          </button>
        </div>
      </div>
    </div>
  );
};
