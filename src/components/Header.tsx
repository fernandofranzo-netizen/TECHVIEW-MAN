import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Menu, 
  Compass,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Database
} from 'lucide-react';
import { TechnicalDocument } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu: () => void;
  resultsCount: number;
  onOpenDriveSearch?: (query?: string) => void;
  // Optional legacy props kept for flexible component signature
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isOnline?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulatedOffline?: () => void;
  onCacheAll?: () => void;
  onOpenUploadModal?: () => void;
  onOpenDriveModal?: () => void;
  isDriveConnected?: boolean;
  driveUserEmail?: string | null;
  isAutoSyncing?: boolean;
  currentDocument?: TechnicalDocument | null;
  onExportCurrentPDF?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  resultsCount,
  onOpenDriveSearch,
  onOpenDriveModal,
  isDriveConnected = false,
  driveUserEmail,
  isAutoSyncing = false,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onOpenDriveSearch) {
        onOpenDriveSearch(searchQuery);
      }
    }
  };

  const displayEmail = driveUserEmail || 'manutencaolaminor@gmail.com';

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 px-4 flex items-center justify-between gap-3 z-30 shrink-0">
      {/* Left: Mobile Menu Toggle + App Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase font-mono-tech">
                TechView<span className="text-blue-600 dark:text-blue-400">·HD</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                CAD & FOTOS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none hidden sm:block">
              Consulta Técnica de Engenharia
            </p>
          </div>
        </div>
      </div>

      {/* Center: Integrated Quick Access Search Bar */}
      <div className="flex-1 max-w-2xl mx-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar por código (ex: DWG-104), título, equipamento (Rotomec, Kampf, Varex)..."
            className="w-full text-xs pl-9 pr-32 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-2xs font-sans"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {onOpenDriveSearch && (
              <button
                type="button"
                onClick={() => onOpenDriveSearch(searchQuery)}
                title="Buscar diretamente no banco de dados techview_database.json do Drive (Enter)"
                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                <Database className="w-2.5 h-2.5" />
                <span>Drive</span>
              </button>
            )}

            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono-tech text-zinc-400 bg-zinc-200/60 dark:bg-zinc-700 rounded border border-zinc-300/60 dark:border-zinc-600">
                ⌘K
              </kbd>
            )}

            {searchQuery && (
              <span className="text-[10px] text-zinc-400 font-mono-tech px-1 hidden sm:inline">
                {resultsCount} {resultsCount === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Permanent Account & Google Drive Status */}
      <div className="flex items-center gap-2">
        {onOpenDriveSearch && (
          <button
            onClick={() => onOpenDriveSearch(searchQuery)}
            title="Abrir pesquisa detalhada no banco de dados do Drive"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Banco do Drive</span>
          </button>
        )}
        {onOpenDriveModal && (
          <button
            onClick={onOpenDriveModal}
            title={isDriveConnected 
              ? `Conta permanentemente vinculada: ${displayEmail}` 
              : `Vincular permanentemente conta ${displayEmail}`
            }
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs ${
              isDriveConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Cloud className={`w-4 h-4 ${isDriveConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
              {isAutoSyncing && (
                <RefreshCw className="w-2.5 h-2.5 text-blue-500 absolute -top-1 -right-1 animate-spin" />
              )}
            </div>

            <div className="hidden md:flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] max-w-[140px] truncate font-semibold">
                  {displayEmail}
                </span>
                {isDriveConnected && (
                  <span title="Vínculo Permanente">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <span className="text-[9px] text-zinc-400">
                {isDriveConnected ? 'Conectada Permanentemente' : 'Clique para Vincular'}
              </span>
            </div>

            {isDriveConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
