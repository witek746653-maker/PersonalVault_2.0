import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const DataEditorScreen: React.FC = () => {
  const {
    navigateTo,
    processingSession,
    myData,
    showToast
  } = useVault();

  const [docNumber, setDocNumber] = useState('№ АПП-42');
  const [docDate, setDocDate] = useState('2026-10-12');
  const [landlord, setLandlord] = useState('Васильев Андрей Сергеевич');
  const [tenant, setTenant] = useState('Соколов Алексей Николаевич');
  const [address, setAddress] = useState('г. Санкт-Петербург, Московский пр., д. 182, кв. 42');
  const [keysField, setKeysField] = useState('2 комплекта ключей + электронный чип домофона');

  const [isMyDataModalOpen, setIsMyDataModalOpen] = useState(false);
  const [isOcrDrawerOpen, setIsOcrDrawerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleInsertFromMyData = (val: string, target: 'landlord' | 'address') => {
    if (target === 'landlord') setLandlord(val);
    if (target === 'address') setAddress(val);
    setIsMyDataModalOpen(false);
    showToast(`Значение «${val}» вставлено в реквизит`);
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Workflow Stepper Strip */}
      <div className="w-full bg-surface-container-high px-3 py-1.5 rounded-lg flex items-center justify-between mb-2 text-[11px] border border-surface-container-highest">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
          <button onClick={() => navigateTo('vkhodyashchie')} className="text-secondary hover:text-on-surface flex items-center gap-1 shrink-0 cursor-pointer">
            1. Входящие <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </button>
          <button onClick={() => navigateTo('sostav')} className="text-secondary hover:text-on-surface flex items-center gap-1 shrink-0 cursor-pointer">
            2. Состав <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </button>
          <button onClick={() => navigateTo('predproverka')} className="text-secondary hover:text-on-surface flex items-center gap-1 shrink-0 cursor-pointer">
            3. Предпроверка <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </button>
          <button onClick={() => navigateTo('klassifikaciya')} className="text-secondary hover:text-on-surface flex items-center gap-1 shrink-0 cursor-pointer">
            4. Классификация <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </button>
          <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold flex items-center gap-1 shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[13px]">edit_document</span> 5. Редактор данных (SCR-06)
          </span>
          <button onClick={() => navigateTo('sverka')} className="text-secondary hover:text-on-surface flex items-center gap-1 shrink-0 cursor-pointer">
            <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span> 6. Сверка (SCR-07)
          </button>
          <button onClick={() => navigateTo('itog')} className="text-secondary hover:text-on-surface flex items-center gap-1 shrink-0 cursor-pointer">
            <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span> 7. Итог (SCR-08)
          </button>
        </div>
        <span className="font-code text-[11px] text-secondary shrink-0">Пакет #PK-8842-RU</span>
      </div>

      {/* OCR Drawer Overlay */}
      {isOcrDrawerOpen && (
        <div className="w-full bg-surface-container-lowest p-3 rounded-lg mb-2.5 shadow-md flex flex-col gap-1.5 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-primary">text_snippet</span>
              <span className="font-bold text-[12px] text-on-surface">Слой распознанного текста (OCR Local Engine)</span>
              <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[10px]">
                Точность 98.4%
              </span>
            </div>
            <button onClick={() => setIsOcrDrawerOpen(false)} className="text-secondary hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <p className="text-[11px] text-secondary font-code bg-surface-container-low p-2 rounded leading-relaxed">
            «ПРИЛОЖЕНИЕ № 1 К ДОГОВОРУ НАЙМА ЖИЛОГО ПОМЕЩЕНИЯ № 42... АКТ ПРИЁМА-ПЕРЕДАЧИ... 12 октября 2026 года... Наймодатель Васильев А.С., Наниматель Соколов А.Н... адрес: г. Санкт-Петербург, Московский пр., д. 182, кв. 42... ключи: 2 комплекта...»
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                showToast('Поля автоматически сопоставлены с текстом');
                setIsOcrDrawerOpen(false);
              }}
              className="px-2.5 py-1 rounded bg-primary text-on-primary text-[11px] font-semibold hover:bg-primary-container cursor-pointer shadow-xs"
            >
              Заполнить пустые поля автоматически
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText('ПРИЛОЖЕНИЕ № 1 К ДОГОВОРУ НАЙМА ЖИЛОГО ПОМЕЩЕНИЯ № 42...');
                showToast('Текст скопирован в буфер');
              }}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] cursor-pointer"
            >
              Копировать полный текст
            </button>
          </div>
        </div>
      )}

      {/* Main Dual-Panel Workspace */}
      <div className="grid grid-cols-12 gap-3 w-full items-start">
        {/* LEFT PANEL: Source Viewer */}
        <div className="col-span-12 xl:col-span-6 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden">
          <div className="h-9 bg-surface-container-high px-3 flex items-center justify-between border-b border-surface-container-highest shrink-0 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">image</span>
              <span className="font-semibold text-on-surface">Страница_01.jpg (Стр. 1 из 4)</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(60, prev - 15))}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-container text-secondary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
              </button>
              <span className="font-code px-1 text-on-surface font-semibold">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-container text-secondary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-1.5 py-0.5 rounded bg-surface-container text-secondary text-[10px] ml-1"
              >
                100%
              </button>
            </div>
          </div>

          {/* Paper Mockup */}
          <div className="p-4 bg-surface-container-low overflow-y-auto max-h-[700px] flex justify-center">
            <div
              className="relative w-full max-w-[500px] bg-white text-[#1a2327] shadow-sm p-6 rounded font-serif text-[11px] leading-relaxed border border-surface-container-highest"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <div className="text-center mb-3">
                <p className="text-[10px] uppercase text-secondary font-sans mb-0.5">
                  Приложение № 1 к Договору найма № 42
                </p>
                <h1 className="text-[13px] font-bold uppercase tracking-tight">
                  АКТ ПРИЁМА-ПЕРЕДАЧИ ЖИЛОГО ПОМЕЩЕНИЯ И ИМУЩЕСТВА
                </h1>
              </div>

              <div className="flex justify-between items-center text-[10.5px] mb-2 pb-1 border-b border-gray-200">
                <span>г. Санкт-Петербург</span>
                <span className="p-0.5 rounded bg-primary-fixed/60 text-on-primary-fixed font-semibold">
                  «12» октября 2026 г.
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <p>
                  Мы, нижеподписавшиеся, Гражданин РФ{' '}
                  <mark className="bg-primary-fixed/40 px-1 py-0.5 rounded font-sans">{landlord}</mark>,
                  с одной стороны, и Гражданка РФ{' '}
                  <mark className="bg-primary-fixed/40 px-1 py-0.5 rounded font-sans">{tenant}</mark>,
                  с другой стороны, составили настоящий{' '}
                  <mark className="bg-primary-fixed/60 font-semibold px-1 py-0.5 rounded">Акт {docNumber}</mark>.
                </p>
                <p>
                  1. Помещение расположено по адресу:{' '}
                  <mark className="bg-secondary-container px-1 py-0.5 rounded font-sans">{address}</mark>.
                </p>
                <p>
                  2. Одновременно с помещением переданы:{' '}
                  <mark className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-sans">{keysField}</mark>,
                  а также бытовая техника (холодильник Bosch, стиральная машина LG).
                </p>
              </div>
            </div>
          </div>

          <div className="h-7 bg-surface-container-high px-3 flex items-center justify-between text-[10px] text-secondary border-t border-surface-container-highest font-code">
            <span>Оригинал: Read-Only Lock</span>
            <span>SHA-256: 4b29f0...c81e</span>
          </div>
        </div>

        {/* RIGHT PANEL: Structured Editor */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-2.5">
          {/* Header Card */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[10px] font-semibold">
                    Шаблон: Акт приёма-передачи (v1.2)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                    Зона: {processingSession.zone === 'secret' ? 'Secret' : 'Open'}
                  </span>
                </div>
                <h2 className="text-[15px] font-bold text-on-surface">
                  {processingSession.workName}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-secondary font-code flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Черновик сохранён в SQLite
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-medium">Заполнено: 4 из 6</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-600/30">Не сверен: 2 из 6</span>
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-surface-container">
              <button
                onClick={() => showToast('Форма добавления нового поля открыта')}
                className="h-7 px-2 rounded bg-primary text-on-primary font-semibold text-[11px] flex items-center gap-1 hover:bg-primary-container shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Поле
              </button>
              <button
                onClick={() => setIsMyDataModalOpen(true)}
                className="h-7 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">dataset</span> Мои данные
              </button>
              <button
                onClick={() => setIsOcrDrawerOpen(prev => !prev)}
                className="h-7 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">document_scanner</span> Расшифровка
              </button>
              <button
                onClick={() => navigateTo('sverka')}
                className="h-7 px-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[14px]">fact_check</span> Сверка (F05)
              </button>
              <button
                onClick={() => showToast('Черновик успешно сохранён (F10)', 'save')}
                className="h-7 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center gap-1 ml-auto cursor-pointer border border-surface-container-highest"
              >
                <span className="material-symbols-outlined text-[14px]">save</span> Сохранить
              </button>
            </div>
          </div>

          {/* Section 1: Main attributes */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container">
              <div className="flex items-center gap-1.5 font-bold text-[12px]">
                <span className="material-symbols-outlined text-[16px] text-primary">bookmark</span>
                <span>Раздел «Основные реквизиты»</span>
              </div>
              <span className="text-[10px] text-secondary uppercase font-code">Шаблон v1.2</span>
            </div>

            <div className="space-y-2 text-[12px]">
              {/* Field 1: Номер акта */}
              <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Номер акта *</label>
                  <span className="px-1.5 py-0.2 rounded bg-primary-fixed/40 text-on-primary-fixed text-[10px] font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px] text-primary">verified</span> Сверено
                  </span>
                </div>
                <input
                  type="text"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  className="w-full h-7 px-2 rounded bg-surface-container-lowest text-on-surface font-code text-[11px] outline-none border border-surface-container-highest"
                />
              </div>

              {/* Field 2: Дата составления */}
              <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Дата составления *</label>
                  <span className="px-1.5 py-0.2 rounded bg-primary-fixed/40 text-on-primary-fixed text-[10px] font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px] text-primary">verified</span> Сверено
                  </span>
                </div>
                <input
                  type="date"
                  value={docDate}
                  onChange={e => setDocDate(e.target.value)}
                  className="w-full h-7 px-2 rounded bg-surface-container-lowest text-on-surface font-code text-[11px] outline-none border border-surface-container-highest"
                />
              </div>

              {/* Field 3: Наймодатель */}
              <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Наймодатель</label>
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-600/30 text-[10px]">
                    Не сверено
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={landlord}
                    onChange={e => setLandlord(e.target.value)}
                    className="flex-1 h-7 px-2 rounded bg-surface-container-lowest text-on-surface text-[12px] outline-none border border-surface-container-highest"
                  />
                  <button
                    onClick={() => navigateTo('sverka')}
                    className="h-7 px-2 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">verified</span> Сверить
                  </button>
                </div>
              </div>

              {/* Field 4: Наниматель */}
              <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Наниматель</label>
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-600/30 text-[10px]">
                    Не сверено
                  </span>
                </div>
                <input
                  type="text"
                  value={tenant}
                  onChange={e => setTenant(e.target.value)}
                  className="w-full h-7 px-2 rounded bg-surface-container-lowest text-on-surface text-[12px] outline-none border border-surface-container-highest"
                />
              </div>

              {/* Field 5: Адрес помещения */}
              <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-on-surface">Адрес помещения *</label>
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-600/30 text-[10px]">
                    Не сверено
                  </span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full h-7 px-2 rounded bg-surface-container-lowest text-on-surface text-[12px] outline-none border border-surface-container-highest"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Local Fields */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container">
              <div className="flex items-center gap-1.5 font-bold text-[12px]">
                <span className="material-symbols-outlined text-[16px] text-primary">extension</span>
                <span>Раздел «Локальные поля (только для этого документа)»</span>
              </div>
              <span className="text-[10px] text-secondary">Не меняет шаблон</span>
            </div>

            <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Комплекты ключей</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-600/30 text-[10px]">
                  Не сверено
                </span>
              </div>
              <input
                type="text"
                value={keysField}
                onChange={e => setKeysField(e.target.value)}
                className="w-full h-7 px-2 rounded bg-surface-container-lowest text-on-surface text-[12px] outline-none border border-surface-container-highest"
              />
            </div>

            <button
              onClick={() => showToast('Новое локальное поле добавлено')}
              className="w-full py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Добавить локальное поле
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-[210px] right-0 z-30 h-11 bg-surface-container-high border-t border-surface-container-highest px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigateTo('klassifikaciya')}
          className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад к классификации (SCR-05)</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-secondary hidden md:inline">Сверка опциональна перед архивацией</span>

          <button
            onClick={() => navigateTo('sverka')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-primary font-semibold text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[15px]">fact_check</span>
            <span>Сверка со сканом (SCR-07)</span>
          </button>

          <button
            onClick={() => navigateTo('itog')}
            className="h-7 px-4 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Продолжить к сохранению (SCR-08)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Quick Insert from My Data Modal */}
      {isMyDataModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsMyDataModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-1.5 font-bold text-[13px] text-primary">
                <span className="material-symbols-outlined text-[18px]">dataset</span>
                <span>Быстрая вставка из профиля «Мои данные»</span>
              </div>
              <button onClick={() => setIsMyDataModalOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <p className="text-[12px] text-secondary">
              Выберите верифицированный реквизит для мгновенной подстановки в форму:
            </p>
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {myData.map(item => (
                <div
                  key={item.id}
                  className="p-2 rounded bg-surface-container-low hover:bg-surface-container flex items-center justify-between transition-colors border border-surface-container-highest"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold text-[12px] text-on-surface truncate">{item.title}</span>
                    <span className="font-code text-[11px] text-primary truncate">{item.val}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleInsertFromMyData(item.val, item.type === 'address' ? 'address' : 'landlord')}
                      className="px-2.5 py-1 rounded bg-primary text-on-primary text-[10px] font-bold hover:bg-primary-container cursor-pointer shadow-xs"
                    >
                      Вставить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
