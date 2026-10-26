/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenId =
  | 'SCR-01' // Журнал документов
  | 'SCR-02' // Входящие: очередь материалов
  | 'SCR-03' // Подготовка: состав и порядок страниц
  | 'SCR-04' // Подготовка: предпроверка пригодности
  | 'SCR-05' // Подготовка: классификация
  | 'SCR-06' // Подготовка: редактор реквизитов
  | 'SCR-07' // Подготовка: сверка со сканом
  | 'SCR-08' // Подготовка: итог перед сохранением
  | 'SCR-09' // Подготовка: результат архивации
  | 'SCR-10' // Черновики и сессии
  | 'SCR-11' // Карточка архивного документа
  | 'SCR-12' // Каталог шаблонов
  | 'SCR-13' // Конструктор структуры шаблона
  | 'SCR-14' // Справочник «Мои данные»
  | 'SCR-15' // Планы документов
  | 'SCR-16' // Убранные документы
  | 'SCR-17' // Настройки приложения
  | 'SCR-18' // Обслуживание архива
  | 'SCR-19' // Сводка здоровья
  | 'SCR-20'; // Помощник ИИ

export type SecurityZone = 'open' | 'secret';

export interface ArchiveDocument {
  id: string; // e.g. "PV-0042"
  title: string;
  category: string;
  docType: string;
  date: string;
  isDateUnknown?: boolean;
  zone: SecurityZone;
  completeness: { filled: number; total: number };
  verification: { verified: number; total: number };
  relations: { id: string; name: string; type: string }[];
  transcriptExcerpt: string;
  fullTranscript: string;
  archivePath: string;
  sha256: string;
  fileSize: string;
  pagesCount: number;
  fileName: string;
  revision: string;
  status: 'active' | 'trashed';
  trashedDate?: string;
  trashedReason?: string;
  fields: DocumentFieldValue[];
  equipmentTable?: EquipmentRow[];
}

export interface DocumentFieldValue {
  id: string;
  label: string;
  value: string;
  isRequired: boolean;
  isVerified: boolean;
  sourceQuote: string;
  sourcePage: number;
  bbox?: string;
  section: string;
  isCustom?: boolean;
}

export interface EquipmentRow {
  id: number;
  name: string;
  model: string;
  condition: string;
  provenance: string;
  isVerified: boolean;
}

export interface InboxItem {
  id: string;
  name: string;
  isPackage: boolean;
  type: string;
  size: string;
  pagesCount: number;
  fileCount: number;
  status: 'ready' | 'attention' | 'error';
  statusText: string;
  addedDate: string;
  subfilesSummary?: string;
  workingTitle: string;
  targetZone: SecurityZone;
  preCategory: string;
  preType: string;
  sourceUrl: string;
  comment: string;
  exportObsidian: boolean;
  previewUrl?: string;
  pages: CompositionPage[];
}

export interface CompositionPage {
  id: number;
  fileName: string;
  origPos: string;
  globalNum: string;
  title: string;
  subtitle: string;
  spec: string;
  summary: string;
  previewType: 'text_act' | 'inventory' | 'photo' | 'vector_pdf';
  isExcluded?: boolean;
}

export interface VerificationFieldItem {
  id: number;
  title: string;
  category: string;
  normalizedValue: string;
  rawQuote: string;
  sourceCoords: string;
  pageNumber: number;
  status: 'waiting' | 'verified' | 'missing' | 'changed' | 'offline' | 'deferred';
  matchPercent: number;
  dbField: string;
  isRequired: boolean;
}

export interface TemplateFieldSpec {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  hint: string;
  linkedMyData?: string;
}

export interface TemplateSectionSpec {
  id: string;
  title: string;
  fields: TemplateFieldSpec[];
  tableSpec?: {
    title: string;
    columns: { name: string; type: string; isRequired: boolean; defaultWidth: string }[];
  };
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  typeDescription: string;
  version: string;
  date: string;
  reqFieldsCount: number;
  totalFieldsCount: number;
  sectionsCount: number;
  hasTable: boolean;
  isArchived: boolean;
  sections: TemplateSectionSpec[];
}

export interface MyDataRecord {
  id: string;
  title: string;
  val: string;
  type: string;
  typeName: string;
  status: 'current' | 'past';
  fromDate: string;
  toDate: string;
  zone: SecurityZone;
  group: string;
  comment: string;
  tag: string;
  icon: string;
}

export interface MyDataCategory {
  id: string;
  name: string;
  countOnline: number;
  countOffline: number;
  hasSecret: boolean;
  icon: string;
  isHidden?: boolean;
}

export interface PlanItem {
  id: number;
  title: string;
  category: string;
  zone: 'Open' | 'Secret';
  deadline: string;
  relative: string;
  status: 'Запланирован' | 'Выполнен' | 'Отменён';
  isOverdue: boolean;
  notes: string;
  linkedDoc: { code: string; name: string; date: string } | null;
  cancelReason?: string;
}

export interface DraftSession {
  id: string;
  title: string;
  stageName: string;
  screenId: ScreenId;
  category: string;
  zone: 'Open' | 'Secret';
  lastSaved: string;
  relativeSaved: string;
  status: 'Сохранён' | 'В процессе' | 'Конфликт';
  progressPercent: number;
  reqStatus: string;
  verifyStatus: string;
  filesCount: number;
  previewUrl: string;
  hasConflict?: boolean;
}
