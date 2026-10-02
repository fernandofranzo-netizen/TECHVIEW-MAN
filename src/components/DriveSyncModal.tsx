import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  FileCode, 
  X, 
  LogOut, 
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Database,
  Camera,
  FolderCheck,
  PlusCircle,
  UploadCloud,
  Check,
  Layers,
  ShieldCheck,
  Lock,
  Copy,
  Globe,
  Sparkles,
  Search
} from 'lucide-react';
import { getCategoryIcon } from './Sidebar';
import { TechnicalDocument, TECHNICAL_CATEGORIES, DocumentCategory, isUpperCaseCategory } from '../types';
import { 
  DriveSyncService, 
  DriveFileInfo, 
  DRIVE_ROOT_FOLDER_NAME,
  CategoryFolderStats
} from '../services/driveSync';
import { 
  googleSignIn, 
  googleSignOut, 
  subscribeAuth, 
  AuthState,
  DEFAULT_PERMANENT_EMAIL,
  activatePermanentSession
} from '../services/googleAuth';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  localDocuments: TechnicalDocument[];
  onRestoreDocuments: (docs: TechnicalDocument[]) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  categoryStats?: Record<string, CategoryFolderStats> | null;
  onSyncAllCategories?: () => Promise<void>;
  isAutoSyncing?: boolean;
  onOpenDriveSearch?: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  localDocuments,
  onRestoreDocuments,
  onNotify,
  categoryStats: initialCategoryStats,
  onSyncAllCategories,
  isAutoSyncing = false,
  onOpenDriveSearch,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isPermanentlyLinked: true,
    permanentEmail: DEFAULT_PERMANENT_EMAIL,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncingFolders, setIsSyncingFolders] = useState<boolean>(false);
  const [isSyncingCategories, setIsSyncingCategories] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryFolderStats> | null>(
    initialCategoryStats || null
  );
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<DocumentCategory>('07 - LAMINAÇÃO');
  const [selectedUploadSubcategory, setSelectedUploadSubcategory] = useState<string>('');
  const [isUploadingToCategory, setIsUploadingToCategory] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isVercelEnvironment = currentHostname.includes('vercel.app');

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('techview_last_drive_sync');
  });

  // Confirmation dialog state (mandatory for workspace mutations)
  const [confirmationAction, setConfirmationAction] = useState<{
    type: 'upload' | 'restore';
    title: string;
    description: string;
  } | null>(null);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = subscribeAuth((state) => {
      setAuthState(state);
      if (state.isAuthenticated) {
        loadDriveFiles();
      } else {
        setDriveFiles([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update categoryStats if prop changes
  useEffect(() => {
    if (initialCategoryStats) {
      setCategoryStats(initialCategoryStats);
    }
  }, [initialCategoryStats]);

  const loadDriveFiles = async () => {
    try {
      setIsLoading(true);
      const files = await DriveSyncService.listFilesInFolder();
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Erro ao listar arquivos do Drive:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await googleSignIn(DEFAULT_PERMANENT_EMAIL);
      onNotify(`Conta ${res.user.email || DEFAULT_PERMANENT_EMAIL} conectada com sucesso ao projeto!`, 'success');
      await loadDriveFiles();
      await handleSyncAllCategoriesAction();
    } catch {
      onNotify(`Conta permanente ${DEFAULT_PERMANENT_EMAIL} ativa!`, 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateDirectMode = () => {
    activatePermanentSession();
    setAuthError(null);
    onNotify(`Conexão permanente ativada diretamente para ${DEFAULT_PERMANENT_EMAIL}!`, 'success');
  };

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
      onNotify(`Domínio "${currentHostname}" copiado para a área de transferência!`, 'info');
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      onNotify('Sessão temporária desconectada. A conta manutencaolaminor@gmail.com permanece vinculada ao projeto.', 'info');
      setDriveFiles([]);
      setCategoryStats(null);
    } catch (err: any) {
      onNotify('Erro ao desconectar.', 'warning');
    }
  };

  // Perform upload of techview_database.json to Google Drive
  const executeUploadToDrive = async () => {
    setConfirmationAction(null);
    try {
      setIsSyncing(true);
      await DriveSyncService.saveDatabaseToDrive(localDocuments);
      const syncDate = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(syncDate);
      localStorage.setItem('techview_last_drive_sync', syncDate);
      onNotify(`Banco de dados com ${localDocuments.length} pranchas sincronizado no Google Drive!`, 'success');
      await loadDriveFiles();
    } catch (err: any) {
      console.error(err);
      onNotify(`Erro ao salvar no Drive: ${err.message}`, 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  // Perform restore from Google Drive techview_database.json
  const executeRestoreFromDrive = async () => {
    setConfirmationAction(null);
    try {
      setIsSyncing(true);
      const payload = await DriveSyncService.loadDatabaseFromDrive();
      if (!payload || !payload.documents || payload.documents.length === 0) {
        onNotify('Nenhum banco de dados prévio encontrado na pasta do Drive.', 'info');
        return;
      }
      onRestoreDocuments(payload.documents);
      const syncDate = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(syncDate);
      localStorage.setItem('techview_last_drive_sync', syncDate);
      onNotify(`Sucesso! ${payload.documents.length} documentos restaurados do Google Drive.`, 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      onNotify(`Erro ao restaurar do Drive: ${err.message}`, 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  // Synchronize all 13 Category Subfolders & Scan Files
  const handleSyncAllCategoriesAction = async () => {
    if (onSyncAllCategories) {
      setIsSyncingCategories(true);
      try {
        await onSyncAllCategories();
        const syncDate = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(syncDate);
      } finally {
        setIsSyncingCategories(false);
      }
      return;
    }

    try {
      setIsSyncingCategories(true);
      const result = await DriveSyncService.syncAllCategoriesWithDrive(localDocuments);
      onRestoreDocuments(result.documents);
      setCategoryStats(result.categoryStats);
      setLastSyncTime(result.updatedAt);
      localStorage.setItem('techview_last_drive_sync', result.updatedAt);
      onNotify(
        `Categorias sincronizadas! ${result.totalDriveFiles} arquivos indexados nas 13 pastas do Google Drive.`,
        'success'
      );
      await loadDriveFiles();
    } catch (err: any) {
      onNotify(`Falha ao sincronizar categorias: ${err.message}`, 'warning');
    } finally {
      setIsSyncingCategories(false);
    }
  };

  const handleSyncCategoryFolders = async () => {
    try {
      setIsSyncingFolders(true);
      await DriveSyncService.syncCategorySubfolders();
      onNotify(`As 13 pastas técnicas em ordem alfabética foram criadas/garantidas dentro de "${DRIVE_ROOT_FOLDER_NAME}"!`, 'success');
      await loadDriveFiles();
    } catch (err: any) {
      onNotify(`Falha ao sincronizar pastas no Drive: ${err.message}`, 'warning');
    } finally {
      setIsSyncingFolders(false);
    }
  };

  // Upload a file directly into a specific category subfolder in Drive
  const handleDirectCategoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingToCategory(true);
      onNotify(`Enviando ${file.name} para a pasta "${selectedUploadCategory}" no Google Drive...`, 'info');
      
      const uploadedFile = await DriveSyncService.uploadFileToCategory(
        selectedUploadCategory,
        file.name,
        file,
        file.type || 'application/octet-stream',
        selectedUploadSubcategory.trim() || undefined,
        `Arquivo técnico adicionado via TechView HD em ${new Date().toLocaleDateString('pt-BR')}`
      );

      const subMsg = selectedUploadSubcategory.trim() ? ` / ${selectedUploadSubcategory.trim()}` : '';
      onNotify(`Arquivo ${file.name} salvo com sucesso na pasta "${selectedUploadCategory}${subMsg}" no Drive!`, 'success');
      
      // Auto re-sync categories
      await handleSyncAllCategoriesAction();
    } catch (err: any) {
      onNotify(`Erro no upload para categoria: ${err.message}`, 'warning');
    } finally {
      setIsUploadingToCategory(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Sincronização com Google Drive</span>
                {authState.isAuthenticated && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Conectado
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500">
                Sincronize as categorias técnicas em letra maiúscula automaticamente com a pasta oficial.
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

        {/* Modal Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Auth Card */}
          {!authState.isAuthenticated ? (
            <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Lock className="w-3 h-3" />
                  <span>Vínculo Permanente ao Projeto</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Conectar Conta Oficial do Projeto
                </h4>
                <p className="text-xs font-mono-tech font-bold text-blue-600 dark:text-blue-400">
                  {DEFAULT_PERMANENT_EMAIL}
                </p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Esta conta Google está designada permanentemente para este projeto. Ao conectar, a sessão é preservada de forma contínua com sincronização automática a cada 30 segundos das categorias técnicas (<span className="font-semibold text-zinc-800 dark:text-zinc-200">"{DRIVE_ROOT_FOLDER_NAME}"</span>).
                </p>
              </div>

              {/* Single Official Connection Button */}
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoading ? 'Conectando...' : `Conectar Google Drive (${DEFAULT_PERMANENT_EMAIL})`}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Account Info Bar with Permanent Badge */}
              <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {authState.user?.photoURL ? (
                    <img
                      src={authState.user.photoURL}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-emerald-300 dark:border-emerald-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {authState.user?.email?.[0].toUpperCase() || 'M'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {authState.user?.displayName || 'Manutenção Laminor'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        Permanente
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-mono-tech font-semibold">
                      {authState.user?.email || DEFAULT_PERMANENT_EMAIL}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Conexão permanente preservada para o projeto
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Desconectar sessão temporária"
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1 text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Desconectar</span>
                </button>
              </div>

              {/* Connected Root Folder Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs flex items-start gap-2.5">
                <FolderCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-950 dark:text-blue-200">
                    Pasta Raiz no Drive: <span className="font-mono-tech font-bold">"{DRIVE_ROOT_FOLDER_NAME}"</span>
                  </div>
                  <div className="text-[11px] text-blue-800 dark:text-blue-300/80 mt-0.5">
                    Sincronização automática ativa • {localDocuments.length} itens catalogados
                    {lastSyncTime && ` • Última atualização: hoje às ${lastSyncTime}`}
                  </div>
                </div>
              </div>

              {/* Quick Drive Database Search Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-blue-950 dark:text-blue-100">
                      Banco de Dados no Drive (techview_database.json)
                    </h5>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300">
                      Pesquise desenhos por código (ex: DWG-104), máquina ou importe links de desenhos do Drive.
                    </p>
                  </div>
                </div>
                {onOpenDriveSearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDriveSearch();
                    }}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar no Banco</span>
                  </button>
                )}
              </div>

              {/* 13 Technical Categories Subfolders on Drive & File Counters */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Categorias no Google Drive</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Sincronização Automática
                      </span>
                    </span>
                  </div>
                  
                  {/* Quick Refresh Button */}
                  <button
                    onClick={handleSyncAllCategoriesAction}
                    disabled={isSyncingCategories || isAutoSyncing || isLoading}
                    className="text-xs px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingCategories || isAutoSyncing ? 'animate-spin text-blue-500' : ''}`} />
                    <span>{isSyncingCategories || isAutoSyncing ? 'Sincronizando...' : 'Verificar Agora'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 leading-snug">
                  Qualquer imagem, PDF ou desenho técnico inserido em uma destas pastas dentro de <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">"{DRIVE_ROOT_FOLDER_NAME}"</span> é sincronizado automaticamente e em segundo plano a cada 30 segundos:
                </p>

                {/* Subfolder list with live counters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {TECHNICAL_CATEGORIES.filter(isUpperCaseCategory).map((cat, idx) => {
                    const count = categoryStats?.[cat]?.filesCount ?? 
                      localDocuments.filter((d) => d.category === cat).length;
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/70 text-[11px] text-zinc-700 dark:text-zinc-300 truncate"
                        title={`${idx + 1}. ${cat} (${count} arquivos)`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-blue-500 shrink-0">
                            {getCategoryIcon(cat, "w-3.5 h-3.5")}
                          </span>
                          <span className="truncate font-medium">{cat}</span>
                        </div>
                        <span className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1 ${
                          count > 0 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' 
                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400">
                    Estrutura organizada em ordem alfabética na raiz
                  </span>
                  <button
                    onClick={handleSyncCategoryFolders}
                    disabled={isSyncingFolders || isLoading}
                    className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isSyncingFolders ? 'animate-spin' : ''}`} />
                    <span>Verificar / Criar Subpastas Ausentes</span>
                  </button>
                </div>
              </div>

              {/* Direct Upload into a Category Subfolder in Drive */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Enviar Arquivo Direto para uma Categoria no Drive
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Selecione a categoria técnica e envie uma prancha CAD, foto ou PDF para salvar na pasta respectiva do Google Drive:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <select
                    value={selectedUploadCategory}
                    onChange={(e) => setSelectedUploadCategory(e.target.value as DocumentCategory)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    {TECHNICAL_CATEGORIES.filter(isUpperCaseCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Subpasta (ex: Mecânica, Cilindros)"
                    value={selectedUploadSubcategory}
                    onChange={(e) => setSelectedUploadSubcategory(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:ring-1 focus:ring-blue-500 flex-1"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.svg,.dwg,.dxf"
                    onChange={handleDirectCategoryUpload}
                    className="hidden"
                    id="category-file-upload-input"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingToCategory}
                    className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{isUploadingToCategory ? 'Enviando...' : `Enviar`}</span>
                  </button>
                </div>
              </div>

              {/* Sync Actions Grid: Database Backup / Restore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload Action */}
                <button
                  onClick={() =>
                    setConfirmationAction({
                      type: 'upload',
                      title: 'Salvar Banco no Google Drive?',
                      description: `Esta ação enviará e atualizará o arquivo "techview_database.json" no Google Drive com todas as ${localDocuments.length} pranchas, anotações e especificações técnicas atuais.`,
                    })
                  }
                  disabled={isSyncing}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-blue-500 hover:shadow-xs transition text-left space-y-1 disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between">
                    <CloudUpload className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      Exportar
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Salvar Banco Completo (JSON)
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-snug">
                    Salva backup estruturado de anotações e metadados no Google Drive.
                  </p>
                </button>

                {/* Restore Action */}
                <button
                  onClick={() =>
                    setConfirmationAction({
                      type: 'restore',
                      title: 'Restaurar Banco a partir do Drive?',
                      description:
                        'Esta ação recuperará o banco de dados oficial salvo previamente no arquivo "techview_database.json" do Google Drive.',
                    })
                  }
                  disabled={isSyncing}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-emerald-500 hover:shadow-xs transition text-left space-y-1 disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between">
                    <CloudDownload className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Importar
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Restaurar do Banco JSON
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-snug">
                    Restaura as pranchas e anotações armazenadas no banco techview_database.json.
                  </p>
                </button>
              </div>

              {/* Files in Drive Folder List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Arquivos na Pasta Raiz do Drive ({driveFiles.length})
                  </span>
                  <button
                    onClick={loadDriveFiles}
                    disabled={isLoading}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Recarregar</span>
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <div className="text-center py-4 px-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                    Nenhum arquivo na raiz. O conteúdo principal fica distribuído nas 13 subpastas técnicas.
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/40 dark:bg-zinc-900/30">
                    {driveFiles.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isDatabase = file.name.endsWith('.json');
                      const isImage = file.mimeType.startsWith('image/');
                      const isPdf = file.mimeType.includes('pdf');

                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isFolder ? (
                              getCategoryIcon(file.name, "w-4 h-4 text-blue-500 shrink-0")
                            ) : isDatabase ? (
                              <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : isImage ? (
                              <Camera className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : isPdf ? (
                              <FileText className="w-4 h-4 text-red-500 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                            )}
                            <span className="truncate font-medium text-zinc-800 dark:text-zinc-200 font-mono-tech text-[11px]">
                              {file.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir no Google Drive"
                                className="text-zinc-400 hover:text-blue-600 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            <span>Acesso seguro via Google Drive OAuth restrito à pasta técnica</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {confirmationAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {confirmationAction.title}
              </h4>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {confirmationAction.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmationAction(null)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                Cancelar
              </button>

              <button
                onClick={
                  confirmationAction.type === 'upload'
                    ? executeUploadToDrive
                    : executeRestoreFromDrive
                }
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
