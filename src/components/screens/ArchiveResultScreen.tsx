import React from 'react';
import { useVault } from '../../context/VaultContext';

export const ArchiveResultScreen: React.FC = () => {
  const {
    navigateTo,
    selectedDocId,
    activeDocument,
    inboxItems
  } = useVault();

  const doc = activeDocument || {
    id: selectedDocId || 'PV-0042',
    name: 'Акт приёма-передачи жилого помещения № 42.pdf',
    category: 'Жильё',
    zone: 'open',
    path: 'Open / Жильё / 2026',
    fileSize: '6.8 МБ',
    pageCount: 4,
    sha256: '8f2a994bc7d612e4c014781df03ab8714e8b39a48e71822c9e2d3f0a1b8c014d'
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Session Header */}
      <div className="flex items-center justify-between pb-2 mb-3 bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="material-symbols-outlined text-primary text-[17px]">inbox</span>
          <span className="text-secondary">Мастер архивации</span>
          <span className="text-outline">/</span>
          <span className="font-bold text-on-surface">Этап 6: Результат архивации (SCR-09)</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code text-[11px]">
          Сессия #AF-8942
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Main Status Hero Card */}
        <div className="bg-surface-container-lowest rounded-lg p-4 border border-surface-container-highest shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-1.5 py-0.2 rounded bg-primary-fixed-dim text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider">
                  Транзакция зафиксирована
                </span>
                <span className="font-code text-[11px] text-secondary">
                  {doc.id} • sha256:{doc.sha256.substring(0, 8)}...
                </span>
              </div>
              <h1 className="font-bold text-[16px] text-on-surface">
                Документ успешно зафиксирован в постоянном архиве
              </h1>
              <p className="text-[12px] text-secondary leading-relaxed">
                Архивная запись создана с уникальным идентификатором <strong className="text-on-surface">{doc.id}</strong>. Исходные файлы обработаны, контрольные суммы совпали, индекс обновлен.
              </p>
            </div>
          </div>

          <div className="flex md:flex-col items-end gap-1 shrink-0 bg-surface-container-low p-2.5 rounded border border-surface-container-highest text-[11px]">
            <span className="text-secondary">Хранилище</span>
            <span className="font-bold text-on-surface">Том A (SSD-01)</span>
            <span className="font-code text-primary flex items-center gap-1 font-semibold text-[10px]">
              <span className="material-symbols-outlined text-[13px]">format_image_left</span>
              WORM-блокировка активна
            </span>
          </div>
        </div>

        {/* Passport & Actions Grid */}
        <div className="grid grid-cols-12 gap-3">
          {/* Left: Passport Snapshot (7 cols) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-lg p-4 border border-surface-container-highest shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-surface-container">
                <div className="flex items-center gap-1.5 font-bold text-[13px] text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[17px]">verified_user</span>
                  <span>Снимок паспорта архивного объекта</span>
                </div>
                <span className="text-[10px] text-secondary font-code">
                  Фиксация: {new Date().toLocaleDateString('ru-RU')}
                </span>
              </div>

              <div className="flex flex-col bg-surface-container-low rounded p-2.5 gap-2 text-[12px] border border-surface-container-highest">
                <div className="grid grid-cols-3 gap-2 items-center py-0.5">
                  <span className="text-secondary font-medium">Имя документа:</span>
                  <span className="col-span-2 font-bold text-on-surface truncate">{doc.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center py-0.5 bg-surface-container-lowest rounded px-1.5">
                  <span className="text-secondary font-medium">Расположение:</span>
                  <span className="col-span-2 font-code text-[11px] text-primary flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px]">folder_open</span>
                    {doc.path}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center py-0.5">
                  <span className="text-secondary font-medium">Категория фонда:</span>
                  <span className="col-span-2 text-on-surface">{doc.category}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center py-0.5 bg-surface-container-lowest rounded px-1.5">
                  <span className="text-secondary font-medium">Статус готовности:</span>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      ✓ Реквизиты заполнены
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      ✓ Сверен с оригиналом
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center py-0.5">
                  <span className="text-secondary font-medium">Прикрепленные файлы:</span>
                  <span className="col-span-2 font-code text-[11px] text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-primary">picture_as_pdf</span>
                    {doc.fileSize} • Экспорт в Obsidian: выполнен
                  </span>
                </div>
              </div>

              <div className="p-2 rounded bg-surface-container text-on-surface text-[11px] flex items-center justify-between border border-surface-container-highest">
                <span className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[14px] text-primary">fingerprint</span>
                  Локальный хэш проверен. Запись продублирована в резервный индекс.
                </span>
                <span className="font-code text-primary font-bold">OK</span>
              </div>
            </div>
          </div>

          {/* Right: Next steps & Queue widget (5 cols) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-2.5">
            <div className="bg-surface-container-lowest rounded-lg p-4 border border-surface-container-highest shadow-xs flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  Следующие шаги процесса
                </div>
                <h3 className="font-bold text-[14px] text-on-surface mt-0.5">Действия с очередью</h3>
                <p className="text-[11.5px] text-secondary mt-1">
                  Файл успешно перемещён из входящих. Вы можете продолжить разбор оставшихся объектов или перейти к зафиксированной записи.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => navigateTo('vkhodyashchie')}
                  className="w-full h-9 px-3 rounded bg-primary text-on-primary text-[12px] font-semibold flex items-center justify-between hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px]">folder_special</span>
                    <span className="truncate">Перейти к следующему объекту во Входящих</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-code text-[10px]">
                    <span className="bg-on-primary/20 px-1 rounded">{inboxItems.length} объекта</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('kartochka', { docId: doc.id })}
                  className="w-full h-8 px-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] flex items-center justify-between transition-colors border border-surface-container-highest cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-secondary">open_in_new</span>
                    <span>Открыть этот документ в Карточке (SCR-11)</span>
                  </div>
                  <span className="font-code text-primary font-bold text-[11px]">{doc.id}</span>
                </button>

                <button
                  onClick={() => navigateTo('zhurnal')}
                  className="w-full h-8 px-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] flex items-center justify-between transition-colors border border-surface-container-highest cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-secondary">menu_book</span>
                    <span>Перейти в основной Журнал документов (SCR-01)</span>
                  </div>
                  <span className="material-symbols-outlined text-[15px] text-outline">chevron_right</span>
                </button>

                <button
                  onClick={() => navigateTo('redaktor', { docId: doc.id })}
                  className="w-full h-8 px-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] flex items-center justify-between transition-colors border border-surface-container-highest cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-secondary">edit_note</span>
                    <span>Продолжить заполнение реквизитов (SCR-06)</span>
                  </div>
                  <span className="material-symbols-outlined text-[15px] text-outline">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Queue Context Widget */}
            <div className="bg-surface-container rounded-lg p-3 border border-surface-container-highest flex items-center justify-between text-on-surface text-[12px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">inventory_2</span>
                <div className="flex flex-col">
                  <span className="font-semibold">Остаток очереди: {inboxItems.length} файла</span>
                  <span className="text-[11px] text-secondary">Очередь ожидает разбора</span>
                </div>
              </div>
              <span className="font-code text-[11px] bg-surface-container-lowest px-1.5 py-0.5 rounded text-secondary border border-surface-container-highest">
                Путь готов
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
