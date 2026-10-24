import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const InboxScreen: React.FC = () => {
  const {
    inboxItems,
    navigateTo,
    processingSession,
    updateProcessingSession,
    removeInboxItem,
    showToast
  } = useVault();

  const [selectedItemId, setSelectedItemId] = useState<string>('inb-1');
  const [filterType, setFilterType] = useState<'all' | 'ready' | 'attention'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = inboxItems.filter(item => {
    if (filterType === 'ready' && item.status !== 'ready') return false;
    if (filterType === 'attention' && item.status === 'ready') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(q) || item.workName?.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedItem = inboxItems.find(i => i.id === selectedItemId) || filteredItems[0];

  const handleStartComposition = () => {
    if (selectedItem) {
      updateProcessingSession({
        workName: selectedItem.workName || selectedItem.name,
        packageName: selectedItem.name
      });
    }
    navigateTo('sostav');
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Stage Pipeline Stepper Indicator */}
      <div className="w-full bg-surface-container-lowest px-3.5 py-2 rounded-lg border border-surface-container-highest shadow-xs mb-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-primary">folder_open</span>
            <span className="font-bold text-[13px] text-on-surface">Подготовка документов</span>
            <span className="text-[10px] text-secondary px-1.5 py-0.2 bg-surface-container rounded">Этап 1 из 4</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary-container text-on-primary-container text-[11px] font-semibold">
              <span>1. Входящие</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
            <button
              onClick={() => navigateTo('sostav')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-secondary hover:text-on-surface text-[11px] cursor-pointer"
            >
              <span>2. Состав (SCR-03)</span>
              <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
            </button>
            <button
              onClick={() => navigateTo('predproverka')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-secondary hover:text-on-surface text-[11px] cursor-pointer"
            >
              <span>3. Предпроверка</span>
              <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
            </button>
            <button
              onClick={() => navigateTo('klassifikaciya')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-secondary hover:text-on-surface text-[11px] cursor-pointer"
            >
              <span>4. Классификация</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 text-secondary font-code text-[11px]">
          <span className="material-symbols-outlined text-[13px] text-primary">terminal</span>
          <span>INBOX_DAEMON: ACTIVE</span>
        </div>
      </div>

      {/* Primary Action Toolbar */}
      <div className="w-full bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-highest shadow-xs mb-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => showToast('Диалог выбора файлов запущен')}
            className="h-7 px-2.5 rounded bg-primary text-on-primary font-semibold text-[11px] flex items-center gap-1 hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Добавить файлы</span>
          </button>
          <button
            onClick={() => showToast('Папка Inbox открыта в локальном файловом менеджере')}
            className="h-7 px-2.5 rounded bg-surface-container-lowest text-on-surface text-[11px] flex items-center gap-1 hover:bg-surface-container transition-colors border border-surface-container-highest cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">folder</span>
            <span>Открыть папку Inbox</span>
          </button>
          <button
            onClick={() => showToast('Каталог входящих пересканирован: 4 объекта')}
            className="w-7 h-7 rounded bg-surface-container-lowest text-secondary hover:text-on-surface flex items-center justify-center border border-surface-container-highest cursor-pointer"
            title="Пересканировать каталог"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
          </button>
        </div>

        {/* Center Filter Tabs */}
        <div className="flex items-center bg-surface-container rounded p-0.5 border border-surface-container-highest text-[11px]">
          <button
            onClick={() => setFilterType('all')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Все</span>
            <span className="px-1 rounded bg-surface-container text-secondary font-code text-[10px]">{inboxItems.length}</span>
          </button>
          <button
            onClick={() => setFilterType('ready')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              filterType === 'ready'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Готовы к разбору</span>
            <span className="px-1 rounded bg-surface-container text-secondary font-code text-[10px]">2</span>
          </button>
          <button
            onClick={() => setFilterType('attention')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              filterType === 'attention'
                ? 'bg-surface-container-lowest text-error font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Требуют внимания</span>
            <span className="px-1 rounded bg-error-container text-on-error-container font-code text-[10px]">2</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2 text-[14px] text-secondary pointer-events-none">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск во входящих..."
            className="w-48 h-7 pl-6 pr-2 rounded bg-surface-container-lowest text-[11px] text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary border border-surface-container-highest"
          />
        </div>
      </div>

      {/* Main Split Layout: 65% Table / 35% Inspector */}
      <div className="w-full flex gap-3 items-stretch flex-col lg:flex-row">
        {/* Left Area: Queue Table */}
        <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          <div className="bg-surface-container-high px-3 py-1.5 flex items-center justify-between text-on-surface text-[11px] border-b border-surface-container-highest">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">Очередь необработанных материалов</span>
              <span className="text-secondary font-code">{inboxItems.length} записи в пуле</span>
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[13px]">swap_vert</span>
              <span>Сортировка: по времени добавления</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-[10px] font-semibold uppercase tracking-wider border-b border-surface-container-highest">
                  <th className="py-1 px-2.5 w-8 text-center">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded accent-primary cursor-pointer align-middle" />
                  </th>
                  <th className="py-1 px-2.5">Исходный файл / Набор</th>
                  <th className="py-1 px-2.5 w-16">Тип</th>
                  <th className="py-1 px-2.5 w-20">Размер</th>
                  <th className="py-1 px-2.5 w-28">Состав</th>
                  <th className="py-1 px-2.5 w-36">Статус</th>
                  <th className="py-1 px-2.5 w-32">Дата добавления</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredItems.map(item => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`h-10 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-fixed/20 font-medium'
                          : 'hover:bg-surface-container-high/40 bg-surface-container-lowest'
                      }`}
                    >
                      <td className="py-1 px-2.5 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedItemId(item.id)}
                          className="w-3.5 h-3.5 rounded accent-primary cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-1 px-2.5">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                            item.isPackage ? 'text-primary' : item.type === 'PDF' ? 'text-error' : 'text-secondary'
                          }`}>
                            {item.isPackage ? 'folder_zip' : item.type === 'PDF' ? 'picture_as_pdf' : 'draft'}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-on-surface truncate">{item.name}</span>
                            {item.filesList && (
                              <span className="text-secondary font-code text-[10px] truncate max-w-sm">
                                {item.filesList.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-1 px-2.5 font-code text-[11px] text-secondary">{item.type}</td>
                      <td className="py-1 px-2.5 font-code text-[11px] text-on-surface">{item.size}</td>
                      <td className="py-1 px-2.5 font-code text-[11px] text-secondary">{item.composition}</td>
                      <td className="py-1 px-2.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'ready'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : item.status === 'attention'
                            ? 'bg-surface-container-highest text-secondary'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'ready' ? 'bg-primary' : item.status === 'attention' ? 'bg-amber-600' : 'bg-error'
                          }`}></span>
                          <span>{item.statusText}</span>
                        </span>
                      </td>
                      <td className="py-1 px-2.5 font-code text-[11px] text-secondary">{item.dateAdded}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Action Bar */}
          <div className="bg-surface-container-low px-3 py-2 flex items-center justify-between border-t border-surface-container-highest flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-on-surface">
                Выбран объект: <strong className="font-semibold text-primary">{selectedItem?.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleStartComposition}
                className="h-7 px-3 rounded bg-primary text-on-primary text-[11px] font-semibold flex items-center gap-1 hover:bg-primary-container shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">join_inner</span>
                <span>Объединить в один документ (SCR-03)</span>
              </button>
              <button
                onClick={() => selectedItem && removeInboxItem(selectedItem.id)}
                className="h-7 px-2.5 rounded bg-surface-container text-secondary hover:text-error hover:bg-error-container text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                <span>Убрать из очереди</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Selected Item Inspector */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          <div className="bg-surface-container-high px-3 py-2 flex items-center justify-between border-b border-surface-container-highest">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">description</span>
              <span className="font-semibold text-[12px] text-on-surface">Инспектор выбранного объекта</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-code text-[10px]">
              SCR-02
            </span>
          </div>

          <div className="p-3 flex flex-col gap-3 overflow-y-auto">
            {/* Title & Status */}
            <div>
              <div className="text-[10px] text-secondary uppercase tracking-wider font-semibold">Текущий объект очереди</div>
              <div className="font-bold text-[13px] text-on-surface mt-0.5 truncate">{selectedItem?.name}</div>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-full h-32 rounded bg-surface-container-highest overflow-hidden relative border border-surface-container-highest">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCibeunigutGQPVIPZkJ5UFekhXIz7NPGAUyjla1l0dWh5ntzzLhtcpJSQbi4RQjADQj7shhagVy2r3_QMl4-0XNyXNAOKKjSmKVD9F1KxHeD72ZrNg7hFQK0094Wpdp3z05ADxPIISY8D5jm6CaqUwUezG-kphwbZJmpbY-twppJHj4HdqcnLLSlZnwx_gbzP7sFB7IkbbeP7WqWnBwkAIhkI8ufcG3kMouBV9se-Kl7tQoYqztmgqLA"
                alt="Предпросмотр документа"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface text-[10px] backdrop-blur-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">photo_library</span>
                <span>Стр. 1 из 4</span>
              </div>
            </div>

            {/* Working Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-secondary">Рабочее название документа</label>
              <input
                type="text"
                value={processingSession.workName}
                onChange={e => updateProcessingSession({ workName: e.target.value })}
                className="w-full h-7 px-2 rounded bg-surface-container-lowest text-[12px] text-on-surface outline-none focus:ring-1 focus:ring-primary border border-surface-container-highest"
              />
            </div>

            {/* Target Storage Zone */}
            <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
              <span className="text-[11px] font-semibold text-secondary">Целевая зона хранения</span>
              <div className="flex items-center gap-4 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-[12px]">
                  <input
                    type="radio"
                    name="zone-select"
                    checked={processingSession.zone === 'open'}
                    onChange={() => updateProcessingSession({ zone: 'open' })}
                    className="accent-primary"
                  />
                  <span>Открытое (Open)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[12px]">
                  <input
                    type="radio"
                    name="zone-select"
                    checked={processingSession.zone === 'secret'}
                    onChange={() => updateProcessingSession({ zone: 'secret' })}
                    className="accent-primary"
                  />
                  <span className="text-error font-medium">Secret (VeraCrypt)</span>
                </label>
              </div>
            </div>

            {/* Category & Doc Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-secondary">Категория</label>
                <select
                  value={processingSession.category}
                  onChange={e => updateProcessingSession({ category: e.target.value })}
                  className="h-7 px-1.5 rounded bg-surface-container-lowest text-[11px] text-on-surface outline-none border border-surface-container-highest"
                >
                  <option value="Жильё">Жильё</option>
                  <option value="Финансы">Финансы</option>
                  <option value="Коммунальные">Коммунальные</option>
                  <option value="Здоровье">Здоровье</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-secondary">Тип документа</label>
                <select
                  value={processingSession.docType}
                  onChange={e => updateProcessingSession({ docType: e.target.value })}
                  className="h-7 px-1.5 rounded bg-surface-container-lowest text-[11px] text-on-surface outline-none border border-surface-container-highest"
                >
                  <option value="Акт приёма-передачи">Акт приёма-передачи</option>
                  <option value="Договор найма/аренды">Договор найма/аренды</option>
                  <option value="Платёжное поручение">Платёжное поручение</option>
                  <option value="Справка">Справка</option>
                </select>
              </div>
            </div>

            {/* Source URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-secondary">Источник (URL портала)</label>
              <input
                type="text"
                value={processingSession.sourceUrl}
                onChange={e => updateProcessingSession({ sourceUrl: e.target.value })}
                className="w-full h-7 px-2 rounded bg-surface-container-lowest text-[11px] font-code text-on-surface outline-none border border-surface-container-highest truncate"
              />
            </div>

            {/* Operator comment */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-secondary">Комментарий оператора</label>
              <textarea
                value={processingSession.operatorComment}
                onChange={e => updateProcessingSession({ operatorComment: e.target.value })}
                rows={2}
                className="w-full p-1.5 rounded bg-surface-container-lowest text-[11px] text-on-surface outline-none border border-surface-container-highest resize-none"
              />
            </div>

            {/* Obsidian Checkbox */}
            <label className="flex items-center gap-2 p-1.5 rounded bg-surface-container-low border border-surface-container-highest cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={processingSession.obsidianExport}
                onChange={e => updateProcessingSession({ obsidianExport: e.target.checked })}
                className="accent-primary rounded"
              />
              <span>Создать карточку в Obsidian при архивации</span>
            </label>
          </div>

          {/* Inspector Footer CTA */}
          <div className="p-3 bg-surface-container-low border-t border-surface-container-highest flex flex-col gap-1.5">
            <button
              onClick={handleStartComposition}
              className="w-full h-8 px-3 rounded bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-primary-container shadow-xs cursor-pointer"
            >
              <span>Разобрать документ (F09)</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
            <div className="text-[10px] text-secondary text-center">
              Документ будет подготовлен и проверен перед фиксацией
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
