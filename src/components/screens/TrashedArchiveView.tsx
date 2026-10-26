import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { ArchiveDocument } from '../../types';
import { 
  Archive, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  Search, 
  Eye, 
  Lock
} from 'lucide-react';

export const TrashedArchiveView: React.FC = () => {
  const { 
    documents, 
    restoreDocumentFromTrash, 
    setCurrentScreen, 
    setActiveDocId,
    isVeraCryptMounted,
    showToast 
  } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  
  const trashedDocs = documents.filter((d: ArchiveDocument) => d.status === 'trashed');

  const visibleDocs = trashedDocs.filter((d: ArchiveDocument) => {
    if (d.zone === 'secret' && !isVeraCryptMounted) return false;
    if (!searchQuery) return true;
    return d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.archivePath.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const [selectedDocForInspect, setSelectedDocForInspect] = useState<string | null>(
    visibleDocs[0]?.id || null
  );

  const inspectedDoc = visibleDocs.find((d: ArchiveDocument) => d.id === selectedDocForInspect) || visibleDocs[0];

  const handleRestore = (id: string, title: string) => {
    restoreDocumentFromTrash(id);
    showToast(`Документ «${title}» успешно восстановлен в основной Журнал`);
  };

  return (
    <div className="flex flex-col w-full text-[#111d23] gap-3">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Убранные документы (Изолированный архив)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Политика Safe Archive (Без безвозвратного удаления)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Документы, временно скрытые из оперативного журнала. Файлы сохраняются в неизменном виде с сохранением контрольных сумм и могут быть восстановлены в 1 клик.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setCurrentScreen('SCR-01')}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            ← В Журнал документов
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex flex-col lg:flex-row bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden min-h-[560px]">
        {/* Table List */}
        <div className="flex-1 min-w-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
          <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-slate-500 font-medium">
              Скрыто документов: <span className="font-mono text-slate-800 font-semibold">{visibleDocs.length}</span>
            </div>

            <div className="relative w-full sm:w-64 lg:w-80">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по убранным..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006763]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleDocs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Archive className="w-12 h-12 text-slate-200 mb-3 stroke-[1.5]" />
                <p className="font-medium text-slate-600">Раздел убранных документов пуст</p>
                <p className="text-xs text-slate-400 mt-1">Все активные документы отображаются в основном журнале.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-4">Документ</th>
                    <th className="py-2.5 px-3">Категория</th>
                    <th className="py-2.5 px-3">Дата документа</th>
                    <th className="py-2.5 px-3">Зона</th>
                    <th className="py-2.5 px-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleDocs.map((doc: ArchiveDocument) => {
                    const isSelected = inspectedDoc?.id === doc.id;
                    return (
                      <tr 
                        key={doc.id}
                        onClick={() => setSelectedDocForInspect(doc.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-800">{doc.title}</p>
                              <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">{doc.archivePath}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{doc.category}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{doc.date}</td>
                        <td className="py-3 px-3">
                          {doc.zone === 'secret' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" /> Секретно
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              Открыто
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(doc.id, doc.title);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-[#006763] hover:bg-teal-50 border border-teal-200 rounded flex items-center gap-1 ml-auto transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Восстановить
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Inspector Drawer */}
        {inspectedDoc && (
          <div className="w-full lg:w-80 xl:w-[350px] 2xl:w-[380px] shrink-0 bg-slate-50/80 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#006763]" />
                Инспектор изолированного документа
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Название:</span>
                  <span className="font-semibold text-slate-800">{inspectedDoc.title}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Архивный путь:</span>
                  <span className="font-mono text-[11px] text-slate-700 break-all bg-slate-100 p-1.5 rounded block">
                    {inspectedDoc.archivePath}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Размер:</span>
                    <span className="font-mono text-slate-700">{inspectedDoc.fileSize}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Страниц:</span>
                    <span className="font-mono text-slate-700">{inspectedDoc.pagesCount}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-1">SHA-256 Контрольная сумма:</span>
                  <span className="font-mono text-[10px] text-slate-500 break-all bg-slate-50 p-1 rounded border border-slate-200/50 block">
                    {inspectedDoc.sha256}
                  </span>
                </div>
              </div>

              {/* Policy explanation */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  Гарантия целостности данных
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Согласно архитектурному принципу PersonalVault 2.0, в приложении отсутствует деструктивная корзина с безвозвратным удалением. 
                  Файлы физически хранятся в <code>/archive/vault_concealed/</code> без риска случайной утери оригиналов.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => handleRestore(inspectedDoc.id, inspectedDoc.title)}
                className="w-full py-2 bg-[#006763] hover:bg-[#00524f] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Вернуть в основной Журнал
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
