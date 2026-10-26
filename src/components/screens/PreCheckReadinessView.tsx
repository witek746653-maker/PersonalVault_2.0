/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const PreCheckReadinessView: React.FC = () => {
  const {
    setCurrentScreen,
    goBack,
    setPipelineStep,
    activeScenario,
    isVeraCryptMounted,
    classificationData,
    showToast,
  } = useVault();

  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Scenarios mapping
  const isDuplicate = activeScenario === 'duplicate';
  const isSimilar = activeScenario === 'similar';
  const isDamaged = activeScenario === 'damaged';
  const isPreviewFail = activeScenario === 'preview_fail';
  const isSecretUnavailable = activeScenario === 'secret_unavailable' || (!isVeraCryptMounted && classificationData.zone === 'secret');

  const isBlocked = isDuplicate || isDamaged || isSecretUnavailable;

  const handleProceed = () => {
    if (isBlocked) {
      showToast('Переход заблокирован: устраните выявленные критические несоответствия', 'error');
      return;
    }
    setPipelineStep(4);
    setCurrentScreen('SCR-05');
    showToast('Предпроверка пройдена. Переход к Классификации', 'arrow_forward');
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Header Pipeline Stepper */}
      <div className="bg-white rounded border border-[#d7e4ec] p-3 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006763] text-[18px]">fact_check</span>
            <span className="font-semibold text-[13px] text-[#111d23]">
              Подготовка документов: Этап 3 из 4 — Предварительная проверка
            </span>
            <span className="text-[11px] text-[#536166] px-1.5 py-0.5 bg-[#e3f0f8] rounded">
              Контроль пригодности к классификации
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#006763] bg-[#e9f6fd] px-2 py-0.5 rounded border border-[#d7e4ec]">
            Проверка целостности
          </span>
        </div>

        {/* 4-step progress */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#536166] text-[11px]">
            <span className="w-3.5 h-3.5 rounded-full bg-[#536166] text-white flex items-center justify-center text-[9px] font-bold">✓</span>
            <span className="line-through">1. Входящие</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#536166] text-[11px]">
            <span className="w-3.5 h-3.5 rounded-full bg-[#536166] text-white flex items-center justify-center text-[9px] font-bold">✓</span>
            <span className="line-through">2. Состав пакета</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#006763] text-white text-[11px] font-semibold shadow-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-white text-[#006763] flex items-center justify-center text-[9px] font-bold">3</span>
            <span>3. Предпроверка</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#e3f0f8] text-[#6e7978] text-[11px]">
            <span className="w-3.5 h-3.5 rounded-full bg-[#bdc9c7] text-[#536166] flex items-center justify-center text-[9px]">4</span>
            <span>4. Классификация</span>
          </div>
        </div>
      </div>

      {/* Target Document Card */}
      <div className="bg-white p-3 rounded border border-[#d7e4ec] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#e3f0f8] text-[#006763] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">folder_special</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] text-[#111d23]">
                Пакет документов: Акт приёма-передачи с приложениями
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#e3f0f8] text-[#536166] text-[10px] font-mono">
                4 страницы · 6.8 МБ
              </span>
            </div>
            <div className="text-[11px] text-[#536166] font-mono">
              Страница_01.jpg, Страница_02.jpg, Страница_03.jpg, Приложение.pdf
            </div>
          </div>
        </div>

        {/* Storage Target Box */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#e9f6fd] border border-[#d7e4ec] text-[11px]">
          <span className="text-[#536166]">Целевая зона:</span>
          <span className="font-semibold text-[#006763] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#006763]" />
            {classificationData.zone === 'open' ? 'Открытое (Open)' : 'Secret (VeraCrypt)'}
          </span>
        </div>
      </div>

      {/* Dynamic Alert Banners for Simulation Scenarios */}
      {isDuplicate && (
        <div className="p-3 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] mt-0.5">error</span>
          <div className="flex-1 space-y-1 text-[12px]">
            <div className="font-bold flex items-center justify-between">
              <span>Точный дубликат SHA-256 обнаружен</span>
              <span className="font-mono text-[10px] bg-white/50 px-1 rounded">MATCH_EXACT_HASH</span>
            </div>
            <p>
              Такой исходный файл уже встречается в архиве (совпадение SHA-256 с записью{' '}
              <strong>PV-0038 «Квитанция об оплате ЖКХ (май 2026)»</strong>). Импорт идентичного файла заблокирован политикой нулевой избыточности.
            </p>
          </div>
        </div>
      )}

      {isSimilar && (
        <div className="p-3 rounded bg-[#fff3e0] border border-[#e68a00]/40 text-[#e68a00] flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#e68a00] mt-0.5">info</span>
          <div className="flex-1 space-y-1 text-[12px]">
            <div className="font-bold flex items-center justify-between text-[#111d23]">
              <span>Найден контекстно похожий документ</span>
              <span className="font-mono text-[10px] bg-white/60 px-1 rounded">SIMILARITY_MATCH_68%</span>
            </div>
            <p className="text-[#3e4948]">
              Найден похожий документ: <strong>PV-0041 «Договор найма жилого помещения № 42»</strong> от того же контрагента. Структурное сходство не блокирует процедуру.
            </p>
          </div>
        </div>
      )}

      {isDamaged && (
        <div className="p-3 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] mt-0.5">broken_image</span>
          <div className="flex-1 space-y-1 text-[12px]">
            <div className="font-bold flex items-center justify-between">
              <span>Критическая ошибка целостности данных</span>
              <span className="font-mono text-[10px] bg-white/50 px-1 rounded">DECODE_STREAM_CORRUPT</span>
            </div>
            <p>
              Не удалось декодировать файл <strong>Страница_02.jpg</strong>: поток данных повреждён (обрыв блока маркера SOF0). Невозможно классифицировать нечитаемые страницы.
            </p>
          </div>
        </div>
      )}

      {isPreviewFail && (
        <div className="p-3 rounded bg-[#e3f0f8] border border-[#d7e4ec] text-[#111d23] flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#536166] mt-0.5">visibility_off</span>
          <div className="flex-1 space-y-1 text-[12px]">
            <div className="font-bold flex items-center justify-between">
              <span>Сбой модуля локального предпросмотра</span>
              <span className="font-mono text-[10px] bg-[#ddeaf2] px-1 rounded">RENDERER_ERR_CMYK</span>
            </div>
            <p className="text-[#536166]">
              Встроенный просмотрщик не смог отрисовать <strong>Приложение.pdf</strong> из-за специфического цветового профиля. Сам файл валиден. Вы можете продолжить под свою ответственность.
            </p>
          </div>
        </div>
      )}

      {isSecretUnavailable && (
        <div className="p-3 rounded bg-[#ffdad6] border border-[#ba1a1a]/40 text-[#93000a] flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] mt-0.5">key_off</span>
          <div className="flex-1 space-y-1 text-[12px]">
            <div className="font-bold flex items-center justify-between">
              <span>Криптоконтейнер VeraCrypt не смонтирован</span>
              <span className="font-mono text-[10px] bg-white/50 px-1 rounded">VAULT_SECRET_OFFLINE</span>
            </div>
            <p>
              Целевая зона <strong>Secret</strong> недоступна: виртуальный диск архива закрыт. В целях безопасности автоматическое переключение на Open запрещено.
            </p>
          </div>
        </div>
      )}

      {/* 5 Core Verification Criteria */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#536166] font-semibold uppercase tracking-wider px-1">
          <span>Контрольные критерии пригодности:</span>
          <span>{isBlocked ? 'Обнаружены ошибки' : '5 из 5 проверок пройдены успешно'}</span>
        </div>

        {/* Check 1 */}
        <div
          className={`p-2.5 rounded border transition-colors flex items-start gap-3 ${
            isDamaged ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/30' : 'bg-white border-[#d7e4ec]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
              isDamaged ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#95f3eb] text-[#006763]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isDamaged ? 'close' : 'check'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111d23]">1. Читаемость и структура файлов</span>
              <span
                className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                  isDamaged
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : 'bg-[#95f3eb]/40 text-[#006763]'
                }`}
              >
                {isDamaged ? '✕ Повреждён' : '✓ Успешно'}
              </span>
            </div>
            <p className="text-[#536166] mt-0.5">
              {isDamaged
                ? 'Страница_02.jpg повреждена и не может быть прочитана.'
                : 'Все 4 исходных файла успешно прочитаны. Контейнеры JPEG и PDF не повреждены.'}
            </p>
          </div>
        </div>

        {/* Check 2 */}
        <div className="p-2.5 rounded border bg-white border-[#d7e4ec] flex items-start gap-3 text-[12px]">
          <div className="w-6 h-6 rounded bg-[#95f3eb] text-[#006763] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[15px]">check</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111d23]">
                2. Поддерживаемый формат долговременного хранения
              </span>
              <span className="bg-[#95f3eb]/40 text-[#006763] font-semibold text-[10px] px-1.5 py-0.5 rounded">
                ✓ Поддерживается
              </span>
            </div>
            <p className="text-[#536166] mt-0.5">
              Форматы JPEG (ISO/IEC 10918-1) и PDF/A соответствуют строгим требованиям локального архивирования.
            </p>
          </div>
        </div>

        {/* Check 3 */}
        <div
          className={`p-2.5 rounded border transition-colors flex items-start gap-3 ${
            isDuplicate ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/30' : 'bg-white border-[#d7e4ec]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
              isDuplicate ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#95f3eb] text-[#006763]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isDuplicate ? 'close' : 'check'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111d23]">
                3. Проверка на дубликаты в базе Журнала
              </span>
              <span
                className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                  isDuplicate
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : isSimilar
                    ? 'bg-[#fff3e0] text-[#e68a00]'
                    : 'bg-[#95f3eb]/40 text-[#006763]'
                }`}
              >
                {isDuplicate
                  ? '✕ Точный дубликат'
                  : isSimilar
                  ? '! Найден похожий (PV-0041)'
                  : '✓ Уникальный документ'}
              </span>
            </div>
            <p className="text-[#536166] mt-0.5">
              {isDuplicate
                ? 'Хэш SHA-256 совпадает с PV-0038. Импорт заблокирован.'
                : isSimilar
                ? 'Обнаружен документ схожего контрагента, но хэш уникален.'
                : 'Контрольные суммы SHA-256 не встречаются в существующей базе архива.'}
            </p>
          </div>
        </div>

        {/* Check 4 */}
        <div className="p-2.5 rounded border bg-white border-[#d7e4ec] flex items-start gap-3 text-[12px]">
          <div
            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
              isPreviewFail ? 'bg-[#ddeaf2] text-[#536166]' : 'bg-[#95f3eb] text-[#006763]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isPreviewFail ? 'visibility_off' : 'check'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111d23]">
                4. Доступность страниц и встроенного просмотрщика
              </span>
              <span
                className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                  isPreviewFail
                    ? 'bg-[#ddeaf2] text-[#536166]'
                    : 'bg-[#95f3eb]/40 text-[#006763]'
                }`}
              >
                {isPreviewFail ? 'Внимание: Сбой превью стр. 4' : '✓ Все 4 страницы доступны'}
              </span>
            </div>
            <p className="text-[#536166] mt-0.5">
              {isPreviewFail
                ? 'Страница 4 требует внешнего просмотрщика для ручной сверки.'
                : 'Страницы 1–4 отрендерены локальным движком без сбоев.'}
            </p>
          </div>
        </div>

        {/* Check 5 */}
        <div
          className={`p-2.5 rounded border transition-colors flex items-start gap-3 ${
            isSecretUnavailable ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/30' : 'bg-white border-[#d7e4ec]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
              isSecretUnavailable ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#95f3eb] text-[#006763]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isSecretUnavailable ? 'lock' : 'check'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111d23]">
                5. Готовность зоны хранения ({classificationData.zone === 'open' ? 'Open' : 'Secret'})
              </span>
              <span
                className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                  isSecretUnavailable
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : 'bg-[#95f3eb]/40 text-[#006763]'
                }`}
              >
                {isSecretUnavailable ? '✕ Secret недоступен' : '✓ Хранилище готово'}
              </span>
            </div>
            <p className="text-[#536166] mt-0.5">
              {isSecretUnavailable
                ? 'Том VeraCrypt не смонтирован. Запись заблокирована.'
                : 'Локальный архив доступен для атомарной записи. Свободно 4.2 ГБ.'}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Technical Diagnostics Table */}
      <div className="bg-white rounded border border-[#d7e4ec] overflow-hidden">
        <button
          onClick={() => setIsDiagnosticsOpen((prev) => !prev)}
          className="w-full px-3 py-2 bg-[#e9f6fd] flex items-center justify-between text-[12px] font-semibold text-[#111d23] hover:bg-[#ddeaf2] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`material-symbols-outlined text-[16px] transition-transform ${
                isDiagnosticsOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
            <span>Подробности и диагностические данные (технический протокол)</span>
          </div>
          <span className="font-mono text-[10px] text-[#536166]">4 файла · SHA-256 · ISO/IEC</span>
        </button>

        {isDiagnosticsOpen && (
          <div className="p-3 bg-[#111d23] text-white font-mono text-[11px] space-y-2 select-text overflow-x-auto">
            <div className="flex justify-between border-b border-white/20 pb-1 text-[#95f3eb]">
              <span>Файл</span>
              <span>MIME-тип</span>
              <span>Контрольная сумма SHA-256</span>
              <span>Статус</span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Страница_01.jpg</span>
              <span>image/jpeg</span>
              <span>e3b0c44298fc1c149afbf4c8996fb924...</span>
              <span className="text-[#95f3eb]">VALID</span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Страница_02.jpg</span>
              <span>image/jpeg</span>
              <span>ca978112ca1bbdcafac231b39a23dc4da...</span>
              <span className={isDamaged ? 'text-[#ffdad6] font-bold' : 'text-[#95f3eb]'}>
                {isDamaged ? 'CORRUPT' : 'VALID'}
              </span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Страница_03.jpg</span>
              <span>image/jpeg</span>
              <span>872f987630737a0980ff2d1d58e3760ba...</span>
              <span className="text-[#95f3eb]">VALID</span>
            </div>
            <div className="flex justify-between text-white/90">
              <span>Приложение.pdf</span>
              <span>application/pdf (A-1b)</span>
              <span>4e07408562bedb8b60ce05c1decfe3ad...</span>
              <span className={isPreviewFail ? 'text-[#ffcc80]' : 'text-[#95f3eb]'}>
                {isPreviewFail ? 'NO_PREVIEW' : 'VALID'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progression Bar */}
      <div className="sticky bottom-0 bg-[#ddeaf2] p-2.5 rounded border border-[#d7e4ec] flex items-center justify-between text-[12px] shadow-sm">
        <button
          onClick={goBack}
          className="h-8 px-3 rounded bg-white hover:bg-[#e9f6fd] text-[#111d23] font-medium flex items-center gap-1 border border-[#d7e4ec]"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Назад к составу пакета</span>
        </button>

        <button
          onClick={handleProceed}
          disabled={isBlocked}
          className={`h-8 px-4 rounded font-semibold flex items-center gap-1 transition-colors ${
            isBlocked
              ? 'bg-[#d7e4ec] text-[#6e7978] cursor-not-allowed'
              : 'bg-[#006763] hover:bg-[#12827c] text-white shadow-xs cursor-pointer'
          }`}
        >
          <span>
            {isBlocked
              ? 'Классификация заблокирована'
              : 'Продолжить к классификации'}
          </span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
