import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const DocumentCardScreen: React.FC = () => {
  const {
    activeDocument,
    selectedDocId,
    setSelectedDocId,
    navigateTo,
    softDeleteDocument,
    moveDocumentPath,
    showToast
  } = useVault();

  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHighlightsEnabled, setIsHighlightsEnabled] = useState(true);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isSoftDeleteModalOpen, setIsSoftDeleteModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [targetMovePath, setTargetMovePath] = useState('Архив / 2026 / [Оригиналы]');
  const [transcriptSearch, setTranscriptSearch] = useState('Соколов');

  if (!activeDocument) {
    return (
      <div className="p-8 text-center">
        <div className="font-semibold text-error mb-2">Документ не найден</div>
        <button
          onClick={() => navigateTo('zhurnal')}
          className="px-3 py-1 bg-primary text-on-primary rounded text-[12px]"
        >
          Вернуться в Журнал
        </button>
      </div>
    );
  }

  const doc = activeDocument;

  const handleParentClick = () => {
    if (doc.relations.length > 0) {
      setSelectedDocId(doc.relations[0].id);
      showToast(`Переход к связанному документу ${doc.relations[0].id}`);
    }
  };

  const confirmMove = () => {
    moveDocumentPath(doc.id, `${targetMovePath} / ${doc.name}`);
    setIsMoveModalOpen(false);
  };

  const confirmDelete = () => {
    setIsSoftDeleteModalOpen(false);
    softDeleteDocument(doc.id);
  };

  return (
    <div className="flex flex-col w-full text-on-surface select-none pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <button
              onClick={() => navigateTo('zhurnal')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors text-[11px] font-semibold cursor-pointer border border-surface-container-highest"
              title="Вернуться в Журнал (Esc)"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Журнал (SCR-01)</span>
              <kbd className="font-code text-[9px] bg-surface-container-highest px-1 rounded ml-1 text-secondary">Esc</kbd>
            </button>
            <span className="text-outline-variant font-code text-[11px]">/</span>
            <span className="flex items-center gap-1 text-[12px] text-secondary">
              <span className="material-symbols-outlined text-[15px]">folder</span>
              <span>{doc.category}</span>
            </span>
            <span className="text-outline-variant font-code text-[11px]">/</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-code text-[12px] text-primary font-bold">{doc.id}</span>
              <span className="font-semibold text-[13px] text-on-surface truncate">{doc.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-code text-[10px] text-secondary">r1</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container text-secondary flex items-center gap-1 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${doc.zone === 'secret' ? 'bg-error' : 'bg-primary'}`}></span>
                {doc.zone === 'secret' ? 'Secret Vault' : 'Локальное хранилище'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-code text-[11px] text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              Целостность подтверждена
            </span>
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-2 py-1 rounded hover:bg-surface-container text-secondary hover:text-on-surface text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">history</span>
              История
            </button>
          </div>
        </div>

        {/* Second row of toolbar */}
        <div className="flex items-center justify-between pt-1 bg-surface-container-low px-2.5 py-1.5 rounded border border-surface-container-highest flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigateTo('redaktor', { docId: doc.id })}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary text-on-primary hover:bg-primary-container transition-colors text-[12px] font-semibold shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Редактор данных (SCR-06)</span>
              <kbd className="font-code text-[9px] bg-on-primary/20 px-1 rounded">F4</kbd>
            </button>

            <button
              onClick={() => navigateTo('sverka', { docId: doc.id })}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-[12px] shadow-xs transition-colors border border-surface-container-highest cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">fact_check</span>
              <span>Сверка со сканом (SCR-07)</span>
              <kbd className="font-code text-[9px] bg-surface-container-high px-1 rounded text-secondary">F5</kbd>
            </button>

            {doc.relations.length > 0 && (
              <>
                <div className="w-px h-4 bg-outline-variant mx-0.5"></div>
                <button
                  onClick={handleParentClick}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-[11px] shadow-xs transition-colors border border-surface-container-highest cursor-pointer"
                  title="Перейти к родительскому документу"
                >
                  <span className="material-symbols-outlined text-[15px] text-secondary">account_tree</span>
                  <span>Родитель: <strong className="font-code font-bold text-primary">{doc.relations[0].id}</strong></span>
                  <span className="px-1 rounded bg-secondary-container text-on-secondary-container text-[10px]">1 связь</span>
                </button>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMoreDropdownOpen(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-secondary hover:text-on-surface text-[11px] shadow-xs border border-surface-container-highest cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              <span>Ещё</span>
            </button>

            {isMoreDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-60 bg-surface-container-lowest shadow-xl rounded-lg p-1 z-50 flex flex-col gap-0.5 text-[12px] border border-surface-container-highest"
                onMouseLeave={() => setIsMoreDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsMoreDropdownOpen(false);
                    setIsMoveModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-container text-left text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">drive_file_move</span>
                  <span>Переместить документ...</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreDropdownOpen(false);
                    setIsHistoryDrawerOpen(true);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-container text-left text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">history</span>
                  <span>История изменений (r1)</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreDropdownOpen(false);
                    showToast('Экспорт архивного пакета в формат PDF/A-1b подготовлен');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-container text-left text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">picture_as_pdf</span>
                  <span>Экспорт в PDF/A-1b (Архив)</span>
                </button>
                <div className="h-px bg-surface-container my-0.5"></div>
                <button
                  onClick={() => {
                    setIsMoreDropdownOpen(false);
                    setIsSoftDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-error-container hover:text-error text-left text-error cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">archive</span>
                  <span>Убрать из списка (SCR-16)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Grid: Split Dual-Panel */}
      <div className="grid grid-cols-12 gap-3 w-full items-start">
        {/* LEFT PANEL: Document Scan Viewport */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-2">
          <div className="bg-surface-container-lowest rounded-lg border border-surface-container-highest shadow-xs overflow-hidden flex flex-col">
            {/* Viewer Controls Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-high border-b border-surface-container-highest">
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-highest text-secondary cursor-pointer"
                  title="Уменьшить"
                >
                  <span className="material-symbols-outlined text-[15px]">remove</span>
                </button>
                <span className="font-code px-1 min-w-[38px] text-center text-on-surface font-semibold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(180, prev + 15))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-highest text-secondary cursor-pointer"
                  title="Увеличить"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-highest text-secondary text-[10px] ml-1 cursor-pointer"
                >
                  По ширине
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-secondary">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-highest text-secondary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="font-code font-bold text-on-surface">{currentPage}</span>
                <span>из</span>
                <span className="font-code">{doc.pageCount}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(doc.pageCount, prev + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-highest text-secondary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>

              <label className="flex items-center gap-1 text-[11px] text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHighlightsEnabled}
                  onChange={e => setIsHighlightsEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-primary"
                />
                <span>Подсветка сверок</span>
              </label>
            </div>

            {/* Paper Document Canvas Viewport */}
            <div className="relative bg-surface-dim overflow-auto max-h-[640px] min-h-[520px] p-4 flex justify-center items-start">
              <div
                className="relative bg-surface-container-lowest shadow-md text-on-surface transition-all duration-150 border border-surface-container-highest"
                style={{
                  width: `${(520 * zoomLevel) / 100}px`,
                  minHeight: `${(720 * zoomLevel) / 100}px`,
                  padding: '36px 30px'
                }}
              >
                {/* Simulated Document Heading */}
                <div className="text-center pb-3 mb-3 border-b border-surface-container">
                  <div className="text-[10px] text-outline uppercase tracking-wider mb-1">
                    Приложение № 1 к Договору найма № 42
                  </div>
                  <h2 className="text-[15px] font-bold text-on-surface uppercase tracking-tight">
                    АКТ ПРИЁМА-ПЕРЕДАЧИ
                  </h2>
                  <div className="text-[11px] font-semibold text-secondary">
                    жилого помещения и находящегося в нём имущества
                  </div>
                </div>

                {/* Date & Location */}
                <div className="flex justify-between items-center my-3 text-[11px]">
                  <span className="text-secondary">г. Санкт-Петербург</span>
                  <div
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      isHighlightsEnabled ? 'bg-primary-fixed/40 text-on-primary-fixed ring-1 ring-primary' : 'bg-transparent'
                    }`}
                    title="Сверено со сканом: Дата составления акта"
                  >
                    <span className="font-code font-bold">12 октября 2026 г.</span>
                  </div>
                </div>

                {/* Document Body */}
                <div className="text-[11.5px] leading-relaxed text-justify mb-3 text-on-surface">
                  Мы, нижеподписавшиеся, Наймодатель{' '}
                  <span className="bg-surface-container px-1 rounded text-secondary italic">
                    [Васильев Андрей Сергеевич]
                  </span>
                  , с одной стороны, и Наниматель{' '}
                  <span className="font-semibold text-on-surface">Соколов Алексей Николаевич</span>
                  , с другой стороны, составили настоящий акт{' '}
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded font-bold font-code text-[11px] ${
                      isHighlightsEnabled ? 'bg-primary-fixed/40 text-on-primary-fixed ring-1 ring-primary' : ''
                    }`}
                  >
                    № АПП-42
                  </span>{' '}
                  о том, что Наймодатель сдал, а Наниматель принял во временное владение и пользование изолированное жилое помещение.
                </div>

                <div className="text-[11.5px] leading-relaxed text-justify mb-3">
                  <strong>1. Описание помещения:</strong> Квартира расположена по адресу:{' '}
                  <span className="px-1 py-0.5 bg-secondary-container text-on-secondary-container rounded">
                    г. Санкт-Петербург, Московский пр., д. 182, кв. 42
                  </span>
                  . Общая площадь составляет 64.5 кв. м. Состояние помещения признано сторонами удовлетворительным.
                </div>

                <div className="text-[11.5px] leading-relaxed text-justify mb-4 p-2 bg-surface-container-low rounded">
                  <strong>2. Ключи и доступ:</strong> Одновременно с передачей помещения Нанимателю переданы ключи от входной двери в количестве{' '}
                  <span className="font-code font-bold text-primary">2 (два) комплекта</span>, а также электронный чип доступа в парадное.
                </div>

                {/* Signatures */}
                <div className="mt-8 pt-4 border-t border-surface-container flex items-center justify-between text-[10px] text-outline">
                  <span>Лист {currentPage} из {doc.pageCount}</span>
                  <span>Архивная неизменяемая копия WORM</span>
                </div>
              </div>
            </div>

            {/* Viewport Footer Status */}
            <div className="px-3 py-1.5 bg-surface-container-low border-t border-surface-container-highest flex items-center justify-between text-[11px] text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                <span className="font-semibold text-on-surface">Режим:</span>
                <span>Только чтение</span>
                <span>•</span>
                <span className="text-primary">Файл защищён от изменений</span>
              </div>
              <span className="font-code text-[10px]">SHA-256 Verified</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Structured Metadata & OCR */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-3">
          {/* Validation & Verification Metrics Summary */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-primary">rule</span>
                <span>Сводка валидации и контроля</span>
              </div>
              <span className="text-[11px] text-secondary">Статусы независимы</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">checklist</span>
                    Полнота данных
                  </span>
                  <span className="font-code text-[11px] font-bold text-on-surface">
                    {Math.round((doc.completeness.filled / doc.completeness.total) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(doc.completeness.filled / doc.completeness.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="text-secondary">{doc.completeness.filled} из {doc.completeness.total} заполнено</span>
                  {doc.completeness.filled < doc.completeness.total && (
                    <span className="text-error font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">warning</span>
                      {doc.completeness.total - doc.completeness.filled} пусто
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
                    Сверка со сканом
                  </span>
                  <span className="font-code text-[11px] font-bold text-primary">
                    {Math.round((doc.verification.verified / doc.verification.total) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(doc.verification.verified / doc.verification.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="text-secondary">{doc.verification.verified} из {doc.verification.total} сверено</span>
                  <span className="text-secondary font-code">{doc.verification.total - doc.verification.verified} ожидает</span>
                </div>
              </div>
            </div>
          </div>

          {/* Relation with parent doc */}
          {doc.relations.length > 0 && (
            <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
                  <span>Двусторонняя связь документов</span>
                </div>
                <span className="text-[10px] text-secondary font-code">Внешний ключ SQLite</span>
              </div>
              <div
                onClick={handleParentClick}
                className="flex items-center justify-between p-2 bg-surface-container rounded hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-highest"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">call_received</span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 text-[12px] text-on-surface font-semibold truncate">
                      <span className="font-code text-primary">{doc.relations[0].id}</span>
                      <span className="truncate">{doc.relations[0].name}</span>
                    </div>
                    <span className="text-[10px] text-secondary">Родительский документ • Папка «Жильё» • Сохранён</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
              </div>
            </div>
          )}

          {/* Structured Attributes Table */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-primary">table_chart</span>
                <span>Структурированные реквизиты</span>
              </div>
              <button
                onClick={() => navigateTo('redaktor', { docId: doc.id })}
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Редактировать в F4</span>
                <span className="material-symbols-outlined text-[12px]">launch</span>
              </button>
            </div>

            <div className="flex flex-col divide-y divide-surface-container text-[12px]">
              {doc.fields.map(f => (
                <div key={f.id} className="py-2 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <span>{f.label}</span>
                      {f.required && <span className="text-error">*</span>}
                    </span>
                    {f.isVerified ? (
                      <span className="px-1.5 py-0.5 rounded bg-primary-fixed/40 text-on-primary-fixed text-[10px] font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px] text-primary">verified</span>
                        Сверено
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary text-[10px] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">pending</span>
                        Не сверено
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    {f.value ? (
                      <span className="font-code font-medium text-on-surface">{f.value}</span>
                    ) : (
                      <span className="text-error italic text-[11px] font-medium">Значение не заполнено</span>
                    )}
                    {f.citation && (
                      <span className="text-[10px] text-secondary truncate max-w-[200px]">{f.citation}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Transcript Card */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-highest shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-secondary">text_snippet</span>
                <span>Текстовая расшифровка (OCR)</span>
              </div>
              <button
                onClick={() => setIsTranscriptModalOpen(true)}
                className="px-2 py-0.5 rounded bg-primary text-on-primary text-[11px] font-semibold hover:bg-primary-container transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                <span>Развернуть расшифровку</span>
              </button>
            </div>
            <div className="p-2 bg-surface-container-low rounded border border-surface-container-highest font-code text-[11px] text-on-surface-variant leading-relaxed max-h-24 overflow-y-auto">
              {doc.transcriptExcerpt}
            </div>
          </div>
        </div>
      </div>

      {/* Move Path Modal */}
      {isMoveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4"
          onClick={() => setIsMoveModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-lg shadow-xl max-w-lg w-full p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-on-surface font-semibold text-[14px]">
              <span className="material-symbols-outlined text-primary text-[22px]">drive_file_move</span>
              <span>Перемещение документа в другой раздел</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded flex flex-col gap-2 text-[12px]">
              <div>
                <span className="text-secondary font-semibold">Текущее логическое размещение:</span>
                <div className="text-on-surface font-code bg-surface-container-lowest p-1.5 rounded mt-0.5 border border-surface-container-highest">
                  {doc.path} / {doc.name}
                </div>
              </div>
              <div className="flex justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </div>
              <div>
                <span className="text-primary font-semibold">Новое целевое размещение:</span>
                <input
                  type="text"
                  value={targetMovePath}
                  onChange={e => setTargetMovePath(e.target.value)}
                  className="w-full text-on-surface font-code bg-surface-container-lowest p-1.5 rounded mt-0.5 border border-primary text-[12px] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="px-3 py-1 rounded hover:bg-surface-container text-secondary text-[12px] cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={confirmMove}
                className="px-3 py-1 rounded bg-primary text-on-primary text-[12px] font-semibold hover:bg-primary-container shadow-xs cursor-pointer"
              >
                Подтвердить перемещение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft-Delete to SCR-16 Modal */}
      {isSoftDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4"
          onClick={() => setIsSoftDeleteModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-lg shadow-xl max-w-md w-full p-4 flex flex-col gap-3 border border-surface-container-highest"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-error font-semibold text-[14px]">
              <span className="material-symbols-outlined text-[22px]">archive</span>
              <span>Убрать запись из Журнала?</span>
            </div>
            <p className="text-[12px] text-on-surface leading-normal">
              Документ <strong className="font-code">{doc.id}</strong> будет перемещён в раздел «Убранные» (SCR-16). Он перестанет отображаться в активном Журнале, но файл и связи сохранятся. Вы сможете восстановить его в любой момент.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setIsSoftDeleteModalOpen(false)}
                className="px-3 py-1 rounded hover:bg-surface-container text-secondary text-[12px] cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 rounded bg-error text-on-error text-[12px] font-semibold hover:opacity-90 shadow-xs cursor-pointer"
              >
                Убрать в раздел «Убранные»
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {isHistoryDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/20 flex justify-end"
          onClick={() => setIsHistoryDrawerOpen(false)}
        >
          <div
            className="w-80 bg-surface-container-lowest shadow-2xl h-full flex flex-col border-l border-surface-container-highest animate-in slide-in-from-right duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-surface-container-highest bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-primary">history</span>
                <span>История изменений ({doc.id})</span>
              </div>
              <button onClick={() => setIsHistoryDrawerOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex flex-col gap-2.5 text-[12px]">
              <div className="p-2.5 rounded bg-surface-container border border-primary/30 flex flex-col gap-1">
                <div className="flex justify-between items-center font-bold text-primary text-[11px]">
                  <span>Ревизия r1 (текущая)</span>
                  <span className="font-code text-secondary">{doc.date}</span>
                </div>
                <p className="text-on-surface">
                  Сверка полей со сканом завершена. Зафиксированы реквизиты договора и акты показаний.
                </p>
                <span className="text-[10px] text-outline">Автор: Локальный пользователь</span>
              </div>
              <div className="p-2.5 rounded bg-surface-container-low flex flex-col gap-1">
                <div className="flex justify-between items-center font-semibold text-secondary text-[11px]">
                  <span>Ревизия r0 (первичная)</span>
                  <span className="font-code text-outline">01.10.2026</span>
                </div>
                <p className="text-secondary">
                  Первичный импорт из очереди Входящих. Распознан предварительный OCR текст.
                </p>
                <span className="text-[10px] text-outline">Автор: Автоматический импорт</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Transcript Window Modal */}
      {isTranscriptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4"
          onClick={() => setIsTranscriptModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-highest max-w-3xl w-full flex flex-col overflow-hidden max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-surface-container-high px-4 py-2 flex items-center justify-between border-b border-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">description</span>
                <span className="font-semibold text-[13px] text-on-surface">
                  Текстовая расшифровка • {doc.id} {doc.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-surface-container text-secondary text-[10px] font-code">
                  UTF-8 Plain Text
                </span>
              </div>
              <button onClick={() => setIsTranscriptModalOpen(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low px-4 py-1.5 border-b border-surface-container-highest flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <span className="material-symbols-outlined text-[15px] text-outline">search</span>
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={e => setTranscriptSearch(e.target.value)}
                  placeholder="Поиск по тексту расшифровки..."
                  className="bg-transparent text-[12px] text-on-surface outline-none w-full"
                />
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(doc.fullTranscript);
                  showToast('Полный текст расшифровки скопирован в буфер обмена');
                }}
                className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">content_copy</span>
                <span>Копировать всё</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[500px] font-code text-[12px] text-on-surface leading-relaxed whitespace-pre-wrap select-text">
              {doc.fullTranscript}
            </div>

            <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container-highest flex justify-end">
              <button
                onClick={() => setIsTranscriptModalOpen(false)}
                className="px-3 py-1 rounded bg-surface-container text-on-surface text-[11px] hover:bg-surface-container-high"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
