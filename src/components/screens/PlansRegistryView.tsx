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
  ArrowUpRight,
  RefreshCw,
  X,
  Shield,
  ArrowRight,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  FileUp
} from 'lucide-react';

export type PlanImportStage = 
  | 'started'           // 1. импорт начат
  | 'waiting'           // 2. ожидание результата
  | 'success_linked'    // 3. успешное завершение с привязкой документа
  | 'cancelled'         // 4. отмена импорта
  | 'error';            // 5. ошибка

interface PlanImportState {
  stage: PlanImportStage;
  docCode?: string;
  docTitle?: string;
  timestamp: string;
  errorDetail?: string;
}

export const PlansRegistryView: React.FC = () => {
  const { 
    plans, 
    documents, 
    completePlanWithDoc, 
    cancelPlan, 
    setCurrentScreen, 
    setActiveDocId,
    showToast,
    plansState,
    setPlansState,
  } = useVault();

  const filterStatus = plansState.filterStatus;
  const setFilterStatus = (s: string) => setPlansState(prev => ({ ...prev, filterStatus: s }));

  const filterCategory = plansState.filterCategory;
  const setFilterCategory = (c: string) => setPlansState(prev => ({ ...prev, filterCategory: c }));

  const searchQuery = plansState.searchQuery;
  const setSearchQuery = (q: string) => setPlansState(prev => ({ ...prev, searchQuery: q }));

  // Path 1 Modal: Bind Existing Document
  const [bindPlanId, setBindPlanId] = useState<number | null>(null);
  const [selectedDocIdToBind, setSelectedDocIdToBind] = useState<string>(documents[0]?.id || '');

  // Cancel Plan Modal
  const [cancelModalPlanId, setCancelModalPlanId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('Отпала необходимость');

  // Path 2: Import New Document Workflow (UI-scenario with 5 states)
  const [importModalPlanId, setImportModalPlanId] = useState<number | null>(null);
  const [importStage, setImportStage] = useState<PlanImportStage>('started');
  const [importFileName, setImportFileName] = useState<string>('Vypiska_EGRN_Nov2026.pdf');
  const [importFileSize, setImportFileSize] = useState<string>('2.4 МБ');
  const [importProgress, setImportProgress] = useState<number>(84);
  const [simulatedDocCode, setSimulatedDocCode] = useState<string>('PV-0044');
  const [simulatedDocTitle, setSimulatedDocTitle] = useState<string>('Выписка из ЕГРН (электронная подпись)');
  const [importErrorMessage, setImportErrorMessage] = useState<string>(
    'ERR_INTEGRITY_MISMATCH: Несовпадение контрольной суммы скана или повреждён PDF-контейнер на странице 2'
  );

  // Per-plan import state tracking for visual indicators in the registry
  const [planImportStates, setPlanImportStates] = useState<Record<number, PlanImportState>>({});

  const activeImportPlan = plans.find(p => p.id === importModalPlanId) || null;

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

  // Open the Path 2 Import Workflow Modal
  const handleOpenImportWorkflow = (plan: PlanItem, initialStage: PlanImportStage = 'started') => {
    setImportModalPlanId(plan.id);
    setImportStage(initialStage);
    const defaultDocCode = `PV-00${43 + (plan.id % 20)}`;
    setSimulatedDocCode(defaultDocCode);

    if (plan.category === 'Жильё') {
      setImportFileName('Vypiska_EGRN_Moskovsky_2026.pdf');
      setSimulatedDocTitle('Выписка из ЕГРН на квартиру на Московском пр.');
    } else if (plan.category === 'Авто') {
      setImportFileName('Polis_OSAGO_2027_signed.pdf');
      setSimulatedDocTitle('Полис ОСАГО на 2027 год (продление)');
    } else if (plan.category === 'Работа') {
      setImportFileName('Spravka_2NDFL_2026_stamped.pdf');
      setSimulatedDocTitle('Справка 2-НДФЛ за 2026 год от работодателя');
    } else {
      setImportFileName(`${plan.title.replace(/[\s\W]+/g, '_').slice(0, 22)}.pdf`);
      setSimulatedDocTitle(plan.title);
    }
    setImportFileSize('2.4 МБ');
    setImportProgress(84);

    // Save status in tracking
    setPlanImportStates(prev => ({
      ...prev,
      [plan.id]: {
        stage: initialStage,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        errorDetail: initialStage === 'error' ? importErrorMessage : undefined,
      }
    }));
  };

  // Switch demo stage inside modal
  const handleSwitchImportStage = (stage: PlanImportStage) => {
    setImportStage(stage);
    if (importModalPlanId !== null) {
      setPlanImportStates(prev => ({
        ...prev,
        [importModalPlanId]: {
          stage,
          docCode: stage === 'success_linked' ? simulatedDocCode : undefined,
          docTitle: stage === 'success_linked' ? simulatedDocTitle : undefined,
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          errorDetail: stage === 'error' ? importErrorMessage : undefined,
        }
      }));
    }
  };

  // Confirm binding from success state
  const handleConfirmImportBinding = () => {
    if (!activeImportPlan) return;
    completePlanWithDoc(activeImportPlan.id, simulatedDocCode, simulatedDocTitle);
    setPlanImportStates(prev => ({
      ...prev,
      [activeImportPlan.id]: {
        stage: 'success_linked',
        docCode: simulatedDocCode,
        docTitle: simulatedDocTitle,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      }
    }));
    setImportModalPlanId(null);
    showToast(`План выполнен: привязан импортированный документ ${simulatedDocCode}`);
  };

  // Reject binding after success: document stays in archive, plan stays uncompleted!
  const handleRejectImportBinding = () => {
    if (!activeImportPlan) return;
    setPlanImportStates(prev => ({
      ...prev,
      [activeImportPlan.id]: {
        stage: 'cancelled',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      }
    }));
    setImportModalPlanId(null);
    showToast('Документ сохранён в архиве. План остался незавершённым');
  };

  // Cancel import action: plan visually remains uncompleted!
  const handleCancelImportAction = () => {
    if (activeImportPlan) {
      setPlanImportStates(prev => ({
        ...prev,
        [activeImportPlan.id]: {
          stage: 'cancelled',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        }
      }));
    }
    setImportStage('cancelled');
    showToast('Импорт отменён. План остался незавершённым');
  };

  // Trigger error simulation: plan visually remains uncompleted!
  const handleSimulateErrorAction = () => {
    if (activeImportPlan) {
      setPlanImportStates(prev => ({
        ...prev,
        [activeImportPlan.id]: {
          stage: 'error',
          errorDetail: importErrorMessage,
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        }
      }));
    }
    setImportStage('error');
    showToast('Сбой валидации: файл отклонён, план не закрыт', 'warning');
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
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Реестр планов и дедлайнов (SCR-15)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#006763] border border-teal-200">
              События и повторные приемы
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Контроль сроков действия документов, замен паспортов и выписок с двумя путями закрытия: из архива или через импорт нового документа.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md overflow-x-auto">
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
                className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
          >
            <option value="all">Все категории</option>
            <option value="Жильё">Жильё</option>
            <option value="Работа">Работа</option>
            <option value="Авто">Авто</option>
            <option value="Здоровье">Здоровье</option>
            <option value="Финансы">Финансы</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64 lg:w-80">
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

      {/* Plans Grid */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {filteredPlans.map((plan: PlanItem) => {
            const isFinished = plan.status === 'Выполнен' || plan.status === 'Отменён';
            const importState = planImportStates[plan.id];

            return (
              <div 
                key={plan.id}
                className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                  importState?.stage === 'error'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : importState?.stage === 'cancelled'
                    ? 'border-slate-300'
                    : importState?.stage === 'waiting'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : importState?.stage === 'started'
                    ? 'border-sky-300 ring-1 ring-sky-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {plan.category}
                    </span>
                    {getStatusBadge(plan)}
                  </div>

                  <h3 className="font-semibold text-slate-800 text-sm mb-1.5 leading-snug">
                    {plan.title}
                  </h3>

                  {plan.notes && (
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {plan.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 font-mono">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span>Срок: {plan.deadline} ({plan.relative})</span>
                  </div>

                  {/* Linked Document Card (if plan is completed) */}
                  {plan.linkedDoc && (
                    <div 
                      onClick={() => {
                        setActiveDocId(plan.linkedDoc!.code);
                        setCurrentScreen('SCR-11', 'Реестр планов');
                      }}
                      className="p-2.5 bg-teal-50/70 border border-teal-200/80 rounded-lg text-xs text-[#006763] cursor-pointer hover:bg-teal-100/60 transition-colors flex items-center justify-between group mb-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium">{plan.linkedDoc.code} — {plan.linkedDoc.name}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </div>
                  )}

                  {/* Inline Visual Indicator of Import Scenario State on Plan Card */}
                  {importState && (
                    <div 
                      onClick={() => handleOpenImportWorkflow(plan, importState.stage)}
                      className="cursor-pointer mb-2"
                    >
                      {importState.stage === 'started' && (
                        <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-800 flex items-start gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-semibold flex items-center gap-1">
                              Импорт начат
                              <span className="text-[10px] text-sky-600 font-normal">({importState.timestamp})</span>
                            </div>
                            <div className="text-[10px] text-sky-700 leading-tight">
                              Контекст передан в конвейер. План пока не завершён.
                            </div>
                          </div>
                        </div>
                      )}

                      {importState.stage === 'waiting' && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-semibold flex items-center gap-1">
                              Ожидание результата
                              <span className="text-[10px] text-amber-600 font-normal">(84%)</span>
                            </div>
                            <div className="text-[10px] text-amber-700 leading-tight">
                              Выполняется OCR-сверка. План ожидает подтверждения.
                            </div>
                          </div>
                        </div>
                      )}

                      {importState.stage === 'cancelled' && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-700 flex items-center gap-1">
                              Импорт отменён
                              <span className="text-[10px] text-slate-500 font-normal">({importState.timestamp})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              Операция прервана. План визуально остаётся незавершённым («Запланирован»).
                            </div>
                          </div>
                        </div>
                      )}

                      {importState.stage === 'error' && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-semibold text-rose-800 flex items-center gap-1">
                              Ошибка импорта
                              <span className="text-[10px] text-rose-600 font-normal">({importState.timestamp})</span>
                            </div>
                            <div className="text-[10px] text-rose-600 leading-tight">
                              Сбой валидации файла. План визуально остаётся незавершённым («Запланирован»).
                            </div>
                          </div>
                        </div>
                      )}

                      {importState.stage === 'success_linked' && plan.status === 'Выполнен' && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-semibold text-emerald-800">
                              Успешно выполнен через импорт
                            </div>
                            <div className="text-[10px] text-emerald-700 leading-tight">
                              Связан с новым документом архива ({importState.docCode || plan.linkedDoc?.code}).
                            </div>
                          </div>
                        </div>
                      )}
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
                          className="px-2.5 py-1.5 border border-teal-300 bg-teal-50 text-[#006763] hover:bg-teal-100 rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Путь 1: прикрепить уже имеющийся в архиве документ"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Из архива
                        </button>
                        <button
                          onClick={() => handleOpenImportWorkflow(plan, 'started')}
                          className="px-2.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Путь 2: выполнение плана через импорт нового документа"
                        >
                          <Upload className="w-3 h-3" />
                          Загрузить
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          onClick={() => completePlanWithDoc(plan.id, 'PV-MANUAL', 'Подтверждено без файла')}
                          className="hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Без файла
                        </button>
                        <button
                          onClick={() => setCancelModalPlanId(plan.id)}
                          className="hover:text-rose-600 cursor-pointer"
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

      {/* ======================================================== */}
      {/* MODAL: Path 2 - UI-Scenario for Import of New Document   */}
      {/* ======================================================== */}
      {importModalPlanId !== null && activeImportPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#006763]/10 text-[#006763] flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">
                    Выполнение плана через импорт нового документа (Путь 2)
                  </h3>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                    <span>План: <strong className="text-slate-700 font-medium">{activeImportPlan.title}</strong></span>
                    <span>•</span>
                    <span>Зона: <span className="font-mono text-[10px] bg-slate-200/70 px-1 py-0.2 rounded">{activeImportPlan.zone}</span></span>
                    <span>•</span>
                    <span>Дедлайн: <span className="font-mono">{activeImportPlan.deadline}</span></span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setImportModalPlanId(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Process Stage Indicator (Release view) */}
            <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">Этап:</span>
                {importStage === 'started' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                    <Upload className="w-3 h-3" /> Шаг 1: Подготовка к импорту
                  </span>
                )}
                {importStage === 'waiting' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                    <Clock className="w-3 h-3" /> Шаг 2: Обработка и сверка скана
                  </span>
                )}
                {importStage === 'success_linked' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Шаг 3: Документ зафиксирован
                  </span>
                )}
                {importStage === 'cancelled' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
                    <XCircle className="w-3 h-3" /> Импорт отменён
                  </span>
                )}
                {importStage === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" /> Ошибка валидации
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {activeImportPlan.zone} • {activeImportPlan.category}
              </div>
            </div>

            {/* Modal Body: Depends on active state */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">

              {/* ---------------------------------------------------- */}
              {/* STATE 1: ИМПОРТ НАЧАТ                                */}
              {/* ---------------------------------------------------- */}
              {importStage === 'started' && (
                <div className="space-y-4">
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sky-900 text-[13px] flex items-center gap-2">
                        Состояние 1: Импорт начат
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-200/70 text-sky-800">
                          Инициализация
                        </span>
                      </div>
                      <p className="text-sky-800 text-xs mt-1 leading-relaxed">
                        Файл выбран пользователем и зарегистрирован во входящем пакете. Система передала контекст плана (название, категорию и зону безопасности) в локальный конвейер обработки.
                      </p>
                    </div>
                  </div>

                  {/* File Details Card */}
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Входящий документ для выполнения плана:
                    </div>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded bg-teal-50 text-[#006763] flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-xs truncate">
                            {importFileName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {importFileSize} • PDF/A-1b • 300 DPI • SHA-256 ожидается
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-mono shrink-0">
                        Входной пакет
                      </span>
                    </div>

                    {/* Context inheritance card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Наследуемый план:</span>
                        <span className="font-medium text-slate-700 truncate block">{activeImportPlan.title}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Целевая категория:</span>
                        <span className="font-medium text-slate-700 block">{activeImportPlan.category}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Зона хранения:</span>
                        <span className="font-mono text-slate-700 block">{activeImportPlan.zone} (VeraCrypt)</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Visual State Status box */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Текущее состояние плана в реестре:</span> План остаётся в статусе <strong className="font-semibold">«Запланирован»</strong> (незавершён). Фиктивных записей в постоянном архиве не создаётся до подтверждения привязки.
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STATE 2: ОЖИДАНИЕ РЕЗУЛЬТАТА                         */}
              {/* ---------------------------------------------------- */}
              {importStage === 'waiting' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900 text-[13px] flex items-center gap-2">
                        Состояние 2: Ожидание результата импорта
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900 animate-pulse">
                          Обработка конвейера {importProgress}%
                        </span>
                      </div>
                      <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                        Выполняется локальная цепочка: предпроверка пригодности скана, вычисление хэша SHA-256, OCR-распознавание и автозаполнение карточки. План ожидает завершения процесса.
                      </p>
                    </div>
                  </div>

                  {/* Pipeline Progress Steps */}
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Прогресс локальной верификации файла:</span>
                      <span className="font-mono text-[#006763]">{importProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#006763] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>1. Проверка контрольной суммы SHA-256</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">c79e4a28...OK</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>2. Предпроверка пригодности (DPI, геометрия, ориентация)</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">Пригоден</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-amber-50/80 border border-amber-300">
                        <div className="flex items-center gap-2 text-amber-900 font-medium">
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>3. OCR-распознавание текста и сопоставление со схемой плана</span>
                        </div>
                        <span className="text-[11px] text-amber-800 font-mono">В процессе...</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-white/70 border border-dashed border-slate-300 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-300" />
                          <span>4. Фиксация в архивном томе и перекрёстная привязка к плану</span>
                        </div>
                        <span className="text-[10px]">Ожидание</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Visual State Status box */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Текущее состояние плана:</span> План остаётся <strong className="font-semibold">незавершённым</strong> (статус «Запланирован»). Если операция будет отменена пользователем или произойдёт ошибка, план визуально сохранит открытый статус.
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STATE 3: УСПЕШНОЕ ЗАВЕРШЕНИЕ С ПРИВЯЗКОЙ             */}
              {/* ---------------------------------------------------- */}
              {importStage === 'success_linked' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-emerald-900 text-[13px] flex items-center gap-2">
                        Состояние 3: Успешное завершение с привязкой документа
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200 text-emerald-900">
                          Готов к закрытию плана
                        </span>
                      </div>
                      <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
                        Документ успешно обработан, прошёл сверку реквизитов и зафиксирован в хранилище. Для окончательного закрытия дедлайна подтвердите привязку архивного документа к плану.
                      </p>
                    </div>
                  </div>

                  {/* Generated Document Card */}
                  <div className="border border-emerald-200 rounded-lg p-3.5 bg-emerald-50/40 space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                      Сформированный архивный документ:
                    </div>

                    <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#006763] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              {simulatedDocCode}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs truncate">
                              {simulatedDocTitle}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-1 space-x-2">
                            <span>Хеш: SHA-256 9f8e7d6c...</span>
                            <span>•</span>
                            <span>Размер: {importFileSize}</span>
                            <span>•</span>
                            <span>Дата: {new Date().toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium shrink-0">
                        Зафиксирован
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs space-y-1.5">
                      <div className="font-semibold text-slate-800">
                        Подтверждение закрытия плана:
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        При нажатии <strong className="text-[#006763]">«Привязать и завершить план»</strong> статус плана будет переведён в <strong className="text-emerald-700">«Выполнен»</strong>, статус просроченности снят, а в карточке появится обратная ссылка на документ <span className="font-mono">{simulatedDocCode}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STATE 4: ОТМЕНА ИМПОРТА                              */}
              {/* ---------------------------------------------------- */}
              {importStage === 'cancelled' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-[13px] flex items-center gap-2">
                        Состояние 4: Импорт отменён пользователем
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                          Прервано
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                        Пользователь прервал цепочку импорта документа. В постоянное хранилище не было внесено никаких изменений, фиктивных архивных файлов не создано.
                      </p>
                    </div>
                  </div>

                  {/* Critical Requirement Verification Card */}
                  <div className="p-4 bg-white border-2 border-slate-300 rounded-lg space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                      <Shield className="w-4 h-4 text-slate-600" />
                      Визуальное состояние плана: остаётся незавершённым
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800 text-xs">
                          {activeImportPlan.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Дедлайн: {activeImportPlan.deadline} ({activeImportPlan.relative})
                        </div>
                      </div>
                      <div>
                        {activeImportPlan.isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Просрочен
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Запланирован
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Статус плана сохранён: «Запланирован» (не переведён в «Выполнен»)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Связанный документ: отсутствует (фиктивных ссылок нет)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Дедлайн и контроль сроков продолжают действовать</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STATE 5: ОШИБКА ИМПОРТА                              */}
              {/* ---------------------------------------------------- */}
              {importStage === 'error' && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-rose-900 text-[13px] flex items-center gap-2">
                        Состояние 5: Ошибка при импорте документа
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-200 text-rose-900">
                          Сбой валидации
                        </span>
                      </div>
                      <p className="text-rose-800 text-xs mt-1 leading-relaxed">
                        В процессе обработки файла произошёл сбой. Документ не прошёл контроль целостности и был отклонён системой.
                      </p>
                    </div>
                  </div>

                  {/* Error Breakdown Card */}
                  <div className="border border-rose-200 rounded-lg p-3.5 bg-rose-50/40 space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
                      Диагностика сбоя:
                    </div>

                    <div className="p-3 bg-white border border-rose-200 rounded-lg space-y-1.5">
                      <div className="font-mono text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{importErrorMessage}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Рекомендуемое действие: повторить сканирование оригинала документа с разрешением 300 DPI или загрузить неповреждённый файл.
                      </p>
                    </div>

                    {/* Critical Requirement Verification Card */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                        <Shield className="w-4 h-4 text-slate-600" />
                        Визуальное состояние плана: остаётся незавершённым
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                        <div className="min-w-0">
                          <span className="font-medium text-slate-800 text-xs truncate block">{activeImportPlan.title}</span>
                          <span className="text-[11px] text-slate-500 font-mono">Срок: {activeImportPlan.deadline}</span>
                        </div>
                        <div className="shrink-0 ml-2">
                          {activeImportPlan.isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3.5 h-3.5" /> Просрочен
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Запланирован
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        План не переведён в «Выполнен». В реестре планов отображается статус «Запланирован» с отметкой о необходимости повторной попытки импорта.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions: Dynamically changes depending on stage */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 text-xs">
              
              {/* Left Side Hint */}
              <div className="text-[11px] text-slate-500 truncate hidden sm:block">
                {importStage === 'started' && 'Шаг 1 из 3 • Ожидает запуска обработки'}
                {importStage === 'waiting' && 'Шаг 2 из 3 • Документ обрабатывается...'}
                {importStage === 'success_linked' && 'Шаг 3 из 3 • Требуется подтверждение привязки'}
                {importStage === 'cancelled' && 'Операция прервана • План остался открытым'}
                {importStage === 'error' && 'Сбой валидации • План остался открытым'}
              </div>

              {/* Right Side Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                {importStage === 'started' && (
                  <>
                    <button
                      onClick={handleCancelImportAction}
                      className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Отменить импорт
                    </button>
                    <button
                      onClick={() => handleSwitchImportStage('waiting')}
                      className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Запустить обработку</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {importStage === 'waiting' && (
                  <>
                    <button
                      onClick={handleCancelImportAction}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Отменить импорт
                    </button>
                    <button
                      onClick={handleSimulateErrorAction}
                      className="px-3 py-1.5 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md font-medium transition-colors cursor-pointer"
                      title="Имитация ошибки валидации документа"
                    >
                      Имитировать ошибку
                    </button>
                    <button
                      onClick={() => handleSwitchImportStage('success_linked')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Завершить обработку</span>
                    </button>
                  </>
                )}

                {importStage === 'success_linked' && (
                  <>
                    <button
                      onClick={handleRejectImportBinding}
                      className="px-3.5 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Оставить документ в архиве, но план оставить незавершённым"
                    >
                      Не привязывать к плану
                    </button>
                    <button
                      onClick={handleConfirmImportBinding}
                      className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Привязать и завершить план</span>
                    </button>
                  </>
                )}

                {importStage === 'cancelled' && (
                  <>
                    <button
                      onClick={() => handleSwitchImportStage('started')}
                      className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Повторить импорт</span>
                    </button>
                    <button
                      onClick={() => setImportModalPlanId(null)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-medium transition-colors cursor-pointer"
                    >
                      Закрыть (план открыт)
                    </button>
                  </>
                )}

                {importStage === 'error' && (
                  <>
                    <button
                      onClick={() => handleSwitchImportStage('started')}
                      className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Повторить попытку</span>
                    </button>
                    <button
                      onClick={() => setImportModalPlanId(null)}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium transition-colors cursor-pointer"
                    >
                      Закрыть (план открыт)
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Path 1 - Bind Existing Document from Archive       */}
      {/* ======================================================== */}
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
                      {doc.id} — {doc.title} ({doc.date})
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
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmBind}
                className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md font-medium cursor-pointer"
              >
                Привязать и завершить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Cancel Plan Confirmation                           */}
      {/* ======================================================== */}
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
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Назад
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium cursor-pointer"
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

