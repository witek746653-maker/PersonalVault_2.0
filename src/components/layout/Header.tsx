/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export const Header: React.FC = () => {
  const { isVeraCryptMounted, toggleVeraCrypt, currentScreen, setCurrentScreen } = useVault();
  const [searchVal, setSearchVal] = useState('');

  return (
    <header className="fixed top-0 left-0 right-0 h-9 bg-[#e9f6fd] z-50 flex items-center justify-between px-3 select-none border-b border-[#d7e4ec]">
      {/* Brand & Storage Indicator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentScreen('SCR-01')}
          className="flex items-center gap-1.5 text-[#006763] hover:opacity-80 transition-opacity mr-3"
        >
          <span className="material-symbols-outlined text-[16px] text-[#006763]">lock</span>
          <span className="font-semibold text-[13px] tracking-tight text-[#111d23]">PersonalVault 2.0</span>
        </button>

        <div
          onClick={toggleVeraCrypt}
          title="Нажмите для переключения статуса тома VeraCrypt (UX-032)"
          className="flex items-center gap-1.5 px-2 py-[2px] rounded bg-[#e3f0f8] hover:bg-[#ddeaf2] text-[#3e4948] text-[11px] font-medium cursor-pointer transition-colors border border-[#d7e4ec]"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isVeraCryptMounted ? 'bg-[#006763]' : 'bg-[#ba1a1a]'}`}
          />
          <span className="text-[11px]">
            {isVeraCryptMounted ? 'Локальное хранилище' : 'VeraCrypt: Отключен'}
          </span>
          <span className="text-[#6e7978] text-[10px]">|</span>
          <span className="font-mono text-[11px] text-[#536166]">
            {isVeraCryptMounted ? 'Open + Secret (Mounted)' : 'C:\\Vault\\Open (Secret Lock)'}
          </span>
        </div>
      </div>

      {/* Global Quick Search Input */}
      <div className="flex-1 max-w-sm mx-4">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-2 text-[14px] text-[#6e7978] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-[24px] pl-6 pr-8 bg-white text-[#111d23] text-[12px] rounded border border-[#d7e4ec] focus:outline-none focus:border-[#006763] placeholder-[#6e7978]"
            placeholder="Быстрый поиск по хранилищу (Ctrl+K)..."
          />
          <kbd className="absolute right-1.5 font-mono text-[9px] bg-[#e3f0f8] px-1 py-[1px] rounded text-[#536166]">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right User & Window Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#536166] text-[12px] mr-2">
          <span className="material-symbols-outlined text-[14px] text-[#006763]">sync_saved_locally</span>
          <span className="text-[11px] text-[#3e4948] hidden sm:inline">Синхронизировано</span>
        </div>

        <button
          onClick={() => setCurrentScreen('SCR-17')}
          className="w-6 h-6 rounded-full bg-[#006763] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          title="Профиль и настройки"
        >
          <span className="material-symbols-outlined text-white text-[14px]">person</span>
        </button>

        <div className="flex items-center ml-1 border-l border-[#d7e4ec] pl-1">
          <button
            className="w-6 h-6 flex items-center justify-center text-[#3e4948] hover:bg-[#e3f0f8] hover:text-[#111d23] transition-colors rounded"
            title="Свернуть"
          >
            <span className="material-symbols-outlined text-[12px]">minimize</span>
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center text-[#3e4948] hover:bg-[#e3f0f8] hover:text-[#111d23] transition-colors rounded"
            title="Развернуть"
          >
            <span className="material-symbols-outlined text-[12px]">crop_square</span>
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center text-[#3e4948] hover:bg-[#ba1a1a] hover:text-white transition-colors rounded"
            title="Закрыть"
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </div>
      </div>
    </header>
  );
};
