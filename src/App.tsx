import React, { useState } from 'react';
import { ProspectusHeader } from './components/ProspectusHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { FinancialMetricsView } from './components/FinancialMetricsView';
import { IndustryBenchmarksView } from './components/IndustryBenchmarksView';
import { AiSentimentRedFlagsView } from './components/AiSentimentRedFlagsView';
import { PdfReportGenerator } from './components/PdfReportGenerator';
import { ProspectusDocumentViewer } from './components/ProspectusDocumentViewer';
import { UploadProspectusModal } from './components/UploadProspectusModal';
import { InstitutionalFooter } from './components/InstitutionalFooter';
import { scaSolutionsProspectus, sampleSaaSProspectus, stratusGlobalProspectus } from './data/defaultProspectus';
import { ProspectusDossier } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dossiers, setDossiers] = useState<ProspectusDossier[]>([
    stratusGlobalProspectus,
    scaSolutionsProspectus,
    sampleSaaSProspectus,
  ]);
  const [currentDossier, setCurrentDossier] = useState<ProspectusDossier>(stratusGlobalProspectus);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const handleSelectSample = (id: string) => {
    const found = dossiers.find(d => d.id === id);
    if (found) {
      setCurrentDossier(found);
    }
  };

  const handleEvaluationComplete = (newDossier: ProspectusDossier) => {
    setDossiers(prev => [newDossier, ...prev]);
    setCurrentDossier(newDossier);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Institutional Top Header & Navigation */}
      <ProspectusHeader
        currentDossier={currentDossier}
        availableDossiers={dossiers}
        onSelectDossier={setCurrentDossier}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Analysis Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            key={currentDossier.id}
            dossier={currentDossier}
            onNavigateTab={setActiveTab}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        )}

        {activeTab === 'financials' && (
          <FinancialMetricsView key={currentDossier.id} dossier={currentDossier} />
        )}

        {activeTab === 'benchmarks' && (
          <IndustryBenchmarksView key={currentDossier.id} dossier={currentDossier} />
        )}

        {activeTab === 'redflags' && (
          <AiSentimentRedFlagsView
            key={currentDossier.id}
            dossier={currentDossier}
            onUpdateDossier={setCurrentDossier}
          />
        )}

        {activeTab === 'report' && (
          <PdfReportGenerator key={currentDossier.id} dossier={currentDossier} />
        )}

        {activeTab === 'prospectus' && (
          <ProspectusDocumentViewer key={currentDossier.id} dossier={currentDossier} />
        )}
      </main>

      {/* Upload & Evaluate Modal */}
      <UploadProspectusModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onEvaluationComplete={handleEvaluationComplete}
        onSelectSample={handleSelectSample}
      />

      {/* Institutional Footer with Developer Credits, Methodology & Regulatory Disclosures */}
      <InstitutionalFooter onOpenUploadModal={() => setIsUploadModalOpen(true)} />

    </div>
  );
}
