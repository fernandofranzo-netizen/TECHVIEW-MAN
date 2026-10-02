import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Layers, 
  HardDrive, 
  LayoutGrid,
  Square,
  Check
} from 'lucide-react';
import { TechnicalDocument, DocumentStatus } from '../types';

interface DocumentSelectorBarProps {
  documents: TechnicalDocument[];
  selectedDocumentId: string | null;
  onSelectDocument: (doc: TechnicalDocument) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const statusBadgeStyles: Record<DocumentStatus, string> = {
  'Aprovado': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'Para Execução': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  'Em Revisão': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  'As-Built': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
};

// Componente de renderização da miniatura da prancha
const SheetThumbnail: React.FC<{ doc: TechnicalDocument }> = ({ doc }) => {
  if (doc.svgContent) {
    return (
      <div className="relative w-full h-full bg-white dark:bg-zinc-950 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]">
        <div 
          className="w-full h-full p-1.5 flex items-center justify-center select-none pointer-events-none [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain"
          dangerouslySetInnerHTML={{ __html: doc.svgContent }}
        />
      </div>
    );
  }

  if (doc.thumbnailUrl || doc.imageUrl) {
    return (
      <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]">
        <img
          src={doc.thumbnailUrl || doc.imageUrl}
          alt={doc.title}
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center p-2 text-zinc-400">
      <FileText className="w-8 h-8 opacity-40 mb-1 text-blue-400" />
      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
        {doc.format || 'Folha CAD'}
      </span>
    </div>
  );
};

export const DocumentSelectorBar: React.FC<DocumentSelectorBarProps> = ({
  documents,
  selectedDocumentId,
  onSelectDocument,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [viewLayout, setViewLayout] = useState<'large' | 'grid'>('large');

  // Filtragem local rápida por busca
  const filteredList = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        localSearch.trim() === '' ||
        doc.code.toLowerCase().includes(localSearch.toLowerCase()) ||
        doc.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        doc.discipline?.toLowerCase().includes(localSearch.toLowerCase()) ||
        doc.equipmentCode?.toLowerCase().includes(localSearch.toLowerCase());

      return matchSearch;
    });
  }, [documents, localSearch]);

  // Se estiver recolhido, exibe barra vertical compacta
  if (isCollapsed) {
    return (
      <aside 
        className="w-12 h-full flex flex-col items-center py-4 bg-zinc-900 border-r border-zinc-800 shrink-0 transition-all select-none z-10"
        title="Expandir Catálogo de Pranchas"
      >
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors shadow-xs"
          title="Expandir Catálogo de Pranchas"
          aria-label="Expandir Catálogo de Pranchas"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <span 
            className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase [writing-mode:vertical-rl] rotate-180"
          >
            Miniaturas ({documents.length})
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-84 h-full flex flex-col bg-zinc-900 border-r border-zinc-800 shrink-0 transition-all duration-200 select-none z-10 overflow-hidden text-zinc-100">
      {/* Header do Catálogo com alternador de grade/miniatura grande */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold tracking-tight text-white truncate">
              Catálogo de Pranchas
            </h2>
            <p className="text-[10px] text-zinc-400 truncate">
              {filteredList.length} miniatura{filteredList.length !== 1 ? 's' : ''} disponível{filteredList.length !== 1 ? 'eis' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Botão Alternador de Modo de Visualização */}
          <div className="flex items-center bg-zinc-800 p-0.5 rounded-md border border-zinc-700/80">
            <button
              onClick={() => setViewLayout('large')}
              className={`p-1 rounded text-xs transition ${
                viewLayout === 'large'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Miniatura Grande (1 Coluna)"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1 rounded text-xs transition ${
                viewLayout === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Grade de Miniaturas (2 Colunas)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Recolher Catálogo"
            aria-label="Recolher Catálogo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Busca Rápida */}
      <div className="p-2.5 border-b border-zinc-800 bg-zinc-900/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filtrar por código, título..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700/80 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all font-sans"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Lista / Grade de Miniaturas das Pranchas */}
      <div className="flex-1 overflow-y-auto p-2.5 focus:outline-hidden">
        {filteredList.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-zinc-500">
            <FileText className="w-8 h-8 mb-2 stroke-1 opacity-50" />
            <p className="text-xs font-medium">Nenhuma miniatura encontrada</p>
            <p className="text-[10px] mt-0.5 text-zinc-500">Tente ajustar a busca ou filtros</p>
          </div>
        ) : (
          <div
            className={
              viewLayout === 'grid'
                ? 'grid grid-cols-2 gap-2'
                : 'flex flex-col gap-3'
            }
          >
            {filteredList.map((doc) => {
              const isSelected = doc.id === selectedDocumentId;
              return (
                <div
                  key={doc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectDocument(doc)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDocument(doc);
                    }
                  }}
                  className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col focus:outline-hidden ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/40 bg-zinc-800/90 shadow-md shadow-blue-500/10'
                      : 'border-zinc-800 bg-zinc-850 hover:border-zinc-700 hover:bg-zinc-800/80'
                  }`}
                >
                  {/* Container da Imagem em Miniatura */}
                  <div className="relative w-full aspect-[16/10] bg-zinc-950 overflow-hidden border-b border-zinc-800 flex items-center justify-center">
                    <SheetThumbnail doc={doc} />

                    {/* Badge Superior Esquerdo: Código e Revisão */}
                    <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 max-w-[80%]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-950/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold border border-white/10 shadow-xs truncate">
                        {doc.code}
                      </span>
                      <span className="px-1 py-0.5 rounded bg-blue-600/90 text-white text-[9px] font-mono font-bold shadow-xs shrink-0">
                        R{doc.revision}
                      </span>
                    </div>

                    {/* Badge Superior Direito: Status / Offline */}
                    <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
                      {doc.isOfflineCached && (
                        <span 
                          title="Salvo em Cache Offline" 
                          className="p-0.5 rounded bg-zinc-950/80 backdrop-blur-xs text-emerald-400 border border-emerald-500/30 shadow-xs"
                        >
                          <HardDrive className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {viewLayout === 'large' && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border backdrop-blur-xs leading-none shadow-xs ${
                            statusBadgeStyles[doc.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {doc.status}
                        </span>
                      )}
                    </div>

                    {/* Indicador de Seleção Ativa no Canto */}
                    {isSelected && (
                      <div className="absolute bottom-1.5 right-1.5 z-10 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Legenda Compacta da Miniatura */}
                  <div className="p-2 flex flex-col gap-0.5 bg-zinc-900/90">
                    <p className="text-[11px] font-medium text-zinc-200 line-clamp-1 group-hover:text-blue-400 transition-colors leading-snug">
                      {doc.title}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-zinc-400">
                      <span className="truncate">{doc.discipline || doc.category}</span>
                      <span className="font-mono text-zinc-400 shrink-0">{doc.scale || doc.format}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer com contagem */}
      <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/80 text-[10px] text-zinc-400 flex items-center justify-between">
        <span>Catálogo de Pranchas</span>
        <span className="font-medium text-zinc-300">
          {filteredList.length} folha{filteredList.length !== 1 ? 's' : ''}
        </span>
      </div>
    </aside>
  );
};
