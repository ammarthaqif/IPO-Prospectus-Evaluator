import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  Building, 
  DollarSign, 
  ArrowUpRight, 
  Calendar, 
  ChevronRight, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  BarChart3,
  FileCheck
} from 'lucide-react';
import { ProspectusDossier, AnalystFairValue } from '../types';

interface ExpertAnalystConsensusCardProps {
  dossier: ProspectusDossier;
  onOpenUpdateListingModal: () => void;
  onOpenFullAnalystModal: () => void;
}

export const ExpertAnalystConsensusCard: React.FC<ExpertAnalystConsensusCardProps> = ({
  dossier,
  onOpenUpdateListingModal,
  onOpenFullAnalystModal,
}) => {
  const [selectedAnalystId, setSelectedAnalystId] = useState<string | null>(null);

  const currency = dossier.currencySymbol || 'RM';
  const ipoPrice = dossier.ipoPrice || dossier.listingPerformance?.ipoPrice || 0.35;
  const coverage: AnalystFairValue[] = dossier.analystCoverage || [];
  const consensus = dossier.analystConsensus;
  const listing = dossier.listingPerformance;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Top Expert Analyst Fair Values & Research Consensus
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {coverage.length} Brokers Covering
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Independent institutional target prices and valuation methodologies pegged to forward FY EPS and peer benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFullAnalystModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <span>View Full Coverage Note</span>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Target Spectrum Bar & Consensus Box */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Left summary */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">IPO Offer Price</span>
              <div className="text-lg font-extrabold text-white font-mono">
                {currency} {ipoPrice.toFixed(2)}
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">Consensus Fair Value</span>
              <div className="text-lg font-extrabold text-amber-300 font-mono flex items-center gap-1.5">
                <span>{currency} {consensus?.averageFairValue.toFixed(3) || (ipoPrice * 1.25).toFixed(3)}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{consensus?.averageUpsidePct ? consensus.averageUpsidePct.toFixed(1) : '25.0'}%
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Target Range</span>
              <div className="text-sm font-bold text-slate-300 font-mono">
                {currency} {consensus?.lowestFairValue.toFixed(2)} - {currency} {consensus?.highestFairValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Right rating badge & listing day update trigger */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {consensus?.consensusRating === 'STRONG_SUBSCRIBE' ? '★ STRONG SUBSCRIBE' : 'SUBSCRIBE'}
            </span>
            <button
              type="button"
              onClick={onOpenUpdateListingModal}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer"
            >
              {listing?.listingStatus === 'LISTED' ? 'Update Debut Prices →' : 'Record Debut When Listed →'}
            </button>
          </div>
        </div>

        {/* Visual Target Spectrum Track */}
        <div className="relative pt-1 pb-1">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="w-[30%] bg-indigo-500/40 border-r border-indigo-400" />
            <div className="w-[45%] bg-gradient-to-r from-amber-500/40 to-emerald-500/50 border-r border-emerald-400" />
            <div className="w-[25%] bg-slate-700/50" />
          </div>
        </div>
      </div>

      {/* Grid of Top Expert Analyst Research Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {coverage.map((analyst) => {
          const isSelected = selectedAnalystId === analyst.id;
          return (
            <div
              key={analyst.id}
              onClick={() => setSelectedAnalystId(isSelected ? null : analyst.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/70 hover:bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{analyst.firm}</span>
                    </h4>
                    {analyst.analystName && (
                      <div className="text-[10px] text-slate-400">{analyst.analystName}</div>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {analyst.recommendation}
                  </span>
                </div>

                {/* Fair value and upside */}
                <div className="flex items-baseline gap-2 pt-1 font-mono">
                  <span className="text-[10px] text-slate-400">Fair Value:</span>
                  <span className="text-lg font-bold text-amber-300">
                    {currency} {analyst.fairValue.toFixed(3)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                    <ArrowUpRight className="w-3 h-3" />
                    +{analyst.upsidePct.toFixed(1)}%
                  </span>
                </div>

                <div className="text-[10px] text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800/80 font-mono">
                  <span className="text-slate-400">Basis: </span>
                  <strong>{analyst.targetBasis}</strong>
                </div>

                {/* Investment Thesis preview / full */}
                <p className={`text-[11px] text-slate-300 leading-relaxed italic ${isSelected ? '' : 'line-clamp-2'}`}>
                  "{analyst.keyThesis}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  {analyst.reportDate}
                </span>
                <span className="text-indigo-400 flex items-center gap-0.5">
                  {isSelected ? 'Collapse' : 'Details'} <ChevronDown className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
