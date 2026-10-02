import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  TechnicalDocument, 
  FilterState, 
  ViewerTheme, 
  DocumentCategory, 
  Annotation,
  TECHNICAL_CATEGORIES,
  isNumberedCategory,
  isUpperCaseCategory
} from './types';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { OfflineStorageService } from './services/offlineStorage';
import { exportDocumentToPDF } from './services/pdfExport';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DocumentSelectorBar } from './components/DocumentSelectorBar';
import { TechnicalViewer } from './components/TechnicalViewer';
import { NewDocumentModal } from './components/NewDocumentModal';
import { DriveSyncModal } from './components/DriveSyncModal';
import { DriveDatabaseSearchModal } from './components/DriveDatabaseSearchModal';
import { subscribeAuth, AuthState } from './services/googleAuth';
import { DriveSyncService, CategoryFolderStats } from './services/driveSync';
import { CheckCircle2, AlertTriangle, HardDrive, WifiOff } from 'lucide-react';

export default function App() {
  // Theme & Layout State (Default to Dark Theme)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('techview_theme');
    if (saved === 'light') return false;
    return true; // Default to dark mode
  });
  const [viewerTheme, setViewerTheme] = useState<ViewerTheme>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSelectorCollapsed, setIsSelectorCollapsed] = useState<boolean>(false);

  // Google Drive & Auth State
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isDriveSearchModalOpen, setIsDriveSearchModalOpen] = useState<boolean>(false);
  const [driveSearchInitialQuery, setDriveSearchInitialQuery] = useState<string>('');
  const [driveAuthState, setDriveAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isPermanentlyLinked: true,
    permanentEmail: 'manutencaolaminor@gmail.com',
  });
  const [isAutoSyncingDrive, setIsAutoSyncingDrive] = useState<boolean>(false);
  const [lastDriveSyncTime, setLastDriveSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('techview_last_drive_sync');
  });
  const [categoryDriveStats, setCategoryDriveStats] = useState<Record<DocumentCategory, CategoryFolderStats> | null>(null);

  // Network & Offline Mode State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Documents & Storage State
  const [documents, setDocuments] = useState<TechnicalDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Subscribe to Google Drive auth changes
  useEffect(() => {
    const unsubscribe = subscribeAuth((state) => {
      setDriveAuthState(state);
    });
    return () => unsubscribe();
  }, []);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'TODOS',
    type: 'all',
    status: 'all',
    onlyOffline: false,
    sortBy: 'code',
    sortOrder: 'asc',
  });

  // Dark mode effect on document html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('techview_theme', 'dark');
      // Sync default CAD viewer theme in dark mode if not explicitly set
      if (viewerTheme === 'white') setViewerTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('techview_theme', 'light');
      if (viewerTheme === 'dark') setViewerTheme('white');
    }
  }, [isDarkMode]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conexão restabelecida. Operando online.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo offline ativado. Dados carregados do cache local.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Documents from IndexedDB or seed with Samples
  useEffect(() => {
    async function loadStoredDocuments() {
      const categoryMigrationMap: Record<string, { parent: DocumentCategory; sub: string }> = {
        'Mecânica': { parent: '07 - LAMINAÇÃO', sub: 'ROTOMEC' },
        'Rotomec': { parent: '07 - LAMINAÇÃO', sub: 'ROTOMEC' },
        'ROTOMEC': { parent: '07 - LAMINAÇÃO', sub: 'ROTOMEC' },
        'Elétrica': { parent: '13 - UTILIDADES', sub: 'SUBESTAÇÃO' },
        'Subestação': { parent: '13 - UTILIDADES', sub: 'SUBESTAÇÃO' },
        'SUBESTAÇÃO': { parent: '13 - UTILIDADES', sub: 'SUBESTAÇÃO' },
        'Kampf I': { parent: '10 - CORTE', sub: 'KAMPF I' },
        'KAMPF I': { parent: '10 - CORTE', sub: 'KAMPF I' },
        'Kampf II': { parent: '10 - CORTE', sub: 'KAMPF II' },
        'KAMPF II': { parent: '10 - CORTE', sub: 'KAMPF II' },
        'Varex I': { parent: '08 - EXTRUSÃO', sub: 'VAREX I' },
        'VAREX I': { parent: '08 - EXTRUSÃO', sub: 'VAREX I' },
        'Varex II': { parent: '08 - EXTRUSÃO', sub: 'VAREX II' },
        'VAREX II': { parent: '08 - EXTRUSÃO', sub: 'VAREX II' },
        'Automação': { parent: '08 - EXTRUSÃO', sub: 'VAREX II' },
        'Inspeção em Campo': { parent: '10 - CORTE', sub: 'KAMPF I' },
      };

      try {
        const storedDocs = await OfflineStorageService.getOfflineDocuments();
        if (storedDocs && storedDocs.length > 0) {
          // Migrate old categories to new numbered industrial categories
          const migratedDocs = storedDocs
            .map((doc) => {
              if (categoryMigrationMap[doc.category]) {
                const mapInfo = categoryMigrationMap[doc.category];
                const updatedDoc = {
                  ...doc,
                  category: mapInfo.parent,
                  subcategory: doc.subcategory || mapInfo.sub,
                };
                OfflineStorageService.saveDocument(updatedDoc);
                return updatedDoc;
              }
              return doc;
            })
            .filter((doc) => isNumberedCategory(doc.category));

          // Merge with sample documents to ensure any new sample documents are present
          const existingIds = new Set(migratedDocs.map((d) => d.id));
          const missingSamples = SAMPLE_DOCUMENTS.filter(
            (s) => !existingIds.has(s.id) && isNumberedCategory(s.category)
          );
          const combined = [...migratedDocs, ...missingSamples];
          setDocuments(combined);
          setSelectedDocumentId(combined[0]?.id || null);
        } else {
          // First time seed (strictly numbered categories)
          const initialSamples = SAMPLE_DOCUMENTS.filter((d) => isNumberedCategory(d.category));
          setDocuments(initialSamples);
          setSelectedDocumentId(initialSamples[0]?.id || null);
          for (const doc of initialSamples) {
            await OfflineStorageService.saveDocument(doc);
          }
        }
      } catch (err) {
        console.warn('Fallback to in-memory sample documents:', err);
        const fallbackSamples = SAMPLE_DOCUMENTS.filter((d) => isNumberedCategory(d.category));
        setDocuments(fallbackSamples);
        setSelectedDocumentId(fallbackSamples[0]?.id || null);
      }
    }

    loadStoredDocuments();
  }, []);

  // Helper to show transient toast feedback
  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter & Search computation
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 0. Ensure only uppercase categories are accepted
      if (!isUpperCaseCategory(doc.category)) {
        return false;
      }

      // 1. Simulated or actual offline filter
      if (filters.onlyOffline && !doc.isOfflineCached) {
        return false;
      }

      // If simulated offline is active, also prefer cached items
      if (isSimulatedOffline && !doc.isOfflineCached) {
        return false;
      }

      // 2. Category filter (supports both 'Todos' and 'TODOS')
      if (filters.category !== 'Todos' && filters.category !== 'TODOS' && doc.category !== filters.category) {
        return false;
      }

      // 2.1 Subcategory filter
      if (filters.subcategory && filters.subcategory !== 'all' && doc.subcategory !== filters.subcategory) {
        return false;
      }

      // 3. Type filter
      if (filters.type !== 'all' && doc.type !== filters.type) {
        return false;
      }

      // 4. Status filter
      if (filters.status !== 'all' && doc.status !== filters.status) {
        return false;
      }

      // 5. Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchCode = doc.code.toLowerCase().includes(query);
        const matchTitle = doc.title.toLowerCase().includes(query);
        const matchEquip = doc.equipmentCode.toLowerCase().includes(query);
        const matchDiscipline = doc.discipline.toLowerCase().includes(query);
        const matchAuthor = doc.author.toLowerCase().includes(query);
        const matchTags = doc.tags.some((t) => t.toLowerCase().includes(query));
        const matchNotes = doc.notes.some((n) => n.toLowerCase().includes(query));

        if (!matchCode && !matchTitle && !matchEquip && !matchDiscipline && !matchAuthor && !matchTags && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [documents, filters, isSimulatedOffline]);

  // Keep selected document synced
  const currentDocument = useMemo(() => {
    return documents.find((d) => d.id === selectedDocumentId && isUpperCaseCategory(d.category)) || filteredDocuments[0] || null;
  }, [documents, selectedDocumentId, filteredDocuments]);

  // Category counts and subcategories hierarchy (strictly uppercase categories only)
  const categoryHierarchyList = useMemo(() => {
    // Group documents by category and subcategory
    const catMap = new Map<string, { total: number; subcategories: Map<string, number> }>();

    // Seed default uppercase categories
    TECHNICAL_CATEGORIES.forEach((cat) => {
      if (isUpperCaseCategory(cat)) {
        catMap.set(cat, { total: 0, subcategories: new Map() });
      }
    });

    // Populate from all documents (strictly uppercase categories)
    documents.forEach((d) => {
      if (!isUpperCaseCategory(d.category)) return;
      if (!catMap.has(d.category)) {
        catMap.set(d.category, { total: 0, subcategories: new Map() });
      }
      const entry = catMap.get(d.category)!;
      entry.total++;
      if (d.subcategory) {
        entry.subcategories.set(d.subcategory, (entry.subcategories.get(d.subcategory) || 0) + 1);
      }
    });

    // Also merge from categoryDriveStats if available (strictly uppercase categories only)
    if (categoryDriveStats) {
      Object.entries(categoryDriveStats).forEach(([catName, stats]) => {
        if (!isUpperCaseCategory(catName)) return;
        if (!catMap.has(catName)) {
          catMap.set(catName, { total: stats.filesCount, subcategories: new Map() });
        }
        const entry = catMap.get(catName)!;
        stats.subcategories.forEach((sub) => {
          if (!entry.subcategories.has(sub.name)) {
            entry.subcategories.set(sub.name, sub.filesCount);
          }
        });
      });
    }

    const uppercaseDocCount = documents.filter((d) => isUpperCaseCategory(d.category)).length;
    const items: Array<{ name: string; count: number; subcategories?: Array<{ name: string; count: number; category: string }> }> = [
      { name: 'TODOS', count: uppercaseDocCount }
    ];

    const sortedCatNames = Array.from(catMap.keys())
      .filter((catName) => isUpperCaseCategory(catName))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    for (const catName of sortedCatNames) {
      const data = catMap.get(catName)!;
      const subs: Array<{ name: string; count: number; category: string }> = [];
      data.subcategories.forEach((subCount, subName) => {
        subs.push({
          name: subName,
          count: subCount,
          category: catName,
        });
      });
      subs.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      items.push({
        name: catName,
        count: data.total,
        subcategories: subs,
      });
    }

    return items;
  }, [documents, categoryDriveStats]);

  const cachedCount = useMemo(() => {
    return documents.filter((d) => d.isOfflineCached).length;
  }, [documents]);

  // Handlers
  const handleToggleOffline = async (doc: TechnicalDocument) => {
    const isNowCached = !doc.isOfflineCached;
    const updated = { ...doc, isOfflineCached: isNowCached };

    if (isNowCached) {
      await OfflineStorageService.saveDocument(updated);
      showToast(`Prancha ${doc.code} salva com sucesso para consulta offline!`, 'success');
    } else {
      await OfflineStorageService.removeDocument(doc.id);
      showToast(`Prancha ${doc.code} removida do cache local.`, 'info');
    }

    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
  };

  const handleCacheAll = async () => {
    let count = 0;
    const updatedDocs = [...documents];

    for (let i = 0; i < updatedDocs.length; i++) {
      if (!updatedDocs[i].isOfflineCached) {
        updatedDocs[i] = { ...updatedDocs[i], isOfflineCached: true };
        await OfflineStorageService.saveDocument(updatedDocs[i]);
        count++;
      }
    }

    setDocuments(updatedDocs);
    showToast(`Todas as ${updatedDocs.length} pranchas e fotos estão disponíveis offline!`, 'success');
  };

  const handleAddAnnotation = async (docId: string, annotationData: Omit<Annotation, 'id' | 'date'>) => {
    const newAnnotation: Annotation = {
      ...annotationData,
      id: `ann-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const targetDoc = documents.find((d) => d.id === docId);
    if (!targetDoc) return;

    const updatedDoc: TechnicalDocument = {
      ...targetDoc,
      annotations: [...targetDoc.annotations, newAnnotation],
    };

    await OfflineStorageService.saveDocument(updatedDoc);
    setDocuments((prev) => prev.map((d) => (d.id === docId ? updatedDoc : d)));
    showToast('Anotação técnica adicionada à prancha!', 'success');
  };

  const handleAddNewDocument = async (newDoc: TechnicalDocument) => {
    await OfflineStorageService.saveDocument(newDoc);
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocumentId(newDoc.id);
    showToast(`Prancha ${newDoc.code} cadastrada com sucesso!`, 'success');
  };

  const handleRestoreFromDrive = async (restoredDocs: TechnicalDocument[]) => {
    setDocuments(restoredDocs);
    if (restoredDocs.length > 0) {
      setSelectedDocumentId(restoredDocs[0].id);
      for (const doc of restoredDocs) {
        await OfflineStorageService.saveDocument(doc);
      }
    }
  };

  const documentsRef = useRef(documents);
  documentsRef.current = documents;

  // Automatic Drive Category Sync Handler (100% Background & Automatic)
  const handleSyncDriveCategories = useCallback(async (silent = false) => {
    if (!driveAuthState.isAuthenticated || !driveAuthState.accessToken) {
      if (!silent) {
        setIsDriveModalOpen(true);
        showToast('Conecte sua conta do Google Drive para sincronizar as pastas automaticamente.', 'info');
      }
      return;
    }

    try {
      setIsAutoSyncingDrive(true);
      const result = await DriveSyncService.syncAllCategoriesWithDrive(documentsRef.current);

      // Cache newly indexed files in IndexedDB for immediate offline consultation
      for (const doc of result.documents) {
        await OfflineStorageService.saveDocument(doc);
      }

      setDocuments(result.documents);
      setCategoryDriveStats(result.categoryStats);
      setLastDriveSyncTime(result.updatedAt);
      localStorage.setItem('techview_last_drive_sync', result.updatedAt);

      if (!silent) {
        showToast(
          `Sincronização concluída! ${result.totalDriveFiles} arquivos indexados nas categorias do Google Drive.`,
          'success'
        );
      } else if (result.newFilesCount > 0) {
        showToast(
          `${result.newFilesCount} novo(s) documento(s) sincronizado(s) automaticamente do Google Drive!`,
          'success'
        );
      }
    } catch (error: any) {
      console.warn('Erro ao sincronizar categorias do Drive:', error);
      if (!silent) {
        showToast(`Falha na sincronização do Google Drive: ${error.message || error}`, 'warning');
      }
    } finally {
      setIsAutoSyncingDrive(false);
    }
  }, [driveAuthState.isAuthenticated, driveAuthState.accessToken]);

  // Auto-sync whenever user logs in or auth credentials become valid
  useEffect(() => {
    if (driveAuthState.isAuthenticated && driveAuthState.accessToken) {
      handleSyncDriveCategories(true);
    }
  }, [driveAuthState.isAuthenticated, driveAuthState.accessToken, handleSyncDriveCategories]);

  // Background sync on window focus (e.g. user returns from Drive tab)
  useEffect(() => {
    const handleFocus = () => {
      if (driveAuthState.isAuthenticated && driveAuthState.accessToken && !isAutoSyncingDrive) {
        handleSyncDriveCategories(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [driveAuthState.isAuthenticated, driveAuthState.accessToken, isAutoSyncingDrive, handleSyncDriveCategories]);

  // Periodic automatic sync every 30 seconds
  useEffect(() => {
    if (!driveAuthState.isAuthenticated) return;
    const interval = setInterval(() => {
      handleSyncDriveCategories(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [driveAuthState.isAuthenticated, handleSyncDriveCategories]);

  const handleExportCurrentPDF = async () => {
    if (!currentDocument) return;
    try {
      showToast(`Gerando PDF de engenharia para ${currentDocument.code}...`, 'info');
      await exportDocumentToPDF(currentDocument, {
        format: 'a3',
        orientation: 'landscape',
        includeCarimbo: true,
        includeNotes: true,
        theme: viewerTheme,
      });
      showToast(`Download de ${currentDocument.code}.pdf concluído!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF.', 'warning');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-blue-500/20">
      {/* 1. Top Header with Integrated Search */}
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        onOpenDriveSearch={(q) => {
          setDriveSearchInitialQuery(q ?? filters.searchQuery ?? '');
          setIsDriveSearchModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={() => {
          const nextState = !isSimulatedOffline;
          setIsSimulatedOffline(nextState);
          showToast(
            nextState 
              ? 'Simulação de Modo Offline ATIVADA (exibindo apenas conteúdo salvo no dispositivo).' 
              : 'Simulação desativada. Modo Online restabelecido.',
            nextState ? 'warning' : 'info'
          );
        }}
        onCacheAll={handleCacheAll}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        isDriveConnected={driveAuthState.isAuthenticated}
        driveUserEmail={driveAuthState.user?.email || driveAuthState.permanentEmail || 'manutencaolaminor@gmail.com'}
        isAutoSyncing={isAutoSyncingDrive}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        currentDocument={currentDocument}
        onExportCurrentPDF={handleExportCurrentPDF}
        resultsCount={filteredDocuments.length}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Navigation Menu with Categories & Filters */}
        <Sidebar
          categories={categoryHierarchyList}
          filters={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          onResetFilters={() =>
            setFilters({
              searchQuery: '',
              category: 'TODOS',
              subcategory: 'all',
              type: 'all',
              status: 'all',
              onlyOffline: false,
              sortBy: 'code',
              sortOrder: 'asc',
            })
          }
          cachedCount={cachedCount}
          totalCount={documents.length}
          isOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenDriveModal={() => setIsDriveModalOpen(true)}
          onOpenDriveSearch={() => {
            setDriveSearchInitialQuery(filters.searchQuery || '');
            setIsDriveSearchModalOpen(true);
          }}
          isDriveConnected={driveAuthState.isAuthenticated}
          driveUserEmail={driveAuthState.user?.email || driveAuthState.permanentEmail || 'manutencaolaminor@gmail.com'}
          isAutoSyncing={isAutoSyncingDrive}
          onTriggerSync={() => handleSyncDriveCategories(false)}
          lastSyncTime={lastDriveSyncTime}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        {/* Compact Document Selector List (Adjacent to Sidebar) */}
        <DocumentSelectorBar
          documents={filteredDocuments}
          selectedDocumentId={currentDocument?.id || null}
          onSelectDocument={(doc) => setSelectedDocumentId(doc.id)}
          isCollapsed={isSelectorCollapsed}
          onToggleCollapse={() => setIsSelectorCollapsed(!isSelectorCollapsed)}
        />

        {/* Central, Right and Bottom: Large High-Resolution Preview Area */}
        <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
          <TechnicalViewer
            document={currentDocument}
            theme={viewerTheme}
            onThemeChange={setViewerTheme}
            onToggleOffline={handleToggleOffline}
            onAddAnnotation={handleAddAnnotation}
          />
        </main>
      </div>

      {/* Floating Offline Warning Banner if Simulated Offline or Disconnected */}
      {(!isOnline || isSimulatedOffline) && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 text-white font-semibold text-xs shadow-xl border border-amber-400/80 backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Modo de Campo Offline Ativo — Visualizando documentos armazenados localmente</span>
        </div>
      )}

      {/* Non-intrusive Toast Notifications */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl bg-zinc-900 text-white border border-zinc-700 text-xs animate-in slide-in-from-top-2 duration-150">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {toastMessage.type === 'info' && <HardDrive className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modal to Upload / Add Custom Technical Document */}
      <NewDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddDocument={handleAddNewDocument}
      />

      {/* Modal to Manage Database in Google Drive */}
      <DriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        localDocuments={documents}
        onRestoreDocuments={handleRestoreFromDrive}
        onNotify={showToast}
        categoryStats={categoryDriveStats}
        onSyncAllCategories={() => handleSyncDriveCategories(false)}
        isAutoSyncing={isAutoSyncingDrive}
        onOpenDriveSearch={() => {
          setDriveSearchInitialQuery(filters.searchQuery || '');
          setIsDriveSearchModalOpen(true);
        }}
      />

      {/* Modal to Search Drawings in Google Drive Database */}
      <DriveDatabaseSearchModal
        isOpen={isDriveSearchModalOpen}
        onClose={() => setIsDriveSearchModalOpen(false)}
        documents={documents}
        initialQuery={driveSearchInitialQuery}
        onSelectDocument={(doc) => {
          setSelectedDocumentId(doc.id);
          if (!documents.some((d) => d.id === doc.id)) {
            setDocuments((prev) => [doc, ...prev]);
          }
        }}
        onRestoreDocuments={handleRestoreFromDrive}
        onNotify={showToast}
      />
    </div>
  );
}
