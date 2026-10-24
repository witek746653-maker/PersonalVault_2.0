import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

interface VerificationField {
  id: number;
  label: string;
  normalizedValue: string;
  sourceQuote: string;
  sourceLocation: string;
  bbox: string;
  status: 'verified' | 'pending' | 'missing' | 'skipped' | 'changed';
  isRequired: boolean;
}

export const VerificationScreen: React.FC = () => {
  const {
    navigateTo,
    showToast
  } = useVault();

  const [activeStepId, setActiveStepId] = useState<number>(4);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>('');

  const [fields, setFields] = useState<VerificationField[]>([
    {
      id: 1,
      label: 'Номер акта',
      normalizedValue: '№ АПП-42',
      sourceQuote: '«составили настоящий акт № АПП-42»',
      sourceLocation: 'Стр. 1 · Заголовок',
      bbox: '[120, 80, 410, 110]',
      status: 'verified',
      isRequired: true
    },
    {
      id: 2,
      label: 'Дата составления',
      normalizedValue: '12.10.2026',
      sourceQuote: '«12 октября 2026 г.»',
      sourceLocation: 'Стр. 1 · Шапка',
      bbox: '[490, 80, 720, 110]',
      status: 'verified',
      isRequired: true
    },
    {
      id: 3,
      label: 'Наниматель',
      normalizedValue: 'Соколов Алексей Николаевич',
      sourceQuote: '«Наниматель Соколов Алексей Николаевич»',
      sourceLocation: 'Стр. 1 · Абзац 1',
      bbox: '[180, 240, 680, 280]',
      status: 'verified',
      isRequired: true
    },
    {
      id: 4,
      label: 'Адрес помещения',
      normalizedValue: 'г. Санкт-Петербург, Московский пр., д. 182, кв. 42',
      sourceQuote: '«г. Санкт-Петербург, Московский пр., д. 182, кв. 42»',
      sourceLocation: 'Стр. 1 · Абзац 2',
      bbox: '[184, 492, 790, 560]',
      status: 'pending',
      isRequired: true
    },
    {
      id: 5,
      label: 'Наймодатель',
      normalizedValue: 'Васильев Андрей Сергеевич',
      sourceQuote: '«Наймодатель Васильев Андрей Сергеевич»',
      sourceLocation: 'Стр. 1 · Преамбула',
      bbox: '[180, 200, 620, 235]',
      status: 'pending',
      isRequired: true
    },
    {
      id: 6,
      label: 'Комплекты ключей',
      normalizedValue: '2 комплекта + электронный чип',
      sourceQuote: '«в количестве 2 (два) комплекта»',
      sourceLocation: 'Стр. 1 · Пункт 3',
      bbox: '[210, 620, 690, 660]',
      status: 'pending',
      isRequired: false
    },
    {
      id: 7,
      label: 'Таблица оборудования',
      normalizedValue: '3 позиции (холодильник, стиральная машина, сплит-система)',
      sourceQuote: '«Холодильник Bosch, Стиральная машина LG, Daikin»',
      sourceLocation: 'Стр. 2 · Приложение',
      bbox: '[100, 720, 850, 940]',
      status: 'pending',
      isRequired: false
    }
  ]);

  const activeField = fields.find(f => f.id === activeStepId) || fields[0];

  const verifiedCount = fields.filter(f => f.status === 'verified').length;
  const skippedCount = fields.filter(f => f.status === 'skipped').length;
  const pendingCount = fields.filter(f => f.status === 'pending').length;

  const handleConfirm = () => {
    setFields(prev => prev.map(f => f.id === activeStepId ? { ...f, status: 'verified' } : f));
    showToast(`Поле «${activeField.label}» подтверждено (Сверено)`);
    // Move to next pending field
    const next = fields.find(f => f.id > activeStepId && f.status === 'pending');
    if (next) setActiveStepId(next.id);
  };

  const handleMissing = () => {
    setFields(prev => prev.map(f => f.id === activeStepId ? { ...f, status: 'missing' } : f));
    showToast(`Зафиксировано отсутствие поля «${activeField.label}»`);
    const next = fields.find(f => f.id > activeStepId && f.status === 'pending');
    if (next) setActiveStepId(next.id);
  };

  const handleSkip = () => {
    setFields(prev => prev.map(f => f.id === activeStepId ? { ...f, status: 'skipped' } : f));
    showToast(`Поле «${activeField.label}» пропущено`);
    const next = fields.find(f => f.id > activeStepId && f.status === 'pending');
    if (next) setActiveStepId(next.id);
  };

  const handleStartEdit = () => {
    setEditValue(activeField.normalizedValue);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setFields(prev => prev.map(f => f.id === activeStepId ? { ...f, normalizedValue: editValue, status: 'changed' } : f));
    setIsEditing(false);
    showToast(`Значение изменено. Требуется повторная сверка`);
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Breadcrumbs Track */}
      <div className="w-full bg-surface-container-lowest rounded-lg px-3 py-1.5 mb-2.5 border border-surface-container-highest shadow-xs flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-secondary min-w-0">
          <button onClick={() => navigateTo('vkhodyashchie')} className="hover:text-on-surface cursor-pointer">Входящие</button>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <button onClick={() => navigateTo('sostav')} className="hover:text-on-surface cursor-pointer">Состав</button>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <button onClick={() => navigateTo('predproverka')} className="hover:text-on-surface cursor-pointer">Предпроверка</button>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <button onClick={() => navigateTo('klassifikaciya')} className="hover:text-on-surface cursor-pointer">Классификация</button>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <button onClick={() => navigateTo('redaktor')} className="hover:text-on-surface cursor-pointer">Редактор (SCR-06)</button>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[14px]">find_in_page</span>
            Сверка со сканом (SCR-07)
          </span>
          <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
          <button onClick={() => navigateTo('itog')} className="text-secondary hover:text-on-surface cursor-pointer">Итог (SCR-08)</button>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-code">
          <span className="text-primary font-semibold">DOC-2026-APP-42</span>
        </div>
      </div>

      {/* Main Dual-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start w-full">
        {/* LEFT PANEL: Focused Source Viewer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden flex flex-col">
            <div className="h-8 px-3 bg-surface-container flex items-center justify-between text-[11px] font-semibold border-b border-surface-container-highest">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">description</span>
                <span>Страница_01.jpg (Стр. 1 из 4)</span>
              </div>
              <span className="font-code text-secondary">{activeField.bbox}</span>
            </div>

            {/* Scan Viewport with BBOX Focus */}
            <div className="relative bg-surface-dim p-4 flex flex-col items-center justify-center overflow-hidden min-h-[300px]">
              <div className="w-full bg-white shadow-sm p-4 rounded text-gray-900 font-serif text-[11px] leading-relaxed border border-surface-container-highest select-text">
                <div className="text-center font-bold text-[12px] mb-2 uppercase">
                  АКТ ПРИЕМА-ПЕРЕДАЧИ ЖИЛОГО ПОМЕЩЕНИЯ
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-2 border-b border-gray-200 pb-1">
                  <span>г. Санкт-Петербург</span>
                  <span>12 октября 2026 г.</span>
                </div>
                <p className="mb-2 text-justify">
                  1. Гражданин Васильев Андрей Сергеевич, именуемый «Наймодатель», передал, а гражданка Смирнова Елена Игоревна приняла помещение:
                </p>

                {/* Highlight Focus Box */}
                <div className="relative my-2 p-2 rounded bg-primary-fixed/20 ring-2 ring-primary">
                  <div className="absolute -top-2.5 right-1 px-1.5 py-0.2 bg-primary text-on-primary text-[9px] font-bold rounded flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">crop_free</span>
                    <span>Фокус поля #{activeField.id}</span>
                  </div>
                  <p className="font-sans font-medium text-gray-900 bg-primary-fixed/30 p-1 rounded">
                    {activeField.sourceQuote}
                  </p>
                </div>

                <p className="text-gray-600 text-[10px]">
                  2. Санитарно-техническое состояние квартиры признано сторонами удовлетворительным.
                </p>
              </div>
            </div>

            {/* Optical Zoom Crop */}
            <div className="p-3 bg-surface-container-low border-t border-surface-container-highest flex flex-col gap-1.5 text-[11px]">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">loupe</span>
                  Оптический кроп высокого контраста (2.4x)
                </span>
                <span className="font-code text-outline">DPI: 300</span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded border border-surface-container-highest flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[10px] text-primary font-code">{activeField.sourceLocation}:</span>
                  <span className="font-serif text-[13px] font-medium text-on-surface truncate">
                    {activeField.sourceQuote}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeField.sourceQuote);
                    showToast('Цитата скопирована в буфер');
                  }}
                  className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">content_copy</span>
                  <span>Копия</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Verification Step-by-Step Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          {/* Progress Card */}
          <div className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[14px] text-on-surface">Пошаговая сверка реквизитов с первоисточником</h2>
                <div className="text-[11px] text-secondary">Контроль соответствия параметров бумажному оригиналу</div>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-bold text-[11px]">
                Шаг {activeField.id} из {fields.length}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-on-surface">
                  Сверено {verifiedCount} из {fields.length} значений ({Math.round((verifiedCount / fields.length) * 100)}%)
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-medium">
                  <span className="text-primary">{verifiedCount} подтверждено</span>
                  <span className="text-outline">•</span>
                  <span className="text-secondary">{skippedCount} пропущено</span>
                  <span className="text-outline">•</span>
                  <span className="text-outline">{pendingCount} ожидает</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: `${(verifiedCount / fields.length) * 100}%` }}></div>
                <div className="bg-secondary h-full" style={{ width: `${(skippedCount / fields.length) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Active Field Card */}
          <div className="bg-surface-container-lowest rounded-lg p-3.5 border border-surface-container-highest shadow-xs flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-primary text-on-primary font-code text-[10px] font-bold">
                    #{activeField.id}
                  </span>
                  <h3 className="font-bold text-[14px] text-on-surface">{activeField.label}</h3>
                  {activeField.isRequired && (
                    <span className="px-1.5 py-0.2 rounded bg-error-container text-on-error-container text-[10px] font-medium">
                      Обязательное
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-secondary mt-0.5">{activeField.sourceLocation}</span>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                activeField.status === 'verified'
                  ? 'bg-primary-fixed/40 text-on-primary-fixed'
                  : activeField.status === 'missing'
                  ? 'bg-secondary-container text-secondary'
                  : 'bg-surface-container text-secondary'
              }`}>
                {activeField.status === 'verified' ? '✔ Сверено со сканом' :
                 activeField.status === 'missing' ? '⊘ Проверено: отсутствует' :
                 '⏳ Ожидает решения'}
              </span>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
              <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest flex flex-col justify-between gap-1">
                <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
                  Введённое значение:
                </span>
                <div className="font-bold text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-highest">
                  {activeField.normalizedValue}
                </div>
                <span className="text-[10px] text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check</span> Формат проверен
                </span>
              </div>

              <div className="p-2.5 rounded bg-primary-fixed/20 border border-primary/20 flex flex-col justify-between gap-1">
                <span className="text-[10px] font-semibold text-on-primary-fixed uppercase tracking-wider">
                  Цитата из источника:
                </span>
                <div className="font-serif italic text-on-surface bg-surface-container-lowest p-2 rounded border border-surface-container-highest">
                  {activeField.sourceQuote}
                </div>
                <span className="text-[10px] text-primary font-semibold">Точное совпадение (100%)</span>
              </div>
            </div>

            {/* Inline Editor */}
            {isEditing && (
              <div className="p-2.5 rounded bg-surface-container-high border border-primary/40 flex flex-col gap-1.5 text-[12px]">
                <label className="font-semibold text-on-surface">Исправление значения реквизита:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="flex-1 h-7 px-2 bg-surface-container-lowest text-on-surface rounded border border-surface-container-highest outline-none text-[12px]"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="h-7 px-3 bg-primary text-on-primary rounded font-semibold text-[11px] cursor-pointer"
                  >
                    Применить
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="h-7 px-2.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-[11px] cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons for Current Field */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-surface-container">
              <button
                onClick={handleConfirm}
                className="h-7 px-3 rounded bg-primary hover:bg-primary-container text-on-primary font-semibold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">done_all</span>
                <span>✔ Подтвердить сверку (Сверено)</span>
              </button>

              <button
                onClick={handleStartEdit}
                className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>✎ Исправить</span>
              </button>

              <button
                onClick={handleMissing}
                className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-secondary hover:text-error text-[11px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[15px]">block</span>
                <span>⊘ Отсутствует</span>
              </button>

              <button
                onClick={handleSkip}
                className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-secondary text-[11px] flex items-center gap-1 ml-auto cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[15px]">skip_next</span>
                <span>Пропустить</span>
              </button>
            </div>
          </div>

          {/* Queue of All 7 Fields */}
          <div className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container-highest shadow-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container text-[11px]">
              <span className="font-semibold text-secondary uppercase tracking-wider">
                Очередь полей документа ({fields.length} параметров)
              </span>
              <span className="text-outline">Кликните по строке для перехода</span>
            </div>

            <div className="flex flex-col gap-1">
              {fields.map(f => {
                const isSelected = f.id === activeStepId;
                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveStepId(f.id)}
                    className={`h-7 px-2 rounded flex items-center justify-between text-[11px] cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-fixed/30 font-bold border border-primary/30'
                        : 'hover:bg-surface-container-low bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-1 rounded text-[9px] font-bold ${
                        f.status === 'verified' ? 'bg-primary-fixed text-on-primary-fixed' :
                        f.status === 'missing' ? 'bg-secondary-container text-secondary' :
                        'bg-surface-container text-secondary'
                      }`}>
                        {f.status === 'verified' ? 'Сверено' : f.status === 'missing' ? 'Отсутствует' : 'Ожидает'}
                      </span>
                      <span className="text-secondary font-medium shrink-0">#{f.id} {f.label}:</span>
                      <span className="font-code text-on-surface truncate">{f.normalizedValue}</span>
                    </div>
                    <span className="text-[10px] text-outline font-code">{f.sourceLocation}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-[210px] right-0 z-30 h-11 bg-surface-container-high border-t border-surface-container-highest px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigateTo('redaktor')}
          className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>← Вернуться в редактор (SCR-06)</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-secondary hidden md:inline">
            Разрешён переход с частичной сверкой
          </span>

          <button
            onClick={() => navigateTo('itog')}
            className="h-7 px-4 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Завершить сверку и перейти к итогам (SCR-08)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
