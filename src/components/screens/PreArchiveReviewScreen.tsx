import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const PreArchiveReviewScreen: React.FC = () => {
  const {
    navigateTo,
    processingSession,
    commitProcessingToArchive,
    showToast
  } = useVault();

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);

  const handleConfirmArchive = () => {
    setIsConfirmationModalOpen(false);
    commitProcessingToArchive();
    navigateTo('rezultat');
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Breadcrumbs Bar */}
      <div className="flex items-center gap-1.5 text-secondary text-[11px] mb-2.5 overflow-x-auto whitespace-nowrap bg-surface-container-lowest p-2 rounded-lg border border-surface-container-highest">
        <button onClick={() => navigateTo('vkhodyashchie')} className="hover:text-on-surface cursor-pointer">Входящие</button>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <button onClick={() => navigateTo('sostav')} className="hover:text-on-surface cursor-pointer">Состав</button>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <button onClick={() => navigateTo('predproverka')} className="hover:text-on-surface cursor-pointer">Предпроверка</button>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <button onClick={() => navigateTo('klassifikaciya')} className="hover:text-on-surface cursor-pointer">Классификация</button>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <button onClick={() => navigateTo('redaktor')} className="hover:text-on-surface cursor-pointer">Редактор</button>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <button onClick={() => navigateTo('sverka')} className="hover:text-on-surface cursor-pointer">Сверка</button>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">task_alt</span>
          Итог перед сохранением (SCR-08)
        </span>
        <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
        <span className="text-outline">Результат (SCR-09)</span>
      </div>

      {/* Main Dossier Card */}
      <div className="bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-4 flex flex-col gap-4">
        {/* Title & Header Summary */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[10px] font-semibold">
                Пакет готов к запечатыванию
              </span>
              <span className="font-code text-[11px] text-secondary">PV-2026-DOC-0042</span>
            </div>
            <h1 className="font-bold text-[17px] text-on-surface tracking-tight">
              {processingSession.workName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">public</span>
                Зона: {processingSession.zone === 'secret' ? 'Secret' : 'Open'}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">folder_open</span>
                Категория: {processingSession.category} / {processingSession.docType}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                Дата: {processingSession.dateValue || '12.10.2026'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded bg-surface-container-low border border-surface-container-highest shrink-0">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary uppercase font-semibold">Режим фиксации</span>
              <span className="font-bold text-[12px] text-on-surface">Неизменяемый AIP-архив</span>
            </div>
          </div>
        </div>

        {/* Dual-Status Health & Integrity Block */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">fact_check</span>
              Проверка целостности и готовности реквизитов
            </span>
            <span className="text-[11px] text-secondary">2 независимых критерия валидации</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Box A: Completeness */}
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-highest flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-bold text-on-surface">1. Полнота обязательных реквизитов</span>
                  <span className="font-code text-secondary">5 из 6 заполнено</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '83%' }}></div>
                </div>
                <div className="p-2 rounded bg-secondary-container text-on-secondary-container text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary mt-0.5">info</span>
                  <div>
                    <span className="font-semibold">Неполные данные</span> — архивация разрешена (технический минимум для поиска и сквозной индексации соблюдён).
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 text-secondary">
                <span>Технический минимум: 3 реквизита</span>
                <span className="text-primary font-bold">Соблюдён</span>
              </div>
            </div>

            {/* Box B: Scan Verification */}
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-highest flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-bold text-on-surface">2. Сверка со скан-образом</span>
                  <span className="font-code text-secondary">4 из 6 сверено</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '66%' }}></div>
                </div>
                <div className="p-2 rounded bg-surface-container text-on-surface text-[11px] flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary mt-0.5">verified_user</span>
                  <div>
                    <span className="font-semibold">Частично сверен</span> — несверенные поля сохраняются со статусом «Не сверено» с возможностью допроверки после фиксации.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 text-secondary">
                <span>OCR совпадение текста: 98.4%</span>
                <span className="text-primary font-bold">Готов к фиксации</span>
              </div>
            </div>
          </div>

          {/* Principle Callout */}
          <div className="p-2.5 rounded bg-surface-container-high border border-surface-container-highest flex items-start gap-2.5 text-[11.5px]">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">policy</span>
            <div className="flex flex-col gap-0.5 text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-semibold">Базовый принцип архиватора PersonalVault:</strong>
              <span>
                PersonalVault <strong>не блокирует</strong> архивацию неполных или частично сверенных документов. Документ будет зафиксирован в неизменяемом локальном хранилище с точной фиксацией текущего статуса без потерь.
              </span>
            </div>
          </div>
        </div>

        {/* Composition & Storage Parameters */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-primary">folder_zip</span>
            Состав пакета и параметры размещения в хранилище
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            {/* Files List */}
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-secondary uppercase text-[10px]">Файловый состав (4 файла · 6.8 МБ)</span>
                <span className="font-code text-primary">SHA-256 Verified</span>
              </div>
              <div className="flex flex-col gap-1">
                {processingSession.files.map(f => (
                  <div key={f.id} className="flex items-center justify-between py-1 px-2 rounded bg-surface-container-lowest border border-surface-container-highest">
                    <span className="truncate">{f.name}</span>
                    <span className="font-code text-secondary ml-2 shrink-0">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Path */}
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-highest flex flex-col justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-secondary uppercase text-[10px] font-semibold">Канонический путь в хранилище</span>
                <div className="p-2 rounded bg-surface-container-lowest font-code text-on-surface break-all border border-surface-container-highest text-[11px]">
                  {processingSession.zone === 'secret' ? 'Secret' : 'Open'} → {processingSession.category} → 2026 → PV-0042 {processingSession.workName}.pdf
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="p-1.5 rounded bg-surface-container-lowest border border-surface-container-highest">
                    <span className="text-secondary text-[10px]">Obsidian Экспорт:</span>
                    <div className="text-primary font-bold">Включен</div>
                  </div>
                  <div className="p-1.5 rounded bg-surface-container-lowest border border-surface-container-highest">
                    <span className="text-secondary text-[10px]">Расшифровка OCR:</span>
                    <div className="text-on-surface font-bold">Markdown (1.4 КБ)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Technical Details */}
        <div className="rounded bg-surface-container-low border border-surface-container-highest overflow-hidden text-[12px]">
          <button
            onClick={() => setIsDetailsOpen(prev => !prev)}
            className="w-full px-3 py-2 flex items-center justify-between text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">schema</span>
              <span>Технические подробности архивного пакета (AIP, JSON, SQLite, Hash)</span>
            </div>
            <span className={`material-symbols-outlined text-[16px] transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {isDetailsOpen && (
            <div className="p-3 bg-surface-container-lowest border-t border-surface-container-highest flex flex-col gap-2 font-code text-[11px]">
              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1">
                <span className="text-[10px] text-secondary uppercase font-semibold">Архивный дайджест SHA-256</span>
                <span className="text-on-surface break-all">
                  8f2a994bc7d612e4c014781df03ab8714e8b39a48e71822c9e2d3f0a1b8c014d
                </span>
              </div>
              <div className="flex justify-between items-center text-secondary text-[11px]">
                <span>Формат депонирования: WORM-архив с атрибутом Read-Only</span>
                <span className="text-primary font-semibold">PersonalVault v2.4 Engine</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-[210px] right-0 z-30 h-11 bg-surface-container-high border-t border-surface-container-highest px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateTo('redaktor')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Назад к редактору (SCR-06)</span>
          </button>

          <button
            onClick={() => navigateTo('sverka')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[15px]">rule</span>
            <span>Продолжить сверку (SCR-07)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-secondary hidden lg:inline">
            Готов к перемещению в постоянное хранилище
          </span>

          <button
            onClick={() => setIsConfirmationModalOpen(true)}
            className="h-7 px-4 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Сохранить в архив (Зафиксировать документ) →</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsConfirmationModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest rounded-lg shadow-xl border border-surface-container-highest flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-2.5 bg-surface-container-low flex items-center justify-between border-b border-surface-container-highest">
              <div className="flex items-center gap-1.5 text-primary font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                <span className="text-on-surface">Подтверждение фиксации в архиве</span>
              </div>
              <button onClick={() => setIsConfirmationModalOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 text-[12px]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                  <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-on-surface">
                    Запечатать документ в постоянный архив?
                  </h3>
                  <p className="text-secondary mt-0.5 leading-relaxed">
                    Документ <strong className="text-on-surface">«{processingSession.workName}»</strong> будет перемещён из очереди «Входящие» в неизменяемый архив WORM.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-secondary">Зона размещения:</span>
                  <span className="font-bold text-primary">{processingSession.zone === 'secret' ? 'Secret (VeraCrypt)' : 'Open (Открытая)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Статус сверки:</span>
                  <span className="font-medium text-on-surface">Частично сверен (4 из 6)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Режим изменения:</span>
                  <span className="font-medium text-on-surface">Только чтение (Read-only WORM)</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container-highest flex justify-end gap-2">
              <button
                onClick={() => setIsConfirmationModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmArchive}
                className="px-4 py-1 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">check</span>
                <span>Да, зафиксировать документ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
