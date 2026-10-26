import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  Settings, 
  HardDrive, 
  Lock, 
  FolderSync, 
  Cpu, 
  ShieldCheck, 
  Wrench, 
  Save, 
  Check, 
  Info,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isVeraCryptMounted, toggleVeraCrypt, setCurrentScreen, showToast } = useVault();

  // Settings form state
  const [openArchivePath, setOpenArchivePath] = useState('D:/Archive/PersonalVault_Open/');
  const [secretArchivePath, setSecretArchivePath] = useState('V:/Encrypted_Vault_2026/');
  const [inboxPath, setInboxPath] = useState('D:/Inbox/Scans_Automated/');
  const [obsidianPath, setObsidianPath] = useState('D:/Obsidian/Main_Brain/Archive_Passports/');

  const [autoDismountMinutes, setAutoDismountMinutes] = useState('15');
  const [hideCountsOnDismount, setHideCountsOnDismount] = useState(true);
  const [obsidianAutoSync, setObsidianAutoSync] = useState(true);
  const [ocrEngine, setOcrEngine] = useState('tesseract-v5');
  const [llmProvider, setLlmProvider] = useState('local-qwen');

  const handleSave = () => {
    showToast('Настройки конфигурации сохранены в config.json');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Параметры и конфигурация системы</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#006763] border border-teal-200">
              PersonalVault 2.0 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Управление путями дискового хранилища, параметрами тома VeraCrypt, Obsidian Sync и локальным AI-ассистентом.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentScreen('SCR-18')}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-[#006763]" />
            Центр обслуживания
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#006763] hover:bg-[#00524f] text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Сохранить параметры
          </button>
        </div>
      </div>

      {/* Content Form */}
      <div className="w-full space-y-4 text-xs">
        {/* Section 1: Storage Paths */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
            <HardDrive className="w-4 h-4 text-[#006763]" />
            Дисковые пути и репозитории
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Каталог открытого архива (Open Zone)
              </label>
              <input 
                type="text" 
                value={openArchivePath} 
                onChange={e => setOpenArchivePath(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Доступен без монтирования шифроконтейнера</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Контейнер VeraCrypt (Secret Zone)
              </label>
              <input 
                type="text" 
                value={secretArchivePath} 
                onChange={e => setSecretArchivePath(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Зашифрованный виртуальный диск V: (AES-XTS)</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Каталог входящих сканов (Inbox Monitor)
              </label>
              <input 
                type="text" 
                value={inboxPath} 
                onChange={e => setInboxPath(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Служба file-watcher автоматически обнаруживает новые сканы</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Хранилище Obsidian Vault (Markdown Passports)
              </label>
              <input 
                type="text" 
                value={obsidianPath} 
                onChange={e => setObsidianPath(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Каталог для генерации структурированных заметок .md</span>
            </div>
          </div>
        </div>

        {/* Section 2: VeraCrypt & Zero-Leak Security */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Lock className="w-4 h-4 text-[#006763]" />
              Безопасность и политика нулевой утечки (UX-032)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Статус тома:</span>
              <button 
                onClick={toggleVeraCrypt}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isVeraCryptMounted 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isVeraCryptMounted ? 'V: Смонтирован (Клик для размонтирования)' : 'V: Отмонтирован (Клик для ввода пароля)'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={hideCountsOnDismount}
                onChange={e => setHideCountsOnDismount(e.target.checked)}
                className="mt-0.5 rounded text-[#006763] focus:ring-[#006763]"
              />
              <div>
                <span className="font-semibold text-slate-800">
                  Строгая маскировка секретных метаданных (Zero-Leak)
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  При размонтировании тома VeraCrypt счетчики секретных файлов в сайдбаре полностью скрываются, 
                  чтобы сторонний наблюдатель не мог определить даже факт наличия конфиденциальных документов.
                </p>
              </div>
            </label>

            <div className="flex items-center gap-4 pt-2">
              <span className="font-medium text-slate-700">Таймаут авторазмонтирования при неактивности:</span>
              <select
                value={autoDismountMinutes}
                onChange={e => setAutoDismountMinutes(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded bg-white"
              >
                <option value="5">5 минут</option>
                <option value="15">15 минут (рекомендуется)</option>
                <option value="30">30 минут</option>
                <option value="60">1 час</option>
                <option value="never">Никогда</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Obsidian & External Sync */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
            <FolderSync className="w-4 h-4 text-[#006763]" />
            Интеграция с Obsidian и внешними графами
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={obsidianAutoSync}
                onChange={e => setObsidianAutoSync(e.target.checked)}
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

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600">
              Шаблон имени заметки: <code>{`{{date}} - [{{category}}] - {{title}}.md`}</code>
            </div>
          </div>
        </div>

        {/* Section 4: AI & OCR Engine */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-[#006763]" />
            Движки распознавания текста (OCR) и искусственного интеллекта
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Движок оптического OCR</label>
              <select
                value={ocrEngine}
                onChange={e => setOcrEngine(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              >
                <option value="tesseract-v5">Tesseract OCR v5.3 (Локальный, без отправки в сеть)</option>
                <option value="paddle-ocr">PaddleOCR v2.7 (Высокая точность для таблиц)</option>
                <option value="easyocr">EasyOCR (PyTorch GPU)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Модель извлечения атрибутов</label>
              <select
                value={llmProvider}
                onChange={e => setLlmProvider(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              >
                <option value="local-qwen">Qwen2.5-Coder-7B-Instruct (Локальный сервер Ollama / vLLM)</option>
                <option value="claude-35">Anthropic Claude 3.5 Sonnet (API)</option>
                <option value="gemini-25">Google Gemini 2.5 Flash / Pro (API)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
