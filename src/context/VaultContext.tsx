import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppRoute,
  DocumentItem,
  InboxItem,
  DraftItem,
  PlanItem,
  TemplateItem,
  MyDataItem,
  MaintenanceProblem,
  StorageZone
} from '../types/vault';

interface ProcessingSession {
  packageName: string;
  files: Array<{ id: string; name: string; size: string; pageNum: number; dpi: number; spec: string }>;
  workName: string;
  category: string;
  docType: string;
  zone: StorageZone;
  dateMode: 'concrete' | 'unknown' | 'deferred';
  dateValue: string;
  isDraftTitle: boolean;
  templateId: string;
  sourceUrl: string;
  operatorComment: string;
  obsidianExport: boolean;
  parentDocId?: string;
}

interface VaultContextType {
  activeRoute: AppRoute;
  navigateTo: (route: AppRoute, params?: { docId?: string; planId?: string; templateId?: string; draftId?: string }) => void;
  selectedDocId: string;
  setSelectedDocId: (id: string) => void;
  
  // Storage & Security
  isVeraCryptMounted: boolean;
  toggleVeraCrypt: () => void;
  
  // Documents
  documents: DocumentItem[];
  activeDocument: DocumentItem | undefined;
  updateDocumentFieldVerification: (docId: string, fieldId: string, isVerified: boolean, newVal?: string) => void;
  softDeleteDocument: (docId: string, reason?: string) => void;
  restoreDocument: (docId: string) => void;
  moveDocumentPath: (docId: string, newPath: string) => void;
  
  // In-flight processing pipeline
  processingSession: ProcessingSession;
  updateProcessingSession: (updates: Partial<ProcessingSession>) => void;
  reorderProcessingPages: (fromIndex: number, toIndex: number) => void;
  removeProcessingPage: (pageId: string) => void;
  commitProcessingToArchive: () => string; // returns new doc ID
  
  // Inbox
  inboxItems: InboxItem[];
  removeInboxItem: (id: string) => void;
  
  // Drafts
  drafts: DraftItem[];
  selectedDraftId: string;
  setSelectedDraftId: (id: string) => void;
  deleteDraft: (id: string) => void;
  resumeDraft: (id: string) => void;
  
  // Plans
  plans: PlanItem[];
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  addPlan: (plan: Omit<PlanItem, 'id' | 'createdDate'>) => void;
  updatePlan: (id: string, updates: Partial<PlanItem>) => void;
  completePlanWithDoc: (planId: string, docId: string) => void;
  cancelPlan: (planId: string, reason?: string) => void;
  deletePlan: (planId: string) => void;
  
  // Templates
  templates: TemplateItem[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<TemplateItem>) => void;
  addTemplateField: (templateId: string, sectionId: string, field: any) => void;
  deleteTemplateField: (templateId: string, sectionId: string, fieldId: string) => void;
  
  // My Data
  myData: MyDataItem[];
  selectedMyDataId: string;
  setSelectedMyDataId: (id: string) => void;
  updateMyDataRecord: (id: string, updates: Partial<MyDataItem>) => void;
  migrateMyDataZone: (id: string, newZone: StorageZone) => void;
  addMyDataRecord: (record: Omit<MyDataItem, 'id' | 'tag'>) => void;
  deleteMyDataRecord: (id: string) => void;
  
  // Maintenance
  maintenanceProblems: MaintenanceProblem[];
  lastIntegrityCheck: string;
  runIntegrityCheck: () => void;
  
  // Global Search & Dev Modal
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  devModal: { isOpen: boolean; featureName: string };
  openDevModal: (featureName: string) => void;
  closeDevModal: () => void;
  
  // Notification toast
  toast: { message: string; icon?: string } | null;
  showToast: (message: string, icon?: string) => void;
}

const initialDocuments: DocumentItem[] = [
  {
    id: 'PV-0042',
    name: 'Акт приёма-передачи.pdf',
    category: 'Жильё',
    zone: 'open',
    date: '12.10.2026',
    completeness: { filled: 3, total: 5 },
    verification: { verified: 2, total: 5 },
    relations: [{ id: 'PV-0041', name: 'Договор найма жилого помещения № 42', type: 'parent' }],
    transcriptExcerpt: '## Акт приёма-передачи\\nК договору найма жилого помещения от 01.10.2026.\\nСостояние объекта: передано без замечаний. Ключи: 2 комплекта.',
    fullTranscript: `# АКТ ПРИЁМА-ПЕРЕДАЧИ (к Договору найма № 42)
Дата: 12 октября 2026 г. | Место: г. Санкт-Петербург

Мы, нижеподписавшиеся, Наймодатель Васильев Андрей Сергеевич, с одной стороны, и Наниматель Соколов Алексей Николаевич, с другой стороны, составили настоящий акт № АПП-42 о том, что Наймодатель сдал, а Наниматель принял во временное владение и пользование изолированное жилое помещение.

## 1. Описание жилого помещения
Квартира расположена по адресу: г. Санкт-Петербург, ул. Большая Морская, д. 22, кв. 14. Общая площадь составляет 64.5 кв. м. Состояние помещения, санитарно-технического и иного оборудования признано сторонами удовлетворительным, претензий у Нанимателя не имеется.

## 2. Ключи и доступ
Одновременно с передачей помещения Нанимателю переданы ключи от входной двери в количестве 2 (два) комплекта, а также электронный чип доступа в парадное.

## 3. Показания приборов учёта
Электроэнергия (день, Т1): 01420 кВт·ч, электроэнергия (ночь, Т2): 00612 кВт·ч. Холодное водоснабжение: 184 м³, горячее водоснабжение: 092 м³.

Настоящий акт составлен в двух подлинных экземплярах, имеющих равную юридическую силу.`,
    path: 'Жильё / 2026 / Копии',
    fileSize: '1.4 МБ',
    pageCount: 2,
    sha256: 'f7a931c28f2a994bc7d612e4c014781df03ab8714e8b39a48e71822c9e2d3f0a',
    fields: [
      { id: 'f1', label: 'Номер акта', value: '№ АПП-42', type: 'text', required: true, isVerified: true, citation: 'Стр. 1, шапка • Цитата: "настоящий акт № АПП-42"', sourcePage: 1 },
      { id: 'f2', label: 'Дата составления', value: '2026-10-12', type: 'date', required: true, isVerified: true, citation: 'Стр. 1, шапка • Цитата: "12 октября 2026 г."', sourcePage: 1 },
      { id: 'f3', label: 'Наниматель', value: 'Соколов Алексей Николаевич', type: 'text', required: true, isVerified: false, citation: 'Стр. 1, п. 1 • ⚠ Не сверено', sourcePage: 1 },
      { id: 'f4', label: 'Наймодатель', value: '', type: 'text', required: true, isVerified: false },
      { id: 'f5', label: 'Адрес помещения', value: '', type: 'text', required: true, isVerified: false },
      { id: 'f6', label: 'Комплекты ключей', value: '2 комплекта + электронный чип домофона', type: 'text', required: false, isVerified: false, isCustom: true, citation: 'Стр. 1, п. 2 • ⚠ Не сверено', sourcePage: 1 }
    ],
    tableData: [
      { id: 't1', index: 1, name: 'Холодильник двухкамерный', model: 'Bosch Serie 4 KGN39 / Исправен, чистый', condition: 'Исправен', provenance: '[Стр. 1, табл. строка 1]', isVerified: true },
      { id: 't2', index: 2, name: 'Стиральная машина', model: 'LG AI DD F2V5HG0W / Без повреждений', condition: 'Исправна', provenance: '[Стр. 1, табл. строка 2]', isVerified: true },
      { id: 't3', index: 3, name: 'Сплит-система инверторная', model: 'Daikin Sensira FTXC25C / Исправен, пульт', condition: 'Исправна', provenance: '[Стр. 1, табл. строка 3]', isVerified: false }
    ],
    previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmOn8shvMmaW46wp0bmnS-3fYfHr0meVhOoNLPCwK2JAQfn0gDJLzdNrr29DElHoZZEDLourYrLoBQSWIIbsxyS7xsZOp22YwwvL2lbY7v7B487mzWC80ar11hYg5HYUixbvsnuSZcqrQCqHrQiS5qMxGRdDEq4kZAcLrG4G7j_MUWA1DcUtuCz7A8R_VDgjRMiymOWLXnwF_tq6hYCiGP8vokNhJ8aFOSUK2l_1MXfNeBqPP-wU9NvA'
  },
  {
    id: 'PV-0041',
    name: 'Договор найма жилого помещения № 42.pdf',
    category: 'Жильё',
    zone: 'open',
    date: '01.10.2026',
    completeness: { filled: 6, total: 6 },
    verification: { verified: 6, total: 6 },
    relations: [{ id: 'PV-0042', name: 'Акт приёма-передачи', type: 'child' }],
    transcriptExcerpt: '## Договор найма жилого помещения № 42\\nг. Санкт-Петербург, Московский пр., д. 182, кв. 42. Наймодатель: Васильев А.С., Наниматель: Соколов А.Н.',
    fullTranscript: 'Полный юридический текст Договора найма жилого помещения № 42 от 01.10.2026.',
    path: 'Жильё / 2026 / Оригиналы',
    fileSize: '3.2 МБ',
    pageCount: 4,
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    fields: [
      { id: 'f1', label: 'Номер договора', value: '№ 42', type: 'text', required: true, isVerified: true },
      { id: 'f2', label: 'Дата подписания', value: '2026-10-01', type: 'date', required: true, isVerified: true },
      { id: 'f3', label: 'Адрес объекта', value: 'г. Санкт-Петербург, Московский пр., д. 182, кв. 42', type: 'text', required: true, isVerified: true },
      { id: 'f4', label: 'Наймодатель', value: 'Васильев Андрей Сергеевич', type: 'text', required: true, isVerified: true },
      { id: 'f5', label: 'Наниматель', value: 'Соколов Алексей Николаевич', type: 'text', required: true, isVerified: true },
      { id: 'f6', label: 'Срок найма', value: '11 месяцев', type: 'text', required: true, isVerified: true }
    ],
    previewUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCibeunigutGQPVIPZkJ5UFekhXIz7NPGAUyjla1l0dWh5ntzzLhtcpJSQbi4RQjADQj7shhagVy2r3_QMl4-0XNyXNAOKKjSmKVD9F1KxHeD72ZrNg7hFQK0094Wpdp3z05ADxPIISY8D5jm6CaqUwUezG-kphwbZJmpbY-twppJHj4HdqcnLLSlZnwx_gbzP7sFB7IkbbeP7WqWnBwkAIhkI8ufcG3kMouBV9se-Kl7tQoYqztmgqLA'
  },
  {
    id: 'PV-0040',
    name: 'Счёт за электроэнергию (Мосэнергосбыт).pdf',
    category: 'Коммунальные',
    zone: 'open',
    date: '25.09.2026',
    completeness: { filled: 4, total: 4 },
    verification: { verified: 0, total: 4 },
    relations: [],
    transcriptExcerpt: 'Счёт на оплату электрической энергии за сентябрь 2026. Лицевой счёт: 88123-401.',
    fullTranscript: 'Счёт за электроэнергию АО Мосэнергосбыт за сентябрь 2026.',
    path: 'ЖКХ / 2026 / Копии',
    fileSize: '950 КБ',
    pageCount: 1,
    sha256: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    fields: [
      { id: 'f1', label: 'Лицевой счёт', value: '88123-401', type: 'text', required: true, isVerified: false },
      { id: 'f2', label: 'Сумма к оплате', value: '2 840.50 ₽', type: 'text', required: true, isVerified: false },
      { id: 'f3', label: 'Период', value: 'Сентябрь 2026', type: 'text', required: true, isVerified: false },
      { id: 'f4', label: 'Статус платежа', value: 'Оплачен', type: 'text', required: true, isVerified: false }
    ]
  },
  {
    id: 'PV-0039',
    name: 'Полис ДМС РЕСО-Гарантия (Архив).pdf',
    category: 'Здоровье',
    zone: 'secret',
    date: '15.08.2026',
    completeness: { filled: 5, total: 5 },
    verification: { verified: 5, total: 5 },
    relations: [],
    transcriptExcerpt: 'Страховой медицинский полис добровольного медицинского страхования. Номер: РЕСО-ДМС-2026-881.',
    fullTranscript: 'Полис ДМС РЕСО-Гарантия. Застрахованный: Васильев А.С.',
    path: 'Здоровье / 2026 / Защищённый',
    fileSize: '1.8 МБ',
    pageCount: 3,
    sha256: '872f987630737a0980ff2d1d58e3760ba26c9213bc5cc776eaef1356fcf7ab09',
    fields: [
      { id: 'f1', label: 'Номер полиса', value: 'РЕСО-ДМС-2026-881', type: 'text', required: true, isVerified: true },
      { id: 'f2', label: 'Страховщик', value: 'СПАО РЕСО-Гарантия', type: 'text', required: true, isVerified: true },
      { id: 'f3', label: 'Застрахованное лицо', value: 'Васильев Андрей Сергеевич', type: 'text', required: true, isVerified: true },
      { id: 'f4', label: 'Программа страхования', value: 'Бизнес-Комфорт + Стоматология', type: 'text', required: true, isVerified: true },
      { id: 'f5', label: 'Срок действия', value: 'по 14.08.2027', type: 'text', required: true, isVerified: true }
    ]
  },
  {
    id: 'PV-0038',
    name: 'Квитанция об оплате ЖКХ (Архив).pdf',
    category: 'Коммунальные',
    zone: 'open',
    date: 'Дата неизвестна',
    completeness: { filled: 3, total: 3 },
    verification: { verified: 3, total: 3 },
    relations: [],
    transcriptExcerpt: 'Единый платёжный документ за коммунальные услуги.',
    fullTranscript: 'Квитанция ЕПД за жилищно-коммунальные услуги.',
    path: 'ЖКХ / 2026 / Архив',
    fileSize: '720 КБ',
    pageCount: 1,
    sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    fields: [
      { id: 'f1', label: 'Управляющая компания', value: 'ООО Жилкомсервис № 1', type: 'text', required: true, isVerified: true },
      { id: 'f2', label: 'Адрес плательщика', value: 'г. Санкт-Петербург, Московский пр., 182, кв. 42', type: 'text', required: true, isVerified: true },
      { id: 'f3', label: 'Итого начислено', value: '4 910.00 ₽', type: 'text', required: true, isVerified: true }
    ]
  },
  // Soft-archived documents (SCR-16)
  {
    id: 'PV-0019',
    name: 'Договор аренды квартиры (расторгнут 2024)',
    category: 'Жильё',
    zone: 'open',
    date: '10.04.2024',
    completeness: { filled: 5, total: 5 },
    verification: { verified: 5, total: 5 },
    relations: [],
    transcriptExcerpt: 'Договор аренды жилого помещения в Москве (прежнее место жительства).',
    fullTranscript: 'Договор аренды квартиры 2024 года, расторгнут в связи с переездом.',
    path: 'Жильё / 2024 / Убранные',
    fileSize: '2.1 МБ',
    pageCount: 2,
    sha256: '8f4a13b9c759081e7d4a21190bc983e211b0c44298fc1c149afbf4c8996fb924',
    fields: [],
    isArchived: true,
    archiveReason: 'Срок действия истёк, скрыт из активного списка',
    archivedDate: '14.09.2026'
  },
  {
    id: 'PV-0027',
    name: 'Квитанция Мосэнергосбыт за март 2025',
    category: 'Коммунальные',
    zone: 'open',
    date: '01.04.2025',
    completeness: { filled: 4, total: 4 },
    verification: { verified: 4, total: 4 },
    relations: [],
    transcriptExcerpt: 'Квитанция Мосэнергосбыт за март 2025 года.',
    fullTranscript: 'Старая квитанция Мосэнергосбыт.',
    path: 'ЖКХ / 2025 / Убранные',
    fileSize: '680 КБ',
    pageCount: 1,
    sha256: '11b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    fields: [],
    isArchived: true,
    archiveReason: 'Ошибочно импортирован дубликат старого периода',
    archivedDate: '01.10.2026'
  },
  {
    id: 'PV-0033',
    name: 'Черновой скан паспорта (старая копия)',
    category: 'Личное',
    zone: 'secret',
    date: '12.01.2023',
    completeness: { filled: 4, total: 4 },
    verification: { verified: 4, total: 4 },
    relations: [],
    transcriptExcerpt: 'Черновая растровая копия паспорта с артефактами сканирования.',
    fullTranscript: 'Некачественный скан паспорта.',
    path: 'Личное / 2023 / Убранные',
    fileSize: '4.2 МБ',
    pageCount: 1,
    sha256: '98fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c442',
    fields: [],
    isArchived: true,
    archiveReason: 'Заменён актуальным нотариальным сканом',
    archivedDate: '05.10.2026'
  }
];

const initialInbox: InboxItem[] = [
  {
    id: 'inb-1',
    name: 'Пакет: Акт приёма-передачи с приложениями',
    type: 'НАБОР',
    size: '6.8 МБ',
    composition: '4 файла, 4 стр.',
    status: 'ready',
    statusText: 'Готов к разбору',
    dateAdded: '14.10.2026, 10:15',
    isPackage: true,
    filesList: ['Страница_01.jpg', 'Страница_02.jpg', 'Страница_03.jpg', 'Приложение.pdf'],
    workName: 'Акт приёма-передачи квартиры с фотофиксацией'
  },
  {
    id: 'inb-2',
    name: 'Счёт_Мосэнергосбыт_сентябрь.pdf',
    type: 'PDF',
    size: '1.2 МБ',
    composition: '1 файл, 2 стр.',
    status: 'ready',
    statusText: 'Готов к разбору',
    dateAdded: '13.10.2026, 18:40',
    workName: 'Счёт за электроэнергию (сентябрь 2026)'
  },
  {
    id: 'inb-3',
    name: 'Квитанция_май_2026_скан.pdf',
    type: 'PDF',
    size: '840 КБ',
    composition: '1 файл, 1 стр.',
    status: 'attention',
    statusText: 'Похож на архивный',
    dateAdded: '12.10.2026, 14:20',
    workName: 'Квитанция ЖКУ май 2026'
  },
  {
    id: 'inb-4',
    name: 'Справка_нечитаемая_поврежд.bin',
    type: 'BIN',
    size: '210 КБ',
    composition: '1 файл',
    status: 'error',
    statusText: 'Ошибка формата',
    dateAdded: '11.10.2026, 09:12',
    workName: '[Поврежденный файл]'
  }
];

const initialDrafts: DraftItem[] = [
  {
    id: 'DRAFT-2026-089',
    title: 'Акт приёма-передачи жилого помещения № 42',
    category: 'Жильё',
    zone: 'open',
    savedTime: '14:22 (10 мин назад)',
    status: 'Сохранён',
    stepName: 'Редактор данных (SCR-06)',
    stepRoute: 'redaktor',
    fieldsFilled: 4,
    fieldsTotal: 6,
    verifiedCount: 2
  },
  {
    id: 'DRAFT-2026-094',
    title: 'Договор купли-продажи оборудования № 88',
    category: 'Бизнес / Сделки',
    zone: 'secret',
    savedTime: 'Вчера 18:40',
    status: 'В процессе',
    stepName: 'Сверка со сканом (SCR-07)',
    stepRoute: 'sverka',
    fieldsFilled: 6,
    fieldsTotal: 6,
    verifiedCount: 1
  },
  {
    id: 'DRAFT-2026-061',
    title: 'Квитанция об оплате комм. услуг (май 2026)',
    category: 'Коммунальные',
    zone: 'open',
    savedTime: '12 окт 09:15',
    status: 'Конфликт',
    stepName: 'Итог перед сохранением (SCR-08)',
    stepRoute: 'itog',
    fieldsFilled: 3,
    fieldsTotal: 3,
    verifiedCount: 3,
    isConflict: true
  }
];

const initialPlans: PlanItem[] = [
  {
    id: '1',
    title: 'Выписка из ЕГРН на квартиру на Московском пр.',
    category: 'Жильё',
    zone: 'open',
    deadline: '15.11.2026',
    relative: 'через 22 дня',
    status: 'planned',
    isOverdue: false,
    notes: 'Запросить в МФЦ «Мои документы» или через личный кабинет Госуслуг. Требуется паспорт и СНИЛС заявителя.',
    createdDate: '28.09.2026 14:10'
  },
  {
    id: '2',
    title: 'Справка 2-НДФЛ за 2026 год от работодателя',
    category: 'Работа',
    zone: 'secret',
    deadline: '01.10.2026',
    relative: 'просрочен на 13 дней',
    status: 'planned',
    isOverdue: true,
    notes: 'Запросить в бухгалтерии с живой синей печатью для подачи на налоговый вычет.',
    createdDate: '15.09.2026 11:30'
  },
  {
    id: '3',
    title: 'Полис ОСАГО на 2027 год (продление)',
    category: 'Авто',
    zone: 'open',
    deadline: '12.12.2026',
    relative: 'в графике',
    status: 'planned',
    isOverdue: false,
    notes: 'Сверить диагностическую карту перед оформлением электронного полиса.',
    createdDate: '01.10.2026 09:15'
  },
  {
    id: '4',
    title: 'Акт приёма-передачи жилого помещения № 42',
    category: 'Жильё',
    zone: 'open',
    deadline: '12.10.2026',
    relative: 'выполнен',
    status: 'completed',
    isOverdue: false,
    notes: 'Подписан при приёмке ключей. Оригинал отсканирован в цвете.',
    createdDate: '20.09.2026 16:40',
    linkedDoc: {
      id: 'PV-0042',
      name: 'Акт приёма-передачи жилого помещения № 42.pdf',
      date: '12.10.2026'
    }
  },
  {
    id: '5',
    title: 'Архивная выписка из домовой книги (старая)',
    category: 'Жильё',
    zone: 'open',
    deadline: 'Без срока',
    relative: 'отменён',
    status: 'canceled',
    isOverdue: false,
    notes: 'Причина отмены: Сделка отменена.',
    createdDate: '10.08.2026 18:00'
  }
];

const initialTemplates: TemplateItem[] = [
  {
    id: 'tpl-1',
    title: 'Акт приёма-передачи жилого помещения',
    category: 'Жильё',
    type: 'Двусторонний первичный акт',
    version: 'v1.2',
    updatedDate: '14.10.2026',
    requiredCount: 3,
    totalFieldsCount: 6,
    status: 'active',
    sections: [
      {
        id: 'sec-1',
        title: 'Основные реквизиты',
        fields: [
          { id: 'tf-1', name: 'Номер акта', type: 'Текст', required: true, hint: 'Стр. 1 договора' },
          { id: 'tf-2', name: 'Дата составления', type: 'Дата (ГГГГ-ММ-ДД)', required: true },
          { id: 'tf-3', name: 'Наймодатель (ФИО)', type: 'Текст', required: false, linkedDirectory: 'Персоны' },
          { id: 'tf-4', name: 'Наниматель (ФИО)', type: 'Текст', required: false, linkedDirectory: 'Персоны' },
          { id: 'tf-5', name: 'Адрес помещения', type: 'Длинный текст', required: true, linkedDirectory: 'Адреса' }
        ]
      },
      {
        id: 'sec-2',
        title: 'Оборудование и опись имущества',
        fields: [],
        hasTable: true,
        tableTitle: 'Передаваемое имущество',
        tableColumns: [
          { name: '№ п/п', type: 'Числовой (Авто)', required: true, width: '60px' },
          { name: 'Наименование предмета', type: 'Текст', required: true, width: '240px' },
          { name: 'Модель / Марка', type: 'Текст', required: false, width: '180px' },
          { name: 'Состояние / Замечания', type: 'Текст', required: false, width: '220px' }
        ]
      }
    ]
  },
  {
    id: 'tpl-2',
    title: 'Договор найма жилого помещения',
    category: 'Жильё',
    type: 'Основной договор аренды',
    version: 'v2.0',
    updatedDate: '02.09.2026',
    requiredCount: 8,
    totalFieldsCount: 12,
    status: 'active',
    sections: []
  },
  {
    id: 'tpl-3',
    title: 'Платёжная квитанция ЖКХ',
    category: 'Коммунальные',
    type: 'Расчётный ежемесячный платёж',
    version: 'v1.0',
    updatedDate: '11.08.2026',
    requiredCount: 5,
    totalFieldsCount: 8,
    status: 'active',
    sections: []
  },
  {
    id: 'tpl-4',
    title: 'Трудовой договор / Соглашение',
    category: 'Работа',
    type: 'Трудоустройство и график',
    version: 'v1.1',
    updatedDate: '19.06.2026',
    requiredCount: 7,
    totalFieldsCount: 14,
    status: 'active',
    sections: []
  },
  {
    id: 'tpl-5',
    title: 'Старый акт осмотра (архивный)',
    category: 'Жильё',
    type: 'Устаревший акт 2024',
    version: 'v0.9',
    updatedDate: '12.01.2024',
    requiredCount: 2,
    totalFieldsCount: 4,
    status: 'archived',
    sections: []
  }
];

const initialMyData: MyDataItem[] = [
  {
    id: 'rec-1',
    title: 'Паспорт РФ: серия и номер',
    val: '40 14 № 891234',
    type: 'passport',
    typeName: 'Паспорт РФ',
    status: 'current',
    fromDate: '14.05.2018',
    toDate: 'Бессрочно',
    zone: 'secret',
    group: 'personal',
    comment: 'Паспорт выдан ГУ МВД России по г. Санкт-Петербургу и Ленинградской обл. 14.05.2018, код подразделения 780-042',
    tag: 'REC-001',
    icon: 'badge'
  },
  {
    id: 'rec-2',
    title: 'СНИЛС',
    val: '123-456-789 00',
    type: 'text',
    typeName: 'Текст / Код',
    status: 'current',
    fromDate: '10.02.2010',
    toDate: 'Бессрочно',
    zone: 'open',
    group: 'personal',
    comment: 'Страховое свидетельство обязательного пенсионного страхования',
    tag: 'REC-002',
    icon: 'fingerprint'
  },
  {
    id: 'rec-3',
    title: 'Адрес регистрации',
    val: 'г. Санкт-Петербург, Московский пр., д. 182, кв. 42',
    type: 'address',
    typeName: 'Адрес',
    status: 'current',
    fromDate: '15.06.2021',
    toDate: 'Бессрочно',
    zone: 'open',
    group: 'addresses',
    comment: 'Постоянная регистрация по месту жительства, штамп в паспорте стр. 5',
    tag: 'REC-003',
    icon: 'home'
  },
  {
    id: 'rec-4',
    title: 'Адрес прежний (Москва)',
    val: 'г. Москва, ул. Тверская, д. 10, кв. 5',
    type: 'address',
    typeName: 'Адрес',
    status: 'past',
    fromDate: '01.09.2015',
    toDate: '14.06.2021',
    zone: 'open',
    group: 'addresses',
    comment: 'Прежнее место жительства до переезда в Санкт-Петербург',
    tag: 'REC-004',
    icon: 'history'
  },
  {
    id: 'rec-5',
    title: 'ИНН физлица',
    val: '781234567890',
    type: 'inn',
    typeName: 'ИНН',
    status: 'current',
    fromDate: '20.08.2012',
    toDate: 'Бессрочно',
    zone: 'open',
    group: 'docs',
    comment: 'Присвоен МИФНС №24 по г. Санкт-Петербургу',
    tag: 'REC-005',
    icon: 'pin'
  },
  {
    id: 'rec-6',
    title: 'Банковский счет (Т-Банк)',
    val: '40817810200001234567',
    type: 'bik',
    typeName: 'Банковский счет',
    status: 'past',
    fromDate: '03.01.2023',
    toDate: '31.12.2023',
    zone: 'secret',
    group: 'bank',
    comment: 'БИК: 044525974, Корр. счет: 30101810145250000974',
    tag: 'REC-006',
    icon: 'account_balance'
  },
  {
    id: 'rec-7',
    title: 'Основной телефон',
    val: '+7 (921) 940-12-88',
    type: 'phone',
    typeName: 'Телефон',
    status: 'current',
    fromDate: '01.01.2018',
    toDate: 'Бессрочно',
    zone: 'open',
    group: 'other',
    comment: 'Оператор МегаФон (Северо-Западный филиал)',
    tag: 'REC-007',
    icon: 'call'
  }
];

const initialProblems: MaintenanceProblem[] = [
  {
    id: 'p1',
    code: '#01',
    title: 'Недоступен исходный скан',
    docId: 'PV-0114',
    docName: 'Договор подряда № 5',
    severity: 'high',
    area: 'Open',
    verifiedAt: '24.10, 23:00',
    recommendedAction: 'Указать путь к файлу'
  },
  {
    id: 'p2',
    code: '#02',
    title: 'Сбой генерации превью',
    docId: 'PV-0941',
    docName: 'Квитанция_газ.pdf',
    severity: 'low',
    area: 'Open',
    verifiedAt: '24.10, 23:00',
    recommendedAction: 'Безопасно перегенерировать'
  }
];

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>('zhurnal');
  const [selectedDocId, setSelectedDocId] = useState<string>('PV-0042');
  const [isVeraCryptMounted, setIsVeraCryptMounted] = useState<boolean>(true);
  
  // Storage collections
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(initialInbox);
  const [drafts, setDrafts] = useState<DraftItem[]>(initialDrafts);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('DRAFT-2026-089');
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1');
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');
  const [myData, setMyData] = useState<MyDataItem[]>(initialMyData);
  const [selectedMyDataId, setSelectedMyDataId] = useState<string>('rec-1');
  const [maintenanceProblems, setMaintenanceProblems] = useState<MaintenanceProblem[]>(initialProblems);
  const [lastIntegrityCheck, setLastIntegrityCheck] = useState<string>('24.10.2026, 23:00');
  
  // In-flight Document Preparation Pipeline Session (SCR-02 -> SCR-09)
  const [processingSession, setProcessingSession] = useState<ProcessingSession>({
    packageName: 'Пакет: Акт приёма-передачи с приложениями',
    files: [
      { id: 'page-1', name: 'Страница_01.jpg', size: '2.1 МБ', pageNum: 1, dpi: 300, spec: 'sRGB · 2480×3508 · 24-bit' },
      { id: 'page-2', name: 'Страница_02.jpg', size: '1.9 МБ', pageNum: 2, dpi: 300, spec: 'sRGB · 2480×3508 · 24-bit' },
      { id: 'page-3', name: 'Страница_03.jpg', size: '1.6 МБ', pageNum: 3, dpi: 300, spec: 'sRGB · 2480×3508 · 24-bit' },
      { id: 'page-4', name: 'Приложение.pdf', size: '1.2 МБ', pageNum: 4, dpi: 300, spec: 'PDF/A · Вектор + Текст' }
    ],
    workName: 'Акт приёма-передачи жилого помещения № 42',
    category: 'Жильё',
    docType: 'Акт приёма-передачи',
    zone: 'open',
    dateMode: 'concrete',
    dateValue: '12.10.2026',
    isDraftTitle: false,
    templateId: 'tpl-1',
    sourceUrl: 'https://dom.gosuslugi.ru/statement/4821',
    operatorComment: 'Акт сдачи-приемки при выезде жильца, 3 фото + приложение PDF',
    obsidianExport: true,
    parentDocId: 'PV-0041'
  });

  // Global modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [devModal, setDevModal] = useState<{ isOpen: boolean; featureName: string }>({
    isOpen: false,
    featureName: ''
  });
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(null);

  const showToast = (message: string, icon: string = 'check') => {
    setToast({ message, icon });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const navigateTo = (route: AppRoute, params?: { docId?: string; planId?: string; templateId?: string; draftId?: string }) => {
    if (params?.docId) setSelectedDocId(params.docId);
    if (params?.planId) setSelectedPlanId(params.planId);
    if (params?.templateId) setSelectedTemplateId(params.templateId);
    if (params?.draftId) setSelectedDraftId(params.draftId);
    setActiveRoute(route);
  };

  const toggleVeraCrypt = () => {
    setIsVeraCryptMounted(prev => {
      const next = !prev;
      showToast(next ? 'Том VeraCrypt подключен (Open + Secret)' : 'Том VeraCrypt отключен. Зона Secret скрыта', next ? 'lock_open' : 'lock');
      return next;
    });
  };

  const activeDocument = documents.find(d => d.id === selectedDocId);

  const updateDocumentFieldVerification = (docId: string, fieldId: string, isVerified: boolean, newVal?: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      const updatedFields = doc.fields.map(f => {
        if (f.id !== fieldId) return f;
        return {
          ...f,
          isVerified,
          value: newVal !== undefined ? newVal : f.value
        };
      });
      const verifiedCount = updatedFields.filter(f => f.isVerified).length;
      const filledCount = updatedFields.filter(f => f.value.trim().length > 0).length;
      return {
        ...doc,
        fields: updatedFields,
        verification: { verified: verifiedCount, total: updatedFields.length },
        completeness: { filled: filledCount, total: updatedFields.length }
      };
    }));
  };

  const softDeleteDocument = (docId: string, reason: string = 'Скрыт пользователем из основного списка') => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        isArchived: true,
        archiveReason: reason,
        archivedDate: new Date().toLocaleDateString('ru-RU')
      };
    }));
    showToast(`Документ ${docId} перемещён в раздел «Убранные»`, 'archive');
    navigateTo('ubrannye');
  };

  const restoreDocument = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        isArchived: false,
        archiveReason: undefined,
        archivedDate: undefined
      };
    }));
    showToast(`Документ ${docId} успешно возвращён в Журнал`, 'undo');
  };

  const moveDocumentPath = (docId: string, newPath: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return { ...doc, path: newPath };
    }));
    showToast(`Путь документа ${docId} обновлен: ${newPath}`, 'drive_file_move');
  };

  const updateProcessingSession = (updates: Partial<ProcessingSession>) => {
    setProcessingSession(prev => ({ ...prev, ...updates }));
  };

  const reorderProcessingPages = (fromIndex: number, toIndex: number) => {
    setProcessingSession(prev => {
      const newFiles = [...prev.files];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return {
        ...prev,
        files: newFiles.map((f, idx) => ({ ...f, pageNum: idx + 1 }))
      };
    });
  };

  const removeProcessingPage = (pageId: string) => {
    setProcessingSession(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== pageId).map((f, idx) => ({ ...f, pageNum: idx + 1 }))
    }));
    showToast('Страница исключена из набора и возвращена во Входящие', 'undo');
  };

  const commitProcessingToArchive = (): string => {
    const newDocId = `PV-00${Math.floor(43 + Math.random() * 20)}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      name: `${processingSession.workName}.pdf`,
      category: processingSession.category,
      zone: processingSession.zone,
      date: processingSession.dateValue || '12.10.2026',
      completeness: { filled: 5, total: 6 },
      verification: { verified: 4, total: 6 },
      relations: processingSession.parentDocId ? [{ id: processingSession.parentDocId, name: 'Договор найма жилого помещения № 42', type: 'parent' }] : [],
      transcriptExcerpt: `## ${processingSession.workName}\\nЗафиксирован в архиве.`,
      fullTranscript: `Текстовая расшифровка документа ${processingSession.workName}.`,
      path: `${processingSession.category} / 2026 / ${processingSession.zone === 'secret' ? 'Защищённый' : 'Оригиналы'}`,
      fileSize: '6.8 МБ',
      pageCount: processingSession.files.length,
      sha256: '8f2a994bc7d612e4c014781df03ab8714e8b39a48e71822c9e2d3f0a1b8c014d',
      fields: [
        { id: 'f1', label: 'Номер акта', value: '№ АПП-42', type: 'text', required: true, isVerified: true },
        { id: 'f2', label: 'Дата составления', value: '2026-10-12', type: 'date', required: true, isVerified: true },
        { id: 'f3', label: 'Наймодатель', value: 'Васильев Андрей Сергеевич', type: 'text', required: true, isVerified: false },
        { id: 'f4', label: 'Наниматель', value: 'Соколов Алексей Николаевич', type: 'text', required: true, isVerified: false },
        { id: 'f5', label: 'Адрес помещения', value: 'г. Санкт-Петербург, Московский пр., д. 182, кв. 42', type: 'text', required: true, isVerified: false },
        { id: 'f6', label: 'Комплекты ключей', value: '2 комплекта + чип домофона', type: 'text', required: false, isVerified: false, isCustom: true }
      ],
      tableData: [
        { id: 't1', index: 1, name: 'Холодильник двухкамерный', model: 'Bosch Serie 4 KGN39 / Исправен, чистый', condition: 'Исправен', provenance: '[Стр. 1, табл. строка 1]', isVerified: true },
        { id: 't2', index: 2, name: 'Стиральная машина', model: 'LG AI DD F2V5HG0W / Без повреждений', condition: 'Исправна', provenance: '[Стр. 1, табл. строка 2]', isVerified: true },
        { id: 't3', index: 3, name: 'Сплит-система инверторная', model: 'Daikin Sensira FTXC25C / Исправен, пульт', condition: 'Исправна', provenance: '[Стр. 1, табл. строка 3]', isVerified: false }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);
    // Remove package from inbox
    setInboxItems(prev => prev.filter(item => item.id !== 'inb-1'));
    setSelectedDocId(newDocId);
    showToast(`Документ ${newDocId} успешно зафиксирован в архиве`, 'lock');
    return newDocId;
  };

  const removeInboxItem = (id: string) => {
    setInboxItems(prev => prev.filter(i => i.id !== id));
    showToast('Элемент убран из очереди входящих');
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    showToast('Черновик удален без изменения исходных файлов');
  };

  const resumeDraft = (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      navigateTo(draft.stepRoute);
      showToast(`Черновик развернут: ${draft.stepName}`);
    }
  };

  const addPlan = (plan: Omit<PlanItem, 'id' | 'createdDate'>) => {
    const newId = String(Date.now());
    const newPlan: PlanItem = {
      ...plan,
      id: newId,
      createdDate: new Date().toLocaleDateString('ru-RU')
    };
    setPlans(prev => [newPlan, ...prev]);
    showToast('План документа добавлен в расписание', 'add_task');
  };

  const updatePlan = (id: string, updates: Partial<PlanItem>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('План документа обновлен');
  };

  const completePlanWithDoc = (planId: string, docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        status: 'completed',
        isOverdue: false,
        linkedDoc: doc ? { id: doc.id, name: doc.name, date: doc.date } : { id: docId, name: 'Архивный документ', date: new Date().toLocaleDateString('ru-RU') }
      };
    }));
    showToast('План переведён в статус «Выполнен» и связан с архивом', 'task_alt');
  };

  const cancelPlan = (planId: string, reason: string = 'Отменено пользователем') => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        status: 'canceled',
        isOverdue: false,
        notes: p.notes ? `${p.notes} (Причина отмены: ${reason})` : `Причина отмены: ${reason}`
      };
    }));
    showToast('План документа переведён в состояние «Отменён»');
  };

  const deletePlan = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    showToast('План удален');
  };

  const updateTemplate = (id: string, updates: Partial<TemplateItem>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast('Шаблон схемы успешно сохранён');
  };

  const addTemplateField = (templateId: string, sectionId: string, field: any) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: t.sections.map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            fields: [...s.fields, { ...field, id: `f_${Date.now()}` }]
          };
        }),
        totalFieldsCount: t.totalFieldsCount + 1
      };
    }));
    showToast('Поле добавлено в схему шаблона');
  };

  const deleteTemplateField = (templateId: string, sectionId: string, fieldId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: t.sections.map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            fields: s.fields.filter(f => f.id !== fieldId)
          };
        }),
        totalFieldsCount: Math.max(0, t.totalFieldsCount - 1)
      };
    }));
    showToast('Поле удалено из схемы (архивные документы защищены)', 'shield');
  };

  const updateMyDataRecord = (id: string, updates: Partial<MyDataItem>) => {
    setMyData(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    showToast('Реквизит обновлен');
  };

  const migrateMyDataZone = (id: string, newZone: StorageZone) => {
    setMyData(prev => prev.map(r => r.id === id ? { ...r, zone: newZone } : r));
    showToast(`Реквизит перемещён в зону ${newZone === 'secret' ? 'Secret (VeraCrypt)' : 'Open (Открытая)'}`);
  };

  const addMyDataRecord = (record: Omit<MyDataItem, 'id' | 'tag'>) => {
    const newId = `rec-${Date.now()}`;
    const newRec: MyDataItem = {
      ...record,
      id: newId,
      tag: `REC-00${myData.length + 1}`
    };
    setMyData(prev => [newRec, ...prev]);
    showToast('Реквизит добавлен в справочник «Мои данные»');
  };

  const deleteMyDataRecord = (id: string) => {
    setMyData(prev => prev.filter(r => r.id !== id));
    showToast('Реквизит удален из справочника');
  };

  const runIntegrityCheck = () => {
    setLastIntegrityCheck(new Date().toLocaleString('ru-RU'));
    showToast('Проверка целостности архива завершена: 100% SHA-256 OK', 'verified');
  };

  const openDevModal = (featureName: string) => {
    setDevModal({ isOpen: true, featureName });
  };

  const closeDevModal = () => {
    setDevModal({ isOpen: false, featureName: '' });
  };

  // Keyboard shortcut handler for desktop workstation ergonomics (F4, F5, F10, Esc, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
        } else if (devModal.isOpen) {
          closeDevModal();
        } else if (activeRoute !== 'zhurnal' && !['redaktor', 'sverka'].includes(activeRoute)) {
          navigateTo('zhurnal');
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        navigateTo('redaktor');
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (activeRoute === 'redaktor' || activeRoute === 'kartochka') {
          navigateTo('sverka');
        } else {
          runIntegrityCheck();
        }
      } else if (e.key === 'F10') {
        e.preventDefault();
        showToast('Черновик текущей сессии сохранён в SQLite (F10)', 'save');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRoute, isSearchModalOpen, devModal.isOpen]);

  return (
    <VaultContext.Provider
      value={{
        activeRoute,
        navigateTo,
        selectedDocId,
        setSelectedDocId,
        isVeraCryptMounted,
        toggleVeraCrypt,
        documents,
        activeDocument,
        updateDocumentFieldVerification,
        softDeleteDocument,
        restoreDocument,
        moveDocumentPath,
        processingSession,
        updateProcessingSession,
        reorderProcessingPages,
        removeProcessingPage,
        commitProcessingToArchive,
        inboxItems,
        removeInboxItem,
        drafts,
        selectedDraftId,
        setSelectedDraftId,
        deleteDraft,
        resumeDraft,
        plans,
        selectedPlanId,
        setSelectedPlanId,
        addPlan,
        updatePlan,
        completePlanWithDoc,
        cancelPlan,
        deletePlan,
        templates,
        selectedTemplateId,
        setSelectedTemplateId,
        updateTemplate,
        addTemplateField,
        deleteTemplateField,
        myData,
        selectedMyDataId,
        setSelectedMyDataId,
        updateMyDataRecord,
        migrateMyDataZone,
        addMyDataRecord,
        deleteMyDataRecord,
        maintenanceProblems,
        lastIntegrityCheck,
        runIntegrityCheck,
        isSearchModalOpen,
        setIsSearchModalOpen,
        devModal,
        openDevModal,
        closeDevModal,
        toast,
        showToast
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
