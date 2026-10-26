/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useVault } from '../../context/VaultContext';

interface CompanionFile {
  id: string;
  name: string;
  type: string;
  size: string;
  icon: string;
  role: string;
  isMainDoc?: boolean;
}

const COMPANION_FILES: CompanionFile[] = [
  {
    id: 'f-main',
    name: 'PV-0042 Акт приёма-передачи.pdf',
    type: 'PDF/A-1b',
    size: '1.4 МБ',
    icon: 'picture_as_pdf',
    role: 'Основной скан и текстовый слой документа',
    isMainDoc: true,
  },
  {
    id: 'f-ocr',
    name: 'PV-0042_transcript.txt',
    type: 'TXT (UTF-8)',
    size: '14.2 КБ',
    icon: 'description',
    role: 'Машиночитаемая расшифровка OCR',
  },
  {
    id: 'f-meta',
    name: 'PV-0042_metadata.json',
    type: 'JSON',
    size: '3.4 КБ',
    icon: 'data_object',
    role: 'Реквизиты карточки, связи и классификация',
  },
  {
    id: 'f-hash',
    name: 'PV-0042.sha256',
    type: 'SHA256',
    size: '128 Б',
    icon: 'fingerprint',
    role: 'Криптографическая контрольная сумма целостности',
  },
  {
    id: 'f-sig',
    name: 'PV-0042_revision_r1.sig',
    type: 'SIG',
    size: '1.8 КБ',
    icon: 'verified_user',
    role: 'Цифровой слепок фиксации ревизии r1',
  },
  {
    id: 'f-photo',
    name: 'PV-0042_photo_inventory.jpg',
    type: 'JPEG',
    size: '860 КБ',
    icon: 'image',
    role: 'Сопутствующее приложение: фото ключей и счётчиков',
  },
];

type DateMoveStep = 'confirm' | 'moving' | 'success' | 'error';

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

  // Document state (can be visually updated upon successful year/date move)
  const [currentDate, setCurrentDate] = useState<string>(doc.date || '12.10.2026');
  const currentYear = useMemo(() => {
    const parts = currentDate.split('.');
    return parts.length === 3 ? parts[2] : '2026';
  }, [currentDate]);

  const currentArchivePath = useMemo(() => {
    return `Open → Жильё → ${currentYear} → ${doc.fileName || 'PV-0042 Акт приёма-передачи.pdf'}`;
  }, [currentYear, doc.fileName]);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showHighlights, setShowHighlights] = useState(true);

  // Modals and Drawers
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(activeScenario === 'history');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(activeScenario === 'move');
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(activeScenario === 'transcript');
  const [transcriptTab, setTranscriptTab] = useState<'normal' | 'empty' | 'secret'>('normal');

  // Date and Year Move Workflow States
  const [isDateMoveModalOpen, setIsDateMoveModalOpen] = useState(false);
  const [dateMoveStep, setDateMoveStep] = useState<DateMoveStep>('confirm');
  const [pendingDate, setPendingDate] = useState<string>('12.10.2025');
  const [pendingYear, setPendingYear] = useState<string>('2025');
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [moveProgress, setMoveProgress] = useState<number>(0);
  const [activeStepFileIndex, setActiveStepFileIndex] = useState<number>(0);
  const [activeMoveLog, setActiveMoveLog] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [resolveOnRetry, setResolveOnRetry] = useState<boolean>(true);

  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize pending year when pending date changes
  const handlePendingDateChange = (newDateStr: string) => {
    setPendingDate(newDateStr);
    const parts = newDateStr.split('.');
    if (parts.length === 3 && parts[2].length === 4) {
      setPendingYear(parts[2]);
    }
  };

  const handlePendingYearQuickSelect = (yearStr: string) => {
    setPendingYear(yearStr);
    const parts = pendingDate.split('.');
    if (parts.length === 3) {
      setPendingDate(`${parts[0]}.${parts[1]}.${yearStr}`);
    } else {
      setPendingDate(`12.10.${yearStr}`);
    }
  };

  const openDateMoveModal = () => {
    // Propose an alternate year (if current is 2026, suggest 2025; otherwise 2026)
    const targetYr = currentYear === '2026' ? '2025' : '2026';
    const dayMonth = currentDate.split('.').slice(0, 2).join('.') || '12.10';
    setPendingYear(targetYr);
    setPendingDate(`${dayMonth}.${targetYr}`);
    setDateMoveStep('confirm');
    setMoveProgress(0);
    setActiveStepFileIndex(0);
    setActiveMoveLog('Ожидание подтверждения перемещения пакета');
    setRetryCount(0);
    setIsDateMoveModalOpen(true);
  };

  // Run the progressive move simulation
  const startMovingFiles = (shouldError: boolean) => {
    setDateMoveStep('moving');
    setMoveProgress(5);
    setActiveStepFileIndex(0);
    setActiveMoveLog('Проверка целостности SHA-256 и снятие локальных блокировок...');

    if (moveTimerRef.current) clearInterval(moveTimerRef.current);

    let progress = 5;
    let fileIdx = 0;

    moveTimerRef.current = setInterval(() => {
      progress += 12;
      fileIdx = Math.min(COMPANION_FILES.length - 1, Math.floor((progress / 100) * COMPANION_FILES.length));
      
      setActiveStepFileIndex(fileIdx);
      setMoveProgress(Math.min(progress, 100));

      if (progress < 25) {
        setActiveMoveLog(`[1/6] Перемещение основного документа ${COMPANION_FILES[0].name}...`);
      } else if (progress < 45) {
        setActiveMoveLog(`[2/6] Синхронный перенос расшифровки ${COMPANION_FILES[1].name}...`);
      } else if (progress < 65) {
        setActiveMoveLog(`[3/6] Перенос реквизитов и связей ${COMPANION_FILES[2].name}...`);
      } else if (progress < 80) {
        setActiveMoveLog(`[4/6] Перенос хеш-суммы ${COMPANION_FILES[3].name} и подписи r1...`);
      } else if (progress < 95) {
        setActiveMoveLog(`[6/6] Перенос сопутствующих фотоматериалов ${COMPANION_FILES[5].name}...`);
      }

      if (progress >= 100) {
        if (moveTimerRef.current) clearInterval(moveTimerRef.current);
        if (shouldError) {
          setDateMoveStep('error');
          setActiveMoveLog('Сбой: ошибка ввода-вывода при записи сопутствующего файла');
        } else {
          setDateMoveStep('success');
          setActiveMoveLog('Все 6 файлов успешно перемещены в каталог года ' + pendingYear);
        }
      }
    }, 280);
  };

  // Immediate skip / finish for fast demoing
  const handleFastForwardMove = () => {
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    if (simulateError) {
      setDateMoveStep('error');
      setMoveProgress(85);
      setActiveStepFileIndex(5);
      setActiveMoveLog('Сбой: ошибка ввода-вывода при записи сопутствующего файла');
    } else {
      setDateMoveStep('success');
      setMoveProgress(100);
      setActiveStepFileIndex(5);
      setActiveMoveLog('Все 6 файлов успешно перемещены в каталог года ' + pendingYear);
    }
  };

  // Retry after error
  const handleRetryMove = () => {
    setRetryCount((c) => c + 1);
    const willErrorAgain = !resolveOnRetry && simulateError;
    startMovingFiles(willErrorAgain);
  };

  // Apply final success to the card
  const handleApplySuccess = () => {
    setCurrentDate(pendingDate);
    setIsDateMoveModalOpen(false);
    showToast(
      `Дата обновлена (${pendingDate}). Пакет документа и 5 сопутствующих файлов перемещены в папку года ${pendingYear}`,
      'drive_file_move'
    );
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, []);

  // Handle Esc key to go back if no modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        !isHistoryDrawerOpen &&
        !isMoveModalOpen &&
        !isTranscriptModalOpen &&
        !isDateMoveModalOpen
      ) {
        goBack();
      } else if (e.key === 'Escape' && isDateMoveModalOpen && dateMoveStep !== 'moving') {
        setIsDateMoveModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, isHistoryDrawerOpen, isMoveModalOpen, isTranscriptModalOpen, isDateMoveModalOpen, dateMoveStep]);

  // Scenarios
  const isMissing = activeScenario === 'missing';
  const isHashError = activeScenario === 'hash';
  const isCrash = activeScenario === 'crash';

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
            <button
              onClick={openDateMoveModal}
              title="Папка года в архиве (нажмите для изменения даты/года)"
              className="group flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#e9f6fd] border border-transparent hover:border-[#d7e4ec] text-[11px] font-mono text-[#006763] transition-colors"
            >
              <span className="material-symbols-outlined text-[13px] text-[#006763]">folder</span>
              <span className="font-bold underline decoration-dotted decoration-[#006763]/50 group-hover:decoration-solid">
                {currentYear}
              </span>
            </button>
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
            <span className="font-mono text-[11px] text-[#006763] flex items-center gap-1 bg-[#e8f5e9]/60 px-2 py-0.5 rounded border border-[#2e7d32]/20">
              <span className="material-symbols-outlined text-[14px] text-[#2e7d32]">verified</span>
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

            {/* Quick Trigger for Date & Year Move */}
            <button
              onClick={openDateMoveModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#006763] font-medium border border-[#006763]/30 transition-colors shadow-2xs"
              title="Изменить дату или год составления с автоматическим переносом в папку года"
            >
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              <span>Изменить дату / год ({currentYear})</span>
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
                  <button
                    onClick={openDateMoveModal}
                    title="Нажмите для изменения даты/года документа"
                    className={`text-left cursor-pointer transition-colors ${
                      showHighlights
                        ? 'p-1 rounded bg-[#95f3eb]/40 hover:bg-[#95f3eb]/70 text-[#006763] font-semibold'
                        : 'hover:text-[#006763] hover:underline'
                    }`}
                  >
                    «{currentDate.split('.')[0] || '12'}» октября {currentYear} г.
                  </button>
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

              {/* Enhanced Date Attribute with Year Folder Link */}
              <div className="pt-1.5 flex flex-col gap-1 p-1.5 rounded-sm hover:bg-[#f4faff] border border-transparent hover:border-[#d7e4ec] transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#111d23]">Дата составления *</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold">
                      ✓ Сверено со сканом
                    </span>
                  </div>
                  <button
                    onClick={openDateMoveModal}
                    className="px-2 py-0.5 rounded bg-[#e3f0f8] hover:bg-[#006763] text-[#006763] hover:text-white transition-all text-[11px] font-semibold flex items-center gap-1 border border-[#006763]/25"
                    title="Изменить дату или год документа (переместит пакет в соответствующую папку года)"
                  >
                    <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                    <span>Изменить дату / год</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-[#111d23]">{currentDate}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] text-[10px] font-mono text-[#006763] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">folder</span>
                      <span>Папка года: <strong>{currentYear}</strong></span>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#536166] font-mono truncate max-w-[260px]" title={currentArchivePath}>
                    📁 {currentArchivePath}
                  </span>
                </div>
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

      {/* ========================================================================= */}
      {/* SCR-11 DATE/YEAR CHANGE WORKFLOW MODAL (4 VISUAL STATES + BUNDLED FILES)  */}
      {/* 1. Подтверждение изменений                                                */}
      {/* 2. Перемещение в соответствующую папку года                               */}
      {/* 3. Успешное завершение                                                    */}
      {/* 4. Ошибка с возможностью повтора                                          */}
      {/* ========================================================================= */}
      {isDateMoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-[#d7e4ec] max-w-2xl w-full flex flex-col overflow-hidden text-[12px] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-4 py-2.5 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#006763]">
                  {dateMoveStep === 'confirm' && 'calendar_month'}
                  {dateMoveStep === 'moving' && 'sync'}
                  {dateMoveStep === 'success' && 'check_circle'}
                  {dateMoveStep === 'error' && 'error'}
                </span>
                <div>
                  <h3 className="font-bold text-[13px] text-[#111d23] leading-tight">
                    {dateMoveStep === 'confirm' && 'Изменение даты и перемещение в папку года'}
                    {dateMoveStep === 'moving' && `Перемещение пакета файлов в папку ${pendingYear}...`}
                    {dateMoveStep === 'success' && `Перемещение в папку года ${pendingYear} завершено`}
                    {dateMoveStep === 'error' && `Сбой перемещения в папку года ${pendingYear}`}
                  </h3>
                  <p className="text-[10px] text-[#536166] leading-none mt-0.5">
                    {doc.id} • {doc.title}
                  </p>
                </div>
              </div>

              {/* Close button (disabled during active moving animation) */}
              <button
                disabled={dateMoveStep === 'moving'}
                onClick={() => setIsDateMoveModalOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#ddeaf2] text-[#536166] disabled:opacity-40 disabled:hover:bg-transparent"
                title="Закрыть (Esc)"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Stepper Status Bar */}
            <div className="px-4 py-1.5 bg-[#f4faff] border-b border-[#d7e4ec] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 font-medium ${
                    dateMoveStep === 'confirm' ? 'text-[#006763] font-bold' : 'text-[#536166]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#006763] text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Подтверждение</span>
                </span>
                <span className="text-[#6e7978]">›</span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    dateMoveStep === 'moving' ? 'text-[#006763] font-bold' : 'text-[#536166]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      dateMoveStep === 'moving'
                        ? 'bg-[#006763] text-white animate-pulse'
                        : dateMoveStep === 'success'
                        ? 'bg-[#2e7d32] text-white'
                        : 'bg-[#d7e4ec] text-[#536166]'
                    }`}
                  >
                    2
                  </span>
                  <span>Перемещение</span>
                </span>
                <span className="text-[#6e7978]">›</span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    dateMoveStep === 'success'
                      ? 'text-[#2e7d32] font-bold'
                      : dateMoveStep === 'error'
                      ? 'text-[#ba1a1a] font-bold'
                      : 'text-[#536166]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      dateMoveStep === 'success'
                        ? 'bg-[#2e7d32] text-white'
                        : dateMoveStep === 'error'
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#d7e4ec] text-[#536166]'
                    }`}
                  >
                    3
                  </span>
                  <span>{dateMoveStep === 'error' ? 'Ошибка с повтором' : 'Завершение'}</span>
                </span>
              </div>

              {/* Demo Mode Switcher (allows reviewer to toggle between Success and Error flows instantly) */}
              <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-[#d7e4ec]">
                <span className="text-[10px] text-[#536166] font-medium">Демо-исход:</span>
                <label className="flex items-center gap-1 cursor-pointer text-[10px]">
                  <input
                    type="radio"
                    name="demoModeOutcome"
                    checked={!simulateError}
                    onChange={() => setSimulateError(false)}
                    className="accent-[#006763]"
                  />
                  <span className={!simulateError ? 'font-bold text-[#2e7d32]' : 'text-[#536166]'}>Успех</span>
                </label>
                <span className="text-[#d7e4ec]">|</span>
                <label className="flex items-center gap-1 cursor-pointer text-[10px]">
                  <input
                    type="radio"
                    name="demoModeOutcome"
                    checked={simulateError}
                    onChange={() => setSimulateError(true)}
                    className="accent-[#ba1a1a]"
                  />
                  <span className={simulateError ? 'font-bold text-[#ba1a1a]' : 'text-[#536166]'}>Ошибка</span>
                </label>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[70vh] flex flex-col gap-3.5">
              
              {/* ========================================================================= */}
              {/* STATE 1: ПОДТВЕРЖДЕНИЕ ИЗМЕНЕНИЙ (Confirmation of changes)                */}
              {/* ========================================================================= */}
              {dateMoveStep === 'confirm' && (
                <div className="flex flex-col gap-3.5">
                  <div className="p-2.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#006763] shrink-0 mt-0.5">info</span>
                    <div className="text-[11px] text-[#3e4948] leading-relaxed">
                      В архивном стандарте PersonalVault документы группируются в каталогах по годам составления:{' '}
                      <code className="font-mono text-[#006763] font-bold">Open / [Категория] / [Год] /</code>.
                      При изменении даты или года документ и все 5 сопутствующих файлов будут автоматически перемещены в соответствующую папку целевого года.
                    </div>
                  </div>

                  {/* Date and Year Selector Controls */}
                  <div className="bg-[#f4faff] p-3 rounded border border-[#d7e4ec] flex flex-col gap-2.5">
                    <span className="font-semibold text-[#111d23] text-[12px] flex items-center justify-between">
                      <span>Задайте новую дату или выберите год составления:</span>
                      <span className="text-[11px] text-[#536166]">
                        Текущий: <strong className="font-mono text-[#111d23]">{currentDate} ({currentYear})</strong>
                      </span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-[11px] text-[#536166] block mb-1">
                          Дата составления (ДД.ММ.ГГГГ):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pendingDate}
                            onChange={(e) => handlePendingDateChange(e.target.value)}
                            placeholder="12.10.2025"
                            className="w-full px-2.5 py-1.5 rounded bg-white border border-[#d7e4ec] font-mono font-bold text-[13px] text-[#111d23] focus:outline-hidden focus:border-[#006763]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#536166] block mb-1">
                          Быстрый выбор года архивации:
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['2023', '2024', '2025', '2026', '2027'].map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => handlePendingYearQuickSelect(yr)}
                              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                                pendingYear === yr
                                  ? 'bg-[#006763] text-white font-bold shadow-2xs'
                                  : 'bg-white hover:bg-[#e3f0f8] text-[#3e4948] border border-[#d7e4ec]'
                              }`}
                            >
                              📁 {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Path Transition Preview Card */}
                    <div className="mt-1 p-2.5 rounded bg-white border border-[#d7e4ec] flex flex-col gap-1.5 text-[11px]">
                      <div className="text-[10px] uppercase tracking-wider text-[#6e7978] font-bold">
                        Маршрут перемещения в архивной файловой системе:
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[#536166]">
                          <span className="material-symbols-outlined text-[15px] text-[#6e7978]">folder</span>
                          <span className="font-mono">Open → Жильё → <strong className="text-[#ba1a1a]">{currentYear}</strong> → PV-0042/</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-[#006763]">arrow_forward</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#006763]">
                          <span className="material-symbols-outlined text-[15px] text-[#006763]">drive_file_move</span>
                          <span className="font-mono bg-[#e9f6fd] px-1.5 py-0.5 rounded border border-[#006763]/30">
                            Open → Жильё → <strong className="text-[#006763] underline">{pendingYear}</strong> → PV-0042/
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accompanying Files Bundle Manifest (Showing all files move together) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006763]">folder_zip</span>
                        <span className="font-bold text-[#111d23] text-[12px]">
                          Совместно перемещаемый пакет (6 файлов • 2.27 МБ)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold border border-[#2e7d32]/20">
                        🔒 Неделимый пакет: все связи сохраняются
                      </span>
                    </div>

                    <p className="text-[11px] text-[#536166]">
                      Основной документ, сканы, расшифровка OCR, машиночитаемые метаданные и цифровые подписи привязаны к одному идентификатору и перемещаются синхронно:
                    </p>

                    <div className="border border-[#d7e4ec] rounded overflow-hidden divide-y divide-[#d7e4ec] bg-white">
                      {COMPANION_FILES.map((file) => (
                        <div key={file.id} className="p-2 flex items-center justify-between gap-2 hover:bg-[#f8fafa] text-[11px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-[16px] text-[#006763] shrink-0">
                              {file.icon}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-mono font-semibold text-[#111d23] truncate">
                                {file.name}
                                {file.isMainDoc && (
                                  <span className="ml-1.5 px-1 py-0.2 rounded bg-[#006763] text-white text-[9px] font-sans font-bold">
                                    Основной документ
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-[#6e7978] truncate">{file.role}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[10px] text-[#536166]">{file.size}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[#3e4948] text-[9px] font-mono">
                              {file.type}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#f4faff] text-[#006763] text-[10px] font-semibold border border-[#d7e4ec]">
                              Готов к переносу
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STATE 2: ПЕРЕМЕЩЕНИЕ В ПАПКУ ГОДА (Moving into year folder)                */}
              {/* ========================================================================= */}
              {dateMoveStep === 'moving' && (
                <div className="flex flex-col gap-4 py-2">
                  <div className="p-3 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[#006763] animate-spin">
                          progress_activity
                        </span>
                        <span className="font-bold text-[#006763] text-[12px]">
                          Атомарный перенос файлов: {moveProgress}%
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#536166]">
                        {currentYear} ➔ {pendingYear}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#d7e4ec] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#006763] to-[#12827c] h-full transition-all duration-200 ease-out"
                        style={{ width: `${moveProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#3e4948] font-mono">
                      <span className="truncate">{activeMoveLog}</span>
                      <span className="shrink-0 text-[#6e7978]">
                        Файл {Math.min(activeStepFileIndex + 1, 6)} из 6
                      </span>
                    </div>
                  </div>

                  {/* Accompanying Files Live Transfer Checklist */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111d23] text-[12px] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006763]">sync_alt</span>
                        <span>Синхронное перемещение сопутствующих файлов:</span>
                      </span>
                      <button
                        onClick={handleFastForwardMove}
                        className="text-[10px] text-[#006763] hover:underline font-semibold"
                        title="Ускорить завершение анимации"
                      >
                        Завершить быстрее ⏩
                      </button>
                    </div>

                    <div className="border border-[#d7e4ec] rounded overflow-hidden divide-y divide-[#d7e4ec] bg-white">
                      {COMPANION_FILES.map((file, idx) => {
                        const isDone = idx < activeStepFileIndex || moveProgress === 100;
                        const isCurrent = idx === activeStepFileIndex && moveProgress < 100;
                        return (
                          <div
                            key={file.id}
                            className={`p-2 flex items-center justify-between gap-2 text-[11px] transition-colors ${
                              isCurrent ? 'bg-[#e9f6fd]' : isDone ? 'bg-[#f4faff]' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`material-symbols-outlined text-[16px] shrink-0 ${
                                  isDone ? 'text-[#2e7d32]' : isCurrent ? 'text-[#006763]' : 'text-[#6e7978]'
                                }`}
                              >
                                {file.icon}
                              </span>
                              <span className="font-mono text-[#111d23] truncate">
                                {file.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] text-[#536166]">{file.size}</span>
                              {isDone ? (
                                <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">check</span>
                                  <span>Перенесён</span>
                                </span>
                              ) : isCurrent ? (
                                <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#006763] text-[10px] font-semibold flex items-center gap-1 animate-pulse">
                                  <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                  <span>Копирование...</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#f8fafa] text-[#6e7978] text-[10px]">
                                  В очереди
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STATE 3: УСПЕШНОЕ ЗАВЕРШЕНИЕ (Successful completion)                       */}
              {/* ========================================================================= */}
              {dateMoveStep === 'success' && (
                <div className="flex flex-col gap-3.5">
                  <div className="p-3.5 rounded bg-[#e8f5e9] border border-[#2e7d32]/30 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[28px] text-[#2e7d32] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <h4 className="font-bold text-[13px] text-[#2e7d32]">
                        Пакет документа успешно перенесён в каталог года {pendingYear}
                      </h4>
                      <p className="text-[#3e4948] leading-relaxed">
                        Основной документ и все 5 сопутствующих файлов перемещены единым пакетом без разрыва связей.
                        Контрольные суммы SHA-256 проверены и сходятся, поисковый индекс и ссылки на родительский документ {doc.relations[0]?.id || 'PV-0041'} обновлены.
                      </p>
                    </div>
                  </div>

                  {/* Summary of Relocated State */}
                  <div className="bg-[#f4faff] p-3 rounded border border-[#d7e4ec] flex flex-col gap-2 text-[11px]">
                    <span className="font-semibold text-[#111d23] text-[12px]">
                      Новые параметры размещения документа:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-white border border-[#d7e4ec]">
                        <span className="text-[#6e7978] block text-[10px]">Новая дата составления:</span>
                        <strong className="font-mono text-[12px] text-[#006763]">{pendingDate}</strong>
                        <span className="text-[10px] text-[#2e7d32] block mt-0.5">✓ Зафиксировано в карточке</span>
                      </div>

                      <div className="p-2 rounded bg-white border border-[#d7e4ec]">
                        <span className="text-[#6e7978] block text-[10px]">Папка года в архиве:</span>
                        <strong className="font-mono text-[12px] text-[#006763]">📁 {pendingYear}</strong>
                        <span className="text-[10px] text-[#536166] block mt-0.5">Каталог: Open / Жильё / {pendingYear} /</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-white border border-[#d7e4ec] flex flex-col gap-0.5">
                      <span className="text-[#6e7978] text-[10px]">Полный путь в хранилище:</span>
                      <code className="font-mono text-[11px] text-[#006763] font-bold break-all">
                        Open → Жильё → {pendingYear} → {doc.fileName}
                      </code>
                    </div>
                  </div>

                  {/* Relocated Files Manifest */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-[#111d23] text-[12px] flex items-center justify-between">
                      <span>Статус сопутствующих файлов (все 6 файлов на месте):</span>
                      <span className="text-[10px] text-[#2e7d32] font-semibold">6 из 6 синхронизировано</span>
                    </span>

                    <div className="border border-[#d7e4ec] rounded overflow-hidden divide-y divide-[#d7e4ec] bg-white">
                      {COMPANION_FILES.map((file) => (
                        <div key={file.id} className="p-2 flex items-center justify-between gap-2 text-[11px] hover:bg-[#f8fafa]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-[16px] text-[#2e7d32] shrink-0">
                              check_circle
                            </span>
                            <span className="font-mono text-[#111d23] truncate">
                              {file.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[10px] text-[#536166]">{file.size}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] text-[9px] font-mono font-semibold">
                              Каталог {pendingYear}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Switch to Error Demo link */}
                  <div className="flex items-center justify-between p-2 rounded bg-[#f4faff] border border-[#d7e4ec] text-[11px]">
                    <span className="text-[#536166]">
                      Хотите оценить обработку сбоя файловой системы?
                    </span>
                    <button
                      onClick={() => {
                        setSimulateError(true);
                        startMovingFiles(true);
                      }}
                      className="text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">bug_report</span>
                      <span>Проверить сценарий с ошибкой</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STATE 4: ОШИБКА С ВОЗМОЖНОСТЬЮ ПОВТОРА (Error with retry capability)       */}
              {/* ========================================================================= */}
              {dateMoveStep === 'error' && (
                <div className="flex flex-col gap-3.5">
                  <div className="p-3.5 rounded bg-[#ffdad6]/40 border border-[#ba1a1a]/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[28px] text-[#ba1a1a] shrink-0 mt-0.5">
                      error
                    </span>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <h4 className="font-bold text-[13px] text-[#ba1a1a]">
                        Ошибка перемещения пакета файлов в папку {pendingYear}
                      </h4>
                      <p className="text-[#3e4948] leading-relaxed">
                        Операция атомарного переноса была прервана: файловая система вернула код ошибки{' '}
                        <code className="font-mono text-[#ba1a1a] font-bold">EBUSY (Device or resource busy)</code> при попытке перемещения сопутствующего файла{' '}
                        <code className="font-mono text-[#ba1a1a] font-bold">PV-0042_photo_inventory.jpg</code>.
                      </p>
                    </div>
                  </div>

                  {/* Critical Safety Guarantee (Document and related files are NOT separated) */}
                  <div className="p-3 rounded bg-white border border-[#006763]/30 flex items-start gap-2.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[20px] text-[#006763] shrink-0 mt-0.5">
                      verified_user
                    </span>
                    <div className="text-[11px] text-[#111d23]">
                      <strong className="text-[#006763] block mb-0.5">
                        🛡️ Гарантия целостности PersonalVault: пакет не был разделен!
                      </strong>
                      <p className="text-[#536166] leading-relaxed">
                        Транзакционный откат выполнен автоматически. Основной документ и сопутствующие файлы не потерялись и не остались разрозненными между папками: все 6 файлов сохранены в исходной папке года{' '}
                        <strong className="font-mono text-[#111d23]">«{currentYear}»</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Status of files during failure */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-[#111d23] text-[12px] flex items-center justify-between">
                      <span>Состояние файлов после безопасного отката:</span>
                      <span className="text-[10px] text-[#536166] font-mono">
                        Попыток: {retryCount + 1}
                      </span>
                    </span>

                    <div className="border border-[#d7e4ec] rounded overflow-hidden divide-y divide-[#d7e4ec] bg-white text-[11px]">
                      {COMPANION_FILES.map((file, idx) => {
                        const isFailedFile = idx === 5; // photo inventory
                        return (
                          <div
                            key={file.id}
                            className={`p-2 flex items-center justify-between gap-2 ${
                              isFailedFile ? 'bg-[#fff5f5]' : 'hover:bg-[#f8fafa]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`material-symbols-outlined text-[16px] shrink-0 ${
                                  isFailedFile ? 'text-[#ba1a1a]' : 'text-[#536166]'
                                }`}
                              >
                                {isFailedFile ? 'warning' : file.icon}
                              </span>
                              <span className="font-mono text-[#111d23] truncate">
                                {file.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] text-[#6e7978]">{file.size}</span>
                              {isFailedFile ? (
                                <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold border border-[#ba1a1a]/30">
                                  Сбой блокировки (снята)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#3e4948] text-[10px] font-mono">
                                  Откат в {currentYear} ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Retry options configuration */}
                  <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="resolveRetryCheck"
                        checked={resolveOnRetry}
                        onChange={(e) => setResolveOnRetry(e.target.checked)}
                        className="accent-[#006763] rounded"
                      />
                      <label htmlFor="resolveRetryCheck" className="text-[#3e4948] cursor-pointer">
                        Снять фоновые дескрипторы и разрешить успешное перемещение при повторе
                      </label>
                    </div>

                    <span className="text-[10px] text-[#6e7978]">
                      {resolveOnRetry ? '(следующий запуск завершится успехом)' : '(повторит ошибку)'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-4 py-2.5 bg-[#f4faff] border-t border-[#d7e4ec] flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <div className="text-[10px] text-[#536166]">
                {dateMoveStep === 'confirm' && 'Перемещение затронет 6 файлов и обновит каталог года'}
                {dateMoveStep === 'moving' && 'Пожалуйста, не закрывайте окно во время записи...'}
                {dateMoveStep === 'success' && 'Изменения готовы к фиксации в карточке'}
                {dateMoveStep === 'error' && 'Файлы сохранены без изменений. Доступен повтор'}
              </div>

              <div className="flex items-center gap-2">
                {/* State 1: Confirm Actions */}
                {dateMoveStep === 'confirm' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDateMoveModalOpen(false)}
                      className="px-3 py-1 rounded bg-white hover:bg-[#e9f6fd] text-[#3e4948] border border-[#d7e4ec] transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => startMovingFiles(simulateError)}
                      className="px-3.5 py-1 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">drive_file_move</span>
                      <span>Подтвердить перемещение в {pendingYear}</span>
                    </button>
                  </>
                )}

                {/* State 2: Moving Actions */}
                {dateMoveStep === 'moving' && (
                  <button
                    type="button"
                    onClick={handleFastForwardMove}
                    className="px-3 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#006763] font-semibold border border-[#d7e4ec]"
                  >
                    Пропустить ожидание
                  </button>
                )}

                {/* State 3: Success Actions */}
                {dateMoveStep === 'success' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setDateMoveStep('confirm');
                      }}
                      className="px-3 py-1 rounded bg-white hover:bg-[#e9f6fd] text-[#3e4948] border border-[#d7e4ec]"
                    >
                      Выбрать другую дату
                    </button>
                    <button
                      type="button"
                      onClick={handleApplySuccess}
                      className="px-4 py-1.5 rounded bg-[#2e7d32] hover:bg-[#256628] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">done</span>
                      <span>Применить изменения в карточке</span>
                    </button>
                  </>
                )}

                {/* State 4: Error Actions */}
                {dateMoveStep === 'error' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDateMoveModalOpen(false)}
                      className="px-3 py-1 rounded bg-white hover:bg-[#e9f6fd] text-[#3e4948] border border-[#d7e4ec] transition-colors"
                    >
                      Отмена (оставить год {currentYear})
                    </button>
                    <button
                      type="button"
                      onClick={handleRetryMove}
                      className="px-3.5 py-1.5 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">replay</span>
                      <span>Повторить попытку перемещения</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div>Текущее размещение: <strong className="font-mono">{currentArchivePath}</strong></div>
              <div>Новое размещение: <strong className="font-mono text-[#006763]">Open → Жильё → {currentYear} → [Архив]</strong></div>
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
                <span className="font-mono text-[10px]">{currentDate}</span>
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
