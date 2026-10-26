import React, { useState, useEffect, useMemo } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  HardDrive, 
  Lock, 
  FolderSync, 
  Cpu, 
  Wrench, 
  Save, 
  Check, 
  Info,
  KeyRound,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Copy,
  CheckCircle2,
  X,
  ShieldAlert,
  Database,
  Sliders,
  RotateCcw,
  Loader2,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

type SettingsTab = 'storage' | 'interface' | 'integrations' | 'maintenance';

interface ConfigState {
  // Storage paths
  openArchivePath: string;
  secretArchivePath: string;
  inboxPath: string;
  // Security
  hideCountsOnDismount: boolean;
  autoDismountMinutes: string;
  // Interface
  startupScreen: string;
  restoreLastSession: boolean;
  journalDefaultView: 'table' | 'list';
  tableDensity: 'compact' | 'normal' | 'spacious';
  splitLayout: 'left-original' | 'right-original';
  // Integrations
  obsidianPath: string;
  obsidianAutoSync: boolean;
  ocrEngine: string;
  llmProvider: string;
  ollamaEndpoint: string;
}

const DEFAULT_CONFIG: ConfigState = {
  openArchivePath: 'C:\\PersonalVault\\Open\\',
  secretArchivePath: 'V:\\Encrypted_Vault_2026\\',
  inboxPath: 'D:\\Inbox\\Scans_Automated\\',
  hideCountsOnDismount: true,
  autoDismountMinutes: '15',
  startupScreen: 'SCR-01',
  restoreLastSession: true,
  journalDefaultView: 'table',
  tableDensity: 'normal',
  splitLayout: 'left-original',
  obsidianPath: 'D:\\Obsidian\\Main_Brain\\Archive_Passports\\',
  obsidianAutoSync: true,
  ocrEngine: 'tesseract-v5',
  llmProvider: 'local-qwen',
  ollamaEndpoint: 'http://127.0.0.1:11434',
};

export const SettingsView: React.FC = () => {
  const { isVeraCryptMounted, toggleVeraCrypt, setCurrentScreen, showToast } = useVault();

  // Active sub-section tab
  const [activeTab, setActiveTab] = useState<SettingsTab>('storage');

  // Form state & saved reference state for dirty checking
  const [savedConfig, setSavedConfig] = useState<ConfigState>(() => {
    try {
      const stored = localStorage.getItem('personalvault_config_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const [config, setConfig] = useState<ConfigState>(savedConfig);

  // Field-level error messages
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Operational states for testing and feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Connection testing states
  const [storageCheckStatus, setStorageCheckStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [storageCheckMsg, setStorageCheckMsg] = useState<string>('');

  const [secretCheckStatus, setSecretCheckStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [secretCheckMsg, setSecretCheckMsg] = useState<string>('');

  const [obsidianStatus, setObsidianStatus] = useState<'active' | 'checking' | 'error'>('active');
  const [obsidianMsg, setObsidianMsg] = useState<string>('Папка хранилища Obsidian настроена и валидна');

  const [aiCheckStatus, setAiCheckStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [aiCheckMsg, setAiCheckMsg] = useState<string>('');

  const [sqliteDiagStatus, setSqliteDiagStatus] = useState<'idle' | 'checking' | 'success'>('idle');
  const [sqliteDiagMsg, setSqliteDiagMsg] = useState<string>('');

  // Modals
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const [showMovePathModal, setShowMovePathModal] = useState(false);
  const [newVaultPathCandidate, setNewVaultPathCandidate] = useState('D:\\EncryptedDrives\\PV_Vault_Main\\');
  const [confirmMoveCheckbox, setConfirmMoveCheckbox] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const [showZeroLeakWarningModal, setShowZeroLeakWarningModal] = useState(false);

  const [showVeraCryptMountModal, setShowVeraCryptMountModal] = useState(false);
  const [mountPassword, setMountPassword] = useState('');
  const [mountPim, setMountPim] = useState('');
  const [isMountingLoading, setIsMountingLoading] = useState(false);

  const [showVaultDetailsModal, setShowVaultDetailsModal] = useState(false);
  const [showDev01Modal, setShowDev01Modal] = useState(false);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    return (
      config.openArchivePath !== savedConfig.openArchivePath ||
      config.secretArchivePath !== savedConfig.secretArchivePath ||
      config.inboxPath !== savedConfig.inboxPath ||
      config.hideCountsOnDismount !== savedConfig.hideCountsOnDismount ||
      config.autoDismountMinutes !== savedConfig.autoDismountMinutes ||
      config.startupScreen !== savedConfig.startupScreen ||
      config.restoreLastSession !== savedConfig.restoreLastSession ||
      config.journalDefaultView !== savedConfig.journalDefaultView ||
      config.tableDensity !== savedConfig.tableDensity ||
      config.splitLayout !== savedConfig.splitLayout ||
      config.obsidianPath !== savedConfig.obsidianPath ||
      config.obsidianAutoSync !== savedConfig.obsidianAutoSync ||
      config.ocrEngine !== savedConfig.ocrEngine ||
      config.llmProvider !== savedConfig.llmProvider ||
      config.ollamaEndpoint !== savedConfig.ollamaEndpoint
    );
  }, [config, savedConfig]);

  // Window beforeunload warning when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Validate a specific path value
  const validateSinglePath = (key: string, value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Путь не может быть пустым. Укажите абсолютный путь.';
    }
    // Check for invalid path characters
    if (/[*?"<>|]/.test(trimmed)) {
      return 'Путь содержит недопустимые спецсимволы (* ? " < > |).';
    }
    // Known error mock cases
    const lower = trimmed.toLowerCase();
    if (lower.includes('nonexistent') || lower.includes('invalid') || lower.includes('notfound') || lower.includes('error')) {
      return 'Каталог не найден или нет доступа к папке: проверьте путь и права на запись (Read/Write).';
    }
    if (lower.startsWith('z:') || lower.startsWith('x:')) {
      return 'Сетевой или не подключенный диск недоступен. Проверьте подключение носителя.';
    }
    return null;
  };

  // Run full validation
  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};

    const openErr = validateSinglePath('openArchivePath', config.openArchivePath);
    if (openErr) errors.openArchivePath = openErr;

    const secretErr = validateSinglePath('secretArchivePath', config.secretArchivePath);
    if (secretErr) errors.secretArchivePath = secretErr;

    const inboxErr = validateSinglePath('inboxPath', config.inboxPath);
    if (inboxErr) errors.inboxPath = inboxErr;

    const obsidianErr = validateSinglePath('obsidianPath', config.obsidianPath);
    if (obsidianErr) errors.obsidianPath = obsidianErr;

    if (!config.ollamaEndpoint.trim().startsWith('http')) {
      errors.ollamaEndpoint = 'Укажите корректный URL эндпоинта (например, http://127.0.0.1:11434).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle field change with live re-validation
  const updateField = <K extends keyof ConfigState>(key: K, value: ConfigState[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaveBanner(null);

    // Live validation for path fields
    if (typeof value === 'string' && (key.includes('Path') || key === 'ollamaEndpoint')) {
      const err = key === 'ollamaEndpoint'
        ? (!value.trim().startsWith('http') ? 'Укажите корректный URL (http://...)' : null)
        : validateSinglePath(key, value);
      
      setValidationErrors(prev => {
        const next = { ...prev };
        if (err) next[key] = err;
        else delete next[key];
        return next;
      });
    }
  };

  // Save changes
  const handleSave = () => {
    setSaveBanner(null);
    const isValid = validateAll();
    if (!isValid) {
      setSaveBanner({
        type: 'error',
        message: 'Невозможно сохранить параметры: обнаружены ошибки валидации путей. Исправьте поля, выделенные красным.'
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedConfig(config);
      try {
        localStorage.setItem('personalvault_config_v2', JSON.stringify(config));
      } catch {
        // ignore
      }
      setSaveBanner({
        type: 'success',
        message: 'Параметры успешно сохранены в config.json и синхронизированы с ядром PersonalVault 2.0.'
      });
      showToast('Настройки конфигурации сохранены в config.json', 'check_circle');
    }, 650);
  };

  // Revert unsaved edits
  const handleReset = () => {
    setConfig(savedConfig);
    setValidationErrors({});
    setSaveBanner(null);
    showToast('Несохранённые изменения сброшены', 'undo');
  };

  // Attempt navigation with dirty guard
  const requestNavigation = (navAction: () => void) => {
    if (isDirty) {
      setPendingNavigation(() => navAction);
      setShowUnsavedModal(true);
    } else {
      navAction();
    }
  };

  // Storage accessibility check
  const handleTestStorageCheck = () => {
    const err = validateSinglePath('openArchivePath', config.openArchivePath);
    if (err) {
      setStorageCheckStatus('error');
      setStorageCheckMsg(err);
      return;
    }

    setStorageCheckStatus('checking');
    setStorageCheckMsg('Опрос локальной файловой системы...');
    setTimeout(() => {
      setStorageCheckStatus('success');
      setStorageCheckMsg('Доступ подтверждён: каталог доступен для чтения и записи (NTFS, 318.4 ГБ свободно).');
      setTimeout(() => setStorageCheckStatus('idle'), 4000);
    }, 550);
  };

  // Secret vault accessibility check
  const handleTestSecretCheck = () => {
    if (!isVeraCryptMounted) {
      setSecretCheckStatus('error');
      setSecretCheckMsg('Том V:\\ не обнаружен в файловой системе. Необходима аутентификация в VeraCrypt.');
      return;
    }

    setSecretCheckStatus('checking');
    setSecretCheckMsg('Проверка сектора VeraCrypt V:\\...');
    setTimeout(() => {
      setSecretCheckStatus('success');
      setSecretCheckMsg('Сектор доступен: XTS-AES 512 смонтирован, чтение/запись разрешены (64.2 ГБ свободно).');
      setTimeout(() => setSecretCheckStatus('idle'), 4000);
    }, 600);
  };

  // Obsidian connection check
  const handleTestObsidian = () => {
    const err = validateSinglePath('obsidianPath', config.obsidianPath);
    if (err || config.obsidianPath.toLowerCase().includes('bad') || config.obsidianPath.toLowerCase().includes('offline')) {
      setObsidianStatus('error');
      setObsidianMsg(`Ошибка: каталог '${config.obsidianPath}' недоступен или защищён от записи. Не удалось зафиксировать тестовый .md паспорт.`);
      return;
    }

    setObsidianStatus('checking');
    setObsidianMsg('Опрос каталога хранилища Obsidian...');
    setTimeout(() => {
      setObsidianStatus('active');
      setObsidianMsg('Связь активна: папка валидна, шаблон YAML frontmatter готов к экспорту.');
    }, 550);
  };

  // Local AI / Ollama connection check
  const handleTestAiConnection = () => {
    if (!config.ollamaEndpoint.startsWith('http') || config.ollamaEndpoint.includes('offline') || config.ollamaEndpoint.includes('invalid')) {
      setAiCheckStatus('error');
      setAiCheckMsg(`Ошибка соединения: Host unreachable (${config.ollamaEndpoint}). Демон Ollama не отвечает.`);
      return;
    }

    setAiCheckStatus('checking');
    setAiCheckMsg('Опрос эндпоинта модели Qwen2.5...');
    setTimeout(() => {
      setAiCheckStatus('success');
      setAiCheckMsg('Соединение с сервером Ollama v0.5.4 установлено (200 OK, латентность 12 мс).');
      setTimeout(() => setAiCheckStatus('idle'), 4500);
    }, 650);
  };

  // SQLite integrity diagnostics
  const handleRunSqliteDiagnostics = () => {
    setSqliteDiagStatus('checking');
    setSqliteDiagMsg('Выполнение проверки PRAGMA integrity_check и B-Tree индексов...');
    setTimeout(() => {
      setSqliteDiagStatus('success');
      setSqliteDiagMsg('Диагностика завершена: 1,842 записей в норме. Индексы SQLite B-Tree целостны. Companion JSON синхронизированы.');
    }, 700);
  };

  // Open Vault migration flow
  const handleStartMigration = () => {
    setIsMigrating(true);
    setMigrationProgress(10);

    const interval = setInterval(() => {
      setMigrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsMigrating(false);
            setShowMovePathModal(false);
            updateField('openArchivePath', newVaultPathCandidate);
            showToast(`Расположение открытого архива изменено на ${newVaultPathCandidate}`, 'verified');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  // Mount VeraCrypt dialog handler
  const handleExecuteMount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMountingLoading(true);
    setTimeout(() => {
      setIsMountingLoading(false);
      setShowVeraCryptMountModal(false);
      setMountPassword('');
      setMountPim('');
      if (!isVeraCryptMounted) {
        toggleVeraCrypt();
      }
      showToast('Том VeraCrypt успешно смонтирован на диск V:\\', 'key');
    }, 700);
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* 1. Top Context Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#006763]" />
              Параметры и конфигурация системы (SCR-17)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#006763] border border-teal-200 font-mono">
              v2.4-stable
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isVeraCryptMounted ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
              {isVeraCryptMounted ? 'Сессия зашифрована (AES-256)' : 'Secret Vault изолирован'}
            </span>
            {isDirty && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Несохранённые изменения
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Управление директориями хранилищ, политиками шифрования VeraCrypt, интеграциями Obsidian/LLM и интерфейсом.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Maintenance Center Link */}
          <button
            onClick={() => requestNavigation(() => setCurrentScreen('SCR-18'))}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Перейти в Центр обслуживания"
          >
            <Wrench className="w-3.5 h-3.5 text-[#006763]" />
            Центр обслуживания (SCR-18)
          </button>

          {/* Reset Changes Button */}
          {isDirty && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 border border-amber-300 hover:bg-amber-50 text-amber-800 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Отменить внесённые изменения и вернуть сохранённые значения"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сбросить
            </button>
          )}

          {/* Save Settings Button */}
          <button 
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all ${
              isDirty
                ? 'bg-[#006763] hover:bg-[#00524f] text-white ring-2 ring-teal-600/30'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Сохранение параметров...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Сохранить параметры {isDirty && '•'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Result Notification Banner */}
      {saveBanner && (
        <div 
          className={`px-4 py-3 rounded-lg border text-xs flex items-start justify-between gap-3 animate-in slide-in-from-top-1 ${
            saveBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {saveBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{saveBanner.message}</span>
          </div>
          <button 
            onClick={() => setSaveBanner(null)} 
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Two-Column Structure: Sub-navigation Tabs + Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Sub-Navigation Column */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Разделы конфигурации
            </div>

            <nav className="space-y-1 text-xs">
              {/* Tab 1: Хранилища */}
              <button
                onClick={() => setActiveTab('storage')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                  activeTab === 'storage'
                    ? 'bg-teal-50 text-[#006763] border border-teal-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HardDrive className={`w-4 h-4 ${activeTab === 'storage' ? 'text-[#006763]' : 'text-slate-500'}`} />
                  <span>Хранилища</span>
                </div>
                {validationErrors.openArchivePath || validationErrors.secretArchivePath ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Ошибки в путях" />
                ) : !isVeraCryptMounted ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">Lock</span>
                ) : null}
              </button>

              {/* Tab 2: Документы и интерфейс */}
              <button
                onClick={() => setActiveTab('interface')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                  activeTab === 'interface'
                    ? 'bg-teal-50 text-[#006763] border border-teal-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeTab === 'interface' ? 'text-[#006763]' : 'text-slate-500'}`} />
                  <span>Документы и интерфейс</span>
                </div>
                {validationErrors.inboxPath && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Ошибка пути входящих" />
                )}
              </button>

              {/* Tab 3: Интеграции */}
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                  activeTab === 'integrations'
                    ? 'bg-teal-50 text-[#006763] border border-teal-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderSync className={`w-4 h-4 ${activeTab === 'integrations' ? 'text-[#006763]' : 'text-slate-500'}`} />
                  <span>Интеграции (Obsidian / AI)</span>
                </div>
                {validationErrors.obsidianPath || obsidianStatus === 'error' ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Ошибка интеграции" />
                ) : null}
              </button>

              {/* Tab 4: Обслуживание */}
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-teal-50 text-[#006763] border border-teal-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className={`w-4 h-4 ${activeTab === 'maintenance' ? 'text-[#006763]' : 'text-slate-500'}`} />
                  <span>Обслуживание</span>
                </div>
              </button>
            </nav>
          </div>

          {/* System & Encryption Specs Footer */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center justify-between font-mono">
              <span>Версия ядра:</span>
              <span className="text-slate-700 font-semibold">2.4.1.88</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Схема БД:</span>
              <span className="text-slate-700 font-semibold">v14-companion</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Крипто-алгоритм:</span>
              <span className="text-[#006763] font-semibold">XTS-AES 512</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200/80">
              <span>Статус Secret:</span>
              <span className={isVeraCryptMounted ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                {isVeraCryptMounted ? 'V: Mounted' : 'V: Dismounted'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Workspace Content Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* TAB 1: Хранилища */}
          {activeTab === 'storage' && (
            <div className="space-y-4 text-xs">
              {/* Security Warning Notice */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#006763] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-800">
                    Регламент изоляции и миграции данных архива
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Изменение расположения хранилища требует полного копирования бинарных файлов и повторной калькуляции 
                    контрольных сумм SHA-256 в изолированном модальном окне перед фиксацией нового системного пути.
                  </p>
                </div>
              </div>

              {/* Card 1: Open Storage */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#006763]">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800">Открытое хранилище (Open Vault)</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Основное
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          Доступно (Локальная ФС)
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">NTFS / Чтение-Запись</span>
                      </div>
                    </div>
                  </div>

                  {/* Free Space Gauge */}
                  <div className="sm:text-right">
                    <div className="text-xs font-bold text-slate-800 font-mono">318.4 ГБ свободно</div>
                    <div className="text-[11px] text-slate-400">из 512.0 ГБ (занято 38%)</div>
                    <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 sm:ml-auto border border-slate-200">
                      <div className="h-full bg-[#006763] rounded-full" style={{ width: '38%' }} />
                    </div>
                  </div>
                </div>

                {/* Path Field & Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Каталог открытого архива (Open Zone Path)
                    </label>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(config.openArchivePath);
                        showToast('Путь скопирован в буфер обмена');
                      }}
                      className="text-[#006763] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      Копировать путь
                    </button>
                  </div>

                  <input
                    type="text"
                    value={config.openArchivePath}
                    onChange={e => updateField('openArchivePath', e.target.value)}
                    className={`w-full px-3 py-2 font-mono text-xs rounded-md border transition-colors ${
                      validationErrors.openArchivePath
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]'
                    }`}
                    placeholder="Например: C:\PersonalVault\Open\"
                  />

                  {/* Validation Error Explanation */}
                  {validationErrors.openArchivePath ? (
                    <div className="mt-1.5 p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold">Ошибка пути: </span>
                        {validationErrors.openArchivePath}
                      </div>
                      <button
                        onClick={() => updateField('openArchivePath', DEFAULT_CONFIG.openArchivePath)}
                        className="text-xs text-rose-700 underline font-medium hover:text-rose-900 shrink-0"
                      >
                        Сбросить на дефолт
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Файлы открытого архива доступны без ввода пароля тома VeraCrypt
                    </span>
                  )}
                </div>

                {/* Storage Test & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      1,842 документа
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Check className="w-3.5 h-3.5" />
                      Индекс актуален
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTestStorageCheck}
                      disabled={storageCheckStatus === 'checking'}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#006763] ${storageCheckStatus === 'checking' ? 'animate-spin' : ''}`} />
                      {storageCheckStatus === 'checking' ? 'Проверка...' : 'Проверить доступность'}
                    </button>

                    {/* Dangerous Action Button: Change Vault Location */}
                    <button
                      onClick={() => {
                        setNewVaultPathCandidate(config.openArchivePath);
                        setConfirmMoveCheckbox(false);
                        setShowMovePathModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      Изменить расположение...
                    </button>
                  </div>
                </div>

                {/* Result of storage check */}
                {storageCheckStatus !== 'idle' && (
                  <div className={`p-2.5 rounded-md text-[11px] flex items-center gap-2 ${
                    storageCheckStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    storageCheckStatus === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                    'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    {storageCheckStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {storageCheckStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    {storageCheckStatus === 'checking' && <Loader2 className="w-4 h-4 text-[#006763] animate-spin shrink-0" />}
                    <span>{storageCheckMsg}</span>
                  </div>
                )}
              </div>

              {/* Card 2: Secret Vault (VeraCrypt) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isVeraCryptMounted
                        ? 'bg-teal-50 border border-teal-200 text-[#006763]'
                        : 'bg-rose-50 border border-rose-200 text-rose-700'
                    }`}>
                      {isVeraCryptMounted ? <KeyRound className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800">Секретное хранилище (Secret Vault)</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          isVeraCryptMounted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                        }`}>
                          {isVeraCryptMounted ? 'VeraCrypt Защищено' : 'Не смонтирован / Заблокирован'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className={`flex items-center gap-1 font-medium ${isVeraCryptMounted ? 'text-emerald-700' : 'text-rose-700'}`}>
                          <span className={`w-2 h-2 rounded-full inline-block ${isVeraCryptMounted ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                          {isVeraCryptMounted ? 'Смонтирован (/dev/sdb1 -> V:\\)' : 'Том недоступен (диск V:\\ отсутствует)'}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">
                          {isVeraCryptMounted ? 'Готово к чтению/записи' : 'Имена файлов и метаданные изолированы (UX-032)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Free Space Gauge (Hidden in Zero-Leak Mode when unmounted) */}
                  {isVeraCryptMounted ? (
                    <div className="sm:text-right">
                      <div className="text-xs font-bold text-slate-800 font-mono">64.2 ГБ свободно</div>
                      <div className="text-[11px] text-slate-400">Том 120.0 ГБ (V:\Restricted)</div>
                      <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 sm:ml-auto border border-slate-200">
                        <div className="h-full bg-[#006763] rounded-full" style={{ width: '46%' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="sm:text-right p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">Zero-Leak Telemetry:</span> Скрыто
                    </div>
                  )}
                </div>

                {/* Secret Container Path */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Файл-контейнер VeraCrypt или системный раздел
                  </label>
                  <input
                    type="text"
                    value={config.secretArchivePath}
                    onChange={e => updateField('secretArchivePath', e.target.value)}
                    className={`w-full px-3 py-2 font-mono text-xs rounded-md border transition-colors ${
                      validationErrors.secretArchivePath
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]'
                    }`}
                  />
                  {validationErrors.secretArchivePath ? (
                    <div className="mt-1.5 p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{validationErrors.secretArchivePath}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Зашифрованный том V: монтируется прозрачно через официальный драйвер VeraCrypt
                    </span>
                  )}
                </div>

                {/* Zero-Leak Security Setting with DANGEROUS Action guard */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.hideCountsOnDismount}
                        onChange={e => {
                          if (!e.target.checked) {
                            // Dangerous change! Trigger confirmation modal
                            setShowZeroLeakWarningModal(true);
                          } else {
                            updateField('hideCountsOnDismount', true);
                          }
                        }}
                        className="mt-0.5 rounded text-[#006763] focus:ring-[#006763]"
                      />
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          Строгая маскировка секретных метаданных (Zero-Leak UX-032)
                          {config.hideCountsOnDismount ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800">
                              Включено
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                              Отключено (Опасно)
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                          {config.hideCountsOnDismount
                            ? 'Когда контейнер закрыт, приложение не сохраняет в кэше имена файлов, хэши или счетчики скрытых документов. Доступ разблокируется исключительно через сессионный ключ.'
                            : 'Внимание: защита отключена! Имена категорий и счётчики скрытых файлов видны в интерфейсе даже при закрытом томе.'}
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 pt-1 border-t border-slate-200 text-xs">
                    <span className="font-medium text-slate-700">Таймаут авторазмонтирования при неактивности:</span>
                    <select
                      value={config.autoDismountMinutes}
                      onChange={e => updateField('autoDismountMinutes', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="5">5 минут</option>
                      <option value="15">15 минут (рекомендуется)</option>
                      <option value="30">30 минут</option>
                      <option value="60">1 час</option>
                      <option value="never">Никогда</option>
                    </select>
                  </div>
                </div>

                {/* Secret Vault State Toggle Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Авто-размонтирование: {config.autoDismountMinutes} мин
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      Ключ в ОЗУ очищается
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Primary Mount / Dismount Toggle Button */}
                    <button
                      onClick={() => {
                        if (isVeraCryptMounted) {
                          toggleVeraCrypt();
                          showToast('Том VeraCrypt размонтирован (диск V: закрыт)', 'lock');
                        } else {
                          setShowVeraCryptMountModal(true);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isVeraCryptMounted
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {isVeraCryptMounted ? 'Размонтировать том (Закрыть V:\\)' : 'Смонтировать том V:\\ (Ввести пароль)'}
                    </button>

                    <button
                      onClick={handleTestSecretCheck}
                      disabled={secretCheckStatus === 'checking'}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#006763] ${secretCheckStatus === 'checking' ? 'animate-spin' : ''}`} />
                      Проверить доступность
                    </button>

                    <button
                      onClick={() => setShowVaultDetailsModal(true)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      Подробности тома
                    </button>
                  </div>
                </div>

                {/* Secret check feedback */}
                {secretCheckStatus !== 'idle' && (
                  <div className={`p-2.5 rounded-md text-[11px] flex items-center gap-2 ${
                    secretCheckStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    secretCheckStatus === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                    'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    {secretCheckStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {secretCheckStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    {secretCheckStatus === 'checking' && <Loader2 className="w-4 h-4 text-[#006763] animate-spin shrink-0" />}
                    <span>{secretCheckMsg}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Документы и интерфейс */}
          {activeTab === 'interface' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6 text-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Документы и интерфейс</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Конфигурация стартового экрана, плотности отображения реестров и каталога авто-монитора сканера.
                </p>
              </div>

              {/* Startup Screen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-3 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Стартовый экран</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Определяет экран, отображаемый при запуске приложения и разблокировке хранилища.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <select
                    value={config.startupScreen}
                    onChange={e => updateField('startupScreen', e.target.value)}
                    className="w-full max-w-sm px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs text-slate-800"
                  >
                    <option value="SCR-01">Журнал документов (SCR-01)</option>
                    <option value="SCR-02">Входящие сканы (SCR-02)</option>
                    <option value="SCR-10">Сессии черновиков (SCR-10)</option>
                    <option value="SCR-15">Планы и регламенты (SCR-15)</option>
                  </select>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.restoreLastSession}
                      onChange={e => updateField('restoreLastSession', e.target.checked)}
                      className="rounded text-[#006763] focus:ring-[#006763]"
                    />
                    <span className="text-slate-700">Возвращаться в последний открытый раздел при перезапуске</span>
                  </label>
                </div>
              </div>

              {/* Document Registry Table Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-3 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Отображение реестров</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Формат представления реестра документов в разделе Журнал и плотность строк.
                  </p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Вид Журнала по умолчанию:</label>
                    <select
                      value={config.journalDefaultView}
                      onChange={e => updateField('journalDefaultView', e.target.value as 'table' | 'list')}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    >
                      <option value="table">Таблица (F01)</option>
                      <option value="list">Двухстрочный список (F02)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Плотность строк таблицы:</label>
                    <select
                      value={config.tableDensity}
                      onChange={e => updateField('tableDensity', e.target.value as 'compact' | 'normal' | 'spacious')}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    >
                      <option value="compact">Компактная (28px)</option>
                      <option value="normal">Стандартная (34px)</option>
                      <option value="spacious">Просторная (42px)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Split Editor Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-3 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Компоновка сплит-редактора</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Схема отображения карточки документа и верификации OCR (SCR-06, SCR-11).
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-teal-50 border border-teal-200 text-[#006763] flex items-center justify-center font-bold text-xs">
                      1:1
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">
                        Оригинал / Скан слева, Структурированные метаданные справа
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Каноническая эргономика для параллельной верификации OCR на экранах от 900px.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inbox Watcher Path */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-3 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Каталог входящих сканов (Inbox Monitor)</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Папка, которую непрерывно слушает демон автоматического импорта.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <input
                    type="text"
                    value={config.inboxPath}
                    onChange={e => updateField('inboxPath', e.target.value)}
                    className={`w-full px-3 py-2 font-mono text-xs rounded-md border transition-colors ${
                      validationErrors.inboxPath
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]'
                    }`}
                  />
                  {validationErrors.inboxPath ? (
                    <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{validationErrors.inboxPath}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block">
                      Файлы PDF, TIFF, JPG, перемещаемые сетевым сканером в эту папку, мгновенно попадают в SCR-02
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Интеграции */}
          {activeTab === 'integrations' && (
            <div className="space-y-4 text-xs">
              {/* Card 1: Obsidian Sync */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#006763]">
                      <FolderSync className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Obsidian Markdown Экспорт</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Автоматический экспорт карточек документов (.md) со структурированным YAML фронтматтером
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    obsidianStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : obsidianStatus === 'error'
                      ? 'bg-rose-50 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      obsidianStatus === 'active' ? 'bg-emerald-500' :
                      obsidianStatus === 'error' ? 'bg-rose-500 animate-pulse' :
                      'bg-slate-400'
                    }`} />
                    <span>
                      {obsidianStatus === 'active' ? 'Связь активна' :
                       obsidianStatus === 'error' ? 'Ошибка подключения / Каталог не найден' :
                       'Проверка каталога...'}
                    </span>
                  </div>
                </div>

                {/* Directory Input */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Каталог хранилища Obsidian (Vault Archive Folder)
                  </label>
                  <input
                    type="text"
                    value={config.obsidianPath}
                    onChange={e => updateField('obsidianPath', e.target.value)}
                    className={`w-full px-3 py-2 font-mono text-xs rounded-md border transition-colors ${
                      validationErrors.obsidianPath || obsidianStatus === 'error'
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]'
                    }`}
                  />
                  {validationErrors.obsidianPath ? (
                    <div className="mt-1.5 p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{validationErrors.obsidianPath}</span>
                    </div>
                  ) : null}
                </div>

                {/* Checkbox: auto sync */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.obsidianAutoSync}
                    onChange={e => updateField('obsidianAutoSync', e.target.checked)}
                    className="mt-0.5 rounded text-[#006763] focus:ring-[#006763]"
                  />
                  <div>
                    <span className="font-semibold text-slate-800">
                      Автоматическая фиксация паспорта .md при сохранении документа
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Каждая архивация формирует заметку с YAML frontmatter, точными цитатами и ссылкой на файл PDF/TIFF.
                    </p>
                  </div>
                </label>

                {/* Note Template Preview */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600">
                  Шаблон имени заметки: <code>{`{{date}} - [{{category}}] - {{title}}.md`}</code>
                </div>

                {/* Test Connection Button & Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <span className={`text-[11px] font-medium ${obsidianStatus === 'error' ? 'text-rose-700' : 'text-slate-500'}`}>
                    {obsidianMsg}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTestObsidian}
                      disabled={obsidianStatus === 'checking'}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#006763] ${obsidianStatus === 'checking' ? 'animate-spin' : ''}`} />
                      {obsidianStatus === 'checking' ? 'Проверка...' : 'Проверить связь'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: AI & OCR Engine */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
                  <Cpu className="w-4 h-4 text-[#006763]" />
                  Движки оптического OCR и искусственного интеллекта
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Движок оптического OCR</label>
                    <select
                      value={config.ocrEngine}
                      onChange={e => updateField('ocrEngine', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="tesseract-v5">Tesseract OCR v5.3 (Локальный, без отправки в сеть)</option>
                      <option value="paddle-ocr">PaddleOCR v2.7 (Высокая точность для таблиц)</option>
                      <option value="easyocr">EasyOCR (PyTorch GPU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Модель извлечения атрибутов</label>
                    <select
                      value={config.llmProvider}
                      onChange={e => updateField('llmProvider', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="local-qwen">Qwen2.5-Coder-7B-Instruct (Локальный Ollama)</option>
                      <option value="claude-35">Anthropic Claude 3.5 Sonnet (API)</option>
                      <option value="gemini-25">Google Gemini 2.5 Flash / Pro (API)</option>
                    </select>
                  </div>
                </div>

                {/* Local endpoint test */}
                <div className="pt-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Эндпоинт локального сервера инференса (Ollama / vLLM)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.ollamaEndpoint}
                      onChange={e => updateField('ollamaEndpoint', e.target.value)}
                      className={`flex-1 px-3 py-1.5 font-mono text-xs rounded-md border ${
                        validationErrors.ollamaEndpoint
                          ? 'border-rose-400 bg-rose-50 text-rose-900'
                          : 'border-slate-300 bg-slate-50'
                      }`}
                    />
                    <button
                      onClick={handleTestAiConnection}
                      disabled={aiCheckStatus === 'checking'}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#006763] ${aiCheckStatus === 'checking' ? 'animate-spin' : ''}`} />
                      Проверить подключение
                    </button>
                  </div>

                  {aiCheckStatus !== 'idle' && (
                    <div className={`mt-2 p-2 rounded-md text-[11px] flex items-center gap-2 ${
                      aiCheckStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      aiCheckStatus === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      {aiCheckStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {aiCheckStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                      {aiCheckStatus === 'checking' && <Loader2 className="w-4 h-4 text-[#006763] animate-spin shrink-0" />}
                      <span>{aiCheckMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Обслуживание */}
          {activeTab === 'maintenance' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-[#006763] flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Центр обслуживания архива</h3>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed max-w-xl">
                      Комплексный мониторинг целостности, аналитические дашборды, контроль резервных копий 
                      и выявление проблем хранилищ в специализированном центре управления SCR-18.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => requestNavigation(() => setCurrentScreen('SCR-18'))}
                  className="px-4 py-2 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-center"
                >
                  <span>Перейти к Обслуживанию архива (SCR-18)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full h-px bg-slate-100" />

              {/* Express DB Integrity Check */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#006763]" />
                    Экспресс-проверка B-Tree индексов SQLite
                  </div>
                  <button
                    onClick={handleRunSqliteDiagnostics}
                    disabled={sqliteDiagStatus === 'checking'}
                    className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#006763] ${sqliteDiagStatus === 'checking' ? 'animate-spin' : ''}`} />
                    {sqliteDiagStatus === 'checking' ? 'Анализ базы...' : 'Запустить проверку'}
                  </button>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">
                  Быстрая сверка контрольных сумм в заголовках таблиц, проверка ссылочной целостности 
                  и актуальности companion-файлов метаданных без прерывания пользовательской сессии.
                </p>

                {sqliteDiagStatus === 'success' && (
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{sqliteDiagMsg}</span>
                  </div>
                )}
              </div>

              {/* PDF/A-2b Long term compression info */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-xs flex items-center gap-2">
                    <span>DEV-01: Модуль архивной компрессии PDF/A-2b (ISO 19005-2)</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
                      v2.5 Planned
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Фоновый демон Ghostscript/QPDF для гарантированной 50-летней читаемости оригиналов.
                  </div>
                </div>

                <button
                  onClick={() => setShowDev01Modal(true)}
                  className="px-2.5 py-1 text-xs text-[#006763] hover:underline font-medium"
                >
                  Подробнее...
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: UNSAVED CHANGES WARNING                               */}
      {/* ============================================================== */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Несохранённые изменения в конфигурации
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Вы изменили системные параметры приложения (пути хранилищ или флаги безопасности), 
                  но ещё не сохранили их в файл config.json. Сохранить перед переходом?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingNavigation(null);
                }}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium"
              >
                Остаться
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setShowUnsavedModal(false);
                  if (pendingNavigation) pendingNavigation();
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium"
              >
                Сбросить и перейти
              </button>
              <button
                onClick={() => {
                  handleSave();
                  setShowUnsavedModal(false);
                  if (pendingNavigation) pendingNavigation();
                }}
                className="px-3 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium shadow-xs"
              >
                Сохранить и перейти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DANGEROUS ACTION: MOVE REPOSITORY LOCATION            */}
      {/* ============================================================== */}
      {showMovePathModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <HardDrive className="w-4 h-4 text-[#006763]" />
                Подтверждение опасного действия: Смена расположения архива
              </div>
              <button
                onClick={() => !isMigrating && setShowMovePathModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-500">Текущий рабочий каталог:</label>
                <div className="p-2 rounded bg-slate-100 font-mono text-slate-700 text-xs">
                  {config.openArchivePath}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">Новый каталог назначения:</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newVaultPathCandidate}
                    onChange={e => setNewVaultPathCandidate(e.target.value)}
                    disabled={isMigrating}
                    className="flex-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                  <button
                    onClick={() => setNewVaultPathCandidate('E:\\SecureStorage\\PersonalVault\\')}
                    disabled={isMigrating}
                    className="px-2.5 py-1.5 border border-slate-300 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                  >
                    Обзор...
                  </button>
                </div>
              </div>

              {/* Warning Alert Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1.5 leading-relaxed text-[11px]">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Внимание: перемещение активного рабочего репозитория!
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  <li>Будут перенесены 1,842 архивных документа.</li>
                  <li>Для каждого бинарного файла будет пересчитана контрольная сумма SHA-256.</li>
                  <li>Исходный каталог не будет удален до завершения верификации.</li>
                </ul>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={confirmMoveCheckbox}
                  onChange={e => setConfirmMoveCheckbox(e.target.checked)}
                  disabled={isMigrating}
                  className="rounded text-[#006763] focus:ring-[#006763]"
                />
                <span className="font-semibold text-slate-800">
                  Я подтверждаю перенос репозитория и переиндексацию базы данных
                </span>
              </label>

              {/* Migration Progress Bar if active */}
              {isMigrating && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-[#006763]" />
                      Копирование бинарных файлов и сверка SHA-256...
                    </span>
                    <span className="font-mono">{migrationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-[#006763] transition-all duration-300"
                      style={{ width: `${migrationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowMovePathModal(false)}
                disabled={isMigrating}
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleStartMigration}
                disabled={!confirmMoveCheckbox || isMigrating}
                className={`px-4 py-1.5 rounded-md text-xs font-medium shadow-xs flex items-center gap-1.5 ${
                  confirmMoveCheckbox && !isMigrating
                    ? 'bg-[#006763] hover:bg-[#00524f] text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Перенос данных...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Начать перенос данных
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DANGEROUS ACTION: DISABLE ZERO-LEAK SECURITY          */}
      {/* ============================================================== */}
      {showZeroLeakWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Опасное изменение: Отключение Zero-Leak (UX-032)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Вы собираетесь отключить строгую маскировку конфиденциальных метаданных. 
                  При размонтировании тома VeraCrypt счётчики документов и категории секретного архива 
                  <strong> останутся видимыми в сайдбаре и отчётах</strong>.
                </p>
                <p className="text-xs text-rose-700 font-medium">
                  Это нарушает стандарт приватности и может раскрыть факт наличия секретного архива посторонним.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowZeroLeakWarningModal(false)}
                className="px-3.5 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium shadow-xs"
              >
                Оставить защиту (Рекомендуется)
              </button>
              <button
                onClick={() => {
                  setShowZeroLeakWarningModal(false);
                  updateField('hideCountsOnDismount', false);
                  showToast('Режим Zero-Leak отключен (повышенный риск утечки метаданных)', 'warning');
                }}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium"
              >
                Отключить защиту
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: MOUNT VERACRYPT DIALOG (Restoring Secret State)       */}
      {/* ============================================================== */}
      {showVeraCryptMountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleExecuteMount}
            className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-[#006763]" />
                Монтирование тома VeraCrypt (Диск V:\)
              </div>
              <button
                type="button"
                onClick={() => setShowVeraCryptMountModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Пароль тома шифрования (AES-XTS 512):
                </label>
                <input
                  type="password"
                  required
                  value={mountPassword}
                  onChange={e => setMountPassword(e.target.value)}
                  placeholder="Введите мастер-пароль контейнера..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:bg-white text-xs font-mono"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    PIM (Персональный множитель):
                  </label>
                  <input
                    type="number"
                    value={mountPim}
                    onChange={e => setMountPim(e.target.value)}
                    placeholder="485 (по умолчанию)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-slate-50 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Точка монтирования:</label>
                  <input
                    type="text"
                    disabled
                    value="V:\ (Secret Zone)"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-slate-100 text-slate-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500">
                После монтирования секретные документы станут доступны в Журнале, а Zero-Leak режим переключится в активный статус.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowVeraCryptMountModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isMountingLoading}
                className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium shadow-xs flex items-center gap-1.5"
              >
                {isMountingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Расшифровка тома...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    Смонтировать диск V:\
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: VAULT TECHNICAL DETAILS                               */}
      {/* ============================================================== */}
      {showVaultDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Lock className="w-4 h-4 text-[#006763]" />
                Спецификация тома VeraCrypt
              </div>
              <button
                onClick={() => setShowVaultDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Точка монтирования:</span>
                <span className="font-mono text-slate-800 font-medium">V:\Restricted</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Устройство-источник:</span>
                <span className="font-mono text-slate-800 font-medium">/dev/sdb1 (GPT partition)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Алгоритм шифрования:</span>
                <span className="font-mono text-slate-800 font-medium">AES-256-XTS</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Хэш-функция ключа:</span>
                <span className="font-mono text-slate-800 font-medium">SHA-512 (500,000 PIM)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Размер блока / Кластер:</span>
                <span className="font-mono text-slate-800 font-medium">4096 bytes</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Изоляция метаданных:</span>
                <span className="text-[#006763] font-semibold">Строгая (Zero-Leak Mode UX-032)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowVaultDetailsModal(false)}
                className="px-4 py-1.5 bg-[#006763] text-white rounded-md text-xs font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: DEV-01 PDF/A-2b MODULE INFO                           */}
      {/* ============================================================== */}
      {showDev01Modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Layers className="w-4 h-4 text-[#006763]" />
                DEV-01: Модуль компрессии PDF/A-2b
              </div>
              <button
                onClick={() => setShowDev01Modal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700">
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-[#006763] font-mono text-[10px] font-bold">
                  WIP
                </span>
                <span>Включение опционального фонового демона Ghostscript / QPDF</span>
              </div>
              <p>
                Данная функциональность проектируется как расширение для длительного архивного хранения (ISO 19005-2). 
                Она <strong>не будет включена по умолчанию</strong>, чтобы исключить паразитное потребление CPU при пакетном импорте.
              </p>
              <div className="font-mono text-[11px] p-2 rounded bg-slate-100 text-slate-600">
                Status: Architecture approved · Target release: v2.5.0-rc1
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDev01Modal(false)}
                className="px-4 py-1.5 bg-[#006763] text-white rounded-md text-xs font-medium"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
