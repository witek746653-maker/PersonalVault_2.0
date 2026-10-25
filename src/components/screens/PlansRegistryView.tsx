import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { PlanItem, ArchiveDocument } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Link as LinkIcon, 
  Upload, 
  Search, 
  Check, 
  CalendarDays,
  FileText,
  ArrowUpRight
} from 'lucide-react';

export const PlansRegistryView: React.FC = () => {
  const { 
    plans, 
    documents, 
    completePlanWithDoc, 
    cancelPlan, 
    setCurrentScreen, 
    setActiveDocId,
    showToast 
  } = useVault();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Path 1 Modal: Bind Existing Document
  const [bindPlanId, setBindPlanId] = useState<number | null>(null);
  const [selectedDocIdToBind, setSelectedDocIdToBind] = useState<string>(documents[0]?.id || '');

  // Cancel Plan Modal
  const [cancelModalPlanId, setCancelModalPlanId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('Отпала необходимость');

  const filteredPlans = plans.filter((p: PlanItem) => {
    if (filterStatus === 'pending' && p.status !== 'Запланирован') return false;
    if (filterStatus === 'completed' && p.status !== 'Выполнен') return false;
    if (filterStatus === 'cancelled' && p.status !== 'Отменён') return false;
    if (filterStatus === 'overdue' && !p.isOverdue) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (searchQuery) {
      return p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.category.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleConfirmBind = () => {
    if (bindPlanId === null || !selectedDocIdToBind) return;
    const doc = documents.find((d: ArchiveDocument) => d.id === selectedDocIdToBind);
    if (!doc) return;

    completePlanWithDoc(bindPlanId, doc.id, doc.title);
    setBindPlanId(null);
    showToast(`План выполнен: прикреплен архивный документ ${doc.id}`);
  };

  const handleConfirmCancel = () => {
    if (cancelModalPlanId === null) return;
    cancelPlan(cancelModalPlanId, cancelReason);
    setCancelModalPlanId(null);
    showToast('План переведен в статус «Отменён»');
  };

  const handleStartImportPipeline = (planId: number) => {
    showToast('Переход в Пайплайн обработки (SCR-02) с контекстом плана');
    setCurrentScreen('SCR-02');
  };

  const getStatusBadge = (plan: PlanItem) => {
    if (plan.status === 'Выполнен') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Выполнен
        </span>
      );
    }
    if (plan.status === 'Отменён') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <XCircle className="w-3.5 h-3.5" /> Отменён
        </span>
      );
    }
    if (plan.isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" /> Просрочен
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Запланирован
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f4faff] h-full overflow-hidden">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SCR-15: Реестр планов и дедлайнов</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#006763] border border-teal-200">
              События и повторные приемы
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Контроль сроков действия документов, замен паспортов, визитов к врачу и техосмотров с двумя путями закрытия задач.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => showToast('Новый план добавлен в реестр')}
            className="px-3.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Создать задачу / дедлайн
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            {[
              { id: 'all', label: 'Все' },
              { id: 'pending', label: 'Активные' },
              { id: 'overdue', label: 'Просроченные' },
              { id: 'completed', label: 'Выполненные' },
              { id: 'cancelled', label: 'Отменённые' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
          >
            <option value="all">Все категории</option>
            <option value="Здоровье">Здоровье</option>
            <option value="Финансы">Финансы</option>
            <option value="Жильё">Жильё</option>
            <option value="Авто">Авто</option>
          </select>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
          />
        </div>
      </div>

      {/* Plans List / Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan: PlanItem) => {
            const isFinished = plan.status === 'Выполнен' || plan.status === 'Отменён';

            return (
              <div 
                key={plan.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {plan.category}
                    </span>
                    {getStatusBadge(plan)}
                  </div>

                  <h3 className="font-semibold text-slate-800 text-sm mb-1.5">
                    {plan.title}
                  </h3>

                  {plan.notes && (
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {plan.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 font-mono">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span>Срок: {plan.deadline} ({plan.relative})</span>
                  </div>

                  {plan.linkedDoc && (
                    <div 
                      onClick={() => {
                        setActiveDocId(plan.linkedDoc!.code);
                        setCurrentScreen('SCR-11');
                      }}
                      className="p-2.5 bg-teal-50/70 border border-teal-200/80 rounded-lg text-xs text-[#006763] cursor-pointer hover:bg-teal-100/60 transition-colors flex items-center justify-between group mb-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium">{plan.linkedDoc.name}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-slate-100 mt-2">
                  {!isFinished ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => {
                            setBindPlanId(plan.id);
                            setSelectedDocIdToBind(documents[0]?.id || '');
                          }}
                          className="px-2.5 py-1.5 border border-teal-300 bg-teal-50 text-[#006763] hover:bg-teal-100 rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors"
                          title="Путь 1: прикрепить уже имеющийся в архиве документ"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Из архива
                        </button>
                        <button
                          onClick={() => handleStartImportPipeline(plan.id)}
                          className="px-2.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors"
                          title="Путь 2: загрузить новый документ через инбокс"
                        >
                          <Upload className="w-3 h-3" />
                          Загрузить
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          onClick={() => completePlanWithDoc(plan.id, 'PV-MANUAL', 'Подтверждено без файла')}
                          className="hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Завершить без файла
                        </button>
                        <button
                          onClick={() => setCancelModalPlanId(plan.id)}
                          className="hover:text-rose-600"
                        >
                          Отменить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Статус зафиксирован</span>
                      {plan.status === 'Выполнен' && (
                        <span className="text-emerald-600 flex items-center gap-1 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Выполнено
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Path 1 - Bind Existing Document */}
      {bindPlanId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Привязать документ из архива (Путь 1)</h3>
                <p className="text-xs text-slate-500">Выбор архивной записи для закрытия дедлайна</p>
              </div>
              <button onClick={() => setBindPlanId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Выберите документ</label>
                <select
                  value={selectedDocIdToBind}
                  onChange={e => setSelectedDocIdToBind(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006763]"
                >
                  {documents.map((doc: ArchiveDocument) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} ({doc.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
                После подтверждения план перейдет в статус <strong>«Выполнен»</strong>, а в карточке документа появится обратная перекрестная ссылка на задачу.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setBindPlanId(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmBind}
                className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium"
              >
                Привязать и завершить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Plan Confirmation */}
      {cancelModalPlanId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Отменить план / дедлайн?</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>Укажите причину отмены:</p>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="Отпала необходимость">Отпала необходимость</option>
                <option value="Перенесено на следующий год">Перенесено на следующий год</option>
                <option value="Выполнено другим лицом">Выполнено другим лицом</option>
                <option value="Ошибочная запись">Ошибочная запись</option>
              </select>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setCancelModalPlanId(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
              >
                Назад
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium"
              >
                Подтвердить отмену
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
