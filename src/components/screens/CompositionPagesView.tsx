/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const CompositionPagesView: React.FC = () => {
  const {
    compositionPages,
    movePage,
    excludePage,
    restoreExcludedPage,
    setCurrentScreen,
    setPipelineStep,
    showToast,
  } = useVault();

  const [activePageId, setActivePageId] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  const activePage = compositionPages.find((p) => p.id === activePageId) || compositionPages[0];
  const excludedPages = compositionPages.filter((p) => p.isExcluded);
  const visiblePages = compositionPages.filter((p) => !p.isExcluded);

  const handleProceed = () => {
    setPipelineStep(3);
    setCurrentScreen('SCR-04');
    showToast('Порядок страниц утверждён. Переход к Предпроверке', 'arrow_forward');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Stage Stepper Banner */}
      <div className="bg-white rounded border border-[#d7e4ec] p-3 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006763] text-[20px]">layers</span>
            <h1 className="font-semibold text-[14px]">
              Подготовка документов: Этап 2 из 4 — Состав документа
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#536166] text-[11px] font-medium">
              Группировка файлов и порядок страниц
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#536166]">
            Сессия: <strong className="text-[#111d23]">PKG-2026-0428-A</strong>
          </span>
        </div>

        {/* 5-step progress indicators */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          <div className="flex flex-col gap-1">
            <div className="h-1.5 rounded-full bg-[#006763] opacity-60"></div>
            <span className="text-[11px] text-[#006763] font-medium">1. Входящие</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-1.5 rounded-full bg-[#006763]"></div>
            <span className="text-[11px] text-[#006763] font-bold">2. Состав (активен)</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-1.5 rounded-full bg-[#d7e4ec]"></div>
            <span className="text-[11px] text-[#6e7978]">3. Предпроверка</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-1.5 rounded-full bg-[#d7e4ec]"></div>
            <span className="text-[11px] text-[#6e7978]">4. Классификация</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-1.5 rounded-full bg-[#d7e4ec]"></div>
            <span className="text-[11px] text-[#6e7978]">5. Редактор данных</span>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded bg-[#ddeaf2] flex items-center justify-between border border-[#d7e4ec] text-[12px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#006763]">info</span>
          <div>
            <strong>Формирование единого документа из {visiblePages.length} исходных файлов.</strong>{' '}
            Локальные оригиналы на диске защищены от изменений (<code>Read-Only Source Lock</code>).
          </div>
        </div>
        <span className="font-mono text-[11px] text-[#006763] font-semibold shrink-0">
          Source Lock: Active
        </span>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#e9f6fd] rounded border border-[#d7e4ec] text-[12px] flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => showToast('Диалог добавления дополнительного скана')}
            className="h-7 px-2.5 rounded bg-white hover:bg-[#ddeaf2] text-[#111d23] border border-[#d7e4ec] flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[15px] text-[#006763]">add_circle</span>
            <span>Добавить файл в набор (+)</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Разъединить данный набор? Все файлы останутся целыми во Входящих.')) {
                setCurrentScreen('SCR-02');
              }
            }}
            className="h-7 px-2.5 rounded bg-white hover:bg-[#ddeaf2] text-[#111d23] border border-[#d7e4ec] flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[15px] text-[#536166]">call_split</span>
            <span>Разъединить набор</span>
          </button>
          <button
            onClick={() => excludePage(activePageId)}
            className="h-7 px-2.5 rounded bg-white hover:bg-[#ffebee] text-[#ba1a1a] border border-[#d7e4ec] flex items-center gap-1 font-medium"
            title="Страница исключается только из набора"
          >
            <span className="material-symbols-outlined text-[15px]">remove_circle_outline</span>
            <span>Исключить из набора</span>
          </button>
          <div className="h-4 w-px bg-[#d7e4ec] mx-1"></div>
          <button
            onClick={() => movePage(activePageId, 'up')}
            className="h-7 px-2.5 rounded bg-white hover:bg-[#ddeaf2] text-[#006763] border border-[#d7e4ec] flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
            <span>Выше</span>
          </button>
          <button
            onClick={() => movePage(activePageId, 'down')}
            className="h-7 px-2.5 rounded bg-white hover:bg-[#ddeaf2] text-[#006763] border border-[#d7e4ec] flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
            <span>Ниже</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[#536166] text-[11px] font-mono">
          <span>В составе: {visiblePages.length} стр.</span>
        </div>
      </div>

      {/* Two Column Layout: Left Page List (60%) + Right Detailed Preview (40%) */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left Column: Pages List */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-2">
          {/* Excluded undo banner */}
          {excludedPages.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-[#fff3e0] border border-[#e68a00]/30 rounded text-[12px] text-[#e68a00]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                <span>
                  Исключённых страниц: <strong>{excludedPages.length}</strong> (исходные файлы на диске не удалены)
                </span>
              </div>
              <button
                onClick={() => restoreExcludedPage(excludedPages[0].id)}
                className="px-2.5 py-0.5 rounded bg-[#e68a00] text-white text-[11px] font-semibold"
              >
                Восстановить
              </button>
            </div>
          )}

          {/* Cards Stack */}
          <div className="flex flex-col gap-1.5">
            {visiblePages.map((page, index) => {
              const isSelected = activePageId === page.id;
              return (
                <div
                  key={page.id}
                  onClick={() => setActivePageId(page.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#006763] shadow-xs'
                      : 'bg-white border-[#d7e4ec] hover:bg-[#e9f6fd]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-[#6e7978] cursor-grab text-[16px]">
                      drag_indicator
                    </span>

                    {/* Number Badge */}
                    <div
                      className={`w-20 py-1 rounded text-center text-[11px] font-bold ${
                        isSelected
                          ? 'bg-[#006763] text-white'
                          : 'bg-[#e3f0f8] text-[#3e4948]'
                      }`}
                    >
                      Стр. {index + 1}
                    </div>

                    {/* Thumbnail preview badge */}
                    <div className="w-12 h-16 bg-[#f4faff] border border-[#d7e4ec] rounded p-1 flex flex-col justify-between shrink-0 shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="h-1 w-3/4 bg-[#006763] rounded"></div>
                        <div className="h-0.5 w-full bg-[#bdc9c7] rounded"></div>
                        <div className="h-0.5 w-5/6 bg-[#bdc9c7] rounded"></div>
                      </div>
                      <span className="font-mono text-[7px] text-[#6e7978] text-right">
                        {page.origPos}
                      </span>
                    </div>

                    {/* File Information */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-[#111d23] truncate">
                          {page.fileName}
                        </span>
                        <span className="font-mono text-[10px] text-[#6e7978] bg-[#e3f0f8] px-1 rounded">
                          {page.spec}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#536166] truncate">{page.summary}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => movePage(page.id, 'up')}
                      className="w-6 h-6 rounded hover:bg-[#e3f0f8] flex items-center justify-center text-[#536166]"
                      title="Выше"
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_less</span>
                    </button>
                    <button
                      onClick={() => movePage(page.id, 'down')}
                      className="w-6 h-6 rounded hover:bg-[#e3f0f8] flex items-center justify-center text-[#536166]"
                      title="Ниже"
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_more</span>
                    </button>
                    <button
                      onClick={() => excludePage(page.id)}
                      className="h-6 px-1.5 rounded hover:bg-[#ffdad6] text-[#ba1a1a] text-[11px] flex items-center gap-0.5"
                      title="Исключить из набора"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Document Preview & Metadata */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center justify-between p-2 bg-[#e9f6fd] border border-[#d7e4ec] rounded text-[11px]">
            <span className="font-semibold text-[#111d23] truncate">
              Детальный предпросмотр: Стр. {activePage ? activePage.id : 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="w-6 h-6 rounded bg-white hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
              >
                -
              </button>
              <span className="font-mono text-[10px] w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                className="w-6 h-6 rounded bg-white hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
              >
                +
              </button>
              <button
                onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                className="w-6 h-6 rounded bg-white hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec] ml-1"
                title="Повернуть на 90°"
              >
                <span className="material-symbols-outlined text-[13px]">rotate_right</span>
              </button>
            </div>
          </div>

          {/* Paper Canvas */}
          <div className="bg-[#cfdce4] p-4 rounded-lg flex items-center justify-center overflow-hidden min-h-[380px] xl:min-h-[440px]">
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-[340px] xl:w-[390px] 2xl:w-[430px] max-w-full min-h-[460px] bg-white text-[#111d23] shadow-md p-6 rounded-sm flex flex-col justify-between text-[11px] leading-relaxed select-text"
            >
              <div>
                <div className="flex justify-between text-[9px] text-[#6e7978] font-mono border-b border-[#d7e4ec] pb-1">
                  <span>ЭКЗЕМПЛЯР НАНИМАТЕЛЯ</span>
                  <span>АРХИВ PV-2026</span>
                </div>
                <div className="text-center my-3">
                  <div className="font-bold text-[12px] uppercase">{activePage?.title}</div>
                  <div className="text-[10px] text-[#006763] font-semibold">{activePage?.subtitle}</div>
                </div>
                <div className="flex justify-between text-[9px] text-[#536166] mb-3">
                  <span>г. Санкт-Петербург</span>
                  <span>12 октября 2026 г.</span>
                </div>
                <p className="text-[10px] text-[#3e4948] mb-2">
                  Мы, нижеподписавшиеся, Наймодатель Васильев А.С., с одной стороны, и Наниматель Смирнова Е.И., с другой стороны, составили настоящий акт о том, что жилое помещение передано в надлежащем состоянии.
                </p>
                <div className="p-2 bg-[#f4faff] rounded border border-[#d7e4ec] text-[9px] font-mono my-2 space-y-1">
                  <div className="font-bold text-[#111d23]">Оборудование:</div>
                  <div className="flex justify-between">
                    <span>Холодильник Bosch</span>
                    <span className="text-[#006763]">Исправен</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Стиральная машина LG</span>
                    <span className="text-[#006763]">Исправна</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#d7e4ec] text-[8px] text-[#6e7978] font-mono">
                <span>PersonalVault Digitized • SHA-256 Valid</span>
                <span>{activePage?.globalNum}</span>
              </div>
            </div>
          </div>

          {/* Page Metadata Panel */}
          <div className="bg-white p-2.5 rounded border border-[#d7e4ec] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#536166]">Исходный файл:</span>
              <strong className="font-mono">{activePage?.fileName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#536166]">Цветовой профиль:</span>
              <span className="font-mono">{activePage?.spec}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#536166]">Хэш страницы:</span>
              <span className="font-mono text-[#006763]">Verified (300 DPI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Progression Bar */}
      <div className="sticky bottom-0 bg-[#ddeaf2] p-2.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[12px] shadow-sm">
        <button
          onClick={() => setCurrentScreen('SCR-02')}
          className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад во Входящие</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Черновик набора сохранён в память (F10)')}
            className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
          >
            <span className="material-symbols-outlined text-[15px]">bookmark_border</span>
            <span>Сохранить черновик</span>
          </button>
          <button
            onClick={handleProceed}
            className="h-8 px-4 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Подтвердить порядок и продолжить к проверке</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
