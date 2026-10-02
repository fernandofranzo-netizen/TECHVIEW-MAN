import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Cloud, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Folder, 
  Layers,
  ArrowRight,
  Database,
  Link as LinkIcon
} from 'lucide-react';
import { TechnicalDocument, TECHNICAL_CATEGORIES } from '../types';
import { DriveSyncService, DRIVE_ROOT_FOLDER_NAME } from '../services/driveSync';

interface DriveDatabaseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: TechnicalDocument[];
  onSelectDocument: (doc: TechnicalDocument) => void;
  onRestoreDocuments: (docs: TechnicalDocument[]) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
  initialQuery?: string;
}

export const DriveDatabaseSearchModal: React.FC<DriveDatabaseSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDocument,
  onRestoreDocuments,
  onNotify,
  initialQuery = '',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<TechnicalDocument[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
      handlePerformSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handlePerformSearch = async (queryText: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await DriveSyncService.searchDatabaseInDrive(queryText, documents);
      setSearchResults(results);
    } catch (err: any) {
      console.warn('Erro ao pesquisar no banco do Drive:', err);
      // Fallback to local documents search
      const q = queryText.toLowerCase().trim();
      const filtered = documents.filter((d) => 
        d.code.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        (d.equipmentCode || '').toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.subcategory || '').toLowerCase().includes(q)
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePerformSearch(searchTerm);
    }
  };

  // Sync latest techview_database.json from Drive
  const handleSyncDatabaseFromDrive = async () => {
    setIsSyncingDb(true);
    try {
      const payload = await DriveSyncService.loadDatabaseFromDrive();
      if (payload && payload.documents && payload.documents.length > 0) {
        onRestoreDocuments(payload.documents);
        setSearchResults(payload.documents);
        onNotify(`Banco de dados do Drive atualizado! ${payload.documents.length} pranchas carregadas.`, 'success');
      } else {
        // Fallback: sync all folder categories
        const res = await DriveSyncService.syncAllCategoriesWithDrive(documents);
        onRestoreDocuments(res.documents);
        setSearchResults(res.documents);
        onNotify(`Pastas do Drive sincronizadas com ${res.totalDriveFiles} arquivos indexados.`, 'success');
      }
    } catch (err: any) {
      onNotify(`Banco de dados indexado: ${documents.length} pranchas disponíveis.`, 'info');
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Filtered by selected category chip
  const displayedResults = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return searchResults;
    }
    return searchResults.filter((doc) => doc.category === selectedCategory);
  }, [searchResults, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in-50 duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Buscar no Banco de Dados do Google Drive</span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  techview_database.json
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Pesquise por código do desenho (ex: DWG-104), máquina, ou cole um link direto do Drive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDatabaseFromDrive}
              disabled={isSyncingDb}
              title="Carregar banco techview_database.json mais recente do Drive"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin text-blue-500' : ''}`} />
              <span className="hidden sm:inline">Sincronizar Banco</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar + Controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800 space-y-3 shrink-0 bg-white dark:bg-zinc-900">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handlePerformSearch(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Digite o código (ex: DWG-ROT-104, EL-SUB), título, máquina (Rotomec, Kampf, Varex) ou link do Drive..."
              className="w-full pl-10 pr-24 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    handlePerformSearch('');
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handlePerformSearch(searchTerm)}
                disabled={isSearching}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                <span>Buscar</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'Todos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Todas as Categorias ({searchResults.length})
            </button>
            {TECHNICAL_CATEGORIES.map((cat) => {
              const count = searchResults.filter((d) => d.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-75 font-mono-tech font-bold">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-zinc-50/40 dark:bg-zinc-950/40">
          {displayedResults.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {hasSearched ? 'Nenhum desenho encontrado no banco para esta busca' : 'Digite para buscar desenhos no banco de dados'}
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Tente buscar pelo código do desenho (ex: <code className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">DWG</code>, <code className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">ROT</code>, <code className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">KMP</code>), nome da máquina ou cole a URL de um arquivo no Drive.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleSyncDatabaseFromDrive}
                  disabled={isSyncingDb}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Arquivo techview_database.json do Drive</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {displayedResults.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onSelectDocument(doc);
                    onNotify(`Desenho ${doc.code} aberto no visualizador CAD.`, 'success');
                    onClose();
                  }}
                  className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition cursor-pointer group flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-tech font-extrabold text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-500">
                          {doc.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {doc.category}
                        </span>
                        {doc.subcategory && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            {doc.subcategory}
                          </span>
                        )}
                        {doc.isPdf && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-600 text-white">
                            PDF
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                        {doc.title}
                      </h5>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1 flex-wrap">
                        <span>Equipamento: <strong className="text-zinc-700 dark:text-zinc-300">{doc.equipmentCode || 'Geral'}</strong></span>
                        <span>•</span>
                        <span>Revisão: <strong className="text-zinc-700 dark:text-zinc-300">{doc.revision}</strong></span>
                        <span>•</span>
                        <span>Data: {doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.driveWebViewLink && (
                      <a
                        href={doc.driveWebViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Ver no Google Drive"
                        className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-lg transition"
                    >
                      <span>Abrir no CAD</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Pasta oficial: <strong className="text-zinc-800 dark:text-zinc-200">"{DRIVE_ROOT_FOLDER_NAME}"</strong></span>
          </div>
          <div>
            Total de pranchas catalogadas: <strong className="text-zinc-900 dark:text-zinc-100">{documents.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
