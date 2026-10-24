import React, { useState, useMemo } from 'react';
import { useVault } from '../../context/VaultContext';
import { StorageZone } from '../../types/vault';

export const ArchivedScreen: React.FC = () => {
  const { documents, restoreDocument, navigateTo, setSelectedDocId, isVeraCryptMounted } = useVault();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'secret' | 'linked'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter archived documents
  const archivedDocs = useMemo(() => {
    return documents.filter(doc => {
      if (!doc.isArchived) return false;
      // Secret zone security
      if (doc.zone === 'secret' && !isVeraCryptMounted) return false;

      if (activeFilter === 'open' && doc.zone !== 'open') return false;
      if (activeFilter === 'secret' && doc.zone !== 'secret') return false;
      if (activeFilter === 'linked' && (!doc.relations || doc.relations.length === 0)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.name.toLowerCase().includes(query);
        const matchesCode = doc.id.toLowerCase().includes(query);
        const matchesCat = doc.category.toLowerCase().includes(query);
        const matchesReason = (doc.archiveReason || '').toLowerCase().includes(query);
        return matchesTitle || matchesCode || matchesCat || matchesReason;
      }
      return true;
    });
  }, [documents, isVeraCryptMounted, activeFilter, searchQuery]);

  const activeDoc = useMemo(() => {
    return archivedDocs.find(d => d.id === selectedId) || archivedDocs[0] || null;
  }, [archivedDocs, selectedId]);

  const counts = useMemo(() => {
    const allArchived = documents.filter(d => d.isArchived);
    return {
      all: allArchived.length,
      open: allArchived.filter(d => d.zone === 'open').length,
      secret: allArchived.filter(d => d.zone === 'secret').length,
      linked: allArchived.filter(d => d.relations && d.relations.length > 0).length,
    };
  }, [documents]);

  const handleConfirmRestore = () => {
    if (!activeDoc) return;
    restoreDocument(activeDoc.id);
    setShowRestoreModal(false);
    setToastMessage(`Документ «${activeDoc.name}» успешно возвращён в Журнал (SCR-01). Все хэши и связи сохранены.`);
  };

  const handleOpenRestoredInJournal = () => {
    if (activeDoc) {
      setSelectedDocId(activeDoc.id);
    }
    navigateTo('zhurnal');
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-36px)] overflow-hidden bg-surface text-on-surface">
      {/* Screen Header Strip */}
      <div className="w-full bg-surface-container-low px-space-md py-space-sm flex items-center justify-between border-b border-surface-container-highest shrink-0">
        <div className="flex items-baseline gap-space-sm min-w-0">
          <div className="flex items-center gap-space-xs text-primary">
            <span className="material-symbols-outlined text-[20px]">archive</span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold text-lg">
              Убранные из Журнала документы (SCR-16)
            </h1>
          </div>
          <span className="font-body-sm text-body-sm text-secondary truncate hidden md:inline">
            Обратимо скрытые архивные записи. Физические файлы, контрольные суммы и связи полностью сохранены
          </span>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <button
            onClick={() => setShowHelpModal(true)}
            className="h-[28px] px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm rounded flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] text-secondary">help_outline</span>
            <span>Справка о хранении</span>
          </button>
          <button
            onClick={() => navigateTo('zhurnal')}
            className="h-[28px] px-space-sm bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm rounded flex items-center gap-1 transition-colors shadow-sm"
          >
            <span>Вернуться в Журнал (SCR-01)</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Sub-header Safety Guarantee Notification Bar */}
      <div className="w-full bg-surface-container px-space-md py-space-xs flex items-center justify-between border-b border-surface-container-highest shrink-0">
        <div className="flex items-center gap-space-sm">
          <div className="w-5 h-5 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[13px]">shield</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface">
            <strong className="font-label-md text-primary">Принцип строгой обратимости:</strong> Документы в этом разделе лишь скрыты из отображения основного Журнала. Никакие файлы не удаляются физически с диска, хэши <span className="font-code text-code text-secondary font-semibold">SHA-256</span> неизменны, а связи SQLite и companion JSON остаются целостными. Функции безвозвратного удаления отсутствуют по архитектурным соображениям безопасности.
          </p>
        </div>
        <span className="font-code text-[11px] text-secondary px-space-xs py-[1px] bg-surface-container-high rounded shrink-0 hidden lg:inline">
          VAULT_FLAGS: NO_PURGE_ENABLED
        </span>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="w-full bg-emerald-50 text-emerald-900 border-b border-emerald-200 px-space-md py-space-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
            <span className="font-label-md text-label-md">{toastMessage}</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={handleOpenRestoredInJournal}
              className="px-space-sm py-[2px] bg-primary text-on-primary font-label-sm text-label-sm rounded"
            >
              Перейти в Журнал
            </button>
            <button onClick={() => setToastMessage(null)} className="text-secondary hover:text-on-surface">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Secret locked indicator when secret unmounted */}
      {!isVeraCryptMounted && counts.secret > 0 && (
        <div className="w-full bg-amber-50 text-amber-900 border-b border-amber-200 px-space-md py-space-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-space-sm font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px] text-amber-700">lock_clock</span>
            <span>
              <strong>Контейнер Secret заблокирован:</strong> Конфиденциальные скрытые записи ({counts.secret}) исключены из выборки. Для отображения убранных документов зоны Secret смонтируйте контейнер VeraCrypt в шапке приложения.
            </span>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="w-full bg-surface-container-lowest px-space-md py-space-xs flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container-highest shrink-0">
        <div className="flex items-center gap-space-sm flex-1 min-w-[320px]">
          <div className="relative flex items-center w-64 max-w-xs">
            <span className="material-symbols-outlined absolute left-2 text-[14px] text-outline pointer-events-none">search</span>
            <input
              className="w-full h-[28px] pl-6 pr-2 bg-surface text-on-surface font-body-sm text-body-sm rounded placeholder-outline focus:outline-none focus:bg-surface-container-lowest border border-surface-container-highest"
              placeholder="Поиск по убранным документам..."
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`h-[24px] px-space-sm rounded font-label-sm text-label-sm transition-colors ${
                activeFilter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              Все ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilter('open')}
              className={`h-[24px] px-space-sm rounded font-label-sm text-label-sm transition-colors ${
                activeFilter === 'open' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              Зона: Open ({counts.open})
            </button>
            <button
              onClick={() => setActiveFilter('secret')}
              className={`h-[24px] px-space-sm rounded font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                activeFilter === 'secret' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">key</span>
              Secret ({isVeraCryptMounted ? counts.secret : '🔒'})
            </button>
            <button
              onClick={() => setActiveFilter('linked')}
              className={`h-[24px] px-space-sm rounded font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                activeFilter === 'linked' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[12px] text-secondary">share</span>
              Связанные ({counts.linked})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-space-sm text-secondary font-label-sm text-label-sm">
          <span>Сортировка:</span>
          <div className="flex items-center gap-1 px-space-xs py-[2px] rounded bg-surface-container">
            <span>По дате перемещения</span>
            <span className="material-symbols-outlined text-[14px] text-primary">arrow_downward</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split Table + Right Inspector */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Table Column */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-surface">
          {archivedDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-space-xl text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                <span className="material-symbols-outlined text-[32px]">archive</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                {searchQuery ? 'Ничего не найдено' : 'Список убранных документов пуст'}
              </h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-md mb-space-lg">
                {searchQuery
                  ? 'Попробуйте изменить поисковый запрос или сбросить фильтры.'
                  : 'Все активные документы отображаются в Журнале (SCR-01). Документы попадают сюда при обратимом исключении из карточки документа.'}
              </p>
              <button
                onClick={() => navigateTo('zhurnal')}
                className="px-space-md py-1.5 bg-primary text-on-primary font-label-sm rounded"
              >
                Открыть Журнал
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse font-body-sm text-body-sm select-text">
              <thead>
                <tr className="bg-surface-container-low text-secondary font-label-sm text-[11px] uppercase tracking-wider text-left border-b border-surface-container-highest sticky top-0 z-10">
                  <th className="py-2 px-space-sm w-24">Код</th>
                  <th className="py-2 px-space-sm">Название документа</th>
                  <th className="py-2 px-space-sm w-44">Категория</th>
                  <th className="py-2 px-space-sm w-36">Дата скрытия</th>
                  <th className="py-2 px-space-sm w-24">Зона</th>
                  <th className="py-2 px-space-sm w-48">Причина архивации</th>
                  <th className="py-2 px-space-sm w-28 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {archivedDocs.map(doc => {
                  const isSelected = activeDoc?.id === doc.id;
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedId(doc.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-container-highest/60 border-l-2 border-primary font-medium'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="py-2 px-space-sm font-code text-code text-primary whitespace-nowrap">
                        {doc.id}
                      </td>
                      <td className="py-2 px-space-sm text-on-surface">
                        <div className="font-medium truncate max-w-md">{doc.name}</div>
                        <div className="text-[11px] text-secondary font-code">{doc.path}</div>
                      </td>
                      <td className="py-2 px-space-sm text-on-surface-variant truncate">
                        {doc.category}
                      </td>
                      <td className="py-2 px-space-sm text-secondary font-code text-[11px]">
                        {doc.archivedDate || doc.date}
                      </td>
                      <td className="py-2 px-space-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[10px] font-label-sm ${
                            doc.zone === 'secret'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {doc.zone === 'secret' && <span className="material-symbols-outlined text-[10px]">key</span>}
                          {doc.zone === 'secret' ? 'Secret' : 'Open'}
                        </span>
                      </td>
                      <td className="py-2 px-space-sm text-secondary truncate max-w-xs text-[11px]">
                        {doc.archiveReason || 'Исключён пользователем'}
                      </td>
                      <td className="py-2 px-space-sm text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(doc.id);
                            setShowRestoreModal(true);
                          }}
                          className="px-2 py-1 bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-label-sm text-[11px] rounded transition-colors inline-flex items-center gap-1"
                          title="Восстановить в основной Журнал"
                        >
                          <span className="material-symbols-outlined text-[13px]">settings_backup_restore</span>
                          <span>Восстановить</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Inspector Column */}
        {activeDoc && (
          <aside className="w-80 shrink-0 border-l border-surface-container-highest bg-surface-container-low flex flex-col justify-between overflow-y-auto p-space-md">
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-space-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Карточка убранного файла
                </span>
                <span className="font-code text-code text-primary font-bold">{activeDoc.id}</span>
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-semibold">
                  {activeDoc.name}
                </h3>
                <span className="text-[11px] text-secondary font-code block truncate">
                  {activeDoc.path}
                </span>
              </div>

              {/* Status card */}
              <div className="p-space-sm rounded bg-amber-50 border border-amber-200 text-amber-900 flex flex-col gap-1 text-[11px]">
                <div className="flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span>Причина исключения из Журнала:</span>
                </div>
                <p className="italic">«{activeDoc.archiveReason || 'Перенесён в архив устаревших версий'}»</p>
                <div className="text-[10px] text-amber-800 pt-1 border-t border-amber-200/60 mt-1">
                  Дата перемещения: {activeDoc.archivedDate || activeDoc.date}
                </div>
              </div>

              {/* File Technical Metadata */}
              <div className="flex flex-col gap-1.5 text-body-sm font-body-sm">
                <div className="flex justify-between py-1 border-b border-surface-container-highest text-[12px]">
                  <span className="text-secondary">Категория:</span>
                  <span className="text-on-surface font-medium">{activeDoc.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-highest text-[12px]">
                  <span className="text-secondary">Зона:</span>
                  <span className="text-on-surface font-medium capitalize">{activeDoc.zone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-highest text-[12px]">
                  <span className="text-secondary">Размер файла:</span>
                  <span className="font-code text-[11px]">{activeDoc.fileSize}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-highest text-[12px]">
                  <span className="text-secondary">Страниц / листов:</span>
                  <span className="text-on-surface">{activeDoc.pageCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-highest text-[12px]">
                  <span className="text-secondary">Контрольная сумма:</span>
                  <span className="font-code text-[10px] text-secondary truncate max-w-[130px]" title={activeDoc.sha256}>
                    {activeDoc.sha256}
                  </span>
                </div>
              </div>

              {/* Integrity guarantee text */}
              <div className="p-space-sm rounded bg-surface-container text-secondary text-[11px] leading-relaxed">
                Файл хранится в неизменном виде в директории архива. Никакие данные не повреждены.
              </div>
            </div>

            <div className="pt-space-md border-t border-surface-container-highest flex flex-col gap-2">
              <button
                onClick={() => setShowRestoreModal(true)}
                className="w-full py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span>
                <span>Восстановить в Журнал</span>
              </button>
              <button
                onClick={() => {
                  setSelectedDocId(activeDoc.id);
                  navigateTo('kartochka');
                }}
                className="w-full py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm rounded transition-colors"
              >
                Просмотреть карточку (SCR-11)
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-xl max-w-md w-full border border-surface-container-highest overflow-hidden">
            <div className="px-space-lg py-space-md bg-surface-container-low border-b border-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-headline-sm">
                <span className="material-symbols-outlined text-[20px]">settings_backup_restore</span>
                <span>Восстановление документа</span>
              </div>
              <button onClick={() => setShowRestoreModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md text-body-sm font-body-sm">
              <p className="text-on-surface">
                Вы действительно хотите восстановить документ в активный Журнал?
              </p>

              <div className="p-space-sm rounded bg-surface-container text-on-surface font-medium">
                <div className="text-primary font-code text-code">{activeDoc.id}</div>
                <div>{activeDoc.name}</div>
              </div>

              <div className="text-[11px] text-secondary space-y-1">
                <div>✓ Документ снова станет доступен в основном списке Журнала (SCR-01).</div>
                <div>✓ Все метаданные, хэш SHA-256 и исходные связи будут реактивированы.</div>
                <div>✓ Физический файл не перемещается, создание дубликатов исключено.</div>
              </div>
            </div>

            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-surface-container-highest flex items-center justify-end gap-space-sm">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-space-md py-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-sm rounded shadow-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>Восстановить в Журнал</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-xl max-w-lg w-full border border-surface-container-highest overflow-hidden">
            <div className="px-space-lg py-space-md bg-surface-container-low border-b border-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-headline-sm">
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
                <span>Справка о хранении и обратимости</span>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md text-body-sm font-body-sm text-secondary">
              <h4 className="font-label-md text-on-surface">Архитектура безопасности PersonalVault 2.0:</h4>
              <ul className="list-disc pl-5 space-y-2 text-[12px]">
                <li>
                  <strong className="text-on-surface">Нет физического удаления:</strong> В соответствии с регламентом долгосрочного архивирования, персональный архив исключает необратимую команду PURGE/DELETE.
                </li>
                <li>
                  <strong className="text-on-surface">Скрытие вместо стирания:</strong> При нажатии «Убрать документ» флаг <code className="font-code text-primary">isArchived = true</code> помечает запись, убирая её из рабочих выборок, но сохраняя полную историю.
                </li>
                <li>
                  <strong className="text-on-surface">Контроль целостности:</strong> Контрольная сумма SHA-256 непрерывно валидируется службой фонового обслуживания (SCR-18).
                </li>
              </ul>
            </div>

            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-surface-container-highest flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-space-md py-1.5 bg-primary text-on-primary font-label-sm rounded"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
