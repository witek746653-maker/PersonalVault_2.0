/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const TemplateBuilderView: React.FC = () => {
  const {
    setCurrentScreen,
    activeScenario,
    showToast,
  } = useVault();

  const [activeFieldName, setActiveFieldName] = useState('Адрес помещения');
  const [selectedFieldType, setSelectedFieldType] = useState('Длинный текст');
  const [isFieldRequired, setIsFieldRequired] = useState(true);
  const [isLinkMyData, setIsLinkMyData] = useState(true);
  const [fieldHint, setFieldHint] = useState('Укажите полный адрес квартиры или дома из условий договора...');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(activeScenario === 'delete-modal');

  const isScenarioEmpty = activeScenario === 'empty';
  const isScenarioConflictWarn = activeScenario === 'conflict-warn';
  const isScenarioPreview = activeScenario === 'preview';

  const fieldTypes = [
    { name: 'Текст', icon: 'short_text' },
    { name: 'Длинный текст', icon: 'notes' },
    { name: 'Число', icon: 'tag' },
    { name: 'Дата', icon: 'calendar_today' },
    { name: 'Период', icon: 'date_range' },
    { name: 'Телефон', icon: 'phone' },
    { name: 'Сумма', icon: 'payments' },
    { name: 'Да/Нет', icon: 'check_box' },
  ];

  const handleSaveRevision = () => {
    showToast('Ревизия v1.3 успешно зафиксирована в локальной SQLite базе!', 'save');
    setCurrentScreen('SCR-12');
  };

  const handleConfirmDeleteField = () => {
    setIsDeleteModalOpen(false);
    showToast(`Поле «${activeFieldName}» удалено из схемы шаблона (существующие архивные документы не затронуты)`, 'delete');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Breadcrumb & Sub-Header */}
      <div className="flex items-center justify-between text-[11px] text-[#536166]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentScreen('SCR-12')}
            className="hover:text-[#006763] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
            <span>Каталог шаблонов</span>
          </button>
          <span>/</span>
          <span className="text-[#111d23] font-semibold">Редактор структуры схемы</span>
        </div>
        <span className="font-mono text-[#006763]">ID: TPL-ACT-RESIDENTIAL-04 • Ревизия v1.2</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-3.5 rounded border border-[#d7e4ec] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[16px] text-[#111d23]">
              Редактор шаблона: Акт приёма-передачи жилого помещения
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#e3f0f8] text-[#006763] font-mono text-[10px] font-bold">
              v1.2
            </span>
            <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
              Несохранённые правки структуры
            </span>
          </div>
          <p className="text-[12px] text-[#536166] mt-0.5">
            Конфигурирование секций, типов ячеек и связей с «Мои данные». Значения документов на этом экране не редактируются.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveRevision}
            className="h-8 px-3.5 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Сохранить изменения (Создать v1.3)</span>
          </button>
          <button
            onClick={() => setCurrentScreen('SCR-12')}
            className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#536166] border border-[#d7e4ec] text-[11px]"
          >
            Отмена
          </button>
        </div>
      </div>

      {/* Conflict Type Warning if Simulated */}
      {isScenarioConflictWarn && (
        <div className="p-3 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] text-[12px] flex items-start gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">warning</span>
          <div className="space-y-1">
            <strong>Обнаружен конфликт изменения типа данных в ревизии:</strong>
            <p className="text-[11px]">
              Вы изменяете тип поля «Дата составления» с [Дата] на [Число]. В архиве 14 документов используют этот шаблон. Значения существующих документов не будут конвертированы принудительно.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Builder Layout */}
      {isScenarioPreview ? (
        /* Form Preview Mode */
        <div className="bg-white p-5 rounded border border-[#d7e4ec] shadow-xs flex flex-col gap-4 max-w-2xl mx-auto w-full">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold text-[14px]">Предпросмотр формы (вид для ввода данных)</span>
            <button
              onClick={() => showToast('Возврат в режим конструктора')}
              className="text-[#006763] text-[11px] font-semibold underline"
            >
              Закрыть предпросмотр
            </button>
          </div>
          <div className="space-y-3 text-[12px]">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#111d23]">Номер акта *</label>
              <input type="text" placeholder="Введите номер..." className="h-7 px-2 border rounded bg-[#f4faff]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#111d23]">Дата составления *</label>
              <input type="date" className="h-7 px-2 border rounded bg-[#f4faff]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#111d23]">Адрес помещения *</label>
              <textarea placeholder={fieldHint} rows={2} className="p-2 border rounded bg-[#f4faff]" />
            </div>
          </div>
        </div>
      ) : isScenarioEmpty ? (
        /* Empty Mode */
        <div className="bg-white p-12 rounded border border-[#d7e4ec] text-center max-w-md mx-auto w-full">
          <span className="material-symbols-outlined text-[36px] text-[#006763] mb-2">post_add</span>
          <h3 className="font-semibold text-[15px]">Новая схема документа</h3>
          <p className="text-[12px] text-[#536166] mt-1 mb-4">
            В этой схеме пока нет секций и полей. Добавьте первую секцию.
          </p>
          <button
            onClick={() => showToast('Секция 1 создана')}
            className="px-4 py-2 bg-[#006763] text-white rounded font-semibold text-[12px]"
          >
            + Создать первую секцию
          </button>
        </div>
      ) : (
        /* Standard Builder View */
        <div className="flex flex-col lg:flex-row gap-3 items-start w-full">
          {/* Left Column: Schema Tree */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* Section 1 */}
            <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 bg-[#e9f6fd] rounded border border-[#d7e4ec]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006763] text-[18px]">folder_open</span>
                  <span className="font-semibold text-[13px] text-[#111d23]">
                    Секция 1: «Основные реквизиты»
                  </span>
                  <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-[#536166] font-mono">
                    5 полей · 3 обязательных
                  </span>
                </div>
              </div>

              {/* Fields List */}
              <div className="space-y-1.5">
                {[
                  { name: 'Номер акта', type: 'Текст', req: true },
                  { name: 'Дата составления', type: 'Дата', req: true },
                  { name: 'Наймодатель', type: 'Текст', req: false },
                  { name: 'Наниматель', type: 'Текст', req: false },
                  { name: 'Адрес помещения', type: 'Длинный текст', req: true, active: true },
                ].map((f) => (
                  <div
                    key={f.name}
                    onClick={() => setActiveFieldName(f.name)}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-colors text-[12px] ${
                      f.name === activeFieldName
                        ? 'bg-[#95f3eb]/20 border-[#006763] shadow-2xs'
                        : 'bg-[#f4faff] border-[#d7e4ec] hover:bg-[#e9f6fd]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#6e7978] text-[16px]">drag_indicator</span>
                      <span className="font-semibold text-[#111d23]">{f.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white text-[#536166] font-mono text-[10px] border border-[#d7e4ec]">
                        {f.type}
                      </span>
                      {f.req && (
                        <span className="px-1.5 py-0.2 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-semibold">
                          Обязательное
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFieldName(f.name);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded"
                        title="Удалить поле"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Equipment Table Spec */}
            <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 bg-[#e9f6fd] rounded border border-[#d7e4ec]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006763] text-[18px]">table_rows</span>
                  <span className="font-semibold text-[13px] text-[#111d23]">
                    Секция 2: «Оборудование и опись имущества»
                  </span>
                  <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-[#536166] font-mono">
                    1 табличная модель
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto rounded border border-[#d7e4ec]">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#e9f6fd] text-[#536166] uppercase font-semibold h-7 border-b border-[#d7e4ec]">
                    <tr>
                      <th className="p-1.5 px-2">Имя колонки</th>
                      <th className="p-1.5 px-2">Тип данных</th>
                      <th className="p-1.5 px-2">Обязательность</th>
                      <th className="p-1.5 px-2">Ширина</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d7e4ec]">
                    <tr>
                      <td className="p-1.5 px-2 font-semibold">№ п/п</td>
                      <td className="p-1.5 px-2 font-mono text-[#536166]">Числовой (Авто)</td>
                      <td className="p-1.5 px-2 text-[#006763] font-semibold">Да</td>
                      <td className="p-1.5 px-2 font-mono">60px</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 px-2 font-semibold">Наименование предмета</td>
                      <td className="p-1.5 px-2 font-mono text-[#536166]">Текст</td>
                      <td className="p-1.5 px-2 text-[#ba1a1a] font-semibold">Да</td>
                      <td className="p-1.5 px-2 font-mono">240px</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 px-2 font-semibold">Модель / Марка</td>
                      <td className="p-1.5 px-2 font-mono text-[#536166]">Текст</td>
                      <td className="p-1.5 px-2 text-[#536166]">Нет</td>
                      <td className="p-1.5 px-2 font-mono">180px</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Field Inspector & Configuration Panel */}
          <div className="w-full lg:w-80 xl:w-[350px] 2xl:w-[380px] shrink-0 flex flex-col gap-2.5">
            <div className="bg-white rounded border border-[#d7e4ec] shadow-xs p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#d7e4ec]">
                <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
                  <span className="material-symbols-outlined text-[#006763] text-[16px]">tune</span>
                  <span>Свойства поля: {activeFieldName}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#95f3eb] text-[#00201e] font-mono text-[10px] font-bold">
                  Схема
                </span>
              </div>

              {/* Title input */}
              <div className="flex flex-col gap-1 text-[11px]">
                <label className="font-semibold text-[#536166]">Название поля (лейбл):</label>
                <input
                  type="text"
                  value={activeFieldName}
                  onChange={(e) => setActiveFieldName(e.target.value)}
                  className="h-7 px-2 rounded border border-[#d7e4ec] text-[12px] text-[#111d23]"
                />
              </div>

              {/* 8 Data Types Badges Matrix */}
              <div className="flex flex-col gap-1 text-[11px]">
                <label className="font-semibold text-[#536166]">Тип данных ячейки схемы:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {fieldTypes.map((t) => {
                    const isSelected = selectedFieldType === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => setSelectedFieldType(t.name)}
                        className={`h-7 px-2 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors text-left border ${
                          isSelected
                            ? 'bg-[#006763] text-white border-[#006763] font-semibold shadow-2xs'
                            : 'bg-[#f4faff] text-[#3e4948] hover:bg-[#e9f6fd] border-[#d7e4ec]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">{t.icon}</span>
                        <span className="truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Required & MyData Checkboxes */}
              <div className="space-y-2 pt-1 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFieldRequired}
                    onChange={(e) => setIsFieldRequired(e.target.checked)}
                    className="accent-[#006763] rounded"
                  />
                  <span>Обязательное поле (влияет на расчёт полноты)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLinkMyData}
                    onChange={(e) => setIsLinkMyData(e.target.checked)}
                    className="accent-[#006763] rounded"
                  />
                  <span>Разрешить быструю вставку из «Мои данные»</span>
                </label>
              </div>

              {/* Hint textarea */}
              <div className="flex flex-col gap-1 text-[11px]">
                <label className="font-semibold text-[#536166]">Подсказка для оператора:</label>
                <textarea
                  value={fieldHint}
                  onChange={(e) => setFieldHint(e.target.value)}
                  rows={2}
                  className="p-1.5 rounded border border-[#d7e4ec] text-[11px] text-[#111d23]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-[#d7e4ec]">
                <button
                  onClick={() => showToast('Параметры поля применены к схеме')}
                  className="px-3 py-1 bg-[#006763] hover:bg-[#12827c] text-white rounded font-semibold text-[11px] shadow-xs"
                >
                  Применить к схеме
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded text-[11px]"
                >
                  Удалить поле...
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Field Guarantee Dialog Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#d7e4ec] max-w-md w-full p-4 flex flex-col gap-3 text-[12px]">
            <div className="flex items-center gap-2 text-[#ba1a1a] font-bold text-[13px]">
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Подтверждение удаления поля из шаблона</span>
            </div>

            <p className="text-[12px] text-[#3e4948]">
              Вы удаляете поле <strong>«{activeFieldName}»</strong> из схемы шаблона.
            </p>

            <div className="p-2.5 rounded bg-[#e9f6fd] border border-[#d7e4ec] flex items-start gap-2 text-[11px] text-[#3e4948]">
              <span className="material-symbols-outlined text-[16px] text-[#006763] shrink-0 mt-0.5">verified_user</span>
              <div>
                <strong>Гарантия неизменности архивных данных:</strong> значения этого поля, ранее сохранённые в уже существующих архивных документах, <strong>НЕ БУДУТ удалены или повреждены</strong>. Они сохранятся как локальные свойства документа.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#d7e4ec]">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1 rounded bg-[#e3f0f8] text-[#3e4948] text-[11px]"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDeleteField}
                className="px-3 py-1.5 rounded bg-[#ba1a1a] text-white font-semibold text-[11px]"
              >
                Удалить поле из шаблона
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
