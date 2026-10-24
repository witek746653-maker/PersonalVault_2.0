import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { PlanItem, StorageZone } from '../../types/vault';

export const PlansScreen: React.FC = () => {
  const {
    plans,
    selectedPlanId,
    setSelectedPlanId,
    addPlan,
    updatePlan,
    completePlanWithDoc,
    cancelPlan,
    deletePlan,
    documents,
    navigateTo,
    isVeraCryptMounted,
    showToast
  } = useVault();

  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'overdue' | 'completed' | 'canceled'>('all');
  const [zoneFilter, setZoneFilter] = useState<'all' | StorageZone>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Сделка отменена');
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

  // New plan form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Жильё');
  const [formZone, setFormZone] = useState<StorageZone>('open');
  const [formDeadline, setFormDeadline] = useState('2026-11-15');
  const [formNotes, setFormNotes] = useState('');

  // Filtered plans
  const filteredPlans = plans.filter(p => {
    if (!isVeraCryptMounted && p.zone === 'secret') return false;
    if (zoneFilter !== 'all' && p.zone !== zoneFilter) return false;
    if (statusFilter === 'planned' && p.status !== 'planned') return false;
    if (statusFilter === 'overdue' && !p.isOverdue) return false;
    if (statusFilter === 'completed' && p.status !== 'completed') return false;
    if (statusFilter === 'canceled' && p.status !== 'canceled') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || filteredPlans[0];

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormTitle('');
    setFormCategory('Жильё');
    setFormZone('open');
    setFormDeadline('2026-11-15');
    setFormNotes('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanItem) => {
    setEditingPlan(plan);
    setFormTitle(plan.title);
    setFormCategory(plan.category);
    setFormZone(plan.zone);
    setFormDeadline(plan.deadline);
    setFormNotes(plan.notes);
    setIsCreateModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!formTitle.trim()) {
      showToast('Укажите название плана документа', 'warning');
      return;
    }

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        title: formTitle,
        category: formCategory,
        zone: formZone,
        deadline: formDeadline,
        notes: formNotes
      });
    } else {
      addPlan({
        title: formTitle,
        category: formCategory,
        zone: formZone,
        deadline: formDeadline,
        relative: 'в графике',
        status: 'planned',
        isOverdue: false,
        notes: formNotes
      });
    }
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Sub-header */}
      <div className="bg-surface-container-low px-4 py-2.5 flex items-center justify-between border-b border-surface-container-highest shadow-xs mb-3 rounded-lg flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-primary">calendar_clock</span>
          <div>
            <h1 className="font-bold text-[14px] text-on-surface leading-tight">Планы документов (SCR-15)</h1>
            <span className="text-[11px] text-secondary">
              Планируемые и ожидаемые документы, контроль сроков получения и связывание с архивом
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-7 px-3 rounded bg-primary text-on-primary hover:bg-primary-container text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          <span>Создать план</span>
        </button>
      </div>

      {/* Toolbar Filters & Search */}
      <div className="bg-surface-container-lowest p-2 rounded-lg border border-surface-container-highest shadow-xs mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-primary-container text-on-primary-container font-bold shadow-xs' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Все</span>
            <span className="px-1 rounded bg-surface-container text-secondary font-code text-[10px]">{plans.length}</span>
          </button>
          <button
            onClick={() => setStatusFilter('planned')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              statusFilter === 'planned' ? 'bg-primary-container text-on-primary-container font-bold shadow-xs' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Запланированы</span>
            <span className="px-1 rounded bg-surface-container text-secondary font-code text-[10px]">
              {plans.filter(p => p.status === 'planned').length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              statusFilter === 'overdue' ? 'bg-error-container text-on-error-container font-bold shadow-xs' : 'text-error hover:opacity-80'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            <span>Просрочены</span>
            <span className="px-1 rounded bg-error-container text-on-error-container font-code text-[10px]">
              {plans.filter(p => p.isOverdue).length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              statusFilter === 'completed' ? 'bg-primary-container text-on-primary-container font-bold shadow-xs' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Выполнены</span>
            <span className="px-1 rounded bg-surface-container text-secondary font-code text-[10px]">
              {plans.filter(p => p.status === 'completed').length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('canceled')}
            className={`h-6 px-2.5 rounded font-medium flex items-center gap-1 transition-all cursor-pointer ${
              statusFilter === 'canceled' ? 'bg-primary-container text-on-primary-container font-bold shadow-xs' : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Отменены</span>
            <span className="px-1 rounded bg-surface-container text-secondary font-code text-[10px]">
              {plans.filter(p => p.status === 'canceled').length}
            </span>
          </button>
        </div>

        {/* Search & Zone */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center w-48">
            <span className="material-symbols-outlined absolute left-2 text-[14px] text-secondary pointer-events-none">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск планов..."
              className="w-full h-7 pl-6 pr-2 rounded bg-surface-container-low text-[11px] text-on-surface outline-none border border-surface-container-highest"
            />
          </div>

          <div className="flex items-center bg-surface-container rounded p-0.5 border border-surface-container-highest">
            <button
              onClick={() => setZoneFilter('all')}
              className={`px-2 py-0.5 rounded cursor-pointer ${zoneFilter === 'all' ? 'bg-surface-container-lowest text-primary font-bold shadow-xs' : 'text-secondary'}`}
            >
              Все
            </button>
            <button
              onClick={() => setZoneFilter('open')}
              className={`px-2 py-0.5 rounded cursor-pointer ${zoneFilter === 'open' ? 'bg-surface-container-lowest text-primary font-bold shadow-xs' : 'text-secondary'}`}
            >
              Open
            </button>
            <button
              onClick={() => setZoneFilter('secret')}
              className={`px-2 py-0.5 rounded cursor-pointer flex items-center gap-0.5 ${zoneFilter === 'secret' ? 'bg-surface-container-lowest text-error font-bold shadow-xs' : 'text-secondary'}`}
            >
              <span className="material-symbols-outlined text-[11px]">lock</span>
              Secret
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* LEFT: Plans Table (7 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-surface-container text-secondary text-[10px] font-semibold uppercase tracking-wider h-8 border-b border-surface-container-highest">
                  <th className="px-3">Название плана документа</th>
                  <th className="px-2 w-24">Категория</th>
                  <th className="px-2 w-16">Зона</th>
                  <th className="px-2 w-32">Целевой срок</th>
                  <th className="px-2 w-28">Состояние</th>
                  <th className="px-2 w-36">Связь с архивом</th>
                  <th className="px-2 w-20 text-right pr-3">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredPlans.map(plan => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <tr
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`h-9 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-fixed/20 font-medium' : 'hover:bg-surface-container-low bg-surface-container-lowest'
                      } ${plan.status === 'canceled' ? 'opacity-70' : ''}`}
                    >
                      <td className="px-3">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`material-symbols-outlined text-[15px] shrink-0 ${
                            plan.isOverdue ? 'text-error' : plan.status === 'completed' ? 'text-primary' : 'text-secondary'
                          }`}>
                            {plan.isOverdue ? 'warning' : plan.status === 'completed' ? 'task_alt' : 'description'}
                          </span>
                          <span className={`truncate ${plan.status === 'canceled' ? 'line-through text-secondary' : 'text-on-surface'}`}>
                            {plan.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 font-body-sm text-[11px] text-secondary truncate">{plan.category}</td>
                      <td className="px-2">
                        <span className={`px-1.5 py-0.2 rounded font-code text-[10px] font-semibold ${
                          plan.zone === 'secret' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-secondary'
                        }`}>
                          {plan.zone === 'secret' ? 'Secret' : 'Open'}
                        </span>
                      </td>
                      <td className={`px-2 font-code text-[11px] ${plan.isOverdue ? 'text-error font-bold' : 'text-secondary'}`}>
                        {plan.deadline}
                      </td>
                      <td className="px-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          plan.isOverdue ? 'bg-error-container text-on-error-container' :
                          plan.status === 'completed' ? 'bg-primary-fixed text-on-primary-fixed' :
                          plan.status === 'canceled' ? 'bg-surface-container text-outline' :
                          'bg-surface-container text-primary'
                        }`}>
                          {plan.isOverdue ? 'Просрочен' :
                           plan.status === 'completed' ? 'Выполнен' :
                           plan.status === 'canceled' ? 'Отменён' :
                           'Запланирован'}
                        </span>
                      </td>
                      <td className="px-2 font-code text-[11px] truncate">
                        {plan.linkedDoc ? (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              navigateTo('kartochka', { docId: plan.linkedDoc!.id });
                            }}
                            className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">attachment</span>
                            <span>{plan.linkedDoc.id}</span>
                          </span>
                        ) : (
                          <span className="text-outline">—</span>
                        )}
                      </td>
                      <td className="px-2 text-right pr-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {plan.status === 'planned' && (
                            <button
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                setIsCompleteModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary text-primary hover:text-on-primary text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Выполнить
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(plan)}
                            className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container cursor-pointer"
                            title="Правка"
                          >
                            <span className="material-symbols-outlined text-[13px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Selected Plan Inspector (4 cols) */}
        {selectedPlan && (
          <div className="col-span-12 lg:col-span-4 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-3.5 gap-3 text-[12px]">
            <div className="flex items-start justify-between pb-1.5 border-b border-surface-container">
              <div>
                <span className="text-[10px] text-outline uppercase font-semibold">Карточка плана</span>
                <h2 className="font-bold text-[14px] text-on-surface leading-tight mt-0.5">{selectedPlan.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedPlan.status === 'completed' ? 'bg-primary-fixed text-on-primary-fixed' :
                selectedPlan.isOverdue ? 'bg-error-container text-on-error-container' :
                'bg-surface-container text-primary'
              }`}>
                {selectedPlan.isOverdue ? 'Просрочен' : selectedPlan.status === 'completed' ? 'Выполнен' : 'Запланирован'}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] text-secondary font-code">
                Зона: {selectedPlan.zone === 'secret' ? 'Secret' : 'Open'}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] text-secondary">
                {selectedPlan.category}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5 text-[11px]">
              <div>
                <span className="text-secondary text-[10px] block">Целевой срок (дедлайн):</span>
                <div className="flex justify-between items-center font-bold text-on-surface font-code text-[12px]">
                  <span>{selectedPlan.deadline}</span>
                  <span className="text-[11px] text-secondary font-normal font-sans">({selectedPlan.relative})</span>
                </div>
              </div>

              <div className="pt-1 border-t border-surface-container">
                <span className="text-secondary text-[10px] block mb-0.5">Инструкция / Заметки:</span>
                <p className="text-on-surface leading-relaxed">{selectedPlan.notes || 'Инструкция не указана'}</p>
              </div>
            </div>

            {/* Connection with archive */}
            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-secondary uppercase text-[10px]">Связь с архивом (SCR-01)</span>
                <span className="material-symbols-outlined text-[13px] text-outline">link</span>
              </div>

              {selectedPlan.linkedDoc ? (
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">attachment</span>
                    <span>{selectedPlan.linkedDoc.id} — {selectedPlan.linkedDoc.name}</span>
                  </div>
                  <button
                    onClick={() => navigateTo('kartochka', { docId: selectedPlan.linkedDoc!.id })}
                    className="w-full h-7 rounded bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer mt-1"
                  >
                    <span>Открыть карточку документа</span>
                    <span className="material-symbols-outlined text-[13px]">north_east</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-secondary text-[11px]">
                    Документ пока не получен. При получении свяжите его с архивом.
                  </span>
                  <button
                    onClick={() => setIsCompleteModalOpen(true)}
                    className="w-full h-7 rounded bg-primary text-on-primary font-bold text-[11px] hover:bg-primary-container shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">task_alt</span>
                    <span>Выполнить (связать с архивом)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-surface-container">
              <button
                onClick={() => handleOpenEdit(selectedPlan)}
                className="flex-1 h-7 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span>Изменить</span>
              </button>
              {selectedPlan.status === 'planned' && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="h-7 px-2.5 rounded hover:bg-surface-container text-secondary text-[11px] flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Отменить</span>
                </button>
              )}
              <button
                onClick={() => deletePlan(selectedPlan.id)}
                className="h-7 w-7 rounded hover:bg-error-container hover:text-error text-secondary flex items-center justify-center cursor-pointer"
                title="Удалить план"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Plan */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest text-[12px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-surface-container">
              <span className="font-bold text-[13px] text-on-surface">
                {editingPlan ? 'Редактирование плана документа' : 'Новый план документа'}
              </span>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-semibold text-secondary">Название ожидаемого документа *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Например: Справка 2-НДФЛ, Выписка ЕГРН..."
                  className="h-7 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] font-semibold text-secondary">Категория</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="h-7 px-1.5 rounded bg-surface-container-low text-on-surface border border-surface-container-highest"
                  >
                    <option value="Жильё">Жильё</option>
                    <option value="Работа">Работа</option>
                    <option value="Авто">Авто</option>
                    <option value="Здоровье">Здоровье</option>
                    <option value="Финансы">Финансы</option>
                  </select>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] font-semibold text-secondary">Зона</label>
                  <select
                    value={formZone}
                    onChange={e => setFormZone(e.target.value as StorageZone)}
                    className="h-7 px-1.5 rounded bg-surface-container-low text-on-surface border border-surface-container-highest"
                  >
                    <option value="open">Open (Открытая)</option>
                    <option value="secret">Secret (VeraCrypt)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-semibold text-secondary">Целевой срок (Дедлайн)</label>
                <input
                  type="text"
                  value={formDeadline}
                  onChange={e => setFormDeadline(e.target.value)}
                  className="h-7 px-2 rounded bg-surface-container-low text-on-surface font-code border border-surface-container-highest"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-semibold text-secondary">Инструкция / Где заказывать</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  className="p-1.5 rounded bg-surface-container-low text-on-surface text-[11px] outline-none border border-surface-container-highest resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px]"
              >
                Отмена
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-bold text-[11px] shadow-xs"
              >
                Сохранить план
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Complete Plan & Link to Archive */}
      {isCompleteModalOpen && selectedPlan && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCompleteModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest text-[12px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-surface-container">
              <div className="flex items-center gap-1.5 text-primary font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                <span>Выполнение плана: выбор документа архива</span>
              </div>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-secondary">
              План: <strong className="text-on-surface font-semibold">{selectedPlan.title}</strong>. Выберите документ из архива для связывания:
            </p>

            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {documents.filter(d => !d.isArchived).map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    completePlanWithDoc(selectedPlan.id, doc.id);
                    setIsCompleteModalOpen(false);
                  }}
                  className="p-2 rounded bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer border border-surface-container-highest transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-on-surface truncate">{doc.id} — {doc.name}</span>
                      <span className="text-[10px] text-secondary font-code">{doc.date} • {doc.path}</span>
                    </div>
                  </div>
                  <button className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-bold text-[10px] shadow-xs shrink-0">
                    Привязать
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-surface-container flex justify-between items-center">
              <button
                onClick={() => {
                  setIsCompleteModalOpen(false);
                  navigateTo('vkhodyashchie');
                }}
                className="text-primary hover:underline text-[11px] font-medium"
              >
                Или импортировать новый через Входящие →
              </button>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancel Plan */}
      {isCancelModalOpen && selectedPlan && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest text-[12px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 text-secondary font-bold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Отмена плана документа</span>
            </div>
            <p className="text-on-surface">
              Перевести план «{selectedPlan.title}» в состояние «Отменён»? Запись сохранится для истории.
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Причина отмены..."
              className="h-7 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest text-[11px]"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px]"
              >
                Назад
              </button>
              <button
                onClick={() => {
                  cancelPlan(selectedPlan.id, cancelReason);
                  setIsCancelModalOpen(false);
                }}
                className="px-3 py-1 rounded bg-secondary text-on-secondary hover:opacity-90 font-bold text-[11px]"
              >
                Отменить план
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
