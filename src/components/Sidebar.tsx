import React, { useState, useEffect } from 'react';
import { 
  Building2,
  Package,
  Settings2,
  Cog,
  Wrench,
  GitFork,
  Camera,
  LayoutGrid,
  X, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Factory, 
  Flame, 
  Wind, 
  Snowflake, 
  Boxes, 
  Archive, 
  Trees, 
  Sliders, 
  Printer, 
  Zap, 
  RefreshCw, 
  Cloud, 
  CloudCheck, 
  CornerDownRight, 
  FileText,
  Sun,
  Moon,
  HardDrive,
  ShieldCheck,
  Search
} from 'lucide-react';
import { 
  DocumentCategory, 
  FilterState, 
  SubcategoryItem 
} from '../types';

export interface CategoryWithSubcategories {
  name: DocumentCategory | 'Todos';
  count: number;
  subcategories?: SubcategoryItem[];
}

interface SidebarProps {
  categories: CategoryWithSubcategories[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  cachedCount: number;
  totalCount: number;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenDriveModal?: () => void;
  onOpenDriveSearch?: () => void;
  isDriveConnected?: boolean;
  driveUserEmail?: string | null;
  isAutoSyncing?: boolean;
  onTriggerSync?: () => void;
  lastSyncTime?: string | null;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function getCategoryIcon(name: string, className = "w-4 h-4"): React.ReactNode {
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  if (norm === 'todos' || norm === 'all' || norm === '') return <Layers className={className} />;
  if (norm.includes('administra')) return <Building2 className={className} />;
  if (norm.includes('almoxarif')) return <Archive className={className} />;
  if (norm.includes('extern')) return <Trees className={className} />;
  if (norm.includes('agua gelada') || norm.includes('chiller') || norm.includes('cag')) return <Snowflake className={className} />;
  if (norm.includes('ar comprimido') || norm.includes('pneumat')) return <Wind className={className} />;
  if (norm.includes('estoque')) return <Boxes className={className} />;
  if (norm.includes('kampf i') && !norm.includes('kampf ii')) return <Sliders className={className} />;
  if (norm.includes('kampf ii') || norm.includes('kampf 2')) return <Settings2 className={className} />;
  if (norm.includes('rotomec')) return <Printer className={className} />;
  if (norm.includes('incendio') || norm.includes('combate') || norm.includes('sci')) return <Flame className={className} />;
  if (norm.includes('subestacao') || norm.includes('eletric') || norm.includes('painel')) return <Zap className={className} />;
  if (norm.includes('varex i') && !norm.includes('varex ii')) return <Factory className={className} />;
  if (norm.includes('varex ii') || norm.includes('varex 2')) return <Cog className={className} />;
  
  // Generic industrial matches
  if (norm.includes('mecanic') || norm.includes('usinagem')) return <Wrench className={className} />;
  if (norm.includes('civil') || norm.includes('predial') || norm.includes('estrutura')) return <Building2 className={className} />;
  if (norm.includes('tubul') || norm.includes('p&id') || norm.includes('valvula')) return <GitFork className={className} />;
  if (norm.includes('foto') || norm.includes('imagem') || norm.includes('campo')) return <Camera className={className} />;
  if (norm.includes('desenho') || norm.includes('prancha') || norm.includes('document')) return <FileText className={className} />;

  return <LayoutGrid className={className} />;
}

export function getSubcategoryIcon(subName: string, categoryName: string, className = "w-3.5 h-3.5"): React.ReactNode {
  const normSub = subName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (normSub.includes('eletric') || normSub.includes('painel') || normSub.includes('subestacao')) return <Zap className={className} />;
  if (normSub.includes('mecanic') || normSub.includes('redutor') || normSub.includes('eixo') || normSub.includes('peca')) return <Wrench className={className} />;
  if (normSub.includes('foto') || normSub.includes('imagem') || normSub.includes('vistoria')) return <Camera className={className} />;
  if (normSub.includes('tubul') || normSub.includes('p&id') || normSub.includes('valvula')) return <GitFork className={className} />;
  if (normSub.includes('civil') || normSub.includes('layout') || normSub.includes('predial')) return <Building2 className={className} />;
  if (normSub.includes('dwg') || normSub.includes('prancha') || normSub.includes('pdf')) return <FileText className={className} />;

  // Default to parent category's dedicated icon
  return getCategoryIcon(categoryName, className);
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  cachedCount,
  totalCount,
  isOpen,
  onCloseMobile,
  onOpenDriveModal,
  onOpenDriveSearch,
  isDriveConnected,
  driveUserEmail,
  isAutoSyncing,
  onTriggerSync,
  lastSyncTime,
  isDarkMode,
  onToggleDarkMode,
}) => {
  // State to track which categories are expanded in the menu
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Auto-expand active category
  useEffect(() => {
    if (filters.category && filters.category !== 'Todos' && filters.category !== 'TODOS') {
      setExpandedCategories((prev) => ({
        ...prev,
        [filters.category]: true,
      }));
    }
  }, [filters.category]);

  const toggleCategoryExpand = (catName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const hasActiveFilters = 
    (filters.category !== 'Todos' && filters.category !== 'TODOS') ||
    (filters.subcategory && filters.subcategory !== 'all') ||
    filters.searchQuery.trim().length > 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header of Sidebar */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Navegação & Filtros
            </h2>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Limpar
            </button>
          )}

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Categories and Filters Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* 1. Categorias Principais e Subcategorias Sincronizadas com o Drive */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Categorias do Acervo
                </span>
                {isDriveConnected && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isAutoSyncing ? 'animate-ping' : ''}`} />
                    Auto-Sync Ativo
                  </span>
                )}
              </div>

              {!isDriveConnected && (
                <button
                  onClick={onOpenDriveModal}
                  title="Conectar Google Drive para ativar sincronização automática"
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Cloud className="w-3 h-3" />
                  <span>Conectar</span>
                </button>
              )}
            </div>

            {/* Folder connection & Automatic Sync banner */}
            <div className="px-2 mb-2.5">
              {!isDriveConnected ? (
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <Cloud className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    <span>Conta Permanente do Projeto</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 leading-tight">
                    Conta vinculada: <span className="font-mono-tech font-semibold text-zinc-700 dark:text-zinc-300">{driveUserEmail || 'manutencaolaminor@gmail.com'}</span>. Clique para ativar a sincronização permanente.
                  </p>
                  <button
                    onClick={onOpenDriveModal}
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Cloud className="w-3 h-3" />
                    <span>Conectar Permanentemente</span>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={onOpenDriveModal}
                  title="Sincronização 100% automática ativa para a conta permanente. Clique para detalhes."
                  className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between text-[11px] cursor-pointer hover:bg-emerald-500/15 transition group"
                >
                  <div className="truncate flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoSyncing ? 'block' : 'hidden'}`} />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <div className="truncate flex flex-col">
                      <span className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight flex items-center gap-1">
                        <span>Auto-Sync Ativo</span>
                        <span title="Vínculo Permanente">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </span>
                        {isAutoSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-500 inline" />}
                      </span>
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-mono-tech truncate">
                        {driveUserEmail || 'manutencaolaminor@gmail.com'}
                      </span>
                      <span className="text-[9px] text-zinc-400 truncate">
                        {isAutoSyncing ? 'Sincronizando pranchas do Drive...' : (lastSyncTime ? `Atualizado: ${lastSyncTime}` : 'Conexão permanente ativa')}
                      </span>
                    </div>
                  </div>
                  <CloudCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1 group-hover:scale-110 transition-transform" />
                </div>
              )}

              {onOpenDriveSearch && (
                <button
                  type="button"
                  onClick={onOpenDriveSearch}
                  className="w-full mt-2 py-1.5 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Search className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Buscar no Banco do Drive</span>
                </button>
              )}
            </div>

            {/* Active Subcategory Chip if filtering by subcategory */}
            {filters.subcategory && filters.subcategory !== 'all' && (
              <div className="mx-2 mb-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between text-xs animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 truncate">
                  <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="truncate">
                    <div className="text-[9px] uppercase font-bold text-blue-500">Subcategoria Ativa</div>
                    <div className="text-[11px] font-bold truncate">{filters.subcategory}</div>
                  </div>
                </div>
                <button
                  onClick={() => onFilterChange({ subcategory: 'all' })}
                  title="Ver todos os itens desta categoria"
                  className="p-1 text-blue-600 dark:text-blue-300 hover:bg-blue-200/60 dark:hover:bg-blue-900 rounded-md transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Categories & Subcategories Tree List */}
            <nav className="space-y-1">
              {categories.map((cat) => {
                const isAll = cat.name === 'Todos' || cat.name === 'TODOS';
                const isCategoryActive = (isAll && (filters.category === 'Todos' || filters.category === 'TODOS')) || filters.category === cat.name;
                const hasSubcategories = !!cat.subcategories && cat.subcategories.length > 0;
                const isExpanded = expandedCategories[cat.name] ?? isCategoryActive;

                return (
                  <div key={cat.name} className="space-y-0.5">
                    {/* Main Category Row */}
                    <div
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition group ${
                        isCategoryActive && (!filters.subcategory || filters.subcategory === 'all')
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onFilterChange({ category: cat.name, subcategory: 'all' });
                          if (!isExpanded && hasSubcategories) {
                            toggleCategoryExpand(cat.name);
                          }
                          onCloseMobile();
                        }}
                        className="flex-1 flex items-center gap-2.5 truncate text-left cursor-pointer"
                      >
                        <span className={isCategoryActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}>
                          {getCategoryIcon(cat.name)}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </button>

                      {hasSubcategories && (
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {/* Chevron expand/collapse button if has subcategories */}
                          <button
                            type="button"
                            onClick={(e) => toggleCategoryExpand(cat.name, e)}
                            title={isExpanded ? 'Recolher subcategorias' : `Ver ${cat.subcategories!.length} subcategorias`}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Subcategories (Subpastas do Drive) */}
                    {hasSubcategories && isExpanded && (
                      <div className="pl-5 pr-1 py-1 space-y-1 border-l-2 border-zinc-200 dark:border-zinc-800 ml-3.5 animate-in slide-in-from-top-1 duration-150">
                        {/* Option: All files in this category */}
                        <button
                          onClick={() => {
                            onFilterChange({ category: cat.name, subcategory: 'all' });
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] transition text-left cursor-pointer ${
                            isCategoryActive && (!filters.subcategory || filters.subcategory === 'all')
                              ? 'bg-blue-100/70 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-semibold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">Todos da pasta</span>
                          </div>
                        </button>

                        {/* Subfolder rows */}
                        {cat.subcategories!.map((sub) => {
                          const isSubActive = isCategoryActive && filters.subcategory === sub.name;
                          return (
                            <button
                              key={sub.name}
                              onClick={() => {
                                onFilterChange({ category: cat.name, subcategory: sub.name });
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] transition text-left cursor-pointer ${
                                isSubActive
                                  ? 'bg-blue-500 text-white font-semibold shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {getSubcategoryIcon(sub.name, cat.name, `w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`)}
                                <span className="truncate">{sub.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>Acervo Técnico Laminor</span>
            <span className="font-mono-tech">({totalCount})</span>
          </div>
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Noturno'}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Alternar tema escuro/claro"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
