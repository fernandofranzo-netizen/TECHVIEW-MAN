import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Camera, 
  Check, 
  Plus, 
  AlertCircle 
} from 'lucide-react';
import { TechnicalDocument, DocumentCategory, DocumentStatus, DocumentType, TECHNICAL_CATEGORIES, isUpperCaseCategory } from '../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (newDoc: TechnicalDocument) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(TECHNICAL_CATEGORIES[0]);
  const [type, setType] = useState<DocumentType>('drawing');
  const [discipline, setDiscipline] = useState('Mecânica Geral');
  const [revision, setRevision] = useState('Rev. 00');
  const [scale, setScale] = useState('1:10');
  const [status, setStatus] = useState<DocumentStatus>('Aprovado');
  const [equipmentCode, setEquipmentCode] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileSvgContent, setFileSvgContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('0 KB');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);
    setFileSizeStr(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    // Suggest default code from filename
    if (!code) {
      const cleanName = file.name.split('.')[0].toUpperCase().replace(/\s+/g, '-');
      setCode(`DWG-${cleanName.slice(0, 10)}`);
    }

    if (!title) {
      setTitle(file.name.split('.')[0]);
    }

    const reader = new FileReader();

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileSvgContent(content);
        setFileDataUrl('');
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setFileDataUrl(url);
        setFileSvgContent('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      setErrorMsg('Preencha ao menos o Código e o Título do documento.');
      return;
    }

    if (!fileSvgContent && !fileDataUrl) {
      setErrorMsg('Selecione um arquivo de desenho técnico ou foto (SVG, PNG, JPG).');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const notes = notesInput
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    const newDocument: TechnicalDocument = {
      id: `doc-usr-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || 'Documento técnico cadastrado pelo usuário.',
      category,
      type,
      discipline,
      revision: revision.trim() || 'Rev. 00',
      date: new Date().toLocaleDateString('pt-BR'),
      author: 'Engenheiro / Usuário Atual',
      approver: 'Gerência Técnica',
      scale: scale.trim() || 'S/E',
      status,
      format: fileSvgContent ? 'SVG Vector HD' : 'Hi-Res Raster',
      fileSize: fileSizeStr,
      resolution: fileSvgContent ? 'Vetor Infinito (300+ DPI)' : 'Alta Resolução',
      isOfflineCached: true,
      equipmentCode: equipmentCode.trim() || 'GERAL-01',
      tags: tags.length ? tags : ['Usuário', category],
      specs: {
        'Origem': 'Upload Local',
        'Arquivo': fileName,
        'Data de Registro': new Date().toLocaleDateString('pt-BR'),
      },
      notes: notes.length ? notes : ['Documento importado para consulta e zoom.'],
      annotations: [],
      svgContent: fileSvgContent || undefined,
      imageUrl: fileDataUrl || undefined,
    };

    onAddDocument(newDocument);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Cadastrar Nova Prancha ou Foto Técnica
              </h3>
              <p className="text-xs text-zinc-500">
                Importe arquivos para visualização com zoom HD e disponibilidade offline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File Upload Drop Area */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Arquivo da Prancha / Foto (SVG, PNG, JPG) *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition ${
                fileName
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-500 bg-zinc-50 dark:bg-zinc-800/40'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
              {fileName ? (
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Arquivo selecionado: {fileName} ({fileSizeStr})
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Clique para trocar de arquivo</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Clique para selecionar um desenho SVG ou foto de alta resolução
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Suporta arquivos vetoriais para zoom infinito e fotos técnicas de inspeção
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Identification Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Código da Prancha / Documento *
              </label>
              <input
                type="text"
                placeholder="Ex: DWG-MEC-205"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs font-mono-tech uppercase px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tag / Código do Equipamento
              </label>
              <input
                type="text"
                placeholder="Ex: RED-01, TR-02, BOMBA-101"
                value={equipmentCode}
                onChange={(e) => setEquipmentCode(e.target.value)}
                className="w-full text-xs font-mono-tech uppercase px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Título Técnico da Prancha *
            </label>
            <input
              type="text"
              placeholder="Ex: Conjunto do Mancal de Apoio e Sistema de Selagem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {TECHNICAL_CATEGORIES.filter(isUpperCaseCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="drawing">Desenho Técnico CAD</option>
                <option value="photo">Foto Técnica de Inspeção</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Aprovado">Aprovado</option>
                <option value="Para Execução">Para Execução</option>
                <option value="Em Revisão">Em Revisão</option>
                <option value="As-Built">As-Built</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Revisão
              </label>
              <input
                type="text"
                placeholder="Rev. 01"
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Escala
              </label>
              <input
                type="text"
                placeholder="1:10, 1:50, S/E"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tags / Palavras-chave (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="Mancal, Rolamento, Vedação, Laminação"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notas Gerais de Projeto (uma por linha)
            </label>
            <textarea
              placeholder="Ex: Dimensões em milímetros. Ajustar calços conforme norma ISO."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              rows={2}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Salvar e Visualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
