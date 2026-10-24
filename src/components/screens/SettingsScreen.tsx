import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const SettingsScreen: React.FC = () => {
  const { isVeraCryptMounted, toggleVeraCrypt, navigateTo } = useVault();
  const [activeTab, setActiveTab] = useState<'storage' | 'interface' | 'integrations' | 'system'>('storage');
  
  // Storage paths local state
  const [currentOpenPath, setCurrentOpenPath] = useState('C:\\PersonalVault\\Open\\');
  const [currentSecretPath, setCurrentSecretPath] = useState('V:\\PersonalVault\\Secret\\');
  
  // Interface settings
  const [density, setDensity] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [defaultZoom, setDefaultZoom] = useState('100%');
  const [themeMode, setThemeMode] = useState('light');
  const [showInspectorByDefault, setShowInspectorByDefault] = useState(true);

  // Integrations settings
  const [obsidianEnabled, setObsidianEnabled] = useState(true);
  const [obsidianPath, setObsidianPath] = useState('D:\\Obsidian\\Vault2026\\Documents');
  const [ocrAutoProcess, setOcrAutoProcess] = useState(true);

  // Modals & Banners
  const [showPathModal, setShowPathModal] = useState<null | 'Open' | 'Secret'>(null);
  const [newPathInput, setNewPathInput] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleStartMigration = () => {
    setIsMigrating(true);
    setMigrationProgress(15);
    const interval = setInterval(() => {
      setMigrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMigrating(false);
          if (showPathModal === 'Open') {
            setCurrentOpenPath(newPathInput);
          } else if (showPathModal === 'Secret') {
            setCurrentSecretPath(newPathInput);
          }
          setShowPathModal(null);
          setToastMessage(`Расположение ${showPathModal} Vault успешно обновлено. Хэши SHA-256 подтверждены.`);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleTestStorage = (zone: 'Open' | 'Secret') => {
    setToastMessage(`Проверка ${zone} Vault: Файловая система отвечает штатно. Ошибок чтения не обнаружено.`);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-36px)] overflow-hidden bg-surface text-on-surface">
      {/* Top Header */}
      <header className="flex flex-col shrink-0 bg-surface-container-low px-space-xl py-space-sm gap-space-xs border-b border-surface-container-highest">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs text-primary font-headline-md text-headline-md tracking-tight">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <h1 className="font-semibold text-lg text-on-surface">Настройки приложения (SCR-17)</h1>
            </div>
            <span className="px-space-sm py-[2px] rounded bg-secondary-container text-on-secondary-container font-code text-[11px] font-semibold tracking-wide">
              Конфигурация v2.4-stable
            </span>
            <span className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Сессия зашифрована (AES-256)
            </span>
          </div>

          <div className="flex items-center gap-space-sm text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span>Профиль: Локальный администратор</span>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toastMessage && (
        <div className="w-full bg-emerald-50 text-emerald-900 border-b border-emerald-200 px-space-md py-space-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
            <span className="font-label-md text-label-md">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Sub-navigation Column */}
        <aside className="w-56 shrink-0 bg-surface-container-low flex flex-col p-space-md justify-between border-r border-surface-container-highest select-none">
          <div className="flex flex-col gap-space-xs">
            <div className="px-space-sm py-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Разделы конфигурации
            </div>
            <nav className="flex flex-col gap-[2px]">
              <button
                onClick={() => setActiveTab('storage')}
                className={`flex items-center gap-space-sm h-8 px-space-sm rounded font-label-md text-label-md text-left transition-colors ${
                  activeTab === 'storage'
                    ? 'bg-surface-container text-primary border-l-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">database</span>
                <span>Хранилища</span>
              </button>
              <button
                onClick={() => setActiveTab('interface')}
                className={`flex items-center gap-space-sm h-8 px-space-sm rounded font-label-md text-label-md text-left transition-colors ${
                  activeTab === 'interface'
                    ? 'bg-surface-container text-primary border-l-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">view_quilt</span>
                <span>Документы и интерфейс</span>
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`flex items-center gap-space-sm h-8 px-space-sm rounded font-label-md text-label-md text-left transition-colors ${
                  activeTab === 'integrations'
                    ? 'bg-surface-container text-primary border-l-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">hub</span>
                <span>Интеграции</span>
              </button>
              <button
                onClick={() => navigateTo('obsluzhivanie')}
                className="flex items-center gap-space-sm h-8 px-space-sm rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md text-left transition-colors"
              >
                <span className="material-symbols-outlined text-[17px]">build_circle</span>
                <span>Обслуживание (SCR-18)</span>
              </button>
            </nav>
          </div>

          <div className="p-space-sm rounded bg-surface-container-high flex flex-col gap-space-xs text-[11px]">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Версия ядра:</span>
              <span className="font-code">2.4.1.88</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Схема БД:</span>
              <span className="font-code">v14-companion</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Шифрование:</span>
              <span className="text-primary font-semibold">XTS-AES 512</span>
            </div>
          </div>
        </aside>

        {/* Scrollable Settings Content Area */}
        <main className="flex-1 overflow-y-auto p-space-xl min-w-0 bg-surface">
          {/* TAB 1: Хранилища */}
          {activeTab === 'storage' && (
            <section className="flex flex-col gap-space-xl max-w-4xl">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold text-lg">
                  Управление хранилищами
                </h2>
                <p className="font-body-sm text-body-sm text-secondary mt-[2px]">
                  Настройка локальных директорий, криптоконтейнеров VeraCrypt и правил размещения первичных файлов архива.
                </p>
              </div>

              {/* Security Warning Notice */}
              <div className="flex items-start gap-space-md p-space-md rounded bg-surface-container-low text-on-surface border border-surface-container-highest">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-[1px]">
                  security_update_warning
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Регламент миграции и целостности
                  </span>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Изменение расположения хранилища требует полного копирования бинарных файлов и повторной калькуляции контрольных сумм SHA-256 в изолированном модальном окне перед фиксацией нового системного пути.
                  </p>
                </div>
              </div>

              {/* Card 1: Open Storage */}
              <div className="rounded bg-surface-container-lowest p-space-xl flex flex-col gap-space-md shadow-sm border border-surface-container-highest">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">folder_open</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-space-sm">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Открытое хранилище (Open Vault)
                        </h3>
                        <span className="px-space-sm py-[2px] rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                          Основное
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs mt-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold">
                          Доступно (Локальная ФС)
                        </span>
                        <span className="text-outline text-label-sm">•</span>
                        <span className="font-code text-code text-secondary">NTFS / Чтение-Запись</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-headline-sm text-headline-sm text-on-surface font-code font-bold">
                      318.4 ГБ свободно
                    </div>
                    <div className="font-label-sm text-label-sm text-outline">
                      из 512.0 ГБ (занято 38%)
                    </div>
                    <div className="w-36 h-1.5 bg-surface-container rounded overflow-hidden mt-1 ml-auto">
                      <div className="h-full bg-primary" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-space-sm rounded bg-surface-container flex items-center justify-between font-code text-code text-on-surface-variant">
                  <span className="truncate">{currentOpenPath}</span>
                  <button
                    className="text-primary hover:text-on-surface flex items-center gap-1 font-label-sm text-label-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(currentOpenPath);
                      setToastMessage('Путь скопирован в буфер обмена.');
                    }}
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Копировать</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-space-xs">
                  <div className="flex items-center gap-space-md text-secondary font-body-sm text-body-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">description</span>
                      1,838 документов
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">tag</span>
                      Индекс актуален
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <button
                      onClick={() => handleTestStorage('Open')}
                      className="px-space-md py-[5px] rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                      <span>Проверить доступность</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewPathInput(currentOpenPath);
                        setShowPathModal('Open');
                      }}
                      className="px-space-md py-[5px] rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">drive_file_move</span>
                      <span>Изменить расположение...</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Secret Storage (VeraCrypt) */}
              <div className="rounded bg-surface-container-lowest p-space-xl flex flex-col gap-space-md shadow-sm border border-surface-container-highest">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <span className="material-symbols-outlined text-[24px]">key</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-space-sm">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Секретное хранилище (VeraCrypt Secret Vault)
                        </h3>
                        <span className="px-space-sm py-[2px] rounded bg-amber-100 text-amber-900 border border-amber-300 font-label-sm text-label-sm">
                          XTS-AES-512
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs mt-1">
                        <span className={`w-2 h-2 rounded-full ${isVeraCryptMounted ? 'bg-primary' : 'bg-secondary'}`}></span>
                        <span className="font-label-sm text-label-sm font-semibold">
                          {isVeraCryptMounted ? 'Смонтировано (Диск V:)' : 'Размонтировано (Офлайн)'}
                        </span>
                        <span className="text-outline text-label-sm">•</span>
                        <span className="font-code text-code text-secondary">Таймаут неактивности: 15 мин</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    <button
                      onClick={toggleVeraCrypt}
                      className={`px-space-md py-[6px] rounded font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-sm ${
                        isVeraCryptMounted
                          ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          : 'bg-primary text-on-primary hover:bg-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isVeraCryptMounted ? 'lock' : 'lock_open'}
                      </span>
                      <span>{isVeraCryptMounted ? 'Размонтировать контейнер' : 'Смонтировать контейнер'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-space-sm rounded bg-surface-container flex items-center justify-between font-code text-code text-on-surface-variant">
                  <span className="truncate">{currentSecretPath}</span>
                  <button
                    className="text-primary hover:text-on-surface flex items-center gap-1 font-label-sm text-label-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(currentSecretPath);
                      setToastMessage('Путь контейнера скопирован.');
                    }}
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Копировать</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-space-xs">
                  <div className="flex items-center gap-space-md text-secondary font-body-sm text-body-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">verified_user</span>
                      Криптоконтейнер: 64.0 ГБ
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">shield</span>
                      Защита от утечки метаданных: Активна
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <button
                      onClick={() => handleTestStorage('Secret')}
                      className="px-space-md py-[5px] rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                      <span>Проверить контейнер</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewPathInput(currentSecretPath);
                        setShowPathModal('Secret');
                      }}
                      className="px-space-md py-[5px] rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">folder_special</span>
                      <span>Сменить файл контейнера...</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: Документы и интерфейс */}
          {activeTab === 'interface' && (
            <section className="flex flex-col gap-space-xl max-w-4xl">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold text-lg">
                  Параметры интерфейса и отображения
                </h2>
                <p className="font-body-sm text-body-sm text-secondary mt-[2px]">
                  Персонализация плотности строк, темы, шрифтов и поведения инспектора документов.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded p-space-xl border border-surface-container-highest flex flex-col gap-space-lg shadow-sm">
                {/* Density */}
                <div className="flex items-center justify-between pb-space-md border-b border-surface-container-highest">
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">
                      Плотность строк таблиц
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary">
                      Высота строк в Журнале (SCR-01), Черновиках и Планах
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container p-1 rounded">
                    {(['compact', 'standard', 'spacious'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => {
                          setDensity(d);
                          setToastMessage(`Плотность установлена: ${d}`);
                        }}
                        className={`px-space-md py-1 rounded text-label-sm font-label-sm capitalize transition-colors ${
                          density === d ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {d === 'compact' ? 'Компактная (28px)' : d === 'standard' ? 'Стандартная (34px)' : 'Просторная (42px)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Zoom */}
                <div className="flex items-center justify-between pb-space-md border-b border-surface-container-highest">
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">
                      Масштаб сканов по умолчанию
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary">
                      Начальное увеличение документа при переходе в просмотрщик (SCR-07, SCR-11)
                    </div>
                  </div>
                  <select
                    value={defaultZoom}
                    onChange={e => setDefaultZoom(e.target.value)}
                    className="h-8 px-3 rounded bg-surface border border-surface-container-highest text-body-sm font-code"
                  >
                    <option value="100%">100% (По ширине листа)</option>
                    <option value="125%">125%</option>
                    <option value="150%">150% (Чёткий OCR зум)</option>
                    <option value="200%">200% (Детальный осмотр)</option>
                  </select>
                </div>

                {/* Inspector default open */}
                <div className="flex items-center justify-between pb-space-md border-b border-surface-container-highest">
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">
                      Боковой инспектор карточки
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary">
                      Автоматически разворачивать правую панель при клике на строку
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showInspectorByDefault}
                    onChange={e => setShowInspectorByDefault(e.target.checked)}
                    className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                  />
                </div>

                {/* Theme mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">
                      Тема оформления
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary">
                      Палитра Calm Workstation (teal / slate grey)
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container p-1 rounded">
                    {['light', 'dark', 'system'].map(m => (
                      <button
                        key={m}
                        onClick={() => setThemeMode(m)}
                        className={`px-space-md py-1 rounded text-label-sm font-label-sm capitalize transition-colors ${
                          themeMode === m ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {m === 'light' ? 'Светлая' : m === 'dark' ? 'Тёмная' : 'Системная'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: Интеграции */}
          {activeTab === 'integrations' && (
            <section className="flex flex-col gap-space-xl max-w-4xl">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold text-lg">
                  Внешние интеграции
                </h2>
                <p className="font-body-sm text-body-sm text-secondary mt-[2px]">
                  Подключение каталога заметок Obsidian, службы распознавания текста Tesseract OCR и внешних утилит.
                </p>
              </div>

              {/* Obsidian Integration */}
              <div className="rounded bg-surface-container-lowest p-space-xl border border-surface-container-highest shadow-sm flex flex-col gap-space-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                      <span className="material-symbols-outlined text-[24px]">description</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-space-sm">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Синхронизация с Obsidian Vault
                        </h3>
                        <span className="px-space-sm py-[2px] rounded bg-purple-100 text-purple-900 font-label-sm text-label-sm">
                          Companion .md
                        </span>
                      </div>
                      <div className="text-secondary text-body-sm mt-0.5">
                        Создание двунаправленных ссылок и markdown карточек документов
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={obsidianEnabled}
                      onChange={e => setObsidianEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-space-sm rounded bg-surface-container flex items-center justify-between font-code text-code text-on-surface-variant">
                  <span className="truncate">{obsidianPath}</span>
                  <button
                    onClick={() => {
                      const p = prompt('Введите путь к хранилищу Obsidian:', obsidianPath);
                      if (p) {
                        setObsidianPath(p);
                        setToastMessage('Путь к Obsidian Vault обновлён.');
                      }
                    }}
                    className="text-primary hover:text-on-surface font-label-sm text-label-sm"
                  >
                    Изменить...
                  </button>
                </div>

                <div className="text-[12px] text-secondary">
                  ✓ При архивировании каждого документа генерируется файл-спутник <code className="font-code text-primary">PV-XXXX.md</code> с YAML фронтматтером.
                </div>
              </div>

              {/* OCR Service */}
              <div className="rounded bg-surface-container-lowest p-space-xl border border-surface-container-highest shadow-sm flex flex-col gap-space-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">document_scanner</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Оптическое распознавание текста (Tesseract OCR)
                      </h3>
                      <div className="text-secondary text-body-sm mt-0.5">
                        Локальное распознавание русского и английского текста без отправки в облако
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={ocrAutoProcess}
                    onChange={e => setOcrAutoProcess(e.target.checked)}
                    className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-space-sm text-[12px]">
                  <span className="text-secondary">Активные языковые пакеты:</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-code font-bold text-primary">RUS</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-code font-bold text-primary">ENG</span>
                  <span className="text-secondary text-[11px] ml-auto">Точность извлечения: ~96.4%</span>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Path Migration Modal */}
      {showPathModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-xl max-w-lg w-full border border-surface-container-highest overflow-hidden">
            <div className="px-space-lg py-space-md bg-surface-container-low border-b border-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-headline-sm font-semibold">
                <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
                <span>Миграция расположения {showPathModal} Vault</span>
              </div>
              {!isMigrating && (
                <button onClick={() => setShowPathModal(null)} className="text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="p-space-lg flex flex-col gap-space-md text-body-sm font-body-sm">
              <p className="text-on-surface">
                Укажите новую целевую директорию. Программа перенесёт файлы с обязательной сверкой SHA-256.
              </p>

              <div>
                <label className="block text-[11px] font-label-sm uppercase text-secondary mb-1">
                  Новый путь на накопителе:
                </label>
                <input
                  type="text"
                  disabled={isMigrating}
                  value={newPathInput}
                  onChange={e => setNewPathInput(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-surface border border-surface-container-highest font-code text-body-sm focus:outline-none focus:border-primary"
                />
              </div>

              {isMigrating && (
                <div className="flex flex-col gap-1.5 p-space-sm rounded bg-surface-container">
                  <div className="flex justify-between text-[11px] font-code">
                    <span>Копирование файлов и пересчет SHA-256...</span>
                    <span>{migrationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${migrationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-surface-container-highest flex justify-end gap-space-sm">
              <button
                disabled={isMigrating}
                onClick={() => setShowPathModal(null)}
                className="px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm rounded"
              >
                Отмена
              </button>
              <button
                disabled={isMigrating || !newPathInput.trim()}
                onClick={handleStartMigration}
                className="px-space-md py-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-sm rounded shadow-sm flex items-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Начать миграцию</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
