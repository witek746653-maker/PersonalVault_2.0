/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Types for SCR-18 Maintenance Center
export type ArchiveHealthStatus = 'healthy' | 'warning' | 'corrupt';
export type SecretContainerStatus = 'mounted' | 'locked';
export type ActiveTab = 'overview' | 'backups' | 'history';

interface IncidentItem {
  id: string;
  code: string;
  title: string;
  desc: string;
  severity: 'Критическая' | 'Средняя' | 'Низкая';
  action: string;
  actionCode: 'resync_fts' | 'run_drill' | 'restore_wizard';
  type: 'error' | 'warn';
}

interface BackupItem {
  id: string;
  filename: string;
  date: string;
  size: string;
  scope: string;
  type: string;
  status: 'verified';
  statusLabel: string;
  notes: string;
}

interface AuditLogItem {
  id: string;
  date: string;
  scope: string;
  result: 'success' | 'warning' | 'error';
  resultText: string;
  duration: string;
  docs: string;
  details: string;
}

export const MaintenanceCenterView: React.FC = () => {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [healthStatus, setHealthStatus] = useState<ArchiveHealthStatus>('healthy');
  const [secretStatus, setSecretStatus] = useState<SecretContainerStatus>('mounted');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [previousHealth, setPreviousHealth] = useState<ArchiveHealthStatus>('healthy');

  // Diagnostic Console State
  const [isDiagnosticsExpanded, setIsDiagnosticsExpanded] = useState<boolean>(false);

  // History Tab Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'issues'>('all');

  // Local Notification (Toast)
  const [localToast, setLocalToast] = useState<{ message: string; type?: 'info' | 'warn' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'info' | 'warn' | 'error' = 'info') => {
    setLocalToast({ message, type });
    const timer = setTimeout(() => {
      setLocalToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    | null
    | { type: 'restore'; backup: BackupItem }
    | { type: 'secret_mount' }
    | { type: 'create_backup' }
    | { type: 'drill' }
    | { type: 'test_backup'; backup: BackupItem }
  >(null);

  // Password input for Secret mount
  const [secretPassword, setSecretPassword] = useState('');
  const [secretShowPassword, setSecretShowPassword] = useState(false);
  const [secretMountError, setSecretMountError] = useState('');

  // Handle ESC key to dismiss modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
      if (e.key === 'F5' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleTriggerCheck();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  // Mock Snapshots dataset (strictly 4 items as requested)
  const [backups] = useState<BackupItem[]>([
    {
      id: 'BAK-04',
      filename: 'PV_20261024.bak',
      date: '24.10.2026, 23:00',
      size: '4.2 ГБ',
      scope: 'Open + Secret',
      type: 'Полный инкремент',
      status: 'verified',
      statusLabel: 'Проверен (Drill пройден)',
      notes: 'SHA256: 9f8a...31c4 • Сжатие Zstandard lvl 3'
    },
    {
      id: 'BAK-03',
      filename: 'PV_20261021.bak',
      date: '21.10.2026, 23:00',
      size: '4.18 ГБ',
      scope: 'Open + Secret',
      type: 'Полный инкремент',
      status: 'verified',
      statusLabel: 'Архив проверен',
      notes: 'SHA256: 12d4...fa09 • Хранилище NAS'
    },
    {
      id: 'BAK-02',
      filename: 'PV_20261018.bak',
      date: '18.10.2026, 23:00',
      size: '4.15 ГБ',
      scope: 'Open + Secret',
      type: 'Полный снимок',
      status: 'verified',
      statusLabel: 'Архив проверен',
      notes: 'SHA256: b8e1...4021 • Внешний диск'
    },
    {
      id: 'BAK-01',
      filename: 'PV_20261010_monthly.bak',
      date: '10.10.2026, 04:00',
      size: '4.10 ГБ',
      scope: 'Open + Secret',
      type: 'Ежемесячный архив',
      status: 'verified',
      statusLabel: 'Эталонная копия',
      notes: 'Холодное хранилище • WORM-реплика'
    }
  ]);

  // Mock Audit History entries (strictly 6 items)
  const auditLogs: AuditLogItem[] = useMemo(() => [
    {
      id: 'AUD-991',
      date: '24.10.2026, 23:00',
      scope: secretStatus === 'locked' ? 'Open' : 'Open + Secret',
      result: 'success',
      resultText: 'Исправно',
      duration: '3 мин 12 с',
      docs: secretStatus === 'locked' ? '1,838' : '1,842',
      details: 'Все файлы Originals и деривативов валидны. PRAGMA integrity_check: ok.'
    },
    {
      id: 'AUD-990',
      date: '23.10.2026, 23:00',
      scope: secretStatus === 'locked' ? 'Open' : 'Open + Secret',
      result: 'success',
      resultText: 'Исправно',
      duration: '2 мин 58 с',
      docs: secretStatus === 'locked' ? '1,838' : '1,839',
      details: 'Регулярная ночная сверка. Расхождений не выявлено.'
    },
    {
      id: 'AUD-989',
      date: '22.10.2026, 23:00',
      scope: secretStatus === 'locked' ? 'Open' : 'Open + Secret',
      result: 'warning',
      resultText: 'Предупреждение',
      duration: '3 мин 05 с',
      docs: '1,838',
      details: 'Временный лаг индексации дериватива PV-0941. Автоматически поставлен в очередь.'
    },
    {
      id: 'AUD-988',
      date: '21.10.2026, 14:15',
      scope: 'Open (Ручной запуск)',
      result: 'success',
      resultText: 'Исправно',
      duration: '1 мин 40 с',
      docs: '1,834',
      details: 'Выборочная сверка раздела Open перед импортом документов БТИ.'
    },
    {
      id: 'AUD-987',
      date: '15.10.2026, 23:00',
      scope: secretStatus === 'locked' ? 'Open' : 'Open + Secret',
      result: 'success',
      resultText: 'Исправно',
      duration: '3 мин 20 с',
      docs: '1,820',
      details: 'Контрольный аудит после планового обновления движка SQLite до 3.45.1.'
    },
    {
      id: 'AUD-986',
      date: '01.10.2026, 02:00',
      scope: secretStatus === 'locked' ? 'Open' : 'Open + Secret',
      result: 'success',
      resultText: 'Исправно',
      duration: '4 мин 10 с',
      docs: '1,805',
      details: 'Ежемесячный регламент глубокой сверки. Бэкап и drill подтверждены.'
    }
  ], [secretStatus]);

  const filteredAuditLogs = useMemo(() => {
    if (historyFilter === 'issues') {
      return auditLogs.filter(item => item.result === 'warning' || item.result === 'error');
    }
    return auditLogs;
  }, [auditLogs, historyFilter]);

  // Incidents computed from healthStatus
  const incidents: IncidentItem[] = useMemo(() => {
    if (healthStatus === 'corrupt') {
      return [
        {
          id: 'INC-ERR-01',
          code: '#ERR',
          title: 'Нарушение целостности страниц SQLite базы данных ERR_SQLITE_CORRUPT_BTREE',
          desc: 'PRAGMA integrity_check вернула ошибку: page 48299 is never used or tree corrupted. База переведена ядром PersonalVault в аварийный READ-ONLY.',
          severity: 'Критическая',
          action: 'Открыть мастер восстановления из бэкапа',
          actionCode: 'restore_wizard',
          type: 'error'
        }
      ];
    }
    if (healthStatus === 'warning') {
      return [
        {
          id: 'INC-204',
          code: '#01',
          title: 'Неполный поисковый индекс SQLite для документа PV-0941',
          desc: 'Файл: Квитанция_газ.pdf. Полнотекстовый индекс FTS5 не содержит текстового слоя страницы 2.',
          severity: 'Средняя',
          action: 'Переиндексировать в фоне',
          actionCode: 'resync_fts',
          type: 'warn'
        },
        {
          id: 'INC-205',
          code: '#02',
          title: 'Резервная копия не протестирована на восстановление',
          desc: 'Архив: PV_20261024.bak (4.2 ГБ). Прошло 32 дня с момента последнего тренировочного восстановления.',
          severity: 'Низкая',
          action: 'Запустить тест распаковки (Drill)',
          actionCode: 'run_drill',
          type: 'warn'
        }
      ];
    }
    return [];
  }, [healthStatus]);

  // Dynamic values based on active state combinations
  const isSecretLocked = secretStatus === 'locked';
  const totalDocsCount = isSecretLocked ? '1,838' : (healthStatus === 'corrupt' ? '1,842*' : '1,842');
  const openDocsCount = healthStatus === 'corrupt' ? '1,838*' : '1,838';
  const secretDocsCount = isSecretLocked ? '— (скрыто)' : (healthStatus === 'corrupt' ? '4*' : '4');

  // Action handlers
  const handleTriggerCheck = () => {
    if (isChecking) return;
    setPreviousHealth(healthStatus);
    setIsChecking(true);
    showNotification('Запущена глубокая регламентная проверка целостности архива...');
  };

  const handleCancelCheck = () => {
    setIsChecking(false);
    showNotification('Регламентная проверка архива отменена пользователем.', 'warn');
  };

  const handleIncidentAction = (actionCode: IncidentItem['actionCode']) => {
    if (actionCode === 'resync_fts') {
      showNotification('Недоступно в прототипе: фоновая служба FTS5 переиндексирует документ PV-0941.');
    } else if (actionCode === 'run_drill') {
      setActiveModal({ type: 'drill' });
    } else if (actionCode === 'restore_wizard') {
      setActiveModal({ type: 'restore', backup: backups[0] });
    }
  };

  const handleMountSecret = () => {
    if (!secretPassword.trim()) {
      setSecretMountError('Введите пароль тома VeraCrypt');
      return;
    }
    setSecretMountError('');
    setSecretStatus('mounted');
    setActiveModal(null);
    setSecretPassword('');
    showNotification('Том VeraCrypt успешно смонтирован. Защищенные документы (4 шт.) подключены к рабочей сессии.');
  };

  const handleCopyDiagnostics = () => {
    const diagnosticText = `PersonalVault 2.0 Maintenance Diagnostic Log
Database: C:\\Vault\\PersonalData\\metadata.db
Engine: SQLite 3.45.1 WAL
State: Health=${healthStatus}, Secret=${secretStatus}, Checking=${isChecking}
[2026-10-24 23:00:01] PRAGMA integrity_check executed.`;
    navigator.clipboard?.writeText(diagnosticText).then(() => {
      showNotification('Диагностический лог скопирован в буфер обмена.');
    }).catch(() => {
      showNotification('Не удалось скопировать в буфер обмена.', 'warn');
    });
  };

  // 6 KPI cards data calculation
  const kpiIndicators = useMemo(() => {
    if (isChecking) {
      return [
        { id: 'orig', label: 'Оригиналы', val: '1,024 / 1,842 файлов', sub: 'Вычисление SHA-256 (620 МБ/с)', status: 'checking', icon: 'sync' },
        { id: 'db', label: 'База данных', val: 'PRAGMA quick_check: OK', sub: 'Ожидание foreign_key check', status: 'checking', icon: 'database' },
        { id: 'meta', label: 'Метаданные', val: '1,842 манифеста в очереди', sub: 'Сверка хешей заголовков', status: 'checking', icon: 'description' },
        { id: 'bak', label: 'Резервные копии', val: 'Проверка хэша PV_20261024', sub: 'Чтение контрольных сумм', status: 'checking', icon: 'backup' },
        { id: 'last', label: 'Текущий запуск', val: 'Идет 1 мин 45 сек', sub: 'Расчетное время: ~1 мин', status: 'checking', icon: 'hourglass_top' },
        { id: 'issues', label: 'Промежуточно', val: 'Инцидентов пока: 0', sub: 'Проверка продолжается', status: 'checking', icon: 'manage_search' }
      ];
    }
    if (healthStatus === 'corrupt') {
      return [
        { id: 'orig', label: 'Оригиналы', val: `${openDocsCount} файлов (В сохранности)`, sub: 'Исходники не затронуты', status: 'ok', icon: 'folder' },
        { id: 'db', label: 'База данных', val: 'Сбой B-Tree в SQLite 3.45.1', sub: 'Лист page #48299 битый', status: 'error', icon: 'database' },
        { id: 'meta', label: 'Метаданные', val: 'Блокировка транзакций', sub: 'Запись остановлена', status: 'warn', icon: 'description' },
        { id: 'bak', label: 'Резервные копии', val: 'Доступна для отката', sub: 'Архив PV_20261024.bak цел', status: 'ok', icon: 'backup' },
        { id: 'last', label: 'Последняя проверка', val: '24.10.2026, 23:00', sub: 'Зафиксирован сбой PRAGMA', status: 'error', icon: 'schedule' },
        { id: 'issues', label: 'Проблемы', val: '1 критический сбой', sub: 'Необходим откат / восстановление', status: 'error', icon: 'report' }
      ];
    }
    if (isSecretLocked) {
      return [
        { id: 'orig', label: 'Оригиналы', val: '1,838 файлов (Open) OK', sub: 'Только открытый раздел', status: 'ok', icon: 'folder' },
        { id: 'db', label: 'База данных', val: 'SQLite Open Partition OK', sub: 'foreign_keys OK', status: 'ok', icon: 'database' },
        { id: 'meta', label: 'Метаданные', val: '1,838 манифестов Open', sub: 'Secret исключен из выборки', status: 'ok', icon: 'description' },
        { id: 'bak', label: 'Резервные копии', val: 'Бэкап Open актуален', sub: 'Резерв Secret изолирован', status: 'ok', icon: 'backup' },
        { id: 'last', label: 'Последняя проверка', val: '24.10.2026, 23:00', sub: 'Проверена область Open', status: 'ok', icon: 'schedule' },
        { id: 'issues', label: 'Проблемы', val: '0 проблем в Open', sub: 'Secret закрыт паролем', status: 'locked', icon: 'lock' }
      ];
    }
    if (healthStatus === 'warning') {
      return [
        { id: 'orig', label: 'Оригиналы', val: '1,842 файла OK', sub: 'Все SHA-256 совпадают', status: 'ok', icon: 'folder' },
        { id: 'db', label: 'База данных', val: 'SQLite 3.45.1 WAL OK', sub: 'Целостность таблиц в норме', status: 'ok', icon: 'database' },
        { id: 'meta', label: 'Метаданные', val: '1 несинхрон. индекс FTS5', sub: 'Документ PV-0941 отстает', status: 'warn', icon: 'description' },
        { id: 'bak', label: 'Резервные копии', val: 'Бэкап не протестирован', sub: 'Drill не проводился >30 дней', status: 'warn', icon: 'backup' },
        { id: 'last', label: 'Последняя проверка', val: '24.10.2026, 23:00', sub: 'Завершена с замечаниями', status: 'warn', icon: 'schedule' },
        { id: 'issues', label: 'Проблемы', val: '2 предупреждения', sub: 'Требуется регламентное действие', status: 'warn', icon: 'rule' }
      ];
    }
    // Default healthy
    return [
      { id: 'orig', label: 'Оригиналы', val: '1,842 файла OK', sub: 'Хэши SHA-256 сверены', status: 'ok', icon: 'folder' },
      { id: 'db', label: 'База данных', val: 'SQLite 3.45.1 WAL OK', sub: 'foreign_keys: 0 нарушений', status: 'ok', icon: 'database' },
      { id: 'meta', label: 'Метаданные', val: '1,842 манифеста (100%)', sub: 'FTS5 актуален, синхро-ОК', status: 'ok', icon: 'description' },
      { id: 'bak', label: 'Резервные копии', val: 'Актуальна (24.10 23:00)', sub: 'Disaster Drill пройден', status: 'ok', icon: 'backup' },
      { id: 'last', label: 'Последняя проверка', val: 'Сегодня, 23:00', sub: 'Длительность: 3 мин 12 сек', status: 'ok', icon: 'schedule' },
      { id: 'issues', label: 'Проблемы', val: '0 проблем', sub: 'Система стабильна', status: 'ok', icon: 'task_alt' }
    ];
  }, [healthStatus, isSecretLocked, isChecking, openDocsCount]);

  // Integrity bars calculation
  const integrityBars = useMemo(() => {
    if (isChecking) {
      return [
        { label: 'Originals/ SHA-256', pct: 54, color: 'bg-[#006763] animate-pulse', note: '54%' },
        { label: 'Copies/ Деривативы', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Metadata Manifests', pct: 40, color: 'bg-[#006763]', note: '40%' },
        { label: 'SQLite PRAGMA check', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'FTS5 Полнотекстовый', pct: 0, color: 'bg-slate-200', note: '0%' },
        { label: 'VeraCrypt Container', pct: isSecretLocked ? 0 : 100, color: isSecretLocked ? 'bg-slate-300' : 'bg-emerald-600', note: isSecretLocked ? 'Отключен' : '100%' }
      ];
    }
    if (healthStatus === 'corrupt') {
      return [
        { label: 'Originals/ SHA-256', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Copies/ Деривативы', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Metadata Manifests', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'SQLite PRAGMA check', pct: 20, color: 'bg-rose-600', note: '20% ERR' },
        { label: 'FTS5 Полнотекстовый', pct: 0, color: 'bg-slate-300', note: 'Блокирован' },
        { label: 'VeraCrypt Container', pct: isSecretLocked ? 0 : 100, color: isSecretLocked ? 'bg-slate-300' : 'bg-emerald-600', note: isSecretLocked ? 'Отключен' : '100%' }
      ];
    }
    if (isSecretLocked) {
      return [
        { label: 'Originals (Open) SHA-256', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Copies (Open) Деривативы', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Metadata (Open) Manifests', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'SQLite PRAGMA (Open scope)', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'FTS5 (Open scope)', pct: healthStatus === 'warning' ? 99.4 : 100, color: healthStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-600', note: healthStatus === 'warning' ? '99.4%' : '100%' },
        { label: 'Secret Vault (VeraCrypt)', pct: 0, color: 'bg-slate-300', note: 'Отключен' }
      ];
    }
    if (healthStatus === 'warning') {
      return [
        { label: 'Originals/ SHA-256', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Copies/ Деривативы', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'Metadata Manifests', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'SQLite PRAGMA check', pct: 100, color: 'bg-emerald-600', note: '100%' },
        { label: 'FTS5 Полнотекстовый', pct: 99.4, color: 'bg-amber-500', note: '99.4%' },
        { label: 'VeraCrypt Container', pct: 100, color: 'bg-emerald-600', note: '100%' }
      ];
    }
    // Default healthy
    return [
      { label: 'Originals/ SHA-256', pct: 100, color: 'bg-emerald-600', note: '100%' },
      { label: 'Copies/ Деривативы', pct: 100, color: 'bg-emerald-600', note: '100%' },
      { label: 'Metadata Manifests', pct: 100, color: 'bg-emerald-600', note: '100%' },
      { label: 'SQLite PRAGMA check', pct: 100, color: 'bg-emerald-600', note: '100%' },
      { label: 'FTS5 Полнотекстовый', pct: 100, color: 'bg-emerald-600', note: '100%' },
      { label: 'VeraCrypt Container', pct: 100, color: 'bg-emerald-600', note: '100%' }
    ];
  }, [healthStatus, isSecretLocked, isChecking]);

  // Log snippet content for Diagnostic Terminal
  const logSnippet = useMemo(() => {
    if (healthStatus === 'corrupt') {
      return `[2026-10-24 23:00:01.402] [FATAL] SQLite PRAGMA integrity_check;
*** in database "main" ***
Page 48299: free space corruption or B-Tree node malformed
Rowid 1928: out of order in index "idx_docs_updated_at"
Error code: SQLITE_CORRUPT (11)
[2026-10-24 23:00:01.450] [SECURITY] Guard activated. Storage forced into READ-ONLY mode.
[2026-10-24 23:00:01.460] [INFO] Manifests in /Metadata/ are verified and intact via SHA-256.
[2026-10-24 23:00:01.462] [INFO] Recommend restoring from snapshot PV_20261024.bak.`;
    }
    if (isChecking) {
      return `[2026-10-24 23:01:45.012] [RUNNING] Deep integrity audit in-progress...
[2026-10-24 23:01:45.020] [HASHING] Reading Originals (chunk 1024 of 1842)... Speed: 620 MB/s
[2026-10-24 23:01:45.030] [DB] PRAGMA quick_check: ok
[2026-10-24 23:01:45.040] [QUEUE] Waiting for FTS5 fulltext scanner...`;
    }
    if (isSecretLocked) {
      return `[2026-10-24 23:00:01.010] [SECURITY] Partition filter applied: SCOPE = 'OPEN_ONLY'
[2026-10-24 23:00:01.150] [INFO] Open Originals: 1,838 files verified via SHA-256
[2026-10-24 23:00:01.890] [INFO] SQLite PRAGMA quick_check; -> OK
[2026-10-24 23:00:01.900] [INFO] Secret volume is UNMOUNTED. Zero data queried or exposed.`;
    }
    if (healthStatus === 'warning') {
      return `[2026-10-24 23:00:01.100] [INFO] SHA-256 verified for 1,842 files in Originals/
[2026-10-24 23:00:02.320] [INFO] PRAGMA foreign_key_check -> OK (0 violations)
[2026-10-24 23:00:02.410] [WARN] FTS5 docid 941 (PV-0941) tokens out of sync with raw text payload.
[2026-10-24 23:00:02.412] [WARN] Action required: execute background re-index on PV-0941.
[2026-10-24 23:00:03.110] [INFO] Backup verification: PV_20261024.bak hash matches, drill pending.`;
    }
    return `[2026-10-24 23:00:01.002] [INFO] Starting scheduled integrity scan...
[2026-10-24 23:00:01.450] [OK] Originals/ 1,842 files validated. All SHA-256 match catalog.
[2026-10-24 23:00:02.120] [OK] SQLite PRAGMA integrity_check returned "ok".
[2026-10-24 23:00:02.800] [OK] PRAGMA foreign_key_check returned 0 rows.
[2026-10-24 23:00:03.010] [OK] 1,842 manifests match database state.
[2026-10-24 23:00:03.120] [OK] Completed in 3 min 12 sec. Health: 100%.`;
  }, [healthStatus, isChecking, isSecretLocked]);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-2.25rem)] bg-[#f4faff] text-[#111d23] select-none text-[13px] leading-[18px]">
      {/* LOCAL HEADER / BREADCRUMBS & TOP ACTION ZONE */}
      <div className="w-full bg-white px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#d7e4ec]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-col shrink-0 min-w-fit">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-0.5">
              <span>Хранилище</span>
              <span className="text-slate-400">/</span>
              <span className="text-[#111d23] font-semibold">Обслуживание архива</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#111d23] whitespace-nowrap">
                Обслуживание архива
              </h1>
            </div>
          </div>

          {/* Top Dynamic Status Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 xl:justify-end">
            {/* Main Status Badge */}
            {isChecking ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium bg-teal-50 border-teal-500/40 text-[#006763] max-w-full">
                <span className="material-symbols-outlined text-[15px] animate-spin shrink-0">sync</span>
                <span className="whitespace-nowrap">Статус: <strong>Выполняется регламентная проверка...</strong></span>
                <span className="text-slate-300 text-[10px]">|</span>
                <span className="font-mono text-[11px] whitespace-nowrap">Шаг 3 из 6 • 54% завершено</span>
              </div>
            ) : healthStatus === 'corrupt' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium bg-rose-50 border-rose-500/40 text-rose-700 max-w-full">
                <span className="material-symbols-outlined text-[15px] shrink-0">dangerous</span>
                <span className="whitespace-nowrap">Статус: <strong>Критический сбой: База данных повреждена</strong></span>
                <span className="text-slate-300 text-[10px]">|</span>
                <span className="font-mono text-[11px] whitespace-nowrap">РЕЖИМ ЗАЩИТЫ: ТОЛЬКО ЧТЕНИЕ</span>
              </div>
            ) : isSecretLocked ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium bg-slate-100 border-slate-300 text-slate-700 max-w-full">
                <span className="material-symbols-outlined text-[15px] shrink-0">lock</span>
                <span className="whitespace-nowrap">Статус: <strong>Статистика только по Open</strong></span>
                <span className="text-slate-300 text-[10px]">|</span>
                <span className="font-mono text-[11px] whitespace-nowrap">Secret заблокирован</span>
              </div>
            ) : healthStatus === 'warning' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium bg-amber-50 border-amber-600/30 text-amber-700 max-w-full">
                <span className="material-symbols-outlined text-[15px] shrink-0">warning</span>
                <span className="whitespace-nowrap">Статус: <strong>Архив в норме (2 предупреждения)</strong></span>
                <span className="text-slate-300 text-[10px]">|</span>
                <span className="font-mono text-[11px] whitespace-nowrap">Проверено: 24.10.2026, 23:00</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium bg-emerald-50 border-emerald-600/30 text-emerald-700 max-w-full">
                <span className="material-symbols-outlined text-[15px] shrink-0">verified</span>
                <span className="whitespace-nowrap">Статус: <strong>Архив полностью исправен</strong></span>
                <span className="text-slate-300 text-[10px]">|</span>
                <span className="font-mono text-[11px] whitespace-nowrap">0 инцидентов • 100% SHA OK</span>
              </div>
            )}

            {/* Scope Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e9f6fd] border border-[#d7e4ec] text-[#111d23] text-[11px] font-medium max-w-full">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isSecretLocked ? 'bg-slate-400' : healthStatus === 'corrupt' ? 'bg-rose-500' : 'bg-[#006763]'}`} />
              <span className="whitespace-nowrap">
                Область:{' '}
                <strong>
                  {healthStatus === 'corrupt'
                    ? 'Open + Secret (Режим Read-Only)'
                    : isSecretLocked
                    ? 'Только Open (Скрытое отключено)'
                    : 'Все доступные (Open + Secret)'}
                </strong>
              </span>
            </div>

            {/* Context Buttons */}
            {isChecking ? (
              <button
                onClick={handleCancelCheck}
                className="h-7 px-3 rounded bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">cancel</span>
                <span>Отменить проверку</span>
              </button>
            ) : healthStatus === 'corrupt' ? (
              <button
                onClick={() => setActiveModal({ type: 'restore', backup: backups[0] })}
                className="h-7 px-3 rounded bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">build</span>
                <span>Мастер восстановления</span>
              </button>
            ) : isSecretLocked ? (
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <button
                  onClick={() => setActiveModal({ type: 'secret_mount' })}
                  className="h-7 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  <span>Подключить том VeraCrypt</span>
                </button>
                <button
                  onClick={handleTriggerCheck}
                  className="h-7 px-2.5 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#111d23] text-[12px] font-medium transition-all flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Проверить Open</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleTriggerCheck}
                className="h-7 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Запустить проверку (F5)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTEXTUAL CRITICAL / IN-PROGRESS / SECRET BANNERS */}
      {healthStatus === 'corrupt' && (
        <div className="w-full px-4 sm:px-6 pt-3">
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-rose-600 text-[24px] mt-0.5">error</span>
              <div>
                <div className="text-[14px] font-bold text-rose-700 flex items-center gap-2 flex-wrap">
                  Критический сбой: Нарушение целостности страниц SQLite базы данных ERR_SQLITE_CORRUPT_BTREE
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                    READ-ONLY ЗАЩИТА
                  </span>
                </div>
                <div className="text-[12px] text-slate-700 mt-0.5">
                  Сбой обнаружен на листе page #48299. Запись временно заблокирована для защиты физических файлов и манифестов. Рекомендуется откат на снимок <strong>PV_20261024.bak</strong>.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setIsDiagnosticsExpanded(true);
                }}
                className="h-7 px-2.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                <span>Подробный лог PRAGMA</span>
              </button>
              <button
                onClick={() => setActiveModal({ type: 'restore', backup: backups[0] })}
                className="h-7 px-3 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">history</span>
                <span>Мастер отката из бэкапа</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isChecking && (
        <div className="w-full px-4 sm:px-6 pt-3">
          <div className="p-3.5 rounded-lg bg-white border border-[#006763]/40 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006763] text-[18px] animate-spin">autorenew</span>
                <span className="text-[13px] font-semibold text-[#111d23]">
                  Выполняется глубокая регламентная проверка архива (Шаг 3 из 6: Верификация контрольных сумм SHA-256)...
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#006763] font-semibold">
                54% (1,024 / 1,842 файлов) • 620 МБ/с
              </div>
            </div>
            <div className="w-full bg-[#e3f0f8] h-2 rounded overflow-hidden">
              <div className="bg-[#006763] h-full transition-all duration-300 rounded" style={{ width: '54%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="truncate">Текущий файл: D:\Vault\Open\Originals\2026-10\SCAN_ACT_0942_FINAL.pdf</span>
              <span className="text-slate-600 shrink-0 ml-2">Все операции архивации временно в очереди</span>
            </div>
          </div>
        </div>
      )}

      {isSecretLocked && !isChecking && healthStatus !== 'corrupt' && (
        <div className="w-full px-4 sm:px-6 pt-3">
          <div className="p-2.5 px-3.5 rounded-lg bg-white border border-[#d7e4ec] text-slate-600 flex items-center justify-between flex-wrap gap-2 shadow-2xs">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="material-symbols-outlined text-[16px] text-slate-500">lock</span>
              <span>
                Режим соответствия политике безопасности: Secret-том зашифрован и не смонтирован. Метрики, бэкапы и индексы рассчитываются исключительно для хранилища <strong>Open (1,838 документов)</strong>. Скрытые метаданные не раскрываются.
              </span>
            </div>
            <button
              onClick={() => setActiveModal({ type: 'secret_mount' })}
              className="h-6 px-2.5 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#006763] text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Смонтировать Secret</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* LOCAL TABS BAR */}
      <div className="w-full bg-[#e9f6fd] px-4 sm:px-6 border-b border-[#d7e4ec] flex items-center gap-1 mt-2.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`h-9 px-4 border-b-2 text-[12px] flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#006763] text-[#006763] font-semibold bg-white'
              : 'border-transparent text-slate-600 hover:text-[#111d23] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Обзор</span>
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`h-9 px-4 border-b-2 text-[12px] flex items-center gap-1.5 transition-colors ${
            activeTab === 'backups'
              ? 'border-[#006763] text-[#006763] font-semibold bg-white'
              : 'border-transparent text-slate-600 hover:text-[#111d23] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">backup</span>
          <span>Резервные копии</span>
          <span className="px-1.5 py-[0.5px] rounded bg-[#d7e4ec] text-slate-700 font-mono text-[10px] font-bold">
            {backups.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`h-9 px-4 border-b-2 text-[12px] flex items-center gap-1.5 transition-colors ${
            activeTab === 'history'
              ? 'border-[#006763] text-[#006763] font-semibold bg-white'
              : 'border-transparent text-slate-600 hover:text-[#111d23] font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>История</span>
          <span className="px-1.5 py-[0.5px] rounded bg-[#d7e4ec] text-slate-700 font-mono text-[10px] font-bold">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="w-full px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1">
        {/* ======================= TAB 1: ОБЗОР ======================= */}
        {activeTab === 'overview' && (
          <>
            {/* Top 6 KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
              {kpiIndicators.map(kpi => {
                let dotClass = 'bg-emerald-600';
                let textColor = 'text-[#111d23]';
                let cardBorder = 'border-[#d7e4ec]';

                if (kpi.status === 'warn') {
                  dotClass = 'bg-amber-600';
                  textColor = 'text-amber-800';
                  cardBorder = 'border-amber-300 bg-amber-50/20';
                } else if (kpi.status === 'error') {
                  dotClass = 'bg-rose-600';
                  textColor = 'text-rose-700';
                  cardBorder = 'border-rose-300 bg-rose-50/20';
                } else if (kpi.status === 'checking') {
                  dotClass = 'bg-[#006763] animate-ping';
                  textColor = 'text-[#006763]';
                } else if (kpi.status === 'locked') {
                  dotClass = 'bg-slate-400';
                  textColor = 'text-slate-600';
                }

                return (
                  <div
                    key={kpi.id}
                    className={`bg-white p-3 rounded-lg shadow-2xs border ${cardBorder} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-[11px] font-semibold text-slate-500">{kpi.label}</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400">{kpi.icon}</span>
                      </div>
                      <div className="my-1">
                        <div className={`text-[13px] font-bold ${textColor} truncate`} title={kpi.val}>
                          {kpi.val}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5" title={kpi.sub}>
                          {kpi.sub}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        {kpi.status === 'ok'
                          ? 'Исправно'
                          : kpi.status === 'warn'
                          ? 'Внимание'
                          : kpi.status === 'error'
                          ? 'Ошибка'
                          : kpi.status === 'checking'
                          ? 'Проверка'
                          : 'Недоступно'}
                      </span>
                      <span className="font-medium text-slate-400">PV2 Engine</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Central Incidents Zone */}
            {incidents.length > 0 ? (
              <div className="bg-white rounded-lg shadow-2xs border border-[#d7e4ec] overflow-hidden">
                <div className="h-9 px-3.5 bg-[#e9f6fd] flex items-center justify-between border-b border-[#d7e4ec]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        healthStatus === 'corrupt' ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      notification_important
                    </span>
                    <span className="text-[12px] text-[#111d23] font-semibold">
                      Очередь инцидентов и предупреждений
                    </span>
                    <span
                      className={`px-1.5 py-[1px] rounded font-mono text-[10px] font-bold ${
                        healthStatus === 'corrupt' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {incidents.length} {incidents.length === 1 ? 'инцидент' : 'записи'}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    Регламент устранения без риска утери данных
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="h-8 bg-[#e3f0f8] text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                        <th className="px-3 py-1 w-14">Код</th>
                        <th className="px-3 py-1">Характер проблемы</th>
                        <th className="px-3 py-1 w-28">Важность</th>
                        <th className="px-3 py-1 w-64 text-right">Рекомендуемые действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {incidents.map(inc => (
                        <tr
                          key={inc.id}
                          className={`h-11 hover:bg-[#f4faff] transition-colors ${
                            inc.type === 'error' ? 'bg-rose-50/20' : 'bg-amber-50/15'
                          }`}
                        >
                          <td className="px-3 py-1 font-mono text-slate-500">{inc.code}</td>
                          <td className="px-3 py-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`material-symbols-outlined text-[16px] shrink-0 ${
                                  inc.type === 'error' ? 'text-rose-600' : 'text-amber-600'
                                }`}
                              >
                                {inc.type === 'error' ? 'report' : 'warning'}
                              </span>
                              <div>
                                <div className="text-[#111d23] font-medium leading-tight">{inc.title}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{inc.desc}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                inc.type === 'error'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inc.severity}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setIsDiagnosticsExpanded(true)}
                                className="h-6 px-2 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1"
                                title="Открыть технический лог"
                              >
                                <span className="material-symbols-outlined text-[13px]">info</span>
                                <span>Диагностика</span>
                              </button>
                              <button
                                onClick={() => handleIncidentAction(inc.actionCode)}
                                className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-colors ${
                                  inc.type === 'error'
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : 'bg-[#006763] hover:bg-[#12827c] text-white'
                                }`}
                              >
                                {inc.action}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-3.5 shadow-2xs border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </div>
                  <div>
                    <div className="text-[13px] text-[#111d23] font-semibold">
                      Активных инцидентов нет. Все компоненты и контрольные суммы подтверждены.
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      База SQLite не имеет поврежденных страниц. Резервные копии синхронизированы и готовы к аварийному развертыванию.
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-600/20">
                  HEALTH: 100% OK
                </span>
              </div>
            )}

            {/* 3 Analytics Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
              {/* Card 1: Modules Integrity */}
              <div className="bg-white rounded-lg p-3.5 shadow-2xs border border-[#d7e4ec] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#006763]">verified</span>
                      <span className="text-[13px] font-bold text-[#111d23]">Контроль модулей архива</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">6 модулей</span>
                  </div>
                  <div className="flex flex-col gap-2.5 pt-3">
                    {integrityBars.map(bar => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#111d23] font-medium">{bar.label}</span>
                          <span className="font-mono text-slate-600 font-semibold">{bar.note}</span>
                        </div>
                        <div className="w-full bg-[#e3f0f8] h-2 rounded overflow-hidden">
                          <div
                            className={`${bar.color} h-full rounded transition-all duration-300`}
                            style={{ width: `${bar.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Регулярный регламент проверки</span>
                  <span className="text-[#006763] font-semibold">24.10.2026, 23:00</span>
                </div>
              </div>

              {/* Card 2: Document Breakdown (Open + Secret) */}
              <div className="bg-white rounded-lg p-3.5 shadow-2xs border border-[#d7e4ec] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#006763]">pie_chart</span>
                      <span className="text-[13px] font-bold text-[#111d23]">Состав документов архива</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{totalDocsCount} учтено</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-3">
                    {/* Open partition */}
                    <div className="p-2.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex items-center justify-between">
                      <div>
                        <div className="text-[12px] font-semibold text-[#111d23]">Открытое хранилище (Open)</div>
                        <div className="text-[11px] font-mono text-slate-500">D:\Vault\Open\ • Свободно 140 ГБ</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-bold text-[#006763]">{openDocsCount}</div>
                        <div className="text-[10px] text-slate-500 font-mono">документов</div>
                      </div>
                    </div>

                    {/* Secret partition */}
                    <div
                      className={`p-2.5 rounded border flex items-center justify-between ${
                        isSecretLocked
                          ? 'bg-slate-50 border-dashed border-slate-300 text-slate-500'
                          : 'bg-[#e9f6fd] border-[#d7e4ec]'
                      }`}
                    >
                      <div>
                        <div className="text-[12px] font-semibold flex items-center gap-1.5 text-[#111d23]">
                          <span className={`material-symbols-outlined text-[15px] ${isSecretLocked ? 'text-slate-400' : 'text-[#006763]'}`}>
                            lock
                          </span>
                          <span>Защищенный том (Secret)</span>
                          {isSecretLocked && (
                            <span className="px-1.5 py-[0.5px] rounded bg-slate-200 text-slate-600 text-[10px] font-mono">
                              Заблокирован
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {isSecretLocked
                            ? 'VeraCrypt AES-XTS (Том отключен)'
                            : 'V:\\Vault\\Secret\\ (Монтирован)'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[14px] font-bold ${isSecretLocked ? 'text-slate-400' : 'text-[#111d23]'}`}>
                          {secretDocsCount}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {isSecretLocked ? 'скрыто' : 'документов'}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      {isSecretLocked ? (
                        <span>
                          <strong>Правило конфиденциальности:</strong> Никакие названия, размеры или метаданные заблокированного тома не отражаются в открытых логах.
                        </span>
                      ) : (
                        <span>
                          Контрольные суммы документов обоих томов хранятся в изолированных манифестах для предотвращения взаимной утечки.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Сверка метаданных</span>
                  <span className="text-emerald-700 font-semibold">Синхронизировано</span>
                </div>
              </div>

              {/* Card 3: Backups & Drill */}
              <div className="bg-white rounded-lg p-3.5 shadow-2xs border border-[#d7e4ec] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#006763]">security_update_good</span>
                      <span className="text-[13px] font-bold text-[#111d23]">Резервная защита и Drill</span>
                    </div>
                    <span className="px-1.5 py-[1px] rounded bg-[#006763]/10 text-[#006763] font-mono text-[10px] font-semibold">
                      Zstandard
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 pt-3 text-[12px]">
                    <div className="p-2 rounded bg-[#e9f6fd] flex justify-between items-center">
                      <span className="text-slate-500">Последний снимок:</span>
                      <span className="font-mono font-semibold text-[#111d23]">PV_20261024.bak (4.2 ГБ)</span>
                    </div>
                    <div className="p-2 rounded bg-[#e9f6fd] flex justify-between items-center">
                      <span className="text-slate-500">Тест распаковки (Drill):</span>
                      <span
                        className={`font-mono font-semibold flex items-center gap-1 ${
                          healthStatus === 'warning' ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            healthStatus === 'warning' ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                        />
                        {healthStatus === 'warning' ? 'Требует обновления' : 'Пройден успешно'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[#e9f6fd] flex justify-between items-center">
                      <span className="text-slate-500">Целевой диск D:\Backups:</span>
                      <span className="font-mono text-emerald-700 font-semibold">280 ГБ свободно</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('backups')}
                    className="flex-1 h-7 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#006763] text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">backup</span>
                    <span>Реестр копий архива</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="h-7 px-3 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    <span>Аудит</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible Diagnostic Console */}
            <div className="bg-white rounded-lg shadow-2xs border border-[#d7e4ec] overflow-hidden">
              <button
                onClick={() => setIsDiagnosticsExpanded(!isDiagnosticsExpanded)}
                className="w-full h-9 px-3.5 bg-[#e9f6fd] flex items-center justify-between hover:bg-[#ddeaf2] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006763]">terminal</span>
                  <span className="text-[12px] font-semibold text-[#111d23]">
                    Технический диагностический журнал (PRAGMA, SHA-256, Storage paths)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">Диагностика PersonalVault</span>
                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    {isDiagnosticsExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </button>
              {isDiagnosticsExpanded && (
                <div className="p-3.5 border-t border-slate-700 bg-[#121d23] text-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-[11px] font-mono text-slate-400 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span>
                        Каталог базы: <code className="text-[#95f3eb]">C:\Vault\PersonalData\metadata.db</code>
                      </span>
                      <span>
                        Движок: <code className="text-[#95f3eb]">SQLite 3.45.1 WAL</code>
                      </span>
                    </div>
                    <button
                      onClick={handleCopyDiagnostics}
                      className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      <span>Копировать лог</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] leading-relaxed text-slate-200 overflow-x-auto whitespace-pre-wrap select-text">
                    {logSnippet}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================= TAB 2: РЕЗЕРВНЫЕ КОПИИ ======================= */}
        {activeTab === 'backups' && (
          <>
            {/* Top Storage Banner */}
            <div className="bg-white p-3.5 rounded-lg shadow-2xs border border-[#d7e4ec] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#006763]/10 flex items-center justify-center text-[#006763] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#111d23] flex items-center gap-2 flex-wrap">
                    Каталог резервных копий PersonalVault
                    <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#006763] font-mono text-[11px] font-semibold">
                      Автоматически каждые 24ч
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    Хранилище: <code className="font-mono text-[#111d23]">D:\Backups\</code> (280 ГБ свободно) • Формат сжатия: Zstandard (lvl 3) с встроенным хэшем SHA-256
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveModal({ type: 'create_backup' })}
                  className="h-8 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span>
                  <span>Создать резервную копию</span>
                </button>
                <button
                  onClick={() => setActiveModal({ type: 'drill' })}
                  className="h-8 px-3 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#111d23] text-[12px] font-medium transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#006763]">play_lesson</span>
                  <span>Тест распаковки (Drill)</span>
                </button>
              </div>
            </div>

            {/* Disaster Recovery Drill Info Box */}
            <div className="p-3 rounded-lg bg-[#e9f6fd] border border-[#d7e4ec] flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-[12px] text-slate-700">
                <span className="material-symbols-outlined text-[#006763] text-[18px]">verified_user</span>
                <span>
                  <strong>Тренировочное восстановление (Disaster Recovery Drill):</strong> периодическая тестовая распаковка архива во временную песочницу без модификации основной рабочей базы. Подтверждает гарантированную читаемость снапшотов.
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-600 shrink-0">
                Последний drill: <strong className="text-[#111d23]">24.10.2026, 23:05 (OK)</strong>
              </div>
            </div>

            {/* Snapshots Table */}
            <div className="bg-white rounded-lg shadow-2xs border border-[#d7e4ec] overflow-hidden">
              <div className="h-9 px-3.5 bg-[#e9f6fd] flex items-center justify-between border-b border-[#d7e4ec]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006763]">inventory_2</span>
                  <span className="text-[12px] font-semibold text-[#111d23]">
                    Список доступных снимков (Snapshots)
                  </span>
                  <span className="px-1.5 py-[1px] rounded bg-[#d7e4ec] text-slate-700 font-mono text-[10px] font-bold">
                    Всего: {backups.length}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">SHA-256 проверен при создании</div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="h-8 bg-[#e3f0f8] text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="px-3 py-1 w-14">Код</th>
                      <th className="px-3 py-1">Файл архива</th>
                      <th className="px-3 py-1 w-36">Дата создания</th>
                      <th className="px-3 py-1 w-24">Размер</th>
                      <th className="px-3 py-1 w-32">Область</th>
                      <th className="px-3 py-1 w-44">Статус Drill</th>
                      <th className="px-3 py-1 w-48 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {backups.map((bak, idx) => (
                      <tr
                        key={bak.id}
                        className={`h-11 hover:bg-[#f4faff] transition-colors ${
                          idx === 0 && healthStatus === 'corrupt' ? 'bg-amber-50/25' : ''
                        }`}
                      >
                        <td className="px-3 py-1 font-mono text-slate-500">{bak.id}</td>
                        <td className="px-3 py-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#006763] text-[18px]">archive</span>
                            <div>
                              <div className="font-mono font-semibold text-[#111d23] leading-tight">
                                {bak.filename}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">{bak.notes}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-1 font-mono text-slate-600 text-[11px]">{bak.date}</td>
                        <td className="px-3 py-1 font-mono text-[#111d23] font-semibold">{bak.size}</td>
                        <td className="px-3 py-1">
                          <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-slate-700 font-mono text-[11px]">
                            {isSecretLocked ? 'Open (Изолир.)' : bak.scope}
                          </span>
                        </td>
                        <td className="px-3 py-1">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-600/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {bak.statusLabel}
                          </span>
                        </td>
                        <td className="px-3 py-1 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setActiveModal({ type: 'test_backup', backup: bak })}
                              className="h-6 px-2 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-0.5"
                              title="Проверить целостность файла архива"
                            >
                              <span className="material-symbols-outlined text-[13px]">task_alt</span>
                              <span>Тест</span>
                            </button>
                            <button
                              onClick={() => setActiveModal({ type: 'restore', backup: bak })}
                              className={`h-6 px-2.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-0.5 ${
                                healthStatus === 'corrupt'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-[#006763] hover:bg-[#12827c] text-white'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">restore</span>
                              <span>Восстановить</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Safe Recovery Safety Policy Note */}
            <div className="p-3.5 rounded-lg bg-white border border-[#d7e4ec] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#006763] shrink-0 mt-0.5">shield</span>
              <div className="text-[12px] text-slate-600 space-y-1">
                <div className="font-semibold text-[#111d23]">
                  Политика безопасного восстановления архива (Safe Recovery Protocol):
                </div>
                <p>
                  При запуске восстановления ядро PersonalVault создает пре-снапшот текущей базы (shadow copy), проверяет контрольные суммы целевого архива, отключает фоновые воркеры и производит накат страниц только после валидации PRAGMA. Прямой деструктивный перезапуск невозможен без явного подтверждения.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ======================= TAB 3: ИСТОРИЯ ======================= */}
        {activeTab === 'history' && (
          <>
            {/* History Top Filter Header */}
            <div className="bg-white p-3.5 rounded-lg shadow-2xs border border-[#d7e4ec] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#006763]/10 flex items-center justify-center text-[#006763] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">history_edu</span>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#111d23]">
                    Журнал регламентных проверок и аудита архива
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    Непрерывная история сверки хэшей SHA-256, проверок целостности PRAGMA и индексов SQLite
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-[#e3f0f8] p-1 rounded text-[11px] text-slate-600">
                  <span className="px-1 text-slate-500 font-medium">Фильтр:</span>
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      historyFilter === 'all'
                        ? 'bg-white text-[#111d23] font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-[#111d23]'
                    }`}
                  >
                    Все ({auditLogs.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter('issues')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      historyFilter === 'issues'
                        ? 'bg-white text-[#111d23] font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-[#111d23]'
                    }`}
                  >
                    С замечаниями (1)
                  </button>
                </div>
                <button
                  onClick={() =>
                    showNotification('Недоступно в прототипе: экспорт журнала формируется службой аудита PersonalVault.')
                  }
                  className="h-7 px-2.5 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#111d23] text-[11px] font-medium transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">file_download</span>
                  <span>Экспорт JSON</span>
                </button>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-lg shadow-2xs border border-[#d7e4ec] overflow-hidden">
              <div className="h-9 px-3.5 bg-[#e9f6fd] flex items-center justify-between border-b border-[#d7e4ec]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006763]">event_note</span>
                  <span className="text-[12px] font-semibold text-[#111d23]">Реестр сессий обслуживания</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">Хранение логов: 365 дней</div>
              </div>
              <div className="w-full overflow-x-auto">
                {filteredAuditLogs.length > 0 ? (
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="h-8 bg-[#e3f0f8] text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                        <th className="px-3 py-1 w-16">ID</th>
                        <th className="px-3 py-1 w-36">Дата и время</th>
                        <th className="px-3 py-1 w-36">Область аудита</th>
                        <th className="px-3 py-1 w-32">Результат</th>
                        <th className="px-3 py-1 w-24">Время</th>
                        <th className="px-3 py-1 w-24">Документов</th>
                        <th className="px-3 py-1">Результаты и диагностика</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAuditLogs.map(item => {
                        let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-600/20';
                        let dotClass = 'bg-emerald-600';
                        if (item.result === 'warning') {
                          badgeClass = 'bg-amber-50 text-amber-700 border-amber-600/20';
                          dotClass = 'bg-amber-600';
                        } else if (item.result === 'error') {
                          badgeClass = 'bg-rose-50 text-rose-700 border-rose-600/30';
                          dotClass = 'bg-rose-600';
                        }

                        return (
                          <tr key={item.id} className="h-10 hover:bg-[#f4faff] transition-colors">
                            <td className="px-3 py-1 font-mono text-slate-500">{item.id}</td>
                            <td className="px-3 py-1 font-mono text-[#111d23] text-[11px]">{item.date}</td>
                            <td className="px-3 py-1 font-mono text-slate-600 text-[11px]">{item.scope}</td>
                            <td className="px-3 py-1">
                              <span
                                className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border ${badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                {item.resultText}
                              </span>
                            </td>
                            <td className="px-3 py-1 font-mono text-slate-500 text-[11px]">{item.duration}</td>
                            <td className="px-3 py-1 font-mono font-semibold text-[#111d23]">{item.docs}</td>
                            <td className="px-3 py-1 text-slate-600 text-[12px] truncate max-w-md" title={item.details}>
                              {item.details}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-[13px]">
                    Записей аудита с выбранным фильтром не обнаружено.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* BOTTOM LOCAL STATUS BAR */}
      <div className="w-full bg-white px-4 sm:px-6 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2 border-t border-[#d7e4ec] mt-auto font-mono text-[11px] text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                healthStatus === 'corrupt'
                  ? 'bg-rose-600'
                  : isChecking
                  ? 'bg-[#006763] animate-ping'
                  : 'bg-emerald-600'
              }`}
            />
            <span>
              {healthStatus === 'corrupt'
                ? 'БД: ERR_SQLITE_CORRUPT_BTREE (Read-Only)'
                : isChecking
                ? 'БД: PRAGMA check in-progress'
                : 'БД: sqlite_master OK'}
            </span>
          </span>
          <span>Open storage: D:\Vault\Open ({openDocsCount})</span>
          <span>
            {isSecretLocked
              ? 'Secret container: Не подключен (VeraCrypt AES-XTS)'
              : `Secret container: V:\\Vault\\Secret (${secretDocsCount})`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>PersonalVault 2.0 Maintenance Toolkit</span>
          <span>•</span>
          <span>Сборка 2026.10-R2</span>
        </div>
      </div>

      {/* ======================= LOCAL MODALS ======================= */}

      {/* 1. RESTORE CONFIRMATION MODAL */}
      {activeModal?.type === 'restore' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#d7e4ec] max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-11 px-4 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006763]">history</span>
                <span className="text-[13px] font-bold text-[#111d23]">Мастер безопасного восстановления</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 text-[12px] text-slate-700">
              <div className="p-3 rounded bg-[#f4faff] border border-[#d7e4ec] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Целевой снимок:</span>
                  <span className="font-bold text-[#111d23]">{activeModal.backup.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Дата создания:</span>
                  <span className="text-slate-700">{activeModal.backup.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Размер архива:</span>
                  <span className="text-slate-700">{activeModal.backup.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Хэш Zstd:</span>
                  <span className="text-slate-700">SHA256: 9f8a...31c4 OK</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
                <div>
                  <strong>Внимание:</strong> Восстановление откатит структуру SQLite базы до контрольной точки снимка. Перед накатом будет сформирована теневая копия текущего состояния (shadow pre-snapshot).
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Оригиналы документов в Originals/ не удаляются. Процесс строго следует Safe Recovery Protocol.
              </p>
            </div>
            <div className="p-3 bg-[#e9f6fd] border-t border-[#d7e4ec] flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 px-3 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[12px] font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showNotification('Недоступно в прототипе: операция отката базы требует физической службы PersonalVault.');
                }}
                className="h-8 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                Подтвердить откат
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERACRYPT PASSWORD MODAL */}
      {activeModal?.type === 'secret_mount' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#d7e4ec] max-w-sm w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-11 px-4 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006763]">lock</span>
                <span className="text-[13px] font-bold text-[#111d23]">Монтирование тома VeraCrypt</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 text-[12px] text-slate-700">
              <p className="text-[11px] text-slate-600">
                Введите мастер-пароль или укажите ключ шифрования для подключения защищенного контейнера{' '}
                <code className="font-mono font-bold text-[#111d23]">V:\Vault\Secret</code>:
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Пароль контейнера
                </label>
                <div className="relative">
                  <input
                    type={secretShowPassword ? 'text' : 'password'}
                    value={secretPassword}
                    onChange={e => setSecretPassword(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleMountSecret();
                    }}
                    placeholder="Введите пароль тома..."
                    autoFocus
                    className="w-full h-8 px-2.5 pr-8 rounded border border-slate-300 text-[12px] font-mono focus:outline-none focus:border-[#006763]"
                  />
                  <button
                    type="button"
                    onClick={() => setSecretShowPassword(!secretShowPassword)}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {secretShowPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {secretMountError && (
                  <div className="text-[11px] text-rose-600 font-medium mt-1">{secretMountError}</div>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Алгоритм: AES-XTS 256-bit • PIM: 485 • Изолированный контекст
              </div>
            </div>
            <div className="p-3 bg-[#e9f6fd] border-t border-[#d7e4ec] flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 px-3 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[12px] font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleMountSecret}
                className="h-8 px-3.5 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                Смонтировать том
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DISASTER DRILL MODAL */}
      {activeModal?.type === 'drill' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#d7e4ec] max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-11 px-4 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006763]">play_lesson</span>
                <span className="text-[13px] font-bold text-[#111d23]">Тест распаковки архива (Disaster Drill)</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 text-[12px] text-slate-700">
              <p>
                Запуск регламентного испытания распаковки снимка <strong className="font-mono text-[#111d23]">PV_20261024.bak</strong> в изолированную временную песочницу.
              </p>
              <div className="p-3 rounded bg-[#f4faff] border border-[#d7e4ec] space-y-1 font-mono text-[11px] text-slate-600">
                <div>1. Проверка заголовка и контрольной суммы архива</div>
                <div>2. Тестовое развертывание таблиц SQLite во временный каталог</div>
                <div>3. Сверка хэшей SHA-256 документов деривативов</div>
              </div>
              <div className="text-[11px] text-slate-500">
                Рабочая база данных и каталоги документов не модифицируются.
              </div>
            </div>
            <div className="p-3 bg-[#e9f6fd] border-t border-[#d7e4ec] flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 px-3 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[12px] font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showNotification('Недоступно в прототипе: тестовая распаковка выполняется в изолированной песочнице бэкенда.');
                }}
                className="h-8 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                Запустить Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE BACKUP MODAL */}
      {activeModal?.type === 'create_backup' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#d7e4ec] max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-11 px-4 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006763]">save</span>
                <span className="text-[13px] font-bold text-[#111d23]">Создание резервной копии</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 text-[12px] text-slate-700">
              <div className="space-y-1.5 font-mono text-[11px] p-3 rounded bg-[#f4faff] border border-[#d7e4ec]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Путь сохранения:</span>
                  <span className="font-semibold text-[#111d23]">D:\Backups\PV_20261026.bak</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Сжатие:</span>
                  <span className="text-slate-700">Zstandard lvl 3 (многопоточное)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Охват:</span>
                  <span className="text-slate-700">{isSecretLocked ? 'Только Open' : 'Open + Secret'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Снимок включает таблицы метаданных, манифесты и полнотекстовый индекс FTS5 с расчетом контрольного хэша SHA-256.
              </p>
            </div>
            <div className="p-3 bg-[#e9f6fd] border-t border-[#d7e4ec] flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 px-3 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[12px] font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showNotification('Недоступно в прототипе: создание снимка выполняется системным демоном PersonalVault.');
                }}
                className="h-8 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                Создать снимок
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TEST BACKUP ARCHIVE MODAL */}
      {activeModal?.type === 'test_backup' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#d7e4ec] max-w-sm w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-11 px-4 bg-[#e9f6fd] border-b border-[#d7e4ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006763]">task_alt</span>
                <span className="text-[13px] font-bold text-[#111d23]">Проверка файла архива</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-2.5 text-[12px] text-slate-700">
              <div className="font-mono text-[11px] p-2.5 rounded bg-[#f4faff] border border-[#d7e4ec] space-y-1">
                <div>Файл: <strong>{activeModal.backup.filename}</strong></div>
                <div>Размер: {activeModal.backup.size}</div>
                <div>{activeModal.backup.notes}</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Тестирование проверяет читаемость блоков архива и целостность контрольных сумм без распаковки.
              </p>
            </div>
            <div className="p-3 bg-[#e9f6fd] border-t border-[#d7e4ec] flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-8 px-3 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[12px] font-medium transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showNotification(`Контрольная сумма SHA-256 проверена в локальном кэше: архив ${activeModal.backup.filename} валиден.`);
                }}
                className="h-8 px-3 rounded bg-[#006763] hover:bg-[#12827c] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                Проверить хэш
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCAL TOAST NOTIFICATION POPUP */}
      {localToast && (
        <div className="fixed bottom-12 right-6 z-50 bg-[#121d23] text-white px-3.5 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 max-w-md animate-in slide-in-from-bottom-2">
          <span
            className={`material-symbols-outlined text-[18px] ${
              localToast.type === 'error'
                ? 'text-rose-400'
                : localToast.type === 'warn'
                ? 'text-amber-400'
                : 'text-[#95f3eb]'
            }`}
          >
            {localToast.type === 'error' ? 'error' : localToast.type === 'warn' ? 'warning' : 'info'}
          </span>
          <span className="text-[12px] flex-1 font-medium">{localToast.message}</span>
          <button
            onClick={() => setLocalToast(null)}
            className="text-slate-400 hover:text-white transition-colors ml-1"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
