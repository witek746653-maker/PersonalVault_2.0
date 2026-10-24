import React from 'react';
import { useVault } from '../../context/VaultContext';
import { AppRoute } from '../../types/vault';

export const Sidebar: React.FC = () => {
  const {
    activeRoute,
    navigateTo,
    inboxItems,
    drafts,
    plans,
    documents,
    openDevModal
  } = useVault();

  // Active documents vs archived count
  const archivedCount = documents.filter(d => d.isArchived).length;
  const activePlansCount = plans.filter(p => p.status === 'planned').length;

  const isNavActive = (route: AppRoute) => {
    if (activeRoute === route) return true;
    // Map preparation pipeline subroutes to inbox
    if (route === 'vkhodyashchie' && ['sostav', 'predproverka', 'klassifikaciya', 'redaktor', 'sverka', 'itog', 'rezultat'].includes(activeRoute)) {
      return true;
    }
    // Map card view to journal
    if (route === 'zhurnal' && activeRoute === 'kartochka') {
      return true;
    }
    // Map template builder to templates
    if (route === 'shablony' && activeRoute === 'shablon-redaktor') {
      return true;
    }
    return false;
  };

  const getLinkClasses = (route: AppRoute) => {
    const active = isNavActive(route);
    return `flex items-center justify-between px-2.5 py-1.5 rounded text-[12px] transition-all cursor-pointer ${
      active
        ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`;
  };

  return (
    <aside className="fixed left-0 top-9 bottom-0 w-[210px] bg-surface-container-low z-40 flex flex-col justify-between py-2 border-r border-surface-container-highest select-none shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-1 overflow-y-auto px-1.5 flex-1 min-h-0">
        {/* Group: ДОКУМЕНТЫ */}
        <div className="px-2 pt-1 pb-0.5 font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
          Документы
        </div>
        <nav className="flex flex-col gap-[2px]">
          <button
            onClick={() => navigateTo('zhurnal')}
            className={getLinkClasses('zhurnal')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Журнал</span>
            </div>
          </button>

          <button
            onClick={() => navigateTo('vkhodyashchie')}
            className={getLinkClasses('vkhodyashchie')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">inbox</span>
              <span>Входящие</span>
            </div>
            {inboxItems.length > 0 && (
              <span className="px-1.5 py-[1px] rounded-full text-[10px] font-code bg-secondary-container text-on-secondary-container">
                {inboxItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('chernoviki')}
            className={getLinkClasses('chernoviki')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">edit_document</span>
              <span>Черновики</span>
            </div>
            {drafts.length > 0 && (
              <span className="px-1.5 py-[1px] rounded-full text-[10px] font-code bg-secondary-container text-on-secondary-container">
                {drafts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('plany')}
            className={getLinkClasses('plany')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
              <span>Планы</span>
            </div>
            {activePlansCount > 0 && (
              <span className="px-1.5 py-[1px] rounded-full text-[10px] font-code bg-secondary-container text-on-secondary-container">
                {activePlansCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('ubrannye')}
            className={getLinkClasses('ubrannye')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">archive</span>
              <span>Убранные</span>
            </div>
            {archivedCount > 0 && (
              <span className="px-1.5 py-[1px] rounded-full text-[10px] font-code bg-surface-container text-secondary">
                {archivedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Group: СПРАВОЧНИКИ */}
        <div className="px-2 pt-2.5 pb-0.5 font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
          Справочники
        </div>
        <nav className="flex flex-col gap-[2px]">
          <button
            onClick={() => navigateTo('moi-dannye')}
            className={getLinkClasses('moi-dannye')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Мои данные</span>
            </div>
          </button>

          <button
            onClick={() => navigateTo('shablony')}
            className={getLinkClasses('shablony')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Шаблоны</span>
            </div>
          </button>
        </nav>

        {/* Group: ДОПОЛНИТЕЛЬНО */}
        <div className="px-2 pt-2.5 pb-0.5 font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
          Дополнительно
        </div>
        <div className="flex flex-col gap-[2px]">
          <button
            onClick={() => openDevModal('Сводка здоровья')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-[12px] text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">vital_signs</span>
              <span>Сводка здоровья</span>
            </div>
            <span className="text-[9px] text-secondary bg-surface-container px-1 py-0.5 rounded font-mono">DEV</span>
          </button>

          <button
            onClick={() => openDevModal('Помощник')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-[12px] text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>Помощник</span>
            </div>
            <span className="text-[9px] text-secondary bg-surface-container px-1 py-0.5 rounded font-mono">DEV</span>
          </button>
        </div>
      </div>

      {/* Group: СИСТЕМА & ДИСК (Bottom fixed area) */}
      <div className="px-1.5 pt-2 flex flex-col gap-1.5 border-t border-surface-container-highest">
        <div className="px-2 pb-0.5 font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold">
          Система
        </div>
        <nav className="flex flex-col gap-[2px]">
          <button
            onClick={() => navigateTo('obsluzhivanie')}
            className={getLinkClasses('obsluzhivanie')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">build_circle</span>
              <span>Обслуживание архива</span>
            </div>
          </button>

          <button
            onClick={() => navigateTo('nastroiki')}
            className={getLinkClasses('nastroiki')}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              <span>Настройки</span>
            </div>
          </button>
        </nav>

        {/* Disk space card */}
        <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-highest flex flex-col gap-1 mt-0.5">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[11px] font-medium">Локальный диск</span>
            <span className="font-code text-[11px] text-primary font-bold">4.2 GB свободно</span>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[42%]"></div>
          </div>
          <div className="text-[10px] text-outline truncate pt-0.5">Автономный локальный архив</div>
        </div>
      </div>
    </aside>
  );
};
