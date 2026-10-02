import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  RotateCw,
  Compass,
  ExternalLink,
  Crosshair,
  FileText,
  MessageSquarePlus
} from 'lucide-react';
import { TechnicalDocument, ViewerTheme, Annotation } from '../types';

interface TechnicalViewerProps {
  document: TechnicalDocument | null;
  theme: ViewerTheme;
  onThemeChange: (theme: ViewerTheme) => void;
  onToggleOffline: (doc: TechnicalDocument) => void;
  onAddAnnotation: (docId: string, annotation: Omit<Annotation, 'id' | 'date'>) => void;
}

export const TechnicalViewer: React.FC<TechnicalViewerProps> = ({
  document,
  theme,
  onThemeChange,
  onToggleOffline,
  onAddAnnotation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Pan, Zoom and Rotation State
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // UI & Tool States
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCarimbo, setShowCarimbo] = useState<boolean>(true);
  const [showSpecsPanel, setShowSpecsPanel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<'pan' | 'measure' | 'annotate'>('pan');
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);

  // Measurement State
  const [measurePoints, setMeasurePoints] = useState<Array<{ x: number; y: number }>>([]);
  const [activeMeasurement, setActiveMeasurement] = useState<number | null>(null);

  // Annotation Modal / Popover State
  const [pendingAnnotationPoint, setPendingAnnotationPoint] = useState<{ x: number; y: number } | null>(null);
  const [annotationTitle, setAnnotationTitle] = useState('');
  const [annotationText, setAnnotationText] = useState('');
  // Reset zoom & pan when document changes
  useEffect(() => {
    resetView();
    setMeasurePoints([]);
    setActiveMeasurement(null);
  }, [document?.id]);

  // Reset View to fit
  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // Rotate clockwise by 90 degrees
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setScale((prevScale) => {
      const newScale = Math.min(Math.max(prevScale + delta, 0.25), 8);
      return Number(newScale.toFixed(2));
    });
  };

  const setZoomLevel = (newScale: number) => {
    setScale(Number(newScale.toFixed(2)));
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setScale((prevScale) => {
      const nextScale = Math.min(Math.max(prevScale * zoomFactor, 0.25), 8);
      const ratio = nextScale / prevScale;
      setPan((prevPan) => ({
        x: mouseX - (mouseX - prevPan.x) * ratio,
        y: mouseY - (mouseY - prevPan.y) * ratio,
      }));
      return Number(nextScale.toFixed(3));
    });
  };

  // Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only left click drags in pan mode or with spacebar
    if (e.button !== 0) return;

    if (activeTool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'measure') {
      handleMeasureClick(e);
    } else if (activeTool === 'annotate') {
      handleAnnotateClick(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.round((e.clientX - rect.left - pan.x) / scale);
    const relY = Math.round((e.clientY - rect.top - pan.y) / scale);
    setCursorCoords({ x: relX, y: relY });

    if (isDragging && activeTool === 'pan') {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Measurement tool logic
  const handleMeasureClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / scale;
    const clickY = (e.clientY - rect.top - pan.y) / scale;

    if (measurePoints.length === 0 || measurePoints.length === 2) {
      setMeasurePoints([{ x: clickX, y: clickY }]);
      setActiveMeasurement(null);
    } else if (measurePoints.length === 1) {
      const p1 = measurePoints[0];
      const p2 = { x: clickX, y: clickY };
      const distPixels = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      // Rough scale conversion based on typical 1:10 or 1:50 sheet representation
      const distMm = Math.round(distPixels * 1.8);
      setMeasurePoints([p1, p2]);
      setActiveMeasurement(distMm);
    }
  };

  // Annotation tool click
  const handleAnnotateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current || !containerRef.current) return;
    const contentRect = contentRef.current.getBoundingClientRect();
    const xPct = Math.min(Math.max(((e.clientX - contentRect.left) / contentRect.width) * 100, 0), 100);
    const yPct = Math.min(Math.max(((e.clientY - contentRect.top) / contentRect.height) * 100, 0), 100);

    setPendingAnnotationPoint({ x: Math.round(xPct), y: Math.round(yPct) });
  };

  const submitAnnotation = () => {
    if (!document || !pendingAnnotationPoint || !annotationTitle.trim()) return;
    onAddAnnotation(document.id, {
      x: pendingAnnotationPoint.x,
      y: pendingAnnotationPoint.y,
      title: annotationTitle,
      text: annotationText,
      author: 'Inspetor Atual',
      type: 'nota'
    });
    setPendingAnnotationPoint(null);
    setAnnotationTitle('');
    setAnnotationText('');
    setActiveTool('pan');
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (documentRefExitFullscreen()) {
        documentRefExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const documentRefExitFullscreen = () => {
    if (window.document.exitFullscreen) {
      window.document.exitFullscreen();
      return true;
    }
    return false;
  };

  if (!document) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500">
        <Compass className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Nenhuma prancha selecionada</h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm text-center">
          Selecione um desenho técnico ou foto de inspeção no catálogo lateral para visualização em alta resolução.
        </p>
      </div>
    );
  }

  // Theme background class
  const getThemeContainerClass = () => {
    if (theme === 'blueprint') return 'bg-[#0a192f] text-blue-100 cad-grid-blueprint';
    if (theme === 'dark') return 'bg-zinc-950 text-zinc-100 cad-grid-dark';
    return 'bg-white text-zinc-900 cad-grid-light';
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex-1 h-full flex flex-col select-none overflow-hidden transition-colors duration-200 ${getThemeContainerClass()}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Main Drawing Canvas / High Resolution Viewport */}
      <div 
        className={`w-full h-full flex items-center justify-center transition-all ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative max-w-none max-h-none shadow-2xl rounded-sm border border-zinc-300/40 dark:border-zinc-700/60 bg-white"
        >
          {/* Drawing Content */}
          {document.isPdf && !document.svgContent && document.driveFileId ? (
            <div className="w-[1100px] h-[720px] bg-zinc-900 rounded-sm overflow-hidden flex flex-col pointer-events-auto">
              <div className="bg-zinc-800 text-white px-3 py-1.5 flex items-center justify-between text-xs border-b border-zinc-700">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.2 rounded bg-red-600 font-bold text-[9px]">PDF</span>
                  <span className="font-medium truncate">{document.title}</span>
                  {document.subcategory && (
                    <span className="text-[10px] text-zinc-400 bg-zinc-700/60 px-1.5 py-0.2 rounded">
                      {document.subcategory}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {document.driveWebViewLink && (
                    <a
                      href={document.driveWebViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-300 hover:text-white flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir no Google Drive</span>
                    </a>
                  )}
                </div>
              </div>
              <iframe
                src={`https://drive.google.com/file/d/${document.driveFileId}/preview`}
                className="w-full flex-1 border-0 bg-white"
                title={document.title}
                allow="autoplay"
              />
            </div>
          ) : document.svgContent ? (
            <div 
              className="w-[1100px] h-[720px] max-w-none pointer-events-none"
              dangerouslySetInnerHTML={{ __html: document.svgContent }}
            />
          ) : (
            <img
              src={document.imageUrl}
              alt={document.title}
              className="w-[1100px] h-[720px] object-contain pointer-events-none"
            />
          )}

          {/* Measurement Overlay Line */}
          {measurePoints.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              {measurePoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
              ))}
              {measurePoints.length === 2 && (
                <>
                  <line
                    x1={measurePoints[0].x}
                    y1={measurePoints[0].y}
                    x2={measurePoints[1].x}
                    y2={measurePoints[1].y}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="6,4"
                  />
                  {activeMeasurement !== null && (
                    <g transform={`translate(${(measurePoints[0].x + measurePoints[1].x) / 2}, ${(measurePoints[0].y + measurePoints[1].y) / 2 - 12})`}>
                      <rect x="-50" y="-12" width="100" height="22" fill="#0f172a" rx="4" opacity="0.9" />
                      <text x="0" y="3" fill="#f8fafc" fontSize="11" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="bold">
                        {activeMeasurement} mm
                      </text>
                    </g>
                  )}
                </>
              )}
            </svg>
          )}

          {/* Annotation Interactive Pins */}
          {document.annotations.map((ann, idx) => (
            <div
              key={ann.id}
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-red-500 animate-ping opacity-75" />
                <div className="w-6 h-6 rounded-full bg-red-600 text-white font-mono-tech text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white">
                  {idx + 1}
                </div>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 w-56 p-2.5 bg-zinc-900 text-white text-xs rounded-lg shadow-xl border border-zinc-700 pointer-events-none">
                <div className="font-semibold text-red-400 font-mono-tech flex items-center justify-between">
                  <span>{ann.title}</span>
                  <span className="text-[10px] text-zinc-400">#{idx + 1}</span>
                </div>
                <p className="mt-1 text-zinc-300 text-[11px] leading-relaxed">{ann.text}</p>
                <div className="mt-1.5 pt-1 border-t border-zinc-800 text-[9px] text-zinc-400 flex justify-between">
                  <span>{ann.author}</span>
                  <span>{ann.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Left: Zoom HUD & Coordinates */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 pointer-events-none">
        {/* Zoom Controls */}
        <div className="pointer-events-auto flex items-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-200/80 dark:border-zinc-800 shadow-md p-1">
          <button
            title="Diminuir Zoom"
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono-tech text-xs font-semibold px-2.5 min-w-[54px] text-center text-zinc-800 dark:text-zinc-200">
            {Math.round(scale * 100)}%
          </span>

          <button
            title="Aumentar Zoom"
            onClick={() => handleZoom(0.25)}
            className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Zoom Presets */}
          <button
            title="Ajustar à Tela (Fit)"
            onClick={resetView}
            className="px-2 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
          >
            Ajustar
          </button>

          <button
            title="Zoom Real 100% (1:1)"
            onClick={() => setZoomLevel(1)}
            className={`px-2 py-1 text-[11px] font-medium rounded transition ${
              scale === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            1:1
          </button>

          <button
            title="Zoom 200%"
            onClick={() => setZoomLevel(2)}
            className={`px-2 py-1 text-[11px] font-medium rounded transition ${
              scale === 2 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            200%
          </button>

          <button
            title={rotation === 0 ? 'Rotacionar Desenho 90°' : `Girar 90° (Atual: ${rotation}°)`}
            onClick={handleRotate}
            className={`p-1.5 rounded-md transition flex items-center gap-1 cursor-pointer ${
              rotation !== 0
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            {rotation !== 0 && (
              <span className="text-[10px] font-mono-tech font-bold leading-none">{rotation}°</span>
            )}
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Fullscreen Toggle */}
          <button
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Real-Time Cursor Coordinates */}
        {cursorCoords && (
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/85 backdrop-blur-md text-zinc-300 font-mono-tech text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-700/60 shadow-md">
            <Crosshair className="w-3 h-3 text-blue-400" />
            <span>X: {cursorCoords.x} mm</span>
            <span className="text-zinc-600">|</span>
            <span>Y: {cursorCoords.y} mm</span>
          </div>
        )}
      </div>

      {/* Right Drawer / Specifications & Notes Panel */}
      {showSpecsPanel && (
        <div className="absolute top-16 right-4 bottom-4 w-84 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Ficha Técnica & Memorial</h4>
            </div>
            <button
              onClick={() => setShowSpecsPanel(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Title & Identification */}
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Identificação</span>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">{document.title}</p>
              <p className="text-zinc-500 mt-1 leading-relaxed">{document.description}</p>
            </div>

            {/* Technical Specs Table */}
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Parâmetros de Engenharia</span>
              <div className="mt-1.5 space-y-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 font-mono-tech">
                {Object.entries(document.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-2 text-[11px]">
                    <span className="text-zinc-500">{key}:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* General Notes */}
            {document.notes && document.notes.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">Notas de Projeto & Normas</span>
                <ul className="mt-1.5 space-y-1.5 list-disc list-inside text-zinc-600 dark:text-zinc-300">
                  {document.notes.map((note, i) => (
                    <li key={i} className="leading-normal">{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Field Annotations List */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  Anotações de Campo ({document.annotations.length})
                </span>
                <button
                  onClick={() => setActiveTool('annotate')}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium"
                >
                  + Nova Nota
                </button>
              </div>

              <div className="mt-1.5 space-y-2">
                {document.annotations.length === 0 ? (
                  <p className="text-zinc-400 italic">Nenhum apontamento adicionado.</p>
                ) : (
                  document.annotations.map((ann, i) => (
                    <div key={ann.id} className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                        <span>#{i + 1} {ann.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono-tech">{ann.date}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">{ann.text}</p>
                      <div className="mt-1 text-[10px] text-zinc-400">Por: {ann.author}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Annotation Modal / Popover */}
      {pendingAnnotationPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-blue-600" />
              Adicionar Ponto de Inspeção
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Coordenadas marcadas na prancha: {pendingAnnotationPoint.x}%, {pendingAnnotationPoint.y}%
            </p>

            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Título do Apontamento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Folga excessiva no rolamento"
                  value={annotationTitle}
                  onChange={(e) => setAnnotationTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Observações Técnicas / Recomendação
                </label>
                <textarea
                  placeholder="Descreva os detalhes da verificação ou medida encontrada..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingAnnotationPoint(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={submitAnnotation}
                disabled={!annotationTitle.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
              >
                Salvar Apontamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
