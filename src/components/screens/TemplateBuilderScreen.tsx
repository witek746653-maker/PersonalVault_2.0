import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const TemplateBuilderScreen: React.FC = () => {
  const {
    navigateTo,
    showToast
  } = useVault();

  const [activeFieldId, setActiveFieldId] = useState('f-5');
  const [fieldLabel, setFieldLabel] = useState('Адрес помещения');
  const [fieldType, setFieldType] = useState('Длинный текст');
  const [isRequired, setIsRequired] = useState(true);
  const [isLinkedMyData, setIsLinkedMyData] = useState(true);
  const [operatorHint, setOperatorHint] = useState('Укажите полный адрес квартиры или дома из условий договора...');
  const [deleteModalField, setDeleteModalField] = useState<string | null>(null);

  const fieldTypesList = [
    { name: 'Текст', icon: 'short_text' },
    { name: 'Длинный текст', icon: 'notes' },
    { name: 'Число', icon: 'tag' },
    { name: 'Дата', icon: 'calendar_today' },
    { name: 'Период', icon: 'date_range' },
    { name: 'Телефон', icon: 'phone' },
    { name: 'Сумма', icon: 'payments' },
    { name: 'Да/Нет', icon: 'check_box' }
  ];

  const handleSave = () => {
    showToast('Схема шаблона сохранена: создана новая ревизия v1.3', 'save');
    navigateTo('shablony');
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Header bar */}
      <div className="bg-surface-container-lowest rounded-lg p-3.5 mb-3 border border-surface-container-highest shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[16px] text-on-surface">
                Редактор шаблона: Акт приёма-передачи жилого помещения
              </h1>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-[11px] font-bold">
                v1.2
              </span>
            </div>
            <p className="text-[12px] text-secondary">
              Конфигурирование логических блоков, типов ячеек и связей со справочниками «Мои данные».
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleSave}
              className="h-7 px-3 rounded bg-primary text-on-primary font-bold text-[12px] hover:bg-primary-container shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">save</span>
              <span>Сохранить изменения (v1.3)</span>
            </button>
            <button
              onClick={() => navigateTo('shablony')}
              className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] cursor-pointer border border-surface-container-highest"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Workspace */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left Column: Sections & Fields Tree (7 cols) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
          {/* Section 1 */}
          <div className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-surface-container bg-surface-container-low px-2 py-1 rounded">
              <div className="flex items-center gap-1.5 text-[12px] font-bold">
                <span className="material-symbols-outlined text-primary text-[17px]">folder_open</span>
                <span>Секция 1: «Основные реквизиты»</span>
                <span className="text-secondary font-normal font-code text-[11px] ml-1">5 полей</span>
              </div>
              <button
                onClick={() => showToast('Поле добавлено')}
                className="h-6 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Поле
              </button>
            </div>

            <div className="flex flex-col gap-1 text-[12px]">
              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline cursor-grab text-[15px]">drag_indicator</span>
                  <div>
                    <span className="font-semibold">Номер акта</span>
                    <span className="text-secondary text-[11px] ml-2">[Текст] *Обязательное</span>
                  </div>
                </div>
                <button onClick={() => setDeleteModalField('Номер акта')} className="text-secondary hover:text-error">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline cursor-grab text-[15px]">drag_indicator</span>
                  <div>
                    <span className="font-semibold">Дата составления</span>
                    <span className="text-secondary text-[11px] ml-2">[Дата] *Обязательное</span>
                  </div>
                </div>
                <button onClick={() => setDeleteModalField('Дата составления')} className="text-secondary hover:text-error">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline cursor-grab text-[15px]">drag_indicator</span>
                  <div>
                    <span className="font-semibold">Наймодатель</span>
                    <span className="text-secondary text-[11px] ml-2">[Текст] (связь с «Мои данные»)</span>
                  </div>
                </div>
                <button onClick={() => setDeleteModalField('Наймодатель')} className="text-secondary hover:text-error">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline cursor-grab text-[15px]">drag_indicator</span>
                  <div>
                    <span className="font-semibold">Наниматель</span>
                    <span className="text-secondary text-[11px] ml-2">[Текст] (связь с «Мои данные»)</span>
                  </div>
                </div>
                <button onClick={() => setDeleteModalField('Наниматель')} className="text-secondary hover:text-error">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              {/* Active Selected Field */}
              <div className="p-2 rounded bg-primary-fixed/30 border border-primary flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary cursor-grab text-[15px]">drag_indicator</span>
                  <div>
                    <span className="font-bold text-on-surface">Адрес помещения</span>
                    <span className="text-primary text-[11px] ml-2 font-medium">[Длинный текст] *Обязательное</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-primary font-bold bg-primary-fixed px-1.5 rounded">В инспекторе</span>
                  <button onClick={() => setDeleteModalField('Адрес помещения')} className="text-error hover:opacity-80">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Table Section */}
          <div className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container-highest shadow-xs flex flex-col gap-2 text-[12px]">
            <div className="flex items-center justify-between pb-1.5 border-b border-surface-container bg-surface-container-low px-2 py-1 rounded">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-primary text-[17px]">table_rows</span>
                <span>Секция 2: «Оборудование и опись имущества»</span>
              </div>
            </div>

            <div className="p-2 rounded bg-surface-container-low border border-surface-container-highest">
              <span className="font-bold block mb-1">Таблица: «Передаваемое имущество» (4 столбца)</span>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-code text-secondary bg-surface-container p-1.5 rounded">
                <div>1. № п/п [Число]</div>
                <div>2. Наименование [Текст] *</div>
                <div>3. Модель [Текст]</div>
                <div>4. Состояние [Текст]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Field Inspector (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs p-3.5 gap-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-surface-container">
            <div className="flex items-center gap-1.5 font-bold text-[13px] text-on-surface">
              <span className="material-symbols-outlined text-[17px] text-primary">tune</span>
              <span>Свойства поля схемы</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed font-code text-[10px] font-bold">
              Схема
            </span>
          </div>

          <div className="flex flex-col gap-2.5 text-[12px]">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-secondary">Название поля</label>
              <input
                type="text"
                value={fieldLabel}
                onChange={e => setFieldLabel(e.target.value)}
                className="w-full h-7 px-2 rounded bg-surface-container-low text-on-surface outline-none border border-surface-container-highest"
              />
            </div>

            {/* Field Data Type Matrix */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-secondary">Тип данных ячейки схемы</label>
              <div className="grid grid-cols-2 gap-1">
                {fieldTypesList.map(t => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setFieldType(t.name)}
                    className={`h-7 px-2 rounded flex items-center gap-1.5 text-[11px] transition-all cursor-pointer border ${
                      fieldType === t.name
                        ? 'bg-primary text-on-primary font-bold border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-surface-container-highest hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox: Required */}
            <label className="flex items-center gap-2 p-1.5 rounded bg-surface-container-low border border-surface-container-highest cursor-pointer text-[12px]">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={e => setIsRequired(e.target.checked)}
                className="accent-primary rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">Обязательное поле</span>
                <span className="text-[10px] text-secondary">Влияет на расчёт полноты в Журнале</span>
              </div>
            </label>

            {/* Checkbox: Link to My Data */}
            <label className="flex items-center gap-2 p-1.5 rounded bg-surface-container-low border border-surface-container-highest cursor-pointer text-[12px]">
              <input
                type="checkbox"
                checked={isLinkedMyData}
                onChange={e => setIsLinkedMyData(e.target.checked)}
                className="accent-primary rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">Разрешить вставку из «Мои данные»</span>
                <span className="text-[10px] text-secondary">Автоподстановка из локального справочника</span>
              </div>
            </label>

            {/* Operator hint */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-secondary">Подсказка для оператора</label>
              <textarea
                value={operatorHint}
                onChange={e => setOperatorHint(e.target.value)}
                rows={2}
                className="w-full p-1.5 rounded bg-surface-container-low text-on-surface text-[11px] outline-none border border-surface-container-highest resize-none"
              />
            </div>

            {/* Guarantee Box */}
            <div className="p-2.5 rounded bg-surface-container-high border border-surface-container-highest flex items-start gap-2 text-[11px]">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">shield</span>
              <div className="text-secondary leading-tight">
                <strong className="text-on-surface block font-semibold">Изоляция архивных данных:</strong>
                Изменения схемы применяются только к новым документам. Существующие записи архива защищены от потери полей.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Field Modal */}
      {deleteModalField && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteModalField(null)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-error font-bold text-[13px]">
              <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              <span>Подтверждение удаления поля из шаблона</span>
            </div>

            <p className="text-[12px] text-on-surface leading-normal">
              Вы удаляете поле <strong className="text-error">«{deleteModalField}»</strong> из схемы шаблона. Поле перестанет предлагаться в новых документах.
            </p>

            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest text-[11px] text-secondary flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">verified_user</span>
              <span>
                <strong>Гарантия неизменности архива:</strong> Значения этого поля в уже существующих документах не будут удалены. Они автоматически сохранятся как локальные свойства.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setDeleteModalField(null)}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px]"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setDeleteModalField(null);
                  showToast(`Поле «${deleteModalField}» удалено из схемы шаблона`);
                }}
                className="px-3 py-1 rounded bg-error text-on-error hover:opacity-90 font-bold text-[11px]"
              >
                Удалить поле
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
