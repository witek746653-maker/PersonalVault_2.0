/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { DevModal } from './components/layout/DevModal';
import { Toast } from './components/layout/Toast';

// 18 Linked Screens
import { JournalScreen } from './components/screens/JournalScreen';
import { InboxScreen } from './components/screens/InboxScreen';
import { CompositionScreen } from './components/screens/CompositionScreen';
import { PrecheckScreen } from './components/screens/PrecheckScreen';
import { ClassificationScreen } from './components/screens/ClassificationScreen';
import { DataEditorScreen } from './components/screens/DataEditorScreen';
import { VerificationScreen } from './components/screens/VerificationScreen';
import { PreArchiveReviewScreen } from './components/screens/PreArchiveReviewScreen';
import { ArchiveResultScreen } from './components/screens/ArchiveResultScreen';
import { DraftsScreen } from './components/screens/DraftsScreen';
import { DocumentCardScreen } from './components/screens/DocumentCardScreen';
import { TemplatesCatalogScreen } from './components/screens/TemplatesCatalogScreen';
import { TemplateBuilderScreen } from './components/screens/TemplateBuilderScreen';
import { MyDataScreen } from './components/screens/MyDataScreen';
import { PlansScreen } from './components/screens/PlansScreen';
import { ArchivedScreen } from './components/screens/ArchivedScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { MaintenanceScreen } from './components/screens/MaintenanceScreen';

const MainLayout: React.FC = () => {
  const { activeRoute } = useVault();

  const renderActiveScreen = () => {
    switch (activeRoute) {
      case 'zhurnal':
        return <JournalScreen />;
      case 'vkhodyashchie':
        return <InboxScreen />;
      case 'sostav':
        return <CompositionScreen />;
      case 'predproverka':
        return <PrecheckScreen />;
      case 'klassifikaciya':
        return <ClassificationScreen />;
      case 'redaktor':
        return <DataEditorScreen />;
      case 'sverka':
        return <VerificationScreen />;
      case 'itog':
        return <PreArchiveReviewScreen />;
      case 'rezultat':
        return <ArchiveResultScreen />;
      case 'chernoviki':
        return <DraftsScreen />;
      case 'kartochka':
        return <DocumentCardScreen />;
      case 'shablony':
        return <TemplatesCatalogScreen />;
      case 'shablon-redaktor':
        return <TemplateBuilderScreen />;
      case 'moi-dannye':
        return <MyDataScreen />;
      case 'plany':
        return <PlansScreen />;
      case 'ubrannye':
        return <ArchivedScreen />;
      case 'nastroiki':
        return <SettingsScreen />;
      case 'obsluzhivanie':
        return <MaintenanceScreen />;
      default:
        return <JournalScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased select-none flex flex-col">
      <Header />
      <div className="flex flex-1 pt-9">
        <Sidebar />
        <main className="flex-1 ml-[210px] min-h-[calc(100vh-36px)] overflow-hidden bg-surface">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <SearchModal />
      <DevModal />
      <Toast />
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
