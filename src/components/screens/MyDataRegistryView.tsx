import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';
import { MyDataRecord, MyDataCategory, SecurityZone } from '../../types';
import { 
  User, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Info,
  Lock,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  FolderX,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const STORAGE_KEY_IS_GROUPS_COLLAPSED = 'personal_vault_my_data_groups_collapsed';

export const MyDataRegistryView: React.FC = () => {
  const { 
    myDataCategories, 
    myDataRecords, 
    hiddenGroupIds,
    addMyDataCategory,
    deleteMyDataCategory,
    hideMyDataCategory,
    unhideMyDataCategory,
    addMyDataRecord, 
    updateMyDataRecord,
    isVeraCryptMounted, 
    showToast,
    myDataScreenState,
    setMyDataScreenState,
  } = useVault();

  const [isGroupsCollapsed, setIsGroupsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_IS_GROUPS_COLLAPSED);
      return saved !== null ? JSON.parse(saved) === true : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IS_GROUPS_COLLAPSED, JSON.stringify(isGroupsCollapsed));
    } catch (err) {
      console.error('Failed to save groups collapsed state to localStorage', err);
    }
  }, [isGroupsCollapsed]);

  const visibleCategories = useMemo(() => {
    return myDataCategories.filter((c: MyDataCategory) => !hiddenGroupIds.includes(c.id));
  }, [myDataCategories, hiddenGroupIds]);

  const hiddenCategories = useMemo(() => {
    return myDataCategories.filter((c: MyDataCategory) => hiddenGroupIds.includes(c.id));
  }, [myDataCategories, hiddenGroupIds]);

  const activeGroupId = myDataScreenState.activeGroupId || (visibleCategories[0]?.id || myDataCategories[0]?.id || '');
  const setActiveGroupId = (id: string | ((prev: string) => string)) => {
    setMyDataScreenState(prev => ({
      ...prev,
      activeGroupId: typeof id === 'function' ? id(prev.activeGroupId) : id,
    }));
  };

  const isHiddenSectionExpanded = myDataScreenState.isHiddenSectionExpanded;
  const setIsHiddenSectionExpanded = (v: boolean | ((prev: boolean) => boolean)) => {
    setMyDataScreenState(prev => ({
      ...prev,
      isHiddenSectionExpanded: typeof v === 'function' ? v(prev.isHiddenSectionExpanded) : v,
    }));
  };

  const searchQuery = myDataScreenState.searchQuery;
  const setSearchQuery = (q: string | ((prev: string) => string)) => {
    setMyDataScreenState(prev => ({
      ...prev,
      searchQuery: typeof q === 'function' ? q(prev.searchQuery) : q,
    }));
  };
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states: Add Group
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupError, setNewGroupError] = useState<string | null>(null);

  // Modal states: Add Record
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newType, setNewType] = useState('Паспортные данные');
  const [newZone, setNewZone] = useState<SecurityZone>('open');

  // UX-020 delete group modal
  const [deleteModalGroupId, setDeleteModalGroupId] = useState<string | null>(null);
  const [targetMoveGroupId, setTargetMoveGroupId] = useState<string>('');

  const activeCategory = useMemo(() => {
    return myDataCategories.find((c: MyDataCategory) => c.id === activeGroupId) || null;
  }, [myDataCategories, activeGroupId]);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast(`Значение скопировано: ${text.slice(0, 25)}...`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setNewGroupError('Название группы обязательно для заполнения');
      return;
    }
    const isDuplicate = myDataCategories.some(
      (c: MyDataCategory) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setNewGroupError('Группа с таким названием уже существует');
      return;
    }

    const created = addMyDataCategory(trimmed);
    setNewGroupName('');
    setNewGroupError(null);
    setIsAddGroupOpen(false);
    setActiveGroupId(created.id);
    showToast(`Группа «${trimmed}» добавлена`);
  };

  const handleHideGroup = (groupId: string) => {
    hideMyDataCategory(groupId);
    if (activeGroupId === groupId) {
      const remainingVisible = visibleCategories.filter(c => c.id !== groupId);
      if (remainingVisible.length > 0) {
        const currentIndex = visibleCategories.findIndex(c => c.id === groupId);
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        setActiveGroupId(remainingVisible[nextIndex]?.id || remainingVisible[0].id);
      } else {
        setActiveGroupId('');
      }
    }
    showToast('Группа скрыта');
  };

  const handleRestoreGroup = (groupId: string) => {
    unhideMyDataCategory(groupId);
    if (!activeGroupId || !myDataCategories.some(c => c.id === activeGroupId)) {
      setActiveGroupId(groupId);
    }
    showToast('Группа восстановлена');
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVal.trim() || !activeCategory) return;

    addMyDataRecord({
      title: newTitle.trim(),
      val: newVal.trim(),
      type: 'text',
      typeName: newType,
      status: 'current',
      fromDate: '2026-01-01',
      toDate: 'Бессрочно',
      zone: newZone,
      group: activeCategory.id,
      comment: 'Добавлено вручную',
      tag: 'Верифицировано',
      icon: 'badge'
    });

    setNewTitle('');
    setNewVal('');
    setIsAddRecordOpen(false);
    showToast(`Реквизит «${newTitle}» добавлен в группу ${activeCategory.name}`);
  };

  // Records for active group
  const groupRecords = myDataRecords.filter((r: MyDataRecord) => {
    if (r.group !== activeCategory?.id) return false;
    if (r.zone === 'secret' && !isVeraCryptMounted) return false;
    if (!searchQuery) return true;
    return r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.val.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Global search matches across all groups including hidden
  const allMatchingRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return myDataRecords.filter((r: MyDataRecord) => {
      if (r.zone === 'secret' && !isVeraCryptMounted) return false;
      return r.title.toLowerCase().includes(q) || r.val.toLowerCase().includes(q);
    });
  }, [searchQuery, myDataRecords, isVeraCryptMounted]);

  const handleDeleteGroupClick = (groupId: string) => {
    setDeleteModalGroupId(groupId);
    const alternative = myDataCategories.find((c: MyDataCategory) => c.id !== groupId);
    if (alternative) {
      setTargetMoveGroupId(alternative.id);
    }
  };

  const confirmDeleteGroup = () => {
    if (!deleteModalGroupId) return;
    const recordsInGroup = myDataRecords.filter((r: MyDataRecord) => r.group === deleteModalGroupId);

    if (recordsInGroup.length > 0) {
      if (!targetMoveGroupId) {
        showToast('Выберите целевую группу для переноса записей');
        return;
      }
      // Relocate records
      recordsInGroup.forEach((r: MyDataRecord) => {
        updateMyDataRecord(r.id, { group: targetMoveGroupId });
      });
      showToast(`Перенесено ${recordsInGroup.length} записей в новую группу`);
    }

    deleteMyDataCategory(deleteModalGroupId);
    setDeleteModalGroupId(null);

    if (activeGroupId === deleteModalGroupId) {
      const remaining = myDataCategories.filter((c: MyDataCategory) => c.id !== deleteModalGroupId && !hiddenGroupIds.includes(c.id));
      if (remaining.length > 0) {
        setActiveGroupId(remaining[0].id);
      } else {
        setActiveGroupId('');
      }
    }
    showToast('Группа успешно удалена');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Реестр «Мои данные»</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#006763] border border-teal-200">
              Справочник реквизитов субъекта
            </span>
            <span className="px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-700 border border-amber-200">
              Правило UX-020: Защита непустых групп
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Хранилище паспортных данных, СНИЛС, ИНН, ОМС и адресов. Автоматическая подстановка в формы и сверка с оригиналами.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            disabled={!activeCategory}
            onClick={() => {
              if (!activeCategory) {
                showToast('Сначала создайте или выберите группу');
                return;
              }
              setIsAddRecordOpen(true);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors ${
              activeCategory 
                ? 'bg-[#006763] hover:bg-[#00524f] text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить реквизит
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden min-h-[560px]">
        {/* Left: Groups Navigation */}
        {!isGroupsCollapsed && (
          <div className="w-full md:w-72 xl:w-80 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Группы реквизитов</span>
                <span className="text-xs text-slate-400 font-mono">({visibleCategories.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupsCollapsed(true)}
                title="Свернуть группы реквизитов"
                aria-label="Свернуть панель «Группы реквизитов»"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors shrink-0"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {/* Visible categories list */}
              {visibleCategories.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Нет видимых групп
                </div>
              ) : (
                visibleCategories.map((group: MyDataCategory) => {
                  const isActive = group.id === activeGroupId;
                  const records = myDataRecords.filter((r: MyDataRecord) => r.group === group.id);
                  const visibleRecordsCount = records.filter((r: MyDataRecord) => r.zone !== 'secret' || isVeraCryptMounted).length;

                  return (
                    <div 
                      key={group.id}
                      onClick={() => setActiveGroupId(group.id)}
                      className={`group px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isActive 
                          ? 'bg-teal-50 text-[#006763] font-semibold border border-teal-200 shadow-xs' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <User className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#006763]' : 'text-slate-400'}`} />
                        <span className="truncate">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                          isActive ? 'bg-teal-100/60 text-[#006763]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {visibleRecordsCount}
                        </span>
                        {/* Hide button (Eye icon on hover) */}
                        <button
                          type="button"
                          title="Скрыть группу"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHideGroup(group.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-slate-700 text-slate-400 hover:bg-slate-100 rounded transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete button (UX-020) */}
                        <button
                          type="button"
                          title="Удалить группу"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroupClick(group.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Hidden Groups Section (Collapsible) */}
              {hiddenCategories.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsHiddenSectionExpanded(prev => !prev)}
                    className="w-full px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {isHiddenSectionExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Скрытые группы</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-500">
                      {hiddenCategories.length}
                    </span>
                  </button>

                  {isHiddenSectionExpanded && (
                    <div className="mt-1 space-y-1">
                      {hiddenCategories.map((group: MyDataCategory) => {
                        const isActive = group.id === activeGroupId;
                        const records = myDataRecords.filter((r: MyDataRecord) => r.group === group.id);
                        const visibleRecordsCount = records.filter((r: MyDataRecord) => r.zone !== 'secret' || isVeraCryptMounted).length;

                        return (
                          <div
                            key={group.id}
                            onClick={() => setActiveGroupId(group.id)}
                            className={`group px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all ${
                              isActive 
                                ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200 shadow-xs' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <EyeOff className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                              <span className="truncate">{group.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500">
                                {visibleRecordsCount}
                              </span>
                              <button
                                type="button"
                                title="Восстановить группу"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreGroup(group.id);
                                }}
                                className="p-1 text-slate-400 hover:text-[#006763] hover:bg-teal-50 rounded transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compact Button: + Добавить группу */}
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setNewGroupName('');
                  setNewGroupError(null);
                  setIsAddGroupOpen(true);
                }}
                className="w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-[#006763] text-slate-600 hover:text-[#006763] hover:bg-teal-50/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#006763]" />
                <span>Добавить группу</span>
              </button>
            </div>

            {/* VeraCrypt Status note in sidebar */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-start gap-2">
              {isVeraCryptMounted ? (
                <>
                  <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Том VeraCrypt подключен. Секретные реквизиты (паспорт, СНИЛС) расшифрованы.</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>VeraCrypt отмонтирован. Конфиденциальные реквизиты полностью скрыты (UX-032).</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right: Records Table & Details */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-50/50">
          {!activeCategory ? (
            <div className="flex-1 flex flex-col">
              {isGroupsCollapsed && (
                <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsGroupsCollapsed(false)}
                    title="Развернуть группы реквизитов"
                    aria-label="Развернуть панель «Группы реквизитов»"
                    className="p-1.5 text-slate-600 hover:text-[#006763] hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-md bg-white shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 text-xs font-medium"
                  >
                    <PanelLeftOpen className="w-4 h-4 text-[#006763]" />
                    <span>Группы реквизитов</span>
                  </button>
                </div>
              )}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FolderX className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Нет активной группы реквизитов</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  {hiddenCategories.length > 0 
                    ? 'Все группы реквизитов скрыты. Вы можете восстановить их в разделе «Скрытые группы» слева или создать новую группу.'
                    : 'Создайте первую группу реквизитов, чтобы начать добавлять данные.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNewGroupName('');
                    setNewGroupError(null);
                    setIsAddGroupOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить группу
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Group Header & Search */}
              <div className="bg-white border-b border-slate-200 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {isGroupsCollapsed && (
                    <button
                      type="button"
                      onClick={() => setIsGroupsCollapsed(false)}
                      title="Развернуть группы реквизитов"
                      aria-label="Развернуть панель «Группы реквизитов»"
                      className="p-1.5 text-slate-600 hover:text-[#006763] hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-md bg-white shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 text-xs font-medium"
                    >
                      <PanelLeftOpen className="w-4 h-4 text-[#006763]" />
                      <span className="hidden sm:inline">Группы</span>
                    </button>
                  )}
                  <h2 className="text-base font-semibold text-slate-800 truncate">{activeCategory.name}</h2>
                  {hiddenGroupIds.includes(activeCategory.id) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <EyeOff className="w-3 h-3" /> Скрытая группа
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {groupRecords.length} записей
                  </span>
                </div>

                {/* Search Bar with Global Lookup including Hidden Groups */}
                <div className="relative w-full sm:w-64 lg:w-80 xl:w-96" ref={searchContainerRef}>
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    placeholder="Поиск по реквизитам..."
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}

                  {/* Search Dropdown across all groups including hidden */}
                  {searchQuery.trim().length > 0 && isSearchFocused && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-72 overflow-y-auto text-xs">
                      <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Найдено реквизитов: {allMatchingRecords.length}</span>
                        <span className="text-[10px] text-slate-400">Нажмите для перехода</span>
                      </div>
                      {allMatchingRecords.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          По запросу «{searchQuery}» ничего не найдено
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {allMatchingRecords.map(rec => {
                            const group = myDataCategories.find(c => c.id === rec.group);
                            const isHiddenGroup = hiddenGroupIds.includes(rec.group);
                            return (
                              <div
                                key={rec.id}
                                onMouseDown={() => {
                                  setActiveGroupId(rec.group);
                                  setIsSearchFocused(false);
                                }}
                                className="p-2.5 hover:bg-teal-50/50 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-slate-800 truncate">{rec.title}</div>
                                  <div className="font-mono text-[11px] text-slate-500 truncate">{rec.val}</div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isHiddenGroup && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                      <EyeOff className="w-2.5 h-2.5" /> Скрытая
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                                    {group?.name || 'Группа'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Records Table */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                        <th className="py-2.5 px-4 font-semibold">Наименование поля</th>
                        <th className="py-2.5 px-4 font-semibold">Значение</th>
                        <th className="py-2.5 px-3 font-semibold w-36">Тип данных</th>
                        <th className="py-2.5 px-3 font-semibold w-28">Зона</th>
                        <th className="py-2.5 px-3 font-semibold text-center w-24">Статус</th>
                        <th className="py-2.5 px-4 text-right font-semibold w-24">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400">
                            {searchQuery ? 'По вашему запросу ничего не найдено' : 'В этой группе пока нет реквизитов'}
                          </td>
                        </tr>
                      ) : (
                        groupRecords.map((record: MyDataRecord) => (
                          <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {record.title}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl truncate">
                              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-semibold select-all">
                                {record.val}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                {record.typeName}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {record.zone === 'secret' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3" /> Секретно
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                  Открыто
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {record.status === 'current' ? 'Актуален' : 'Архив'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleCopy(record.id, record.val)}
                                title="Скопировать значение"
                                className="p-1.5 text-slate-400 hover:text-[#006763] hover:bg-teal-50 rounded transition-colors"
                              >
                                {copiedId === record.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Hint Box */}
                <div className="mt-4 p-4 bg-teal-50/60 border border-teal-200/80 rounded-lg flex items-start gap-3 text-xs text-teal-900">
                  <Info className="w-4 h-4 text-[#006763] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Быстрая вставка в форму редактора (SCR-06):</p>
                    <p className="text-slate-600 mt-0.5">
                      При заполнении полей карточки документа в сплит-редакторе вы можете вызывать всплывающий лоток «Мои данные», 
                      чтобы мгновенно подставить актуальный номер паспорта, СНИЛС или ИНН без риска опечаток.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: Add Group */}
      {isAddGroupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Новая группа реквизитов</h3>
              <button 
                type="button"
                onClick={() => {
                  setIsAddGroupOpen(false);
                  setNewGroupError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Название группы <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  autoFocus
                  required
                  placeholder="например, Автомобиль или Налоги"
                  value={newGroupName}
                  onChange={e => {
                    setNewGroupName(e.target.value);
                    if (newGroupError) setNewGroupError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                    newGroupError 
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' 
                      : 'border-slate-300 focus:ring-[#006763]'
                  }`}
                />
                {newGroupError && (
                  <p className="mt-1.5 text-[11px] text-rose-600 font-medium">
                    {newGroupError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddGroupOpen(false);
                    setNewGroupError(null);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium transition-colors"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Record */}
      {isAddRecordOpen && activeCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Новый реквизит в «{activeCategory.name}»</h3>
              <button 
                type="button"
                onClick={() => setIsAddRecordOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateRecord} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Название реквизита</label>
                <input 
                  type="text"
                  required
                  placeholder="например, Номер полиса ДМС или КПП"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006763]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Значение</label>
                <input 
                  type="text"
                  required
                  placeholder="Значение реквизита"
                  value={newVal}
                  onChange={e => setNewVal(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006763]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Тип реквизита</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
                  >
                    <option value="Паспортные данные">Паспортные данные</option>
                    <option value="Цифровой код / СНИЛС">Цифровой код / СНИЛС</option>
                    <option value="Адрес регистрации">Адрес регистрации</option>
                    <option value="Финансовый реквизит">Финансовый реквизит</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Зона хранения</label>
                  <select
                    value={newZone}
                    onChange={e => setNewZone(e.target.value as SecurityZone)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
                  >
                    <option value="open">Открытая (open)</option>
                    <option value="secret">Секретная VeraCrypt</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRecordOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UX-020 Group Deletion Block & Relocation */}
      {deleteModalGroupId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {(() => {
              const group = myDataCategories.find((c: MyDataCategory) => c.id === deleteModalGroupId);
              const recordsInGroup = myDataRecords.filter((r: MyDataRecord) => r.group === deleteModalGroupId);
              const isNonEmpty = recordsInGroup.length > 0;
              const otherGroups = myDataCategories.filter((c: MyDataCategory) => c.id !== deleteModalGroupId);

              return (
                <div>
                  <div className={`p-4 border-b flex items-center gap-3 ${
                    isNonEmpty ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {isNonEmpty ? (
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">
                        {isNonEmpty ? 'Внимание: Группа содержит записи (UX-020)' : 'Удалить пустую группу'}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Группа «{group?.name}»
                      </p>
                    </div>
                  </div>

                  <div className="p-5 text-xs text-slate-700 space-y-4">
                    {isNonEmpty ? (
                      <>
                        <p className="bg-amber-100/60 text-amber-900 p-3 rounded-md border border-amber-200 leading-relaxed">
                          <strong>Требование регламента UX-020:</strong> Прямое удаление непустой группы категорически заблокировано во избежание потери реквизитов. 
                          Перед удалением группы необходимо перенести все ({recordsInGroup.length}) записей в другую группу.
                        </p>

                        <div>
                          <label className="block font-medium text-slate-800 mb-1.5">
                            Куда переместить {recordsInGroup.length} реквизитов?
                          </label>
                          <select
                            value={targetMoveGroupId}
                            onChange={e => setTargetMoveGroupId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006763]"
                          >
                            {otherGroups.map((og: MyDataCategory) => (
                              <option key={og.id} value={og.id}>
                                {og.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <p>
                        Эта группа пуста. Вы можете безопасно удалить ее без потери данных.
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeleteModalGroupId(null)}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteGroup}
                      className={`px-4 py-1.5 font-medium text-white rounded-md transition-colors ${
                        isNonEmpty 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {isNonEmpty ? 'Переместить записи и удалить группу' : 'Удалить пустую группу'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
