/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVault } from '../../context/VaultContext';

export const ClassificationZoneView: React.FC = () => {
  const {
    setCurrentScreen,
    setPipelineStep,
    classificationData,
    updateClassification,
    isVeraCryptMounted,
    showToast,
  } = useVault();

  const handleProceed = () => {
    setPipelineStep(5);
    setCurrentScreen('SCR-06');
    showToast('Параметры классификации зафиксированы. Переход в Редактор данных', 'arrow_forward');
  };

  // Compute canonical target path preview
  const zonePrefix = classificationData.zone === 'open' ? 'Open' : 'Secret [VeraCrypt]';
  const yearPart =
    classificationData.dateMode === 'unknown'
      ? 'Дата неизвестна'
      : classificationData.dateMode === 'deferred'
      ? 'Не обработано'
      : classificationData.docDate.split('.')[2] || '2026';

  const previewCanonicalPath = `${zonePrefix} → ${classificationData.category} → ${yearPart} → PV-0042 ${
    classificationData.title
  }${classificationData.isDraftTitle ? ' [ЧЕРНОВИК]' : ''}.pdf`;

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Header Pipeline Stepper */}
      <div className="bg-white rounded border border-[#d7e4ec] p-3 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006763] text-[18px]">fact_check</span>
            <span className="font-semibold text-[13px] text-[#111d23]">
              Подготовка документов: Этап 4 из 4 — Классификация
            </span>
            <span className="text-[11px] text-[#536166] px-1.5 py-0.5 bg-[#e3f0f8] rounded">
              Назначение зоны хранения, типа и метаданных
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#536166] bg-[#e9f6fd] px-2 py-0.5 rounded border border-[#d7e4ec]">
            Параметры документа
          </span>
        </div>

        {/* 5-step progress */}
        <div className="grid grid-cols-5 gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#536166] opacity-75">
            <span className="material-symbols-outlined text-[13px] text-[#006763]">check_circle</span>
            <span className="line-through">1. Входящие</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#536166] opacity-75">
            <span className="material-symbols-outlined text-[13px] text-[#006763]">check_circle</span>
            <span className="line-through">2. Состав</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#536166] opacity-75">
            <span className="material-symbols-outlined text-[13px] text-[#006763]">check_circle</span>
            <span className="line-through">3. Предпроверка</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#006763] text-white font-semibold shadow-xs">
            <span className="material-symbols-outlined text-[13px]">tune</span>
            <span>4. Классификация</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#6e7978]">
            <span className="material-symbols-outlined text-[13px]">edit_document</span>
            <span>5. Редактор данных</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left Column: Preview & Destination Info (300-380px bounded) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 2xl:col-span-3 flex flex-col gap-2.5">
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#d7e4ec]">
              <span className="font-semibold text-[13px] text-[#111d23]">Документ #PV-0042</span>
              <span className="font-mono text-[10px] bg-[#e3f0f8] px-1.5 py-0.5 rounded text-[#536166]">
                4.8 МБ
              </span>
            </div>

            {/* Thumbnail Canvas */}
            <div className="relative w-full h-44 rounded bg-[#e9f6fd] overflow-hidden flex flex-col items-center justify-center border border-[#d7e4ec]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmOn8shvMmaW46wp0bmnS-3fYfHr0meVhOoNLPCwK2JAQfn0gDJLzdNrr29DElHoZZEDLourYrLoBQSWIIbsxyS7xsZOp22YwwvL2lbY7v7B487mzWC80ar11hYg5HYUixbvsnuSZcqrQCqHrQiS5qMxGRdDEq4kZAcLrG4G7j_MUWA1DcUtuCz7A8R_VDgjRMiymOWLXnwF_tq6hYCiGP8vokNhJ8aFOSUK2l_1MXfNeBqPP-wU9NvA"
                alt="Скан документа"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                Стр. 1 из 4 • JPEG (300 DPI)
              </div>
            </div>

            {/* Path Preview */}
            <div className="p-2 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex flex-col gap-1 text-[11px]">
              <span className="text-[#6e7978] font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#006763]">folder_open</span>
                Предпросмотр назначения в архиве:
              </span>
              <div className="font-mono text-[11px] text-[#006763] bg-white p-1.5 rounded border border-[#d7e4ec] break-all">
                {previewCanonicalPath}
              </div>
            </div>

            {/* Readiness Note */}
            <div className="p-2 rounded bg-[#fff3e0] border border-[#e68a00]/30 text-[11px] text-[#e68a00] flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">info</span>
              <div>
                <strong>Требует заполнения — можно продолжить.</strong> Документ валиден для предварительного сохранения. Реквизиты будут проверены в Редакторе данных.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Classification Form */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-8 2xl:col-span-9 flex flex-col gap-3">
          <div className="bg-white p-4 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-3.5">
            {/* 1. Storage Zone */}
            <div className="flex flex-col gap-1.5 p-3 rounded bg-[#e9f6fd] border border-[#d7e4ec]">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006763]" />
                  <span>1. Зона хранения</span>
                </label>
                <span className="text-[11px] text-[#536166]">Режим приватности и шифрования</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-[#e3f0f8] rounded">
                <button
                  type="button"
                  onClick={() => updateClassification({ zone: 'open' })}
                  className={`py-1.5 px-3 rounded text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all ${
                    classificationData.zone === 'open'
                      ? 'bg-white text-[#006763] font-semibold shadow-xs'
                      : 'text-[#3e4948] hover:text-[#111d23]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">lock_open</span>
                  <span>Открытое хранилище (Open)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isVeraCryptMounted) {
                      showToast('Ключ тома VeraCrypt не подключен (UX-032)', 'error');
                    }
                    updateClassification({ zone: 'secret' });
                  }}
                  className={`py-1.5 px-3 rounded text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all ${
                    classificationData.zone === 'secret'
                      ? 'bg-white text-[#ba1a1a] font-semibold shadow-xs'
                      : 'text-[#3e4948] hover:text-[#111d23]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">encrypted</span>
                  <span>Секретное (Secret Vault)</span>
                </button>
              </div>

              {classificationData.zone === 'secret' && !isVeraCryptMounted && (
                <div className="p-2 rounded bg-[#ffdad6] text-[#ba1a1a] text-[11px] flex items-center gap-1.5 border border-[#ba1a1a]/30">
                  <span className="material-symbols-outlined text-[15px]">key_off</span>
                  <span>
                    <strong>Внимание:</strong> Том VeraCrypt отключен. Сохранение в Secret будет заблокировано до подключения тома.
                  </span>
                </div>
              )}
            </div>

            {/* 2. Category & Type */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006763]" />
                  <span>2. Категория и Тип документа</span>
                </h3>
                <span className="text-[11px] text-[#6e7978]">Определяет дерево каталога</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                <div className="flex flex-col gap-1">
                  <label className="text-[#536166] font-medium">Категория архива:</label>
                  <select
                    value={classificationData.category}
                    onChange={(e) => updateClassification({ category: e.target.value })}
                    className="h-8 px-2 rounded bg-[#f4faff] border border-[#d7e4ec] text-[#111d23]"
                  >
                    <option value="Жильё">Жильё</option>
                    <option value="Коммунальные">Коммунальные</option>
                    <option value="Здоровье">Здоровье</option>
                    <option value="Финансы">Финансы</option>
                    <option value="Работа">Работа</option>
                    <option value="Не распределено">— Определить позже —</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#536166] font-medium">Тип документа:</label>
                  <select
                    value={classificationData.docType}
                    onChange={(e) => updateClassification({ docType: e.target.value })}
                    className="h-8 px-2 rounded bg-[#f4faff] border border-[#d7e4ec] text-[#111d23]"
                  >
                    <option value="Акт приёма-передачи">Акт приёма-передачи</option>
                    <option value="Договор найма">Договор найма</option>
                    <option value="Квитанция об оплате">Квитанция об оплате</option>
                    <option value="Справка">Справка</option>
                    <option value="Без типа">— Определить позже —</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-[12px]">
                <label className="text-[#536166] font-medium">Подраздел / проект (опционально):</label>
                <input
                  type="text"
                  value={classificationData.topic}
                  onChange={(e) => updateClassification({ topic: e.target.value })}
                  className="h-8 px-2 rounded bg-[#f4faff] border border-[#d7e4ec] text-[#111d23]"
                  placeholder="Например: Аренда на Большой Морской..."
                />
              </div>
            </div>

            <div className="h-px bg-[#d7e4ec]" />

            {/* 3. Document Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006763]" />
                  <span>3. Название документа</span>
                </h3>
              </div>
              <input
                type="text"
                value={classificationData.title}
                onChange={(e) => updateClassification({ title: e.target.value })}
                className="h-8 px-2 rounded bg-[#f4faff] border border-[#d7e4ec] text-[12px] font-semibold text-[#111d23]"
              />
              <div className="flex items-center gap-4 text-[11px] text-[#536166]">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="title_stat"
                    checked={!classificationData.isDraftTitle}
                    onChange={() => updateClassification({ isDraftTitle: false })}
                    className="accent-[#006763]"
                  />
                  <span>Окончательное название</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="title_stat"
                    checked={classificationData.isDraftTitle}
                    onChange={() => updateClassification({ isDraftTitle: true })}
                    className="accent-[#006763]"
                  />
                  <span>Временное рабочее (черновик) [DRAFT]</span>
                </label>
              </div>
            </div>

            <div className="h-px bg-[#d7e4ec]" />

            {/* 4. Document Date (3 Distinct Modes) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006763]" />
                  <span>4. Дата документа (3 режима)</span>
                </h3>
              </div>

              <div className="flex flex-col gap-1.5 p-2.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] text-[12px]">
                {/* Mode 1: Concrete */}
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="date_mode"
                      checked={classificationData.dateMode === 'concrete'}
                      onChange={() => updateClassification({ dateMode: 'concrete' })}
                      className="accent-[#006763]"
                    />
                    <span>Указать точную дату документа:</span>
                  </div>
                  <input
                    type="text"
                    value={classificationData.docDate}
                    onChange={(e) => updateClassification({ docDate: e.target.value })}
                    disabled={classificationData.dateMode !== 'concrete'}
                    className="w-28 h-6 px-1.5 bg-white text-center rounded border border-[#d7e4ec] font-mono text-[11px]"
                  />
                </label>

                {/* Mode 2: Unknown (Deliberate) */}
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="date_mode"
                      checked={classificationData.dateMode === 'unknown'}
                      onChange={() => updateClassification({ dateMode: 'unknown' })}
                      className="accent-[#006763]"
                    />
                    <span>Дата неизвестна (в первоисточнике отсутствует или стёрта)</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#6e7978]">[UNDATED]</span>
                </label>

                {/* Mode 3: Deferred */}
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="date_mode"
                      checked={classificationData.dateMode === 'deferred'}
                      onChange={() => updateClassification({ dateMode: 'deferred' })}
                      className="accent-[#006763]"
                    />
                    <span>Оставить дату необработанной (отложить на следующий шаг)</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#12827c]">ОТЛОЖЕНО</span>
                </label>
              </div>
            </div>

            <div className="h-px bg-[#d7e4ec]" />

            {/* 5. Template & Relations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#536166]">Шаблон для ввода данных:</label>
                <select
                  value={classificationData.templateId}
                  onChange={(e) => updateClassification({ templateId: e.target.value })}
                  className="h-8 px-2 rounded bg-[#f4faff] border border-[#d7e4ec] text-[#111d23]"
                >
                  <option value="tpl-1">Акт приёма-передачи имущества (v1.2, 5 полей)</option>
                  <option value="tpl-2">Договор найма жилья (v2.0, 12 полей)</option>
                  <option value="tpl-3">Платёжная квитанция ЖКХ (v1.0)</option>
                  <option value="none">Без шаблона / Произвольные поля</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#536166]">Связь с родительским документом:</label>
                <div className="h-8 px-2 rounded bg-[#f4faff] border border-[#d7e4ec] flex items-center justify-between text-[11px]">
                  <span className="truncate text-[#006763] font-medium">PV-0041 · Договор найма № 42</span>
                  <span className="material-symbols-outlined text-[14px] text-[#536166]">link</span>
                </div>
              </div>
            </div>

            {/* Obsidian toggle */}
            <div className="flex items-center justify-between p-2 rounded bg-[#e9f6fd] border border-[#d7e4ec] text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classificationData.exportObsidian}
                  onChange={(e) => updateClassification({ exportObsidian: e.target.checked })}
                  className="accent-[#006763] rounded"
                />
                <span>Экспорт карточки в Obsidian Vault при архивации (.md)</span>
              </label>
              <span className="material-symbols-outlined text-[15px] text-[#006763]">sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Progression Bar */}
      <div className="sticky bottom-0 bg-[#ddeaf2] p-2.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[12px] shadow-sm">
        <button
          onClick={() => setCurrentScreen('SCR-04')}
          className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад к предпроверке</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Черновик сохранён (F10)')}
            className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Сохранить черновик (F10)</span>
          </button>
          <button
            onClick={handleProceed}
            className="h-8 px-4 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Продолжить к вводу данных</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
