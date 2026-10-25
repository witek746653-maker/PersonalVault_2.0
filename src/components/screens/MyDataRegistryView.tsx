import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { MyDataRecord, MyDataCategory, SecurityZone } from '../../types';
import { 
  User, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  MoveRight, 
  Info,
  Lock,
  Search,
  KeyRound,
  FileBadge
} from 'lucide-react';

export const MyDataRegistryView: React.FC = () => {
  const { 
    myDataCategories, 
    myDataRecords, 
    addMyDataRecord, 
    deleteMyDataRecord, 
    updateMyDataRecord,
    isVeraCryptMounted,
    showToast 
  } = useVault();

  const [categories, setCategories] = useState<MyDataCategory[]>(myDataCategories);
  const [activeGroupId, setActiveGroupId] = useState<string>(myDataCategories[0]?.id || 'cat-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newType, setNewType] = useState('Паспортные данные');
  const [newZone, setNewZone] = useState<SecurityZone>('open');

  // UX-020 delete group modal
  const [deleteModalGroupId, setDeleteModalGroupId] = useState<string | null>(null);
  const [targetMoveGroupId, setTargetMoveGroupId] = useState<string>('');

  const activeCategory = categories.find((c: MyDataCategory) => c.id === activeGroupId) || categories[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast(`Значение скопировано: ${text.slice(0, 25)}...`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVal.trim() || !activeCategory) return;

    addMyDataRecord({
      title: newTitle.trim(),
      val: newVal.trim(),
      type: 'text',
      typeName: newType,
      status: 'current',
      fromDate: '2026-01-01',
      toDate: 'Бессрочно',
      zone: newZone,
      group: activeCategory.id,
      comment: 'Добавлено вручную',
      tag: 'Верифицировано',
      icon: 'badge'
    });

    setNewTitle('');
    setNewVal('');
    setIsAddRecordOpen(false);
    showToast(`Реквизит «${newTitle}» добавлен в группу ${activeCategory.name}`);
  };

  const groupRecords = myDataRecords.filter((r: MyDataRecord) => {
    if (r.group !== activeCategory?.id) return false;
    if (r.zone === 'secret' && !isVeraCryptMounted) return false;
    if (!searchQuery) return true;
    return r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.val.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeleteGroupClick = (groupId: string) => {
    setDeleteModalGroupId(groupId);
    const alternative = categories.find((c: MyDataCategory) => c.id !== groupId);
    if (alternative) {
      setTargetMoveGroupId(alternative.id);
    }
  };

  const confirmDeleteGroup = () => {
    if (!deleteModalGroupId) return;
    const recordsInGroup = myDataRecords.filter((r: MyDataRecord) => r.group === deleteModalGroupId);

    if (recordsInGroup.length > 0) {
      if (!targetMoveGroupId) {
        showToast('Выберите целевую группу для переноса записей');
        return;
      }
      // Relocate records
      recordsInGroup.forEach((r: MyDataRecord) => {
        updateMyDataRecord(r.id, { group: targetMoveGroupId });
      });
      showToast(`Перенесено ${recordsInGroup.length} записей в новую группу`);
    }

    setCategories((prev: MyDataCategory[]) => prev.filter((c: MyDataCategory) => c.id !== deleteModalGroupId));
    setDeleteModalGroupId(null);

    if (activeGroupId === deleteModalGroupId) {
      const remaining = categories.find((c: MyDataCategory) => c.id !== deleteModalGroupId);
      if (remaining) setActiveGroupId(remaining.id);
    }
    showToast('Группа успешно удалена');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f4faff] h-full overflow-hidden">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SCR-14: Реестр «Мои данные»</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#006763] border border-teal-200">
              Справочник реквизитов субъекта
            </span>
            <span className="px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-700 border border-amber-200">
              Правило UX-020: Защита непустых групп
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Хранилище паспортных данных, СНИЛС, ИНН, ОМС и адресов. Автоматическая подстановка в формы и сверка с оригиналами.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddRecordOpen(true)}
            className="px-3.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить реквизит
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Groups Navigation */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Группы реквизитов</span>
            <span className="text-xs text-slate-400">{categories.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {categories.map((group: MyDataCategory) => {
              const isActive = group.id === activeGroupId;
              const records = myDataRecords.filter((r: MyDataRecord) => r.group === group.id);
              const visibleRecordsCount = records.filter((r: MyDataRecord) => r.zone !== 'secret' || isVeraCryptMounted).length;

              return (
                <div 
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  className={`group px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all ${
                    isActive 
                      ? 'bg-teal-50 text-[#006763] font-semibold border border-teal-200 shadow-xs' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <User className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#006763]' : 'text-slate-400'}`} />
                    <span className="truncate">{group.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                      isActive ? 'bg-teal-100/60 text-[#006763]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {visibleRecordsCount}
                    </span>
                    <button
                      title="Удалить группу"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroupClick(group.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VeraCrypt Status note in sidebar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-start gap-2">
            {isVeraCryptMounted ? (
              <>
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Том VeraCrypt подключен. Секретные реквизиты (паспорт, СНИЛС) расшифрованы.</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>VeraCrypt отмонтирован. Конфиденциальные реквизиты полностью скрыты (UX-032).</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Records Table & Details */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {/* Group Header & Search */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-800">{activeCategory?.name || 'Группа'}</h2>
              <span className="text-xs text-slate-400 font-mono">
                {groupRecords.length} записей
              </span>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по реквизитам..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
              />
            </div>
          </div>

          {/* Records Table */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-4 font-semibold">Наименование поля</th>
                    <th className="py-2.5 px-4 font-semibold">Значение</th>
                    <th className="py-2.5 px-3 font-semibold w-36">Тип данных</th>
                    <th className="py-2.5 px-3 font-semibold w-28">Зона</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Статус</th>
                    <th className="py-2.5 px-4 text-right font-semibold w-24">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        {searchQuery ? 'По вашему запросу ничего не найдено' : 'В этой группе пока нет реквизитов'}
                      </td>
                    </tr>
                  ) : (
                    groupRecords.map((record: MyDataRecord) => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {record.title}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 max-w-xs truncate">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-semibold select-all">
                            {record.val}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {record.typeName}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {record.zone === 'secret' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" /> Секретно
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              Открыто
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {record.status === 'current' ? 'Актуален' : 'Архив'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleCopy(record.id, record.val)}
                            title="Скопировать значение"
                            className="p-1.5 text-slate-400 hover:text-[#006763] hover:bg-teal-50 rounded transition-colors"
                          >
                            {copiedId === record.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Hint Box */}
            <div className="mt-4 p-4 bg-teal-50/60 border border-teal-200/80 rounded-lg flex items-start gap-3 text-xs text-teal-900">
              <Info className="w-4 h-4 text-[#006763] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Быстрая вставка в форму редактора (SCR-06):</p>
                <p className="text-slate-600 mt-0.5">
                  При заполнении полей карточки документа в сплит-редакторе вы можете вызывать всплывающий лоток «Мои данные», 
                  чтобы мгновенно подставить актуальный номер паспорта, СНИЛС или ИНН без риска опечаток.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Record */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Новый реквизит в «{activeCategory?.name}»</h3>
              <button 
                onClick={() => setIsAddRecordOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateRecord} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Название реквизита</label>
                <input 
                  type="text"
                  required
                  placeholder="например, Номер полиса ДМС или КПП"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006763]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Значение</label>
                <input 
                  type="text"
                  required
                  placeholder="Значение реквизита"
                  value={newVal}
                  onChange={e => setNewVal(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006763]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Тип реквизита</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
                  >
                    <option value="Паспортные данные">Паспортные данные</option>
                    <option value="Цифровой код / СНИЛС">Цифровой код / СНИЛС</option>
                    <option value="Адрес регистрации">Адрес регистрации</option>
                    <option value="Финансовый реквизит">Финансовый реквизит</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Зона хранения</label>
                  <select
                    value={newZone}
                    onChange={e => setNewZone(e.target.value as SecurityZone)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
                  >
                    <option value="open">Открытая (open)</option>
                    <option value="secret">Секретная VeraCrypt</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRecordOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UX-020 Group Deletion Block & Relocation */}
      {deleteModalGroupId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {(() => {
              const group = categories.find((c: MyDataCategory) => c.id === deleteModalGroupId);
              const recordsInGroup = myDataRecords.filter((r: MyDataRecord) => r.group === deleteModalGroupId);
              const isNonEmpty = recordsInGroup.length > 0;
              const otherGroups = categories.filter((c: MyDataCategory) => c.id !== deleteModalGroupId);

              return (
                <div>
                  <div className={`p-4 border-b flex items-center gap-3 ${
                    isNonEmpty ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {isNonEmpty ? (
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">
                        {isNonEmpty ? 'Внимание: Группа содержит записи (UX-020)' : 'Удалить пустую группу'}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Группа «{group?.name}»
                      </p>
                    </div>
                  </div>

                  <div className="p-5 text-xs text-slate-700 space-y-4">
                    {isNonEmpty ? (
                      <>
                        <p className="bg-amber-100/60 text-amber-900 p-3 rounded-md border border-amber-200 leading-relaxed">
                          <strong>Требование регламента UX-020:</strong> Прямое удаление непустой группы категорически заблокировано во избежание потери реквизитов. 
                          Перед удалением группы необходимо перенести все ({recordsInGroup.length}) записей в другую группу.
                        </p>

                        <div>
                          <label className="block font-medium text-slate-800 mb-1.5">
                            Куда переместить {recordsInGroup.length} реквизитов?
                          </label>
                          <select
                            value={targetMoveGroupId}
                            onChange={e => setTargetMoveGroupId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006763]"
                          >
                            {otherGroups.map((og: MyDataCategory) => (
                              <option key={og.id} value={og.id}>
                                {og.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <p>
                        Эта группа пуста. Вы можете безопасно удалить ее без потери данных.
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => setDeleteModalGroupId(null)}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={confirmDeleteGroup}
                      className={`px-4 py-1.5 font-medium text-white rounded-md transition-colors ${
                        isNonEmpty 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {isNonEmpty ? 'Переместить записи и удалить группу' : 'Удалить пустую группу'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
