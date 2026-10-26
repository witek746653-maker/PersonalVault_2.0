/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { DraftSession } from '../../types';

export const DraftsSessionsView: React.FC = () => {
  const {
    draftSessions,
    setCurrentScreen,
    activeScenario,
    isVeraCryptMounted,
    showToast,
  } = useVault();

  const [selectedDraftId, setSelectedDraftId] = useState<string>('DRAFT-2026-089');
  const [diffChoiceSum, setDiffChoiceSum] = useState<'draft' | 'db'>('draft');
  const [diffChoiceMeter, setDiffChoiceMeter] = useState<'draft' | 'db'>('draft');

  const isScenarioEmpty = activeScenario === 'empty';
  const isScenarioInterrupted = activeScenario === 'interrupted';
  const isScenarioConflict = activeScenario === 'conflict';
  const isScenarioError = activeScenario === 'error';
  const isScenarioSecretLocked = activeScenario === 'secret_locked' || !isVeraCryptMounted;

  const currentDraft = draftSessions.find((d) => d.id === selectedDraftId) || draftSessions[0];

  const handleContinueSession = (session: DraftSession) => {
    setCurrentScreen(session.screenId);
    showToast(`Возобновление сессии: ${session.title}`, 'play_circle');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Header and Sub-Context */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006763]">draft</span>
            <h1 className="font-semibold text-[16px] text-[#111d23]">
              Черновики и незавершённые сессии
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#536166] text-[10px] font-mono">
              Изолированная память
            </span>
          </div>
          <span className="text-[11px] text-[#6e7978]">
            Без синхронизации с облаком · Только локальное ОЗУ/SQLite
          </span>
        </div>
      </div>

      {/* Alert Banners */}
      {isScenarioInterrupted && (
        <div className="p-2.5 rounded bg-[#e3f0f8] border border-[#006763]/30 text-[#111d23] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#006763]">history_toggle_off</span>
            <div>
              <strong>Обнаружена прерванная сессия после аварийного закрытия:</strong> сессия восстановлена из журнала транзакций.
            </div>
          </div>
          <button
            onClick={() => showToast('Сессия полностью восстановлена')}
            className="px-2.5 py-1 rounded bg-[#006763] text-white text-[11px] font-semibold"
          >
            Восстановить сейчас
          </button>
        </div>
      )}

      {isScenarioConflict && (
        <div className="p-2.5 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">sync_problem</span>
            <div>
              <strong>Внимание: Обнаружен конфликт ревизий архива.</strong> Черновик «Квитанция об оплате» устарел относительно базы.
            </div>
          </div>
          <button
            onClick={() => setSelectedDraftId('DRAFT-2026-061')}
            className="px-2.5 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-semibold"
          >
            Сравнить версии
          </button>
        </div>
      )}

      {isScenarioError && (
        <div className="p-2.5 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">disc_full</span>
            <div>
              <strong>Ошибка кэширования:</strong> диск занят другим процессом. Автосохранение временно переведено в память ОЗУ.
            </div>
          </div>
          <button
            onClick={() => showToast('Повторная фиксация WAL успешна')}
            className="px-2.5 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-semibold"
          >
            Повторить запись
          </button>
        </div>
      )}

      {/* Main Layout: Table (flex-1) + Inspector (320-380px) */}
      <div className="w-full flex flex-col lg:flex-row gap-3 items-start">
        {/* Left Column: Drafts Table */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-[#536166]">
            <span>
              <strong>{isScenarioEmpty ? 0 : draftSessions.length}</strong> активных черновиков
            </span>
            <span>Автосохранение каждые 15 сек.</span>
          </div>

          <div className="w-full bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden flex flex-col">
            <div className="h-8 bg-[#ddeaf2] flex items-center px-3 font-semibold text-[11px] text-[#536166] uppercase tracking-wider justify-between border-b border-[#d7e4ec]">
              <span className="flex-1">Наименование черновика</span>
              <span className="w-24 text-center">Категория</span>
              <span className="w-16 text-center">Зона</span>
              <span className="w-20 text-right">Сохранено</span>
              <span className="w-28 text-right">Состояние</span>
            </div>

            {isScenarioEmpty ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[32px] text-[#6e7978] mb-1">drafts</span>
                <h3 className="font-semibold text-[14px]">Нет активных черновиков</h3>
                <p className="text-[12px] text-[#536166] max-w-xs mt-0.5">
                  Все документы завершены или удалены.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#d7e4ec] text-[12px]">
                {draftSessions.map((draft) => {
                  const isSelected = selectedDraftId === draft.id;
                  const isSecretLockedRow = isScenarioSecretLocked && draft.zone === 'Secret';
                  return (
                    <div
                      key={draft.id}
                      onClick={() => setSelectedDraftId(draft.id)}
                      className={`h-11 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#95f3eb]/25 hover:bg-[#95f3eb]/35'
                          : 'hover:bg-[#e9f6fd]/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-semibold text-[#111d23] truncate">
                          {isSecretLockedRow ? '•••••••••••••••••••••••••• (Зашифровано)' : draft.title}
                        </div>
                        <span className="text-[10px] text-[#006763] font-mono">{draft.stageName}</span>
                      </div>
                      <span className="w-24 text-center text-[11px] text-[#536166] truncate">
                        {draft.category}
                      </span>
                      <span className="w-16 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            draft.zone === 'Secret'
                              ? 'bg-[#515e5e] text-white'
                              : 'bg-[#e3f0f8] text-[#3e4948]'
                          }`}
                        >
                          {draft.zone}
                        </span>
                      </span>
                      <span className="w-20 text-right font-mono text-[11px] text-[#536166]">
                        {draft.lastSaved}
                      </span>
                      <span className="w-28 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            draft.status === 'Конфликт'
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : draft.status === 'В процессе'
                              ? 'bg-[#e3f0f8] text-[#006763]'
                              : 'bg-[#e8f5e9] text-[#2e7d32]'
                          }`}
                        >
                          {draft.status}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Draft Inspector */}
        {currentDraft && !isScenarioEmpty && (
          <div className="w-full lg:w-80 xl:w-[350px] 2xl:w-[380px] shrink-0 flex flex-col gap-2.5">
            <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-3.5 flex flex-col gap-3">
              <div className="flex items-start justify-between border-b border-[#d7e4ec] pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[10px] font-mono">
                      {currentDraft.id}
                    </span>
                    <span className="text-[11px] text-[#6e7978]">Инспектор сессии</span>
                  </div>
                  <h2 className="font-semibold text-[14px] text-[#111d23] mt-0.5">
                    {currentDraft.title}
                  </h2>
                </div>
              </div>

              {/* Conflict Resolution Box if selected draft has conflict */}
              {currentDraft.hasConflict && (
                <div className="p-2.5 rounded bg-[#ffdad6]/40 border border-[#ba1a1a]/30 flex flex-col gap-2 text-[11px]">
                  <div className="flex justify-between items-center font-bold text-[#ba1a1a]">
                    <span>Обнаружен конфликт ревизий (r0 vs r1)</span>
                    <span className="font-mono text-[9px] bg-white px-1 rounded">DIFF</span>
                  </div>
                  <p className="text-[#3e4948]">
                    В архиве сохранена более свежая версия ревизии <strong>r1</strong>. Выберите значения для переноса в редактор:
                  </p>
                  <div className="space-y-1.5 bg-white p-2 rounded border border-[#d7e4ec]">
                    <div className="flex justify-between font-semibold">
                      <span>Сумма к оплате:</span>
                      <span className="font-mono text-[#006763]">diff: +420 ₽</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <label className="flex items-center gap-1 p-1 rounded bg-[#f4faff] cursor-pointer">
                        <input
                          type="radio"
                          name="diff_sum"
                          checked={diffChoiceSum === 'draft'}
                          onChange={() => setDiffChoiceSum('draft')}
                          className="accent-[#006763]"
                        />
                        <span>Черновик: 4 920.50 ₽</span>
                      </label>
                      <label className="flex items-center gap-1 p-1 rounded bg-[#f4faff] cursor-pointer">
                        <input
                          type="radio"
                          name="diff_sum"
                          checked={diffChoiceSum === 'db'}
                          onChange={() => setDiffChoiceSum('db')}
                          className="accent-[#006763]"
                        />
                        <span>База: 4 500.00 ₽</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Конфликты ревизий успешно сопоставлены!', 'check');
                      handleContinueSession(currentDraft);
                    }}
                    className="w-full py-1.5 bg-[#006763] text-white font-semibold rounded text-[11px]"
                  >
                    Перенести выбранные в редактор
                  </button>
                </div>
              )}

              {/* Progress and Stats */}
              <div className="bg-[#f4faff] p-2.5 rounded border border-[#d7e4ec] text-[11px] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Прогресс готовности:</span>
                  <strong className="font-mono text-[#006763]">{currentDraft.progressPercent}%</strong>
                </div>
                <div className="w-full bg-[#e3f0f8] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#006763] h-full"
                    style={{ width: `${currentDraft.progressPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[#536166]">
                  <div>Реквизиты: <strong className="text-[#111d23]">{currentDraft.reqStatus}</strong></div>
                  <div>Сверка: <strong className="text-[#111d23]">{currentDraft.verifyStatus}</strong></div>
                  <div>Категория: <strong className="text-[#111d23]">{currentDraft.category}</strong></div>
                  <div>Файлов: <strong className="text-[#111d23]">{currentDraft.filesCount}</strong></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#d7e4ec]">
                <button
                  onClick={() => handleContinueSession(currentDraft)}
                  className="w-full h-8 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">play_circle</span>
                  <span>Продолжить заполнение (в {currentDraft.stageName})</span>
                </button>
                <button
                  onClick={() => showToast('Черновик удалён без изменения исходных файлов', 'delete')}
                  className="h-7 text-[#ba1a1a] hover:bg-[#ffdad6] rounded text-[11px] transition-colors"
                >
                  Удалить черновик (без удаления исходных файлов)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
