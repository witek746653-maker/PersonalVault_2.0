/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';

export const DocumentCardView: React.FC = () => {
  const {
    activeDocId,
    documents,
    setCurrentScreen,
    goBack,
    previousScreenTitle,
    activeScenario,
    isVeraCryptMounted,
    showToast,
  } = useVault();

  const doc = documents.find((d) => d.id === activeDocId) || documents[0];

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showHighlights, setShowHighlights] = useState(true);

  // Modals and Drawers
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(activeScenario === 'history');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(activeScenario === 'move');
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(activeScenario === 'transcript');
  const [transcriptTab, setTranscriptTab] = useState<'normal' | 'empty' | 'secret'>('normal');

  // Handle Esc key to go back if no modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isHistoryDrawerOpen && !isMoveModalOpen && !isTranscriptModalOpen) {
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, isHistoryDrawerOpen, isMoveModalOpen, isTranscriptModalOpen]);

  // Scenarios
  const isMissing = activeScenario === 'missing';
  const isHashError = activeScenario === 'hash';
  const isCrash = activeScenario === 'crash';
  const isSecretLocked = activeScenario === 'secret' || !isVeraCryptMounted;

  const handleConfirmMove = () => {
    setIsMoveModalOpen(false);
    showToast('Документ успешно перемещён в целевой каталог с сохранением всех связей!', 'drive_file_move');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Sub-header & Action Ribbon */}
      <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={goBack}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] text-[11px] font-medium border border-[#d7e4ec]"
              title={`Вернуться: ${previousScreenTitle || 'Журнал'} (Esc)`}
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>{previousScreenTitle || 'Журнал'}</span>
              <kbd className="font-mono text-[9px] bg-white px-1 rounded text-[#536166]">Esc</kbd>
            </button>
            <span className="text-[#6e7978]">/</span>
            <span className="text-[12px] text-[#536166]">{doc.category}</span>
            <span className="text-[#6e7978]">/</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[11px] font-bold text-[#006763]">{doc.id}</span>
              <span className="font-semibold text-[13px] text-[#111d23] truncate">{doc.title}</span>
              <span className="font-mono text-[10px] text-[#536166] bg-[#e3f0f8] px-1.5 py-0.5 rounded">
                {doc.revision}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#006763] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Целостность подтверждена
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-[#d7e4ec] flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentScreen('SCR-06', 'Карточка документа')}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#006763] text-white hover:bg-[#12827c] transition-colors font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              <span>Редактор данных</span>
              <kbd className="font-mono text-[9px] bg-white/20 px-1 rounded">F4</kbd>
            </button>
            <button
              onClick={() => setCurrentScreen('SCR-07', 'Карточка документа')}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] border border-[#d7e4ec] transition-colors font-medium shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px] text-[#006763]">fact_check</span>
              <span>Сверка со сканом</span>
              <kbd className="font-mono text-[9px] bg-[#e3f0f8] px-1 rounded text-[#536166]">F5</kbd>
            </button>

            <div className="h-4 w-px bg-[#d7e4ec] mx-1"></div>

            {/* Parent Document Jump */}
            {doc.relations.length > 0 && (
              <button
                onClick={() => {
                  showToast(`Переход к родительскому документу ${doc.relations[0].id}`);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#006763] font-medium border border-[#d7e4ec]"
              >
                <span className="material-symbols-outlined text-[13px]">account_tree</span>
                <span>Родитель: <strong>{doc.relations[0].id}</strong></span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMoveModalOpen(true)}
              className="px-2.5 py-1 rounded bg-white hover:bg-[#e9f6fd] text-[#3e4948] border border-[#d7e4ec]"
            >
              Переместить...
            </button>
            <button
              onClick={() => setIsHistoryDrawerOpen((prev) => !prev)}
              className="px-2.5 py-1 rounded bg-white hover:bg-[#e9f6fd] text-[#3e4948] border border-[#d7e4ec]"
            >
              История (r1)
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Panel Layout */}
      <div className="grid grid-cols-12 gap-3 items-start w-full">
        {/* Left Column: Read-Only Document Viewer (6 cols) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden">
          <div className="h-8 bg-[#e9f6fd] px-3 flex items-center justify-between border-b border-[#d7e4ec] text-[11px]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
              >
                -
              </button>
              <span className="font-mono text-[10px] w-9 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-1.5 py-0.5 rounded bg-white border border-[#d7e4ec] text-[10px]"
              >
                100%
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center text-[#536166]"
              >
                ‹
              </button>
              <span className="font-mono">{currentPage} из {doc.pagesCount}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(doc.pagesCount, p + 1))}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center text-[#536166]"
              >
                ›
              </button>
            </div>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showHighlights}
                onChange={(e) => setShowHighlights(e.target.checked)}
                className="accent-[#006763] rounded"
              />
              <span>Подсветка сверок</span>
            </label>
          </div>

          {/* Viewport Canvas or Simulation Error */}
          <div className="p-4 bg-[#cfdce4] overflow-auto max-h-[640px] min-h-[500px] flex justify-center items-start">
            {isMissing ? (
              <div className="p-8 bg-white rounded border border-[#ba1a1a]/40 text-center max-w-sm my-auto">
                <span className="material-symbols-outlined text-[40px] text-[#ba1a1a] mb-2">folder_off</span>
                <h3 className="font-bold text-[14px] text-[#ba1a1a]">Оригинал не найден</h3>
                <p className="text-[12px] text-[#536166] mt-1">
                  Файл в хранилище отсутствует. Ложный предпросмотр отключен в целях безопасности.
                </p>
              </div>
            ) : isHashError ? (
              <div className="p-8 bg-white rounded border border-[#ba1a1a]/40 text-center max-w-sm my-auto">
                <span className="material-symbols-outlined text-[40px] text-[#ba1a1a] mb-2">warning</span>
                <h3 className="font-bold text-[14px] text-[#ba1a1a]">Несовпадение контрольной суммы</h3>
                <p className="text-[12px] text-[#536166] mt-1">
                  Контрольная сумма файла не сходится с архивной записью. Файл мог быть повреждён.
                </p>
              </div>
            ) : isCrash ? (
              <div className="p-8 bg-white rounded border border-[#d7e4ec] text-center max-w-sm my-auto">
                <span className="material-symbols-outlined text-[40px] text-[#6e7978] mb-2">broken_image</span>
                <h3 className="font-bold text-[14px] text-[#111d23]">Сбой внешнего просмотрщика</h3>
                <p className="text-[12px] text-[#536166] mt-1">
                  Не удалось инициализировать модуль рендеринга страницы.
                </p>
              </div>
            ) : (
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full max-w-[480px] xl:max-w-[560px] 2xl:max-w-[640px] bg-[#fbfdfa] text-[#1a2327] shadow-md p-7 rounded-sm select-text font-serif leading-relaxed text-[12px]"
              >
                <div className="text-center mb-3 border-b border-[#d7e4ec] pb-2">
                  <p className="text-[10px] font-mono uppercase text-[#6e7978]">Приложение № 1 к Договору найма № 42</p>
                  <h2 className="text-[13px] font-bold uppercase text-[#111d23]">АКТ ПРИЁМА-ПЕРЕДАЧИ</h2>
                </div>

                <div className="flex justify-between items-center text-[11px] mb-3">
                  <span>г. Санкт-Петербург</span>
                  <span className={showHighlights ? 'p-1 rounded bg-[#95f3eb]/40 text-[#006763] font-semibold' : ''}>
                    «12» октября 2026 г.
                  </span>
                </div>

                <p className="text-[11px] mb-2">
                  Мы, нижеподписавшиеся, Наймодатель Васильев Андрей Сергеевич, и Наниматель Смирнова Елена Игоревна, составили настоящий{' '}
                  <span className={showHighlights ? 'bg-[#95f3eb]/70 font-semibold px-1 rounded' : ''}>
                    Акт № АПП-42
                  </span>
                  .
                </p>

                <p className="text-[11px] mb-2">
                  1. Помещение расположено по адресу: г. Санкт-Петербург, Московский пр., д. 182, кв. 42.
                </p>

                <p className="text-[11px]">
                  2. Ключи от входной двери переданы в количестве 2 комплектов.
                </p>
              </div>
            )}
          </div>

          <div className="h-7 bg-[#e9f6fd] px-3 border-t border-[#d7e4ec] flex items-center justify-between text-[11px] text-[#536166]">
            <span>Режим: Только чтение • Файл защищён от изменений</span>
            <span className="font-mono text-[10px]">Документ зафиксирован</span>
          </div>
        </div>

        {/* Right Column: Validation & Attributes (6 cols) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-2.5">
          {/* Validation Summary */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2">
            <span className="font-semibold text-[13px] text-[#111d23]">Сводка валидации и контроля</span>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="p-2 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#536166]">Полнота данных:</span>
                  <strong className="font-mono text-[#006763]">60%</strong>
                </div>
                <div className="w-full bg-[#e3f0f8] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#006763] h-full" style={{ width: '60%' }} />
                </div>
                <span className="text-[10px] text-[#e68a00] font-semibold">3 из 5 заполнено (2 пусто)</span>
              </div>

              <div className="p-2 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#536166]">Сверка со сканом:</span>
                  <strong className="font-mono text-[#006763]">40%</strong>
                </div>
                <div className="w-full bg-[#e3f0f8] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#12827c] h-full" style={{ width: '40%' }} />
                </div>
                <span className="text-[10px] text-[#006763] font-semibold">2 из 5 сверено</span>
              </div>
            </div>
          </div>

          {/* Relations Box */}
          {doc.relations.length > 0 && (
            <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-1.5 text-[12px]">
              <span className="font-semibold text-[#111d23] text-[11px] uppercase tracking-wider text-[#6e7978]">
                Двусторонняя связь документов
              </span>
              <div className="p-2 rounded bg-[#e3f0f8] flex items-center justify-between">
                <div className="flex items-center gap-2 truncate text-[#006763]">
                  <span className="material-symbols-outlined text-[16px]">call_received</span>
                  <span className="font-semibold truncate">{doc.relations[0].name}</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white text-[#536166]">
                  {doc.relations[0].type}
                </span>
              </div>
            </div>
          )}

          {/* Structured Attributes List */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2 text-[12px]">
            <div className="flex items-center justify-between pb-1 border-b border-[#d7e4ec]">
              <span className="font-semibold text-[13px] text-[#111d23]">Структурированные реквизиты</span>
              <button
                onClick={() => setCurrentScreen('SCR-06', 'Карточка документа')}
                className="text-[#006763] hover:underline font-semibold text-[11px] flex items-center gap-0.5"
              >
                <span>Редактировать</span>
                <span className="material-symbols-outlined text-[13px]">launch</span>
              </button>
            </div>

            <div className="divide-y divide-[#d7e4ec] space-y-1">
              <div className="pt-1 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#111d23]">Номер документа *</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold">
                    ✓ Сверено со сканом
                  </span>
                </div>
                <div className="font-mono text-[#006763] font-bold">№ АПП-42</div>
                <span className="text-[10px] text-[#6e7978]">Цитата: «составили настоящий акт № АПП-42»</span>
              </div>

              <div className="pt-1.5 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#111d23]">Дата составления *</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold">
                    ✓ Сверено со сканом
                  </span>
                </div>
                <div className="font-mono font-semibold">{doc.date}</div>
              </div>

              <div className="pt-1.5 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#111d23]">Наниматель *</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#fff3e0] text-[#e68a00] text-[10px]">
                    Не сверено
                  </span>
                </div>
                <div className="text-[#111d23]">Смирнова Елена Игоревна</div>
              </div>

              <div className="pt-1.5 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#111d23]">Комплекты ключей</span>
                  <span className="px-1 py-0.2 rounded bg-[#e3f0f8] text-[9px] font-mono text-[#536166]">
                    пользовательское
                  </span>
                </div>
                <div className="text-[#111d23]">2 комплекта + чип домофона</div>
              </div>
            </div>
          </div>

          {/* Transcript Snippet Card */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[13px] text-[#111d23]">Текстовая расшифровка (OCR)</span>
              <button
                onClick={() => setIsTranscriptModalOpen(true)}
                className="px-2 py-0.5 rounded bg-[#006763] text-white text-[11px] font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                <span>Открыть расшифровку</span>
              </button>
            </div>
            <div className="p-2 rounded bg-[#f4faff] font-mono text-[11px] text-[#3e4948] max-h-24 overflow-y-auto leading-relaxed select-text border border-[#d7e4ec]">
              {doc.transcriptExcerpt}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Modal with 3 States (Normal, Empty, Secret) */}
      {isTranscriptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#d7e4ec] max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden text-[12px]">
            <div className="px-3 py-2 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[#111d23]">
                <span className="material-symbols-outlined text-[16px] text-[#006763]">description</span>
                <span>Текстовая расшифровка • {doc.id} {doc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-[#e3f0f8] p-0.5 rounded text-[10px]">
                  <button
                    onClick={() => setTranscriptTab('normal')}
                    className={`px-1.5 py-0.5 rounded ${transcriptTab === 'normal' ? 'bg-white font-semibold' : ''}`}
                  >
                    Норма
                  </button>
                  <button
                    onClick={() => setTranscriptTab('empty')}
                    className={`px-1.5 py-0.5 rounded ${transcriptTab === 'empty' ? 'bg-white font-semibold' : ''}`}
                  >
                    Нет файла
                  </button>
                  <button
                    onClick={() => setTranscriptTab('secret')}
                    className={`px-1.5 py-0.5 rounded ${transcriptTab === 'secret' ? 'bg-white font-semibold' : ''}`}
                  >
                    Secret
                  </button>
                </div>
                <button onClick={() => setIsTranscriptModalOpen(false)}>
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {transcriptTab === 'normal' && (
                <div className="space-y-2 select-text font-mono text-[11px] leading-relaxed">
                  <div className="font-bold text-[13px] border-b pb-1 font-sans text-[#006763]">
                    # {doc.title}
                  </div>
                  <pre className="whitespace-pre-wrap">{doc.fullTranscript}</pre>
                </div>
              )}
              {transcriptTab === 'empty' && (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-[#6e7978] mb-1">text_snippet</span>
                  <div className="font-semibold text-[13px]">Расшифровка не сформирована</div>
                  <p className="text-[11px] text-[#536166] mt-0.5">Файл расшифровки .txt не найден в контейнере.</p>
                </div>
              )}
              {transcriptTab === 'secret' && (
                <div className="p-8 text-center flex flex-col items-center justify-center bg-[#ffdad6]/20 rounded">
                  <span className="material-symbols-outlined text-[32px] text-[#ba1a1a] mb-1">lock</span>
                  <div className="font-semibold text-[13px] text-[#ba1a1a]">Secret недоступен</div>
                  <p className="text-[11px] text-[#536166] mt-0.5">Текстовая выписка хранится в закрытом томе VeraCrypt.</p>
                </div>
              )}
            </div>

            <div className="px-3 py-2 bg-[#f4faff] border-t border-[#d7e4ec] flex justify-end">
              <button
                onClick={() => setIsTranscriptModalOpen(false)}
                className="px-3 py-1 bg-[#006763] text-white rounded font-semibold text-[11px]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Path Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#d7e4ec] max-w-md w-full p-4 flex flex-col gap-3 text-[12px]">
            <div className="flex items-center gap-2 text-[#006763] font-semibold text-[14px]">
              <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
              <span>Перемещение документа в архиве</span>
            </div>
            <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] space-y-1 text-[11px]">
              <div>Текущее размещение: <strong className="font-mono">{doc.archivePath}</strong></div>
              <div>Новое размещение: <strong className="font-mono text-[#006763]">Open → Жильё → 2026 → [Архив]</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="px-3 py-1 rounded bg-[#e3f0f8] text-[#3e4948]"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmMove}
                className="px-3 py-1 rounded bg-[#006763] text-white font-semibold"
              >
                Подтвердить перемещение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {isHistoryDrawerOpen && (
        <div className="fixed top-9 right-0 bottom-0 w-72 bg-white shadow-xl z-50 border-l border-[#d7e4ec] p-3 flex flex-col gap-2 text-[12px]">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold text-[13px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006763]">history</span>
              История ревизий
            </span>
            <button onClick={() => setIsHistoryDrawerOpen(false)}>
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-2 rounded bg-[#e9f6fd] border border-[#006763]/30">
              <div className="flex justify-between font-bold text-[#006763]">
                <span>Ревизия r1 (текущая)</span>
                <span className="font-mono text-[10px]">12.10.2026</span>
              </div>
              <p className="text-[11px] text-[#3e4948] mt-1">Сверка полей со сканом, добавлены локальные ключи.</p>
            </div>
            <div className="p-2 rounded bg-[#f4faff] border border-[#d7e4ec]">
              <div className="flex justify-between font-semibold text-[#536166]">
                <span>Ревизия r0 (импорт)</span>
                <span className="font-mono text-[10px]">12.10.2026</span>
              </div>
              <p className="text-[11px] text-[#6e7978] mt-1">Первичный импорт из очереди Входящих.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
