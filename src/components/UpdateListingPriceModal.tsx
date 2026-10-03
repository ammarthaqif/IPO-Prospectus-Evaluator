import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  Sparkles, 
  Cloud,
  Layers,
  Save,
  RotateCcw,
  Clock
} from 'lucide-react';
import { ProspectusDossier, ListingPerformance } from '../types';
import { computeListingMetrics } from '../utils/ipoPricingAndShariah';

interface UpdateListingPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: ProspectusDossier;
  onUpdateListing: (updates: Partial<ListingPerformance>) => Promise<void> | void;
}

export const UpdateListingPriceModal: React.FC<UpdateListingPriceModalProps> = ({
  isOpen,
  onClose,
  dossier,
  onUpdateListing,
}) => {
  const currentListing = dossier.listingPerformance;
  const currency = dossier.currencySymbol || 'RM';

  // Form State
  const [ipoPrice, setIpoPrice] = useState<string>(
    currentListing?.ipoPrice ? currentListing.ipoPrice.toString() : (dossier.ipoPrice || 0.35).toString()
  );
  const [listingDate, setListingDate] = useState<string>(
    currentListing?.listingDate || '28 March 2026'
  );
  const [listingStatus, setListingStatus] = useState<'UPCOMING' | 'LISTED'>(
    currentListing?.listingStatus || 'LISTED'
  );
  const [openingPrice, setOpeningPrice] = useState<string>(
    currentListing?.openingPrice ? currentListing.openingPrice.toString() : ''
  );
  const [closingPrice, setClosingPrice] = useState<string>(
    currentListing?.closingPrice ? currentListing.closingPrice.toString() : ''
  );
  const [day1High, setDay1High] = useState<string>(
    currentListing?.day1High ? currentListing.day1High.toString() : ''
  );
  const [day1Low, setDay1Low] = useState<string>(
    currentListing?.day1Low ? currentListing.day1Low.toString() : ''
  );
  const [day1Volume, setDay1Volume] = useState<string>(
    currentListing?.day1Volume ? currentListing.day1Volume.toString() : '68500000'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if dossier changes
  useEffect(() => {
    if (dossier) {
      const perf = dossier.listingPerformance;
      setIpoPrice(perf?.ipoPrice ? perf.ipoPrice.toString() : (dossier.ipoPrice || 0.35).toString());
      setListingDate(perf?.listingDate || '28 March 2026');
      setListingStatus(perf?.listingStatus || 'LISTED');
      setOpeningPrice(perf?.openingPrice ? perf.openingPrice.toString() : '');
      setClosingPrice(perf?.closingPrice ? perf.closingPrice.toString() : '');
      setDay1High(perf?.day1High ? perf.day1High.toString() : '');
      setDay1Low(perf?.day1Low ? perf.day1Low.toString() : '');
      setDay1Volume(perf?.day1Volume ? perf.day1Volume.toString() : '68500000');
      setSaveSuccess(false);
    }
  }, [dossier, isOpen]);

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

  // Numeric parsing
  const numIpo = parseFloat(ipoPrice) || 0.35;
  const numOpen = parseFloat(openingPrice) || undefined;
  const numClose = parseFloat(closingPrice) || undefined;
  const numHigh = parseFloat(day1High) || undefined;
  const numLow = parseFloat(day1Low) || undefined;
  const numVol = parseInt(day1Volume, 10) || undefined;

  // Live computed deltas
  const deltas = computeListingMetrics(numIpo, numOpen, numClose, numHigh, numLow);

  // Simulation scenario helper
  const applyPreset = (openMultiplier: number, closeMultiplier: number) => {
    const base = numIpo;
    const openVal = Number((base * openMultiplier).toFixed(3));
    const closeVal = Number((base * closeMultiplier).toFixed(3));
    const highVal = Number((Math.max(openVal, closeVal) * 1.05).toFixed(3));
    const lowVal = Number((Math.min(openVal, closeVal) * 0.95).toFixed(3));

    setOpeningPrice(openVal.toString());
    setClosingPrice(closeVal.toString());
    setDay1High(highVal.toString());
    setDay1Low(lowVal.toString());
    setListingStatus('LISTED');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (listingStatus === 'UPCOMING') {
        await onUpdateListing({
          ipoPrice: numIpo,
          listingDate,
          listingStatus: 'UPCOMING',
          openingPrice: undefined,
          closingPrice: undefined,
          day1High: undefined,
          day1Low: undefined,
          day1Volume: undefined,
          firstDayGainPct: undefined,
          firstDayOpeningGainPct: undefined,
          intradaySpreadPct: undefined,
        });
      } else {
        await onUpdateListing({
          ipoPrice: numIpo,
          listingDate,
          listingStatus: 'LISTED',
          openingPrice: numOpen,
          closingPrice: numClose,
          day1High: numHigh,
          day1Low: numLow,
          day1Volume: numVol,
          ...deltas,
        });
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update listing day prices:', err);
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Edit3 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Update IPO Listing Status, Date & Debut Prices
              </h3>
              <p className="text-xs text-slate-400">
                {dossier.companyName} ({dossier.listingMarket})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Phase Selector: UPCOMING vs LISTED */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Listing Market Status</span>
              <span className="text-[10px] text-slate-400 font-normal">Select current market phase</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setListingStatus('UPCOMING');
                  setOpeningPrice('');
                  setClosingPrice('');
                  setDay1High('');
                  setDay1Low('');
                  setDay1Volume('');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                  listingStatus === 'UPCOMING'
                    ? 'bg-amber-500/15 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${listingStatus === 'UPCOMING' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Upcoming / Not Yet Listed</div>
                  <div className="text-[10px] font-normal text-amber-400/80">Awaiting Debut Bell (Pre-Listing)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setListingStatus('LISTED')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                  listingStatus === 'LISTED'
                    ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${listingStatus === 'LISTED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Listed on Bursa Malaysia</div>
                  <div className="text-[10px] font-normal text-emerald-400/80">Trading Active (Has Open & Close)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Simulation Presets - Only relevant when listed or simulating a debut */}
          {listingStatus === 'LISTED' && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Debut Performance Presets
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Auto-Fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(1.35, 1.28)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-semibold text-emerald-400 transition-all text-center cursor-pointer"
                >
                  Bullish (+35% / +28%)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1.20, 1.15)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/40 text-[11px] font-semibold text-indigo-300 transition-all text-center cursor-pointer"
                >
                  Solid (+20% / +15%)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1.05, 1.02)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-[11px] font-semibold text-amber-300 transition-all text-center cursor-pointer"
                >
                  Modest (+5% / +2%)
                </button>
              </div>
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Field 1: IPO Issue Price */}
            <div className="space-y-1">
              <label className="font-mono text-slate-300 font-semibold flex items-center justify-between">
                <span>IPO Issue Price ({currency})</span>
                <span className="text-slate-500 text-[10px]">Offer Price</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">{currency}</span>
                <input
                  type="number"
                  step="0.005"
                  min="0.01"
                  required
                  value={ipoPrice}
                  onChange={(e) => setIpoPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0.35"
                />
              </div>
            </div>

            {/* Field 2: Listing Date */}
            <div className="space-y-1">
              <label className="font-mono text-slate-300 font-semibold flex items-center justify-between">
                <span>{listingStatus === 'UPCOMING' ? 'Target Listing Date' : 'Listing Date'}</span>
                <span className="text-slate-500 text-[10px]">Bursa Malaysia Debut</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={listingDate}
                  onChange={(e) => setListingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={listingStatus === 'UPCOMING' ? 'e.g. Target: 24 November 2026' : 'e.g. 28 March 2026'}
                />
              </div>
            </div>

            {listingStatus === 'UPCOMING' ? (
              /* Informational Banner for UPCOMING IPOs */
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>IPO is in Pre-Listing Evaluation Phase</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Trading debut prices have not occurred yet. When the IPO officially lists on Bursa Malaysia, switch the toggle above to <strong className="text-white">"Listed on Bursa Malaysia"</strong> to record the official Day 1 Open and Close prices.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setListingStatus('LISTED');
                      applyPreset(1.25, 1.20);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer"
                  >
                    Simulate Debut Now (+25% / +20%) →
                  </button>
                </div>
              </div>
            ) : (
              /* Inputs for LISTED companies */
              <>
                {/* Field 3: Debut Opening Price */}
                <div className="space-y-1">
                  <label className="font-mono text-slate-300 font-semibold flex items-center justify-between">
                    <span>Opening Price ({currency})</span>
                    <span className="text-slate-500 text-[10px]">9:00 AM Bell</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      step="0.005"
                      min="0.01"
                      required
                      value={openingPrice}
                      onChange={(e) => setOpeningPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. 0.46"
                    />
                  </div>
                </div>

                {/* Field 4: Day 1 Closing Price */}
                <div className="space-y-1">
                  <label className="font-mono text-slate-300 font-semibold flex items-center justify-between">
                    <span>Closing Price ({currency})</span>
                    <span className="text-slate-500 text-[10px]">5:00 PM Close</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      step="0.005"
                      min="0.01"
                      required
                      value={closingPrice}
                      onChange={(e) => setClosingPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. 0.435"
                    />
                  </div>
                </div>

                {/* Field 5: Day 1 High */}
                <div className="space-y-1">
                  <label className="font-mono text-slate-400">Intraday High ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{currency}</span>
                    <input
                      type="number"
                      step="0.005"
                      value={day1High}
                      onChange={(e) => setDay1High(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="0.49"
                    />
                  </div>
                </div>

                {/* Field 6: Day 1 Low */}
                <div className="space-y-1">
                  <label className="font-mono text-slate-400">Intraday Low ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">{currency}</span>
                    <input
                      type="number"
                      step="0.005"
                      value={day1Low}
                      onChange={(e) => setDay1Low(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="0.42"
                    />
                  </div>
                </div>

                {/* Field 7: Day 1 Volume */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-mono text-slate-300 font-semibold flex items-center justify-between">
                    <span>Trading Volume (Shares Traded)</span>
                    <span className="text-slate-500 text-[10px]">Market Turnover</span>
                  </label>
                  <input
                    type="number"
                    value={day1Volume}
                    onChange={(e) => setDay1Volume(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="68500000"
                  />
                </div>
              </>
            )}

          </div>

          {/* Live Calculated Performance Summary Box - only if LISTED */}
          {listingStatus === 'LISTED' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                Calculated Listing Day Premium
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-900">
                  <div className="text-[10px] text-slate-500">Opening Bell Gap</div>
                  <div className={`text-base font-bold flex items-center justify-center ${
                    deltas.firstDayOpeningGainPct !== undefined && deltas.firstDayOpeningGainPct >= 0 
                      ? 'text-emerald-400' 
                      : 'text-rose-400'
                  }`}>
                    {deltas.firstDayOpeningGainPct !== undefined ? (
                      <>
                        {deltas.firstDayOpeningGainPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{deltas.firstDayOpeningGainPct >= 0 ? '+' : ''}{deltas.firstDayOpeningGainPct}%</span>
                      </>
                    ) : '-'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/20">
                  <div className="text-[10px] text-slate-400 font-semibold">Day 1 Net Gain</div>
                  <div className={`text-base font-extrabold flex items-center justify-center ${
                    deltas.firstDayGainPct !== undefined && deltas.firstDayGainPct >= 0 
                      ? 'text-emerald-300' 
                      : 'text-rose-400'
                  }`}>
                    {deltas.firstDayGainPct !== undefined ? (
                      <>
                        {deltas.firstDayGainPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{deltas.firstDayGainPct >= 0 ? '+' : ''}{deltas.firstDayGainPct}%</span>
                      </>
                    ) : '-'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900">
                  <div className="text-[10px] text-slate-500">Intraday Spread</div>
                  <div className="text-base font-bold text-slate-300">
                    {deltas.intradaySpreadPct !== undefined ? `${deltas.intradaySpreadPct}%` : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Syncs to Cloud Firestore & localStorage</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving & Syncing...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Updated!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update Listing Prices</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
