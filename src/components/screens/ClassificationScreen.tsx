import React from 'react';
import { useVault } from '../../context/VaultContext';
import { StorageZone } from '../../types/vault';

export const ClassificationScreen: React.FC = () => {
  const {
    navigateTo,
    processingSession,
    updateProcessingSession,
    isVeraCryptMounted,
    showToast
  } = useVault();

  // Dynamic preview path calculation
  const zonePrefix = processingSession.zone === 'open' ? 'Open' : (isVeraCryptMounted ? 'Secret' : 'Secret [Заблокировано]');
  let yearPart = '2026';
  if (processingSession.dateMode === 'unknown') {
    yearPart = 'Дата неизвестна';
  } else if (processingSession.dateMode === 'deferred') {
    yearPart = 'Не обработано';
  } else if (processingSession.dateValue) {
    const parts = processingSession.dateValue.split('.');
    if (parts.length === 3 && parts[2]) yearPart = parts[2];
  }

  const suffix = processingSession.isDraftTitle ? ' [ЧЕРНОВИК]' : '';
  const calculatedPath = `${zonePrefix} → ${processingSession.category} → ${yearPart} → PV-0042 ${processingSession.workName}${suffix}.pdf`;

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Stepper Widget */}
      <div className="bg-surface-container-lowest rounded-lg p-3 mb-2.5 border border-surface-container-highest shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
            <h1 className="font-bold text-[13px] text-on-surface">
              Подготовка документов: Этап 4 из 4 — Классификация
            </h1>
            <span className="text-[11px] text-secondary">Назначение зоны хранения, типа и метаданных</span>
          </div>
          <div className="font-code text-[11px] text-secondary bg-surface-container px-2 py-0.5 rounded">
            SCR-05
          </div>
        </div>

        {/* Stepper Steps */}
        <div className="grid grid-cols-5 gap-1.5 pt-1 text-[11px]">
          <button
            onClick={() => navigateTo('vkhodyashchie')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-secondary line-through opacity-80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px] text-primary">check_circle</span>
            <span>1. Входящие</span>
          </button>

          <button
            onClick={() => navigateTo('sostav')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-secondary line-through opacity-80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px] text-primary">check_circle</span>
            <span>2. Состав</span>
          </button>

          <button
            onClick={() => navigateTo('predproverka')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-secondary line-through opacity-80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px] text-primary">check_circle</span>
            <span>3. Предпроверка</span>
          </button>

          <div className="flex items-center justify-between px-2.5 py-1 rounded bg-primary text-on-primary font-bold shadow-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">tune</span>
              <span>4. Классификация</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
          </div>

          <button
            onClick={() => navigateTo('redaktor')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest text-secondary hover:text-on-surface cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[13px]">edit_document</span>
            <span>Редактор (SCR-06)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left 35% / Right 65% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: Preview & Destination Path (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container">
              <div className="flex items-center gap-1.5 font-bold text-[13px]">
                <span className="material-symbols-outlined text-primary text-[17px]">draft</span>
                <span>Документ #PV-0042</span>
              </div>
              <span className="font-code text-[11px] px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container">
                4.8 МБ
              </span>
            </div>

            {/* Thumbnail Mockup */}
            <div className="relative w-full aspect-[3/4] max-h-56 bg-surface-container-low rounded overflow-hidden flex flex-col items-center justify-center p-2 border border-surface-container-highest">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmOn8shvMmaW46wp0bmnS-3fYfHr0meVhOoNLPCwK2JAQfn0gDJLzdNrr29DElHoZZEDLourYrLoBQSWIIbsxyS7xsZOp22YwwvL2lbY7v7B487mzWC80ar11hYg5HYUixbvsnuSZcqrQCqHrQiS5qMxGRdDEq4kZAcLrG4G7j_MUWA1DcUtuCz7A8R_VDgjRMiymOWLXnwF_tq6hYCiGP8vokNhJ8aFOSUK2l_1MXfNeBqPP-wU9NvA"
                alt="Скан"
                className="w-full h-full object-cover rounded opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-2">
                <span className="px-1.5 py-0.5 bg-inverse-surface/90 text-inverse-on-surface font-code text-[9px] rounded">
                  Стр. 1 из {processingSession.files.length} • 300 DPI
                </span>
              </div>
            </div>

            {/* Destination Path Preview Box */}
            <div className="flex flex-col gap-1 p-2 bg-surface-container rounded border border-surface-container-highest">
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary">folder_open</span>
                Предпросмотр назначения в архиве:
              </span>
              <div className="p-1.5 rounded bg-surface-container-lowest font-code text-[11px] text-primary break-all flex items-start gap-1 border border-surface-container-highest">
                <span className="material-symbols-outlined text-[13px] text-secondary shrink-0 mt-0.5">
                  {processingSession.zone === 'secret' ? 'lock' : 'lock_open'}
                </span>
                <span>{calculatedPath}</span>
              </div>
            </div>

            <div className="p-2 rounded bg-surface-container-high text-on-surface text-[11px] flex items-start gap-1.5">
              <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">info</span>
              <div>
                <strong className="text-primary font-semibold">Полнота реквизитов:</strong> Документ готов к сохранению. Все недостающие поля можно дозаполнить на этапе детального редактора SCR-06.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Classification Form (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <form
            onSubmit={e => e.preventDefault()}
            className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-lg border border-surface-container-highest shadow-xs text-[12px]"
          >
            {/* 1. Storage Zone */}
            <div className="flex flex-col gap-1.5 p-3 bg-surface-container-low rounded-lg border border-surface-container-highest">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[13px] text-on-surface flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>1. Зона хранения *</span>
                </label>
                <span className="text-[11px] text-secondary">Режим приватности и шифрования</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-0.5 bg-surface-container rounded">
                <button
                  type="button"
                  onClick={() => updateProcessingSession({ zone: 'open' })}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-semibold text-[12px] transition-all cursor-pointer ${
                    processingSession.zone === 'open'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">lock_open</span>
                  <span>Открытое хранилище (Open)</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateProcessingSession({ zone: 'secret' })}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-semibold text-[12px] transition-all cursor-pointer ${
                    processingSession.zone === 'secret'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed shadow-xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-error">lock</span>
                  <span>Секретное (Secret VeraCrypt)</span>
                </button>
              </div>

              {!isVeraCryptMounted && processingSession.zone === 'secret' && (
                <div className="p-2 bg-error-container text-on-error-container rounded text-[11px] flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[14px]">key_off</span>
                  <span>Том VeraCrypt не смонтирован. Подключите том в заголовке окна для записи в Secret зону.</span>
                </div>
              )}
            </div>

            {/* 2. Category & Doc Type */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[13px] text-on-surface flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>2. Категория и Тип документа</span>
                </label>
                <span className="text-[11px] text-outline">Определяет рубрикатор и дерево папок</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-secondary">Категория архива</label>
                  <select
                    value={processingSession.category}
                    onChange={e => updateProcessingSession({ category: e.target.value })}
                    className="h-8 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest cursor-pointer"
                  >
                    <option value="Жильё">Жильё</option>
                    <option value="Коммунальные">Коммунальные</option>
                    <option value="Здоровье">Здоровье</option>
                    <option value="Финансы">Финансы</option>
                    <option value="Личные документы">Личные документы</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-secondary">Тип документа</label>
                  <select
                    value={processingSession.docType}
                    onChange={e => updateProcessingSession({ docType: e.target.value })}
                    className="h-8 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest cursor-pointer"
                  >
                    <option value="Акт приёма-передачи">Акт приёма-передачи</option>
                    <option value="Договор найма">Договор найма</option>
                    <option value="Квитанция об оплате">Квитанция об оплате</option>
                    <option value="Справка">Справка</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Document Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[13px] text-on-surface flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>3. Название документа</span>
                </label>
                <span className="text-[11px] text-outline">Имя файла и заголовка в реестре</span>
              </div>

              <input
                type="text"
                value={processingSession.workName}
                onChange={e => updateProcessingSession({ workName: e.target.value })}
                className="w-full h-8 px-2.5 rounded bg-surface-container-low text-on-surface font-medium outline-none focus:ring-1 focus:ring-primary border border-surface-container-highest"
              />

              <div className="flex items-center gap-4 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <input
                    type="radio"
                    name="title-status"
                    checked={!processingSession.isDraftTitle}
                    onChange={() => updateProcessingSession({ isDraftTitle: false })}
                    className="accent-primary"
                  />
                  <span>Принять как окончательное название</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <input
                    type="radio"
                    name="title-status"
                    checked={processingSession.isDraftTitle}
                    onChange={() => updateProcessingSession({ isDraftTitle: true })}
                    className="accent-primary"
                  />
                  <span className="text-secondary">Использовать как временное черновое [DRAFT]</span>
                </label>
              </div>
            </div>

            {/* 4. Document Date (3 distinct modes) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[13px] text-on-surface flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>4. Дата документа</span>
                </label>
                <span className="text-[11px] text-outline">3 раздельных режима</span>
              </div>

              <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-surface-container-highest">
                <label className="flex items-center justify-between p-1 rounded hover:bg-surface-container cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="date-mode"
                      checked={processingSession.dateMode === 'concrete'}
                      onChange={() => updateProcessingSession({ dateMode: 'concrete' })}
                      className="accent-primary"
                    />
                    <span className="font-medium text-[12px]">Указать конкретную дату документа:</span>
                  </div>
                  <input
                    type="text"
                    disabled={processingSession.dateMode !== 'concrete'}
                    value={processingSession.dateValue}
                    onChange={e => updateProcessingSession({ dateValue: e.target.value })}
                    className="w-32 h-6 px-2 rounded bg-surface-container-lowest font-code text-[11px] text-center border border-surface-container-highest disabled:opacity-40"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded hover:bg-surface-container cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="date-mode"
                      checked={processingSession.dateMode === 'unknown'}
                      onChange={() => updateProcessingSession({ dateMode: 'unknown' })}
                      className="accent-primary"
                    />
                    <div>
                      <span className="font-medium text-[12px]">Дата неизвестна (осознанный выбор)</span>
                      <span className="text-[10px] text-secondary block">В первоисточнике отсутствует или повреждена</span>
                    </div>
                  </div>
                  <span className="font-code text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-secondary">[UNDATED]</span>
                </label>

                <label className="flex items-center justify-between p-1 rounded hover:bg-surface-container cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="date-mode"
                      checked={processingSession.dateMode === 'deferred'}
                      onChange={() => updateProcessingSession({ dateMode: 'deferred' })}
                      className="accent-primary"
                    />
                    <div>
                      <span className="font-medium text-[12px]">Оставить дату необработанной</span>
                      <span className="text-[10px] text-secondary block">Отложить извлечение на этап детального редактора</span>
                    </div>
                  </div>
                  <span className="font-code text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">ОТЛОЖЕНО</span>
                </label>
              </div>
            </div>

            {/* 5. Template & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-secondary">Шаблон для ввода (SCR-06)</label>
                <select
                  value={processingSession.templateId}
                  onChange={e => updateProcessingSession({ templateId: e.target.value })}
                  className="h-8 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest cursor-pointer"
                >
                  <option value="tpl-1">Шаблон: Акт приёма-передачи (5 полей)</option>
                  <option value="tpl-2">Шаблон: Договор найма жилья (12 полей)</option>
                  <option value="tpl-3">Шаблон: Платёжная квитанция ЖКХ (8 полей)</option>
                  <option value="none">Без шаблона (свободные поля)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-secondary">Связь с родительским документом</label>
                <div className="h-8 px-2 rounded bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[15px] text-primary">link</span>
                    <span className="font-bold text-primary font-code text-[11px]">PV-0041</span>
                    <span className="truncate text-[11px]">Договор найма № 42</span>
                  </div>
                  <span className="px-1 rounded bg-primary-fixed/40 text-[9px] font-semibold text-on-primary-fixed">Родитель</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-[210px] right-0 z-30 h-11 bg-surface-container-high border-t border-surface-container-highest px-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigateTo('predproverka')}
          className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад к предпроверке (SCR-04)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Черновик сохранён (F10)', 'save')}
            className="h-7 px-3 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface text-[12px] flex items-center gap-1 cursor-pointer border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Сохранить черновик (F10)</span>
          </button>

          <button
            onClick={() => navigateTo('redaktor')}
            className="h-7 px-4 rounded bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Продолжить к вводу данных (SCR-06)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
