/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScreenId,
  SecurityZone,
  ArchiveDocument,
  InboxItem,
  CompositionPage,
  VerificationFieldItem,
  MyDataRecord,
  MyDataCategory,
  DocumentTemplate,
  PlanItem,
  DraftSession,
} from '../types';
import {
  initialArchiveDocuments,
  initialInboxItems,
  initialVerificationFields,
  initialMyDataCategories,
  initialMyDataRecords,
  initialTemplates,
  initialPlans,
  initialDraftSessions,
} from '../mockData';

interface ClassificationState {
  zone: SecurityZone;
  category: string;
  docType: string;
  topic: string;
  title: string;
  isDraftTitle: boolean;
  dateMode: 'concrete' | 'unknown' | 'deferred';
  docDate: string;
  templateId: string;
  parentDocId: string;
  sourceUrl: string;
  comment: string;
  exportObsidian: boolean;
}

interface VaultContextType {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  activeScenario: string;
  setActiveScenario: (scen: string) => void;
  isVeraCryptMounted: boolean;
  toggleVeraCrypt: () => void;
  isCompact: boolean;
  toggleCompact: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Data
  documents: ArchiveDocument[];
  inboxItems: InboxItem[];
  myDataRecords: MyDataRecord[];
  myDataCategories: MyDataCategory[];
  templates: DocumentTemplate[];
  plans: PlanItem[];
  draftSessions: DraftSession[];
  verificationFields: VerificationFieldItem[];
  
  // Selected items
  activeDocId: string;
  setActiveDocId: (id: string) => void;
  selectedInboxId: string;
  setSelectedInboxId: (id: string) => void;
  
  // Active Pipeline State (SCR-02 -> SCR-09)
  pipelineStep: number;
  setPipelineStep: (step: number) => void;
  compositionPages: CompositionPage[];
  setCompositionPages: React.Dispatch<React.SetStateAction<CompositionPage[]>>;
  movePage: (pageId: number, direction: 'up' | 'down') => void;
  excludePage: (pageId: number) => void;
  restoreExcludedPage: (pageId: number) => void;
  classificationData: ClassificationState;
  updateClassification: (patch: Partial<ClassificationState>) => void;
  
  // Actions
  commitPipelineToArchive: () => string;
  restoreDocumentFromTrash: (docId: string) => void;
  softDeleteDocument: (docId: string, reason: string) => void;
  addUploadedUserFile: (file: File) => void;
  updateVerificationFieldStatus: (id: number, status: VerificationFieldItem['status'], newValue?: string) => void;
  completePlanWithDoc: (planId: number, docCode: string, docName: string) => void;
  cancelPlan: (planId: number, reason: string) => void;
  deleteMyDataRecord: (id: string) => void;
  updateMyDataRecord: (id: string, patch: Partial<MyDataRecord>) => void;
  addMyDataRecord: (rec: Omit<MyDataRecord, 'id'>) => void;
  hiddenGroupIds: string[];
  addMyDataCategory: (name: string) => MyDataCategory;
  deleteMyDataCategory: (id: string) => void;
  hideMyDataCategory: (id: string) => void;
  unhideMyDataCategory: (id: string) => void;
  
  // UI & Feedback
  toast: { message: string; icon?: string } | null;
  showToast: (msg: string, icon?: string) => void;
  activeModal: { type: string; payload?: any } | null;
  openModal: (type: string, payload?: any) => void;
  closeModal: () => void;
}

const defaultClassification: ClassificationState = {
  zone: 'open',
  category: 'Жильё',
  docType: 'Акт приёма-передачи',
  topic: 'Аренда квартиры на Большой Морской',
  title: 'Акт приёма-передачи жилого помещения № 42',
  isDraftTitle: false,
  dateMode: 'concrete',
  docDate: '12.10.2026',
  templateId: 'tpl-1',
  parentDocId: 'PV-0041',
  sourceUrl: 'https://dom.gosuslugi.ru/statement/4821',
  comment: 'Акт сдачи-приемки при выезде жильца, 3 фото + приложение PDF',
  exportObsidian: true,
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('SCR-01');
  const [activeScenario, setActiveScenario] = useState<string>('normal');
  const [isVeraCryptMounted, setIsVeraCryptMounted] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const [documents, setDocuments] = useState<ArchiveDocument[]>(initialArchiveDocuments);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(initialInboxItems);
  const [myDataRecords, setMyDataRecords] = useState<MyDataRecord[]>(() => {
    try {
      const saved = localStorage.getItem('personalvault_my_data_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialMyDataRecords;
  });
  const [myDataCategories, setMyDataCategories] = useState<MyDataCategory[]>(() => {
    try {
      const saved = localStorage.getItem('personalvault_my_data_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialMyDataCategories;
  });
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('personalvault_hidden_group_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('personalvault_my_data_records', JSON.stringify(myDataRecords));
    } catch (e) {
      console.error(e);
    }
  }, [myDataRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('personalvault_my_data_categories', JSON.stringify(myDataCategories));
    } catch (e) {
      console.error(e);
    }
  }, [myDataCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('personalvault_hidden_group_ids', JSON.stringify(hiddenGroupIds));
    } catch (e) {
      console.error(e);
    }
  }, [hiddenGroupIds]);

  const [templates, setTemplates] = useState<DocumentTemplate[]>(initialTemplates);
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [draftSessions, setDraftSessions] = useState<DraftSession[]>(initialDraftSessions);
  const [verificationFields, setVerificationFields] = useState<VerificationFieldItem[]>(initialVerificationFields);

  const [activeDocId, setActiveDocId] = useState<string>('PV-0042');
  const [selectedInboxId, setSelectedInboxId] = useState<string>('inb-1');

  // Pipeline State
  const [pipelineStep, setPipelineStep] = useState<number>(2);
  const [compositionPages, setCompositionPages] = useState<CompositionPage[]>(
    initialInboxItems[0].pages
  );
  const [classificationData, setClassificationData] = useState<ClassificationState>(defaultClassification);

  // Modal and toast state
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: string; payload?: any } | null>(null);

  const showToast = useCallback((msg: string, icon = 'check_circle') => {
    setToast({ message: msg, icon });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  const openModal = useCallback((type: string, payload?: any) => {
    setActiveModal({ type, payload });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const toggleVeraCrypt = useCallback(() => {
    setIsVeraCryptMounted(prev => {
      const next = !prev;
      showToast(
        next ? 'Том VeraCrypt подключен (Open + Secret доступны)' : 'Том VeraCrypt отключен (UX-032: Secret изолирован)',
        next ? 'key' : 'lock'
      );
      return next;
    });
  }, [showToast]);

  const toggleCompact = useCallback(() => {
    setIsCompact(prev => !prev);
  }, []);

  // Page composition actions (SCR-03)
  const movePage = useCallback((pageId: number, direction: 'up' | 'down') => {
    setCompositionPages(prev => {
      const idx = prev.findIndex(p => p.id === pageId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const updated = [...prev];
      const [item] = updated.splice(idx, 1);
      updated.splice(targetIdx, 0, item);
      return updated.map((p, index) => ({
        ...p,
        globalNum: `Стр. ${index + 1} из ${updated.length}`,
      }));
    });
    showToast(`Порядок страниц изменён`);
  }, [showToast]);

  const excludePage = useCallback((pageId: number) => {
    setCompositionPages(prev =>
      prev.map(p => (p.id === pageId ? { ...p, isExcluded: true } : p))
    );
    showToast('Страница исключена только из набора (файл на диске сохранён)', 'inventory_2');
  }, [showToast]);

  const restoreExcludedPage = useCallback((pageId: number) => {
    setCompositionPages(prev =>
      prev.map(p => (p.id === pageId ? { ...p, isExcluded: false } : p))
    );
    showToast('Страница возвращена в набор', 'undo');
  }, [showToast]);

  const updateClassification = useCallback((patch: Partial<ClassificationState>) => {
    setClassificationData(prev => ({ ...prev, ...patch }));
  }, []);

  // Commit pipeline to archive (SCR-08 -> SCR-09)
  const commitPipelineToArchive = useCallback(() => {
    const nextIdNum = documents.length + 1;
    const newId = `PV-00${nextIdNum < 100 ? nextIdNum : nextIdNum}`;
    const newDoc: ArchiveDocument = {
      id: newId,
      title: classificationData.title || 'Новый архивный документ',
      category: classificationData.category,
      docType: classificationData.docType,
      date: classificationData.dateMode === 'concrete' ? classificationData.docDate : 'Дата неизвестна',
      isDateUnknown: classificationData.dateMode === 'unknown',
      zone: classificationData.zone,
      completeness: { filled: 6, total: 6 },
      verification: { verified: 5, total: 6 },
      relations: classificationData.parentDocId
        ? [{ id: classificationData.parentDocId, name: 'Родительский договор', type: 'Родитель' }]
        : [],
      transcriptExcerpt: `Архивный документ зафиксирован: ${classificationData.title}`,
      fullTranscript: `# ${classificationData.title}\nКатегория: ${classificationData.category}\nДата: ${classificationData.docDate}\n\nАрхивная фиксация завершена.`,
      archivePath: `${classificationData.zone === 'open' ? 'Open' : 'Secret'} → ${classificationData.category} → 2026 → ${newId}.pdf`,
      sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      fileSize: '4.2 МБ',
      pagesCount: compositionPages.filter(p => !p.isExcluded).length || 1,
      fileName: `${newId}_${classificationData.docType}.pdf`,
      revision: 'r0',
      status: 'active',
      fields: [],
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Remove from inbox
    setInboxItems(prev => prev.filter(item => item.id !== selectedInboxId));

    // Also update any matching plan
    setPlans(prev =>
      prev.map(p =>
        p.title.toLowerCase().includes(classificationData.title.toLowerCase())
          ? {
              ...p,
              status: 'Выполнен',
              isOverdue: false,
              linkedDoc: { code: newId, name: newDoc.title, date: newDoc.date },
            }
          : p
      )
    );

    setActiveDocId(newId);
    showToast(`Документ ${newId} зафиксирован в постоянном архиве!`, 'verified');
    return newId;
  }, [documents.length, classificationData, compositionPages, selectedInboxId, showToast]);

  // Trash & restore
  const restoreDocumentFromTrash = useCallback((docId: string) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === docId ? { ...doc, status: 'active', trashedDate: undefined } : doc))
    );
    showToast(`Документ ${docId} возвращён в Журнал`, 'undo');
  }, [showToast]);

  const softDeleteDocument = useCallback((docId: string, reason: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? {
              ...doc,
              status: 'trashed',
              trashedDate: new Date().toLocaleDateString('ru-RU'),
              trashedReason: reason || 'Скрыт пользователем из активного списка',
            }
          : doc
      )
    );
    showToast(`Документ ${docId} перемещён в раздел «Убранные»`, 'archive');
  }, [showToast]);

  // User uploaded file
  const addUploadedUserFile = useCallback((file: File) => {
    const newInboxItem: InboxItem = {
      id: `inb-${Date.now()}`,
      name: file.name,
      isPackage: false,
      type: file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'IMG' : 'DOC',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} МБ`,
      pagesCount: 1,
      fileCount: 1,
      status: 'ready',
      statusText: 'Готов к разбору',
      addedDate: new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
      workingTitle: file.name.replace(/\.[^/.]+$/, ''),
      targetZone: 'open',
      preCategory: 'Жильё',
      preType: 'Акт приёма-передачи',
      sourceUrl: '',
      comment: 'Загружен пользователем через интерфейс',
      exportObsidian: true,
      pages: [
        {
          id: 1,
          fileName: file.name,
          origPos: 'Стр. 1 из 1',
          globalNum: 'Стр. 1 из 1',
          title: file.name,
          subtitle: 'Пользовательский файл',
          spec: `${file.type} · ${(file.size / 1024).toFixed(0)} КБ`,
          summary: 'Первичный пользовательский файл',
          previewType: file.type.includes('pdf') ? 'vector_pdf' : 'text_act',
        },
      ],
    };

    setInboxItems(prev => [newInboxItem, ...prev]);
    setSelectedInboxId(newInboxItem.id);
    setCompositionPages(newInboxItem.pages);
    setClassificationData(prev => ({
      ...prev,
      title: newInboxItem.workingTitle,
    }));
    showToast(`Файл «${file.name}» добавлен во Входящие`, 'upload_file');
  }, [showToast]);

  const updateVerificationFieldStatus = useCallback((id: number, status: VerificationFieldItem['status'], newValue?: string) => {
    setVerificationFields(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              status,
              normalizedValue: newValue !== undefined ? newValue : f.normalizedValue,
            }
          : f
      )
    );
    showToast(`Статус сверки поля обновлён`);
  }, [showToast]);

  const completePlanWithDoc = useCallback((planId: number, docCode: string, docName: string) => {
    setPlans(prev =>
      prev.map(p =>
        p.id === planId
          ? {
              ...p,
              status: 'Выполнен',
              isOverdue: false,
              linkedDoc: { code: docCode, name: docName, date: new Date().toLocaleDateString('ru-RU') },
            }
          : p
      )
    );
    showToast(`План #${planId} выполнен и связан с ${docCode}`, 'task_alt');
  }, [showToast]);

  const cancelPlan = useCallback((planId: number, reason: string) => {
    setPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, status: 'Отменён', cancelReason: reason } : p))
    );
    showToast(`План #${planId} отменён`, 'cancel');
  }, [showToast]);

  const deleteMyDataRecord = useCallback((id: string) => {
    setMyDataRecords(prev => prev.filter(r => r.id !== id));
    showToast('Реквизит удалён', 'delete');
  }, [showToast]);

  const updateMyDataRecord = useCallback((id: string, patch: Partial<MyDataRecord>) => {
    setMyDataRecords(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
    showToast('Реквизит обновлён', 'check');
  }, [showToast]);

  const addMyDataRecord = useCallback((rec: Omit<MyDataRecord, 'id'>) => {
    const id = `rec-${Date.now()}`;
    setMyDataRecords(prev => [...prev, { ...rec, id }]);
    showToast('Реквизит добавлен в справочник', 'add_circle');
  }, [showToast]);

  const addMyDataCategory = useCallback((name: string): MyDataCategory => {
    const newCat: MyDataCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      countOnline: 0,
      countOffline: 0,
      hasSecret: false,
      icon: 'folder',
    };
    setMyDataCategories(prev => [...prev, newCat]);
    return newCat;
  }, []);

  const deleteMyDataCategory = useCallback((id: string) => {
    setMyDataCategories(prev => prev.filter(c => c.id !== id));
    setHiddenGroupIds(prev => prev.filter(gid => gid !== id));
  }, []);

  const hideMyDataCategory = useCallback((id: string) => {
    setHiddenGroupIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unhideMyDataCategory = useCallback((id: string) => {
    setHiddenGroupIds(prev => prev.filter(gid => gid !== id));
  }, []);

  const value = useMemo(
    () => ({
      currentScreen,
      setCurrentScreen,
      activeScenario,
      setActiveScenario,
      isVeraCryptMounted,
      toggleVeraCrypt,
      isCompact,
      toggleCompact,
      isSidebarCollapsed,
      toggleSidebar,
      documents,
      inboxItems,
      myDataRecords,
      myDataCategories,
      templates,
      plans,
      draftSessions,
      verificationFields,
      activeDocId,
      setActiveDocId,
      selectedInboxId,
      setSelectedInboxId,
      pipelineStep,
      setPipelineStep,
      compositionPages,
      setCompositionPages,
      movePage,
      excludePage,
      restoreExcludedPage,
      classificationData,
      updateClassification,
      commitPipelineToArchive,
      restoreDocumentFromTrash,
      softDeleteDocument,
      addUploadedUserFile,
      updateVerificationFieldStatus,
      completePlanWithDoc,
      cancelPlan,
      deleteMyDataRecord,
      updateMyDataRecord,
      addMyDataRecord,
      hiddenGroupIds,
      addMyDataCategory,
      deleteMyDataCategory,
      hideMyDataCategory,
      unhideMyDataCategory,
      toast,
      showToast,
      activeModal,
      openModal,
      closeModal,
    }),
    [
      currentScreen,
      activeScenario,
      isVeraCryptMounted,
      toggleVeraCrypt,
      isCompact,
      toggleCompact,
      isSidebarCollapsed,
      toggleSidebar,
      documents,
      inboxItems,
      myDataRecords,
      myDataCategories,
      hiddenGroupIds,
      templates,
      plans,
      draftSessions,
      verificationFields,
      activeDocId,
      selectedInboxId,
      pipelineStep,
      compositionPages,
      movePage,
      excludePage,
      restoreExcludedPage,
      classificationData,
      updateClassification,
      commitPipelineToArchive,
      restoreDocumentFromTrash,
      softDeleteDocument,
      addUploadedUserFile,
      updateVerificationFieldStatus,
      completePlanWithDoc,
      cancelPlan,
      deleteMyDataRecord,
      updateMyDataRecord,
      addMyDataRecord,
      addMyDataCategory,
      deleteMyDataCategory,
      hideMyDataCategory,
      unhideMyDataCategory,
      toast,
      showToast,
      activeModal,
      openModal,
      closeModal,
    ]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = (): VaultContextType => {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return ctx;
};
