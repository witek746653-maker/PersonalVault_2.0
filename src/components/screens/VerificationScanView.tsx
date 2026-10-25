/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const VerificationScanView: React.FC = () => {
  const {
    setCurrentScreen,
    setPipelineStep,
    verificationFields,
    updateVerificationFieldStatus,
    activeScenario,
    showToast,
  } = useVault();

  const [activeFieldId, setActiveFieldId] = useState<number>(4);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editValue, setEditValue] = useState('г. Санкт-Петербург, Московский пр., д. 182, кв. 42');

  const currentField =
    verificationFields.find((f) => f.id === activeFieldId) || verificationFields[3];

  const verifiedCount = verificationFields.filter((f) => f.status === 'verified').length;
  const verifiedPercent = Math.round((verifiedCount / verificationFields.length) * 100);

  const handleConfirm = () => {
    updateVerificationFieldStatus(currentField.id, 'verified');
    setIsInlineEditing(false);
    showToast(`Поле «${currentField.title}» подтверждено со сканом`, 'done_all');
  };

  const handleMissing = () => {
    updateVerificationFieldStatus(currentField.id, 'missing');
    setIsInlineEditing(false);
    showToast(`Поле «${currentField.title}» помечено как отсутствующее в оригинале`, 'block');
  };

  const handleSkip = () => {
    updateVerificationFieldStatus(currentField.id, 'deferred');
    setIsInlineEditing(false);
    showToast(`Поле «${currentField.title}» пропущено (осталось несверенным)`, 'skip_next');
  };

  const handleSaveEdit = () => {
    updateVerificationFieldStatus(currentField.id, 'changed', editValue);
    setIsInlineEditing(false);
    showToast(`Значение изменено. Требуется повторная сверка`, 'edit');
  };

  const handleProceedToPreSave = () => {
    setPipelineStep(7);
    setCurrentScreen('SCR-08');
    showToast('Сверка завершена. Переход к итоговому аудиту перед сохранением (SCR-08)', 'arrow_forward');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Breadcrumb Pipeline Strip */}
      <div className="w-full bg-white rounded border border-[#d7e4ec] p-2.5 shadow-xs flex items-center justify-between text-[11px] overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[#6e7978]">Входящие → Состав → Предпроверка → Классификация → Редактор →</span>
          <span className="px-2 py-0.5 rounded bg-[#006763] text-white font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">find_in_page</span>
            <span>Сверка со сканом (SCR-07, активен)</span>
          </span>
          <span className="text-[#6e7978]">→ Итог (SCR-08)</span>
        </div>
        <span className="font-mono text-[#006763] font-semibold shrink-0">
          DOC-2026-APP-42 • Локально 256-bit
        </span>
      </div>

      {/* Main Dual Panel Layout */}
      <div className="grid grid-cols-12 gap-3 items-start w-full">
        {/* LEFT PANEL: Optical Crop & Scan Viewer (5 Cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2.5">
          <div className="bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="h-8 bg-[#e9f6fd] px-3 flex items-center justify-between border-b border-[#d7e4ec] text-[11px]">
              <div className="flex items-center gap-1.5 font-semibold text-[#111d23]">
                <span className="material-symbols-outlined text-[15px] text-[#006763]">description</span>
                <span>Страница_01.jpg (Стр. 1 из 4)</span>
              </div>
              <span className="font-mono text-[10px] text-[#006763] bg-[#e3f0f8] px-1.5 py-0.5 rounded">
                BBOX: {currentField.sourceCoords}
              </span>
            </div>

            {/* Synthetic Scan Viewport */}
            <div className="p-3 bg-[#cfdce4] flex items-center justify-center">
              <div className="w-full bg-white shadow-sm p-4 rounded-sm font-serif text-[11px] leading-relaxed text-[#1a2327] select-text">
                <div className="text-center font-bold text-[11px] mb-2 uppercase border-b border-[#d7e4ec] pb-1 font-sans">
                  АКТ ПРИЕМА-ПЕРЕДАЧИ ЖИЛОГО ПОМЕЩЕНИЯ
                </div>
                <div className="flex justify-between text-[10px] text-[#536166] mb-2 font-sans">
                  <span>г. Санкт-Петербург</span>
                  <span>12 октября 2026 г.</span>
                </div>
                <p className="mb-2 text-justify">
                  1. Гражданин Васильев А.С., именуемый Наймодатель, сдал, а гражданка Смирнова Е.И., именуемая Наниматель, приняла жилое помещение:
                </p>

                {/* Highlighted bounding box */}
                <div className="my-2 p-1.5 rounded bg-[#95f3eb]/25 border-2 border-[#006763] relative">
                  <span className="absolute -top-2.5 right-1 px-1 bg-[#006763] text-white font-mono text-[8px] rounded">
                    Фокус поля #{currentField.id}
                  </span>
                  <p className="font-sans font-medium text-[#111d23]">
                    {currentField.rawQuote}
                  </p>
                </div>

                <p className="text-[10px] text-[#536166]">
                  2. Санитарное состояние признано удовлетворительным. Ключи: 2 комплекта.
                </p>
              </div>
            </div>

            {/* 2.4x Optical Loupe Crop Box */}
            <div className="p-2.5 bg-[#f4faff] border-t border-[#d7e4ec] flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between text-[#536166]">
                <span className="font-semibold uppercase text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#006763]">loupe</span>
                  Оптический кроп высокого контраста (2.4x)
                </span>
                <span className="font-mono text-[10px]">300 DPI</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#d7e4ec] flex items-center gap-2">
                <div className="w-9 h-9 rounded bg-[#e3f0f8] text-[#006763] flex flex-col items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                </div>
                <div className="flex-1 min-w-0 font-serif text-[13px] text-[#111d23] truncate">
                  {currentField.rawQuote}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Verification Inspector & Fields Queue (7 Cols) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-2.5">
          {/* Progress Card */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[13px] text-[#111d23]">
                Пошаговая сверка реквизитов с первоисточником
              </span>
              <span className="px-2 py-0.5 rounded bg-[#006763] text-white font-mono text-[11px] font-bold">
                Шаг {currentField.id} из {verificationFields.length}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-[#536166]">
                <span>
                  Сверено <strong>{verifiedCount}</strong> из {verificationFields.length} значений ({verifiedPercent}%)
                </span>
                <span className="font-mono text-[#006763] font-semibold">{verifiedPercent}% выполнено</span>
              </div>
              <div className="w-full h-2 rounded bg-[#e3f0f8] overflow-hidden">
                <div
                  className="h-full bg-[#006763] transition-all duration-300"
                  style={{ width: `${verifiedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Field Focus Card */}
          <div className="bg-white p-3.5 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#006763] text-white font-mono text-[10px] font-bold">
                    #{currentField.id}
                  </span>
                  <h3 className="font-semibold text-[14px] text-[#111d23]">{currentField.title}</h3>
                  {currentField.isRequired && (
                    <span className="px-1.5 py-0.2 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px]">
                      Обязательное
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#536166]">{currentField.category}</span>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                  currentField.status === 'verified'
                    ? 'bg-[#e8f5e9] text-[#2e7d32]'
                    : currentField.status === 'missing'
                    ? 'bg-[#d6e5ec] text-[#59676c]'
                    : currentField.status === 'changed'
                    ? 'bg-[#fff3e0] text-[#e68a00]'
                    : 'bg-[#e9f6fd] text-[#006763]'
                }`}
              >
                {currentField.status === 'verified' && '✔ Сверено со сканом'}
                {currentField.status === 'missing' && '⊘ Отсутствует в оригинале'}
                {currentField.status === 'changed' && '⚠ Изменено'}
                {currentField.status === 'waiting' && '⏳ Ожидает решения'}
                {currentField.status === 'deferred' && '⏸ Пропущено'}
              </span>
            </div>

            {/* Comparative Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
              <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col justify-between gap-1">
                <span className="text-[#6e7978] text-[10px] font-semibold uppercase">Введённое значение:</span>
                <div className="font-semibold text-[#111d23] bg-white p-1.5 rounded border border-[#d7e4ec]">
                  {currentField.normalizedValue}
                </div>
                <span className="text-[10px] text-[#006763] font-mono">DB: {currentField.dbField}</span>
              </div>

              <div className="p-2.5 rounded bg-[#95f3eb]/20 border border-[#006763]/30 flex flex-col justify-between gap-1">
                <span className="text-[#006763] text-[10px] font-semibold uppercase">Цитата из скана:</span>
                <div className="font-serif italic text-[#111d23] bg-white p-1.5 rounded border border-[#d7e4ec]">
                  {currentField.rawQuote}
                </div>
                <span className="text-[10px] text-[#006763] font-mono">Совпадение: {currentField.matchPercent}%</span>
              </div>
            </div>

            {/* Inline Editor if Activated */}
            {isInlineEditing && (
              <div className="p-2.5 rounded bg-[#e3f0f8] border border-[#006763] flex flex-col gap-1.5 text-[12px]">
                <label className="font-semibold text-[#006763]">Исправление значения поля:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 h-7 px-2 rounded bg-white border border-[#d7e4ec] text-[12px]"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 rounded bg-[#006763] text-white text-[11px] font-semibold"
                  >
                    Применить
                  </button>
                  <button
                    onClick={() => setIsInlineEditing(false)}
                    className="px-2 py-1 rounded bg-white text-[#536166] text-[11px]"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <button
                onClick={handleConfirm}
                className="h-7 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                <span>✔ Подтвердить сверку (Сверено)</span>
              </button>
              <button
                onClick={() => {
                  setEditValue(currentField.normalizedValue);
                  setIsInlineEditing(true);
                }}
                className="h-7 px-2.5 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] border border-[#d7e4ec] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>✎ Исправить</span>
              </button>
              <button
                onClick={handleMissing}
                className="h-7 px-2.5 rounded bg-white hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#d7e4ec] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">block</span>
                <span>⊘ Отсутствует</span>
              </button>
              <button
                onClick={handleSkip}
                className="h-7 px-2.5 rounded bg-white hover:bg-[#ddeaf2] text-[#536166] border border-[#d7e4ec] ml-auto"
              >
                ⏭ Пропустить
              </button>
            </div>
          </div>

          {/* Queue of All 7 Parameters */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-[#536166] uppercase tracking-wider mb-1">
              Очередь полей документа ({verificationFields.length} параметров):
            </span>
            <div className="space-y-1">
              {verificationFields.map((field) => {
                const isSelected = activeFieldId === field.id;
                return (
                  <div
                    key={field.id}
                    onClick={() => {
                      setActiveFieldId(field.id);
                      setIsInlineEditing(false);
                    }}
                    className={`h-8 px-2.5 rounded flex items-center justify-between text-[11px] cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-[#95f3eb]/25 border-[#006763] font-semibold'
                        : 'bg-[#f4faff] border-[#d7e4ec] hover:bg-[#e9f6fd]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          field.status === 'verified'
                            ? 'bg-[#e8f5e9] text-[#2e7d32] font-semibold'
                            : field.status === 'missing'
                            ? 'bg-[#d6e5ec] text-[#59676c]'
                            : field.status === 'changed'
                            ? 'bg-[#fff3e0] text-[#e68a00]'
                            : 'bg-[#e3f0f8] text-[#536166]'
                        }`}
                      >
                        {field.status === 'verified' && 'Сверено'}
                        {field.status === 'missing' && 'Отсутствует'}
                        {field.status === 'changed' && 'Изменено'}
                        {field.status === 'waiting' && 'Ожидает'}
                        {field.status === 'deferred' && 'Пропущено'}
                      </span>
                      <span className="text-[#111d23] truncate">
                        {field.id}. {field.title}: <strong className="font-mono">{field.normalizedValue}</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6e7978] shrink-0">
                      Стр. {field.pageNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 bg-[#ddeaf2] p-2.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[12px] shadow-sm">
        <button
          onClick={() => setCurrentScreen('SCR-06')}
          className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Вернуться в редактор (SCR-06)</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[#536166] text-[11px] hidden sm:inline">
            Несверенные поля помечаются как unverified и не блокируют сохранение
          </span>
          <button
            onClick={handleProceedToPreSave}
            className="h-8 px-4 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Завершить сверку и перейти к итогам (SCR-08)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
