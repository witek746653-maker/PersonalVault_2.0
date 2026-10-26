/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVault } from '../../context/VaultContext';
import { ScreenId } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    resetToScreen,
    previousScreen,
    inboxItems,
    draftSessions,
    plans,
    documents,
    isSidebarCollapsed,
    toggleSidebar,
  } = useVault();

  const trashedCount = documents.filter((d) => d.status === 'trashed').length;
  const activePlansCount = plans.filter((p) => p.status === 'Запланирован').length;

  const navItems: { label: string; icon: string; screen: ScreenId; badge?: number | string; badgeColor?: string }[] = [
    { label: 'Журнал', icon: 'menu_book', screen: 'SCR-01' },
    {
      label: 'Входящие',
      icon: 'inbox',
      screen: 'SCR-02',
      badge: inboxItems.length,
      badgeColor: 'bg-[#12827c] text-white',
    },
    {
      label: 'Черновики',
      icon: 'draft',
      screen: 'SCR-10',
      badge: draftSessions.length,
      badgeColor: 'bg-[#d7e4ec] text-[#3e4948]',
    },
    {
      label: 'Планы',
      icon: 'calendar_today',
      screen: 'SCR-15',
      badge: activePlansCount,
      badgeColor: 'bg-[#d7e4ec] text-[#3e4948]',
    },
    {
      label: 'Убранные',
      icon: 'archive',
      screen: 'SCR-16',
      badge: trashedCount > 0 ? trashedCount : undefined,
      badgeColor: 'bg-[#d7e4ec] text-[#3e4948]',
    },
  ];

  const directoryItems: { label: string; icon: string; screen: ScreenId }[] = [
    { label: 'Мои данные', icon: 'folder_shared', screen: 'SCR-14' },
    { label: 'Шаблоны', icon: 'content_copy', screen: 'SCR-12' },
  ];

  const extraItems: { label: string; icon: string; screen: ScreenId; tag?: string }[] = [
    { label: 'Сводка здоровья', icon: 'vital_signs', screen: 'SCR-19', tag: 'Health' },
    { label: 'Помощник', icon: 'smart_toy', screen: 'SCR-20', tag: 'AI' },
  ];

  const systemItems: { label: string; icon: string; screen: ScreenId }[] = [
    { label: 'Обслуживание архива', icon: 'build_circle', screen: 'SCR-18' },
    { label: 'Настройки', icon: 'settings', screen: 'SCR-17' },
  ];

  const isCurrentActive = (scr: ScreenId) => {
    // If inside document card SCR-11, treat as active under originating section
    if (currentScreen === 'SCR-11') {
      if (previousScreen && scr === previousScreen) {
        return true;
      }
      return scr === 'SCR-01';
    }
    // If inside template editor SCR-13, treat as active under Templates
    if (scr === 'SCR-12' && currentScreen === 'SCR-13') {
      return true;
    }
    // If inside editor SCR-06 or verification SCR-07 opened directly from Journal
    if ((currentScreen === 'SCR-06' || currentScreen === 'SCR-07') && previousScreen === 'SCR-01') {
      return scr === 'SCR-01';
    }
    // If user is inside pipeline steps 2-9, treat as active under Inbox
    if (
      scr === 'SCR-02' &&
      [
        'SCR-02',
        'SCR-03',
        'SCR-04',
        'SCR-05',
        'SCR-06',
        'SCR-07',
        'SCR-08',
        'SCR-09',
      ].includes(currentScreen)
    ) {
      return true;
    }
    return currentScreen === scr;
  };

  return (
    <aside
      className={`shrink-0 bg-[#e9f6fd] z-30 flex flex-col justify-between border-r border-[#d7e4ec] select-none h-full transition-all duration-200 ${
        isSidebarCollapsed ? 'w-14' : 'w-48'
      }`}
    >
      {/* Scrollable nav sections */}
      <div className="flex flex-col pt-1.5 overflow-y-auto flex-1 min-h-0">
        {/* Toggle Collapse Button Top */}
        <div className="flex items-center justify-between px-2 pb-1">
          {!isSidebarCollapsed && (
            <span className="px-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
              ДОКУМЕНТЫ
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded text-[#536166] hover:bg-[#ddeaf2] hover:text-[#111d23] transition-colors ${
              isSidebarCollapsed ? 'mx-auto' : 'ml-auto'
            }`}
            title={isSidebarCollapsed ? 'Развернуть боковое меню' : 'Свернуть боковое меню'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSidebarCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        </div>

        {/* Section 1: ДОКУМЕНТЫ */}
        <nav className="flex flex-col px-1 gap-[1px]">
          {navItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => resetToScreen(item.screen, item.label)}
                title={item.label}
                className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-between'
                } h-[32px] px-2 rounded text-[12px] transition-colors text-left relative ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      active ? 'text-[#006763]' : 'text-[#6e7978]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {item.badge !== undefined && (
                  isSidebarCollapsed ? (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#12827c]" />
                  ) : (
                    <span
                      className={`px-1.5 py-[1px] rounded text-[10px] font-mono font-medium ${
                        item.badgeColor || 'bg-[#d7e4ec] text-[#3e4948]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>

        <div className="my-1.5 mx-2 border-t border-[#d7e4ec]"></div>

        {/* Section 2: СПРАВОЧНИКИ */}
        {!isSidebarCollapsed && (
          <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
            СПРАВОЧНИКИ
          </div>
        )}
        <nav className="flex flex-col px-1 gap-[1px]">
          {directoryItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => resetToScreen(item.screen, item.label)}
                title={item.label}
                className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-between'
                } h-[32px] px-2 rounded text-[12px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      active ? 'text-[#006763]' : 'text-[#6e7978]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="my-1.5 mx-2 border-t border-[#d7e4ec]"></div>

        {/* Section 3: ДОПОЛНИТЕЛЬНО */}
        {!isSidebarCollapsed && (
          <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
            ДОПОЛНИТЕЛЬНО
          </div>
        )}
        <nav className="flex flex-col px-1 gap-[1px]">
          {extraItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => resetToScreen(item.screen, item.label)}
                title={item.label}
                className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-between'
                } h-[32px] px-2 rounded text-[12px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      active ? 'text-[#006763]' : 'text-[#6e7978]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.tag && (
                  <span className="px-1 py-[0.5px] rounded bg-[#d6e5ec] text-[#59676c] text-[9px] font-mono">
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pinned Bottom System Section */}
      <div className="p-1 border-t border-[#d7e4ec] bg-[#e9f6fd] shrink-0">
        {!isSidebarCollapsed && (
          <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
            СИСТЕМА
          </div>
        )}
        <nav className="flex flex-col gap-[1px] mb-1">
          {systemItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => resetToScreen(item.screen, item.label)}
                title={item.label}
                className={`flex items-center ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-between'
                } h-[28px] px-2 rounded text-[11px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      active ? 'text-[#006763]' : 'text-[#6e7978]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Disk & Engine Badge */}
        {!isSidebarCollapsed ? (
          <div className="p-2 rounded bg-white border border-[#d7e4ec] flex flex-col gap-0.5 text-[10px] font-mono text-[#536166]">
            <div className="flex items-center justify-between">
              <span className="text-[#6e7978]">Диск:</span>
              <span className="text-[#111d23] font-semibold">4.2 ГБ свободно</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6e7978]">SQLite:</span>
              <span className="text-[#006763] font-medium">3.45.1 WAL</span>
            </div>
          </div>
        ) : (
          <div
            className="py-1 text-center font-mono text-[9px] text-[#006763] font-bold"
            title="Диск: 4.2 ГБ свободно • SQLite 3.45.1"
          >
            4.2G
          </div>
        )}
      </div>
    </aside>
  );
};
