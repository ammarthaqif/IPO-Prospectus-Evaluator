import React, { useState, useEffect } from 'react';
import { ProspectusHeader } from './components/ProspectusHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { FinancialMetricsView } from './components/FinancialMetricsView';
import { IndustryBenchmarksView } from './components/IndustryBenchmarksView';
import { AiSentimentRedFlagsView } from './components/AiSentimentRedFlagsView';
import { PdfReportGenerator } from './components/PdfReportGenerator';
import { ProspectusDocumentViewer } from './components/ProspectusDocumentViewer';
import { UploadProspectusModal } from './components/UploadProspectusModal';
import { InstitutionalFooter } from './components/InstitutionalFooter';
import { stratusGlobalProspectus, goldLiProspectus } from './data/defaultProspectus';
import { ProspectusDossier } from './types';
import { 
  loadStoredDossiers, 
  saveStoredDossiers, 
  loadActiveDossierId, 
  saveActiveDossierId, 
  deleteStoredDossier, 
  resetDossiersToDefaults,
  checkDuplicateProspectus,
  DEFAULT_DOSSIERS
} from './utils/dossierStorage';
import { 
  subscribeToCloudDossiers, 
  saveProspectusToCloud, 
  seedInitialCloudDossiers, 
  checkCloudDuplicate 
} from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCloudLive, setIsCloudLive] = useState<boolean>(true);
  const [cloudCount, setCloudCount] = useState<number>(0);
  
  // Lazy initialize dossiers from localStorage so all uploaded dossiers persist across refreshes on Vercel
  const [dossiers, setDossiers] = useState<ProspectusDossier[]>(() => {
    return loadStoredDossiers();
  });

  // Lazy initialize current active dossier from localStorage
  const [currentDossier, setCurrentDossier] = useState<ProspectusDossier>(() => {
    const initialList = loadStoredDossiers();
    const savedActiveId = loadActiveDossierId();
    if (savedActiveId) {
      const found = initialList.find(d => d.id === savedActiveId);
      if (found) return found;
    }
    return initialList[0] || goldLiProspectus;
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Background real-time sync with Google Cloud Firestore and server
  useEffect(() => {
    // 1. Seed initial baseline default dossiers to Cloud Firestore if not present
    seedInitialCloudDossiers(DEFAULT_DOSSIERS).catch(() => {});

    // 2. Real-time subscription to Cloud Firestore:
    // Whenever ANY user anywhere uploads/evaluates an IPO prospectus,
    // this listener fires and syncs with all other users instantly!
    const unsubscribe = subscribeToCloudDossiers(
      (cloudList) => {
        if (cloudList && cloudList.length > 0) {
          setIsCloudLive(true);
          setCloudCount(cloudList.length);
          setDossiers((prev) => {
            const cloudIds = new Set(cloudList.map((c) => c.id));
            const localOnly = prev.filter((p) => !cloudIds.has(p.id));
            const merged = [...cloudList, ...localOnly];
            saveStoredDossiers(merged);
            return merged;
          });
        }
      },
      (err) => {
        console.warn('[Firebase Cloud Sync notice, using local offline authority]:', err);
        setIsCloudLive(false);
      }
    );

    // 3. Background sync with express backend if available
    fetch('/api/dossiers')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.dossiers) && data.dossiers.length > 0) {
          setDossiers((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const newServerItems = data.dossiers.filter((sd: ProspectusDossier) => !existingIds.has(sd.id));
            if (newServerItems.length > 0) {
              const merged = [...newServerItems, ...prev];
              saveStoredDossiers(merged);
              return merged;
            }
            return prev;
          });
        }
      })
      .catch(() => {});

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectDossier = (dossier: ProspectusDossier) => {
    setCurrentDossier(dossier);
    saveActiveDossierId(dossier.id);
  };

  const handleSelectSample = (id: string) => {
    const found = dossiers.find(d => d.id === id);
    if (found) {
      handleSelectDossier(found);
    }
  };

  const handleEvaluationComplete = async (newDossier: ProspectusDossier) => {
    // Defense: verify not duplicate in local memory before inserting
    const dupCheck = checkDuplicateProspectus(
      {
        companyName: newDossier.companyName,
        registrationNo: newDossier.registrationNo,
        fileName: newDossier.sourceFileName,
      },
      dossiers
    );

    if (dupCheck.isDuplicate && dupCheck.matchedDossier && dupCheck.matchedDossier.id !== newDossier.id) {
      // If already exists, switch to the existing evaluated dossier
      handleSelectDossier(dupCheck.matchedDossier);
      setActiveTab('dashboard');
      return;
    }

    // Defense: verify not duplicate in Cloud Firestore
    const cloudDup = await checkCloudDuplicate(
      {
        companyName: newDossier.companyName,
        registrationNo: newDossier.registrationNo,
        fileName: newDossier.sourceFileName,
      },
      newDossier.id
    );

    if (cloudDup.isDuplicate && cloudDup.matchedDossier && cloudDup.matchedDossier.id !== newDossier.id) {
      handleSelectDossier(cloudDup.matchedDossier);
      setActiveTab('dashboard');
      return;
    }

    // Stamp with Cloud Shared metadata
    const sharedDossier: ProspectusDossier = {
      ...newDossier,
      isCloudShared: true,
      cloudSharedAt: new Date().toISOString(),
      uploaderEmail: 'community-analyst',
    };

    // Persist new dossier permanently into state and localStorage
    const updated = [sharedDossier, ...dossiers.filter((d) => d.id !== sharedDossier.id)];
    setDossiers(updated);
    saveStoredDossiers(updated);
    handleSelectDossier(sharedDossier);
    setActiveTab('dashboard');

    // Store in Cloud Firestore so all other users can view it immediately!
    saveProspectusToCloud(sharedDossier).catch((err) => {
      console.warn('[Cloud upload notice]', err);
    });

    // Sync with serverless / express backend if available
    fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sharedDossier),
    }).catch(() => {});
  };

  const handleDeleteDossier = (id: string) => {
    const updated = deleteStoredDossier(id, dossiers);
    setDossiers(updated);
    if (currentDossier.id === id) {
      const nextDossier = updated[0] || stratusGlobalProspectus;
      handleSelectDossier(nextDossier);
    }
    fetch(`/api/dossiers/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleResetDefaults = () => {
    const defaults = resetDossiersToDefaults();
    setDossiers(defaults);
    handleSelectDossier(defaults[0]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Institutional Top Header & Navigation */}
      <ProspectusHeader
        currentDossier={currentDossier}
        availableDossiers={dossiers}
        onSelectDossier={handleSelectDossier}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onDeleteDossier={handleDeleteDossier}
        onResetDefaults={handleResetDefaults}
        isCloudLive={isCloudLive}
        cloudDossiersCount={cloudCount}
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
            onUpdateDossier={(updatedDossier) => {
              handleSelectDossier(updatedDossier);
              setDossiers(prev => {
                const updatedList = prev.map(d => d.id === updatedDossier.id ? updatedDossier : d);
                saveStoredDossiers(updatedList);
                return updatedList;
              });
            }}
          />
        )}

        {activeTab === 'report' && (
          <PdfReportGenerator key={currentDossier.id} dossier={currentDossier} />
        )}

        {activeTab === 'prospectus' && (
          <ProspectusDocumentViewer key={currentDossier.id} dossier={currentDossier} />
        )}
      </main>

      {/* Upload & Evaluate Modal with Duplicate Detection */}
      <UploadProspectusModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onEvaluationComplete={handleEvaluationComplete}
        onSelectSample={handleSelectSample}
        existingDossiers={dossiers}
      />

      {/* Institutional Footer with Developer Credits, Methodology & Regulatory Disclosures */}
      <InstitutionalFooter onOpenUploadModal={() => setIsUploadModalOpen(true)} />

    </div>
  );
}
