import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../../context/VaultContext';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    documents,
    plans,
    myData,
    navigateTo
  } = useVault();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedDocs = q ? documents.filter(d => 
    d.name.toLowerCase().includes(q) ||
    d.id.toLowerCase().includes(q) ||
    d.category.toLowerCase().includes(q) ||
    d.fields.some(f => f.value.toLowerCase().includes(q))
  ) : [];

  const matchedPlans = q ? plans.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.notes.toLowerCase().includes(q)
  ) : [];

  const matchedMyData = q ? myData.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.val.toLowerCase().includes(q) ||
    m.comment.toLowerCase().includes(q)
  ) : [];

  const totalResults = matchedDocs.length + matchedPlans.length + matchedMyData.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-start justify-center p-4 pt-16"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-highest flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-container-low border-b border-surface-container-highest">
          <span className="material-symbols-outlined text-[18px] text-primary">search</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[13px] text-on-surface outline-none placeholder:text-outline"
            placeholder="Поиск по документам, реквизитам, планам и справочникам..."
            value={query}
            onInput={(e: React.FormEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-secondary hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <kbd className="font-code text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-secondary border border-surface-container-highest">
            Esc
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-2">
          {!query && (
            <div className="py-8 text-center text-secondary text-[12px]">
              <span className="material-symbols-outlined text-[24px] text-outline block mb-1">manage_search</span>
              Введите номер документа, фамилию, адрес или реквизит для быстрого перехода
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-8 text-center text-secondary text-[12px]">
              <span className="material-symbols-outlined text-[24px] text-outline block mb-1">search_off</span>
              По запросу «{query}» ничего не найдено в локальном хранилище
            </div>
          )}

          {matchedDocs.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-0.5 text-[10px] font-semibold text-outline uppercase tracking-wider">
                Документы в архиве ({matchedDocs.length})
              </div>
              {matchedDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    navigateTo('kartochka', { docId: doc.id });
                  }}
                  className="flex items-center justify-between p-2 rounded hover:bg-surface-container text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-code text-[11px] font-bold text-primary">{doc.id}</span>
                        <span className="text-[12px] font-medium text-on-surface truncate">{doc.name}</span>
                      </div>
                      <span className="text-[11px] text-secondary truncate">{doc.path}</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-secondary font-code">
                    {doc.zone === 'secret' ? 'Secret' : 'Open'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedPlans.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-0.5 text-[10px] font-semibold text-outline uppercase tracking-wider">
                Планы ({matchedPlans.length})
              </div>
              {matchedPlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    navigateTo('plany', { planId: plan.id });
                  }}
                  className="flex items-center justify-between p-2 rounded hover:bg-surface-container text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-primary">calendar_clock</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-on-surface truncate">{plan.title}</span>
                      <span className="text-[11px] text-secondary truncate">Дедлайн: {plan.deadline} ({plan.relative})</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-secondary font-label-sm">
                    {plan.status === 'completed' ? 'Выполнен' : 'Запланирован'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedMyData.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-0.5 text-[10px] font-semibold text-outline uppercase tracking-wider">
                Мои данные ({matchedMyData.length})
              </div>
              {matchedMyData.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    navigateTo('moi-dannye');
                  }}
                  className="flex items-center justify-between p-2 rounded hover:bg-surface-container text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-primary">{item.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-on-surface truncate">{item.title}</span>
                      <span className="font-code text-[11px] text-secondary truncate">{item.val}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-outline font-code">{item.tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-3 py-2 bg-surface-container-low border-t border-surface-container-highest flex items-center justify-between text-[11px] text-secondary font-code">
          <span>Нажмите Enter для перехода</span>
          <span>PersonalVault Local Index</span>
        </div>
      </div>
    </div>
  );
};
