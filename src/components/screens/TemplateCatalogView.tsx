/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { DocumentTemplate } from '../../types';

export const TemplateCatalogView: React.FC = () => {
  const {
    templates,
    setCurrentScreen,
    templatesScreenState,
    setTemplatesScreenState,
    activeScenario,
    showToast,
  } = useVault();

  const selectedTemplateId = templatesScreenState.selectedTemplateId;
  const setSelectedTemplateId = (id: string) => setTemplatesScreenState(prev => ({ ...prev, selectedTemplateId: id }));

  const filterQuery = templatesScreenState.filterQuery;
  const setFilterQuery = (q: string) => setTemplatesScreenState(prev => ({ ...prev, filterQuery: q }));

  const catFilter = templatesScreenState.catFilter;
  const setCatFilter = (cf: string) => setTemplatesScreenState(prev => ({ ...prev, catFilter: cf }));

  const statusTab = templatesScreenState.statusTab;
  const setStatusTab = (st: 'all' | 'active' | 'archived') => setTemplatesScreenState(prev => ({ ...prev, statusTab: st }));

  const [isDiffDialogOpen, setIsDiffDialogOpen] = useState(activeScenario === 'dialog');

  const isScenarioEmpty = activeScenario === 'empty';

  const filteredTemplates = templates.filter((tpl) => {
    if (isScenarioEmpty) return false;
    if (statusTab === 'active' && tpl.isArchived) return false;
    if (statusTab === 'archived' && !tpl.isArchived) return false;
    if (catFilter !== 'all' && tpl.category !== catFilter) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q) ||
        tpl.typeDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleApplyToActiveDoc = () => {
    setIsDiffDialogOpen(false);
    showToast(`Шаблон «${selectedTemplate.title}» применён к открытому документу!`, 'done');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Title Header Card */}
      <div className="bg-white p-3.5 rounded border border-[#d7e4ec] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#e3f0f8] text-[#006763] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">dashboard_customize</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-[16px]">Каталог шаблонов документов</h1>
            </div>
            <p className="text-[12px] text-[#536166]">
              Схемы структурированных данных: перечень полей, секций и таблиц. Обеспечивают типографику ввода.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Копия схемы создана в каталоге')}
            className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] text-[11px] font-medium border border-[#d7e4ec] flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            <span>Копировать</span>
          </button>
          <button
            onClick={() => setCurrentScreen('SCR-13', 'Каталог шаблонов')}
            className="h-8 px-3.5 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span>Создать шаблон</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#e9f6fd] p-2 rounded border border-[#d7e4ec] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center w-56">
            <span className="material-symbols-outlined absolute left-2 text-[14px] text-[#6e7978]">search</span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Фильтр схем (Ctrl+F)..."
              className="w-full h-7 pl-6 pr-2 bg-white rounded border border-[#d7e4ec] text-[11px]"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-7 px-2 rounded bg-white border border-[#d7e4ec] text-[11px] cursor-pointer"
          >
            <option value="all">Все категории</option>
            <option value="Жильё">Жильё</option>
            <option value="Коммунальные">Коммунальные</option>
            <option value="Работа">Работа</option>
          </select>

          <div className="flex p-0.5 bg-[#e3f0f8] rounded border border-[#d7e4ec]">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-2 py-0.5 rounded ${statusTab === 'all' ? 'bg-white font-bold text-[#006763]' : ''}`}
            >
              Все (5)
            </button>
            <button
              onClick={() => setStatusTab('active')}
              className={`px-2 py-0.5 rounded ${statusTab === 'active' ? 'bg-white font-bold text-[#006763]' : ''}`}
            >
              Активные (4)
            </button>
            <button
              onClick={() => setStatusTab('archived')}
              className={`px-2 py-0.5 rounded ${statusTab === 'archived' ? 'bg-white font-bold text-[#006763]' : ''}`}
            >
              В архиве (1)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#536166]">
          <span>JSON-Schema v7</span>
        </div>
      </div>

      {/* 2-Column Split: Catalog Table (flex-1) + Inspector (320-380px) */}
      <div className="flex flex-col lg:flex-row gap-3 items-start w-full">
        {/* Left Column: Table */}
        <div className="flex-1 min-w-0 flex flex-col bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden">
          <div className="h-8 bg-[#ddeaf2] px-3 flex items-center justify-between font-semibold text-[11px] text-[#536166] uppercase tracking-wider border-b border-[#d7e4ec]">
            <span>Название схемы и тип</span>
            <div className="flex items-center gap-6">
              <span>Структура</span>
              <span>Версия</span>
              <span>Статус</span>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[#6e7978] mb-1">folder_off</span>
              <div className="font-semibold text-[13px]">Шаблоны не найдены</div>
              <p className="text-[11px] text-[#536166] mt-0.5">В текущей выборке нет сохранённых схем.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#d7e4ec] text-[12px]">
              {filteredTemplates.map((tpl, idx) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-2.5 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#95f3eb]/25 hover:bg-[#95f3eb]/35' : 'hover:bg-[#e9f6fd]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-[10px] text-[#6e7978]">0{idx + 1}</span>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-semibold truncate ${tpl.isArchived ? 'line-through text-[#6e7978]' : 'text-[#111d23]'}`}>
                          {tpl.title}
                        </span>
                        <span className="text-[10px] text-[#536166]">{tpl.category} • {tpl.typeDescription}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 text-[11px]">
                      <span className="font-mono text-[#536166]">{tpl.totalFieldsCount} полей</span>
                      <span className="font-mono bg-[#e3f0f8] px-1.5 py-0.5 rounded text-[10px]">{tpl.version}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${tpl.isArchived ? 'bg-[#d7e4ec] text-[#6e7978]' : 'bg-[#e8f5e9] text-[#2e7d32]'}`}>
                        {tpl.isArchived ? 'В архиве' : 'Активен'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Template Inspector */}
        {selectedTemplate && (
          <div className="w-full lg:w-80 xl:w-[350px] 2xl:w-[380px] shrink-0 flex flex-col bg-white rounded border border-[#d7e4ec] shadow-xs p-3.5 gap-3">
            <div className="flex items-start justify-between pb-2 border-b border-[#d7e4ec]">
              <div>
                <span className="text-[10px] text-[#6e7978] uppercase font-bold">Инспектор шаблона</span>
                <h3 className="font-semibold text-[14px] text-[#111d23] mt-0.5">{selectedTemplate.title}</h3>
                <span className="text-[11px] text-[#006763] font-semibold">{selectedTemplate.category}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#95f3eb] text-[#00201e] font-mono font-bold text-[11px]">
                {selectedTemplate.version}
              </span>
            </div>

            {/* Tree representation */}
            <div className="space-y-2 text-[12px]">
              <span className="text-[10px] uppercase font-bold text-[#6e7978] tracking-wider">
                Структура полей и секций:
              </span>

              <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] space-y-1.5">
                <div className="font-semibold text-[#006763] flex items-center justify-between">
                  <span>Секция 1: Основные реквизиты</span>
                  <span className="font-mono text-[10px] text-[#536166]">5 полей</span>
                </div>
                <div className="space-y-1 pl-2 text-[11px] text-[#3e4948]">
                  <div className="flex justify-between bg-white p-1 rounded border border-[#d7e4ec]">
                    <span>• Номер акта</span>
                    <span className="text-[#ba1a1a] font-semibold">Обязательное</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-[#d7e4ec]">
                    <span>• Дата составления</span>
                    <span className="text-[#ba1a1a] font-semibold">Обязательное</span>
                  </div>
                  <div className="flex justify-between bg-white p-1 rounded border border-[#d7e4ec]">
                    <span>• Адрес помещения</span>
                    <span className="text-[#ba1a1a] font-semibold">Обязательное</span>
                  </div>
                </div>
              </div>

              {selectedTemplate.hasTable && (
                <div className="p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] space-y-1 text-[11px]">
                  <div className="font-semibold text-[#006763]">Секция 2: Оборудование и опись</div>
                  <div className="bg-white p-1.5 rounded border border-[#d7e4ec] text-[10px] font-mono">
                    Таблица: 4 столбца (№, Наименование, Модель, Состояние)
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Architecture Box */}
            <div className="p-2.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] text-[11px] text-[#536166] flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#006763] shrink-0 mt-0.5">shield</span>
              <p>
                <strong>Принцип изоляции схем:</strong> изменение или удаление полей в шаблоне <strong>никогда</strong> не приводит к удалению значений, уже зафиксированных в существующих архивных документах.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#d7e4ec]">
              <button
                onClick={() => setIsDiffDialogOpen(true)}
                className="w-full h-8 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">dynamic_form</span>
                <span>Применить шаблон к открытому документу...</span>
              </button>
              <button
                onClick={() => setCurrentScreen('SCR-13', 'Каталог шаблонов')}
                className="w-full h-7 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#111d23] text-[11px] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span>Редактировать структуру схемы</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diff Dialog Modal Overlay */}
      {isDiffDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#d7e4ec] max-w-xl w-full p-4 flex flex-col gap-3 text-[12px]">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 text-[#006763] font-semibold text-[13px]">
                <span className="material-symbols-outlined text-[16px]">difference</span>
                <span>Применить шаблон к открытому документу</span>
              </div>
              <button onClick={() => setIsDiffDialogOpen(false)}>
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-[12px] text-[#3e4948]">
              Слияние схемы <strong>«{selectedTemplate.title}»</strong> с активным документом <strong>PV-0042</strong>.
            </p>

            <div className="space-y-1.5 bg-[#f4faff] p-2.5 rounded border border-[#d7e4ec] text-[11px]">
              <div className="p-1.5 bg-white rounded flex justify-between">
                <span>+ Добавится таблица «Передаваемое имущество»</span>
                <span className="text-[#2e7d32] font-semibold">Новое</span>
              </div>
              <div className="p-1.5 bg-white rounded flex justify-between">
                <span>Поле «Комплекты ключей» будет сохранено как локальное</span>
                <span className="text-[#536166]">Без изменений</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#d7e4ec]">
              <button
                onClick={() => setIsDiffDialogOpen(false)}
                className="px-3 py-1 rounded bg-[#e3f0f8] text-[#3e4948]"
              >
                Отмена
              </button>
              <button
                onClick={handleApplyToActiveDoc}
                className="px-4 py-1.5 rounded bg-[#006763] text-white font-semibold shadow-xs"
              >
                Подтвердить применение шаблона
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
