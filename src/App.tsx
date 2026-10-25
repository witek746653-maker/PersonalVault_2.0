/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StateRibbon } from './components/layout/StateRibbon';

// Screen Components
import { JournalView } from './components/screens/JournalView';
import { InboxQueueView } from './components/screens/InboxQueueView';
import { CompositionPagesView } from './components/screens/CompositionPagesView';
import { PreCheckReadinessView } from './components/screens/PreCheckReadinessView';
import { ClassificationZoneView } from './components/screens/ClassificationZoneView';
import { DataEditorSplitView } from './components/screens/DataEditorSplitView';
import { VerificationScanView } from './components/screens/VerificationScanView';
import { PreSaveReviewView } from './components/screens/PreSaveReviewView';
import { ArchiveOutcomeView } from './components/screens/ArchiveOutcomeView';
import { DraftsSessionsView } from './components/screens/DraftsSessionsView';
import { DocumentCardView } from './components/screens/DocumentCardView';
import { TemplateCatalogView } from './components/screens/TemplateCatalogView';
import { TemplateBuilderView } from './components/screens/TemplateBuilderView';
import { MyDataRegistryView } from './components/screens/MyDataRegistryView';
import { PlansRegistryView } from './components/screens/PlansRegistryView';
import { TrashedArchiveView } from './components/screens/TrashedArchiveView';
import { SettingsView } from './components/screens/SettingsView';
import { MaintenanceCenterView } from './components/screens/MaintenanceCenterView';
import { HealthSummaryView } from './components/screens/HealthSummaryView';
import { AssistantView } from './components/screens/AssistantView';

import { CheckCircle2, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentScreen, toast, isCompact } = useVault();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'SCR-01':
        return <JournalView />;
      case 'SCR-02':
        return <InboxQueueView />;
      case 'SCR-03':
        return <CompositionPagesView />;
      case 'SCR-04':
        return <PreCheckReadinessView />;
      case 'SCR-05':
        return <ClassificationZoneView />;
      case 'SCR-06':
        return <DataEditorSplitView />;
      case 'SCR-07':
        return <VerificationScanView />;
      case 'SCR-08':
        return <PreSaveReviewView />;
      case 'SCR-09':
        return <ArchiveOutcomeView />;
      case 'SCR-10':
        return <DraftsSessionsView />;
      case 'SCR-11':
        return <DocumentCardView />;
      case 'SCR-12':
        return <TemplateCatalogView />;
      case 'SCR-13':
        return <TemplateBuilderView />;
      case 'SCR-14':
        return <MyDataRegistryView />;
      case 'SCR-15':
        return <PlansRegistryView />;
      case 'SCR-16':
        return <TrashedArchiveView />;
      case 'SCR-17':
        return <SettingsView />;
      case 'SCR-18':
        return <MaintenanceCenterView />;
      case 'SCR-19':
        return <HealthSummaryView />;
      case 'SCR-20':
        return <AssistantView />;
      default:
        return <JournalView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4faff] text-slate-800 overflow-hidden font-sans select-none">
      {/* 1. Header Titlebar */}
      <Header />

      {/* 2. Interactive Prototype State Ribbon */}
      <StateRibbon />

      {/* 3. Main Workspace Area */}
      <div className={`flex-1 flex overflow-hidden ${isCompact ? 'p-3 bg-slate-200/70 items-center justify-center' : ''}`}>
        <div className={`flex flex-1 h-full overflow-hidden ${
          isCompact ? 'max-w-[920px] max-h-[760px] bg-white rounded-xl shadow-2xl border border-slate-300' : ''
        }`}>
          <Sidebar />
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4faff]">
            {renderActiveScreen()}
          </main>
        </div>
      </div>

      {/* 4. Global Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          <div className="pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg border border-slate-800 bg-slate-900 text-white text-xs flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <VaultProvider>
      <MainLayout />
    </VaultProvider>
  );
}
