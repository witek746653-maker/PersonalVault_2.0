import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const TemplatesCatalogScreen: React.FC = () => {
  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    navigateTo,
    showToast
  } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isDiffDialogOpen, setIsDiffDialogOpen] = useState(false);

  const filteredTemplates = templates.filter(t => {
    if (tabFilter !== 'all' && t.status !== tabFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return t.title.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || filteredTemplates[0];

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container-highest shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">dashboard_customize</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[16px] text-on-surface">Каталог шаблонов документов</h1>
              <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-code text-[10px] font-bold">
                SCR-12
              </span>
            </div>
            <p className="text-[12px] text-secondary mt-0.5">
              Схемы структурированных данных: перечень полей, секций и таблиц без персональных значений.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Копия шаблона создана')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium flex items-center gap-1 border border-surface-container-highest cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            <span>Копировать</span>
          </button>
          <button
            onClick={() => navigateTo('shablon-redaktor')}
            className="h-7 px-3 rounded bg-primary text-on-primary hover:bg-primary-container text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">add_circle</span>
            <span>Создать шаблон (SCR-13)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="w-full bg-surface-container-low rounded-lg p-2 mb-3 flex flex-wrap items-center justify-between gap-2 border border-surface-container-highest text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center w-56">
            <span className="material-symbols-outlined absolute left-2 text-[14px] text-secondary pointer-events-none">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Фильтр схем (Ctrl+F)..."
              className="w-full h-7 pl-6 pr-2 rounded bg-surface-container-lowest text-on-surface outline-none border border-surface-container-highest text-[11px]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-7 px-2 rounded bg-surface-container-lowest text-on-surface outline-none border border-surface-container-highest cursor-pointer text-[11px]"
          >
            <option value="all">Все категории</option>
            <option value="Жильё">Жильё</option>
            <option value="Коммунальные">Коммунальные</option>
            <option value="Работа">Работа</option>
          </select>

          <div className="flex items-center bg-surface-container rounded p-0.5 border border-surface-container-highest">
            <button
              onClick={() => setTabFilter('all')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${tabFilter === 'all' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-secondary'}`}
            >
              Все ({templates.length})
            </button>
            <button
              onClick={() => setTabFilter('active')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${tabFilter === 'active' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-secondary'}`}
            >
              Активные ({templates.filter(t => t.status === 'active').length})
            </button>
            <button
              onClick={() => setTabFilter('archived')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer ${tabFilter === 'archived' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-secondary'}`}
            >
              В архиве ({templates.filter(t => t.status === 'archived').length})
            </button>
          </div>
        </div>

        <span className="text-secondary font-code text-[11px]">JSON-Schema v7 Verified</span>
      </div>

      {/* Two Column Workspace */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left: Table (7 cols) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          <div className="h-8 bg-surface-container flex items-center px-3 text-[10px] font-semibold text-secondary uppercase tracking-wider justify-between border-b border-surface-container-highest">
            <span>Название схемы и тип</span>
            <div className="flex items-center gap-6 w-56 justify-between">
              <span>Структура</span>
              <span>Версия</span>
              <span>Статус</span>
            </div>
          </div>

          <div className="divide-y divide-surface-container text-[12px]">
            {filteredTemplates.map(tpl => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`flex items-center px-3 py-2 cursor-pointer transition-colors justify-between ${
                    isSelected ? 'bg-primary-fixed/20 font-medium' : 'hover:bg-surface-container-low bg-surface-container-lowest'
                  } ${tpl.status === 'archived' ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="material-symbols-outlined text-[17px] text-primary shrink-0">
                      {tpl.category === 'Жильё' ? 'apartment' : tpl.category === 'Коммунальные' ? 'receipt_long' : 'badge'}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate">{tpl.title}</span>
                      <span className="text-[10px] text-secondary truncate">{tpl.category} • {tpl.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-56 justify-between shrink-0 text-[11px]">
                    <span className="text-secondary font-code text-[10px]">{tpl.totalFieldsCount} полей</span>
                    <span className="font-code px-1.5 py-0.2 rounded bg-surface-container text-on-surface">{tpl.version}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      tpl.status === 'active' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-secondary'
                    }`}>
                      {tpl.status === 'active' ? 'Активен' : 'В архиве'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspector (5 cols) */}
        {selectedTemplate && (
          <div className="col-span-12 lg:col-span-5 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-3.5 gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">view_quilt</span>
                <span className="font-bold text-[13px] text-on-surface">Инспектор шаблона</span>
              </div>
              <button
                onClick={() => navigateTo('shablon-redaktor')}
                className="h-6 px-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Схема (SCR-13)</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded border border-surface-container-highest flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-[13px] text-on-surface leading-tight">{selectedTemplate.title}</h3>
                <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed font-code text-[10px] font-bold">
                  {selectedTemplate.version}
                </span>
              </div>
              <div className="text-[11px] text-secondary flex items-center gap-2">
                <span className="text-primary font-medium">{selectedTemplate.category}</span>
                <span>•</span>
                <span>{selectedTemplate.type}</span>
              </div>
              <div className="text-[10px] text-outline pt-1">
                Обновлено: {selectedTemplate.updatedDate} • Обязательных: {selectedTemplate.requiredCount} из {selectedTemplate.totalFieldsCount}
              </div>
            </div>

            {/* Structure Preview */}
            <div className="flex flex-col gap-1.5 text-[11px]">
              <span className="font-semibold text-secondary uppercase text-[10px] tracking-wider">
                Структура полей и секций:
              </span>
              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1">
                <div className="flex justify-between font-bold text-on-surface">
                  <span>Секция 1: Основные реквизиты</span>
                  <span className="text-secondary font-code text-[10px]">5 полей</span>
                </div>
                <div className="text-[11px] text-secondary pl-2 space-y-0.5">
                  <div>• Номер акта [Текст] *Обязательное</div>
                  <div>• Дата составления [Дата] *Обязательное</div>
                  <div>• Наймодатель [Текст] (связь с «Мои данные»)</div>
                  <div>• Наниматель [Текст] (связь с «Мои данные»)</div>
                  <div>• Адрес помещения [Длинный текст] *Обязательное</div>
                </div>
              </div>

              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1">
                <div className="flex justify-between font-bold text-on-surface">
                  <span>Секция 2: Оборудование и опись</span>
                  <span className="text-secondary font-code text-[10px]">Таблица</span>
                </div>
                <div className="text-[10px] text-secondary pl-2">
                  Таблица: 4 столбца (№, Наименование, Модель, Состояние)
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsDiffDialogOpen(true)}
              className="w-full h-8 rounded bg-primary text-on-primary hover:bg-primary-container text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined text-[15px]">dynamic_form</span>
              <span>Применить шаблон к открытому документу...</span>
            </button>
          </div>
        )}
      </div>

      {/* Diff Dialog Modal */}
      {isDiffDialogOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDiffDialogOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-lg max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-2.5 bg-surface-container-low flex items-center justify-between border-b border-surface-container-highest">
              <div className="flex items-center gap-1.5 font-bold text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-primary">difference</span>
                <span>Применить шаблон: {selectedTemplate?.title}</span>
              </div>
              <button onClick={() => setIsDiffDialogOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 text-[12px]">
              <div className="p-2.5 rounded bg-primary-fixed/20 border border-primary/30 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface font-semibold block">Безопасное структурное наложение:</strong>
                  <span className="text-secondary">Конфликты отсутствуют. Заполненные данные документа не будут перезаписаны.</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 border border-surface-container-highest rounded p-2 text-[11px]">
                <div className="flex justify-between py-1 border-b border-surface-container">
                  <span>Номер акта</span>
                  <span className="text-primary font-bold">+ Будет добавлено</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container">
                  <span>Дата составления</span>
                  <span className="text-primary font-bold">+ Будет добавлено</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Таблица «Передаваемое имущество»</span>
                  <span className="text-primary font-bold">+ Создаётся пустая сетка</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container-highest flex justify-end gap-2">
              <button
                onClick={() => setIsDiffDialogOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setIsDiffDialogOpen(false);
                  showToast('Шаблон успешно применён к документу');
                  navigateTo('redaktor');
                }}
                className="px-4 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-bold text-[12px] shadow-xs cursor-pointer"
              >
                Подтвердить применение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
