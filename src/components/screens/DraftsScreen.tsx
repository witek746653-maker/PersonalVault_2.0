import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const DraftsScreen: React.FC = () => {
  const {
    drafts,
    selectedDraftId,
    setSelectedDraftId,
    deleteDraft,
    resumeDraft
  } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredDrafts = drafts.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedDraft = drafts.find(d => d.id === selectedDraftId) || filteredDrafts[0];

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Screen Header */}
      <div className="flex flex-col gap-1 mb-3 bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary-fixed text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[17px]">edit_note</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-[15px] text-on-surface">Черновики и незавершённые сессии (SCR-10)</h1>
                <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[10px] font-semibold">
                  Изолированная память
                </span>
              </div>
              <p className="text-[12px] text-secondary mt-0.5">
                Временные рабочие состояния документов. Черновики не зафиксированы в архиве и физически изолированы от Журнала.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-code">
            Локальное хранилище ОЗУ / SQLite
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container flex-wrap text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex items-center w-56">
              <span className="material-symbols-outlined absolute left-2 text-[14px] text-secondary pointer-events-none">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по черновикам..."
                className="w-full h-7 pl-6 pr-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest text-[11px]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-7 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest cursor-pointer text-[11px]"
            >
              <option value="all">Все категории</option>
              <option value="Жильё">Жильё</option>
              <option value="Бизнес / Сделки">Бизнес / Сделки</option>
              <option value="Коммунальные">Коммунальные</option>
            </select>
          </div>

          <div className="font-code text-secondary">
            Активных черновиков: <strong className="text-primary">{filteredDrafts.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Workspace Two Columns */}
      <div className="w-full grid grid-cols-12 gap-3 items-start">
        {/* Left: Drafts Table (7 cols) */}
        <div className="col-span-12 xl:col-span-7 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          <div className="w-full bg-surface-container flex items-center px-3 h-8 text-[10px] font-semibold text-secondary uppercase tracking-wider border-b border-surface-container-highest">
            <div className="flex-1 min-w-[140px]">Наименование черновика</div>
            <div className="w-24 hidden md:block">Категория</div>
            <div className="w-16 text-center">Зона</div>
            <div className="w-24 text-right">Сохранено</div>
            <div className="w-28 text-right">Состояние</div>
          </div>

          <div className="flex flex-col divide-y divide-surface-container text-[12px]">
            {filteredDrafts.length === 0 ? (
              <div className="p-8 text-center text-secondary text-[12px]">
                Нет активных черновиков
              </div>
            ) : (
              filteredDrafts.map(draft => {
                const isSelected = draft.id === selectedDraftId;
                return (
                  <div
                    key={draft.id}
                    onClick={() => setSelectedDraftId(draft.id)}
                    className={`flex items-center px-3 h-11 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary-fixed/20 font-medium' : 'hover:bg-surface-container-low bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex-1 min-w-[140px] flex flex-col justify-center overflow-hidden pr-2">
                      <span className="font-semibold text-on-surface truncate">{draft.title}</span>
                      <span className="text-[11px] text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">draw</span>
                        <span>{draft.stepName}</span>
                      </span>
                    </div>

                    <div className="w-24 hidden md:flex items-center text-secondary text-[11px] truncate">
                      {draft.category}
                    </div>

                    <div className="w-16 flex items-center justify-center">
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-secondary text-[10px] font-code">
                        {draft.zone === 'secret' ? 'Secret' : 'Open'}
                      </span>
                    </div>

                    <div className="w-24 flex flex-col items-end justify-center text-[11px] text-secondary font-code">
                      <span>{draft.savedTime}</span>
                    </div>

                    <div className="w-28 flex items-center justify-end">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        draft.isConflict ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-primary'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${draft.isConflict ? 'bg-error' : 'bg-primary'}`}></span>
                        <span>{draft.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Draft Session Inspector (5 cols) */}
        {selectedDraft && (
          <div className="col-span-12 xl:col-span-5 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-3.5 gap-3">
            <div className="flex items-start justify-between pb-1 border-b border-surface-container">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-secondary">
                  <span className="px-1 py-0.2 rounded bg-secondary-container font-code">{selectedDraft.id}</span>
                  <span>Сессия подготовки</span>
                </div>
                <h2 className="font-bold text-[14px] text-on-surface mt-0.5">{selectedDraft.title}</h2>
              </div>
            </div>

            {/* Thumbnail Mockup */}
            <div className="w-full h-32 rounded bg-surface-container-high overflow-hidden relative border border-surface-container-highest">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgUlODGsciIoxhLkCV9OZF0ID1vZ-EVGunrwMy_9HtjSDt9Ya85l9fz9ka2CY-ksyX4ra-GOgb0sCwMXKMC451lZk94qcM5YIcb5dFzD1ATuGgToARG3QJKva-T3IIxcVq4AyYbG_L4WW5d_4kKOQE7iREFH2RAFczdh4vqHZxHrI69ycASXbOLtPdkpAVLII0DGXWVI3WAQemQZbdctsrvlPoW4wwkq3ubO7M2iRKIY5s6PKqCPVcKQ"
                alt="Превью сессии"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-2 text-surface text-[10px]">
                <span>Временный снимок рабочей сессии • 4 скана</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-1.5 bg-surface-container-low p-2 rounded text-[11px] border border-surface-container-highest">
              <div>
                <span className="text-secondary text-[10px]">Зона:</span>
                <div className="font-semibold text-on-surface">{selectedDraft.zone === 'secret' ? 'Secret' : 'Open'}</div>
              </div>
              <div>
                <span className="text-secondary text-[10px]">Категория:</span>
                <div className="font-semibold text-on-surface truncate">{selectedDraft.category}</div>
              </div>
              <div>
                <span className="text-secondary text-[10px]">Статус:</span>
                <div className="font-semibold text-primary">{selectedDraft.status}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest text-[11px]">
              <div className="flex justify-between items-center">
                <span className="font-medium text-secondary">Текущий этап:</span>
                <span className="font-bold text-primary">{selectedDraft.stepName}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-secondary">
                <span>Реквизиты: {selectedDraft.fieldsFilled} из {selectedDraft.fieldsTotal}</span>
                <span>Сверка: {selectedDraft.verifiedCount} подтверждено</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={() => resumeDraft(selectedDraft.id)}
                className="w-full h-8 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Продолжить заполнение (в {selectedDraft.stepName})</span>
              </button>

              <button
                onClick={() => deleteDraft(selectedDraft.id)}
                className="w-full h-7 rounded text-error hover:bg-error-container text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                <span>Удалить черновик (без удаления исходных файлов)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
