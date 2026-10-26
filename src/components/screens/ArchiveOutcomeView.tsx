/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVault } from '../../context/VaultContext';

export const ArchiveOutcomeView: React.FC = () => {
  const {
    activeDocId,
    documents,
    inboxItems,
    setCurrentScreen,
    activeScenario,
    showToast,
  } = useVault();

  const doc = documents.find((d) => d.id === activeDocId) || documents[0];

  const outcomeKey = activeScenario === 'normal' ? '1' : activeScenario;

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Hero Card for Outcome */}
      <div className="bg-white rounded border border-[#d7e4ec] p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              outcomeKey === '5' || outcomeKey === '6'
                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                : outcomeKey === '3' || outcomeKey === '4'
                ? 'bg-[#fff3e0] text-[#e68a00]'
                : 'bg-[#95f3eb] text-[#006763]'
            }`}
          >
            <span className="material-symbols-outlined text-[28px]">
              {outcomeKey === '5'
                ? 'block'
                : outcomeKey === '6'
                ? 'warning'
                : outcomeKey === '3'
                ? 'sync_problem'
                : outcomeKey === '4'
                ? 'folder_delete'
                : 'task_alt'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  outcomeKey === '5' || outcomeKey === '6'
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : outcomeKey === '3' || outcomeKey === '4'
                    ? 'bg-[#fff3e0] text-[#e68a00]'
                    : 'bg-[#95f3eb]/40 text-[#006763]'
                }`}
              >
                {outcomeKey === '5'
                  ? 'Транзакция отменена'
                  : outcomeKey === '6'
                  ? 'Прервано на шаге записи'
                  : outcomeKey === '3'
                  ? 'Архив OK · Сбой Obsidian'
                  : outcomeKey === '4'
                  ? 'Архив OK · Сбой очистки Inbox'
                  : 'Транзакция зафиксирована'}
              </span>
              <span className="font-mono text-[11px] text-[#536166]">
                {doc.id} • sha256:{doc.sha256.slice(0, 8)}...
              </span>
            </div>

            <h1 className="font-bold text-[18px] text-[#111d23] tracking-tight">
              {outcomeKey === '5'
                ? 'Архивация не была выполнена (исходный файл цел)'
                : outcomeKey === '6'
                ? 'Прерванная операция (требуется восстановление WAL)'
                : outcomeKey === '3'
                ? 'Документ зафиксирован • Сбой экспорта в Obsidian'
                : outcomeKey === '4'
                ? 'Документ зафиксирован • Сбой очистки Входящих'
                : 'Документ успешно зафиксирован в постоянном архиве'}
            </h1>

            <p className="text-[12px] text-[#536166]">
              {outcomeKey === '5'
                ? 'Произошёл сбой записи до коммита. Исходный файл во Входящих не затронут.'
                : outcomeKey === '4'
                ? 'Архивная копия проверена и сохранена. Исходный файл остался во Входящих (можно повторить безопасную очистку).'
                : 'Архивная запись создана. Исходные файлы обработаны, контрольные суммы совпали, индекс SQLite обновлен.'}
            </p>
          </div>
        </div>

        {/* Storage State Pill */}
        <div className="flex md:flex-col items-end gap-1 shrink-0 bg-[#e9f6fd] p-2.5 rounded border border-[#d7e4ec] text-[11px]">
          <span className="text-[#6e7978]">Хранилище:</span>
          <span className="font-semibold text-[#111d23]">Том A (SSD-01)</span>
          <span className="text-[#006763] font-mono text-[10px]">WORM-блокировка включена</span>
        </div>
      </div>

      {/* Grid: Passport Snapshot (7 cols) + Action Next Steps (5 cols) */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Passport Snapshot */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-2.5">
          <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#d7e4ec]">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
                <span className="material-symbols-outlined text-[#006763] text-[16px]">verified_user</span>
                <span>Снимок паспорта архивного объекта</span>
              </div>
              <span className="font-mono text-[10px] text-[#536166] bg-[#e3f0f8] px-1.5 py-0.5 rounded">
                Фиксация: {new Date().toLocaleDateString('ru-RU')}
              </span>
            </div>

            <div className="bg-[#f4faff] rounded p-2.5 border border-[#d7e4ec] space-y-2 text-[12px]">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6e7978]">Имя документа:</span>
                <span className="col-span-2 font-semibold text-[#111d23]">{doc.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6e7978]">Расположение:</span>
                <span className="col-span-2 font-mono text-[#006763] text-[11px] truncate">
                  {doc.archivePath}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6e7978]">Категория:</span>
                <span className="col-span-2 text-[#111d23]">{doc.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#6e7978]">Статус готовности:</span>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold">
                    ✓ Реквизиты заполнены
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold">
                    ✓ Сверен со сканом
                  </span>
                </div>
              </div>
            </div>

            {/* Special recovery button for State 4 (Clean Inbox retry) */}
            {outcomeKey === '4' && (
              <div className="p-2.5 rounded bg-[#fff3e0] border border-[#e68a00]/30 text-[11px] flex items-center justify-between">
                <span>Исходный файл временно удерживается другим процессом.</span>
                <button
                  onClick={() => showToast('Повторная безопасная очистка завершена успешно!', 'delete_sweep')}
                  className="px-2.5 py-1 bg-[#006763] text-white rounded font-semibold text-[11px]"
                >
                  Повторить безопасную очистку
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Next Steps Actions */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2.5">
          <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-3.5 flex flex-col gap-2.5">
            <span className="text-[#6e7978] font-bold uppercase text-[10px] tracking-wider">
              Следующие шаги рабочего процесса:
            </span>

            {/* Action 1: Next in Inbox */}
            <button
              onClick={() => {
                setCurrentScreen('SCR-02');
                showToast('Переход к следующему объекту во Входящих');
              }}
              className="w-full h-10 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[12px] flex items-center justify-between shadow-xs transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="material-symbols-outlined text-[16px]">folder_special</span>
                <span className="truncate">Перейти к следующему объекту во Входящих</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                {inboxItems.length} в пуле
              </span>
            </button>

            {/* Action 2: Open in Journal */}
            <button
              onClick={() => {
                setCurrentScreen('SCR-11');
                showToast(`Открытие карточки документа ${doc.id}`);
              }}
              className="w-full h-8 px-3 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#111d23] font-medium text-[11px] flex items-center justify-between border border-[#d7e4ec] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#536166]">open_in_new</span>
                <span>Открыть этот документ в Журнале</span>
              </span>
              <span className="font-mono text-[#006763] font-bold">{doc.id}</span>
            </button>

            {/* Action 3: Continue editing */}
            <button
              onClick={() => {
                setCurrentScreen('SCR-06');
                showToast('Открытие редактора реквизитов');
              }}
              className="w-full h-8 px-3 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#111d23] font-medium text-[11px] flex items-center justify-between border border-[#d7e4ec] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#536166]">edit_note</span>
                <span>Продолжить заполнение реквизитов</span>
              </span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Queue Context Note */}
          <div className="p-2.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex items-center justify-between text-[11px] text-[#536166]">
            <span>Остаток очереди: <strong>{inboxItems.length} объектов</strong></span>
            <span className="font-mono text-[#006763]">Пакет 2 / 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
