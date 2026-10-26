/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useVault } from '../../context/VaultContext';

export const InboxQueueView: React.FC = () => {
  const {
    inboxItems,
    selectedInboxId,
    setSelectedInboxId,
    setCurrentScreen,
    setPipelineStep,
    activeScenario,
    addUploadedUserFile,
    isVeraCryptMounted,
    classificationData,
    updateClassification,
    showToast,
  } = useVault();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isScenarioEmpty = activeScenario === 'empty';
  const isScenarioAttention = activeScenario === 'attention';
  const isScenarioGrouped = activeScenario === 'grouped';

  const selectedItem =
    inboxItems.find((i) => i.id === selectedInboxId) || inboxItems[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((f) => addUploadedUserFile(f));
    }
  };

  const handleStartProcessing = () => {
    if (!selectedItem) return;
    setPipelineStep(2);
    setCurrentScreen('SCR-03');
    showToast('Переход к Этапу 2: Состав документа', 'arrow_forward');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Hidden File Input for Custom Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      {/* Stepper Pipeline Bar */}
      <div className="w-full bg-white px-3 py-2 rounded border border-[#d7e4ec] shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#111d23]">
            <span className="material-symbols-outlined text-[16px] text-[#006763]">folder_open</span>
            <span>Подготовка документов</span>
            <span className="text-[11px] font-normal text-[#536166] px-1.5 py-[1px] bg-[#e3f0f8] rounded">
              Этап 1 из 4
            </span>
          </div>
          {/* Stepper Dots */}
          <div className="flex items-center gap-1 text-[11px]">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#12827c] text-white font-semibold">
              <span>1. Входящие</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </div>
            <button
              onClick={() => setCurrentScreen('SCR-03')}
              className="px-2 py-0.5 rounded text-[#536166] hover:bg-[#e9f6fd]"
            >
              2. Состав
            </button>
            <button
              onClick={() => setCurrentScreen('SCR-04')}
              className="px-2 py-0.5 rounded text-[#536166] hover:bg-[#e9f6fd]"
            >
              3. Предпроверка
            </button>
            <button
              onClick={() => setCurrentScreen('SCR-05')}
              className="px-2 py-0.5 rounded text-[#536166] hover:bg-[#e9f6fd]"
            >
              4. Классификация
            </button>
            <button
              onClick={() => setCurrentScreen('SCR-06')}
              className="px-2 py-0.5 rounded text-[#536166] hover:bg-[#e9f6fd]"
            >
              5. Редактор данных
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-[#536166]">
          <span className="material-symbols-outlined text-[13px]">terminal</span>
          <span>PV2_INBOX_DAEMON: ACTIVE</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="w-full bg-[#e9f6fd] px-3 py-1.5 rounded border border-[#d7e4ec] flex items-center justify-between flex-wrap gap-2 text-[12px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2.5 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Добавить свои файлы (PDF / JPG)</span>
          </button>
          <button
            onClick={() => showToast('Папка C:\\PersonalVault\\Inbox открыта в проводнике')}
            className="h-7 px-2.5 rounded bg-white hover:bg-[#ddeaf2] text-[#111d23] flex items-center gap-1 border border-[#d7e4ec] transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-[#536166]">folder</span>
            <span>Открыть папку Inbox</span>
          </button>
          <button
            onClick={() => showToast('Очередь пересканирована. Новых файлов: 0')}
            className="w-7 h-7 rounded bg-white hover:bg-[#ddeaf2] text-[#536166] flex items-center justify-center border border-[#d7e4ec]"
            title="Пересканировать каталог"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#d6e5ec] text-[#59676c] text-[11px] font-mono">
            <span className="material-symbols-outlined text-[13px] text-[#006763]">security</span>
            <span>{isVeraCryptMounted ? 'Open + Secret (VeraCrypt)' : 'Open Only (VeraCrypt Lock)'}</span>
          </div>
        </div>
      </div>

      {/* Main Split: Queue Table (flex-1) + Inspector (~340-380px) */}
      <div className="w-full flex gap-3 items-stretch">
        {/* Left Queue Table */}
        <div className="flex-1 min-w-0 flex flex-col bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden min-h-[520px]">
          <div className="h-8 bg-[#ddeaf2] px-3 flex items-center justify-between text-[#111d23] text-[11px] font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-[#006763]">Очередь необработанных материалов</span>
              <span className="text-[#536166] font-mono">
                {isScenarioEmpty ? '0 файлов' : `${inboxItems.length} записи в пуле`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#536166]">
              <span className="material-symbols-outlined text-[13px]">swap_vert</span>
              <span>По времени добавления (новые)</span>
            </div>
          </div>

          {/* Table / Empty View */}
          {isScenarioEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e3f0f8] flex items-center justify-center text-[#6e7978] mb-2">
                <span className="material-symbols-outlined text-[28px]">folder_off</span>
              </div>
              <h3 className="font-semibold text-[14px]">Входящая очередь пуста</h3>
              <p className="text-[12px] text-[#536166] max-w-sm mt-1">
                Все полученные документы разобраны и перемещены в Журнал, либо файлы ещё не добавлены.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 rounded bg-[#006763] text-white text-[12px] font-semibold"
              >
                + Добавить файлы в Inbox
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="bg-[#e9f6fd] text-[#536166] text-[11px] uppercase tracking-wider h-7 border-b border-[#d7e4ec]">
                    <th className="w-8 px-2 text-center">
                      <input type="checkbox" defaultChecked className="accent-[#006763] rounded" />
                    </th>
                    <th className="px-2">Исходный файл / Набор</th>
                    <th className="px-2 w-16">Тип</th>
                    <th className="px-2 w-16">Размер</th>
                    <th className="px-2 w-24">Состав</th>
                    <th className="px-2 w-32">Статус</th>
                    <th className="px-2 w-28">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7e4ec]">
                  {inboxItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const isAttention = isScenarioAttention && item.id === 'inb-3';
                    const isGroupedHighlight = isScenarioGrouped && item.id === 'inb-1';
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedInboxId(item.id)}
                        className={`cursor-pointer transition-colors h-11 ${
                          isSelected
                            ? 'bg-[#95f3eb]/25 hover:bg-[#95f3eb]/35'
                            : isAttention
                            ? 'bg-[#fff3e0] hover:bg-[#ffe0b2]'
                            : isGroupedHighlight
                            ? 'bg-[#e6f4f3] hover:bg-[#d0ecea]'
                            : 'hover:bg-[#e9f6fd]/50'
                        }`}
                      >
                        <td className="px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedInboxId(item.id)}
                            className="accent-[#006763] rounded"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-start gap-1.5 min-w-0">
                            <span
                              className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                                item.isPackage ? 'text-[#006763]' : item.status === 'error' ? 'text-[#ba1a1a]' : 'text-[#536166]'
                              }`}
                            >
                              {item.isPackage
                                ? 'folder_zip'
                                : item.type === 'PDF'
                                ? 'picture_as_pdf'
                                : item.status === 'error'
                                ? 'broken_image'
                                : 'description'}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-[#111d23] truncate">
                                {item.name}
                              </span>
                              {item.subfilesSummary && (
                                <span className="font-mono text-[10px] text-[#6e7978] truncate">
                                  {item.subfilesSummary}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 font-mono text-[11px] text-[#536166]">{item.type}</td>
                        <td className="px-2 font-mono text-[11px]">{item.size}</td>
                        <td className="px-2 font-mono text-[10px] text-[#6e7978]">
                          {item.pagesCount} стр.
                        </td>
                        <td className="px-2">
                          {item.status === 'ready' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#95f3eb]/40 text-[#006763] text-[10px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006763]" />
                              Готов к разбору
                            </span>
                          )}
                          {item.status === 'attention' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fff3e0] text-[#e68a00] text-[10px] font-medium">
                              <span className="material-symbols-outlined text-[11px]">warning</span>
                              Похож на архивный
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-medium">
                              <span className="material-symbols-outlined text-[11px]">error</span>
                              Ошибка формата
                            </span>
                          )}
                        </td>
                        <td className="px-2 font-mono text-[10px] text-[#6e7978]">
                          {item.addedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Bottom Action Bar */}
          <div className="h-9 px-3 bg-[#e9f6fd] border-t border-[#d7e4ec] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006763]" />
              <span>
                Выбран объект:{' '}
                <strong className="text-[#006763] font-semibold">
                  {selectedItem?.name || 'Ничего не выбрано'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleStartProcessing}
                className="h-6 px-2.5 rounded bg-[#006763] hover:bg-[#12827c] text-white font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">join_inner</span>
                <span>Объединить в один документ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Inspector */}
        {selectedItem && (
          <div className="w-80 md:w-[340px] xl:w-[360px] 2xl:w-[380px] shrink-0 flex flex-col bg-white rounded border border-[#d7e4ec] shadow-xs overflow-hidden p-3 gap-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#d7e4ec]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[#006763] text-[16px]">description</span>
                <span className="font-semibold text-[13px] truncate">Инспектор входящего объекта</span>
              </div>
            </div>

            {/* Thumbnail Preview Banner */}
            <div className="relative w-full h-32 rounded bg-[#e9f6fd] overflow-hidden flex flex-col items-center justify-center border border-[#d7e4ec]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCibeunigutGQPVIPZkJ5UFekhXIz7NPGAUyjla1l0dWh5ntzzLhtcpJSQbi4RQjADQj7shhagVy2r3_QMl4-0XNyXNAOKKjSmKVD9F1KxHeD72ZrNg7hFQK0094Wpdp3z05ADxPIISY8D5jm6CaqUwUezG-kphwbZJmpbY-twppJHj4HdqcnLLSlZnwx_gbzP7sFB7IkbbeP7WqWnBwkAIhkI8ufcG3kMouBV9se-Kl7tQoYqztmgqLA"
                alt="Превью документа"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono backdrop-blur-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">photo_library</span>
                <span>Стр. 1 из {selectedItem.pagesCount}</span>
              </div>
            </div>

            {/* Working Title */}
            <div className="flex flex-col gap-1 text-[11px]">
              <label className="font-semibold text-[#536166]">
                Временное рабочее название документа:
              </label>
              <input
                type="text"
                value={classificationData.title}
                onChange={(e) => updateClassification({ title: e.target.value })}
                className="h-7 px-2 rounded border border-[#d7e4ec] text-[12px] text-[#111d23] focus:outline-none focus:border-[#006763]"
              />
            </div>

            {/* Target Storage Zone Radio */}
            <div className="flex flex-col gap-1 text-[11px] p-2 rounded bg-[#e9f6fd] border border-[#d7e4ec]">
              <span className="font-semibold text-[#536166]">Целевая зона хранения:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="inb_zone"
                    checked={classificationData.zone === 'open'}
                    onChange={() => updateClassification({ zone: 'open' })}
                    className="accent-[#006763]"
                  />
                  <span>Открытое (Open)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="inb_zone"
                    checked={classificationData.zone === 'secret'}
                    onChange={() => updateClassification({ zone: 'secret' })}
                    className="accent-[#006763]"
                  />
                  <span className="text-[#ba1a1a] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    Secret (VeraCrypt)
                  </span>
                </label>
              </div>
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#536166]">Категория:</label>
                <select
                  value={classificationData.category}
                  onChange={(e) => updateClassification({ category: e.target.value })}
                  className="h-7 px-1.5 rounded border border-[#d7e4ec] text-[11px] bg-white cursor-pointer"
                >
                  <option value="Жильё">Жильё</option>
                  <option value="Коммунальные">Коммунальные</option>
                  <option value="Финансы">Финансы</option>
                  <option value="Здоровье">Здоровье</option>
                  <option value="Работа">Работа</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#536166]">Тип:</label>
                <select
                  value={classificationData.docType}
                  onChange={(e) => updateClassification({ docType: e.target.value })}
                  className="h-7 px-1.5 rounded border border-[#d7e4ec] text-[11px] bg-white cursor-pointer"
                >
                  <option value="Акт приёма-передачи">Акт приёма-передачи</option>
                  <option value="Договор найма">Договор найма</option>
                  <option value="Квитанция">Квитанция</option>
                  <option value="Справка">Справка</option>
                </select>
              </div>
            </div>

            {/* Source URL & Comment */}
            <div className="flex flex-col gap-1 text-[11px]">
              <label className="font-semibold text-[#536166]">Источник (URL сайта/сервиса):</label>
              <input
                type="text"
                value={classificationData.sourceUrl}
                onChange={(e) => updateClassification({ sourceUrl: e.target.value })}
                className="h-7 px-2 rounded border border-[#d7e4ec] text-[11px] font-mono text-[#111d23]"
                placeholder="https://..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#d7e4ec] mt-auto">
              <button
                onClick={handleStartProcessing}
                className="w-full h-8 rounded bg-[#006763] hover:bg-[#12827c] text-white font-semibold text-[12px] flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <span>Разобрать документ (F09)</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => showToast('Документ оставлен в очереди Входящих')}
                  className="h-7 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] text-[11px]"
                >
                  Оставить в Inbox
                </button>
                <button
                  onClick={() => showToast('Черновик сохранён в ОЗУ (F10)')}
                  className="h-7 rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] text-[11px]"
                >
                  Черновик (F10)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
