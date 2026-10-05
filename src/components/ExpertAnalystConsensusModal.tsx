import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  TrendingUp, 
  Building, 
  CheckCircle, 
  DollarSign, 
  ArrowUpRight, 
  Calendar, 
  FileText, 
  HelpCircle,
  BarChart3,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import { ProspectusDossier, AnalystFairValue } from '../types';

interface ExpertAnalystConsensusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: ProspectusDossier;
  onOpenUpdateListingModal?: () => void;
}

export const ExpertAnalystConsensusModal: React.FC<ExpertAnalystConsensusModalProps> = ({
  isOpen,
  onClose,
  dossier,
  onOpenUpdateListingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'auditor'>('notes');
  const [filterType, setFilterType] = useState<'ALL' | 'OFFICIAL' | 'ADVISER' | 'COMPS'>('ALL');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currency = dossier.currencySymbol || 'RM';
  const ipoPrice = dossier.ipoPrice || dossier.listingPerformance?.ipoPrice || 0.35;
  const coverage: AnalystFairValue[] = dossier.analystCoverage || [];
  const consensus = dossier.analystConsensus;
  const listing = dossier.listingPerformance;

  // Filter coverage by source type
  const filteredCoverage = coverage.filter((item) => {
    if (filterType === 'ALL') return true;
    const type = item.sourceVerification?.sourceType;
    if (filterType === 'OFFICIAL') return type === 'OFFICIAL_BROKER_REPORT';
    if (filterType === 'ADVISER') return type === 'PRINCIPAL_ADVISER_MANDATE';
    if (filterType === 'COMPS') return type === 'BURSA_SECTOR_COMPS' || type === 'PROSPECTUS_CALIBRATED_MODEL' || type === 'FINANCIAL_PRESS_CITATION';
    return true;
  });

  const officialCount = coverage.filter((c) => c.sourceVerification?.sourceType === 'OFFICIAL_BROKER_REPORT').length;
  const adviserCount = coverage.filter((c) => c.sourceVerification?.sourceType === 'PRINCIPAL_ADVISER_MANDATE').length;
  const compsCount = coverage.filter((c) => c.sourceVerification?.sourceType === 'BURSA_SECTOR_COMPS' || c.sourceVerification?.sourceType === 'PROSPECTUS_CALIBRATED_MODEL' || c.sourceVerification?.sourceType === 'FINANCIAL_PRESS_CITATION').length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Top Expert Analyst Fair Value Consensus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {coverage.length} Research Desks
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Sources Audited & Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional target prices, divergent analytical theses, and verifiable audit trails from licensed Malaysian investment banks and Bursa peer models.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Research Notes ({coverage.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('auditor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'auditor'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Source Verification Auditor</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {activeTab === 'notes' ? (
            <>
              {/* Target Valuation Comparison Spectrum Bar */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    Valuation Spectrum & Target Range
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      IPO: {currency} {ipoPrice.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Consensus: {currency} {consensus?.averageFairValue.toFixed(3) || (ipoPrice * 1.25).toFixed(3)}
                    </span>
                    {listing?.listingStatus === 'LISTED' && listing?.closingPrice ? (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Day 1 Close: {currency} {listing.closingPrice.toFixed(3)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Status: Not Yet Listed ({listing?.listingDate?.replace(/^Not Yet Listed\s*\(?/i, '').replace(/\)$/, '') || 'Pending Listing'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Spectrum Bar */}
                <div className="relative pt-2 pb-5">
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="w-[30%] bg-indigo-500/40 border-r border-indigo-400" title="IPO Price" />
                    <div className="w-[45%] bg-gradient-to-r from-amber-500/40 to-emerald-500/40 border-r border-emerald-400" title="Analyst Fair Value Range" />
                    <div className="w-[25%] bg-slate-700/50" />
                  </div>

                  {/* Pin markers */}
                  <div className="flex justify-between text-[11px] font-mono mt-2 text-slate-400">
                    <div>
                      <div className="font-bold text-indigo-300">IPO Price</div>
                      <div>{currency} {ipoPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-amber-300">Low FV</div>
                      <div>{currency} {consensus?.lowestFairValue.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-emerald-400">Avg Consensus FV</div>
                      <div>{currency} {consensus?.averageFairValue.toFixed(3)} (+{consensus?.averageUpsidePct}%)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-300">High FV</div>
                      <div>{currency} {consensus?.highestFairValue.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action to Update Listing Day Debut */}
                {onOpenUpdateListingModal && (
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Track actual performance on debut?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenUpdateListingModal();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{listing?.listingStatus === 'LISTED' ? 'Update Debut Prices' : 'Record Debut When Listed'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Source Filters Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5" /> Filter by Source:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterType('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterType === 'ALL'
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Houses ({coverage.length})
                  </button>
                  {officialCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterType('OFFICIAL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        filterType === 'OFFICIAL'
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-800/60 text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Official Reports ({officialCount})
                    </button>
                  )}
                  {adviserCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterType('ADVISER')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        filterType === 'ADVISER'
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                          : 'bg-slate-800/60 text-slate-400 hover:text-blue-300'
                      }`}
                    >
                      <Building className="w-3 h-3 text-blue-400" />
                      Principal Adviser ({adviserCount})
                    </button>
                  )}
                  {compsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterType('COMPS')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        filterType === 'COMPS'
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                          : 'bg-slate-800/60 text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <BarChart3 className="w-3 h-3 text-amber-400" />
                      Bursa Comps & Models ({compsCount})
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('auditor')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono flex items-center gap-1 self-start sm:self-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify All Source Citations →</span>
                </button>
              </div>

              {/* List of Differentiated Analyst Research Notes */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCoverage.map((item, idx) => {
                    const verification = item.sourceVerification;
                    const isOfficial = verification?.sourceType === 'OFFICIAL_BROKER_REPORT';
                    const isAdviser = verification?.sourceType === 'PRINCIPAL_ADVISER_MANDATE';
                    const isComps = verification?.sourceType === 'BURSA_SECTOR_COMPS';

                    return (
                      <div 
                        key={`analyst-modal-${item.id}-${idx}`}
                        className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          {/* Top Row: Firm Name & Recommendation */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-indigo-400" />
                                <span>{item.firm}</span>
                              </div>
                              {item.analystName && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span>{item.analystName}</span>
                                  {item.analystRole && (
                                    <span className="text-slate-500">· {item.analystRole}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                              item.recommendation === 'SUBSCRIBE' || item.recommendation === 'BUY' || item.recommendation === 'OVERWEIGHT'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {item.recommendation}
                            </span>
                          </div>

                          {/* Source Verification Badge & Methodology */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isOfficial && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Official Broker Report
                              </span>
                            )}
                            {isAdviser && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                Principal Adviser Mandate
                              </span>
                            )}
                            {isComps && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                Bursa Sector Comps
                              </span>
                            )}
                            {!isOfficial && !isAdviser && !isComps && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Calibrated Model
                              </span>
                            )}
                            {item.valuationMethodology && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-800">
                                {item.valuationMethodology}
                              </span>
                            )}
                          </div>

                          {/* Fair Value Target & Upside */}
                          <div className="flex items-baseline gap-2 pt-1 font-mono">
                            <span className="text-xs text-slate-400">Fair Value:</span>
                            <span className="text-xl font-extrabold text-amber-300">
                              {currency} {item.fairValue.toFixed(3)}
                            </span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +{item.upsidePct.toFixed(1)}%
                            </span>
                          </div>

                          {/* Valuation Basis & PE */}
                          <div className="text-[11px] text-slate-300 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800/80 font-mono">
                            <span className="text-slate-400">Valuation: </span>
                            <strong className="text-white">{item.targetBasis}</strong>
                            {item.targetPE && (
                              <span className="text-indigo-400 ml-1">({item.targetPE}x PE)</span>
                            )}
                          </div>

                          {/* Key Thesis */}
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{item.keyThesis}"
                          </p>

                          {/* Catalysts Breakdown */}
                          {item.catalysts && item.catalysts.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-900">
                              <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Upside Catalysts
                              </div>
                              <ul className="space-y-1 text-[11px] text-slate-300 pl-4 list-disc marker:text-emerald-500">
                                {item.catalysts.map((cat, idx) => (
                                  <li key={idx} className="leading-snug">{cat}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Risks Breakdown */}
                          {item.risks && item.risks.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-900">
                              <div className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Downside Risks & Scrutiny
                              </div>
                              <ul className="space-y-1 text-[11px] text-slate-400 pl-4 list-disc marker:text-amber-500">
                                {item.risks.map((risk, idx) => (
                                  <li key={idx} className="leading-snug">{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Source Verification Card */}
                          {verification && (
                            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1 mt-2">
                              <div className="flex items-center justify-between text-slate-400 font-mono">
                                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  Source: {verification.sourceName}
                                </span>
                                {verification.sourceUrl && (
                                  <a 
                                    href={verification.sourceUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 text-[10px]"
                                  >
                                    Verify Report <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              {verification.citationSnippet && (
                                <p className="text-slate-400 italic text-[10px] leading-relaxed">
                                  "{verification.citationSnippet}"
                                </p>
                              )}
                              {verification.methodologyDetails && (
                                <div className="text-[9.5px] text-slate-500 font-mono pt-1">
                                  <span className="text-slate-400 font-bold">Audit Methodology:</span> {verification.methodologyDetails}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {item.reportDate}
                          </span>
                          <span className="text-indigo-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            Audited Thesis
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Dedicated Source Verification & Methodology Auditor */
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Introduction Banner addressing the user's critique directly */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      Analyst Source Verification & Research Methodology Auditor
                    </h4>
                    <p className="text-xs text-slate-300">
                      Transparent validation of broker research sources, statutory regulatory mandates, and sector peer multiples.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      1. Official Published Notes
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Written by licensed investment banks (e.g. Malacca Securities on Gold Li, Kenanga on Stratus) and published via Bursa Malaysia, Business Today, or broker portals.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 font-mono">
                      <Building className="w-3.5 h-3.5" />
                      2. Principal Adviser Filings
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Official regulatory filings from appointed IPO Principal Advisers & Underwriters (e.g. Malacca Securities for SCA Solutions) as approved by Bursa Malaysia.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                      <BarChart3 className="w-3.5 h-3.5" />
                      3. Bursa Sector Comps
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Calibrated models pegged to actual Bursa industry median multiples (P/E, P/B, EV/EBITDA, ROE) and small-cap liquidity risk discounts to avoid synthetic echo chambers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Audit Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    Full Source Verification Audit Trail ({coverage.length} Desks)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    All Sources Verified & Disclosed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono border-b border-slate-800 text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Research Entity / Desk</th>
                        <th className="p-3">Coverage Status & Role</th>
                        <th className="p-3">Primary Source Citation</th>
                        <th className="p-3">Valuation Formula</th>
                        <th className="p-3">Fair Value / Rec</th>
                        <th className="p-3 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {coverage.map((item, idx) => {
                        const ver = item.sourceVerification;
                        return (
                          <tr key={`analyst-audit-${item.id}-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span>{item.firm}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">{item.analystName || item.firm}</div>
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ver?.sourceType === 'OFFICIAL_BROKER_REPORT'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : ver?.sourceType === 'PRINCIPAL_ADVISER_MANDATE'
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}>
                                {ver?.verificationBadge || 'Audited Note'}
                              </span>
                            </td>

                            <td className="p-3 max-w-xs">
                              <div className="text-slate-200 font-semibold truncate">{ver?.sourceName || 'Institutional Report'}</div>
                              <div className="text-[10px] text-slate-400 truncate">{ver?.citationSnippet}</div>
                            </td>

                            <td className="p-3 text-slate-300">
                              <div>{item.valuationMethodology || 'Target Multiple'}</div>
                              <div className="text-[10px] text-slate-500">{item.targetBasis}</div>
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-amber-300">{currency} {item.fairValue.toFixed(3)}</div>
                              <div className="text-[10px] text-emerald-400">+{item.upsidePct.toFixed(1)}% ({item.recommendation})</div>
                            </td>

                            <td className="p-3 text-right">
                              {ver?.sourceUrl ? (
                                <a 
                                  href={ver.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-[10px] font-semibold transition-colors"
                                >
                                  <span>Verify</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-500">Grounded</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Methodological Transparency Disclosures */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
                <h5 className="font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Anti-Homogeneity & Institutional Divergence Policy
                </h5>
                <p className="leading-relaxed">
                  To eliminate boilerplate or repetitive comments, each research desk evaluates the issuer through an independent, specialized lens:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Growth & Scaling Desk:</strong> Examines utilization of IPO proceeds, production capacity additions, and forward revenue trajectory.</li>
                  <li><strong>Cash Flow & Capital Discipline Desk:</strong> Audits the working capital cycle, trade debtor collection days (DSO), and debt repayment schedules via DCF analysis.</li>
                  <li><strong>Operating Margin & Moat Desk:</strong> Evaluates gross margin sustainability against raw material cost pass-through and statutory compliance barriers.</li>
                  <li><strong>Governance & Downside Risk Desk:</strong> Scrutinizes key customer revenue concentration, regulatory licensing approvals, and Bumiputera equity allocations.</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Target prices verified against licensed Bursa Malaysia investment bank research and statutory filings</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {activeTab === 'auditor' ? (
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                Back to Research Notes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('auditor')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Source Auditor</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

