import { 
  TechnicalDocument, 
  TECHNICAL_CATEGORIES, 
  DocumentCategory,
  CategoryHierarchyItem,
  SubcategoryItem,
  isNumberedCategory,
  isUpperCaseCategory
} from '../types';
import { getAccessToken, clearStoredToken, getStoredAccount } from './googleAuth';

export const DRIVE_ROOT_FOLDER_NAME = 'CONSULTA IMAGENS E DESENHO TÉCNICO';
const DATABASE_FILENAME = 'techview_database.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
}

export interface DriveSubcategoryInfo {
  id: string;
  name: string;
  filesCount: number;
  files: DriveFileInfo[];
}

export interface CategoryFolderStats {
  category: DocumentCategory;
  folderId: string;
  filesCount: number;
  directFilesCount: number;
  files: DriveFileInfo[];
  subcategories: DriveSubcategoryInfo[];
}

export interface DriveDatabasePayload {
  version: string;
  exportedAt: string;
  source: string;
  documentsCount: number;
  documents: TechnicalDocument[];
}

export interface SyncCategoriesResult {
  documents: TechnicalDocument[];
  categoryStats: Record<string, CategoryFolderStats>;
  categoriesHierarchy: CategoryHierarchyItem[];
  totalDriveFiles: number;
  newFilesCount: number;
  updatedAt: string;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatFileSize(bytesStr?: string | number): string {
  if (!bytesStr) return 'N/A';
  const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
  if (isNaN(bytes) || bytes <= 0) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryPrefix(category: string): string {
  const map: Record<string, string> = {
    '07 - LAMINAÇÃO': 'LAM',
    '08 - EXTRUSÃO': 'EXT',
    '10 - CORTE': 'CRT',
    '13 - UTILIDADES': 'UTL',
    'KAMPF I': 'KMP1',
    'KAMPF II': 'KMP2',
    'ROTOMEC': 'ROT',
    'SUBESTAÇÃO': 'SUB',
    'VAREX I': 'VRX1',
    'VAREX II': 'VRX2',
  };
  return map[category] || category.replace(/^\d+\s*-\s*/, '').slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'TEC';
}

function deriveTechnicalCode(fileName: string, category: string, subcategory?: string, index: number = 0): string {
  const baseName = fileName.replace(/\.[^/.]+$/, '').trim();
  if (/^[A-Z0-9_-]{3,}$/i.test(baseName)) {
    return baseName.toUpperCase();
  }
  const prefix = getCategoryPrefix(category);
  const subPrefix = subcategory ? `-${subcategory.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')}` : '';
  const cleanName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toUpperCase();
  return `${prefix}${subPrefix}-${cleanName.slice(0, 14) || String(index + 1).padStart(3, '0')}`;
}

function createBlueprintPlaceholderSvg(
  title: string, 
  code: string, 
  category: string, 
  subcategory: string | undefined,
  date: string, 
  mime: string,
  isPdf: boolean = false
): string {
  const isPdfDoc = isPdf || mime === 'application/pdf' || title.toLowerCase().endsWith('.pdf');
  const accentColor = isPdfDoc ? '#ef4444' : '#38bdf8';
  const badgeText = isPdfDoc ? 'DOCUMENTO PDF DE ENGENHARIA' : 'ARQUIVO TÉCNICO VINCULADO AO DRIVE';
  const subText = subcategory ? ` | SUBCATEGORIA: ${escapeXml(subcategory)}` : '';

  return `<svg viewBox="0 0 1100 720" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid-pattern-drive" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" opacity="0.6" />
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#334155" stroke-width="1.2" opacity="0.8" />
    </pattern>
  </defs>
  <rect width="1100" height="720" fill="#0b1329" />
  <rect width="1100" height="720" fill="url(#grid-pattern-drive)" />
  <rect x="25" y="25" width="1050" height="670" fill="none" stroke="${accentColor}" stroke-width="2.5" />
  <rect x="35" y="35" width="1030" height="650" fill="none" stroke="#1e3a8a" stroke-width="1" />
  
  <g transform="translate(550, 300)" text-anchor="middle">
    <circle cx="0" cy="-60" r="48" fill="#1e293b" stroke="${accentColor}" stroke-width="2"/>
    ${isPdfDoc 
      ? `<text x="0" y="-50" font-family="'JetBrains Mono', monospace" font-weight="extrabold" font-size="28" fill="#ef4444" text-anchor="middle">PDF</text>`
      : `<path d="M -20 -70 L 20 -70 L 20 -40 L -20 -40 Z" fill="none" stroke="#38bdf8" stroke-width="2"/>
         <path d="M -12 -55 L 12 -55" stroke="#38bdf8" stroke-width="2"/>
         <path d="M -12 -48 L 8 -48" stroke="#38bdf8" stroke-width="2"/>`
    }
    
    <text y="20" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="22" fill="#f8fafc">${escapeXml(title)}</text>
    <text y="50" font-family="sans-serif" font-size="13" font-weight="bold" fill="${accentColor}">${badgeText}</text>
    <text y="75" font-family="'JetBrains Mono', monospace" font-size="12" fill="#94a3b8">PASTA: ${escapeXml(category)}${subText}</text>
    <text y="105" font-family="sans-serif" font-size="12" fill="#64748b">Clique em "Visualizar PDF" ou "Abrir no Drive" para inspecionar em alta resolução</text>
  </g>

  <g transform="translate(680, 565)">
    <rect x="0" y="0" width="385" height="120" fill="#0f172a" stroke="${accentColor}" stroke-width="1.5" />
    <line x1="0" y1="35" x2="385" y2="35" stroke="${accentColor}" stroke-width="1"/>
    <line x1="0" y1="75" x2="385" y2="75" stroke="${accentColor}" stroke-width="1"/>
    <line x1="260" y1="35" x2="260" y2="120" stroke="${accentColor}" stroke-width="1"/>
    
    <text x="12" y="24" font-family="sans-serif" font-weight="bold" font-size="12" fill="${accentColor}">CONSULTA IMAGENS E DESENHO TÉCNICO</text>
    <text x="12" y="55" font-family="sans-serif" font-weight="bold" font-size="11" fill="#f8fafc">${escapeXml(category)}${subcategory ? ` / ${escapeXml(subcategory)}` : ''}</text>
    <text x="12" y="102" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="13" fill="${accentColor}">${escapeXml(code)}</text>
    
    <text x="270" y="55" font-family="sans-serif" font-size="10" fill="#94a3b8">DATA: ${escapeXml(date)}</text>
    <text x="270" y="102" font-family="sans-serif" font-size="10" fill="#94a3b8">${isPdfDoc ? 'FORMATO: PDF' : 'ORIGEM: DRIVE'}</text>
  </g>
</svg>`;
}

export const DriveSyncService = {
  /**
   * Helper to make authenticated requests to Google Drive REST API v3
   */
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Sessão não autenticada com Google Drive.');
    }

    // Local permanent session token (bypass remote API calls that would fail with 401)
    if (token.startsWith('permanent_session_') || token.startsWith('perm_token_')) {
      return new Response(JSON.stringify({ files: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      if (response.status === 401) {
        if (token.startsWith('ya29.')) {
          clearStoredToken();
        }
        const acc = getStoredAccount();
        throw new Error(`Sessão do Google Drive expirada. Clique para renovar a autorização da conta permanente ${acc.email}.`);
      }
      const errText = await response.text();
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        parsedErr = { error: { message: errText } };
      }
      throw new Error(parsedErr?.error?.message || `Erro no Google Drive (${response.status})`);
    }
    return response;
  },

  /**
   * Helper to normalize text for comparison (removes accents, trims, lowercases)
   */
  normalizeName(s: string): string {
    return (s || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Finds or creates the root folder 'CONSULTA IMAGENS E DESENHO TÉCNICO' in Google Drive.
   * Multi-strategy search supporting My Drive, Shared Drives, and Shared Folders.
   */
  async getOrCreateAppFolder(): Promise<string> {
    // Strategy 1: Search exact name and variations across all drives and shared items
    const queries = [
      `name = '${DRIVE_ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      `name contains 'CONSULTA IMAGENS' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      `name contains 'DESENHO TÉCNICO' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      `name contains 'DESENHO TECNICO' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    ];

    const candidateFolders: Array<{ id: string; name: string; fileCount?: number }> = [];

    for (const q of queries) {
      try {
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`;
        const res = await this.fetchWithAuth(url);
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          for (const f of data.files) {
            if (!candidateFolders.some((c) => c.id === f.id)) {
              candidateFolders.push({ id: f.id, name: f.name });
            }
          }
        }
        if (candidateFolders.length > 0) break;
      } catch (e) {
        console.warn('Erro ao consultar pasta raiz:', e);
      }
    }

    // Strategy 2: If multiple candidates found, pick the one that has children/content
    if (candidateFolders.length > 0) {
      if (candidateFolders.length === 1) {
        return candidateFolders[0].id;
      }

      // Check which candidate actually has subfolders or files
      for (const candidate of candidateFolders) {
        try {
          const checkUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
            `'${candidate.id}' in parents and trashed = false`
          )}&fields=files(id)&pageSize=10&supportsAllDrives=true&includeItemsFromAllDrives=true`;
          const checkRes = await this.fetchWithAuth(checkUrl);
          const checkData = await checkRes.json();
          candidate.fileCount = checkData.files?.length || 0;
        } catch {
          candidate.fileCount = 0;
        }
      }

      // Sort by file count descending
      candidateFolders.sort((a, b) => (b.fileCount || 0) - (a.fileCount || 0));
      return candidateFolders[0].id;
    }

    // Strategy 3: Search for category subfolders (e.g. Rotomec, Subestação) to discover parent root
    try {
      const catQuery = encodeURIComponent(
        `(name = 'Rotomec' or name = 'Subestação' or name = 'Subestacao' or name = 'Varex I' or name = 'Kampf I') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
      );
      const catRes = await this.fetchWithAuth(
        `https://www.googleapis.com/drive/v3/files?q=${catQuery}&fields=files(id,name,parents)&pageSize=5&supportsAllDrives=true&includeItemsFromAllDrives=true`
      );
      const catData = await catRes.json();
      if (catData.files && catData.files.length > 0 && catData.files[0].parents && catData.files[0].parents.length > 0) {
        return catData.files[0].parents[0];
      }
    } catch (e) {
      console.warn('Aviso na busca por categorias filhas:', e);
    }

    // Strategy 4: If still not found, create root folder
    const createRes = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: DRIVE_ROOT_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Repositório Central de Imagens e Desenhos Técnicos - TechView HD',
      }),
    });
    const folder = await createRes.json();
    return folder.id;
  },

  /**
   * Discovers ALL category folders under root 'CONSULTA IMAGENS E DESENHO TÉCNICO'
   * and maps them with accent-tolerant matching.
   */
  async syncCategorySubfolders(): Promise<Record<string, string>> {
    const rootFolderId = await this.getOrCreateAppFolder();

    // Query existing subfolders under root
    const query = encodeURIComponent(
      `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`
    );
    const searchData = await searchRes.json();

    const existingMap: Record<string, string> = {};
    const driveFolderList: Array<{ id: string; name: string }> = searchData.files || [];

    // Map each Drive folder: ONLY KEEP FOLDERS WHOSE NAME STARTS WITH A NUMBER!
    for (const df of driveFolderList) {
      if (!isNumberedCategory(df.name)) {
        continue;
      }

      const normDriveName = this.normalizeName(df.name);
      
      // Match against numbered categories
      let matchedCategory = TECHNICAL_CATEGORIES.find(
        (cat) => this.normalizeName(cat) === normDriveName
      );

      if (matchedCategory) {
        existingMap[matchedCategory] = df.id;
      } else {
        // Keep custom numbered categories discovered in Drive
        existingMap[df.name] = df.id;
      }
    }

    // Verify baseline numbered subfolders if missing in Drive
    for (const cat of TECHNICAL_CATEGORIES) {
      if (isNumberedCategory(cat) && !existingMap[cat]) {
        try {
          const createRes = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: cat,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootFolderId],
              description: `Pasta técnica oficial para ${cat}`,
            }),
          });
          const created = await createRes.json();
          existingMap[cat] = created.id;
        } catch (e) {
          console.warn(`Aviso ao criar subpasta ${cat} no Drive:`, e);
        }
      }
    }

    return existingMap;
  },

  /**
   * Discovers subfolders (subcategories) inside a given category folder
   */
  async listSubfolders(parentFolderId: string): Promise<Array<{ id: string; name: string }>> {
    try {
      const query = encodeURIComponent(
        `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
      );
      const res = await this.fetchWithAuth(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100&orderBy=name asc&supportsAllDrives=true&includeItemsFromAllDrives=true`
      );
      const data = await res.json();
      return (data.files || []).map((f: any) => ({ id: f.id, name: f.name }));
    } catch (e) {
      console.warn(`Erro ao listar subpastas para ${parentFolderId}:`, e);
      return [];
    }
  },

  /**
   * Lists non-folder files inside a specific folder
   */
  async listFilesInSpecificFolder(folderId: string): Promise<DriveFileInfo[]> {
    try {
      const query = encodeURIComponent(
        `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
      );
      const res = await this.fetchWithAuth(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink,description)&pageSize=100&orderBy=name asc&supportsAllDrives=true&includeItemsFromAllDrives=true`
      );
      const data = await res.json();
      return data.files || [];
    } catch (e) {
      console.warn(`Erro ao listar arquivos da pasta ${folderId}:`, e);
      return [];
    }
  },

  /**
   * Comprehensive Synchronizer:
   * Scans ALL category folders under 'CONSULTA IMAGENS E DESENHO TÉCNICO',
   * scans all subfolders (subcategories) inside each category,
   * captures all files (including .pdf, images, cad, etc.),
   * and builds both the document list and the category/subcategory hierarchy.
   */
  async syncAllCategoriesWithDrive(
    existingDocuments: TechnicalDocument[]
  ): Promise<SyncCategoriesResult> {
    const subfolderMap = await this.syncCategorySubfolders();

    // All categories found (strictly uppercase categories only)
    const allCategoryNames = Array.from(
      new Set([...TECHNICAL_CATEGORIES, ...Object.keys(subfolderMap)])
    )
      .filter((cat) => isUpperCaseCategory(cat))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const categoryStats: Record<string, CategoryFolderStats> = {};
    const categoriesHierarchy: CategoryHierarchyItem[] = [];

    const existingByDriveId = new Map<string, TechnicalDocument>();
    existingDocuments.forEach((doc) => {
      if (doc.driveFileId) {
        existingByDriveId.set(doc.driveFileId, doc);
      }
      existingByDriveId.set(doc.id, doc);
    });

    const syncedDriveDocs: TechnicalDocument[] = [];
    let newFilesCount = 0;
    let totalDriveFiles = 0;

    for (const cat of allCategoryNames) {
      const catFolderId = subfolderMap[cat];
      if (!catFolderId) continue;

      // 1. Find Subfolders (Subcategories) inside this category
      const subfolders = await this.listSubfolders(catFolderId);

      // 2. Find files placed directly in the main category folder
      const directFiles = await this.listFilesInSpecificFolder(catFolderId);

      const subcategoriesStats: DriveSubcategoryInfo[] = [];
      const subcategoryHierarchyItems: SubcategoryItem[] = [];
      const allFilesForThisCat: DriveFileInfo[] = [...directFiles];

      // Process direct files in category
      for (let i = 0; i < directFiles.length; i++) {
        const file = directFiles[i];
        const doc = this.convertDriveFileToDocument(
          file,
          cat,
          undefined, // no subcategory
          catFolderId,
          existingByDriveId,
          i
        );
        if (!existingByDriveId.has(file.id) && !existingByDriveId.has(doc.id)) {
          newFilesCount++;
        }
        syncedDriveDocs.push(doc);
      }

      // 3. Scan files in each subfolder (Subcategory)
      for (const sub of subfolders) {
        const subFiles = await this.listFilesInSpecificFolder(sub.id);
        allFilesForThisCat.push(...subFiles);

        subcategoriesStats.push({
          id: sub.id,
          name: sub.name,
          filesCount: subFiles.length,
          files: subFiles,
        });

        subcategoryHierarchyItems.push({
          name: sub.name,
          count: subFiles.length,
          folderId: sub.id,
          category: cat,
        });

        // Convert each file inside this subcategory
        for (let j = 0; j < subFiles.length; j++) {
          const file = subFiles[j];
          const doc = this.convertDriveFileToDocument(
            file,
            cat,
            sub.name, // Subcategory name
            sub.id,
            existingByDriveId,
            j
          );
          if (!existingByDriveId.has(file.id) && !existingByDriveId.has(doc.id)) {
            newFilesCount++;
          }
          syncedDriveDocs.push(doc);
        }
      }

      const totalFilesForCat = directFiles.length + subcategoriesStats.reduce((acc, s) => acc + s.filesCount, 0);
      totalDriveFiles += totalFilesForCat;

      categoryStats[cat] = {
        category: cat,
        folderId: catFolderId,
        filesCount: totalFilesForCat,
        directFilesCount: directFiles.length,
        files: allFilesForThisCat,
        subcategories: subcategoriesStats,
      };

      categoriesHierarchy.push({
        name: cat,
        count: totalFilesForCat,
        folderId: catFolderId,
        subcategories: subcategoryHierarchyItems,
      });
    }

    // Merge with any offline documents that are not in Drive (excluding initial mock samples when Drive files exist)
    const driveDocIds = new Set(syncedDriveDocs.map((d) => d.id));
    const mergedDocuments: TechnicalDocument[] = [...syncedDriveDocs];

    if (syncedDriveDocs.length === 0) {
      existingDocuments.forEach((doc) => {
        if (!doc.driveFileId) {
          mergedDocuments.push(doc);
        }
      });
    } else {
      existingDocuments.forEach((doc) => {
        const isMockSample = /^doc-[1-8]$/.test(doc.id);
        if (!driveDocIds.has(doc.id) && !doc.driveFileId && !isMockSample) {
          mergedDocuments.push(doc);
        }
      });
    }

    const updatedAt = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return {
      documents: mergedDocuments,
      categoryStats,
      categoriesHierarchy,
      totalDriveFiles,
      newFilesCount,
      updatedAt,
    };
  },

  /**
   * Helper to convert a Drive file (including PDF, SVG, raster images) into a TechnicalDocument
   */
  convertDriveFileToDocument(
    file: DriveFileInfo,
    category: string,
    subcategory: string | undefined,
    folderId: string,
    existingByDriveId: Map<string, TechnicalDocument>,
    index: number
  ): TechnicalDocument {
    const isPdf = file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.name);
    const isImage = file.mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
    const isSvg = file.mimeType === 'image/svg+xml' || /\.svg$/i.test(file.name);
    const docId = `drive-${file.id}`;

    const existing = existingByDriveId.get(file.id) || existingByDriveId.get(docId);

    const fileDate = file.modifiedTime
      ? new Date(file.modifiedTime).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');

    const code = existing?.code || deriveTechnicalCode(file.name, category, subcategory, index);
    const highResThumbnail = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s2048') : undefined;
    const pdfPreviewUrl = `https://drive.google.com/file/d/${file.id}/preview`;

    let svgContent: string | undefined = existing?.svgContent;
    if (!isImage && !isPdf && !svgContent) {
      svgContent = createBlueprintPlaceholderSvg(
        file.name,
        code,
        category,
        subcategory,
        fileDate,
        file.mimeType,
        false
      );
    } else if (isPdf && !svgContent && !highResThumbnail) {
      svgContent = createBlueprintPlaceholderSvg(
        file.name,
        code,
        category,
        subcategory,
        fileDate,
        file.mimeType,
        true
      );
    }

    const folderPath = subcategory
      ? `${DRIVE_ROOT_FOLDER_NAME} / ${category} / ${subcategory}`
      : `${DRIVE_ROOT_FOLDER_NAME} / ${category}`;

    const tags: string[] = existing?.tags && existing.tags.length > 0 
      ? existing.tags 
      : [
          category,
          ...(subcategory ? [subcategory] : []),
          isPdf ? 'PDF' : isImage ? 'IMAGEM' : 'DESENHO',
          'Google Drive',
        ];

    return {
      id: existing ? existing.id : docId,
      driveFileId: file.id,
      driveWebViewLink: file.webViewLink,
      driveFolderId: folderId,
      driveSubfolderName: subcategory,
      driveFolderPath: folderPath,
      code,
      title: existing?.title || file.name.replace(/\.[^/.]+$/, ''),
      description:
        existing?.description ||
        file.description ||
        `Arquivo técnico (${isPdf ? 'PDF' : file.name.split('.').pop()?.toUpperCase()}) armazenado na pasta "${folderPath}" no Google Drive.`,
      category: category as DocumentCategory,
      subcategory,
      type: isImage ? 'photo' : 'drawing',
      discipline: existing?.discipline || (subcategory ? `${category} / ${subcategory}` : `Acervo Técnico - ${category}`),
      revision: existing?.revision || 'Rev. Drive',
      date: fileDate,
      author: existing?.author || 'Google Drive',
      approver: existing?.approver || 'Equipe de Engenharia',
      scale: existing?.scale || (isPdf ? 'Conforme Prancha PDF' : 'Indicada'),
      status: existing?.status || 'Aprovado',
      format: isPdf ? 'PDF Técnico' : isImage ? 'Hi-Res Raster' : isSvg ? 'SVG Vector HD' : 'DWG Render',
      fileSize: formatFileSize(file.size),
      resolution: isPdf ? 'Vetor / PDF HD' : 'HD Google Drive',
      isOfflineCached: true,
      equipmentCode: existing?.equipmentCode || `${getCategoryPrefix(category)}-${subcategory ? subcategory.slice(0, 3).toUpperCase() + '-' : ''}${String(index + 1).padStart(2, '0')}`,
      tags,
      specs: {
        ...(existing?.specs || {}),
        'Arquivo Original': file.name,
        'Formato': isPdf ? 'PDF (Portable Document Format)' : file.mimeType,
        'Categoria Principal': category,
        'Subcategoria': subcategory || '(Raiz da Categoria)',
        'Caminho Completo no Drive': folderPath,
        'ID Drive': file.id,
        'Sincronização': 'Automática via Google Drive',
      },
      notes: existing?.notes && existing.notes.length > 0
        ? existing.notes
        : [
            isPdf
              ? `Arquivo PDF sincronizado automaticamente da pasta "${folderPath}" no Google Drive.`
              : `Sincronizado automaticamente da pasta "${folderPath}" no Google Drive.`
          ],
      annotations: existing?.annotations || [],
      imageUrl: isImage ? (existing?.imageUrl || highResThumbnail) : highResThumbnail,
      thumbnailUrl: highResThumbnail,
      svgContent,
      isPdf,
      fileMimeType: file.mimeType || (isPdf ? 'application/pdf' : undefined),
      pdfPreviewUrl,
    };
  },

  /**
   * Saves the entire technical catalog JSON payload to Google Drive under 'techview_database.json'
   */
  async saveDatabaseToDrive(documents: TechnicalDocument[]): Promise<DriveFileInfo> {
    const folderId = await this.getOrCreateAppFolder();
    await this.syncCategorySubfolders();

    const payload: DriveDatabasePayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      source: 'TechView HD',
      documentsCount: documents.length,
      documents,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });

    // Check if techview_database.json already exists in the folder
    const searchRes = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `'${folderId}' in parents and name = '${DATABASE_FILENAME}' and trashed = false`
      )}&fields=files(id,name)`
    );
    const searchData = await searchRes.json();
    const existingFileId = searchData.files?.[0]?.id;

    if (existingFileId) {
      const updateRes = await this.fetchWithAuth(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: blob,
        }
      );
      return await updateRes.json();
    } else {
      const metadata = {
        name: DATABASE_FILENAME,
        mimeType: 'application/json',
        parents: [folderId],
        description: 'Banco de dados oficial do TechView HD com anotações e catálogo',
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      form.append('file', blob);

      const createRes = await this.fetchWithAuth(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
        {
          method: 'POST',
          body: form,
        }
      );
      return await createRes.json();
    }
  },

  /**
   * Loads techview_database.json from Google Drive folder
   */
  async loadDatabaseFromDrive(): Promise<DriveDatabasePayload | null> {
    const folderId = await this.getOrCreateAppFolder();

    const searchRes = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `'${folderId}' in parents and name = '${DATABASE_FILENAME}' and trashed = false`
      )}&fields=files(id,name,size,modifiedTime)&spaces=drive`
    );
    const searchData = await searchRes.json();
    if (!searchData.files || searchData.files.length === 0) {
      return null;
    }

    const fileId = searchData.files[0].id;
    const fileRes = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    );
    return await fileRes.json();
  },

  /**
   * Lists files directly inside the root folder
   */
  async listFilesInFolder(): Promise<DriveFileInfo[]> {
    const folderId = await this.getOrCreateAppFolder();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)&orderBy=modifiedTime desc`
    );
    const data = await res.json();
    return data.files || [];
  },

  /**
   * Uploads an individual technical drawing or photo directly to a specific category or subcategory in Drive
   */
  async uploadFileToCategory(
    category: string,
    fileName: string,
    fileBlob: Blob,
    mimeType: string,
    subcategoryName?: string,
    description?: string
  ): Promise<DriveFileInfo> {
    const subfolderMap = await this.syncCategorySubfolders();
    let folderId = subfolderMap[category] || (await this.getOrCreateAppFolder());

    // If subcategory is requested, find or create the subfolder inside category folder
    if (subcategoryName && subcategoryName.trim()) {
      const existingSubs = await this.listSubfolders(folderId);
      const match = existingSubs.find((s) => s.name.toLowerCase() === subcategoryName.trim().toLowerCase());
      if (match) {
        folderId = match.id;
      } else {
        const createSubRes = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: subcategoryName.trim(),
            mimeType: 'application/vnd.google-apps.folder',
            parents: [folderId],
            description: `Subcategoria ${subcategoryName} para ${category}`,
          }),
        });
        const createdSub = await createSubRes.json();
        folderId = createdSub.id;
      }
    }

    const metadata = {
      name: fileName,
      mimeType,
      description: description || `Arquivo técnico para ${category}${subcategoryName ? ` / ${subcategoryName}` : ''} - TechView HD`,
      parents: [folderId],
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', fileBlob);

    const res = await this.fetchWithAuth(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink',
      {
        method: 'POST',
        body: form,
      }
    );

    return await res.json();
  },

  /**
   * Searches for drawing files across the Google Drive Database (techview_database.json),
   * live Google Drive folders, and local drawings.
   */
  async searchDatabaseInDrive(
    query: string,
    existingDocs: TechnicalDocument[]
  ): Promise<TechnicalDocument[]> {
    const cleanQuery = (query || '').trim().toLowerCase();
    if (!cleanQuery) return existingDocs;

    const results: TechnicalDocument[] = [];
    const seenIds = new Set<string>();

    // 1. Direct Google Drive URL or File ID (e.g. https://drive.google.com/file/d/XYZ/view or id:XYZ)
    const driveLinkMatch = cleanQuery.match(/(?:\/d\/|id=|\bid:)([a-zA-Z0-9_-]{15,})/i);
    if (driveLinkMatch && driveLinkMatch[1]) {
      const fileId = driveLinkMatch[1];
      const directDoc: TechnicalDocument = {
        id: `drive-direct-${fileId}`,
        code: `DRV-${fileId.slice(0, 8).toUpperCase()}`,
        title: `Desenho Técnico do Drive (${fileId.slice(0, 8)})`,
        description: `Arquivo de desenho técnico importado diretamente do Google Drive.`,
        category: '07 - LAMINAÇÃO',
        subcategory: 'ROTOMEC',
        type: 'drawing',
        discipline: 'Mecânica / Desenho Técnico',
        revision: 'Rev. 01',
        date: new Date().toLocaleDateString('pt-BR'),
        author: 'Equipe de Manutenção',
        approver: 'Eng. Responsável',
        scale: '1:1',
        status: 'Aprovado',
        format: 'PDF Técnico',
        fileSize: 'Online',
        resolution: 'Alta Resolução Drive',
        isOfflineCached: true,
        equipmentCode: 'DRIVE-FILE',
        tags: ['Google Drive', 'Desenho Técnico', 'Importado'],
        specs: { 'Origem': 'Google Drive', 'ID do Arquivo': fileId },
        notes: ['Arquivo carregado diretamente do banco de dados do Google Drive.'],
        annotations: [],
        driveFileId: fileId,
        driveWebViewLink: `https://drive.google.com/file/d/${fileId}/view`,
        isPdf: true,
        fileMimeType: 'application/pdf',
      };
      return [directDoc];
    }

    // 2. Search local cached & sample documents
    for (const doc of existingDocs) {
      const matchCode = doc.code.toLowerCase().includes(cleanQuery);
      const matchTitle = doc.title.toLowerCase().includes(cleanQuery);
      const matchEquip = (doc.equipmentCode || '').toLowerCase().includes(cleanQuery);
      const matchCategory = doc.category.toLowerCase().includes(cleanQuery);
      const matchSub = (doc.subcategory || '').toLowerCase().includes(cleanQuery);
      const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
      const matchNotes = doc.notes?.some((n) => n.toLowerCase().includes(cleanQuery));

      if (matchCode || matchTitle || matchEquip || matchCategory || matchSub || matchTags || matchNotes) {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          results.push(doc);
        }
      }
    }

    // 3. Search Drive Database file (techview_database.json) if available
    try {
      const dbPayload = await this.loadDatabaseFromDrive();
      if (dbPayload && dbPayload.documents) {
        for (const doc of dbPayload.documents) {
          const matchCode = doc.code.toLowerCase().includes(cleanQuery);
          const matchTitle = doc.title.toLowerCase().includes(cleanQuery);
          const matchEquip = (doc.equipmentCode || '').toLowerCase().includes(cleanQuery);
          const matchCategory = doc.category.toLowerCase().includes(cleanQuery);
          const matchSub = (doc.subcategory || '').toLowerCase().includes(cleanQuery);
          const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
          if (matchCode || matchTitle || matchEquip || matchCategory || matchSub || matchTags) {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              results.push(doc);
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 4. Live Drive API file search if real token is available
    const token = await getAccessToken();
    if (token && token.startsWith('ya29.')) {
      try {
        const driveSearchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          `name contains '${cleanQuery}' and trashed = false`
        )}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink,parents)&pageSize=20`;
        const res = await this.fetchWithAuth(driveSearchUrl);
        const data = await res.json();
        if (data.files && Array.isArray(data.files)) {
          for (let i = 0; i < data.files.length; i++) {
            const f = data.files[i];
            const isPdf = f.mimeType === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
            const docId = `drive-${f.id}`;
            if (!seenIds.has(docId) && !seenIds.has(f.id)) {
              seenIds.add(docId);
              let inferredCat = '07 - LAMINAÇÃO';
              let inferredSub: string | undefined = undefined;
              const upperName = f.name.toUpperCase();
              if (upperName.includes('CORTE') || upperName.includes('KAMPF')) {
                inferredCat = '10 - CORTE';
                inferredSub = upperName.includes('II') ? 'KAMPF II' : 'KAMPF I';
              } else if (upperName.includes('EXTRUS') || upperName.includes('VAREX')) {
                inferredCat = '08 - EXTRUSÃO';
                inferredSub = upperName.includes('II') ? 'VAREX II' : 'VAREX I';
              } else if (upperName.includes('UTIL') || upperName.includes('SUBEST')) {
                inferredCat = '13 - UTILIDADES';
                inferredSub = 'SUBESTAÇÃO';
              } else if (upperName.includes('ROTOMEC')) {
                inferredCat = '07 - LAMINAÇÃO';
                inferredSub = 'ROTOMEC';
              }

              results.push({
                id: docId,
                code: deriveTechnicalCode(f.name, inferredCat, inferredSub, i),
                title: f.name.replace(/\.[^/.]+$/, ''),
                description: `Arquivo técnico recuperado do Google Drive: ${f.name}`,
                category: inferredCat,
                subcategory: inferredSub,
                type: isPdf ? 'drawing' : 'photo',
                discipline: 'Engenharia / Desenho Técnico',
                revision: 'Rev. 01',
                date: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
                author: 'Google Drive',
                approver: 'Manutenção Laminor',
                scale: '1:1',
                status: 'Aprovado',
                format: isPdf ? 'PDF Técnico' : 'Hi-Res Raster',
                fileSize: formatFileSize(f.size),
                resolution: 'Resolução Original Drive',
                isOfflineCached: false,
                equipmentCode: inferredSub || 'GERAL',
                tags: ['Google Drive', inferredCat, ...(inferredSub ? [inferredSub] : [])],
                specs: { 'Arquivo': f.name, 'Formato': f.mimeType || 'N/A' },
                notes: [`Arquivo indexado diretamente do banco de dados no Google Drive: ${f.name}`],
                annotations: [],
                driveFileId: f.id,
                driveWebViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
                isPdf,
                fileMimeType: f.mimeType,
                imageUrl: f.thumbnailLink || `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Busca ao vivo no Drive:', err);
      }
    }

    return results;
  },
};
