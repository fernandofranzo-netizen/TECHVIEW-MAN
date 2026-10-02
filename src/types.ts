export type DocumentCategory = string;

/**
 * Validates whether a category name starts with a number (e.g. '07 - LAMINAÇÃO', '10 - CORTE')
 * or is 'TODOS'. Root categories MUST start with a number; machine names (KAMPF, ROTOMEC, etc.)
 * are subcategories inside their respective numbered parent category.
 */
export function isNumberedCategory(catName: string): boolean {
  if (!catName) return false;
  const trimmed = catName.trim();
  if (trimmed === 'Todos' || trimmed === 'TODOS') return true;
  return /^\d+/.test(trimmed);
}

// Backward compatibility alias: root categories must be numbered
export function isUpperCaseCategory(catName: string): boolean {
  return isNumberedCategory(catName);
}

/**
 * Mapping from equipment / machine subcategory to official numbered parent category
 */
export const SUBCATEGORY_TO_PARENT_CATEGORY_MAP: Record<string, string> = {
  'ROTOMEC': '07 - LAMINAÇÃO',
  'Rotomec': '07 - LAMINAÇÃO',
  'VAREX I': '08 - EXTRUSÃO',
  'Varex I': '08 - EXTRUSÃO',
  'VAREX II': '08 - EXTRUSÃO',
  'Varex II': '08 - EXTRUSÃO',
  'KAMPF I': '10 - CORTE',
  'Kampf I': '10 - CORTE',
  'KAMPF II': '10 - CORTE',
  'Kampf II': '10 - CORTE',
  'SUBESTAÇÃO': '13 - UTILIDADES',
  'Subestação': '13 - UTILIDADES',
};

export const DEFAULT_TECHNICAL_CATEGORIES: DocumentCategory[] = [
  '07 - LAMINAÇÃO',
  '08 - EXTRUSÃO',
  '10 - CORTE',
  '13 - UTILIDADES',
];

export const TECHNICAL_CATEGORIES = DEFAULT_TECHNICAL_CATEGORIES;

export type DocumentType = 'drawing' | 'photo';

export type DocumentStatus = 'Aprovado' | 'Em Revisão' | 'Para Execução' | 'As-Built';

export interface Annotation {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  text: string;
  author: string;
  date: string;
  type?: 'cota' | 'nota' | 'alerta' | 'revisao';
}

export interface TechnicalDocument {
  id: string;
  code: string;
  title: string;
  description: string;
  category: DocumentCategory;
  subcategory?: string;
  type: DocumentType;
  discipline: string;
  revision: string;
  date: string;
  author: string;
  approver: string;
  scale: string;
  status: DocumentStatus;
  format: 'SVG Vector HD' | 'Hi-Res Raster' | 'DWG Render' | 'PDF Técnico';
  fileSize: string;
  resolution: string;
  isOfflineCached: boolean;
  equipmentCode: string;
  tags: string[];
  specs: Record<string, string>;
  notes: string[];
  annotations: Annotation[];
  svgContent?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveFolderId?: string;
  driveSubfolderName?: string;
  driveFolderPath?: string;
  isPdf?: boolean;
  fileMimeType?: string;
  pdfPreviewUrl?: string;
}

export interface SubcategoryItem {
  name: string;
  count: number;
  folderId?: string;
  category: string;
}

export interface CategoryHierarchyItem {
  name: string;
  count: number;
  folderId?: string;
  subcategories: SubcategoryItem[];
}

export interface FilterState {
  searchQuery: string;
  category: DocumentCategory | 'Todos';
  subcategory?: string | 'all';
  type: DocumentType | 'all';
  status: DocumentStatus | 'all';
  onlyOffline: boolean;
  sortBy: 'code' | 'date' | 'title' | 'revision';
  sortOrder: 'asc' | 'desc';
}

export type ViewerTheme = 'white' | 'dark' | 'blueprint';
