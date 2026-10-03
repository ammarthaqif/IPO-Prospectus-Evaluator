import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Download, 
  Sparkles, 
  ChevronDown, 
  ShieldAlert, 
  CheckCircle2, 
  BarChart3,
  BookOpen,
  PieChart,
  SlidersHorizontal,
  UploadCloud,
  Layers
} from 'lucide-react';
import { ProspectusDossier } from '../types';
import { DossierSwitcherModal } from './DossierSwitcherModal';
import { AboutPlatformModal } from './AboutPlatformModal';
import { Info, Edit3, ShieldCheck } from 'lucide-react';

interface ProspectusHeaderProps {
  currentDossier: ProspectusDossier;
  availableDossiers: ProspectusDossier[];
  onSelectDossier: (dossier: ProspectusDossier) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUploadModal: () => void;
  onDeleteDossier?: (id: string) => void;
  onResetDefaults?: () => void;
  onOpenUpdateListingModal?: () => void;
  isCloudLive?: boolean;
  cloudDossiersCount?: number;
}

export const ProspectusHeader: React.FC<ProspectusHeaderProps> = ({
  currentDossier,
  availableDossiers,
  onSelectDossier,
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  onDeleteDossier,
  onResetDefaults,
  onOpenUpdateListingModal,
  isCloudLive = true,
  cloudDossiersCount,
}) => {
  const [isDossierSwitcherOpen, setIsDossierSwitcherOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const redFlags = Array.isArray(currentDossier.redFlags) ? currentDossier.redFlags : [];
  const criticalFlagsCount = redFlags.filter(f => f.severity === 'CRITICAL').length;
  const highFlagsCount = redFlags.filter(f => f.severity === 'HIGH').length;

  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'financials', label: 'Financials & Margins', icon: TrendingUp },
    { id: 'benchmarks', label: 'Industry Benchmarks', icon: SlidersHorizontal },
    { id: 'redflags', label: 'AI Red Flags & Sentiment', icon: AlertTriangle, badge: criticalFlagsCount + highFlagsCount },
    { id: 'report', label: 'PDF Report Generator', icon: Download },
    { id: 'prospectus', label: 'Prospectus Summary (OCR)', icon: BookOpen },
  ];

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-lg shadow-slate-950/20">
        
        {/* Top Bar: Fund Branding & Ticker Selector */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4.25rem] py-2.5 gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
            
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-base sm:text-lg text-white tracking-tight">IPO Prospectus Evaluator</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Institutional
                  </span>
                  <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Connected to Google Cloud Firestore. All uploaded prospectuses are shared with all users in real-time.">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Shared ({cloudDossiersCount || availableDossiers.length})
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:block">
                  Prospectus Due Diligence & Risk Intelligence
                </p>
              </div>
            </div>

            {/* Center: Spacious Dossier Switcher Trigger */}
            <div className="order-3 sm:order-2 w-full sm:w-auto">
              <button
                onClick={() => setIsDossierSwitcherOpen(true)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 hover:border-indigo-500/50 border border-slate-700/80 text-left transition-all group cursor-pointer shadow-sm"
                title="Click to switch between available prospectus dossiers"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {currentDossier.companyName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded shrink-0">
                        {(currentDossier.registrationNo || 'SEC/BURSA').split(' ')[0]}
                      </span>
                      {currentDossier.shariahCompliance?.isCompliant && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0" title="Classified as Shariah-compliant by the SAC of Securities Commission Malaysia">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Shariah</span>
                        </span>
                      )}
                      <span className="hidden md:inline-flex items-center text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">
                        IPO: {currentDossier.currencySymbol || 'RM'}{(currentDossier.ipoPrice || 0.35).toFixed(2)}
                      </span>
                      {currentDossier.listingPerformance?.listingStatus === 'LISTED' && currentDossier.listingPerformance?.closingPrice ? (
                        <span className="hidden lg:inline-flex items-center text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          Day 1: {currentDossier.currencySymbol || 'RM'}{currentDossier.listingPerformance.closingPrice.toFixed(2)} ({currentDossier.listingPerformance.firstDayGainPct !== undefined && currentDossier.listingPerformance.firstDayGainPct >= 0 ? '+' : ''}{currentDossier.listingPerformance.firstDayGainPct}%)
                        </span>
                      ) : (
                        <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0" title="Not yet listed on Bursa Malaysia">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Upcoming IPO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                      {currentDossier.sector}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg shrink-0 border border-indigo-500/20">
                  <span className="hidden md:inline">Switch</span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Right Action: Quick Actions & PDF Upload */}
            <div className="order-2 sm:order-3 flex items-center gap-2 shrink-0">
              {onOpenUpdateListingModal && (
                <button
                  type="button"
                  onClick={onOpenUpdateListingModal}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
                  title="Update IPO Open and Closing Prices on Listing Date"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="whitespace-nowrap">Listing Prices</span>
                </button>
              )}
              <button
                onClick={onOpenUploadModal}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all border border-indigo-400/30 cursor-pointer active:scale-95"
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Upload PDF</span>
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                title="View platform architecture, methodology, and developer profile"
              >
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">About</span>
              </button>
            </div>

          </div>

          {/* Bottom Tab Bar Navigation - Touch-friendly responsive scrolling */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth border-t border-slate-800/80 pt-1 -mb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      criticalFlagsCount > 0 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Spacious, un-cramped Dossier Switcher Modal */}
      <DossierSwitcherModal
        isOpen={isDossierSwitcherOpen}
        onClose={() => setIsDossierSwitcherOpen(false)}
        currentDossier={currentDossier}
        availableDossiers={availableDossiers}
        onSelectDossier={onSelectDossier}
        onOpenUploadModal={onOpenUploadModal}
        onDeleteDossier={onDeleteDossier}
        onResetDefaults={onResetDefaults}
        isCloudLive={isCloudLive}
        cloudDossiersCount={cloudDossiersCount}
      />

      {/* About Platform, Methodology & Developer Profile Modal */}
      <AboutPlatformModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        defaultTab="about"
      />
    </>
  );
};
