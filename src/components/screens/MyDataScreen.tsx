import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { StorageZone } from '../../types/vault';

export const MyDataScreen: React.FC = () => {
  const {
    myData,
    selectedMyDataId,
    setSelectedMyDataId,
    updateMyDataRecord,
    migrateMyDataZone,
    addMyDataRecord,
    deleteMyDataRecord,
    isVeraCryptMounted,
    toggleVeraCrypt,
    navigateTo,
    showToast
  } = useVault();

  const [activeGroupId, setActiveGroupId] = useState('personal');
  const [gridFilter, setGridFilter] = useState<'all' | 'current' | 'past'>('all');
  const [zoneFilter, setZoneFilter] = useState<'all' | StorageZone>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isZoneMigrateModalOpen, setIsZoneMigrateModalOpen] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);

  const groups = [
    { id: 'personal', name: 'Личные сведения', icon: 'account_box' },
    { id: 'docs', name: 'Документы РФ', icon: 'badge' },
    { id: 'addresses', name: 'Адреса', icon: 'home_pin' },
    { id: 'orgs', name: 'Организации', icon: 'corporate_fare' },
    { id: 'bank', name: 'Банковские счета', icon: 'account_balance' },
    { id: 'other', name: 'Другие сведения', icon: 'more_horiz' }
  ];

  // Filtering records
  const visibleRecords = myData.filter(r => {
    // If VeraCrypt offline, hide secret records
    if (!isVeraCryptMounted && r.zone === 'secret') return false;
    if (zoneFilter !== 'all' && r.zone !== zoneFilter) return false;
    if (gridFilter === 'current' && r.status !== 'current') return false;
    if (gridFilter === 'past' && r.status !== 'past') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return r.title.toLowerCase().includes(q) || r.val.toLowerCase().includes(q);
    }
    return true;
  });

  const activeRecord = myData.find(r => r.id === selectedMyDataId) || visibleRecords[0];

  const handleCopy = () => {
    if (activeRecord) {
      navigator.clipboard.writeText(activeRecord.val);
      showToast('Значение скопировано в буфер обмена');
    }
  };

  const handleNewRecord = () => {
    addMyDataRecord({
      title: 'Новый реквизит',
      val: '',
      type: 'text',
      typeName: 'Текст',
      status: 'current',
      fromDate: new Date().toLocaleDateString('ru-RU'),
      toDate: 'Бессрочно',
      zone: 'open',
      group: activeGroupId,
      comment: '',
      icon: 'description'
    });
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Top Sub-header */}
      <div className="bg-surface-container-low px-4 py-2.5 flex flex-col gap-2 shrink-0 border-b border-surface-container-highest shadow-xs mb-3 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">folder_shared</span>
              <h1 className="font-bold text-[14px] text-on-surface">Мои данные (SCR-14)</h1>
            </div>
            <span className="text-outline text-[11px]">|</span>
            <span className="text-[12px] text-secondary">Справочник переиспользуемых реквизитов пользователя</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewRecord}
              className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium flex items-center gap-1 border border-surface-container-highest cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add_circle</span>
              <span>+ Добавить реквизит</span>
            </button>

            <button
              onClick={() => setIsInsertModalOpen(true)}
              className="h-7 px-3 rounded bg-primary hover:bg-primary-container text-on-primary font-semibold text-[11px] flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">input</span>
              <span>Вставить в документ (SCR-06) →</span>
            </button>
          </div>
        </div>

        {/* Security / VeraCrypt Warning if offline */}
        {!isVeraCryptMounted && (
          <div className="p-2 rounded bg-error-container/40 border border-error/30 text-on-error-container text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-error">lock</span>
              <span>
                <strong>Том Secret не смонтирован.</strong> Секретные реквизиты (паспорт, счета) скрыты политикой UX-032. Открытые реквизиты (Open) полностью доступны.
              </span>
            </div>
            <button
              onClick={toggleVeraCrypt}
              className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary font-semibold text-[11px] hover:bg-surface-container cursor-pointer border border-surface-container-highest"
            >
              Подключить том VeraCrypt
            </button>
          </div>
        )}
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: Categories Tree (2 cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          <div className="bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-2.5 flex flex-col gap-1.5">
            <div className="text-[10px] font-semibold text-secondary uppercase tracking-wider px-1">
              Группы реквизитов
            </div>
            <div className="flex flex-col gap-0.5">
              {groups.map(g => {
                const count = myData.filter(r => r.group === g.id && (isVeraCryptMounted || r.zone === 'open')).length;
                const isActive = g.id === activeGroupId;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroupId(g.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] cursor-pointer transition-colors ${
                      isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px]">{g.icon}</span>
                      <span>{g.name}</span>
                    </div>
                    <span className="font-code text-[10px] px-1 rounded bg-surface-container-lowest text-secondary">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VeraCrypt Status Card */}
          <div className="p-2.5 rounded-lg bg-surface-container border border-surface-container-highest flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-secondary">VeraCrypt Vault</span>
              <span className={`w-2 h-2 rounded-full ${isVeraCryptMounted ? 'bg-primary' : 'bg-error'}`}></span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface font-code text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-primary">
                {isVeraCryptMounted ? 'verified_user' : 'no_encryption'}
              </span>
              <span>{isVeraCryptMounted ? 'Mounted (Slot 01)' : 'Отключен'}</span>
            </div>
            <button
              onClick={toggleVeraCrypt}
              className="mt-1 h-6 px-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer border border-surface-container-highest"
            >
              <span>{isVeraCryptMounted ? 'Отключить том' : 'Подключить том'}</span>
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: Data Grid Table (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-2 bg-surface-container-low flex items-center justify-between border-b border-surface-container-highest text-[11px] flex-wrap gap-2">
            <div className="flex items-center bg-surface-container rounded p-0.5 border border-surface-container-highest">
              <button
                onClick={() => setGridFilter('all')}
                className={`px-2 py-0.5 rounded cursor-pointer font-medium ${gridFilter === 'all' ? 'bg-surface-container-lowest text-primary font-bold shadow-xs' : 'text-secondary'}`}
              >
                Все ({visibleRecords.length})
              </button>
              <button
                onClick={() => setGridFilter('current')}
                className={`px-2 py-0.5 rounded cursor-pointer font-medium ${gridFilter === 'current' ? 'bg-surface-container-lowest text-primary font-bold shadow-xs' : 'text-secondary'}`}
              >
                Текущие
              </button>
              <button
                onClick={() => setGridFilter('past')}
                className={`px-2 py-0.5 rounded cursor-pointer font-medium ${gridFilter === 'past' ? 'bg-surface-container-lowest text-primary font-bold shadow-xs' : 'text-secondary'}`}
              >
                Прежние
              </button>
            </div>

            <div className="relative flex items-center w-40">
              <span className="material-symbols-outlined absolute left-1.5 text-[13px] text-secondary pointer-events-none">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full h-6 pl-5 pr-1.5 rounded bg-surface-container-lowest text-[11px] text-on-surface outline-none border border-surface-container-highest"
              />
            </div>
          </div>

          {/* Grid Rows */}
          <div className="divide-y divide-surface-container text-[12px] overflow-y-auto max-h-[500px]">
            {visibleRecords.map(r => {
              const isSelected = r.id === selectedMyDataId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedMyDataId(r.id)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-fixed/20 font-medium' : 'hover:bg-surface-container-low bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">{r.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate">{r.title}</span>
                      <span className="font-code text-[11px] text-secondary truncate">{r.val}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                      r.zone === 'secret' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-secondary'
                    }`}>
                      {r.zone === 'secret' ? 'Secret' : 'Open'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Record Inspector (4 cols) */}
        {activeRecord && (
          <div className="col-span-12 lg:col-span-4 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-3.5 gap-2.5 text-[12px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-surface-container">
              <div className="flex items-center gap-1.5 font-bold text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-primary text-[17px]">{activeRecord.icon}</span>
                <span>Свойства реквизита</span>
              </div>
              <span className="font-code text-[10px] text-secondary bg-surface-container px-1 rounded">
                {activeRecord.tag}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] text-secondary uppercase font-semibold">Название реквизита</label>
                <input
                  type="text"
                  value={activeRecord.title}
                  onChange={e => updateMyDataRecord(activeRecord.id, { title: e.target.value })}
                  className="h-7 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest font-medium"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-secondary uppercase font-semibold">Значение</label>
                  <button onClick={handleCopy} className="text-primary text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer">
                    <span className="material-symbols-outlined text-[12px]">content_copy</span> Скопировать
                  </button>
                </div>
                <textarea
                  value={activeRecord.val}
                  onChange={e => updateMyDataRecord(activeRecord.id, { val: e.target.value })}
                  rows={2}
                  className="p-1.5 rounded bg-surface-container-low text-on-surface font-code text-[11px] outline-none border border-surface-container-highest resize-none"
                />
              </div>

              {/* Status & Validity */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-secondary uppercase font-semibold">Статус</label>
                  <select
                    value={activeRecord.status}
                    onChange={e => updateMyDataRecord(activeRecord.id, { status: e.target.value as any })}
                    className="h-7 px-1.5 rounded bg-surface-container-low text-on-surface text-[11px] border border-surface-container-highest"
                  >
                    <option value="current">Текущее</option>
                    <option value="past">Прежнее</option>
                  </select>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-secondary uppercase font-semibold">Действует по</label>
                  <input
                    type="text"
                    value={activeRecord.toDate}
                    onChange={e => updateMyDataRecord(activeRecord.id, { toDate: e.target.value })}
                    className="h-7 px-2 rounded bg-surface-container-low text-on-surface text-[11px] border border-surface-container-highest"
                  />
                </div>
              </div>

              {/* Security Zone Card with Migration button */}
              <div className="p-2 bg-surface-container-low rounded border border-surface-container-highest flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-secondary block font-semibold uppercase">Зона безопасности</span>
                  <span className={`font-bold ${activeRecord.zone === 'secret' ? 'text-error' : 'text-primary'}`}>
                    {activeRecord.zone === 'secret' ? 'Secret (VeraCrypt)' : 'Open (Открытая)'}
                  </span>
                </div>
                <button
                  onClick={() => setIsZoneMigrateModalOpen(true)}
                  className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary text-[10px] font-bold border border-surface-container-highest cursor-pointer"
                >
                  Сменить зону...
                </button>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] text-secondary uppercase font-semibold">Примечание</label>
                <textarea
                  value={activeRecord.comment}
                  onChange={e => updateMyDataRecord(activeRecord.id, { comment: e.target.value })}
                  rows={2}
                  className="p-1.5 rounded bg-surface-container-low text-on-surface text-[11px] outline-none border border-surface-container-highest resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-container">
                <button
                  onClick={() => showToast('Реквизит сохранён')}
                  className="h-7 px-3 rounded bg-primary text-on-primary font-semibold text-[11px] hover:bg-primary-container shadow-xs cursor-pointer"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => deleteMyDataRecord(activeRecord.id)}
                  className="text-error hover:underline text-[11px] cursor-pointer"
                >
                  Удалить реквизит
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone Migration Modal */}
      {isZoneMigrateModalOpen && activeRecord && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsZoneMigrateModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-primary font-bold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Смена зоны безопасности реквизита</span>
            </div>
            <p className="text-[12px] text-on-surface leading-normal">
              Переместить реквизит <strong>«{activeRecord.title}»</strong> из зоны{' '}
              <strong>{activeRecord.zone === 'secret' ? 'Secret' : 'Open'}</strong> в зону{' '}
              <strong className="text-primary">{activeRecord.zone === 'secret' ? 'Open' : 'Secret'}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsZoneMigrateModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px]"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  migrateMyDataZone(activeRecord.id, activeRecord.zone === 'secret' ? 'open' : 'secret');
                  setIsZoneMigrateModalOpen(false);
                }}
                className="px-4 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-bold text-[11px] shadow-xs"
              >
                Подтвердить перенос
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Modal to SCR-06 */}
      {isInsertModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsInsertModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-primary font-bold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">input</span>
              <span>Вставка реквизитов в редактор данных (SCR-06)</span>
            </div>
            <p className="text-[12px] text-on-surface leading-normal">
              Реквизиты будут переданы в открытый черновик редактора SCR-06 для автозаполнения полей.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsInsertModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px]"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setIsInsertModalOpen(false);
                  showToast('Реквизиты переданы в SCR-06');
                  navigateTo('redaktor');
                }}
                className="px-4 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-bold text-[11px] shadow-xs"
              >
                Перейти в редактор с реквизитами
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
