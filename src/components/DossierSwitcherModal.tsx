import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Check, 
  ChevronRight, 
  X, 
  UploadCloud, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  Sparkles,
  BarChart3,
  Calendar,
  DollarSign,
  Trash2,
  RotateCcw,
  FileCheck2,
  Cloud
} from 'lucide-react';
import { ProspectusDossier } from '../types';

interface DossierSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDossier: ProspectusDossier;
  availableDossiers: ProspectusDossier[];
  onSelectDossier: (dossier: ProspectusDossier) => void;
  onOpenUploadModal: () => void;
  onDeleteDossier?: (id: string) => void;
  onResetDefaults?: () => void;
  isCloudLive?: boolean;
  cloudDossiersCount?: number;
}

export const DossierSwitcherModal: React.FC<DossierSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentDossier,
  availableDossiers,
  onSelectDossier,
  onOpenUploadModal,
  onDeleteDossier,
  onResetDefaults,
  isCloudLive = true,
  cloudDossiersCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter dossiers
  const filteredDossiers = useMemo(() => {
    if (!searchQuery.trim()) return availableDossiers;
    const q = searchQuery.toLowerCase();
    return availableDossiers.filter(d => 
      (d.companyName || '').toLowerCase().includes(q) ||
      (d.registrationNo || '').toLowerCase().includes(q) ||
      (d.sector || '').toLowerCase().includes(q) ||
      (d.listingMarket || '').toLowerCase().includes(q)
    );
  }, [availableDossiers, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Available Prospectus Dossiers</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {availableDossiers.length} Loaded
                </span>
                {isCloudLive && (
                  <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Shared ({cloudDossiersCount || availableDossiers.length} Live)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">All prospectuses uploaded by any user are synchronized across the cloud in real-time with duplicate prevention.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                onClose();
                onOpenUploadModal();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Evaluate New PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, registration, sector, or market..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Dossier Cards List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 divide-y divide-slate-800/40">
          {filteredDossiers.map((dossier, idx) => {
            const isSelected = dossier.id === currentDossier.id;
            const latestFin = dossier.financials && dossier.financials.length > 0 
              ? dossier.financials[dossier.financials.length - 1] 
              : null;
            const criticalFlags = (dossier.redFlags || []).filter(f => f.severity === 'CRITICAL').length;
            const highFlags = (dossier.redFlags || []).filter(f => f.severity === 'HIGH').length;

            return (
              <div
                key={`dossier-card-${dossier.id}-${idx}`}
                onClick={() => {
                  onSelectDossier(dossier);
                  onClose();
                }}
                className={`pt-3.5 first:pt-0 group rounded-xl p-4 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Company & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {dossier.companyName}
                      </h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                          <Check className="w-3 h-3" /> Active In Workspace
                        </span>
                      )}
                      {dossier.id === 'gold-li-2026' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          ACE Market IPO (Johor Property Developer)
                        </span>
                      )}
                      {dossier.id === 'stratus-global-2026' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          Main Market IPO (Semiconductor AMHS)
                        </span>
                      )}
                      {dossier.id === 'sca-solutions-2025' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                          ACE / Main Market (M&E)
                        </span>
                      )}
                      {dossier.shariahCompliance?.isCompliant && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          ✓ Shariah
                        </span>
                      )}
                      {dossier.ipoPrice && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-indigo-300 border border-slate-700 font-mono">
                          IPO: RM {dossier.ipoPrice.toFixed(2)}
                        </span>
                      )}
                      {dossier.listingPerformance?.listingStatus === 'LISTED' && dossier.listingPerformance?.closingPrice ? (
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                          Day 1: RM {dossier.listingPerformance.closingPrice.toFixed(2)} ({dossier.listingPerformance.firstDayGainPct !== undefined && dossier.listingPerformance.firstDayGainPct >= 0 ? '+' : ''}{dossier.listingPerformance.firstDayGainPct}%)
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30 font-mono">
                          ⏳ Not Yet Listed ({dossier.listingPerformance?.listingDate?.replace(/^Not Yet Listed\s*\(?/i, '').replace(/\)$/, '') || 'Pre-Listing'})
                        </span>
                      )}
                      {!['gold-li-2026', 'stratus-global-2026', 'sca-solutions-2025'].includes(dossier.id) && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                          <FileCheck2 className="w-3 h-3 text-indigo-400" /> Custom Evaluated
                        </span>
                      )}
                      {(dossier.isCloudShared || !['gold-li-2026', 'stratus-global-2026', 'sca-solutions-2025'].includes(dossier.id)) && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono" title="Persisted in Cloud Firestore and available to all users">
                          <Cloud className="w-3 h-3 text-cyan-400" /> Cloud Shared
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-slate-300">{dossier.registrationNo}</span>
                      <span>•</span>
                      <span>{dossier.listingMarket}</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-medium">{dossier.sector}</span>
                      {dossier.sourceFileName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 text-[11px] font-mono truncate max-w-[200px]" title={dossier.sourceFileName}>
                            {dossier.sourceFileName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Fund Stance Badge & Delete Action */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider ${
                      dossier.fundManagerVerdict?.recommendation === 'OVERWEIGHT'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : dossier.fundManagerVerdict?.recommendation === 'DO_NOT_INVEST' || dossier.fundManagerVerdict?.recommendation === 'UNDERWEIGHT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {dossier.fundManagerVerdict?.recommendation || 'OVERWEIGHT'}
                    </span>

                    {deletingId === dossier.id ? (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 rounded-lg px-2.5 py-1 text-xs text-rose-200 animate-in fade-in shadow-md"
                      >
                        <span className="text-[11px] font-medium hidden xs:inline">Delete?</span>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (onDeleteDossier) {
                              await onDeleteDossier(dossier.id);
                            }
                            setDeletingId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      onDeleteDossier && (availableDossiers.length > 1) && !['gold-li-2026', 'stratus-global-2026', 'sca-solutions-2025'].includes(dossier.id) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(dossier.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1"
                          title="Delete evaluated prospectus from cloud and library"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Middle Row: Financial & Risk Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase">
                      {latestFin?.period || 'Latest'} Rev
                    </div>
                    <div className="font-bold text-white text-sm">
                      {latestFin ? (latestFin.revenue >= 1000 ? `RM${(latestFin.revenue / 1000).toFixed(1)}M` : `RM${latestFin.revenue.toLocaleString()}k`) : '-'}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase">Gross Margin</div>
                    <div className="font-bold text-emerald-400 text-sm">
                      {latestFin ? `${latestFin.gpMargin.toFixed(1)}%` : '-'}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase">Enlarged Shares</div>
                    <div className="font-bold text-slate-300 text-sm">
                      {(dossier.enlargedIssuedShares / 1000000).toFixed(1)}M
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 uppercase">Risk Indicators</div>
                    <div className="font-bold text-rose-400 text-sm flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{criticalFlags} Crit / {highFlags} High</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredDossiers.length === 0 && (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <p className="text-sm">No prospectus dossiers found matching "{searchQuery}".</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUploadModal();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Upload and Evaluate this Prospectus
              </button>
            </div>
          )}
        </div>

        {/* Footer info & Quick Switch tip */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Preserved across page refreshes</span>
            </div>
            {onResetDefaults && availableDossiers.some(d => !['gold-li-2026', 'stratus-global-2026', 'sca-solutions-2025'].includes(d.id)) && (
              <>
                <span className="text-slate-700">•</span>
                {isConfirmingReset ? (
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/50 rounded-lg px-2 py-0.5 text-[11px] text-amber-200">
                    <span>Reset defaults?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetDefaults();
                        setIsConfirmingReset(false);
                      }}
                      className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingReset(false)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(true)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset Defaults</span>
                  </button>
                )}
              </>
            )}
          </div>
          <div className="font-mono text-[11px]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ESC</kbd> to return to active analysis
          </div>
        </div>

      </div>
    </div>
  );
};
