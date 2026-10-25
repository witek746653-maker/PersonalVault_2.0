/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const DataEditorSplitView: React.FC = () => {
  const {
    setCurrentScreen,
    setPipelineStep,
    classificationData,
    updateClassification,
    activeDocId,
    documents,
    myDataRecords,
    activeScenario,
    showToast,
  } = useVault();

  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Modals & Panels
  const [isMyDataOpen, setIsMyDataOpen] = useState(activeScenario === 'mydata');
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(activeScenario === 'diff');
  const [isOcrOpen, setIsOcrOpen] = useState(activeScenario === 'ocr');
  const [isDeleteFieldModalOpen, setIsDeleteFieldModalOpen] = useState(activeScenario === 'del');

  // Fields State
  interface EditorField {
    id: string;
    name: string;
    val: string;
    verified: boolean;
    quote: string;
    req: boolean;
    isLocal?: boolean;
  }

  const [fields, setFields] = useState<EditorField[]>([
    {
      id: 'f1',
      name: 'Номер акта',
      val: '№ АПП-42',
      verified: true,
      quote: 'Стр. 1, шапка • Цитата: "настоящий акт № АПП-42"',
      req: true,
    },
    {
      id: 'f2',
      name: 'Дата составления',
      val: classificationData.docDate || '12.10.2026',
      verified: true,
      quote: 'Стр. 1, шапка • Цитата: "12 октября 2026 г."',
      req: true,
    },
    {
      id: 'f3',
      name: 'Наймодатель',
      val: 'Васильев Андрей Сергеевич',
      verified: false,
      quote: 'Стр. 1, п. 1 • ⚠ Не сверено',
      req: true,
    },
    {
      id: 'f4',
      name: 'Наниматель',
      val: 'Смирнова Елена Игоревна',
      verified: false,
      quote: 'Стр. 1, п. 1 • ⚠ Не сверено',
      req: true,
    },
    {
      id: 'f5',
      name: 'Адрес помещения',
      val: 'г. Санкт-Петербург, Московский пр., д. 182, кв. 42',
      verified: false,
      quote: 'Стр. 1, п. 1 • ⚠ Не сверено',
      req: true,
    },
    {
      id: 'f6',
      name: 'Комплекты ключей',
      val: '2 комплекта ключей + электронный чип домофона',
      verified: false,
      quote: 'Стр. 1, п. 3 • ⚠ Не сверено',
      req: false,
      isLocal: true,
    },
  ]);

  const [equipmentRows, setEquipmentRows] = useState([
    { id: 1, name: 'Холодильник Bosch', model: 'Serie 4 KGN39 / Исправен, чистый', prov: '[Стр. 1, табл. строка 1]', verified: true },
    { id: 2, name: 'Стиральная машина LG', model: 'AI DD Inverter / Без повреждений', prov: '[Стр. 1, табл. строка 2]', verified: true },
    { id: 3, name: 'Сплит-система Daikin', model: 'Sensira FTXB25C / Исправен, пульт', prov: '[Стр. 1, табл. строка 3]', verified: false },
  ]);

  const filledCount = fields.filter((f) => f.val.trim().length > 0).length;
  const verifiedCount = fields.filter((f) => f.verified).length;

  const handleInsertFromMyData = (recTitle: string, recVal: string) => {
    if (recTitle.includes('Паспорт') || recTitle.includes('ФИО') || recTitle.includes('СНИЛС')) {
      setFields((prev) =>
        prev.map((f) => (f.name === 'Наймодатель' ? { ...f, val: 'Васильев Андрей Сергеевич' } : f))
      );
    } else if (recTitle.includes('Адрес')) {
      setFields((prev) =>
        prev.map((f) => (f.name === 'Адрес помещения' ? { ...f, val: recVal } : f))
      );
    }
    setIsMyDataOpen(false);
    showToast(`Реквизит «${recTitle}» успешно вставлен в документ!`, 'dataset');
  };

  const handleApplyTemplateDiff = () => {
    setIsDiffModalOpen(false);
    showToast('Схема шаблона синхронизирована! Добавлена таблица начислений.', 'dashboard_customize');
  };

  const handleDeleteField = () => {
    setFields((prev) => prev.filter((f) => f.id !== 'f6'));
    setIsDeleteFieldModalOpen(false);
    showToast('Локальное поле удалено из текущей карточки', 'delete');
  };

  const handleProceedToVerification = () => {
    setPipelineStep(6);
    setCurrentScreen('SCR-07');
    showToast('Переход к пошаговой сверке со сканом (SCR-07)', 'arrow_forward');
  };

  const handleProceedToPreSave = () => {
    setPipelineStep(7);
    setCurrentScreen('SCR-08');
    showToast('Переход к итоговому аудиту перед сохранением (SCR-08)', 'arrow_forward');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Stepper Pipeline */}
      <div className="w-full bg-[#ddeaf2] px-3 py-1.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[11px] overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[#6e7978]">1. Входящие → 2. Состав → 3. Предпроверка → 4. Классификация →</span>
          <span className="px-2 py-0.5 rounded bg-[#006763] text-white font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">edit_document</span>
            <span>5. Редактор данных (SCR-06)</span>
          </span>
          <span className="text-[#6e7978]">→ 6. Сверка (SCR-07) → 7. Итог (SCR-08)</span>
        </div>
        <span className="font-mono text-[#536166] shrink-0">Пакет #PK-8842-RU</span>
      </div>

      {/* Conflict Banner if Simulated */}
      {activeScenario === 'conflict' && (
        <div className="p-2.5 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] text-[12px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>
              <strong>Конфликт ревизий:</strong> локальная база обновлена внешним процессом в 14:26. Черновик в ОЗУ сохранён.
            </span>
          </div>
          <button
            onClick={() => showToast('Конфликт решён в пользу локального черновика')}
            className="px-2 py-1 bg-[#ba1a1a] text-white text-[11px] font-semibold rounded"
          >
            Оставить черновик
          </button>
        </div>
      )}

      {/* OCR Text Layer Drawer if Open */}
      {isOcrOpen && (
        <div className="p-3 rounded bg-white border border-[#006763] shadow-md flex flex-col gap-2 text-[12px]">
          <div className="flex items-center justify-between border-b border-[#d7e4ec] pb-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#006763]">
              <span className="material-symbols-outlined text-[16px]">document_scanner</span>
              <span>Слой распознанного текста OCR (Tesseract 5.3 Local) • Уверенность 98.4%</span>
            </div>
            <button onClick={() => setIsOcrOpen(false)} className="text-[#6e7978] hover:text-[#111d23]">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <p className="font-mono text-[11px] text-[#3e4948] bg-[#f4faff] p-2 rounded select-text">
            «ПРИЛОЖЕНИЕ № 1 К ДОГОВОРУ НАЙМА ЖИЛОГО ПОМЕЩЕНИЯ № 42... АКТ ПРИЁМА-ПЕРЕДАЧИ... 12 октября 2026 года... Наймодатель Васильев Андрей Сергеевич, Наниматель Смирнова Елена Игоревна...»
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                showToast('Пустые поля автоматически заполнены из OCR!', 'auto_fix_high');
                setIsOcrOpen(false);
              }}
              className="px-2.5 py-1 rounded bg-[#006763] text-white text-[11px] font-semibold"
            >
              Заполнить поля автоматически
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText('ПРИЛОЖЕНИЕ № 1 К ДОГОВОРУ НАЙМА...');
                showToast('Текст скопирован в буфер обмена');
              }}
              className="px-2.5 py-1 rounded bg-[#e3f0f8] text-[#111d23] text-[11px]"
            >
              Копировать текст
            </button>
          </div>
        </div>
      )}

      {/* DUAL PANEL WORKSPACE */}
      <div className="grid grid-cols-12 gap-3 items-start w-full">
        {/* LEFT PANEL: Document Source Viewer (6 Cols) */}
        <div className="col-span-12 xl:col-span-6 flex flex-col bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden">
          {/* Viewer Toolbar */}
          <div className="h-9 bg-[#e9f6fd] px-3 flex items-center justify-between border-b border-[#d7e4ec] text-[11px]">
            <div className="flex items-center gap-2">
              <select
                value={activePage}
                onChange={(e) => setActivePage(Number(e.target.value))}
                className="h-6 px-1.5 bg-white text-[#111d23] rounded border border-[#d7e4ec] font-medium cursor-pointer"
              >
                <option value={1}>Страница_01.jpg (Стр. 1 из 4)</option>
                <option value={2}>Страница_02.jpg (Стр. 2 из 4)</option>
                <option value={3}>Страница_03.jpg (Стр. 3 из 4)</option>
                <option value={4}>Приложение.pdf (Стр. 4 из 4)</option>
              </select>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center text-[#536166]"
                >
                  ‹
                </button>
                <span className="font-mono">{activePage} / 4</span>
                <button
                  onClick={() => setActivePage((p) => Math.min(4, p + 1))}
                  className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center text-[#536166]"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
              >
                -
              </button>
              <span className="font-mono text-[10px] w-9 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
              >
                +
              </button>
              <button
                onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                className="w-5 h-5 rounded hover:bg-[#ddeaf2] flex items-center justify-center border border-[#d7e4ec]"
                title="Повернуть"
              >
                <span className="material-symbols-outlined text-[13px]">rotate_right</span>
              </button>
            </div>
          </div>

          {/* Scanned Document Canvas */}
          <div className="p-4 bg-[#cfdce4] overflow-auto max-h-[720px] flex justify-center">
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-[500px] bg-[#fbfdfa] text-[#1a2327] shadow-md p-7 rounded-sm select-text font-serif leading-relaxed text-[12px]"
            >
              <div className="text-center mb-4 border-b border-[#d7e4ec] pb-2">
                <p className="text-[10px] font-mono uppercase text-[#6e7978]">
                  Приложение № 1 к Договору найма № 42
                </p>
                <h2 className="text-[13px] font-bold uppercase tracking-tight text-[#111d23] mt-1">
                  АКТ ПРИЁМА-ПЕРЕДАЧИ
                  <br />
                  ЖИЛОГО ПОМЕЩЕНИЯ И ИМУЩЕСТВА
                </h2>
              </div>

              <div className="flex justify-between items-center text-[11px] mb-3">
                <span>г. Санкт-Петербург</span>
                <span className="p-1 rounded bg-[#95f3eb]/40 text-[#006763] font-semibold border border-[#006763]/30">
                  «12» октября 2026 г.
                </span>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed">
                <p>
                  Мы, нижеподписавшиеся, Гражданин РФ{' '}
                  <mark className="bg-[#95f3eb]/50 px-1 py-0.5 rounded font-sans font-semibold">
                    Васильев Андрей Сергеевич
                  </mark>
                  , паспорт 40 14 № 891234, именуемый «Наймодатель», с одной стороны, и Гражданка РФ{' '}
                  <mark className="bg-[#95f3eb]/50 px-1 py-0.5 rounded font-sans font-semibold">
                    Смирнова Елена Игоревна
                  </mark>
                  , с другой стороны, составили настоящий{' '}
                  <mark className="bg-[#95f3eb]/70 font-semibold px-1 py-0.5 rounded text-[#00201e]">
                    Акт № АПП-42
                  </mark>{' '}
                  о нижеследующем:
                </p>
                <p>
                  1. Наймодатель передал, а Наниматель принял изолированное жилое помещение по адресу:{' '}
                  <mark className="bg-[#d6e5ec] px-1 py-0.5 rounded font-sans">
                    г. Санкт-Петербург, Московский пр., д. 182, кв. 42
                  </mark>
                  .
                </p>
                <p>
                  2. Помещение находится в исправном состоянии. Совместно переданы ключи:{' '}
                  <mark className="bg-[#fff3e0] text-[#e68a00] px-1 py-0.5 rounded font-sans font-medium">
                    2 комплекта ключей + электронный чип домофона
                  </mark>
                  .
                </p>
              </div>

              {/* Table in Document */}
              <div className="mt-3 overflow-hidden rounded border border-[#d7e4ec]">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="bg-[#e9f6fd] text-[#536166] font-sans font-semibold">
                    <tr>
                      <th className="p-1.5 w-6">№</th>
                      <th className="p-1.5">Наименование</th>
                      <th className="p-1.5">Модель</th>
                      <th className="p-1.5">Состояние</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d7e4ec]">
                    <tr className="bg-[#95f3eb]/10">
                      <td className="p-1.5">1</td>
                      <td className="p-1.5 font-semibold">Холодильник</td>
                      <td className="p-1.5">Bosch KGN39</td>
                      <td className="p-1.5">Исправен</td>
                    </tr>
                    <tr className="bg-[#95f3eb]/10">
                      <td className="p-1.5">2</td>
                      <td className="p-1.5 font-semibold">Стиральная машина</td>
                      <td className="p-1.5">LG AI DD Inverter</td>
                      <td className="p-1.5">Исправна</td>
                    </tr>
                    <tr>
                      <td className="p-1.5">3</td>
                      <td className="p-1.5 font-semibold">Кондиционер</td>
                      <td className="p-1.5">Daikin Sensira</td>
                      <td className="p-1.5">Пульт передан</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-4 mt-4 border-t border-[#d7e4ec] flex justify-between text-[10px] text-[#536166]">
                <span>Подпись Наймодателя: Васильев А.С.</span>
                <span>Подпись Нанимателя: Смирнова Е.И.</span>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="h-7 bg-[#e9f6fd] px-3 border-t border-[#d7e4ec] flex items-center justify-between text-[11px] text-[#536166]">
            <span>Оригинал: Read-Only • 300 DPI • Файл на диске не изменяется</span>
            <span className="font-mono text-[10px]">SHA-256: 4b29f0...c81e</span>
          </div>
        </div>

        {/* RIGHT PANEL: Structured Fields Editor (6 Cols) */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-2.5">
          {/* Header Card */}
          <div className="bg-white p-3.5 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[#536166] text-[10px] font-mono">
                    Шаблон: Акт приёма-передачи (v1.2)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#95f3eb] text-[#00201e] text-[10px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">lock_open</span>
                    {classificationData.zone === 'open' ? 'Зона: Open' : 'Зона: Secret'}
                  </span>
                </div>
                <h2 className="font-semibold text-[15px] text-[#111d23]">
                  {classificationData.title}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded bg-[#e9f6fd] text-[#006763] text-[10px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006763]" />
                  Черновик сохранён 14:22
                </span>
                <span className="text-[11px] text-[#536166]">
                  Заполнено: <strong>{filledCount} из {fields.length}</strong> · Сверено: <strong>{verifiedCount}</strong>
                </span>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#d7e4ec] text-[11px]">
              <button
                onClick={() => setIsMyDataOpen((prev) => !prev)}
                className="px-2 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#006763] font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">dataset</span>
                <span>Мои данные</span>
              </button>
              <button
                onClick={() => setIsDiffModalOpen((prev) => !prev)}
                className="px-2 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">dashboard_customize</span>
                <span>Шаблоны (диффы)</span>
              </button>
              <button
                onClick={() => setIsOcrOpen((prev) => !prev)}
                className="px-2 py-1 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">document_scanner</span>
                <span>OCR текст</span>
              </button>
              <button
                onClick={handleProceedToVerification}
                className="px-2.5 py-1 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs ml-auto transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">fact_check</span>
                <span>Сверка (SCR-07) →</span>
              </button>
            </div>
          </div>

          {/* Quick Insert from 'Мои данные' Tray */}
          {isMyDataOpen && (
            <div className="p-3 rounded bg-[#e3f0f8] border border-[#006763]/30 flex flex-col gap-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#006763] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">dataset</span>
                  <span>Быстрая вставка из профиля «Мои данные»:</span>
                </span>
                <button onClick={() => setIsMyDataOpen(false)} className="text-[#6e7978]">
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {myDataRecords.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => handleInsertFromMyData(rec.title, rec.val)}
                    className="p-2 bg-white rounded border border-[#d7e4ec] hover:border-[#006763] cursor-pointer flex items-center justify-between shadow-xs transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="font-medium text-[#111d23] truncate text-[11px]">{rec.title}</span>
                      <span className="font-mono text-[10px] text-[#536166] truncate">{rec.val}</span>
                    </div>
                    <button className="px-1.5 py-0.5 rounded bg-[#006763] text-white text-[10px]">
                      Вставить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Diff Preview Modal */}
          {isDiffModalOpen && (
            <div className="p-3 rounded bg-[#e3f0f8] border border-[#006763]/30 flex flex-col gap-2 text-[12px]">
              <div className="flex items-center justify-between font-semibold text-[#006763]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">difference</span>
                  <span>Диффы применения шаблона «Акт приёма-передачи расширенный»:</span>
                </span>
                <button onClick={() => setIsDiffModalOpen(false)} className="text-[#6e7978]">
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
              <div className="space-y-1">
                <div className="p-1.5 bg-white rounded flex items-center justify-between text-[11px]">
                  <span className="text-[#2e7d32] font-semibold">+ Добавится таблица «Показания счётчиков ИПУ»</span>
                  <span className="font-mono text-[9px] bg-[#e8f5e9] text-[#2e7d32] px-1 rounded">Новое</span>
                </div>
                <div className="p-1.5 bg-white rounded flex items-center justify-between text-[11px]">
                  <span>Поле «Комплекты ключей» будет сохранено как локальное</span>
                  <span className="font-mono text-[9px] bg-[#e3f0f8] text-[#536166] px-1 rounded">Без изменений</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsDiffModalOpen(false)}
                  className="px-2.5 py-1 rounded bg-white text-[#536166] text-[11px]"
                >
                  Отмена
                </button>
                <button
                  onClick={handleApplyTemplateDiff}
                  className="px-3 py-1 rounded bg-[#006763] text-white text-[11px] font-semibold"
                >
                  Применить изменения
                </button>
              </div>
            </div>
          )}

          {/* Delete Field Modal */}
          {isDeleteFieldModalOpen && (
            <div className="p-3 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] flex flex-col gap-2 text-[12px]">
              <div className="flex items-center justify-between font-bold">
                <span>Удалить поле «Комплекты ключей» из документа?</span>
                <button onClick={() => setIsDeleteFieldModalOpen(false)}>
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
              <p className="text-[11px]">
                Внимание: Введённое значение («2 комплекта ключей») и цитата со скана будут очищены. Поле шаблона не затронуто.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteFieldModalOpen(false)}
                  className="px-2.5 py-1 rounded bg-white text-[#111d23] text-[11px]"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteField}
                  className="px-3 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-semibold"
                >
                  Да, удалить поле
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Notion-style Card - Основные реквизиты */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#d7e4ec]">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
                <span className="material-symbols-outlined text-[#006763] text-[16px]">bookmark</span>
                <span>Секция 1: «Основные реквизиты»</span>
              </div>
              <span className="text-[10px] text-[#6e7978] uppercase font-mono">Шаблон v1.2</span>
            </div>

            <div className="space-y-2">
              {fields
                .filter((f) => !f.isLocal)
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-2 rounded bg-[#f4faff] border border-[#d7e4ec] hover:border-[#006763]/50 transition-colors flex flex-col gap-1 text-[12px]"
                  >
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[#111d23] flex items-center gap-1">
                        <span>{field.name}</span>
                        {field.req && <span className="text-[#ba1a1a] font-bold">*</span>}
                      </label>
                      <div className="flex items-center gap-1">
                        {field.verified ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-medium">
                            <span className="material-symbols-outlined text-[11px]">check_circle</span>
                            Сверено со сканом
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded bg-[#fff3e0] text-[#e68a00] text-[10px] font-medium">
                            <span className="material-symbols-outlined text-[11px]">pending</span>
                            Не сверено
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={field.val}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setFields((prev) =>
                          prev.map((f) => (f.id === field.id ? { ...f, val: nextVal, verified: false } : f))
                        );
                      }}
                      className="h-7 px-2 rounded bg-white text-[#111d23] border border-[#d7e4ec] text-[12px] focus:outline-none focus:border-[#006763]"
                    />
                    <div className="font-mono text-[10px] text-[#536166] truncate">{field.quote}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 2: Local Fields */}
          {fields.some((f) => f.isLocal) && (
            <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#d7e4ec]">
                <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
                  <span className="material-symbols-outlined text-[#006763] text-[16px]">extension</span>
                  <span>Локальные поля (только для этого документа)</span>
                </div>
                <button
                  onClick={() => setIsDeleteFieldModalOpen(true)}
                  className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded"
                  title="Удалить локальное поле"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>

              {fields
                .filter((f) => f.isLocal)
                .map((field) => (
                  <div key={field.id} className="p-2 rounded bg-[#f4faff] border border-[#d7e4ec] flex flex-col gap-1 text-[12px]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#111d23]">{field.name}</span>
                      <span className="text-[10px] text-[#e68a00] bg-[#fff3e0] px-1 rounded">Не сверено</span>
                    </div>
                    <input
                      type="text"
                      value={field.val}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setFields((prev) =>
                          prev.map((f) => (f.id === field.id ? { ...f, val: nextVal } : f))
                        );
                      }}
                      className="h-7 px-2 rounded bg-white text-[#111d23] border border-[#d7e4ec] text-[12px]"
                    />
                    <div className="font-mono text-[10px] text-[#536166]">{field.quote}</div>
                  </div>
                ))}
            </div>
          )}

          {/* Section 3: Airtable-style Equipment Table */}
          <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#d7e4ec]">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
                <span className="material-symbols-outlined text-[#006763] text-[16px]">table_chart</span>
                <span>Табличные данные: Передаваемое имущество</span>
              </div>
              <span className="font-mono text-[10px] text-[#536166] bg-[#e3f0f8] px-1.5 py-0.5 rounded">
                3 строки
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded border border-[#d7e4ec]">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-[#e9f6fd] text-[#536166] uppercase font-semibold h-7 border-b border-[#d7e4ec]">
                  <tr>
                    <th className="p-1.5 w-8 text-center">№</th>
                    <th className="p-1.5">Наименование</th>
                    <th className="p-1.5">Модель / Состояние</th>
                    <th className="p-1.5 text-right">Сверка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7e4ec]">
                  {equipmentRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#f4faff]">
                      <td className="p-1.5 text-center font-mono text-[#6e7978]">{row.id}</td>
                      <td className="p-1.5 font-semibold text-[#111d23]">{row.name}</td>
                      <td className="p-1.5 text-[#3e4948]">{row.model}</td>
                      <td className="p-1.5 text-right">
                        {row.verified ? (
                          <span className="px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] font-semibold text-[10px]">
                            Сверено
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-[#fff3e0] text-[#e68a00] font-semibold text-[10px]">
                            Не сверено
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Progression Bar */}
      <div className="sticky bottom-0 bg-[#ddeaf2] p-2.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[12px] shadow-sm">
        <button
          onClick={() => setCurrentScreen('SCR-05')}
          className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад к классификации (SCR-05)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[#536166] text-[11px] hidden md:inline">
            Сверка опциональна перед архивацией
          </span>
          <button
            onClick={() => showToast('Черновик сохранён в память (F10)')}
            className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Сохранить черновик (F10)</span>
          </button>
          <button
            onClick={handleProceedToPreSave}
            className="h-8 px-4 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Продолжить к сохранению (SCR-08)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
