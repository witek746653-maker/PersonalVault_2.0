/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useVault } from '../../context/VaultContext';

// Types for conversation state and dialog history
export type AssistantStateId =
  | '01' // Главная (Новый диалог / Пустое состояние)
  | '02' // Документ выбран (Готов к отправке)
  | '03' // Обработка документа (ИИ анализирует файлы)
  | '04' // Черновик готов (Сводка в инспекторе)
  | '05' // Проверка полей (Сверка цитат со сканом)
  | '06' // Требуется решение (Неоднозначные данные)
  | '07' // Пакетная очередь (5 файлов в обработке)
  | '08' // Агентная задача (Многошаговый план поиска/сверки)
  | '09' // Подтверждение изменений (Было/Станет перед сохранением)
  | '10' // Результат (Документ зафиксирован в архиве)
  | '11'; // Ошибка и восстановление (Сбой OCR)

export type InspectorTab = 'draft' | 'verify' | 'doc' | 'queue';

interface DialogHistoryItem {
  id: string;
  title: string;
  date: string;
  msgCount: number;
  stateId: AssistantStateId;
}

// Module-level persistent cache so returning from SCR-06 restores state completely
let cachedAssistantState: {
  currentState: AssistantStateId;
  currentInspectorTab: InspectorTab;
  isHistoryOpen: boolean;
  isInspectorOpen: boolean;
  inspectorWidth: number;
  activeModel: string;
  activeScope: string;
  userMessages: { id: string; sender: 'user' | 'assistant'; text: string; time: string }[];
} = {
  currentState: '04', // Default to ready draft state matching reference
  currentInspectorTab: 'draft',
  isHistoryOpen: false,
  isInspectorOpen: true,
  inspectorWidth: 384, // 384px (w-96)
  activeModel: 'Ollama · Qwen2.5-Coder',
  activeScope: 'Выбранные документы',
  userMessages: [],
};

export const AssistantView: React.FC = () => {
  const { setCurrentScreen, showToast } = useVault();

  // Primary interactive states initialized from persistent cache
  const [currentState, setCurrentState] = useState<AssistantStateId>(cachedAssistantState.currentState);
  const [currentInspectorTab, setCurrentInspectorTab] = useState<InspectorTab>(cachedAssistantState.currentInspectorTab);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(cachedAssistantState.isHistoryOpen);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(cachedAssistantState.isInspectorOpen);
  const [inspectorWidth, setInspectorWidth] = useState<number>(cachedAssistantState.inspectorWidth);
  const [activeModel, setActiveModel] = useState<string>(cachedAssistantState.activeModel);
  const [activeScope, setActiveScope] = useState<string>(cachedAssistantState.activeScope);

  // Model settings dropdown and modal
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isModelSettingsModalOpen, setIsModelSettingsModalOpen] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const [openaiKey, setOpenaiKey] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Dialog search and context menu
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [activeMenuDialogId, setActiveMenuDialogId] = useState<string | null>(null);
  const [editingDialogId, setEditingDialogId] = useState<string | null>(null);
  const [editingDialogTitle, setEditingDialogTitle] = useState('');

  // Dialog history list
  const [dialogs, setDialogs] = useState<DialogHistoryItem[]>([
    {
      id: 'd1',
      title: 'Обработка медицинских документов',
      date: 'Сегодня, 14:35',
      msgCount: 4,
      stateId: '04',
    },
    {
      id: 'd2',
      title: 'Пакетная обработка входящих Inbox',
      date: 'Сегодня, 11:20',
      msgCount: 5,
      stateId: '07',
    },
    {
      id: 'd3',
      title: 'Глубокий поиск рецептов за 2025–2026',
      date: 'Вчера, 18:40',
      msgCount: 6,
      stateId: '08',
    },
    {
      id: 'd4',
      title: 'Проверка договора найма № 42',
      date: '18 окт',
      msgCount: 3,
      stateId: '04',
    },
    {
      id: 'd5',
      title: 'Сравнение лабораторных анализов',
      date: '14 окт',
      msgCount: 8,
      stateId: '01',
    },
  ]);

  // Composer state
  const [composerText, setComposerText] = useState('');
  const [isProcessingTimer, setIsProcessingTimer] = useState<boolean>(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Verification custom field value (State 05)
  const [proposedDateVal, setProposedDateVal] = useState('2026-11-14 (Приблизительно)');

  // Container dimensions for responsive curtain behavior
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);

  // Conversation feed DOM ref
  const feedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resize drag handle state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(inspectorWidth);

  // Sync to module-level cache
  useEffect(() => {
    cachedAssistantState = {
      currentState,
      currentInspectorTab,
      isHistoryOpen,
      isInspectorOpen,
      inspectorWidth,
      activeModel,
      activeScope,
      userMessages: cachedAssistantState.userMessages,
    };
  }, [currentState, currentInspectorTab, isHistoryOpen, isInspectorOpen, inspectorWidth, activeModel, activeScope]);

  // Track container width via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isNarrow = containerWidth < 960;
  const isUltraNarrow = containerWidth < 780;

  // Auto-resize composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 140);
      textareaRef.current.style.height = `${Math.max(newHeight, 38)}px`;
    }
  }, [composerText]);

  // Handle feed scroll for Floating Down Button
  const handleFeedScroll = useCallback(() => {
    if (!feedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottomBtn(distFromBottom > 120);
  }, []);

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Switch state helper
  const handleTransition = (nextState: AssistantStateId, tabHint?: InspectorTab) => {
    setCurrentState(nextState);
    if (tabHint) {
      setCurrentInspectorTab(tabHint);
    } else {
      if (nextState === '04' || nextState === '09' || nextState === '10') {
        setCurrentInspectorTab('draft');
      } else if (nextState === '05' || nextState === '06') {
        setCurrentInspectorTab('verify');
      } else if (nextState === '07') {
        setCurrentInspectorTab('queue');
      }
    }
    // Auto scroll feed to bottom after state change
    setTimeout(() => {
      scrollToBottom();
    }, 50);
  };

  // Processing simulation timer for State 03
  useEffect(() => {
    if (currentState === '03') {
      setIsProcessingTimer(true);
      const timer = setTimeout(() => {
        setIsProcessingTimer(false);
        handleTransition('04', 'draft');
        showToast('Черновик документа успешно подготовлен ИИ!', 'task_alt');
      }, 4500);
      return () => clearTimeout(timer);
    } else {
      setIsProcessingTimer(false);
    }
  }, [currentState]);

  // Inspector resize drag handlers
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = inspectorWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startXRef.current - moveEvent.clientX;
      const newWidth = Math.min(Math.max(startWidthRef.current + delta, 320), 480);
      setInspectorWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Composer submit
  const handleComposerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = composerText.trim();
    if (!text && currentState !== '01' && currentState !== '02') return;

    if (currentState === '01') {
      handleTransition('02');
    } else if (currentState === '02') {
      handleTransition('03');
    } else if (currentState === '03') {
      handleTransition('04');
    } else {
      // General question submission
      showToast('Запрос принят к автономной обработке', 'smart_toy');
      handleTransition('04');
    }
    setComposerText('');
  };

  // Attach / Detach files
  const handleAttachFile = () => {
    handleTransition('02');
    showToast('Документ Медицинское_заключение.pdf прикреплён', 'attach_file');
  };

  const handleDetachFile = () => {
    handleTransition('01');
    showToast('Вложение удалено', 'close');
  };

  // Context scope cycling
  const handleCycleScope = () => {
    const scopes = ['Выбранные документы', 'Архив: Open', 'Все доступные (Open + Secret)'];
    const nextIdx = (scopes.indexOf(activeScope) + 1) % scopes.length;
    setActiveScope(scopes[nextIdx]);
    showToast(`Область контекста: ${scopes[nextIdx]}`, 'database');
  };

  // Model switching
  const handleSelectModel = (name: string, isLocal: boolean) => {
    setActiveModel(name);
    setIsModelDropdownOpen(false);
    showToast(`ИИ модель переключена: ${name}`, 'smart_toy');
  };

  // New conversation
  const handleNewConversation = () => {
    handleTransition('01');
    if (isNarrow) setIsHistoryOpen(false);
    showToast('Создан новый диалог', 'add');
  };

  // Dialog actions
  const handleDeleteDialog = (id: string) => {
    setDialogs((prev) => prev.filter((d) => d.id !== id));
    setActiveMenuDialogId(null);
    showToast('Диалог удалён из истории', 'delete');
  };

  const handleRenameDialogSave = (id: string) => {
    if (editingDialogTitle.trim()) {
      setDialogs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, title: editingDialogTitle.trim() } : d))
      );
    }
    setEditingDialogId(null);
    setActiveMenuDialogId(null);
    showToast('Диалог переименован', 'edit');
  };

  const handleExportDialog = (title: string) => {
    setActiveMenuDialogId(null);
    showToast(`Диалог «${title}» экспортирован в JSON`, 'download');
  };

  // Filtered dialogs
  const filteredDialogs = dialogs.filter((d) =>
    d.title.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  const isLocalModel = activeModel.includes('Ollama');

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-[calc(100vh-5.5rem)] min-h-[640px] max-h-[1440px] bg-[#f4faff] text-[#111d23] font-sans text-[13px] rounded-xl border border-[#DCE3E5] shadow-xs overflow-hidden relative select-none"
    >
      {/* ======================================================== */}
      {/* 1. TOP TOOLBAR: Model, Context Scope, Drawer & Inspector */}
      {/* ======================================================== */}
      <header className="h-10 bg-white border-b border-[#DCE3E5] px-3.5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          {/* History Drawer Toggle Button */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            title="История диалогов"
            className={`h-7 px-2 text-[#536166] hover:text-[#111d23] hover:bg-[#e9f6fd] rounded flex items-center gap-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#006763] ${
              isHistoryOpen ? 'bg-[#e9f6fd] text-[#006763] font-semibold' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span className="hidden sm:inline text-[11px]">Беседы</span>
          </button>

          <div className="h-4 w-px bg-[#DCE3E5]"></div>

          {/* Assistant Title & Icon */}
          <div className="flex items-center gap-1.5 font-semibold text-[13.5px] text-[#111d23] tracking-tight">
            <span className="material-symbols-outlined text-[#006763] text-[18px]">smart_toy</span>
            <span className="truncate max-w-[140px] sm:max-w-none">Помощник PersonalVault</span>
          </div>

          {/* Model Selector Dropdown Button (State 13 trigger) */}
          <div className="relative inline-block text-left ml-1">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] text-[12px] border border-[#DCE3E5] hover:border-[#006763] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#006763]"
              title="Выбор активной нейросетевой модели"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLocalModel ? 'bg-emerald-600' : 'bg-amber-600'}`}
              ></span>
              <span className="font-medium truncate max-w-[150px] sm:max-w-[210px]">{activeModel}</span>
              <span className="text-[10px] text-[#536166] bg-[#d7e4ec] px-1 py-0.2 rounded font-mono hidden md:inline">
                {isLocalModel ? 'Локально' : 'Облако'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-[#6e7978]">expand_more</span>
            </button>

            {/* Model Dropdown Options */}
            {isModelDropdownOpen && (
              <div
                className="absolute left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-[#DCE3E5] py-1.5 z-50 text-[12px] animate-in fade-in duration-100"
                onMouseLeave={() => setIsModelDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#6e7978] uppercase tracking-wider border-b border-[#DCE3E5]">
                  Провайдер ИИ и Модель
                </div>

                <button
                  onClick={() => handleSelectModel('Ollama · Qwen2.5-Coder', true)}
                  className={`w-full px-3 py-2 text-left hover:bg-[#e9f6fd] flex items-center justify-between transition-colors ${
                    activeModel.includes('Qwen2.5') ? 'bg-[#e9f6fd]/80 text-[#006763]' : 'text-[#111d23]'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      <span>Ollama · Qwen2.5-Coder</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    </div>
                    <div className="text-[11px] text-[#6e7978]">Локально на устройстве • 14B Q4_K_M</div>
                  </div>
                  <span className="text-emerald-700 font-mono text-[11px] font-bold">OK</span>
                </button>

                <button
                  onClick={() => handleSelectModel('Ollama · Llama 3.2-Vision', true)}
                  className={`w-full px-3 py-2 text-left hover:bg-[#e9f6fd] flex items-center justify-between transition-colors ${
                    activeModel.includes('Vision') ? 'bg-[#e9f6fd]/80 text-[#006763]' : 'text-[#111d23]'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      <span>Ollama · Llama 3.2-Vision</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    </div>
                    <div className="text-[11px] text-[#6e7978]">OCR + мультимодальность • 11B Vision</div>
                  </div>
                  <span className="text-emerald-700 font-mono text-[11px] font-bold">OK</span>
                </button>

                <button
                  onClick={() => handleSelectModel('OpenAI API · GPT-4o', false)}
                  className={`w-full px-3 py-2 text-left hover:bg-[#e9f6fd] flex items-center justify-between transition-colors border-t border-[#DCE3E5]/60 ${
                    activeModel.includes('OpenAI') ? 'bg-[#e9f6fd]/80 text-[#006763]' : 'text-[#111d23]'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      <span>OpenAI API · GPT-4o</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    </div>
                    <div className="text-[11px] text-amber-800">Облачный шлюз • Передача контекста</div>
                  </div>
                  <span className="text-[#6e7978] font-mono text-[11px]">API</span>
                </button>

                <div className="p-2 border-t border-[#DCE3E5] mt-1 bg-[#f4faff]">
                  <button
                    onClick={() => {
                      setIsModelDropdownOpen(false);
                      setIsModelSettingsModalOpen(true);
                    }}
                    className="w-full py-1 text-center text-[11.5px] text-[#006763] hover:text-[#237a75] font-medium flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    <span>Параметры подключения моделей...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Toolbar: Context Scope & Inspector Toggle */}
        <div className="flex items-center gap-2">
          {/* Scope Indicator button */}
          <button
            onClick={handleCycleScope}
            title="Область поиска и контекста (нажмите для переключения)"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#e9f6fd] text-[#111d23] hover:bg-[#e3f0f8] text-[11.5px] border border-[#DCE3E5] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] text-[#006763]">folder_limited</span>
            <span className="font-medium hidden sm:inline">Контекст:</span>
            <span className="text-[#536166]">{activeScope}</span>
          </button>

          {/* Inspector Panel Toggle Button */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            title="Инспектор контекста и черновика"
            className={`h-7 px-2 text-[#536166] hover:text-[#111d23] hover:bg-[#e9f6fd] rounded flex items-center gap-1 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#006763] ${
              isInspectorOpen ? 'bg-[#e9f6fd] text-[#006763] font-semibold' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
            <span className="hidden xl:inline text-[11px]">Инспектор</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN THREE-ZONE WORKSPACE (History, Feed, Inspector)  */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ======================================================== */}
        {/* LEFT DRAWER: Collapsible Conversation History (State 12) */}
        {/* ======================================================== */}
        {isHistoryOpen && (
          <aside
            className={`bg-[#e9f6fd] border-r border-[#DCE3E5] flex flex-col shrink-0 z-20 transition-all duration-150 ${
              isNarrow
                ? 'absolute inset-y-0 left-0 w-72 shadow-2xl z-40 bg-[#e9f6fd]'
                : 'w-64'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-2.5 border-b border-[#DCE3E5] flex items-center justify-between bg-white shrink-0">
              <span className="font-semibold text-[#111d23] text-[12px] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#006763]">history</span>
                <span>История бесед</span>
              </span>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 text-[#6e7978] hover:text-[#111d23] hover:bg-[#e9f6fd] rounded transition-colors"
                title="Свернуть историю"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            </div>

            {/* Quick Search in History */}
            <div className="p-2 border-b border-[#DCE3E5] bg-white">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-[15px] text-[#6e7978]">
                  search
                </span>
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Поиск диалогов..."
                  className="w-full h-7 pl-7 pr-2 text-[11.5px] bg-[#f4faff] border border-[#DCE3E5] rounded focus:outline-none focus:border-[#006763] text-[#111d23] placeholder:text-[#6e7978]"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-2 top-1.5 text-[#6e7978] hover:text-[#111d23]"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action: New Conversation */}
            <div className="p-2 bg-[#f4faff] border-b border-[#DCE3E5]">
              <button
                onClick={handleNewConversation}
                className="w-full h-8 px-2.5 bg-white border border-[#DCE3E5] hover:border-[#006763] hover:bg-[#e9f6fd] rounded flex items-center justify-center gap-1.5 text-[#111d23] font-medium text-[12px] shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006763]">add</span>
                <span>Новый диалог</span>
              </button>
            </div>

            {/* Dialog List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="text-[10.5px] text-[#6e7978] px-2 py-1 font-semibold uppercase tracking-wider">
                Недавние диалоги
              </div>

              {filteredDialogs.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-[#6e7978]">Ничего не найдено</div>
              ) : (
                filteredDialogs.map((diag) => {
                  const isCurrent = currentState === diag.stateId;
                  const isEditing = editingDialogId === diag.id;

                  return (
                    <div
                      key={diag.id}
                      className={`group relative p-2 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white border-[#006763]/40 shadow-xs text-[#111d23]'
                          : 'bg-white/60 hover:bg-white border-transparent hover:border-[#DCE3E5] text-[#536166]'
                      }`}
                      onClick={() => {
                        if (!isEditing) {
                          handleTransition(diag.stateId);
                          if (isNarrow) setIsHistoryOpen(false);
                        }
                      }}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingDialogTitle}
                            onChange={(e) => setEditingDialogTitle(e.target.value)}
                            className="flex-1 h-6 px-1.5 text-[11.5px] border border-[#006763] rounded bg-white text-[#111d23]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameDialogSave(diag.id);
                              if (e.key === 'Escape') setEditingDialogId(null);
                            }}
                          />
                          <button
                            onClick={() => handleRenameDialogSave(diag.id)}
                            className="p-1 text-[#006763] hover:bg-[#e9f6fd] rounded"
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-1">
                          <div className="truncate pr-1">
                            <div className="font-medium text-[12px] truncate text-[#111d23]">{diag.title}</div>
                            <div className="text-[10.5px] text-[#6e7978] mt-0.5">
                              {diag.date} • {diag.msgCount} сообщ.
                            </div>
                          </div>

                          {/* Context Menu Button "⋯" */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuDialogId(activeMenuDialogId === diag.id ? null : diag.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#6e7978] hover:text-[#111d23] hover:bg-[#e9f6fd] rounded transition-opacity"
                            title="Действия с диалогом"
                          >
                            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                          </button>
                        </div>
                      )}

                      {/* Dropdown ⋯ Menu */}
                      {activeMenuDialogId === diag.id && (
                        <div
                          className="absolute right-2 top-8 w-44 bg-white border border-[#DCE3E5] rounded-md shadow-xl py-1 z-50 text-[11.5px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setEditingDialogId(diag.id);
                              setEditingDialogTitle(diag.title);
                              setActiveMenuDialogId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-[#e9f6fd] flex items-center gap-1.5 text-[#111d23]"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Переименовать</span>
                          </button>
                          <button
                            onClick={() => handleExportDialog(diag.title)}
                            className="w-full px-3 py-1.5 text-left hover:bg-[#e9f6fd] flex items-center gap-1.5 text-[#111d23]"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>Экспорт диалога</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDialog(diag.id)}
                            className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-700 flex items-center gap-1.5 border-t border-[#DCE3E5]/60"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Удалить диалог</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Backdrop for history drawer on narrow screens */}
        {isNarrow && isHistoryOpen && (
          <div
            onClick={() => setIsHistoryOpen(false)}
            className="absolute inset-0 bg-black/20 z-30 backdrop-blur-2xs"
          ></div>
        )}

        {/* ======================================================== */}
        {/* 3. CENTER REGION: AI CONVERSATION FEED & COMPOSER        */}
        {/* ======================================================== */}
        <section className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden relative">
          {/* Scrollable Conversation Feed */}
          <div
            ref={feedRef}
            onScroll={handleFeedScroll}
            className="flex-1 overflow-y-auto p-4 md:px-8 space-y-4"
          >
            {/* Center Content Width Constraint */}
            <div className="w-full max-w-3xl xl:max-w-4xl mx-auto space-y-4 pb-4">
              {/* STATE 01: Welcome / Empty State */}
              {currentState === '01' && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-[#e6f4f3] text-[#006763] flex items-center justify-center mb-3 shadow-2xs">
                    <span className="material-symbols-outlined text-[28px]">smart_toy</span>
                  </div>
                  <h2 className="text-[19px] font-bold text-[#111d23] mb-1 tracking-tight">
                    Чем помочь с архивом документов?
                  </h2>
                  <p className="text-[12.5px] text-[#536166] max-w-md mb-6 leading-relaxed">
                    Обрабатывайте входящие сканы, находите сведения и поручайте задачи автономному помощнику с полной изоляцией персональных данных.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
                    <button
                      onClick={() => handleTransition('02')}
                      className="p-3.5 rounded-xl border border-[#DCE3E5] bg-white hover:border-[#006763] hover:bg-[#e9f6fd] transition-all group shadow-2xs focus-visible:ring-1 focus-visible:ring-[#006763]"
                    >
                      <div className="flex items-center gap-2 font-semibold text-[13px] text-[#111d23] group-hover:text-[#006763]">
                        <span className="material-symbols-outlined text-[20px] text-[#006763]">document_scanner</span>
                        <span>Обработать документ</span>
                      </div>
                      <p className="text-[11.5px] text-[#536166] mt-1 leading-snug">
                        Автоматическая классификация, OCR и заполнение карточки реквизитов
                      </p>
                    </button>

                    <button
                      onClick={() => handleTransition('08')}
                      className="p-3.5 rounded-xl border border-[#DCE3E5] bg-white hover:border-[#006763] hover:bg-[#e9f6fd] transition-all group shadow-2xs focus-visible:ring-1 focus-visible:ring-[#006763]"
                    >
                      <div className="flex items-center gap-2 font-semibold text-[13px] text-[#111d23] group-hover:text-[#006763]">
                        <span className="material-symbols-outlined text-[20px] text-[#006763]">search_check</span>
                        <span>Найти информацию</span>
                      </div>
                      <p className="text-[11.5px] text-[#536166] mt-1 leading-snug">
                        Поиск по тексту сканов с точными цитатами и номерами страниц
                      </p>
                    </button>

                    <button
                      onClick={() => handleTransition('05')}
                      className="p-3.5 rounded-xl border border-[#DCE3E5] bg-white hover:border-[#006763] hover:bg-[#e9f6fd] transition-all group shadow-2xs focus-visible:ring-1 focus-visible:ring-[#006763]"
                    >
                      <div className="flex items-center gap-2 font-semibold text-[13px] text-[#111d23] group-hover:text-[#006763]">
                        <span className="material-symbols-outlined text-[20px] text-[#006763]">fact_check</span>
                        <span>Проверить данные</span>
                      </div>
                      <p className="text-[11.5px] text-[#536166] mt-1 leading-snug">
                        Сверка реквизитов перед фиксацией в зашифрованный том SQLite WAL
                      </p>
                    </button>

                    <button
                      onClick={() => handleTransition('07')}
                      className="p-3.5 rounded-xl border border-[#DCE3E5] bg-white hover:border-[#006763] hover:bg-[#e9f6fd] transition-all group shadow-2xs focus-visible:ring-1 focus-visible:ring-[#006763]"
                    >
                      <div className="flex items-center gap-2 font-semibold text-[13px] text-[#111d23] group-hover:text-[#006763]">
                        <span className="material-symbols-outlined text-[20px] text-[#006763]">inventory_2</span>
                        <span>Пакетная очередь</span>
                      </div>
                      <p className="text-[11.5px] text-[#536166] mt-1 leading-snug">
                        Пакетная обработка набора входящих файлов из папки Inbox
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 02: Document Selected, Ready to Process */}
              {currentState === '02' && (
                <div className="space-y-4">
                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#e9f6fd] text-[#111d23] p-3 rounded-xl max-w-lg border border-[#DCE3E5]">
                      <p className="text-[13px] leading-relaxed">
                        Я выбрал файл <strong>Медицинское_заключение.pdf</strong> из очереди Входящих. Подготовь для него архивную карточку и проверь реквизиты.
                      </p>
                    </div>
                  </div>

                  {/* Assistant Message Card */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#DCE3E5]/60 pb-2">
                        <span className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006763] text-[18px]">task</span>
                          <span>Документ прикреплён и готов к обработке</span>
                        </span>
                        <span className="text-[11px] font-mono bg-[#e9f6fd] px-2 py-0.5 rounded text-[#536166]">
                          PDF • 2 стр. • 1.4 МБ
                        </span>
                      </div>
                      <p className="text-[12px] text-[#3e4948] leading-relaxed">
                        Файл проверен на целостность (хэш SHA-256 подтверждён). Нажмите <strong>«Обработать с ИИ»</strong> для запуска автономного анализа текста, классификации категории и извлечения реквизитов.
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => handleTransition('03')}
                          className="h-8 px-4 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#006763]"
                        >
                          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                          <span>Обработать с ИИ (Старт)</span>
                        </button>
                        <button
                          onClick={() => handleTransition('01')}
                          className="h-8 px-3 bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] rounded-lg text-[12px] transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 03: Autonomous Document Processing Checklist */}
              {currentState === '03' && (
                <div className="space-y-4">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#e9f6fd] text-[#111d23] p-3 rounded-xl max-w-lg border border-[#DCE3E5]">
                      <p className="text-[13px]">Обработай документ <strong>Медицинское_заключение.pdf</strong>.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#006763] animate-pulse"></span>
                          <span className="font-semibold text-[13px] text-[#111d23]">
                            Автономный анализ документа в процессе...
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#006763] font-semibold">Этап 5 из 7</span>
                      </div>

                      {/* Step Progress Checklist */}
                      <div className="space-y-2 border-t border-b border-[#DCE3E5]/60 py-2.5 text-[12px]">
                        <div className="flex items-center gap-2 text-emerald-800">
                          <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                          <span>1. Проверка файлов (PDF/A, целостность хэша SHA-256)</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-800">
                          <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                          <span>2. Распознавание слоев текста (OCR Tesseract Engine)</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-800">
                          <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                          <span>3. Определение типа: «Консультативное заключение врача»</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-800">
                          <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                          <span>4. Извлечение ключевых фактов (Диагноз, Врач, Дата, Назначения)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#006763] font-semibold">
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          <span>5. Заполнение структурированной карточки (18 полей)...</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6e7978]">
                          <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                          <span>6. Проверка значений по координатам скана</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6e7978]">
                          <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                          <span>7. Формирование черновика</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#536166]">
                        <span>Модель: {activeModel}</span>
                        <button
                          onClick={() => handleTransition('04')}
                          className="text-[#006763] font-semibold hover:underline cursor-pointer"
                        >
                          Завершить немедленно →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 04: Prepared Draft Ready */}
              {currentState === '04' && (
                <div className="space-y-4">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#e9f6fd] text-[#111d23] p-3 rounded-xl max-w-lg border border-[#DCE3E5]">
                      <p className="text-[13px]">Обработай документ <strong>Медицинское_заключение.pdf</strong>.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-900 font-semibold text-[13px]">
                          <span className="material-symbols-outlined text-emerald-700 text-[18px]">task_alt</span>
                          <span>Черновик документа успешно подготовлен</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#e6f4f3] text-[#006763] font-medium">
                          Черновик в памяти
                        </span>
                      </div>

                      <div className="p-3 bg-[#f4faff] rounded-lg border border-[#DCE3E5] space-y-1.5 text-[12px]">
                        <div className="flex justify-between">
                          <span className="text-[#6e7978]">Название:</span>
                          <span className="font-semibold text-[#111d23]">Консультативное заключение кардиолога</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6e7978]">Категория:</span>
                          <span className="text-[#111d23]">Здоровье и медицина • Заключение</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6e7978]">Дата документа:</span>
                          <span className="text-[#111d23] font-mono">14.05.2026 (Стр. 1)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6e7978]">Сверка полей:</span>
                          <span className="text-[#111d23]">
                            <strong>16</strong> заполнено • <strong className="text-amber-800">2</strong> требуют проверки
                          </span>
                        </div>
                      </div>

                      <p className="text-[12px] text-[#3e4948] leading-relaxed">
                        Все реквизиты перенесены в карточку. Данные открыты в правом инспекторе. Вы можете утвердить проект или открыть полный редактор SCR-06.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            showToast('Открываем единый редактор документа SCR-06', 'edit_document');
                            setCurrentScreen('SCR-06', 'Помощник');
                          }}
                          className="h-8 px-3.5 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#006763]"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          <span>Открыть полный редактор (SCR-06)</span>
                        </button>
                        <button
                          onClick={() => handleTransition('05', 'verify')}
                          className="h-8 px-3 bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] rounded-lg text-[12px] flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">fact_check</span>
                          <span>Проверить замечания (2)</span>
                        </button>
                        <button
                          onClick={() => handleTransition('09')}
                          className="h-8 px-2.5 text-[#006763] hover:bg-[#e6f4f3] rounded-lg text-[12px] font-medium ml-auto transition-colors"
                        >
                          К сохранению →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 05: Field Verification Mode */}
              {currentState === '05' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#DCE3E5]/60 pb-2">
                        <span className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006763] text-[18px]">fact_check</span>
                          <span>Пошаговая проверка извлечённых значений (Поле 1 из 2)</span>
                        </span>
                        <span className="text-[11px] font-mono text-[#536166]">Стр. 1, строка 12</span>
                      </div>

                      {/* Excerpt Snippet with Quote Matching */}
                      <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-amber-900 uppercase">
                            Поле: Дата следующего планового осмотра
                          </span>
                          <span className="text-amber-800 font-medium">OCR не уверен (84%)</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-amber-200 text-[12px] font-serif leading-relaxed text-[#111d23]">
                          «...повторный контрольный осмотр через 6 месяцев:{' '}
                          <mark className="bg-amber-200 px-1 rounded font-bold">ноябрь 2026 г.</mark> (число не указано рукописно)»
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#536166]">Предлагаемое значение в карточке:</label>
                        <input
                          type="text"
                          value={proposedDateVal}
                          onChange={(e) => setProposedDateVal(e.target.value)}
                          className="w-full h-8 px-2.5 border border-[#DCE3E5] rounded-lg text-[12px] bg-white focus:border-[#006763] focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            showToast('Значение поля утверждено', 'check');
                            handleTransition('06', 'verify');
                          }}
                          className="h-8 px-3.5 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          <span>Подтвердить значение</span>
                        </button>
                        <button
                          onClick={() => handleTransition('06', 'verify')}
                          className="h-8 px-3 bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] rounded-lg text-[12px] transition-colors"
                        >
                          Оставить без даты
                        </button>
                        <button
                          onClick={() => handleTransition('04', 'draft')}
                          className="h-8 px-2 text-[#536166] hover:text-[#111d23] text-[12px] ml-auto"
                        >
                          Назад к карточке
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 06: Human Decision Required (Ambiguity / Collision) */}
              {currentState === '06' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-amber-300 p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3 bg-amber-50/20">
                      <div className="flex items-center justify-between text-amber-900 font-semibold text-[13px]">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-amber-700 text-[18px]">help_center</span>
                          <span>Требуется решение: обнаружено несоответствие с «Мои данные»</span>
                        </span>
                        <span className="text-[11px] text-amber-800 font-mono">Конфликт ФИО</span>
                      </div>

                      <p className="text-[12px] text-[#3e4948] leading-relaxed">
                        В документе указано ФИО: <strong>«Смирнов А.В.»</strong>, тогда как в справочнике пользователя зарегистрирован{' '}
                        <strong>«Смирнов Алексей Викторович»</strong>. Связать этот документ с существующим профилем?
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                        <button
                          onClick={() => {
                            showToast('Связано с профилем: Смирнов Алексей Викторович', 'link');
                            handleTransition('04', 'draft');
                          }}
                          className="p-3 rounded-lg bg-white border border-[#006763]/40 text-left hover:bg-[#e6f4f3] transition-colors focus-visible:ring-1 focus-visible:ring-[#006763]"
                        >
                          <div className="font-semibold text-[#006763] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">link</span>
                            <span>Связать с профилем</span>
                          </div>
                          <div className="text-[11px] text-[#536166] mt-0.5">
                            Смирнов Алексей Викторович (Рекомендуется)
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            showToast('Создан отдельный субъект: Смирнов А.В.', 'person_add');
                            handleTransition('04', 'draft');
                          }}
                          className="p-3 rounded-lg bg-white border border-[#DCE3E5] text-left hover:bg-[#e9f6fd] transition-colors focus-visible:ring-1 focus-visible:ring-[#006763]"
                        >
                          <div className="font-semibold text-[#111d23] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            <span>Создать новое лицо</span>
                          </div>
                          <div className="text-[11px] text-[#536166] mt-0.5">
                            Оставить как отдельного субъекта «Смирнов А.В.»
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 07: Batch Queue View */}
              {currentState === '07' && (
                <div className="space-y-4">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#e9f6fd] text-[#111d23] p-3 rounded-xl max-w-lg border border-[#DCE3E5]">
                      <p className="text-[13px]">Обработай все 5 входящих документов из папки Inbox.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006763] text-[18px]">format_list_bulleted</span>
                          <span>Пакетная обработка входящих документов</span>
                        </span>
                        <span className="text-[11px] font-mono text-[#536166]">3 из 5 завершено</span>
                      </div>

                      <div className="w-full bg-[#e9f6fd] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#006763] h-full w-3/5"></div>
                      </div>

                      <div className="divide-y divide-[#DCE3E5]/60 text-[12px]">
                        <div className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                            <span className="font-medium text-[#111d23]">Паспорт_РФ.pdf</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10.5px] bg-emerald-50 text-emerald-800 font-medium">
                            Черновик готов
                          </span>
                        </div>

                        <div className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                            <span className="font-medium text-[#111d23]">Медицинское_заключение.pdf</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10.5px] bg-emerald-50 text-emerald-800 font-medium">
                            Черновик готов
                          </span>
                        </div>

                        <div className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[#006763] animate-spin">sync</span>
                            <span className="font-medium text-[#111d23]">Договор_аренды_42.pdf</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10.5px] bg-[#e6f4f3] text-[#006763] font-medium">
                            Обрабатывается...
                          </span>
                        </div>

                        <div className="py-2 flex items-center justify-between text-[#6e7978]">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            <span>Справка_2НДФЛ.pdf</span>
                          </div>
                          <span className="text-[11px]">Ожидает очереди</span>
                        </div>

                        <div className="py-2 flex items-center justify-between text-red-700">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            <span className="font-medium">Чек_скан.jpg</span>
                          </div>
                          <button
                            onClick={() => handleTransition('11')}
                            className="text-[11px] underline cursor-pointer hover:text-red-900 font-medium"
                          >
                            Сбой OCR • Повторить
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#536166]">Файлы обрабатываются последовательно</span>
                        <button
                          onClick={() => handleTransition('04', 'draft')}
                          className="text-[#006763] font-semibold text-[12px] hover:underline"
                        >
                          Открыть выбранный черновик →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 08: Agent Multi-step Task */}
              {currentState === '08' && (
                <div className="space-y-4">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#e9f6fd] text-[#111d23] p-3 rounded-xl max-w-lg border border-[#DCE3E5]">
                      <p className="text-[13px] leading-relaxed">
                        Найди все медицинские документы за 2025–2026 год, связанные с артериальным давлением, и подготовь выписку назначенных препаратов.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006763] text-[18px]">account_tree</span>
                          <span>Агентный план задачи (Поиск и аналитика архива)</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                          Выполнено 4 из 4
                        </span>
                      </div>

                      <div className="space-y-2 border-t border-b border-[#DCE3E5]/60 py-2.5 text-[12px]">
                        <div className="p-2.5 rounded-lg bg-[#f4faff] border border-[#DCE3E5]/50 flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                          <div>
                            <div className="font-semibold text-[#111d23]">Шаг 1: Сканирование Open-архива по категории «Здоровье»</div>
                            <div className="text-[11px] text-[#536166]">Найдено 4 документа с релевантными маркерами (АД, кардиолог)</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#f4faff] border border-[#DCE3E5]/50 flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                          <div>
                            <div className="font-semibold text-[#111d23]">Шаг 2: Извлечение назначений лекарственных препаратов</div>
                            <div className="text-[11px] text-[#536166]">Выявлен приём: «Периндоприл 5 мг», «Индапамид 1.5 мг»</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#f4faff] border border-[#DCE3E5]/50 flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                          <div>
                            <div className="font-semibold text-[#111d23]">Шаг 3: Проверка хронологии рецептов</div>
                            <div className="text-[11px] text-[#536166]">Схема актуализирована от 14.05.2026 в ГКБ № 12</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#f4faff] border border-[#DCE3E5]/50 flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                          <div>
                            <div className="font-semibold text-[#111d23]">Шаг 4: Формирование сводной таблицы для экспорта</div>
                            <div className="text-[11px] text-[#536166]">Сформирован структурированный отчет с цитатами источников</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleTransition('04', 'draft')}
                          className="h-8 px-3.5 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">table_view</span>
                          <span>Показать найденные карточки (4)</span>
                        </button>
                        <button
                          onClick={() => handleTransition('01')}
                          className="h-8 px-3 text-[#536166] hover:text-[#111d23] text-[12px]"
                        >
                          Завершить диалог
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 09: Confirm Changes (Before/After Diff) */}
              {currentState === '09' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#006763] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div className="bg-white border border-[#DCE3E5] p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#DCE3E5]/60 pb-2">
                        <span className="font-semibold text-[13px] text-[#111d23] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006763] text-[18px]">difference</span>
                          <span>Сверка предлагаемых изменений перед записью</span>
                        </span>
                        <span className="text-[11px] font-mono text-[#536166]">Сессия #AF-8942</span>
                      </div>

                      <p className="text-[12px] text-[#3e4948] leading-relaxed">
                        Помощник не производит запись в SQLite вслепую. Проверьте сравнение исходных и результирующих значений реквизитов:
                      </p>

                      {/* Diff Comparison Table */}
                      <div className="border border-[#DCE3E5] rounded-lg overflow-hidden text-[12px]">
                        <table className="w-full text-left">
                          <thead className="bg-[#e9f6fd] text-[11px] text-[#536166] font-semibold uppercase">
                            <tr>
                              <th className="p-2.5">Реквизит</th>
                              <th className="p-2.5">Было в файле</th>
                              <th className="p-2.5 text-[#006763]">Станет в архиве</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DCE3E5]">
                            <tr>
                              <td className="p-2.5 font-medium text-[#111d23]">Название</td>
                              <td className="p-2.5 text-[#6e7978] line-through">scan_0041.pdf</td>
                              <td className="p-2.5 text-[#006763] font-semibold">Консультативное заключение кардиолога</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-medium text-[#111d23]">Категория</td>
                              <td className="p-2.5 text-[#6e7978]">Не определена</td>
                              <td className="p-2.5 text-[#006763] font-semibold">Здоровье и медицина</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-medium text-[#111d23]">Дата</td>
                              <td className="p-2.5 text-[#6e7978]">Не указана</td>
                              <td className="p-2.5 text-[#006763] font-mono font-semibold">14.05.2026</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-medium text-[#111d23]">Том архива</td>
                              <td className="p-2.5 text-[#6e7978]">Входящие (Inbox)</td>
                              <td className="p-2.5 text-[#006763] font-semibold">Open: /2026/Здоровье/</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            showToast('Документ зафиксирован в архиве SQLite WAL!', 'verified');
                            handleTransition('10');
                          }}
                          className="h-8 px-4 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Подтвердить и зафиксировать в архив</span>
                        </button>
                        <button
                          onClick={() => handleTransition('04', 'draft')}
                          className="h-8 px-3 bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] rounded-lg text-[12px]"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 10: Archive Save Completed */}
              {currentState === '10' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    </div>
                    <div className="bg-white border border-emerald-300 p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3 bg-emerald-50/20">
                      <div className="flex items-center justify-between text-emerald-900 font-semibold text-[13px]">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">lock</span>
                          <span>Документ успешно зафиксирован в постоянном архиве!</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-800 font-bold">PV-0043</span>
                      </div>

                      <p className="text-[12px] text-[#3e4948] leading-relaxed">
                        Запись сохранена в SQLite WAL. Исходный скан перенесён в защищённый каталог с контрольной суммой SHA-256. Карточка доступна в общем <strong>Журнале (SCR-01)</strong>.
                      </p>

                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-[12px] space-y-1">
                        <div className="text-[#536166] text-[11px]">
                          Идентификатор архива:{' '}
                          <span className="font-mono text-[#111d23] font-semibold">
                            PV-0043 • sha256:d8c2...e41
                          </span>
                        </div>
                        <div className="text-[#536166] text-[11px]">
                          Файл перемещён из очереди Входящих без дублирования на диске.
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleTransition('01')}
                          className="h-8 px-3.5 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Обработать следующий документ</span>
                        </button>
                        <button
                          onClick={() => {
                            showToast('Переход в Журнал архива (SCR-01)', 'menu_book');
                            setCurrentScreen('SCR-01', 'Помощник');
                          }}
                          className="h-8 px-3 bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] rounded-lg text-[12px]"
                        >
                          Просмотреть в Журнале
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 11: Error and Recovery (OCR Low Confidence) */}
              {currentState === '11' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    </div>
                    <div className="bg-white border border-red-300 p-4 rounded-xl w-full max-w-xl shadow-xs space-y-3 bg-red-50/20">
                      <div className="flex items-center justify-between text-red-900 font-semibold text-[13px]">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
                          <span>Не удалось надёжно распознать текст документа</span>
                        </span>
                        <span className="text-[11px] font-mono text-red-700 font-bold">
                          ERR_OCR_LOW_CONFIDENCE
                        </span>
                      </div>

                      <p className="text-[12px] text-[#3e4948] leading-relaxed">
                        Файл <strong>Чек_скан.jpg</strong> имеет низкое разрешение или сильное размытие (уверенность распознавания 38%). ИИ не стал выдумывать значения во избежание порчи данных.
                      </p>

                      <div className="p-2.5 rounded-lg bg-white border border-red-200 text-[12px] space-y-1">
                        <div className="font-semibold text-[#111d23]">Рекомендуемые действия:</div>
                        <ul className="list-disc pl-4 text-[11px] text-[#536166] space-y-0.5">
                          <li>Переключить модель на мультимодальную (Llama 3.2-Vision)</li>
                          <li>Ввести ключевые реквизиты вручную через Редактор</li>
                          <li>Повторить попытку с улучшением контраста скана</li>
                        </ul>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            showToast('Повторный анализ с фильтрацией резкости...', 'refresh');
                            handleTransition('03');
                          }}
                          className="h-8 px-3.5 bg-[#006763] hover:bg-[#237a75] text-white rounded-lg font-medium text-[12px] flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">refresh</span>
                          <span>Повторить с фильтрацией резкости</span>
                        </button>
                        <button
                          onClick={() => {
                            showToast('Переход к ручному заполнению в SCR-06', 'edit_document');
                            setCurrentScreen('SCR-06', 'Помощник');
                          }}
                          className="h-8 px-3 bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] rounded-lg text-[12px]"
                        >
                          Ручной ввод
                        </button>
                        <button
                          onClick={() => handleTransition('01')}
                          className="h-8 px-2 text-[#536166] hover:text-[#111d23] text-[12px] ml-auto"
                        >
                          Пропустить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Fast Scroll-to-Bottom Button */}
          {showScrollBottomBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-28 right-8 bg-white hover:bg-[#e9f6fd] text-[#006763] border border-[#DCE3E5] shadow-lg rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[12px] font-semibold transition-all z-20 animate-in fade-in zoom-in-95 duration-150"
              title="Перейти к последнему сообщению"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              <span>Вниз</span>
            </button>
          )}

          {/* ======================================================== */}
          {/* BOTTOM COMPOSER: Attached Pill, Working Bar, Textarea    */}
          {/* ======================================================== */}
          <div className="p-3 md:px-8 bg-white border-t border-[#DCE3E5] shrink-0 z-10">
            <div className="max-w-3xl xl:max-w-4xl mx-auto flex flex-col gap-1.5">
              {/* Attachment Pill Preview Bar */}
              {(currentState === '02' || currentState === '03') && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e9f6fd] border border-[#006763]/30 text-[12px] animate-in fade-in duration-100">
                  <span className="material-symbols-outlined text-[16px] text-[#006763]">picture_as_pdf</span>
                  <span className="font-semibold text-[#111d23] truncate max-w-[280px]">
                    Медицинское_заключение.pdf
                  </span>
                  <span className="text-[#536166] text-[11px] hidden sm:inline">
                    (2 страницы, 1.4 МБ • Зона Open)
                  </span>
                  <button
                    onClick={handleDetachFile}
                    className="ml-auto text-[#6e7978] hover:text-red-700 p-0.5 rounded"
                    title="Убрать вложение"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              )}

              {/* Active Working / Analyzing Bar (State 03) */}
              {currentState === '03' && (
                <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-[#e6f4f3] text-[#006763] text-[11.5px] font-medium border border-[#006763]/20 animate-in fade-in duration-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#006763] animate-ping"></span>
                    <span>ИИ выполняет анализ и сопоставление данных со сканом...</span>
                  </div>
                  <button
                    onClick={() => {
                      handleTransition('02');
                      showToast('Обработка остановлена пользователем', 'pause');
                    }}
                    className="px-2 py-0.5 rounded bg-white text-red-700 border border-red-300 hover:bg-red-50 text-[11px] font-semibold"
                  >
                    Остановить
                  </button>
                </div>
              )}

              {/* Input Box Container */}
              <div className="relative bg-white border border-[#DCE3E5] rounded-xl shadow-2xs focus-within:border-[#006763] focus-within:ring-1 focus-within:ring-[#006763] transition-all">
                <textarea
                  ref={textareaRef}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComposerSubmit();
                    }
                  }}
                  rows={1}
                  placeholder="Задайте вопрос или поручите задачу (например: «Обработай этот скан и заполни карточку»)..."
                  className="w-full px-3.5 py-2.5 text-[12.5px] bg-transparent resize-none focus:outline-none text-[#111d23] placeholder:text-[#6e7978] max-h-36 overflow-y-auto leading-relaxed"
                />

                {/* Composer Actions Toolbar */}
                <div className="flex items-center justify-between px-2.5 pb-2 pt-1 border-t border-[#DCE3E5]/40 text-[11.5px]">
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1 text-[#536166]">
                    <button
                      type="button"
                      onClick={handleAttachFile}
                      title="Прикрепить документ"
                      className="p-1 hover:bg-[#e9f6fd] rounded text-[#6e7978] hover:text-[#111d23] flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">attach_file</span>
                      <span className="hidden sm:inline">Файл</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCycleScope}
                      title="Сменить область контекста"
                      className="p-1 hover:bg-[#e9f6fd] rounded text-[#6e7978] hover:text-[#111d23] flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">database</span>
                      <span className="hidden sm:inline">Архив: {activeScope.split(':')[0]}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTransition('07', 'queue')}
                      title="Пакетная очередь"
                      className="p-1 hover:bg-[#e9f6fd] rounded text-[#6e7978] hover:text-[#111d23] flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
                      <span className="hidden sm:inline">Очередь (5)</span>
                    </button>
                  </div>

                  {/* Right Send Action Button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleComposerSubmit()}
                      disabled={currentState === '03'}
                      className="h-7 px-3 rounded-lg bg-[#006763] hover:bg-[#237a75] disabled:opacity-50 text-white font-medium text-[12px] flex items-center gap-1 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#006763]"
                    >
                      <span>Отправить</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Footer Guarantee Note */}
              <div className="flex items-center justify-between text-[11px] text-[#6e7978] px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      isLocalModel ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    shield_lock
                  </span>
                  <span>
                    {isLocalModel
                      ? 'Локальная обработка: исходные файлы не покидают компьютер. Запись в архив — только с вашего подтверждения.'
                      : 'Внимание: Выбрана облачная модель. Обработка требует передачи контекста на внешние сервера провайдера.'}
                  </span>
                </div>
                <span className="font-mono text-[10.5px] text-[#536166] hidden md:inline">
                  PV2 Agent v2.4-strict
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. RIGHT CONTEXTUAL INSPECTOR (Resizable: 320px - 480px)  */}
        {/* ======================================================== */}
        {isInspectorOpen && (
          <aside
            style={{ width: isUltraNarrow ? '100%' : `${inspectorWidth}px` }}
            className={`bg-[#e9f6fd] border-l border-[#DCE3E5] flex flex-col shrink-0 z-20 overflow-hidden transition-all duration-75 relative ${
              isNarrow
                ? 'absolute inset-y-0 right-0 shadow-2xl z-40 bg-[#e9f6fd]'
                : ''
            }`}
          >
            {/* Drag Handle on Left Border */}
            {!isUltraNarrow && (
              <div
                onMouseDown={handleMouseDownResize}
                className="absolute inset-y-0 left-0 w-2 cursor-col-resize hover:bg-[#006763]/30 active:bg-[#006763] z-30 transition-colors flex items-center justify-center group"
                title="Перетащите для регулировки ширины (320px–480px)"
              >
                <div className="w-0.5 h-6 bg-[#bdc9c7] group-hover:bg-[#006763] rounded"></div>
              </div>
            )}

            {/* Inspector Tab Bar */}
            <div className="h-10 bg-[#ddeaf2] border-b border-[#DCE3E5] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentInspectorTab('draft')}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors ${
                    currentInspectorTab === 'draft'
                      ? 'bg-white text-[#006763] font-semibold shadow-2xs'
                      : 'text-[#536166] hover:text-[#111d23]'
                  }`}
                >
                  Черновик
                </button>
                <button
                  onClick={() => setCurrentInspectorTab('verify')}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors ${
                    currentInspectorTab === 'verify'
                      ? 'bg-white text-[#006763] font-semibold shadow-2xs'
                      : 'text-[#536166] hover:text-[#111d23]'
                  }`}
                >
                  Сверка
                </button>
                <button
                  onClick={() => setCurrentInspectorTab('doc')}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors ${
                    currentInspectorTab === 'doc'
                      ? 'bg-white text-[#006763] font-semibold shadow-2xs'
                      : 'text-[#536166] hover:text-[#111d23]'
                  }`}
                >
                  Документ
                </button>
                <button
                  onClick={() => setCurrentInspectorTab('queue')}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-colors ${
                    currentInspectorTab === 'queue'
                      ? 'bg-white text-[#006763] font-semibold shadow-2xs'
                      : 'text-[#536166] hover:text-[#111d23]'
                  }`}
                >
                  Очередь
                </button>
              </div>

              {/* Close Inspector Button */}
              <button
                onClick={() => setIsInspectorOpen(false)}
                title="Свернуть инспектор"
                className="p-1 text-[#6e7978] hover:text-[#111d23] rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Inspector Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              {/* TAB 1: DRAFT (Черновик) */}
              {currentInspectorTab === 'draft' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#DCE3E5]">
                    <span className="font-semibold text-[11.5px] uppercase tracking-wider text-[#536166]">
                      Карточка черновика
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#e6f4f3] text-[#006763] font-medium">
                      Open Storage
                    </span>
                  </div>

                  <div className="space-y-2.5 bg-white p-3 rounded-lg border border-[#DCE3E5] text-[12px]">
                    <div>
                      <span className="text-[10.5px] text-[#6e7978] uppercase font-semibold">Название</span>
                      <div className="font-semibold text-[#111d23] text-[13px] mt-0.5">
                        Консультативное заключение кардиолога
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] pt-1 border-t border-[#DCE3E5]/60">
                      <div>
                        <span className="text-[10.5px] text-[#6e7978] uppercase font-semibold">Категория</span>
                        <div className="text-[#111d23] mt-0.5">Здоровье</div>
                      </div>
                      <div>
                        <span className="text-[10.5px] text-[#6e7978] uppercase font-semibold">Дата</span>
                        <div className="text-[#111d23] font-mono mt-0.5">14.05.2026</div>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-[#DCE3E5]/60">
                      <span className="text-[10.5px] text-[#6e7978] uppercase font-semibold">Субъект (Пациент)</span>
                      <div className="text-[#111d23] mt-0.5">Смирнов Алексей Викторович</div>
                    </div>

                    <div className="pt-1 border-t border-[#DCE3E5]/60">
                      <span className="text-[10.5px] text-[#6e7978] uppercase font-semibold">Медицинская организация</span>
                      <div className="text-[#111d23] mt-0.5">ГКБ № 12 г. Санкт-Петербурга</div>
                    </div>
                  </div>

                  {/* Validation Health Meters */}
                  <div className="p-3 rounded-lg bg-white space-y-2 border border-[#DCE3E5] text-[12px]">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-[#111d23]">Сверка со сканом</span>
                      <span className="font-mono text-[#006763] font-bold">16 / 18 полей</span>
                    </div>
                    <div className="w-full bg-[#ddeaf2] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#006763] h-full w-[88%]"></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#536166]">
                      <span>Обязательные: 100% OK</span>
                      <button
                        onClick={() => {
                          setCurrentInspectorTab('verify');
                          handleTransition('05');
                        }}
                        className="text-amber-800 font-semibold cursor-pointer hover:underline"
                      >
                        2 на проверку →
                      </button>
                    </div>
                  </div>

                  {/* Extracted Structured Tags */}
                  <div>
                    <span className="text-[11px] text-[#536166] block mb-1.5 font-semibold uppercase tracking-wider">
                      Извлечённые реквизиты:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-white text-[#111d23] border border-[#DCE3E5]">
                        МКБ-10: I11.9
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white text-[#111d23] border border-[#DCE3E5]">
                        Периндоприл 5 мг
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white text-[#111d23] border border-[#DCE3E5]">
                        Давление: 135/85
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VERIFICATION (Сверка) */}
              {currentInspectorTab === 'verify' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#DCE3E5]">
                    <span className="font-semibold text-[11.5px] uppercase tracking-wider text-amber-900">
                      Сверка значений (2)
                    </span>
                    <span className="text-[10px] text-[#536166] font-mono">OCR Provenance</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-amber-300 space-y-2 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111d23]">Дата планового осмотра</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-900 font-medium">
                        Не сверено
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#536166] leading-relaxed">
                      Цитата со скана: «повторный осмотр через 6 месяцев: ноябрь 2026 г.»
                    </div>
                    <div className="pt-1 flex gap-1.5">
                      <button
                        onClick={() => handleTransition('06', 'verify')}
                        className="px-2.5 py-1 rounded bg-[#006763] hover:bg-[#237a75] text-white text-[11px] font-semibold"
                      >
                        Сверить
                      </button>
                      <button
                        onClick={() => handleTransition('06', 'verify')}
                        className="px-2.5 py-1 rounded bg-[#e9f6fd] hover:bg-[#e3f0f8] text-[#111d23] text-[11px]"
                      >
                        Пропустить
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#DCE3E5] space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111d23]">Дозировка: Периндоприл</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                        Сверено
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#536166]">
                      Стр. 1, п. 3: «5 мг один раз в сутки утром»
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DOCUMENT ORIGINAL PREVIEW (Документ) */}
              {currentInspectorTab === 'doc' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#DCE3E5]">
                    <span className="font-semibold text-[11.5px] uppercase tracking-wider text-[#536166]">
                      Исходный скан (Оригинал)
                    </span>
                    <span className="text-[11px] font-mono text-[#536166]">Стр. 1 из 2</span>
                  </div>

                  <div className="bg-white p-3.5 border border-[#DCE3E5] rounded-lg shadow-2xs text-[11.5px] font-serif leading-relaxed text-[#111d23] space-y-2">
                    <div className="text-center font-bold text-[11.5px] uppercase pb-2 border-b border-[#DCE3E5] font-sans">
                      ГКБ № 12 • Кардиология
                      <div className="text-[10px] font-normal text-[#536166]">Консультативное заключение</div>
                    </div>
                    <p><strong>Пациент:</strong> Смирнов Алексей Викторович, 1984 г.р.</p>
                    <p><strong>Дата осмотра:</strong> 14 мая 2026 г.</p>
                    <p>
                      <strong>Диагноз:</strong>{' '}
                      <mark className="bg-[#e6f4f3] text-[#006763] font-sans px-1 rounded font-bold">
                        Гипертоническая болезнь II стадии
                      </mark>{' '}
                      (контролируемая)
                    </p>
                    <p><strong>Терапия:</strong> Периндоприл 5 мг 1 р/сут.</p>
                    <p className="text-[10.5px] text-[#6e7978] italic pt-2 text-right">Врач: Иванова Т.С. /подпись/</p>
                  </div>

                  <div className="text-[11px] text-[#6e7978] font-mono bg-white p-2 rounded border border-[#DCE3E5]">
                    Хэш: sha256:d8c2e91...4a1 • Только чтение (WORM)
                  </div>
                </div>
              )}

              {/* TAB 4: QUEUE (Очередь) */}
              {currentInspectorTab === 'queue' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#DCE3E5]">
                    <span className="font-semibold text-[11.5px] uppercase tracking-wider text-[#536166]">
                      Очередь обработки (5)
                    </span>
                    <span className="text-[11px] text-[#006763] font-mono font-bold">3 OK</span>
                  </div>

                  <div className="space-y-1.5 text-[12px]">
                    <div className="p-2.5 rounded-lg bg-white border border-[#DCE3E5] flex items-center justify-between">
                      <span className="font-medium text-[#111d23]">1. Паспорт_РФ.pdf</span>
                      <span className="text-emerald-700 text-[11px] font-semibold">Готов</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#e6f4f3] border border-[#006763]/40 flex items-center justify-between font-semibold text-[#006763]">
                      <span>2. Медицинское_заключение.pdf</span>
                      <span className="text-[11px] font-mono">Активен</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-[#DCE3E5] flex items-center justify-between">
                      <span className="text-[#111d23]">3. Договор_аренды_42.pdf</span>
                      <span className="text-[#6e7978] text-[11px]">Анализ...</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-[#DCE3E5] flex items-center justify-between text-[#6e7978]">
                      <span>4. Справка_2НДФЛ.pdf</span>
                      <span className="text-[11px]">Ожидает</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-red-300 flex items-center justify-between text-red-700">
                      <span className="font-medium">5. Чек_скан.jpg</span>
                      <button
                        onClick={() => handleTransition('11')}
                        className="text-[11px] font-semibold underline hover:text-red-900"
                      >
                        Сбой OCR
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Bottom Action Area */}
            <div className="p-3 bg-[#ddeaf2] border-t border-[#DCE3E5] shrink-0">
              {currentInspectorTab === 'draft' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast('Переход в полный редактор SCR-06', 'edit');
                      setCurrentScreen('SCR-06', 'Помощник');
                    }}
                    className="flex-1 h-8 px-2 rounded-lg bg-white hover:bg-[#f4faff] text-[#111d23] border border-[#DCE3E5] text-[12px] font-semibold flex items-center justify-center gap-1 shadow-2xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>В редактор</span>
                  </button>
                  <button
                    onClick={() => handleTransition('09')}
                    className="flex-1 h-8 px-2 rounded-lg bg-[#006763] hover:bg-[#237a75] text-white text-[12px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">save</span>
                    <span>Сохранить</span>
                  </button>
                </div>
              ) : currentInspectorTab === 'verify' ? (
                <button
                  onClick={() => handleTransition('04', 'draft')}
                  className="w-full h-8 rounded-lg bg-white hover:bg-[#f4faff] text-[#111d23] border border-[#DCE3E5] text-[12px] font-semibold transition-colors"
                >
                  Вернуться к сводке черновика
                </button>
              ) : currentInspectorTab === 'queue' ? (
                <button
                  onClick={() => handleTransition('04', 'draft')}
                  className="w-full h-8 rounded-lg bg-[#006763] hover:bg-[#237a75] text-white text-[12px] font-semibold transition-colors shadow-sm"
                >
                  Открыть текущий результат
                </button>
              ) : (
                <button
                  onClick={() => {
                    showToast('Разворачиваем документ в SCR-06', 'open_in_new');
                    setCurrentScreen('SCR-06', 'Помощник');
                  }}
                  className="w-full h-8 rounded-lg bg-white hover:bg-[#f4faff] text-[#111d23] border border-[#DCE3E5] text-[12px] font-semibold transition-colors"
                >
                  Открыть в редакторе (SCR-06)
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. MODEL CONNECTION SETTINGS MODAL (State 13 Config)    */}
      {/* ======================================================== */}
      {isModelSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-xl border border-[#DCE3E5] shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="h-10 bg-[#ddeaf2] border-b border-[#DCE3E5] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006763]">tune</span>
                <span className="font-semibold text-[13px] text-[#111d23]">Параметры подключения ИИ моделей</span>
              </div>
              <button
                onClick={() => setIsModelSettingsModalOpen(false)}
                className="p-1 text-[#6e7978] hover:text-[#111d23] rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 text-[12.5px]">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#536166] mb-1">
                  Локальный адрес Ollama API
                </label>
                <input
                  type="text"
                  value={ollamaEndpoint}
                  onChange={(e) => setOllamaEndpoint(e.target.value)}
                  className="w-full h-8 px-2.5 border border-[#DCE3E5] rounded-lg text-[12px] font-mono focus:border-[#006763] focus:outline-none"
                />
                <span className="text-[10.5px] text-[#6e7978] mt-0.5 block">
                  Порт по умолчанию: 11434 (без выхода в интернет)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#536166] mb-1">
                  OpenAI API Key (для облачных сценариев)
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full h-8 px-2.5 border border-[#DCE3E5] rounded-lg text-[12px] font-mono focus:border-[#006763] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold uppercase text-[#536166]">
                    Температура генерации (Креативность)
                  </label>
                  <span className="font-mono text-[11px] font-semibold text-[#006763]">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#006763] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6e7978]">
                  <span>0.0 (Строго факты/OCR)</span>
                  <span>1.0 (Творческий текст)</span>
                </div>
              </div>

              {/* Ping Connection Test */}
              <div className="p-3 rounded-lg bg-[#e9f6fd] border border-[#DCE3E5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#111d23] text-[12px]">Тест локального сервера</div>
                  <div className="text-[10.5px] text-[#536166]">Проверка отклика Ollama /api/tags</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsTestingConnection(true);
                    setTimeout(() => {
                      setIsTestingConnection(false);
                      showToast('Локальный сервер Ollama доступен (ping: 11ms)', 'check_circle');
                    }, 600);
                  }}
                  disabled={isTestingConnection}
                  className="px-3 py-1 rounded-lg bg-white border border-[#DCE3E5] hover:border-[#006763] text-[#111d23] text-[11.5px] font-semibold transition-colors"
                >
                  {isTestingConnection ? 'Проверка...' : 'Проверить'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="h-11 bg-[#ddeaf2] border-t border-[#DCE3E5] px-4 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsModelSettingsModalOpen(false)}
                className="h-8 px-3 rounded-lg bg-white hover:bg-[#f4faff] text-[#111d23] border border-[#DCE3E5] text-[12px] font-medium"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setIsModelSettingsModalOpen(false);
                  showToast('Настройки подключения сохранены', 'check');
                }}
                className="h-8 px-4 rounded-lg bg-[#006763] hover:bg-[#237a75] text-white text-[12px] font-semibold shadow-sm"
              >
                Сохранить параметры
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
