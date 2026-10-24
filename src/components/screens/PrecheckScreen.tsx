import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const PrecheckScreen: React.FC = () => {
  const {
    navigateTo,
    processingSession,
    showToast
  } = useVault();

  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Stepper Widget */}
      <div className="bg-surface-container-lowest rounded-lg p-3 mb-2.5 border border-surface-container-highest shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
            <h1 className="font-bold text-[13px] text-on-surface">
              Подготовка документов: Этап 3 из 4 — Предварительная проверка
            </h1>
            <span className="text-[11px] text-secondary">Контроль пригодности к классификации и хранению</span>
          </div>
          <div className="font-code text-[11px] text-primary font-semibold bg-surface-container px-2 py-0.5 rounded">
            SCR-04 · VERIFY_PIPELINE_OK
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
          <button
            onClick={() => navigateTo('vkhodyashchie')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-secondary line-through opacity-80 cursor-pointer"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[9px] font-bold">✓</span>
            <span>1. Входящие</span>
          </button>

          <button
            onClick={() => navigateTo('sostav')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-secondary line-through opacity-80 cursor-pointer"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-prev text-[9px] font-bold">✓</span>
            <span>2. Состав пакета</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary text-on-primary font-bold shadow-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-on-primary text-primary flex items-center justify-center text-[9px] font-bold">3</span>
            <span>3. Предпроверка</span>
          </div>

          <button
            onClick={() => navigateTo('klassifikaciya')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-highest text-outline cursor-pointer"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-surface-container text-outline flex items-center justify-center text-[9px]">4</span>
            <span>4. Классификация</span>
          </button>
        </div>
      </div>

      {/* Target Document Card Summary */}
      <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">folder_special</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px] text-on-surface">{processingSession.workName}</span>
              <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container font-semibold text-[10px]">
                {processingSession.files.length} страницы
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-secondary font-body-sm">
              <span>{processingSession.files.map(f => f.name).join(', ')}</span>
              <span>•</span>
              <span className="font-code text-on-surface">6.8 МБ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded border border-surface-container-highest text-[11px]">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-outline uppercase font-semibold">Целевая зона хранения</span>
            <div className="flex items-center gap-1 font-bold text-primary">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>{processingSession.zone === 'secret' ? 'Secret (VeraCrypt)' : 'Открытое (Open)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Criteria Checklist */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
            Контрольные критерии пригодности:
          </span>
          <span className="text-[11px] text-primary font-bold">5 из 5 проверок пройдены успешно</span>
        </div>

        {/* Item 1 */}
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[15px]">check</span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[12px] text-on-surface">1. Читаемость и структура файлов</span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ✓ Успешно
              </span>
            </div>
            <p className="text-[11.5px] text-secondary">
              Все {processingSession.files.length} исходных файла успешно прочитаны. Контейнеры изображений и PDF не повреждены, шрифты внедрены в поток.
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[15px]">check</span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[12px] text-on-surface">2. Поддерживаемый формат долговременного хранения</span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ✓ Поддерживается
              </span>
            </div>
            <p className="text-[11.5px] text-secondary">
              Форматы JPEG (ISO/IEC 10918-1) и PDF/A соответствуют строгим требованиям постоянного локального архивирования WORM.
            </p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[15px]">check</span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[12px] text-on-surface">3. Проверка на дубликаты в базе Журнала</span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ✓ Уникальный документ
              </span>
            </div>
            <p className="text-[11.5px] text-secondary">
              Контрольные суммы SHA-256 не встречаются среди существующих записей Журнала. Нулевая избыточность подтверждена.
            </p>
          </div>
        </div>

        {/* Item 4 */}
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[15px]">check</span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[12px] text-on-surface">4. Доступность страниц и встроенного просмотрщика</span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ✓ Все {processingSession.files.length} страницы доступны
              </span>
            </div>
            <p className="text-[11.5px] text-secondary">
              Все страницы отрендерены локальным движком без сбоев. Ручная сверка значений будет доступна на этапе редактора (SCR-06/07).
            </p>
          </div>
        </div>

        {/* Item 5 */}
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[15px]">check</span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[12px] text-on-surface">5. Готовность целевой зоны хранения</span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ✓ Хранилище готово
              </span>
            </div>
            <p className="text-[11.5px] text-secondary">
              Локальный архив доступен для быстрой атомарной записи; на целевом томе свободно 4.2 ГБ.
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Technical Diagnostics Protocol Accordion */}
      <div className="bg-surface-container-low rounded-lg border border-surface-container-highest shadow-xs overflow-hidden mb-3">
        <button
          onClick={() => setIsDiagnosticsOpen(prev => !prev)}
          className="w-full px-3 py-2 flex items-center justify-between text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-[12px]"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`material-symbols-outlined text-[16px] transition-transform ${isDiagnosticsOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
            <span>Подробности и диагностические данные (технический протокол)</span>
          </div>
          <span className="font-code text-[11px] text-outline">
            {processingSession.files.length} файла · SHA-256 · ISO/IEC
          </span>
        </button>

        {isDiagnosticsOpen && (
          <div className="px-3 pb-3 pt-1 border-t border-surface-container-highest">
            <div className="bg-surface-container-lowest rounded overflow-x-auto p-2 border border-surface-container-highest">
              <table className="w-full text-left font-code text-[11px]">
                <thead>
                  <tr className="text-outline uppercase text-[9px] bg-surface-container-low h-6">
                    <th className="px-2">Файл</th>
                    <th className="px-2">MIME-тип</th>
                    <th className="px-2">Объём</th>
                    <th className="px-2">Контрольная сумма SHA-256</th>
                    <th className="px-2">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface">
                  {processingSession.files.map(f => (
                    <tr key={f.id} className="h-6">
                      <td className="px-2 font-medium">{f.name}</td>
                      <td className="px-2 text-secondary">{f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'}</td>
                      <td className="px-2">{f.size}</td>
                      <td className="px-2 text-primary font-mono text-[10px]">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </td>
                      <td className="px-2 text-primary font-bold">VALID</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center text-[10px] text-outline font-code pt-1.5">
              <span>Криптографический движок: OpenSSL 3.1.2-fips (Embedded)</span>
              <span>Локальная метка: {new Date().toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-[210px] right-0 z-30 h-11 bg-surface-container-high border-t border-surface-container-highest px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigateTo('sostav')}
          className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад к составу (SCR-03)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Проверка перезапущена')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>Повторить проверку</span>
          </button>

          <button
            onClick={() => navigateTo('klassifikaciya')}
            className="h-7 px-4 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Продолжить к классификации (SCR-05)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
