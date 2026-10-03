import React, { useEffect } from 'react';
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
  Sparkles
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Top Expert Analyst Fair Value Consensus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {coverage.length} Research Houses
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional target prices, valuation methodologies, and investment thesis from premier Malaysian investment banks.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
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

          {/* List of Analyst Research Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Analyst Research Coverage Breakdown ({coverage.length} Published Notes)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {coverage.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    {/* Top Row: Firm Name & Recommendation */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{item.firm}</span>
                        </div>
                        {item.analystName && (
                          <div className="text-[11px] text-slate-400">{item.analystName}</div>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        item.recommendation === 'SUBSCRIBE' || item.recommendation === 'BUY' || item.recommendation === 'OVERWEIGHT'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {item.recommendation}
                      </span>
                    </div>

                    {/* Fair Value Target & Upside */}
                    <div className="flex items-baseline gap-2 pt-1 font-mono">
                      <span className="text-xs text-slate-400">Fair Value:</span>
                      <span className="text-xl font-extrabold text-amber-300">
                        {currency} {item.fairValue.toFixed(3)}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center">
                        <ArrowUpRight className="w-3 h-3" />
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
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      {item.reportDate}
                    </span>
                    <span className="text-indigo-400">Equity Research Note</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Target prices complied from licensed Bursa Malaysia investment bank research</span>
          </div>
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
  );
};
