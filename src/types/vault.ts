/**
 * Data structures and types for PersonalVault 2.0
 */

export type AppRoute =
  | 'zhurnal'         // SCR-01: Journal
  | 'vkhodyashchie'   // SCR-02: Inbox
  | 'sostav'          // SCR-03: Document Composition
  | 'predproverka'    // SCR-04: Pre-check & Quality
  | 'klassifikaciya'  // SCR-05: Classification & Metadata
  | 'redaktor'        // SCR-06: Data Editor
  | 'sverka'          // SCR-07: Scan Verification
  | 'itog'            // SCR-08: Pre-Archive Review
  | 'rezultat'        // SCR-09: Archive Seal Result
  | 'chernoviki'      // SCR-10: Drafts
  | 'kartochka'       // SCR-11: Document Card View
  | 'shablony'        // SCR-12: Templates Catalog
  | 'shablon-redaktor'// SCR-13: Template Builder
  | 'moi-dannye'      // SCR-14: My Data Directory
  | 'plany'           // SCR-15: Plans & Deadlines
  | 'ubrannye'        // SCR-16: Soft-archived Documents
  | 'nastroiki'       // SCR-17: Settings
  | 'obsluzhivanie';  // SCR-18: Maintenance & Integrity

export type StorageZone = 'open' | 'secret';

export interface DocumentField {
  id: string;
  label: string;
  value: string;
  type: string;
  required: boolean;
  isVerified: boolean;
  citation?: string;
  sourcePage?: number;
  bbox?: number[];
  isCustom?: boolean;
}

export interface EquipmentItem {
  id: string;
  index: number;
  name: string;
  model: string;
  condition: string;
  provenance: string;
  isVerified: boolean;
}

export interface DocumentRelation {
  id: string;
  name: string;
  type: 'parent' | 'child' | 'related';
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  zone: StorageZone;
  date: string;
  completeness: {
    filled: number;
    total: number;
  };
  verification: {
    verified: number;
    total: number;
  };
  relations: DocumentRelation[];
  transcriptExcerpt: string;
  fullTranscript: string;
  path: string;
  fileSize: string;
  pageCount: number;
  sha256: string;
  fields: DocumentField[];
  tableData?: EquipmentItem[];
  isArchived?: boolean; // When in "Убранные" (SCR-16)
  archiveReason?: string;
  archivedDate?: string;
  previewUrl?: string;
}

export interface InboxItem {
  id: string;
  name: string;
  type: 'НАБОР' | 'PDF' | 'BIN' | 'JPEG';
  size: string;
  composition: string;
  status: 'ready' | 'attention' | 'error';
  statusText: string;
  dateAdded: string;
  isPackage?: boolean;
  filesList?: string[];
  workName?: string;
  previewUrl?: string;
}

export interface DraftItem {
  id: string;
  title: string;
  category: string;
  zone: StorageZone;
  savedTime: string;
  status: string;
  stepName: string;
  stepRoute: AppRoute;
  fieldsFilled: number;
  fieldsTotal: number;
  verifiedCount: number;
  previewUrl?: string;
  isConflict?: boolean;
}

export interface PlanItem {
  id: string;
  title: string;
  category: string;
  zone: StorageZone;
  deadline: string;
  relative: string;
  status: 'planned' | 'completed' | 'canceled';
  isOverdue: boolean;
  notes: string;
  createdDate: string;
  linkedDoc?: {
    id: string;
    name: string;
    date: string;
  };
}

export interface TemplateField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  linkedDirectory?: string;
  hint?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  fields: TemplateField[];
  hasTable?: boolean;
  tableTitle?: string;
  tableColumns?: Array<{ name: string; type: string; required: boolean; width: string }>;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  type: string;
  version: string;
  updatedDate: string;
  requiredCount: number;
  totalFieldsCount: number;
  status: 'active' | 'archived';
  sections: TemplateSection[];
}

export interface MyDataItem {
  id: string;
  title: string;
  val: string;
  type: string;
  typeName: string;
  status: 'current' | 'past';
  fromDate: string;
  toDate: string;
  zone: StorageZone;
  group: string;
  comment: string;
  tag: string;
  icon: string;
}

export interface MaintenanceProblem {
  id: string;
  code: string;
  title: string;
  docId: string;
  docName: string;
  severity: 'high' | 'low';
  area: 'Open' | 'Secret';
  verifiedAt: string;
  recommendedAction: string;
}
