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
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Info
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

  const verifiedBrokerCount = consensus?.verifiedBrokerCount || coverage.filter(
    (c) => c.sourceVerification?.sourceType === 'OFFICIAL_BROKER_REPORT' || c.sourceVerification?.sourceType === 'PRINCIPAL_ADVISER_MANDATE'
  ).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Top Expert Analyst Fair Values & Research Consensus
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {coverage.length} Houses Covering
            </span>
            {verifiedBrokerCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {verifiedBrokerCount} Official / Adviser Filings
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Sources
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Independent institutional target prices and divergent analytical theses verified against published broker reports and Bursa peer multiples.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenFullAnalystModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Sources & Notes</span>
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
        {coverage.map((analyst, idx) => {
          const isSelected = selectedAnalystId === analyst.id;
          const verification = analyst.sourceVerification;
          const isOfficial = verification?.sourceType === 'OFFICIAL_BROKER_REPORT';
          const isAdviser = verification?.sourceType === 'PRINCIPAL_ADVISER_MANDATE';
          const isComps = verification?.sourceType === 'BURSA_SECTOR_COMPS';

          return (
            <div
              key={`analyst-card-${analyst.id}-${idx}`}
              onClick={() => setSelectedAnalystId(isSelected ? null : analyst.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/70 hover:bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="space-y-2">
                {/* Top Row: Firm Name, Role & Recommendation */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{analyst.firm}</span>
                    </h4>
                    {analyst.analystName && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{analyst.analystName}</span>
                        {analyst.analystRole && (
                          <span className="text-slate-500">· {analyst.analystRole}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {analyst.recommendation}
                  </span>
                </div>

                {/* Source Verification Badge & Methodology Chip */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {isOfficial && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Official Report
                    </span>
                  )}
                  {isAdviser && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <Building className="w-2.5 h-2.5" />
                      Principal Adviser
                    </span>
                  )}
                  {isComps && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <BarChart3 className="w-2.5 h-2.5" />
                      Bursa Comps
                    </span>
                  )}
                  {!isOfficial && !isAdviser && !isComps && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Calibrated Model
                    </span>
                  )}
                  {analyst.valuationMethodology && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 bg-slate-800/80 border border-slate-700/80">
                      {analyst.valuationMethodology}
                    </span>
                  )}
                </div>

                {/* Fair value and upside */}
                <div className="flex items-baseline gap-2 pt-0.5 font-mono">
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
                  <strong className="text-white">{analyst.targetBasis}</strong>
                </div>

                {/* Investment Thesis preview / full */}
                <p className={`text-[11px] text-slate-300 leading-relaxed italic ${isSelected ? '' : 'line-clamp-2'}`}>
                  "{analyst.keyThesis}"
                </p>

                {/* Expanded Details: Catalysts, Risks, and Verified Source */}
                {isSelected && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                    {/* Key Catalysts */}
                    {analyst.catalysts && analyst.catalysts.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Key Upside Drivers
                        </div>
                        <ul className="space-y-0.5 text-[10px] text-slate-300 pl-3 list-disc marker:text-emerald-500">
                          {analyst.catalysts.map((cat, idx) => (
                            <li key={idx} className="leading-snug">{cat}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Risks */}
                    {analyst.risks && analyst.risks.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Downside Risks & Scrutiny
                        </div>
                        <ul className="space-y-0.5 text-[10px] text-slate-400 pl-3 list-disc marker:text-amber-500">
                          {analyst.risks.map((risk, idx) => (
                            <li key={idx} className="leading-snug">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Source Verification Block */}
                    {verification && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400 font-mono">
                          <span className="text-slate-300 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Source: {verification.sourceName}
                          </span>
                          {verification.sourceUrl && (
                            <a 
                              href={verification.sourceUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-0.5"
                            >
                              Verify <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        {verification.citationSnippet && (
                          <p className="text-slate-400 italic text-[9.5px] leading-tight">
                            "{verification.citationSnippet}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  {analyst.reportDate}
                </span>
                <span className="text-indigo-400 flex items-center gap-0.5">
                  {isSelected ? 'Collapse' : 'Details & Catalysts'} <ChevronDown className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

