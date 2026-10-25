/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useVault } from '../../context/VaultContext';
import { ArchiveDocument } from '../../types';

export const JournalView: React.FC = () => {
  const {
    documents,
    activeDocId,
    setActiveDocId,
    setCurrentScreen,
    isVeraCryptMounted,
    activeScenario,
    showToast,
  } = useVault();

  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<'all' | 'open' | 'secret'>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['PV-0042']));
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);

  // Column visibility state
  const [colVisibility, setColVisibility] = useState({
    zone: true,
    category: true,
    date: true,
    completeness: true,
    verification: true,
    relations: true,
    transcript: true,
    path: true,
  });

  // Effective scenario adjustments
  const isScenarioEmpty = activeScenario === 'empty';
  const isScenarioNoSearch = activeScenario === 'nosearch';
  const isScenarioSecretLocked = activeScenario === 'secret_locked' || !isVeraCryptMounted;
  const isScenarioList = activeScenario === 'list' || viewMode === 'list';

  // Filter documents
  const filteredDocs = useMemo(() => {
    if (isScenarioEmpty) return [];
    if (isScenarioNoSearch) return [];

    let list = documents.filter((d) => d.status === 'active');

    // VeraCrypt lock
    if (isScenarioSecretLocked) {
      list = list.filter((d) => d.zone !== 'secret');
    } else if (zoneFilter === 'open') {
      list = list.filter((d) => d.zone === 'open');
    } else if (zoneFilter === 'secret') {
      list = list.filter((d) => d.zone === 'secret');
    }

    // Quick filters
    if (quickFilter === 'incomplete') {
      list = list.filter((d) => d.completeness.filled < d.completeness.total);
    } else if (quickFilter === 'unverified') {
      list = list.filter((d) => d.verification.verified < d.verification.total);
    } else if (quickFilter === 'nodate') {
      list = list.filter((d) => d.isDateUnknown);
    } else if (quickFilter === 'linked') {
      list = list.filter((d) => d.relations && d.relations.length > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.transcriptExcerpt.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    documents,
    isScenarioEmpty,
    isScenarioNoSearch,
    isScenarioSecretLocked,
    zoneFilter,
    quickFilter,
    searchQuery,
  ]);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || filteredDocs[0] || documents[0];
  }, [documents, activeDocId, filteredDocs]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Header / Title block */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-[18px] tracking-tight text-[#111d23]">
                Журнал документов
              </h1>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[#3e4948]">
                SCR-01
              </span>
            </div>
            <p className="text-[12px] text-[#536166]">
              Основной каталог архивных записей и документов долговременного хранения
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Secret Zone Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e3f0f8] text-[11px] font-medium border border-[#d7e4ec]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isScenarioSecretLocked ? 'bg-[#ba1a1a]' : 'bg-[#006763]'
                }`}
              />
              <span>
                {isScenarioSecretLocked
                  ? 'Секретная зона: Заблокирована'
                  : 'Секретная зона: Подключена'}
              </span>
            </div>

            {/* View Switchers */}
            <div className="flex items-center p-0.5 bg-[#e3f0f8] rounded border border-[#d7e4ec]">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  !isScenarioList
                    ? 'bg-white text-[#006763] shadow-xs'
                    : 'text-[#3e4948] hover:text-[#111d23]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">table_rows</span>
                <span>Таблица</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  isScenarioList
                    ? 'bg-white text-[#006763] shadow-xs'
                    : 'text-[#3e4948] hover:text-[#111d23]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">view_agenda</span>
                <span>Список</span>
              </button>
              <button
                onClick={() => setIsInspectorOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-all ${
                  isInspectorOpen ? 'text-[#006763] font-semibold' : 'text-[#536166]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">dock_to_left</span>
                <span>Инспектор</span>
              </button>
            </div>

            <button
              onClick={() => setIsColumnsModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] text-[11px] transition-colors border border-[#d7e4ec]"
              title="Настроить столбцы"
            >
              <span className="material-symbols-outlined text-[14px]">view_column</span>
              <span>Столбцы (F12)</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center justify-between gap-3 p-1.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex-wrap">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[280px] flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-2 text-[15px] text-[#6e7978] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, реквизитам, тексту (Ctrl+F)..."
              className="w-full h-7 pl-7 pr-6 rounded bg-white text-[#111d23] text-[12px] border border-[#d7e4ec] focus:outline-none focus:border-[#006763] placeholder-[#6e7978]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-[#6e7978] hover:text-[#111d23]"
              >
                <span className="material-symbols-outlined text-[13px]">cancel</span>
              </button>
            )}
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-[#6e7978] px-1 font-medium">Зона:</span>
            <div className="flex items-center p-0.5 bg-[#e3f0f8] rounded border border-[#d7e4ec]">
              <button
                onClick={() => setZoneFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  zoneFilter === 'all' ? 'bg-white text-[#006763] font-semibold shadow-xs' : 'text-[#3e4948]'
                }`}
              >
                Все зоны
              </button>
              <button
                onClick={() => setZoneFilter('open')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  zoneFilter === 'open' ? 'bg-white text-[#006763] font-semibold shadow-xs' : 'text-[#3e4948]'
                }`}
              >
                Открытая
              </button>
              <button
                onClick={() => setZoneFilter('secret')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  zoneFilter === 'secret' ? 'bg-white text-[#006763] font-semibold shadow-xs' : 'text-[#3e4948]'
                }`}
              >
                Секретная
              </button>
            </div>
          </div>

          {/* Total Counts */}
          <div className="flex items-center gap-1 font-mono text-[11px] text-[#536166]">
            <span>Записей:</span>
            <span className="font-semibold text-[#006763]">{filteredDocs.length}</span>
            <span className="text-[#6e7978]">/</span>
            <span>{documents.filter((d) => d.status === 'active').length}</span>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          <button
            onClick={() => setQuickFilter('all')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              quickFilter === 'all'
                ? 'bg-[#12827c] text-white font-semibold'
                : 'bg-[#e3f0f8] text-[#3e4948] hover:bg-[#ddeaf2]'
            }`}
          >
            <span>Все</span>
            <span className="px-1 rounded-full bg-white/30 text-current text-[10px]">
              {documents.filter((d) => d.status === 'active').length}
            </span>
          </button>
          <button
            onClick={() => setQuickFilter('incomplete')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              quickFilter === 'incomplete'
                ? 'bg-[#ba1a1a] text-white font-semibold'
                : 'bg-[#e3f0f8] text-[#3e4948] hover:bg-[#ddeaf2]'
            }`}
          >
            <span className="material-symbols-outlined text-[13px] text-[#ba1a1a]">error</span>
            <span>Требует заполнения</span>
            <span className="px-1.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">1</span>
          </button>
          <button
            onClick={() => setQuickFilter('unverified')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              quickFilter === 'unverified'
                ? 'bg-[#536166] text-white font-semibold'
                : 'bg-[#e3f0f8] text-[#3e4948] hover:bg-[#ddeaf2]'
            }`}
          >
            <span className="material-symbols-outlined text-[13px] text-[#536166]">visibility_off</span>
            <span>Не сверен / Частично</span>
            <span className="px-1.5 rounded-full bg-[#d6e5ec] text-[#59676c] text-[10px] font-bold">2</span>
          </button>
          <button
            onClick={() => setQuickFilter('nodate')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              quickFilter === 'nodate'
                ? 'bg-[#536166] text-white font-semibold'
                : 'bg-[#e3f0f8] text-[#3e4948] hover:bg-[#ddeaf2]'
            }`}
          >
            <span>Дата неизвестна</span>
            <span className="px-1 rounded-full bg-[#d7e4ec] text-[#3e4948] text-[10px]">1</span>
          </button>
          <button
            onClick={() => setQuickFilter('linked')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              quickFilter === 'linked'
                ? 'bg-[#006763] text-white font-semibold'
                : 'bg-[#e3f0f8] text-[#3e4948] hover:bg-[#ddeaf2]'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">link</span>
            <span>Есть связи</span>
          </button>
        </div>
      </div>

      {/* Secret Vault Disconnected Alert Banner */}
      {isScenarioSecretLocked && (
        <div className="p-2.5 rounded bg-[#ffdad6] border border-[#ba1a1a]/30 flex items-center justify-between text-[12px] text-[#93000a]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <div>
              <strong>Секретная зона закрыта:</strong> Записи защищённой категории временно скрыты. Доступен просмотр открытого архива Open (1,838 документов).
            </div>
          </div>
          <button
            onClick={() => showToast('Ввод пароля тома VeraCrypt...')}
            className="px-3 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-semibold hover:bg-[#93000a] transition-colors"
          >
            Открыть доступ
          </button>
        </div>
      )}

      {/* Main Workspace Split: Data Table / List + Side Inspector */}
      <div className="flex gap-3 items-start w-full relative">
        {/* Table / List View Container */}
        <div className="flex-1 min-w-0 bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden flex flex-col">
          {/* Empty / No-Search States */}
          {filteredDocs.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#e3f0f8] flex items-center justify-center text-[#6e7978]">
                <span className="material-symbols-outlined text-[26px]">
                  {isScenarioNoSearch ? 'search_off' : 'inventory_2'}
                </span>
              </div>
              <h3 className="font-semibold text-[15px] text-[#111d23]">
                {isScenarioNoSearch ? 'Ничего не найдено' : 'В Журнале пока нет документов'}
              </h3>
              <p className="text-[12px] text-[#536166] max-w-sm">
                {isScenarioNoSearch
                  ? 'По заданным параметрам фильтрации совпадений нет. Проверьте условия поиска или опечатки.'
                  : 'Архив пуст. Вы можете добавить первый документ через раздел «Входящие» или импортировать файл.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setQuickFilter('all');
                  setZoneFilter('all');
                }}
                className="mt-2 px-3 py-1.5 rounded bg-[#006763] text-white text-[12px] font-semibold hover:bg-[#12827c] transition-colors"
              >
                {isScenarioNoSearch ? 'Сбросить фильтры' : 'Вернуть тестовые записи'}
              </button>
            </div>
          ) : !isScenarioList ? (
            /* Tabular Grid View */
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse select-none text-[12px]">
                <thead>
                  <tr className="bg-[#e9f6fd] text-[#536166] font-semibold text-[11px] uppercase tracking-wider h-8 border-b border-[#d7e4ec]">
                    <th className="w-8 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredDocs.length && filteredDocs.length > 0}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#006763] cursor-pointer"
                      />
                    </th>
                    {colVisibility.zone && <th className="px-2 whitespace-nowrap">Зона</th>}
                    <th className="px-2 whitespace-nowrap">Реестр / Документ</th>
                    {colVisibility.category && <th className="px-2 whitespace-nowrap">Категория</th>}
                    {colVisibility.date && <th className="px-2 whitespace-nowrap">Дата</th>}
                    {colVisibility.completeness && <th className="px-2 whitespace-nowrap">Полнота</th>}
                    {colVisibility.verification && <th className="px-2 whitespace-nowrap">Сверка</th>}
                    {colVisibility.relations && <th className="px-2 whitespace-nowrap">Связи</th>}
                    {colVisibility.transcript && <th className="px-2 whitespace-nowrap">Выписка</th>}
                    {colVisibility.path && <th className="px-2 whitespace-nowrap">Раздел архива</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7e4ec] text-[#111d23]">
                  {filteredDocs.map((doc) => {
                    const isSelected = activeDoc?.id === doc.id;
                    const isChecked = selectedIds.has(doc.id);
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setActiveDocId(doc.id)}
                        className={`cursor-pointer transition-colors h-9 ${
                          isSelected
                            ? 'bg-[#95f3eb]/25 hover:bg-[#95f3eb]/35'
                            : 'hover:bg-[#e9f6fd]/60'
                        }`}
                      >
                        <td
                          className="w-8 px-2 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => toggleSelectRow(doc.id, e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-[#006763] cursor-pointer"
                          />
                        </td>
                        {colVisibility.zone && (
                          <td className="px-2 whitespace-nowrap">
                            {doc.zone === 'secret' ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#515e5e] text-white font-mono text-[10px] font-semibold">
                                <span className="material-symbols-outlined text-[11px]">lock</span>
                                Secret
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ddeaf2] text-[#3e4948] text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006763]" />
                                Open
                              </span>
                            )}
                          </td>
                        )}
                        <td className="px-2 py-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-[#006763]">
                              {doc.id}
                            </span>
                            <span className="text-[#6e7978]">·</span>
                            <span className="font-medium text-[#111d23] truncate max-w-xs" title={doc.title}>
                              {doc.title}
                            </span>
                          </div>
                        </td>
                        {colVisibility.category && (
                          <td className="px-2 whitespace-nowrap text-[#536166]">
                            <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[11px]">
                              {doc.category}
                            </span>
                          </td>
                        )}
                        {colVisibility.date && (
                          <td className="px-2 font-mono text-[11px] text-[#3e4948] whitespace-nowrap">
                            {doc.isDateUnknown ? (
                              <span className="italic text-[#6e7978]">Неизвестна</span>
                            ) : (
                              doc.date
                            )}
                          </td>
                        )}
                        {colVisibility.completeness && (
                          <td className="px-2 whitespace-nowrap">
                            {doc.completeness.filled === doc.completeness.total ? (
                              <span className="inline-flex items-center gap-1 text-[#006763] bg-[#95f3eb]/40 px-1.5 py-0.5 rounded text-[11px] font-medium">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                {doc.completeness.filled}/{doc.completeness.total}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#e68a00] bg-[#fff3e0] px-1.5 py-0.5 rounded text-[11px] font-medium">
                                <span className="material-symbols-outlined text-[13px]">warning</span>
                                {doc.completeness.filled}/{doc.completeness.total}
                              </span>
                            )}
                          </td>
                        )}
                        {colVisibility.verification && (
                          <td className="px-2 whitespace-nowrap">
                            {doc.verification.verified === doc.verification.total ? (
                              <span className="inline-flex items-center gap-1 text-[#006763] bg-[#95f3eb]/40 px-1.5 py-0.5 rounded text-[11px] font-medium">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                {doc.verification.verified}/{doc.verification.total}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#536166] bg-[#e3f0f8] px-1.5 py-0.5 rounded text-[11px]">
                                <span className="material-symbols-outlined text-[13px]">visibility</span>
                                {doc.verification.verified}/{doc.verification.total}
                              </span>
                            )}
                          </td>
                        )}
                        {colVisibility.relations && (
                          <td className="px-2 whitespace-nowrap text-[#006763]">
                            {doc.relations.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <span className="material-symbols-outlined text-[13px]">link</span>
                                {doc.relations[0].name.slice(0, 18)}...
                              </span>
                            ) : (
                              <span className="text-[#6e7978] font-mono">—</span>
                            )}
                          </td>
                        )}
                        {colVisibility.transcript && (
                          <td className="px-2 whitespace-nowrap text-[#536166]">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[10px] font-mono">
                              <span className="material-symbols-outlined text-[12px]">description</span>
                              Текст
                            </span>
                          </td>
                        )}
                        {colVisibility.path && (
                          <td className="px-2 font-mono text-[10px] text-[#536166] whitespace-nowrap truncate max-w-[120px]">
                            {doc.archivePath.split('→')[1] || doc.category}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Two-Line List View */
            <div className="flex flex-col divide-y divide-[#d7e4ec]">
              {filteredDocs.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-[#95f3eb]/20' : 'hover:bg-[#e9f6fd]/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[#006763] text-[20px] mt-0.5">
                        picture_as_pdf
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-[#006763]">
                            {doc.id}
                          </span>
                          <span className="font-semibold text-[13px] text-[#111d23] truncate">
                            {doc.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[#3e4948] text-[10px]">
                            {doc.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[#536166] text-[11px] mt-0.5 flex-wrap">
                          <span>Дата: {doc.date}</span>
                          <span>•</span>
                          <span
                            className={
                              doc.completeness.filled < doc.completeness.total
                                ? 'text-[#e68a00] font-medium'
                                : 'text-[#006763]'
                            }
                          >
                            Заполнено: {doc.completeness.filled} из {doc.completeness.total}
                          </span>
                          <span>•</span>
                          <span>Сверено: {doc.verification.verified} из {doc.verification.total}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#6e7978]">{doc.archivePath}</span>
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#6e7978]">chevron_right</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Inspector Drawer */}
        {isInspectorOpen && activeDoc && (
          <aside className="w-80 shrink-0 bg-white rounded border border-[#d7e4ec] shadow-xs p-3 flex flex-col gap-3 sticky top-12">
            <div className="flex items-center justify-between pb-2 border-b border-[#d7e4ec]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006763] text-[18px]">info</span>
                <span className="font-semibold text-[13px] text-[#111d23]">Инспектор документа</span>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-[#6e7978] hover:text-[#111d23] hover:bg-[#e3f0f8]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Document Thumbnail Mockup */}
            <div className="flex flex-col gap-1.5">
              <div className="relative w-full h-32 rounded bg-[#e9f6fd] overflow-hidden flex flex-col items-center justify-center border border-dashed border-[#bdc9c7]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmOn8shvMmaW46wp0bmnS-3fYfHr0meVhOoNLPCwK2JAQfn0gDJLzdNrr29DElHoZZEDLourYrLoBQSWIIbsxyS7xsZOp22YwwvL2lbY7v7B487mzWC80ar11hYg5HYUixbvsnuSZcqrQCqHrQiS5qMxGRdDEq4kZAcLrG4G7j_MUWA1DcUtuCz7A8R_VDgjRMiymOWLXnwF_tq6hYCiGP8vokNhJ8aFOSUK2l_1MXfNeBqPP-wU9NvA"
                  alt="Скан документа"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] backdrop-blur-xs">
                  PDF • {activeDoc.fileSize} • {activeDoc.pagesCount} стр.
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#536166]">
                <span className="flex items-center gap-1 text-[#006763]">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  SHA-256 проверен
                </span>
                <span className="font-mono text-[10px] text-[#6e7978]">
                  {activeDoc.sha256.slice(0, 8)}...{activeDoc.sha256.slice(-4)}
                </span>
              </div>
            </div>

            {/* Attributes snapshot */}
            <div className="flex flex-col gap-1.5 bg-[#e9f6fd] p-2.5 rounded text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-[#6e7978]">Реестровый ID:</span>
                <span className="font-mono font-bold text-[#006763]">{activeDoc.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6e7978]">Категория:</span>
                <span className="font-semibold text-[#111d23]">{activeDoc.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6e7978]">Дата документа:</span>
                <span className="font-mono">{activeDoc.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6e7978]">Зона хранения:</span>
                <span className="font-semibold text-[#006763]">
                  {activeDoc.zone === 'secret' ? 'Secret (VeraCrypt)' : 'Открытая (Open)'}
                </span>
              </div>
            </div>

            {/* Health & Verification meters */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#536166]">Полнота реквизитов:</span>
                  <span className="font-mono font-bold text-[#536166]">
                    Заполнено {activeDoc.completeness.filled} из {activeDoc.completeness.total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#e3f0f8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006763]"
                    style={{
                      width: `${(activeDoc.completeness.filled / activeDoc.completeness.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#536166]">Сверка со сканом:</span>
                  <span className="font-mono font-bold text-[#006763]">
                    Сверено {activeDoc.verification.verified} из {activeDoc.verification.total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#e3f0f8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006763]"
                    style={{
                      width: `${(activeDoc.verification.verified / activeDoc.verification.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Relations */}
            {activeDoc.relations.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#6e7978] uppercase font-bold tracking-wider">
                  Связанные документы
                </span>
                <div className="p-1.5 rounded bg-[#e3f0f8] flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate text-[#006763]">
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    <span className="font-medium truncate">{activeDoc.relations[0].name}</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#6e7978] px-1 bg-white rounded">
                    {activeDoc.relations[0].type}
                  </span>
                </div>
              </div>
            )}

            {/* Text Excerpt */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#6e7978] uppercase font-bold tracking-wider">
                  Текстовая выписка
                </span>
                <span className="font-mono text-[10px] text-[#6e7978]">UTF-8</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#d7e4ec] font-mono text-[11px] text-[#3e4948] max-h-20 overflow-y-auto leading-relaxed select-text">
                {activeDoc.transcriptExcerpt}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Sticky Bottom Actions Strip */}
      {activeDoc && (
        <div className="sticky bottom-0 left-0 right-0 z-30 mt-2 p-2.5 rounded bg-[#ddeaf2] border border-[#d7e4ec] shadow-sm flex items-center justify-between gap-3 flex-wrap text-[12px]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006763]" />
            <span className="text-[#6e7978]">Выбран документ:</span>
            <span className="font-semibold text-[#111d23] truncate max-w-sm">
              {activeDoc.id} — {activeDoc.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentScreen('SCR-11')}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#006763] text-white hover:bg-[#12827c] transition-colors shadow-xs font-semibold text-[11px]"
            >
              <kbd className="font-mono text-[9px] bg-white/20 px-1 rounded">Enter</kbd>
              <span>Карточка (SCR-11)</span>
            </button>
            <button
              onClick={() => setCurrentScreen('SCR-06')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-[#111d23] hover:bg-[#e9f6fd] transition-colors text-[11px] border border-[#d7e4ec]"
            >
              <kbd className="font-mono text-[9px] bg-[#e3f0f8] px-1 rounded text-[#536166]">F4</kbd>
              <span>Редактор (SCR-06)</span>
            </button>
            <button
              onClick={() => setCurrentScreen('SCR-07')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-[#111d23] hover:bg-[#e9f6fd] transition-colors text-[11px] border border-[#d7e4ec]"
            >
              <kbd className="font-mono text-[9px] bg-[#e3f0f8] px-1 rounded text-[#536166]">F5</kbd>
              <span>Сверка со сканом (SCR-07)</span>
            </button>
            <button
              onClick={() => setIsInspectorOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-[#111d23] hover:bg-[#e9f6fd] transition-colors text-[11px] border border-[#d7e4ec]"
            >
              <kbd className="font-mono text-[9px] bg-[#e3f0f8] px-1 rounded text-[#536166]">Space</kbd>
              <span>Инспектор</span>
            </button>
          </div>
        </div>
      )}

      {/* Columns configuration modal */}
      {isColumnsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl p-4 flex flex-col gap-3 border border-[#d7e4ec]">
            <div className="flex items-center justify-between border-b border-[#d7e4ec] pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
                <span className="material-symbols-outlined text-[#006763] text-[18px]">view_column</span>
                <span>Настройка столбцов таблицы</span>
              </div>
              <button
                onClick={() => setIsColumnsModalOpen(false)}
                className="text-[#6e7978] hover:text-[#111d23]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-1 text-[12px] max-h-64 overflow-y-auto">
              <label className="flex items-center gap-2 p-1 rounded hover:bg-[#e9f6fd] cursor-pointer">
                <input type="checkbox" checked disabled className="accent-[#006763] rounded" />
                <span className="text-[#6e7978]">Реестр / Название (Обязательно)</span>
              </label>
              {Object.entries(colVisibility).map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-1 rounded hover:bg-[#e9f6fd] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      setColVisibility((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="accent-[#006763] rounded cursor-pointer"
                  />
                  <span>
                    {key === 'zone' && 'Зона хранения'}
                    {key === 'category' && 'Категория'}
                    {key === 'date' && 'Дата документа'}
                    {key === 'completeness' && 'Полнота данных'}
                    {key === 'verification' && 'Сверка со сканом'}
                    {key === 'relations' && 'Связи'}
                    {key === 'transcript' && 'Текстовая выписка'}
                    {key === 'path' && 'Раздел архива'}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#d7e4ec] pt-2">
              <button
                onClick={() => setIsColumnsModalOpen(false)}
                className="px-3 py-1 rounded bg-[#006763] text-white font-semibold text-[11px]"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
