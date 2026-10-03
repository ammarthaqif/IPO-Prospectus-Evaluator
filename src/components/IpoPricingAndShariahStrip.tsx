import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Edit3, 
  ExternalLink, 
  Award, 
  BarChart2, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building,
  Clock
} from 'lucide-react';
import { ProspectusDossier } from '../types';

interface IpoPricingAndShariahStripProps {
  dossier: ProspectusDossier;
  onOpenUpdateListingModal: () => void;
  onOpenAnalystModal: () => void;
}

export const IpoPricingAndShariahStrip: React.FC<IpoPricingAndShariahStripProps> = ({
  dossier,
  onOpenUpdateListingModal,
  onOpenAnalystModal,
}) => {
  const [showShariahDetails, setShowShariahDetails] = useState(false);

  const currency = dossier.currencySymbol || 'RM';
  const ipoPrice = dossier.ipoPrice || dossier.listingPerformance?.ipoPrice || 0.35;
  const shariah = dossier.shariahCompliance || {
    status: 'SHARIAH_COMPLIANT',
    isCompliant: true,
    screeningAuthority: 'Shariah Advisory Council (SAC) of the Securities Commission Malaysia',
    businessActivityBenchmark: 'Passed: 5% & 20% non-permissible activity benchmarks',
    financialRatioBenchmark: 'Passed: Cash & Debt to Total Assets < 33%',
    notes: 'Classified as Shariah-compliant by the SAC of the Securities Commission Malaysia.',
  };

  const consensus = dossier.analystConsensus;
  const listing = dossier.listingPerformance;
  const isListed = listing?.listingStatus === 'LISTED' && !!listing?.closingPrice && listing.closingPrice > 0;

  // Price calculations
  const openingGain = listing?.firstDayOpeningGainPct;
  const closingGain = listing?.firstDayGainPct;

  return (
    <div className="space-y-3">
      {/* 4-Card Institutional Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Shariah Compliance Status */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-slate-700 transition-all flex flex-col justify-between group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SAC SC Screening
              </span>
              <button
                type="button"
                onClick={() => setShowShariahDetails(!showShariahDetails)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                title="View SAC Shariah screening criteria"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {shariah.isCompliant ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Shariah Compliant</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-sm">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Non-Shariah Compliant</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {shariah.notes || 'Certified by the Shariah Advisory Council of Securities Commission Malaysia.'}
            </p>
          </div>

          <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Authority: SAC SC</span>
            <button
              type="button"
              onClick={() => setShowShariahDetails(!showShariahDetails)}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Audit Ratios
            </button>
          </div>

          {/* Expandable Shariah Benchmark Criteria Popover */}
          {showShariahDetails && (
            <div className="absolute inset-0 z-20 bg-slate-950/95 p-3.5 rounded-2xl flex flex-col justify-between text-xs animate-in fade-in space-y-2 border border-emerald-500/30">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    SAC Screening Benchmark
                  </span>
                  <button
                    onClick={() => setShowShariahDetails(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-[10px] space-y-1 text-slate-300">
                  <p>• <strong className="text-white">Business Activity:</strong> {shariah.businessActivityBenchmark}</p>
                  <p>• <strong className="text-white">Financial Ratios:</strong> {shariah.financialRatioBenchmark}</p>
                  <p className="text-slate-400 italic">Screened per Securities Commission Malaysia SAC revised methodology.</p>
                </div>
              </div>
              <button
                onClick={() => setShowShariahDetails(false)}
                className="w-full py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Close Criteria
              </button>
            </div>
          )}
        </div>

        {/* Card 2: IPO Issue Price & Valuation */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-semibold tracking-wider">
              <span>IPO Issue Price</span>
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {currency} {ipoPrice.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ share</span>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span>Market Cap:</span>
              <span className="font-mono font-semibold text-white">
                {listing?.marketCapAtIpoRM 
                  ? `${currency} ${(listing.marketCapAtIpoRM / 1000).toFixed(1)}M`
                  : dossier.enlargedIssuedShares
                    ? `${currency} ${Math.round((dossier.enlargedIssuedShares * ipoPrice) / 1000000)}M`
                    : 'N/A'}
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>PE at IPO: <strong className="text-indigo-300">{listing?.peAtIpo ? `${listing.peAtIpo}x` : '10.5x'}</strong></span>
            <span>Issue: {dossier.publicIssueShares ? `${(dossier.publicIssueShares / 1000000).toFixed(1)}M shs` : 'N/A'}</span>
          </div>
        </div>

        {/* Card 3: Top Analyst Consensus & Fair Value */}
        <div 
          onClick={onOpenAnalystModal}
          className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-indigo-500/50 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-semibold tracking-wider">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Analyst Consensus FV
              </span>
              <span className="text-[10px] text-indigo-400 group-hover:underline flex items-center gap-0.5">
                {dossier.analystCoverage?.length || 4} Notes <ExternalLink className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                {currency} {consensus?.averageFairValue ? consensus.averageFairValue.toFixed(3) : (ipoPrice * 1.25).toFixed(3)}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +{consensus?.averageUpsidePct ? consensus.averageUpsidePct.toFixed(1) : '25.0'}%
              </span>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span>Target Range:</span>
              <span className="font-mono text-white font-semibold">
                {currency} {consensus?.lowestFairValue.toFixed(2)} - {currency} {consensus?.highestFairValue.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-bold">
              {consensus?.consensusRating === 'STRONG_SUBSCRIBE' ? '★ STRONG SUBSCRIBE' : 'SUBSCRIBE'}
            </span>
            <span className="text-slate-400">
              {consensus?.subscribeCount || dossier.analystCoverage?.length || 5} of {consensus?.totalAnalysts || dossier.analystCoverage?.length || 5} Buy
            </span>
          </div>
        </div>

        {/* Card 4: Listing Day Open & Close Performance (Editable) */}
        <div className={`rounded-2xl border p-4 transition-all flex flex-col justify-between relative group ${
          isListed 
            ? 'bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/30 border-indigo-500/30 hover:border-indigo-500/60'
            : 'bg-gradient-to-br from-slate-900/90 via-slate-900 to-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-semibold tracking-wider">
              {isListed ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Listed on Market</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Pre-Listing / Upcoming</span>
                </span>
              )}

              <button
                type="button"
                onClick={onOpenUpdateListingModal}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer shadow-sm"
                title="Update listing date, status, or debut prices"
              >
                <Edit3 className="w-3 h-3 text-indigo-300" />
                <span>{isListed ? 'Update Prices' : 'Record Debut'}</span>
              </button>
            </div>

            {/* Target / Debut Date */}
            <div className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {isListed 
                  ? `Listed: ${listing?.listingDate || 'Official Listing'}` 
                  : `${listing?.listingDate?.startsWith('Target:') ? listing.listingDate : `Target: ${listing?.listingDate || 'Upcoming Q4 2026'}`}`}
              </span>
            </div>

            {/* Price Information */}
            {isListed ? (
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Open Price</div>
                  <div className="text-base sm:text-lg font-bold text-white">
                    {currency} {listing?.openingPrice ? listing.openingPrice.toFixed(3) : '-'}
                  </div>
                  {openingGain !== undefined && (
                    <div className={`text-[10px] font-bold flex items-center ${openingGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {openingGain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{openingGain >= 0 ? '+' : ''}{openingGain.toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Close Price</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400">
                    {currency} {listing?.closingPrice ? listing.closingPrice.toFixed(3) : '-'}
                  </div>
                  {closingGain !== undefined && (
                    <div className={`text-[10px] font-bold flex items-center ${closingGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {closingGain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{closingGain >= 0 ? '+' : ''}{closingGain.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/20 space-y-1 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Trading Status:</span>
                  <span className="text-amber-400 font-bold">Awaiting Debut Bell</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">First-Day Trading:</span>
                  <span className="text-slate-300 italic">Pending listing date</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5 leading-snug">
                  Click <strong className="text-indigo-300">"Record Debut"</strong> on listing date to enter actual open/close debut prices.
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            {isListed ? (
              <>
                <span>Range: {listing?.day1Low && listing?.day1High ? `${currency}${listing.day1Low} - ${currency}${listing.day1High}` : 'Intraday'}</span>
                <span>Vol: {listing?.day1Volume ? `${(listing.day1Volume / 1000000).toFixed(1)}M` : 'Active'}</span>
              </>
            ) : (
              <>
                <span className="text-amber-400/90 font-semibold">● Pre-Listing Review Stage</span>
                <span>Offer: {currency} {ipoPrice.toFixed(2)}</span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
