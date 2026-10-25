/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVault } from '../../context/VaultContext';
import { ScreenId } from '../../types';

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, inboxItems, draftSessions, plans, documents } = useVault();

  const trashedCount = documents.filter(d => d.status === 'trashed').length;
  const activePlansCount = plans.filter(p => p.status === 'Запланирован').length;

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
    // If inside template editor SCR-13, treat as active under Templates
    if (scr === 'SCR-12' && currentScreen === 'SCR-13') {
      return true;
    }
    // If inside document card SCR-11, treat as active under Journal
    if (scr === 'SCR-01' && currentScreen === 'SCR-11') {
      return true;
    }
    return currentScreen === scr;
  };

  return (
    <aside className="fixed left-0 top-9 bottom-0 w-48 bg-[#e9f6fd] z-40 flex flex-col justify-between border-r border-[#d7e4ec] select-none">
      {/* Scrollable nav sections */}
      <div className="flex flex-col pt-1 overflow-y-auto flex-1 min-h-0">
        {/* Section 1: ДОКУМЕНТЫ */}
        <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
          ДОКУМЕНТЫ
        </div>
        <nav className="flex flex-col px-1 gap-[1px]">
          {navItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center justify-between h-[30px] px-2 rounded text-[12px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`material-symbols-outlined text-[16px] ${active ? 'text-[#006763]' : 'text-[#6e7978]'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-[1px] rounded text-[10px] font-mono font-medium ${item.badgeColor || 'bg-[#d7e4ec] text-[#3e4948]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="my-1.5 mx-2 border-t border-[#d7e4ec]"></div>

        {/* Section 2: СПРАВОЧНИКИ */}
        <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
          СПРАВОЧНИКИ
        </div>
        <nav className="flex flex-col px-1 gap-[1px]">
          {directoryItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center justify-between h-[30px] px-2 rounded text-[12px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`material-symbols-outlined text-[16px] ${active ? 'text-[#006763]' : 'text-[#6e7978]'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="my-1.5 mx-2 border-t border-[#d7e4ec]"></div>

        {/* Section 3: ДОПОЛНИТЕЛЬНО */}
        <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
          ДОПОЛНИТЕЛЬНО
        </div>
        <nav className="flex flex-col px-1 gap-[1px]">
          {extraItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center justify-between h-[30px] px-2 rounded text-[12px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`material-symbols-outlined text-[16px] ${active ? 'text-[#006763]' : 'text-[#6e7978]'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.tag && (
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
        <div className="px-3 py-1 text-[10px] font-bold text-[#6e7978] uppercase tracking-wider">
          СИСТЕМА
        </div>
        <nav className="flex flex-col gap-[1px] mb-1">
          {systemItems.map((item) => {
            const active = isCurrentActive(item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => setCurrentScreen(item.screen)}
                className={`flex items-center justify-between h-[28px] px-2 rounded text-[11px] transition-colors text-left ${
                  active
                    ? 'bg-[#e3f0f8] text-[#006763] font-semibold border-l-2 border-[#006763]'
                    : 'text-[#3e4948] hover:bg-[#ddeaf2] hover:text-[#111d23]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`material-symbols-outlined text-[15px] ${active ? 'text-[#006763]' : 'text-[#6e7978]'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Disk & Engine Badge */}
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
      </div>
    </aside>
  );
};
