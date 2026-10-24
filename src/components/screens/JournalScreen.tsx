import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { StorageZone } from '../../types/vault';

export const JournalScreen: React.FC = () => {
  const {
    documents,
    selectedDocId,
    setSelectedDocId,
    navigateTo,
    isVeraCryptMounted
  } = useVault();

  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<'all' | StorageZone>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'incomplete' | 'unverified' | 'nodate' | 'linked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set([selectedDocId]));

  // Active un-archived documents
  const activeDocs = documents.filter(d => !d.isArchived);

  // Filter logic
  const filteredDocs = activeDocs.filter(doc => {
    // VeraCrypt lock rule: if secret locked, hide secret docs
    if (!isVeraCryptMounted && doc.zone === 'secret') return false;

    // Zone filter
    if (zoneFilter !== 'all' && doc.zone !== zoneFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        doc.name.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.path.toLowerCase().includes(q) ||
        doc.fields.some(f => f.value.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Quick filter
    if (quickFilter === 'incomplete') {
      return doc.completeness.filled < doc.completeness.total;
    }
    if (quickFilter === 'unverified') {
      return doc.verification.verified < doc.verification.total;
    }
    if (quickFilter === 'nodate') {
      return doc.date.toLowerCase().includes('неизвестно') || doc.date.toLowerCase().includes('неизвестна');
    }
    if (quickFilter === 'linked') {
      return doc.relations.length > 0;
    }

    return true;
  });

  const activeDoc = documents.find(d => d.id === selectedDocId) || filteredDocs[0];

  const handleRowClick = (id: string) => {
    setSelectedDocId(id);
    setSelectedRowIds(new Set([id]));
  };

  const handleRowCheck = (id: string, checked: boolean) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(new Set(filteredDocs.map(d => d.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Screen Header */}
      <div className="flex flex-col gap-2.5 mb-3 bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container-highest shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold tracking-tight text-on-surface">Журнал документов</h1>
              <span className="font-code text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-secondary font-semibold">SCR-01</span>
            </div>
            <p className="text-[12px] text-secondary mt-0.5">
              Основной каталог архивных записей и документов долговременного хранения
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-surface-container rounded border border-surface-container-highest">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">table_rows</span>
                <span>Таблица</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">view_agenda</span>
                <span>Список</span>
              </button>
              <button
                onClick={() => setIsInspectorOpen(prev => !prev)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-all cursor-pointer ${
                  isInspectorOpen
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">dock_to_left</span>
                <span>Инспектор</span>
              </button>
            </div>

            <button
              onClick={() => setIsColModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] transition-colors border border-surface-container-highest cursor-pointer"
              title="Настройка столбцов таблицы"
            >
              <span className="material-symbols-outlined text-[15px]">view_column</span>
              <span>Столбцы (F12)</span>
            </button>
          </div>
        </div>

        {/* Search & Zone Filter Bar */}
        <div className="flex items-center justify-between gap-3 p-1.5 rounded bg-surface-container-low flex-wrap border border-surface-container-highest">
          <div className="relative flex items-center min-w-[260px] flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-2 text-[15px] text-outline pointer-events-none">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, реквизитам, тексту (Ctrl+F)..."
              className="w-full h-7 pl-7 pr-7 rounded bg-surface-container-lowest text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-outline border border-surface-container-highest"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[13px]">cancel</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-secondary font-medium px-1">Зона:</span>
            <div className="flex items-center p-0.5 bg-surface-container rounded border border-surface-container-highest">
              <button
                onClick={() => setZoneFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  zoneFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Все зоны
              </button>
              <button
                onClick={() => setZoneFilter('open')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  zoneFilter === 'open'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Открытая
              </button>
              <button
                onClick={() => setZoneFilter('secret')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  zoneFilter === 'secret'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Секретная
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-on-surface-variant font-code text-[11px]">
            <span>Записей:</span>
            <span className="font-bold text-primary">{filteredDocs.length}</span>
            <span className="text-outline">/</span>
            <span>{activeDocs.length}</span>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
          <button
            onClick={() => setQuickFilter('all')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              quickFilter === 'all'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>Все</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-lowest text-primary font-code text-[10px]">
              {activeDocs.length}
            </span>
          </button>

          <button
            onClick={() => setQuickFilter('incomplete')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              quickFilter === 'incomplete'
                ? 'bg-error-container text-on-error-container font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[13px] text-error">error</span>
            <span>Требует заполнения</span>
            <span className="px-1.5 py-0.2 rounded-full bg-error text-on-error font-code text-[10px]">
              {activeDocs.filter(d => d.completeness.filled < d.completeness.total).length}
            </span>
          </button>

          <button
            onClick={() => setQuickFilter('unverified')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              quickFilter === 'unverified'
                ? 'bg-secondary-container text-on-secondary-container font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[13px] text-secondary">visibility_off</span>
            <span>Не сверен / Частично</span>
            <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-code text-[10px]">
              {activeDocs.filter(d => d.verification.verified < d.verification.total).length}
            </span>
          </button>

          <button
            onClick={() => setQuickFilter('nodate')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              quickFilter === 'nodate'
                ? 'bg-surface-variant text-on-surface font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>Дата неизвестна</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container-lowest text-secondary font-code text-[10px]">1</span>
          </button>

          <button
            onClick={() => setQuickFilter('linked')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              quickFilter === 'linked'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">link</span>
            <span>Есть связи</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split (Table / List + Inspector) */}
      <div className="flex gap-3 items-start w-full relative">
        {/* Table / List Container */}
        <div className="flex-1 min-w-0 bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden flex flex-col">
          {filteredDocs.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
              <div className="font-bold text-[14px] text-on-surface">Совпадений не найдено</div>
              <p className="text-[12px] text-secondary max-w-sm">
                По текущим параметрам поиска или фильтрации записи отсутствуют. Сбросьте фильтры для возврата к каталогу.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setZoneFilter('all');
                  setQuickFilter('all');
                }}
                className="mt-2 px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] rounded cursor-pointer transition-colors"
              >
                Сбросить условия поиска
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-surface-container text-secondary text-[11px] font-semibold uppercase tracking-wider h-8 border-b border-surface-container-highest">
                    <th className="w-9 px-2 text-center">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded accent-primary cursor-pointer align-middle"
                        checked={selectedRowIds.size === filteredDocs.length && filteredDocs.length > 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-2.5 whitespace-nowrap">Зона</th>
                    <th className="px-2.5 whitespace-nowrap">Реестр / Документ</th>
                    <th className="px-2.5 whitespace-nowrap">Категория</th>
                    <th className="px-2.5 whitespace-nowrap">Дата</th>
                    <th className="px-2.5 whitespace-nowrap">Полнота</th>
                    <th className="px-2.5 whitespace-nowrap">Сверка со сканом</th>
                    <th className="px-2.5 whitespace-nowrap">Связи</th>
                    <th className="px-2.5 whitespace-nowrap">Раздел архива</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high text-[12px] text-on-surface">
                  {filteredDocs.map(doc => {
                    const isSelected = doc.id === selectedDocId;
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => handleRowClick(doc.id)}
                        className={`h-9 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary-fixed/25 font-medium'
                            : 'hover:bg-surface-container-high/40 bg-surface-container-lowest'
                        }`}
                      >
                        <td className="w-9 px-2 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.has(doc.id)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRowCheck(doc.id, e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-primary cursor-pointer align-middle"
                          />
                        </td>
                        <td className="px-2.5 whitespace-nowrap">
                          {doc.zone === 'secret' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-semibold">
                              <span className="material-symbols-outlined text-[11px] text-error">lock</span>
                              Secret
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              Open
                            </span>
                          )}
                        </td>
                        <td className="px-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-code font-bold text-primary text-[11px]">{doc.id}</span>
                            <span className="text-outline">·</span>
                            <span className="font-medium text-on-surface truncate max-w-xs">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-2.5 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px]">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-2.5 font-code text-[11px] whitespace-nowrap text-secondary">
                          {doc.date}
                        </td>
                        <td className="px-2.5 whitespace-nowrap">
                          {doc.completeness.filled < doc.completeness.total ? (
                            <span className="inline-flex items-center gap-1 text-on-secondary-fixed-variant bg-secondary-fixed/50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              <span className="material-symbols-outlined text-[12px] text-secondary">warning</span>
                              {doc.completeness.filled} из {doc.completeness.total}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              {doc.completeness.filled}/{doc.completeness.total}
                            </span>
                          )}
                        </td>
                        <td className="px-2.5 whitespace-nowrap">
                          {doc.verification.verified < doc.verification.total ? (
                            <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded text-[10px]">
                              <span className="material-symbols-outlined text-[12px] text-primary">visibility</span>
                              {doc.verification.verified} из {doc.verification.total}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded text-[10px]">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              {doc.verification.verified}/{doc.verification.total}
                            </span>
                          )}
                        </td>
                        <td className="px-2.5 whitespace-nowrap">
                          {doc.relations.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-primary text-[10px]">
                              <span className="material-symbols-outlined text-[12px]">link</span>
                              {doc.relations[0].name}
                            </span>
                          ) : (
                            <span className="text-outline font-code text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-2.5 font-code text-[11px] text-secondary whitespace-nowrap truncate max-w-[140px]">
                          {doc.path}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* 2-Line List View */
            <div className="flex flex-col divide-y divide-surface-container-high overflow-y-auto">
              {filteredDocs.map(doc => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleRowClick(doc.id)}
                    className={`p-2.5 hover:bg-surface-container-high/40 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-primary-fixed/20' : 'bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                        {doc.zone === 'secret' ? 'lock' : 'picture_as_pdf'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-code font-bold text-primary text-[12px]">{doc.id}</span>
                          <span className="font-semibold text-[13px] text-on-surface truncate">{doc.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">
                            {doc.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-secondary text-[11px] mt-0.5 flex-wrap">
                          <span>Дата: {doc.date}</span>
                          <span>•</span>
                          <span className={doc.completeness.filled < doc.completeness.total ? 'text-error font-medium' : 'text-primary'}>
                            Заполнено: {doc.completeness.filled} из {doc.completeness.total}
                          </span>
                          <span>•</span>
                          <span className="text-primary font-medium">Сверено: {doc.verification.verified} из {doc.verification.total}</span>
                          <span>•</span>
                          <span>{doc.path}</span>
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Collapsible Inspector Panel (Right) */}
        {isInspectorOpen && activeDoc && (
          <aside className="w-[300px] shrink-0 bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-3 flex flex-col gap-3 sticky top-12">
            <div className="flex items-center justify-between pb-1.5 border-b border-surface-container-highest">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[17px]">info</span>
                <span className="font-semibold text-[13px]">Инспектор документа</span>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="w-5 h-5 rounded flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>

            {/* Document Thumbnail Card */}
            <div className="flex flex-col gap-1.5">
              <div className="relative w-full h-32 rounded bg-surface-container-low overflow-hidden flex flex-col items-center justify-center border border-dashed border-outline-variant">
                {activeDoc.previewUrl ? (
                  <img
                    src={activeDoc.previewUrl}
                    alt={activeDoc.name}
                    className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-outline">
                    <span className="material-symbols-outlined text-[28px]">description</span>
                    <span className="text-[11px]">PDF Документ</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-code text-[9px] backdrop-blur-xs">
                  {activeDoc.fileSize} • {activeDoc.pageCount} стр.
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-secondary">
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  SHA-256 проверен
                </span>
                <span className="font-code text-[10px] text-outline">
                  {activeDoc.sha256.substring(0, 8)}...
                </span>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="flex flex-col gap-1 bg-surface-container-low p-2 rounded text-[11px] border border-surface-container-highest">
              <div className="flex justify-between items-center">
                <span className="text-secondary">ID:</span>
                <span className="font-code font-bold text-primary">{activeDoc.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Категория:</span>
                <span className="font-semibold text-on-surface">{activeDoc.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Дата:</span>
                <span className="font-code text-on-surface">{activeDoc.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Зона:</span>
                <span className={`font-semibold ${activeDoc.zone === 'secret' ? 'text-error' : 'text-primary'}`}>
                  {activeDoc.zone === 'secret' ? 'Secret (VeraCrypt)' : 'Open (Открытая)'}
                </span>
              </div>
            </div>

            {/* Completeness & Verification Progress */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-secondary">Полнота реквизитов:</span>
                  <span className="font-code font-bold text-secondary">
                    {activeDoc.completeness.filled} из {activeDoc.completeness.total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${(activeDoc.completeness.filled / activeDoc.completeness.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-secondary">Сверка со сканом:</span>
                  <span className="font-code font-bold text-primary">
                    {activeDoc.verification.verified} из {activeDoc.verification.total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(activeDoc.verification.verified / activeDoc.verification.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Relations */}
            {activeDoc.relations.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
                  Связанные документы
                </span>
                <div className="p-1.5 rounded bg-surface-container flex items-center justify-between text-[11px] border border-surface-container-highest">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[14px] text-primary">link</span>
                    <span className="font-semibold text-primary truncate">
                      {activeDoc.relations[0].name}
                    </span>
                  </div>
                  <span className="font-code text-[9px] text-outline px-1 rounded bg-surface-container-lowest">
                    {activeDoc.relations[0].type}
                  </span>
                </div>
              </div>
            )}

            {/* Transcript preview */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">
                  Текстовая выписка
                </span>
                <span className="font-code text-[9px] text-outline">UTF-8</span>
              </div>
              <div className="p-1.5 rounded bg-surface-container-lowest border border-surface-container-highest font-code text-[11px] text-on-surface-variant max-h-16 overflow-y-auto leading-relaxed">
                {activeDoc.transcriptExcerpt}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      {activeDoc && (
        <div className="fixed bottom-0 left-[210px] right-0 z-30 h-10 bg-surface-container-highest border-t border-surface-container-highest px-4 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[12px] text-secondary">Выбран документ:</span>
            <span className="text-[12px] font-bold text-on-surface truncate">
              {activeDoc.id} — {activeDoc.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => navigateTo('kartochka', { docId: activeDoc.id })}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-on-primary text-[11px] font-semibold hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
            >
              <kbd className="font-code text-[9px] bg-on-primary/20 px-1 rounded">Enter</kbd>
              <span>Карточка (SCR-11)</span>
            </button>

            <button
              onClick={() => navigateTo('redaktor', { docId: activeDoc.id })}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-[11px] hover:bg-surface-container transition-colors border border-surface-container-highest cursor-pointer"
            >
              <kbd className="font-code text-[9px] bg-surface-container px-1 rounded text-secondary">F4</kbd>
              <span>Редактор (SCR-06)</span>
            </button>

            <button
              onClick={() => navigateTo('sverka', { docId: activeDoc.id })}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-[11px] hover:bg-surface-container transition-colors border border-surface-container-highest cursor-pointer"
            >
              <kbd className="font-code text-[9px] bg-surface-container px-1 rounded text-secondary">F5</kbd>
              <span>Сверка (SCR-07)</span>
            </button>

            <button
              onClick={() => setIsInspectorOpen(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface text-[11px] hover:bg-surface-container transition-colors border border-surface-container-highest cursor-pointer"
            >
              <kbd className="font-code text-[9px] bg-surface-container px-1 rounded text-secondary">Пробел</kbd>
              <span>Инспектор</span>
            </button>
          </div>
        </div>
      )}

      {/* Columns Modal */}
      {isColModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsColModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded bg-surface-container-lowest shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-[13px]">
                <span className="material-symbols-outlined text-primary text-[18px]">view_column</span>
                <span>Настройка столбцов таблицы</span>
              </div>
              <button onClick={() => setIsColModalOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 text-[12px] text-on-surface max-h-60 overflow-y-auto">
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" checked disabled className="accent-primary rounded" />
                <span className="text-outline">Реестр / Название (Обязательно)</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Зона хранения</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Категория</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Дата документа</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Полнота данных</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Сверка со сканом</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Связи</span>
              </label>
              <label className="flex items-center gap-2 p-1 rounded hover:bg-surface-container cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary rounded" />
                <span>Раздел архива</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsColModalOpen(false)}
                className="px-3 py-1 rounded bg-primary text-on-primary text-[11px] font-semibold hover:bg-primary-container"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
