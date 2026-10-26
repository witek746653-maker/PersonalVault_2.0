/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

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
  const { currentScreen, toast } = useVault();

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

      {/* 2. Main Workspace with Docked Adaptive Sidebar and Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#f4faff] px-3.5 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 xl:px-10 xl:py-6 flex flex-col items-center">
          <div className="w-full max-w-[1800px] 2xl:max-w-[2200px] 3xl:max-w-[2600px] flex-1 flex flex-col">
            {renderActiveScreen()}
          </div>
        </main>
      </div>

      {/* 3. Global Toast Notification Container */}
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
