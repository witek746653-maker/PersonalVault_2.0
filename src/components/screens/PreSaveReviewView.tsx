/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const PreSaveReviewView: React.FC = () => {
  const {
    setCurrentScreen,
    goBack,
    previousScreen,
    setPipelineStep,
    classificationData,
    commitPipelineToArchive,
    activeScenario,
    isVeraCryptMounted,
    showToast,
  } = useVault();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(activeScenario === 'confirm-dialog');

  // Scenario flags
  const isScenarioSecretLocked = activeScenario === 'secret-lock' || (!isVeraCryptMounted && classificationData.zone === 'secret');
  const isScenarioTechError = activeScenario === 'tech-error';
  const isScenarioReady = activeScenario === 'ready';
  const isScenarioPartial = activeScenario === 'partial';

  const isBlocked = isScenarioSecretLocked || isScenarioTechError;

  const completenessCount = isScenarioReady || isScenarioPartial ? '6 из 6 заполнено' : '4 из 6 заполнено';
  const completenessPercent = isScenarioReady || isScenarioPartial ? 100 : 66.6;

  const verificationCount = isScenarioReady
    ? '6 из 6 сверено'
    : isScenarioPartial
    ? '2 из 6 сверено'
    : '4 из 6 сверено';
  const verificationPercent = isScenarioReady ? 100 : isScenarioPartial ? 33.3 : 66.6;

  const handleConfirmArchive = () => {
    setIsConfirmModalOpen(false);
    commitPipelineToArchive();
    setPipelineStep(8);
    setCurrentScreen('SCR-09');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Breadcrumb Pipeline Strip */}
      <div className="w-full bg-white rounded border border-[#d7e4ec] p-2.5 shadow-xs flex items-center justify-between text-[11px] overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[#6e7978]">Входящие → Состав → Предпроверка → Классификация → Редактор → Сверка →</span>
          <span className="px-2 py-0.5 rounded bg-[#006763] text-white font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">task_alt</span>
            <span>Итог перед сохранением (активен)</span>
          </span>
          <span className="text-[#6e7978]">→ Результат архивации</span>
        </div>
        <span className="font-mono text-[#006763] font-semibold shrink-0">PV-2026-DOC-0042</span>
      </div>

      {/* Main Dossier Card */}
      <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-4 flex flex-col gap-3">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#006763] text-[10px] font-mono font-bold">
                Пакет готов к запечатыванию
              </span>
              <span className="font-mono text-[11px] text-[#536166]">PV-2026-DOC-0042</span>
            </div>
            <h1 className="font-bold text-[18px] text-[#111d23] tracking-tight">
              {classificationData.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
              <span className="px-2 py-0.5 rounded bg-[#e9f6fd] text-[#006763] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">public</span>
                {classificationData.zone === 'open' ? 'Зона: Open (Открытое)' : 'Зона: Secret (VeraCrypt)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#111d23]">
                Категория: {classificationData.category} / {classificationData.docType}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#536166]">
                Дата: {classificationData.docDate}
              </span>
            </div>
          </div>

          {/* Seal Indicator Badge */}
          <div className="flex items-center gap-3 px-3 py-2 rounded bg-[#e9f6fd] border border-[#d7e4ec]">
            <div className="w-9 h-9 rounded bg-[#006763] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
            <div className="flex flex-col text-[11px]">
              <span className="text-[#6e7978] uppercase text-[10px] font-bold">Режим фиксации:</span>
              <strong className="text-[#111d23]">Неизменяемый AIP-пакет</strong>
            </div>
          </div>
        </div>

        {/* Blocking Error Banner if Active */}
        {isScenarioSecretLocked && (
          <div className="p-3 rounded bg-[#ffdad6] text-[#93000a] text-[12px] flex items-start gap-2.5 border border-[#ba1a1a]/40">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">lock_clock</span>
            <div>
              <strong>Архивация заблокирована:</strong> Защищённое хранилище «Secret» недоступно (том VeraCrypt не смонтирован). Подключите том или переключите зону на Open.
            </div>
          </div>
        )}

        {isScenarioTechError && (
          <div className="p-3 rounded bg-[#ffdad6] text-[#93000a] text-[12px] flex items-start gap-2.5 border border-[#ba1a1a]/40">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">disc_full</span>
            <div>
              <strong>Техническая блокировка:</strong> Локальный путь недоступен для записи или диск переполнен.
            </div>
          </div>
        )}

        {/* Dual-Status Health & Integrity Block (CRITICAL DISTINCTION) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#536166] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#006763]">fact_check</span>
              Проверка целостности и готовности реквизитов (2 независимых критерия)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
            {/* Box 1: Completeness */}
            <div className="p-3 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col justify-between gap-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#111d23]">1. Полнота обязательных реквизитов</span>
                  <span className="font-mono text-[11px] text-[#536166]">{completenessCount}</span>
                </div>
                <div className="w-full bg-[#e3f0f8] rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-[#006763] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completenessPercent}%` }}
                  />
                </div>
                <div className="p-2 rounded bg-white text-[#3e4948] text-[11px] leading-relaxed border border-[#d7e4ec]">
                  {completenessPercent === 100 ? (
                    <span className="text-[#2e7d32] font-semibold">
                      ✓ Все ключевые реквизиты заполнены для сквозного поиска.
                    </span>
                  ) : (
                    <span>
                      <strong>Неполные данные</strong> — архивация разрешена (технический минимум соблюдён). Не заполнены: Кадастровый номер, Срок гарантии.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-[#6e7978] pt-1 border-t border-[#d7e4ec]">
                <span>Технический минимум: 3 поля</span>
                <span className="text-[#006763] font-semibold">Соблюдён</span>
              </div>
            </div>

            {/* Box 2: Verification */}
            <div className="p-3 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col justify-between gap-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#111d23]">2. Сверка со скан-образом</span>
                  <span className="font-mono text-[11px] text-[#536166]">{verificationCount}</span>
                </div>
                <div className="w-full bg-[#e3f0f8] rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-[#12827c] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${verificationPercent}%` }}
                  />
                </div>
                <div className="p-2 rounded bg-white text-[#3e4948] text-[11px] leading-relaxed border border-[#d7e4ec]">
                  {verificationPercent === 100 ? (
                    <span className="text-[#2e7d32] font-semibold">
                      ✓ 100% сверка подтверждена оператором по всем полям.
                    </span>
                  ) : (
                    <span>
                      <strong>Частично сверен</strong> — несверенные поля фиксируются со статусом «Не сверено» с возможностью допроверки после фиксации.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-[#6e7978] pt-1 border-t border-[#d7e4ec]">
                <span>OCR совпадение: 98.4%</span>
                <span className="text-[#006763] font-semibold">Готов к фиксации</span>
              </div>
            </div>
          </div>

          {/* Principle Note */}
          <div className="p-2.5 rounded bg-[#ddeaf2] flex items-start gap-2 text-[11px] text-[#3e4948] border border-[#d7e4ec]">
            <span className="material-symbols-outlined text-[16px] text-[#006763] shrink-0 mt-0.5">policy</span>
            <p>
              <strong>Базовый принцип архиватора PersonalVault:</strong> приложение <strong>не блокирует</strong> архивацию неполных или частично сверенных документов. Документ будет зафиксирован в неизменяемом локальном хранилище с фиксацией текущего юридического и цифрового статуса без потерь.
            </p>
          </div>
        </div>

        {/* Composition & Canonical Placement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
          <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col gap-1.5">
            <span className="text-[#6e7978] uppercase text-[10px] font-bold">Файловый состав (4 файла · 6.8 МБ):</span>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between bg-white p-1 rounded border border-[#d7e4ec]">
                <span>Страница_01.jpg (Титул)</span>
                <span className="text-[#6e7978]">1.8 МБ</span>
              </div>
              <div className="flex justify-between bg-white p-1 rounded border border-[#d7e4ec]">
                <span>Страница_02.jpg (Реквизиты)</span>
                <span className="text-[#6e7978]">1.7 МБ</span>
              </div>
              <div className="flex justify-between bg-white p-1 rounded border border-[#d7e4ec]">
                <span>Приложение.pdf (Электронная копия)</span>
                <span className="text-[#6e7978]">1.4 МБ</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col justify-between gap-1.5">
            <div>
              <span className="text-[#6e7978] uppercase text-[10px] font-bold">Канонический путь в хранилище:</span>
              <div className="font-mono text-[11px] text-[#006763] bg-white p-1.5 rounded border border-[#d7e4ec] mt-1 break-all">
                {classificationData.zone === 'open' ? 'Open' : 'Secret'} → {classificationData.category} → 2026 → PV-0042 {classificationData.title}.pdf
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-[#536166]">
              <span>Obsidian экспорт: <strong>Включен</strong></span>
              <span>Контроль целостности: <strong>OK</strong></span>
            </div>
          </div>
        </div>

        {/* Expandable Technical Details */}
        <div className="rounded border border-[#d7e4ec] overflow-hidden text-[12px]">
          <button
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            className="w-full px-3 py-2 bg-[#e9f6fd] hover:bg-[#ddeaf2] flex items-center justify-between font-semibold transition-colors text-[11px]"
          >
            <div className="flex items-center gap-1.5 text-[#006763]">
              <span className="material-symbols-outlined text-[15px]">schema</span>
              <span>Технические подробности архивного пакета (AIP, JSON, SQLite, Hash)</span>
            </div>
            <span className="material-symbols-outlined text-[15px]">
              {isDetailsOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isDetailsOpen && (
            <div className="p-3 bg-white space-y-2 font-mono text-[11px] text-[#3e4948] select-text">
              <div>SHA-256: 8f2a994bc7d612e4c014781df03ab8714e8b39a48e71822c9e2d3f0a1b8c014d</div>
              <div>Пакет: metadata.json, manifest.sha256, original_scans/</div>
              <div>Формат депонирования: ZIP64/AIP с атрибутом Read-Only в локальной ФС</div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Progression Bar */}
      <div className="sticky bottom-0 bg-[#ddeaf2] p-2.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[12px] shadow-sm">
        <button
          onClick={goBack}
          className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>{previousScreen === 'SCR-07' ? 'Назад к сверке' : 'Назад к редактору'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('SCR-07')}
            className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
          >
            <span className="material-symbols-outlined text-[15px]">rule</span>
            <span>Сверка со сканом</span>
          </button>
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isBlocked}
            className={`h-8 px-4 rounded font-semibold flex items-center gap-1 shadow-xs transition-colors ${
              isBlocked
                ? 'bg-[#d7e4ec] text-[#6e7978] cursor-not-allowed'
                : 'bg-[#006763] hover:bg-[#12827c] text-white cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Сохранить в архив (Зафиксировать документ) →</span>
          </button>
        </div>
      </div>

      {/* Confirmation Seal Modal Overlay */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-[#d7e4ec] flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between border-b border-[#d7e4ec] pb-2">
              <div className="flex items-center gap-2 text-[#006763] font-semibold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                <span>Подтверждение фиксации в архиве</span>
              </div>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-[#6e7978]">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-[12px] text-[#3e4948] leading-relaxed">
              Документ <strong>«{classificationData.title}»</strong> будет перемещён из буфера «Входящие» в неизменяемый локальный архив AIP.
            </p>

            <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6e7978]">Зона размещения:</span>
                <strong className="text-[#006763]">
                  {classificationData.zone === 'open' ? 'Open (Открытая)' : 'Secret (VeraCrypt)'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e7978]">Статус сверки:</span>
                <span>Частично сверен (зафиксировано)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e7978]">Режим изменения:</span>
                <span className="font-semibold">Только чтение (WORM / Read-only)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#d7e4ec]">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] text-[11px]"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmArchive}
                className="px-4 py-1.5 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>Да, зафиксировать документ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
