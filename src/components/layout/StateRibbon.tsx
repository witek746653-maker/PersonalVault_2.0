/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVault } from '../../context/VaultContext';
import { ScreenId } from '../../types';

export const StateRibbon: React.FC = () => {
  const { currentScreen, setCurrentScreen, activeScenario, setActiveScenario, isCompact, toggleCompact } = useVault();

  // Screen names map for quick selector
  const screenTitles: Record<ScreenId, string> = {
    'SCR-01': 'SCR-01 · Журнал документов',
    'SCR-02': 'SCR-02 · Входящие: очередь материалов',
    'SCR-03': 'SCR-03 · Подготовка: состав и порядок страниц',
    'SCR-04': 'SCR-04 · Подготовка: предпроверка пригодности',
    'SCR-05': 'SCR-05 · Подготовка: классификация',
    'SCR-06': 'SCR-06 · Подготовка: редактор данных',
    'SCR-07': 'SCR-07 · Подготовка: сверка со сканом',
    'SCR-08': 'SCR-08 · Подготовка: итог перед сохранением',
    'SCR-09': 'SCR-09 · Подготовка: результат архивации',
    'SCR-10': 'SCR-10 · Черновики и незавершенные сессии',
    'SCR-11': 'SCR-11 · Карточка архивного документа',
    'SCR-12': 'SCR-12 · Каталог шаблонов документов',
    'SCR-13': 'SCR-13 · Конструктор структуры шаблона',
    'SCR-14': 'SCR-14 · Справочник «Мои данные»',
    'SCR-15': 'SCR-15 · Планы документов (дедлайны)',
    'SCR-16': 'SCR-16 · Убранные из Журнала документы',
    'SCR-17': 'SCR-17 · Настройки приложения',
    'SCR-18': 'SCR-18 · Обслуживание архива (целостность)',
    'SCR-19': 'SCR-19 · Сводка здоровья',
    'SCR-20': 'SCR-20 · Помощник (ИИ-ассистент)',
  };

  // Scenario buttons per screen
  const getScenariosForScreen = (): { key: string; label: string; icon?: string }[] => {
    switch (currentScreen) {
      case 'SCR-01':
        return [
          { key: 'table', label: 'Обычная таблица' },
          { key: 'list', label: 'Двухстрочный список' },
          { key: 'empty', label: 'Пустой Журнал' },
          { key: 'nosearch', label: 'Поиск без совпадений' },
          { key: 'secret_locked', label: 'Secret недоступна' },
          { key: 'compact', label: 'Компактный вид (900×760)' },
        ];
      case 'SCR-02':
        return [
          { key: 'normal', label: 'Обычная очередь (выбран набор)' },
          { key: 'grouped', label: 'Файлы объединены в набор' },
          { key: 'attention', label: 'Элемент требует внимания' },
          { key: 'empty', label: 'Пустая очередь входящих' },
        ];
      case 'SCR-03':
        return [
          { key: 'multi', label: 'Несколько файлов (4 шт.)' },
          { key: 'single', label: 'Один многостраничный PDF' },
          { key: 'reordered', label: 'Порядок изменён (Стр. 2 ↑)' },
          { key: 'warning', label: 'Предупреждение: файл исключён' },
        ];
      case 'SCR-04':
        return [
          { key: 'success', label: '1. Успех (Готов)' },
          { key: 'duplicate', label: '2. Дубликат SHA' },
          { key: 'similar', label: '3. Похожий файл' },
          { key: 'damaged', label: '4. Повреждён' },
          { key: 'preview_fail', label: '5. Сбой превью' },
          { key: 'secret_unavailable', label: '6. Secret недоступен' },
        ];
      case 'SCR-05':
        return [
          { key: 'standard', label: 'Штатно классифицированный' },
          { key: 'category-deferred', label: 'Категория и тип отложены' },
          { key: 'temp-title', label: 'Временное название' },
          { key: 'date-unknown', label: 'Дата неизвестна' },
          { key: 'date-unprocessed', label: 'Дата не обработана' },
          { key: 'secret-locked', label: 'Secret выбрано (недоступно)' },
        ];
      case 'SCR-06':
        return [
          { key: 'default', label: 'Штатный редактор (новый)' },
          { key: 'saved', label: 'Редактирование сохранённого' },
          { key: 'mydata', label: 'Панель «Мои данные»' },
          { key: 'diff', label: 'Применить шаблон (диффы)' },
          { key: 'ocr', label: 'Прикрепить расшифровку' },
          { key: 'del', label: 'Удаление поля (предупреждение)' },
          { key: 'conflict', label: 'Конфликт автосохранения' },
        ];
      case 'SCR-07':
        return [
          { key: '1', label: '1. Значение готово к сверке (шаг 4 из 7)' },
          { key: '2', label: '2. Сверено со сканом' },
          { key: '3', label: '3. Проверено: отсутствует' },
          { key: '4', label: '4. Значение изменено (повторная сверка)' },
          { key: '5', label: '5. Источник недоступен' },
          { key: '6', label: '6. Отложенная сверка' },
        ];
      case 'SCR-08':
        return [
          { key: 'incomplete', label: 'Неполный, но готов к архивации (Активен)' },
          { key: 'ready', label: 'Полностью готовый документ' },
          { key: 'partial', label: 'Частично сверен' },
          { key: 'secret-lock', label: 'Secret недоступен (блокировка)' },
          { key: 'tech-error', label: 'Техническая ошибка' },
          { key: 'confirm-dialog', label: 'Диалог подтверждения фиксации' },
        ];
      case 'SCR-09':
        return [
          { key: '1', label: '1. Штатный успех' },
          { key: '2', label: '2. Не заполнен / Не сверен' },
          { key: '3', label: '3. Сбой Obsidian' },
          { key: '4', label: '4. Сбой очистки Inbox' },
          { key: '5', label: '5. Сбой до коммита' },
          { key: '6', label: '6. Прерванная операция' },
        ];
      case 'SCR-10':
        return [
          { key: 'normal', label: '1. Штатный список (3)' },
          { key: 'empty', label: '2. Пустой список' },
          { key: 'interrupted', label: '3. Прерванная сессия' },
          { key: 'conflict', label: '4. Конфликт ревизий' },
          { key: 'error', label: '5. Ошибка сохранения' },
          { key: 'secret_locked', label: '6. Secret недоступен' },
        ];
      case 'SCR-11':
        return [
          { key: 'normal', label: 'Обычная карточка' },
          { key: 'missing', label: 'Оригинал не найден' },
          { key: 'hash', label: 'Несовпадение контрольной суммы' },
          { key: 'crash', label: 'Сбой внешнего просмотрщика' },
          { key: 'secret', label: 'Секретная связь недоступна' },
          { key: 'history', label: 'История изменений' },
          { key: 'move', label: 'Панель перемещения документа' },
          { key: 'transcript', label: 'Расшифровка открыта' },
        ];
      case 'SCR-12':
        return [
          { key: 'standard', label: '1. Штатный каталог' },
          { key: 'empty', label: '2. Пустой каталог' },
          { key: 'search', label: '3. Результаты поиска' },
          { key: 'dialog', label: '4. Диалог diff-превью' },
          { key: 'archived', label: '5. Шаблон в архиве' },
        ];
      case 'SCR-13':
        return [
          { key: 'standard', label: '1. Штатное редактирование' },
          { key: 'empty', label: '2. Новый пустой шаблон' },
          { key: 'type-select', label: '3. Выбор типа поля' },
          { key: 'conflict-warn', label: '4. Конфликт типов данных' },
          { key: 'delete-modal', label: '5. Диалог удаления (Гарантия)' },
          { key: 'preview', label: '6. Предпросмотр (SCR-06)' },
        ];
      case 'SCR-14':
        return [
          { key: 'normal', label: '1. Штатный вид (Open + Secret)' },
          { key: 'secret-locked', label: '2. Secret отключен (UX-032)' },
          { key: 'delete-blocked', label: '3. Блокировка UX-020 (Непустая группа)' },
          { key: 'move-step', label: '4. Перенос реквизитов (UX-020)' },
          { key: 'ux032-group-blocked', label: '5. Блокировка UX-032 (Том отключен)' },
          { key: 'delete-empty', label: '6. Удаление пустой группы' },
        ];
      case 'SCR-15':
        return [
          { key: 'default', label: '1. Штатный список' },
          { key: 'empty', label: '2. Пустой список' },
          { key: 'modal-create', label: '3. Создание / правка' },
          { key: 'modal-complete', label: '4. Выполнение (связка)' },
          { key: 'modal-cancel', label: '5. Отмена плана' },
          { key: 'secret-locked', label: '6. Secret закрыта' },
        ];
      case 'SCR-16':
        return [
          { key: 'normal', label: '1. Штатный список (3)' },
          { key: 'empty', label: '2. Пустой список' },
          { key: 'confirm', label: '3. Диалог восстановления' },
          { key: 'restored', label: '4. Успех: восстановлен в Журнал' },
          { key: 'missing', label: '5. Сбой: оригинал недоступен' },
          { key: 'secret-locked', label: '6. Secret закрыта' },
        ];
      case 'SCR-17':
        return [
          { key: 'normal', label: '1. Штатные настройки' },
          { key: 'secret-locked', label: '2. Secret недоступна' },
          { key: 'path', label: '3. Диалог смены пути' },
          { key: 'obsidian-offline', label: '4. Obsidian недоступен' },
        ];
      case 'SCR-18':
        return [
          { key: 'healthy', label: '1. Все исправно' },
          { key: 'warning', label: '2. Требует внимания (2)' },
          { key: 'corrupt', label: '3. Сбой БД / PRAGMA (1)' },
          { key: 'secret_locked', label: '4. Secret отключен (UX-032)' },
          { key: 'checking', label: '5. Проверяется...' },
        ];
      case 'SCR-19':
        return [
          { key: 'normal', label: '1. Штатный обзор Open' },
          { key: 'open_secret', label: '2. Open + Secret' },
          { key: 'secret_locked', label: '3. Secret закрыта (UX-032)' },
          { key: 'empty', label: '4. Нет медицинских данных' },
          { key: 'verification', label: '5. Проверка факта' },
          { key: 'disease_detail', label: '6. Карточка заболевания' },
          { key: 'labs_trend', label: '7. Динамика анализов' },
          { key: 'fitness', label: '8. Активность и сон' },
          { key: 'no_tracker', label: '9. Нет данных трекера' },
          { key: 'import_error', label: '10. Ошибка импорта' },
          { key: 'summary_fr', label: '11. Резюме (Français)' },
          { key: 'missing_source', label: '12. Источник недоступен' },
          { key: 'secret_disconnect', label: '14. Аварийный сброс Secret' },
        ];
      default:
        return [
          { key: 'normal', label: 'Штатный вид' },
        ];
    }
  };

  const scenarios = getScenariosForScreen();

  return (
    <div className="w-full bg-[#ddeaf2] px-3.5 sm:px-6 lg:px-8 xl:px-10 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#d7e4ec] select-none text-[12px] z-20">
      {/* Left: Direct Screen Navigator Dropdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-semibold text-[#006763]">
          <span className="material-symbols-outlined text-[16px]">map</span>
          <span>Экран:</span>
        </div>
        <select
          value={currentScreen}
          onChange={(e) => {
            setCurrentScreen(e.target.value as ScreenId);
            setActiveScenario('normal');
          }}
          className="h-6 px-2 bg-white text-[#111d23] font-medium text-[11px] rounded border border-[#d7e4ec] focus:outline-none focus:border-[#006763] cursor-pointer"
        >
          {Object.entries(screenTitles).map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>

        {/* Separator */}
        <div className="h-4 w-px bg-[#bdc9c7] mx-1"></div>

        {/* Scenario Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-[#6e7978] uppercase tracking-wider mr-1">
            Сценарий:
          </span>
          {scenarios.map((scen) => {
            const isActive = activeScenario === scen.key;
            return (
              <button
                key={scen.key}
                onClick={() => setActiveScenario(scen.key)}
                className={`h-6 px-2.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  isActive
                    ? 'bg-[#006763] text-white shadow-xs font-semibold'
                    : 'bg-[#f4faff] text-[#3e4948] hover:bg-white hover:text-[#111d23] border border-[#d7e4ec]'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#95f3eb]" />}
                <span>{scen.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Compact Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCompact}
          className={`h-6 px-2 rounded text-[11px] flex items-center gap-1 border transition-colors ${
            isCompact
              ? 'bg-[#12827c] text-white border-[#006763]'
              : 'bg-white text-[#536166] hover:text-[#111d23] border-[#d7e4ec]'
          }`}
          title="Симуляция компактного окна 900x760 px"
        >
          <span className="material-symbols-outlined text-[13px]">aspect_ratio</span>
          <span>900×760</span>
        </button>
      </div>
    </div>
  );
};
