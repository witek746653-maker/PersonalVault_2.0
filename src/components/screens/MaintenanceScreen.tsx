import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const MaintenanceScreen: React.FC = () => {
  const { documents, maintenanceProblems, isVeraCryptMounted, navigateTo, setSelectedDocId } = useVault();
  const [activeTab, setActiveTab] = useState<'overview' | 'integrity' | 'problems' | 'backup'>('overview');
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [backups, setBackups] = useState([
    {
      id: 'bk-20261024',
      date: '24.10.2026, 21:00',
      type: 'Полный снимок базы и JSON-спутников',
      size: '1.42 ГБ',
      status: 'Успешно',
      hash: 'sha256:d8a2...4f91',
    },
    {
      id: 'bk-20261017',
      date: '17.10.2026, 21:00',
      type: 'Инкрементальный архив (Open Vault)',
      size: '142 МБ',
      status: 'Успешно',
      hash: 'sha256:91b7...a302',
    },
    {
      id: 'bk-20261010',
      date: '10.10.2026, 21:00',
      type: 'Полный снимок хранилища',
      size: '1.39 ГБ',
      status: 'Успешно',
      hash: 'sha256:44c1...88ee',
    },
  ]);

  const runIntegrityCheck = () => {
    setIsChecking(true);
    setCheckProgress(10);
    const interval = setInterval(() => {
      setCheckProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsChecking(false);
          setToastMessage('Проверка целостности успешно завершена. Все файлы и хэши сверены.');
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleCreateBackup = () => {
    const newBk = {
      id: `bk-${Date.now()}`,
      date: 'Только что',
      type: 'Ручной снимок базы SQLite и метаданных',
      size: '1.43 ГБ',
      status: 'Успешно',
      hash: 'sha256:e1a9...99bf',
    };
    setBackups([newBk, ...backups]);
    setToastMessage('Резервная копия успешно создана в защищённой папке Backups.');
  };

  const openCount = documents.filter(d => d.zone === 'open').length;
  const secretCount = documents.filter(d => d.zone === 'secret').length;
  const totalCount = documents.length;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-36px)] overflow-hidden bg-surface text-on-surface">
      {/* Header / Breadcrumbs & Top Action Status */}
      <div className="w-full bg-surface-container-lowest px-space-xl py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-surface-container-highest shrink-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm mb-0.5">
            <span>Хранилище</span>
            <span>/</span>
            <span className="text-on-surface font-medium">Обслуживание архива (SCR-18)</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-code text-label-sm font-semibold">
              PV2 · SCR-18
            </span>
            <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface truncate font-semibold text-lg">
              Обслуживание архива
            </h1>
          </div>
        </div>

        {/* Status Badges & Integrity Action */}
        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-600/30 text-emerald-700 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
            <span>
              Статус: <strong>{maintenanceProblems.length > 0 ? 'Обнаружены замечания' : 'Проверено: исправно'}</strong>
            </span>
            <span className="text-outline text-[10px]">|</span>
            <span className="font-code text-[11px]">24.10.2026, 23:00</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-surface-container-highest text-on-surface font-label-sm text-label-sm">
            <span className={`w-2 h-2 rounded-full ${isVeraCryptMounted ? 'bg-primary' : 'bg-secondary'}`}></span>
            <span>
              Область: <strong>{isVeraCryptMounted ? 'Все доступные (Open + Secret)' : 'Только Open (Secret оффлайн)'}</strong>
            </span>
          </div>

          <button
            onClick={runIntegrityCheck}
            disabled={isChecking}
            className="h-7 px-3 rounded bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[14px] ${isChecking ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isChecking ? 'Проверяется...' : 'Запустить проверку (F5)'}</span>
          </button>
        </div>
      </div>

      {/* Checking Progress Banner */}
      {isChecking && (
        <div className="w-full bg-surface-container-high px-space-md py-space-xs border-b border-surface-container-highest shrink-0 flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-code text-on-surface">
            <span>Выполняется сверка контрольных сумм SHA-256 и бинарных путей...</span>
            <span>{checkProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${checkProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="w-full bg-emerald-50 text-emerald-900 border-b border-emerald-200 px-space-md py-space-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-space-sm font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="w-full bg-surface-container-low px-space-xl border-b border-surface-container-highest flex items-center gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`h-9 px-3.5 border-b-2 font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">dashboard</span>
          <span>Обзор (Дашборды)</span>
        </button>

        <button
          onClick={() => setActiveTab('integrity')}
          className={`h-9 px-3.5 border-b-2 font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
            activeTab === 'integrity'
              ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">shield_check</span>
          <span>Целостность</span>
        </button>

        <button
          onClick={() => setActiveTab('problems')}
          className={`h-9 px-3.5 border-b-2 font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
            activeTab === 'problems'
              ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-error">warning</span>
          <span>Проблемы</span>
          {maintenanceProblems.length > 0 && (
            <span className="px-1.5 py-[0.5px] rounded-full bg-error text-on-error font-code text-[10px] font-bold">
              {maintenanceProblems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`h-9 px-3.5 border-b-2 font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
            activeTab === 'backup'
              ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">backup</span>
          <span>Резервные копии и восстановление</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-space-xl bg-surface">
        {/* TAB 1: Обзор */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl flex flex-col gap-space-lg mx-auto">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="font-label-sm text-label-sm text-secondary">Всего документов</span>
                    <span className="px-1.5 py-[0.5px] rounded bg-surface-container text-primary font-code text-[10px]">
                      База
                    </span>
                  </div>
                  <div className="my-1">
                    <div className="font-headline-lg text-headline-lg font-bold text-on-surface text-2xl">
                      {totalCount}
                    </div>
                    <div className="text-[11px] font-body-sm text-secondary flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-on-surface-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Open: {openCount}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-on-surface-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Secret: {secretCount}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container h-1 rounded overflow-hidden mt-1.5">
                    <div className="bg-primary h-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-surface-container-highest flex items-center justify-between font-code text-[10px] text-secondary">
                  <span>Фактически учтено</span>
                  <span className="text-emerald-700 font-semibold">100% базы</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="font-label-sm text-label-sm text-secondary">Полнота реквизитов</span>
                    <span className="px-1.5 py-[0.5px] rounded bg-surface-container text-primary font-code text-[10px]">
                      Метаданные
                    </span>
                  </div>
                  <div className="my-1">
                    <div className="font-headline-lg text-headline-lg font-bold text-primary text-2xl">
                      94%
                    </div>
                    <div className="text-[11px] font-body-sm text-secondary truncate mt-0.5">
                      1,731 заполнено <span className="text-error font-medium">• 111 требуют</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container h-1 rounded overflow-hidden mt-1.5">
                    <div className="bg-primary h-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-surface-container-highest flex items-center justify-between font-code text-[10px] text-secondary">
                  <span>Сверка реквизитов</span>
                  <span className="text-primary font-semibold">Норма</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="font-label-sm text-label-sm text-secondary">Статус сверки</span>
                    <span className="px-1.5 py-[0.5px] rounded bg-surface-container text-primary font-code text-[10px]">
                      Оптика OCR
                    </span>
                  </div>
                  <div className="my-1">
                    <div className="font-headline-lg text-headline-lg font-bold text-on-surface text-2xl">
                      72% <span className="text-sm font-normal text-secondary">со сканом</span>
                    </div>
                    <div className="text-[11px] font-body-sm text-secondary truncate mt-0.5">
                      1,326 сверено • 312 част. • 204 нет
                    </div>
                  </div>
                  <div className="w-full bg-surface-container h-1 rounded overflow-hidden flex mt-1.5">
                    <div className="bg-emerald-600 h-full" style={{ width: '72%' }}></div>
                    <div className="bg-primary h-full" style={{ width: '17%' }}></div>
                    <div className="bg-secondary-fixed-dim h-full" style={{ width: '11%' }}></div>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-surface-container-highest flex items-center justify-between font-code text-[10px] text-secondary">
                  <span>Проверено: 24.10, 23:00</span>
                  <span className="text-emerald-700 font-semibold">1,326 сверено</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-surface-container-highest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="font-label-sm text-label-sm text-secondary">Контроль целостности</span>
                    <span className="px-1.5 py-[0.5px] rounded bg-amber-50 text-amber-700 font-code text-[10px]">
                      SHA-256
                    </span>
                  </div>
                  <div className="my-1">
                    <div className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-1.5 text-xl">
                      <span className={`w-2 h-2 rounded-full ${maintenanceProblems.length > 0 ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
                      <span className={maintenanceProblems.length > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                        {maintenanceProblems.length > 0 ? `${maintenanceProblems.length} инцидента` : 'В норме'}
                      </span>
                    </div>
                    <div className="text-[11px] font-body-sm text-secondary truncate mt-0.5">
                      Проверено: 24.10.2026, 23:00
                    </div>
                  </div>
                  <div className="w-full bg-surface-container h-1 rounded overflow-hidden mt-1.5">
                    <div className="bg-amber-600 h-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-surface-container-highest flex items-center justify-between font-code text-[10px] text-secondary">
                  <span>Фактически проверено</span>
                  <span className="text-amber-700 font-semibold">Требует внимания</span>
                </div>
              </div>
            </div>

            {/* Categories breakdown and status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-stretch">
              {/* Category card */}
              <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm border border-surface-container-highest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-highest">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">category</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Категории документов
                      </span>
                    </div>
                    <span className="font-code text-[11px] text-secondary">1,842 всего</span>
                  </div>
                  <div className="flex flex-col gap-2.5 pt-space-md font-body-sm text-body-sm">
                    {[
                      { name: 'Жильё и недвижимость', count: 420, percent: 23 },
                      { name: 'Финансы и налоги', count: 385, percent: 21 },
                      { name: 'Работа и договоры', count: 310, percent: 17 },
                      { name: 'Здоровье и медицина', count: 290, percent: 16 },
                      { name: 'Личные документы', count: 245, percent: 13 },
                      { name: 'Прочее', count: 192, percent: 10 },
                    ].map(cat => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="text-on-surface font-medium">{cat.name}</span>
                          <span className="font-code text-secondary">{cat.count} ({cat.percent}%)</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                          <div className="bg-primary h-full rounded" style={{ width: `${cat.percent * 3.5}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-surface-container-highest flex items-center justify-between text-[11px] text-secondary font-code">
                  <span>Распределение по 6 разделам</span>
                  <span className="text-primary font-semibold">100% охват</span>
                </div>
              </div>

              {/* Maintenance recommendations */}
              <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm border border-surface-container-highest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-highest">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">checklist</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Рекомендации по оптимизации архива
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-space-md text-[12px]">
                    <div className="p-space-sm rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">warning</span>
                      <div>
                        <strong>2 документа требуют верификации скана:</strong> Документы PV-0038 и PV-0040 содержат неполные поля либо нераспознанный слой.
                        <button
                          onClick={() => setActiveTab('problems')}
                          className="block mt-1 text-primary hover:underline font-semibold"
                        >
                          Перейти к списку инцидентов →
                        </button>
                      </div>
                    </div>

                    <div className="p-space-sm rounded bg-surface-container text-secondary flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">schedule</span>
                      <div>
                        <strong>Плановое резервное копирование:</strong> Последний снимок базы SQLite был создан 24.10.2026. Рекомендуется обновить дамп перед крупными правками.
                        <button
                          onClick={() => setActiveTab('backup')}
                          className="block mt-1 text-primary hover:underline font-semibold"
                        >
                          Создать резервную копию →
                        </button>
                      </div>
                    </div>

                    <div className="p-space-sm rounded bg-surface-container text-secondary flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-700 shrink-0 mt-0.5">verified</span>
                      <div>
                        <strong>Контейнер VeraCrypt:</strong> Защищён алгоритмом XTS-AES-512. Никаких утечек метаданных в открытый сегмент диска C:\ не зафиксировано.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-surface-container-highest text-right">
                  <button
                    onClick={() => navigateTo('zhurnal')}
                    className="text-primary hover:underline font-label-sm text-[12px]"
                  >
                    Открыть основной Журнал (SCR-01) →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Целостность */}
        {activeTab === 'integrity' && (
          <div className="max-w-4xl flex flex-col gap-space-lg mx-auto">
            <div className="bg-surface-container-lowest p-space-xl rounded-lg border border-surface-container-highest shadow-sm flex flex-col gap-space-md">
              <h3 className="font-headline-sm font-semibold text-on-surface">
                Аудит контрольных сумм и файловой структуры
              </h3>
              <p className="font-body-sm text-secondary">
                PersonalVault непрерывно сверяет бинарные копии документов с базой данных и companion-файлами YAML.
              </p>

              <div className="border border-surface-container-highest rounded overflow-hidden">
                <table className="w-full text-body-sm text-left">
                  <thead className="bg-surface-container-low text-[11px] font-label-sm text-secondary uppercase border-b border-surface-container-highest">
                    <tr>
                      <th className="py-2 px-3">Область архива</th>
                      <th className="py-2 px-3">Кол-во файлов</th>
                      <th className="py-2 px-3">SHA-256 сверка</th>
                      <th className="py-2 px-3">ФС статус</th>
                      <th className="py-2 px-3 text-right">Результат</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-highest text-[12px]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-on-surface">Open Vault (Диск C:)</td>
                      <td className="py-2.5 px-3 font-code">{openCount} файлов</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">100% совпадение</td>
                      <td className="py-2.5 px-3 text-secondary font-code">NTFS / Доступно</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">ОК</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-on-surface">Secret Vault (Диск V:)</td>
                      <td className="py-2.5 px-3 font-code">{secretCount} файлов</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                        {isVeraCryptMounted ? '100% совпадение' : 'Зашифровано'}
                      </td>
                      <td className="py-2.5 px-3 text-secondary font-code">
                        {isVeraCryptMounted ? 'VeraCrypt / Доступно' : 'Офлайн (Безопасно)'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                        {isVeraCryptMounted ? 'ОК' : '🔒 Защищено'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-on-surface">SQLite Index DB</td>
                      <td className="py-2.5 px-3 font-code">1 база (18 таблиц)</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">PRAGMA integrity_check</td>
                      <td className="py-2.5 px-3 text-secondary font-code">WAL mode</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">ОК</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Проблемы */}
        {activeTab === 'problems' && (
          <div className="max-w-4xl flex flex-col gap-space-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm font-semibold text-on-surface">
                  Реестр замечаний и инцидентов
                </h3>
                <p className="font-body-sm text-secondary">
                  Список записей, требующих верификации, дозаполнения обязательных реквизитов или повторного OCR.
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-error-container text-on-error-container font-label-sm text-[12px] font-bold">
                {maintenanceProblems.length} замечаний
              </span>
            </div>

            <div className="flex flex-col gap-space-md">
              {maintenanceProblems.map(prob => (
                <div
                  key={prob.id}
                  className="bg-surface-container-lowest p-space-md rounded-lg border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-space-md"
                >
                  <div className="flex items-start gap-space-md">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-space-xs font-code text-[12px] text-primary font-bold">
                        <span>{prob.docId}</span>
                        <span className="text-secondary font-normal">•</span>
                        <span className="text-secondary font-sans font-normal">{prob.area}</span>
                      </div>
                      <div className="font-medium text-on-surface text-body-sm mt-0.5">
                        {prob.title} — {prob.docName}
                      </div>
                      <div className="text-[12px] text-amber-900 mt-1">
                        {prob.recommendedAction} ({prob.verifiedAt})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedDocId(prob.docId);
                        navigateTo('kartochka');
                      }}
                      className="px-space-md py-1 bg-primary hover:bg-primary-container text-on-primary font-label-sm text-[12px] rounded shadow-xs"
                    >
                      Исправить в карточке
                    </button>
                    <button
                      onClick={() => setToastMessage(`Инцидент по документу ${prob.docId} отправлен на перепроверку.`)}
                      className="px-space-md py-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-[12px] rounded"
                    >
                      Перепроверить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Резервные копии */}
        {activeTab === 'backup' && (
          <div className="max-w-4xl flex flex-col gap-space-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm font-semibold text-on-surface">
                  Резервные копии и аварийное восстановление
                </h3>
                <p className="font-body-sm text-secondary">
                  Автоматические снимки базы SQLite, сопутствующих файлов метаданных и реестров.
                </p>
              </div>
              <button
                onClick={handleCreateBackup}
                className="h-8 px-space-md rounded bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Создать резервную копию</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-sm overflow-hidden">
              <table className="w-full text-body-sm text-left">
                <thead className="bg-surface-container-low text-[11px] font-label-sm text-secondary uppercase border-b border-surface-container-highest">
                  <tr>
                    <th className="py-2 px-3">Дата создания</th>
                    <th className="py-2 px-3">Состав архива</th>
                    <th className="py-2 px-3">Размер</th>
                    <th className="py-2 px-3">Хэш снимка</th>
                    <th className="py-2 px-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest text-[12px]">
                  {backups.map(bk => (
                    <tr key={bk.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 px-3 font-medium text-on-surface">{bk.date}</td>
                      <td className="py-2.5 px-3 text-on-surface-variant">{bk.type}</td>
                      <td className="py-2.5 px-3 font-code text-secondary">{bk.size}</td>
                      <td className="py-2.5 px-3 font-code text-[11px] text-secondary">{bk.hash}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setToastMessage(`Запрос восстановления из копии ${bk.id}: Все контрольные суммы подтверждены.`)}
                          className="px-2 py-1 bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-[11px] rounded"
                        >
                          Восстановить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
