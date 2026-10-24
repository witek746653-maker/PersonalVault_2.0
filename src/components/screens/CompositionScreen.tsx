import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const CompositionScreen: React.FC = () => {
  const {
    navigateTo,
    processingSession,
    reorderProcessingPages,
    removeProcessingPage,
    showToast
  } = useVault();

  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const activePage = processingSession.files.find(f => f.id === activePageId) || processingSession.files[0];

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderProcessingPages(index, index - 1);
      showToast('Порядок страниц обновлен: страница перемещена выше');
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < processingSession.files.length - 1) {
      reorderProcessingPages(index, index + 1);
      showToast('Порядок страниц обновлен: страница перемещена ниже');
    }
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Stepper Widget */}
      <div className="bg-surface-container-lowest rounded-lg p-3 mb-2.5 border border-surface-container-highest shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">layers</span>
            <h1 className="font-bold text-[13px] text-on-surface">
              Подготовка документов: Этап 2 из 4 — Состав документа
            </h1>
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[11px] font-medium">
              Группировка файлов и порядок страниц
            </span>
          </div>
          <div className="text-[11px] font-code text-secondary">
            Сессия: <strong className="text-on-surface">PKG-2026-0428-A</strong>
          </div>
        </div>

        {/* 5-step Pipeline indicator */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <button onClick={() => navigateTo('vkhodyashchie')} className="flex flex-col gap-1 text-left cursor-pointer">
            <div className="h-1 rounded-full bg-primary opacity-60"></div>
            <div className="flex items-center gap-1 text-[11px] text-primary font-medium">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              <span>1. Входящие</span>
            </div>
          </button>

          <div className="flex flex-col gap-1">
            <div className="h-1 rounded-full bg-primary"></div>
            <div className="flex items-center gap-1 text-[11px] text-primary font-bold">
              <span className="material-symbols-outlined text-[13px]">radio_button_checked</span>
              <span>2. Состав (активен)</span>
            </div>
          </div>

          <button onClick={() => navigateTo('predproverka')} className="flex flex-col gap-1 text-left cursor-pointer">
            <div className="h-1 rounded-full bg-surface-container-highest"></div>
            <div className="flex items-center gap-1 text-[11px] text-secondary hover:text-on-surface">
              <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
              <span>3. Предпроверка</span>
            </div>
          </button>

          <button onClick={() => navigateTo('klassifikaciya')} className="flex flex-col gap-1 text-left cursor-pointer">
            <div className="h-1 rounded-full bg-surface-container-highest"></div>
            <div className="flex items-center gap-1 text-[11px] text-secondary hover:text-on-surface">
              <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
              <span>4. Классификация</span>
            </div>
          </button>

          <button onClick={() => navigateTo('redaktor')} className="flex flex-col gap-1 text-left cursor-pointer">
            <div className="h-1 rounded-full bg-surface-container-highest"></div>
            <div className="flex items-center gap-1 text-[11px] text-secondary hover:text-on-surface">
              <span className="material-symbols-outlined text-[13px] text-outline">lock</span>
              <span>Редактор (SCR-06)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-center justify-between p-2.5 rounded bg-surface-container-low border border-surface-container-highest shadow-xs mb-2.5 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[17px]">info</span>
          <span className="text-on-surface">
            Формирование единого документа из <strong className="text-primary font-bold">{processingSession.files.length} исходных файлов</strong>. Локальные оригиналы на накопителе защищены от перезаписи (Read-Only Source Lock).
          </span>
        </div>
        <span className="font-code text-[10px] text-primary font-semibold bg-surface-container px-2 py-0.5 rounded">
          SHA-256 SAFE
        </span>
      </div>

      {/* Secondary Action Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-low rounded border border-surface-container-highest mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => showToast('Диалог выбора локального файла')}
            className="h-7 px-2.5 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center gap-1 text-[11px] border border-surface-container-highest cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">add_circle</span>
            <span>Добавить файл в набор (+)</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Разъединить данный набор? Файлы вернутся во Входящие.')) {
                navigateTo('vkhodyashchie');
              }
            }}
            className="h-7 px-2.5 rounded bg-surface-container-lowest text-secondary hover:text-on-surface flex items-center gap-1 text-[11px] border border-surface-container-highest cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">call_split</span>
            <span>Разъединить набор</span>
          </button>
          <div className="h-4 w-px bg-outline-variant mx-0.5"></div>
          <button
            onClick={() => {
              const idx = processingSession.files.findIndex(f => f.id === activePageId);
              handleMoveUp(idx);
            }}
            className="h-7 px-2.5 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center gap-1 text-[11px] border border-surface-container-highest cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">arrow_upward</span>
            <span>▲ Выше</span>
          </button>
          <button
            onClick={() => {
              const idx = processingSession.files.findIndex(f => f.id === activePageId);
              handleMoveDown(idx);
            }}
            className="h-7 px-2.5 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center gap-1 text-[11px] border border-surface-container-highest cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">arrow_downward</span>
            <span>▼ Ниже</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          <span>В составе: <strong>{processingSession.files.length} исходных файла</strong></span>
        </div>
      </div>

      {/* Main Workspace: Left Page List (60%) / Right Detailed Preview (40%) */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: Sequence & Drag-and-drop Page Cards */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-[12px] font-semibold">
              <span className="material-symbols-outlined text-primary text-[16px]">format_list_numbered</span>
              <span>Итоговый порядок страниц в документе</span>
            </div>
            <span className="text-[11px] text-secondary">Используйте стрелки или кнопки для перестановки</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {processingSession.files.map((file, idx) => {
              const isSelected = file.id === activePageId;
              return (
                <div
                  key={file.id}
                  onClick={() => setActivePageId(file.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-fixed/20 shadow-xs'
                      : 'border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Page Number Badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-outline cursor-grab text-[16px]">drag_indicator</span>
                      <div className={`w-20 py-1 rounded text-center text-[11px] font-bold ${
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                      }`}>
                        Страница {idx + 1}
                      </div>
                    </div>

                    {/* Mini visual mockup */}
                    <div className="w-12 h-16 rounded bg-surface-container-low border border-surface-container-highest p-1 flex flex-col justify-between shrink-0">
                      <div className="h-0.5 bg-primary w-3/4 rounded-full"></div>
                      <div className="space-y-0.5">
                        <div className="h-0.5 bg-outline-variant w-full rounded-full"></div>
                        <div className="h-0.5 bg-outline-variant w-5/6 rounded-full"></div>
                      </div>
                      <span className="text-[7px] text-right font-code text-secondary">{idx + 1}/1</span>
                    </div>

                    {/* File Meta */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[12px] text-on-surface truncate">{file.name}</span>
                        <span className="px-1 py-0.2 rounded bg-surface-container font-code text-[10px] text-secondary">
                          стр. 1/1
                        </span>
                      </div>
                      <span className="text-[11px] text-secondary truncate">
                        {idx === 0 ? 'Акт приёма-передачи жилья, вводная часть' :
                         idx === 1 ? 'Опись мебели и переданного имущества' :
                         idx === 2 ? 'Фотофиксация приборов учёта и ключей' :
                         'Приложение показаний приборов учёта PDF'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-secondary font-code mt-0.5">
                        <span>{file.spec}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.dpi} DPI</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="w-6 h-6 rounded flex items-center justify-center text-secondary hover:bg-surface-container disabled:opacity-30 cursor-pointer"
                      title="Выше"
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_less</span>
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === processingSession.files.length - 1}
                      className="w-6 h-6 rounded flex items-center justify-center text-secondary hover:bg-surface-container disabled:opacity-30 cursor-pointer"
                      title="Ниже"
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_more</span>
                    </button>
                    <button
                      onClick={() => removeProcessingPage(file.id)}
                      className="h-6 px-1.5 rounded hover:bg-error-container hover:text-error text-secondary text-[11px] flex items-center gap-0.5 cursor-pointer"
                      title="Исключить страницу из набора"
                    >
                      <span className="material-symbols-outlined text-[13px]">call_split</span>
                      <span className="hidden xl:inline">Извлечь</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Dropzone */}
          <div
            onClick={() => showToast('Перетаскивание файлов: эмуляция добавления')}
            className="p-3 rounded-lg border border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center gap-2 text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer text-[12px] font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">library_add</span>
            <span>Перетащите дополнительные сканы сюда для добавления в конец</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Page Detailed Canvas Preview */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-[12px] font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[16px]">visibility</span>
              <span>Детальный предпросмотр: {activePage?.name}</span>
            </div>

            {/* Zoom / Rotate Controls */}
            <div className="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded border border-surface-container-highest text-[11px]">
              <button
                onClick={() => setZoomLevel(prev => Math.max(60, prev - 15))}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-container text-secondary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">remove</span>
              </button>
              <span className="font-code px-1 text-on-surface font-semibold">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-container text-secondary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">add</span>
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-container text-secondary cursor-pointer"
                title="Повернуть 90°"
              >
                <span className="material-symbols-outlined text-[13px]">rotate_right</span>
              </button>
            </div>
          </div>

          {/* Document Canvas Preview Box */}
          <div className="bg-surface-container-high rounded-lg p-4 border border-surface-container-highest shadow-xs flex flex-col items-center justify-start min-h-[420px] overflow-hidden relative">
            <div
              className="w-full max-w-[360px] bg-surface-container-lowest rounded shadow-md p-5 flex flex-col justify-between text-on-surface select-text transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                minHeight: '380px'
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start text-[9px] text-secondary font-code">
                  <span>Экземпляр Нанимателя</span>
                  <span className="bg-surface-container px-1 rounded text-primary font-bold">Лист {activePage?.pageNum || 1} из 4</span>
                </div>

                <div className="text-center pt-1">
                  <h3 className="font-bold text-[11px] uppercase tracking-tight text-on-surface">
                    ПРИЛОЖЕНИЕ № 1 К ДОГОВОРУ НАЙМА № 42
                  </h3>
                  <p className="text-[10px] font-semibold text-primary">
                    АКТ ПРИЁМА-ПЕРЕДАЧИ ЖИЛОГО ПОМЕЩЕНИЯ И ИМУЩЕСТВА
                  </p>
                </div>

                <div className="flex justify-between text-[10px] text-secondary">
                  <span>г. Санкт-Петербург</span>
                  <span>12 октября 2026 г.</span>
                </div>

                <div className="text-[10.5px] leading-relaxed text-justify space-y-1 mt-1">
                  <p>
                    Мы, нижеподписавшиеся, <strong>Наймодатель</strong> гр. Васильев Андрей Сергеевич, и <strong>Наниматель</strong> гр. Соколов Алексей Николаевич, составили настоящий акт:
                  </p>
                  <p>
                    1. Наймодатель передал квартиру общей площадью 64.5 кв. м по адресу: Санкт-Петербург, Московский пр., д. 182, кв. 42.
                  </p>
                  <p>
                    2. Состояние оборудования проверено: холодильник Bosch, стиральная машина LG, 2 комплекта ключей.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-surface-container text-[9px] text-outline font-code">
                <span>PersonalVault Local Lock</span>
                <span>300 DPI Original</span>
              </div>
            </div>
          </div>

          {/* Page Metadata Card */}
          <div className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container-highest shadow-xs flex flex-col gap-1.5 text-[11px]">
            <div className="flex justify-between items-center font-semibold pb-1 border-b border-surface-container">
              <span>Метаданные страницы</span>
              <span className="text-primary font-code">Связан с исходником</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div>
                <span className="text-secondary">Файл: </span>
                <span className="font-code font-bold text-on-surface">{activePage?.name}</span>
              </div>
              <div>
                <span className="text-secondary">Позиция в наборе: </span>
                <span className="font-semibold text-primary">Стр. {activePage?.pageNum} из {processingSession.files.length}</span>
              </div>
              <div className="col-span-2">
                <span className="text-secondary">Спецификация: </span>
                <span className="font-code text-on-surface">{activePage?.spec}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-[210px] right-0 z-30 h-11 bg-surface-container-high border-t border-surface-container-highest px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigateTo('vkhodyashchie')}
          className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>← Назад во Входящие</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Черновик состава сохранен')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Сохранить черновик</span>
          </button>

          <button
            onClick={() => navigateTo('predproverka')}
            className="h-7 px-4 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Подтвердить порядок и продолжить к проверке (SCR-04)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
