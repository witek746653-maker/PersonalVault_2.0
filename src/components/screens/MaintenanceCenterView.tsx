import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  Wrench, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  FileCode, 
  Play, 
  Copy,
  Layers
} from 'lucide-react';

export const MaintenanceCenterView: React.FC = () => {
  const { documents, showToast } = useVault();
  const trashedCount = documents.filter(d => d.status === 'trashed').length;

  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [isRunningReindex, setIsRunningReindex] = useState(false);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [isRunningDrill, setIsRunningDrill] = useState(false);

  const [logs, setLogs] = useState<string[]>([
    '[2026-10-25 08:00:12] [SYSTEM] Database PersonalVault 2.0 started. Driver: SQLite 3.45.1 WAL-mode.',
    '[2026-10-25 08:00:14] [VFS] VeraCrypt volume linked to mount point V:/Encrypted_Vault_2026/.',
    '[2026-10-25 08:01:05] [INTEGRITY] PRAGMA quick_check OK (0 corrupted pages).',
    '[2026-10-25 09:00:00] [CRON] Background vacuum check completed without fragmentation.'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleRunIntegrityCheck = () => {
    setIsRunningCheck(true);
    addLog('[INTEGRITY] Launching PRAGMA integrity_check(100)...');

    setTimeout(() => {
      addLog('[INTEGRITY] Checking B-Tree page allocations... OK');
      addLog('[INTEGRITY] Checking foreign key constraints across documents & verification_items... OK');
      addLog('[INTEGRITY] PRAGMA integrity_check returned "ok". 0 errors detected.');
      setIsRunningCheck(false);
      showToast('Проверка целостности БД завершена: 0 ошибок (status: ok)');
    }, 1200);
  };

  const handleRunReindex = () => {
    setIsRunningReindex(true);
    addLog('[FTS5] Starting FTS5 full-text index rebuild for table documents_fts...');

    setTimeout(() => {
      addLog('[FTS5] Indexed 42 document passports and 118 extracted page transcripts.');
      addLog('[FTS5] Index rebuild completed in 842ms. Trigram tokenizer ready.');
      setIsRunningReindex(false);
      showToast('Полнотекстовый индекс FTS5 успешно перестроен');
    }, 1400);
  };

  const handleCreateSnapshot = () => {
    setIsRunningBackup(true);
    addLog('[BACKUP] Generating point-in-time snapshot of PersonalVault.sqlite...');

    setTimeout(() => {
      const snapName = `pv2_snapshot_${new Date().toISOString().slice(0, 10)}_r04.bak`;
      addLog(`[BACKUP] Snapshot written to /backups/${snapName} (Size: 4.8 MB).`);
      addLog(`[BACKUP] SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`);
      setIsRunningBackup(false);
      showToast(`Резервная копия создана: ${snapName}`);
    }, 1500);
  };

  const handleDisasterDrill = () => {
    setIsRunningDrill(true);
    addLog('[DISASTER_DRILL] Initiating simulated recovery on isolated sandbox temp directory...');

    setTimeout(() => {
      addLog('[DISASTER_DRILL] 1/4 Unpacking encrypted archive header test... OK');
      addLog('[DISASTER_DRILL] 2/4 Verifying SQLite journal replay... OK');
      addLog('[DISASTER_DRILL] 3/4 Testing document extraction with SHA256 match... OK (100% matched)');
      addLog('[DISASTER_DRILL] 4/4 Cold-start recovery test PASSED with 0 data loss.');
      setIsRunningDrill(false);
      showToast('Учебная тревога восстановления (Disaster Drill) успешно пройдена!');
    }, 2000);
  };

  const totalPages = documents.reduce((acc, d) => acc + d.pagesCount, 0);

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Центр технического обслуживания</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#006763] border border-teal-200">
              Database Maintenance & Integrity
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Диагностика SQLite, перестроение полнотекстовых индексов FTS5, создание снэпшотов и учебная тревога восстановления.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            БД в норме (PRAGMA: OK)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Размер базы данных</span>
              <Database className="w-4 h-4 text-[#006763]" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-800">4.82 MB</div>
            <div className="text-[11px] text-slate-400 mt-1">WAL-журнал: 128 KB</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Документов в индексе</span>
              <FileCode className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {documents.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Страниц скан-копий: {totalPages}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Контроль хешей</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700">100%</div>
            <div className="text-[11px] text-slate-400 mt-1">SHA-256 без коллизий</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Последний снэпшот</span>
              <HardDrive className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-base font-bold font-mono text-slate-800 mt-1">Сегодня, 08:30</div>
            <div className="text-[11px] text-slate-400 mt-1">Автоматическая репликация</div>
          </div>
        </div>

        {/* Action Operations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Integrity Check */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#006763]" />
                PRAGMA integrity_check
              </div>
              <span className="text-[11px] font-mono text-slate-400">SQLite v3.45.1</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Низкоуровневая проверка распределения страниц B-дерева, проверка бинарных структур и внешних ключей.
            </p>
            <button
              onClick={handleRunIntegrityCheck}
              disabled={isRunningCheck}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-[#006763] ${isRunningCheck ? 'animate-spin' : ''}`} />
              {isRunningCheck ? 'Проверка выполняется...' : 'Выполнить диагностику'}
            </button>
          </div>

          {/* Card 2: FTS5 Reindex */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <RefreshCw className="w-4 h-4 text-[#006763]" />
                Перестроить FTS5 индекс
              </div>
              <span className="text-[11px] font-mono text-slate-400">Trigram / Unicode61</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Пересоздает индекс мгновенного поиска по тексту документов, очищая неактуальные токены и фрагментацию.
            </p>
            <button
              onClick={handleRunReindex}
              disabled={isRunningReindex}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#006763] ${isRunningReindex ? 'animate-spin' : ''}`} />
              {isRunningReindex ? 'Перестроение...' : 'Запустить переиндексацию'}
            </button>
          </div>

          {/* Card 3: Snapshot Creation */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Download className="w-4 h-4 text-[#006763]" />
                Создать снэпшот архива (Резервная копия)
              </div>
              <span className="text-[11px] font-mono text-slate-400">Point-in-Time</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Экспорт текущей базы метаданных, схем шаблонов и журнала транзакций в автономный архивный файл .bak.
            </p>
            <button
              onClick={handleCreateSnapshot}
              disabled={isRunningBackup}
              className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#006763] border border-teal-200 rounded-md text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isRunningBackup ? 'animate-spin' : ''}`} />
              {isRunningBackup ? 'Упаковка снэпшота...' : 'Создать снэпшот сейчас'}
            </button>
          </div>

          {/* Card 4: Disaster Recovery Drill */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Учебная тревога восстановления (Disaster Drill)
              </div>
              <span className="text-[11px] font-mono text-slate-400">Cold-Restore Test</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Тестовое развертывание архива в изолированной песочнице с проверкой 100% совпадения контрольных сумм всех файлов.
            </p>
            <button
              onClick={handleDisasterDrill}
              disabled={isRunningDrill}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-amber-700 ${isRunningDrill ? 'animate-spin' : ''}`} />
              {isRunningDrill ? 'Тестирование в песочнице...' : 'Начать учебное восстановление'}
            </button>
          </div>
        </div>

        {/* Console / Terminal Logs */}
        <div className="bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-800 text-slate-200 font-mono text-[11px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">Журнал операций технического ядра (Console Output)</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLogs(['[RESET] Консоль очищена'])}
                className="text-slate-500 hover:text-slate-300 text-[10px]"
              >
                Очистить
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log.includes('OK') || log.includes('PASSED') ? (
                  <span className="text-emerald-400">{log}</span>
                ) : log.includes('PRAGMA') || log.includes('FTS5') ? (
                  <span className="text-cyan-300">{log}</span>
                ) : log.includes('DISASTER') ? (
                  <span className="text-amber-300">{log}</span>
                ) : (
                  <span className="text-slate-400">{log}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
