import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Info,
  ChevronRight,
  Flame,
  Wind,
  Droplets,
  Layers,
  Scale,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { ProspectusDossier, FinancialYearData } from '../types';
import { ProspectusRadarComparison } from './ProspectusRadarComparison';
import { IpoPricingAndShariahStrip } from './IpoPricingAndShariahStrip';
import { ExpertAnalystConsensusCard } from './ExpertAnalystConsensusCard';
import { MarketSentimentTimelineChart } from './MarketSentimentTimelineChart';

interface DashboardOverviewProps {
  dossier: ProspectusDossier;
  availableDossiers?: ProspectusDossier[];
  onSelectDossier?: (dossier: ProspectusDossier) => void;
  onNavigateTab: (tab: string) => void;
  onOpenUploadModal?: () => void;
  onDeleteDossier?: (id: string) => void;
  onOpenUpdateListingModal?: () => void;
  onOpenAnalystModal?: () => void;
  onUpdateDossier?: (updated: ProspectusDossier) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  dossier,
  availableDossiers = [],
  onSelectDossier,
  onNavigateTab,
  onOpenUploadModal,
  onDeleteDossier,
  onOpenUpdateListingModal,
  onOpenAnalystModal,
  onUpdateDossier,
}) => {
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit' | 'margins'>('revenue');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const currency = dossier.currencySymbol || (dossier.listingMarket?.includes('NASDAQ') || dossier.registrationNo?.includes('US') ? '$' : 'RM');

  const financials = Array.isArray(dossier.financials) && dossier.financials.length > 0 
    ? dossier.financials 
    : [
        {
          period: 'FY 2024',
          revenue: 50000,
          costOfSales: -35000,
          gp: 15000,
          pbt: 8000,
          pat: 6000,
          gpMargin: 30.0,
          pbtMargin: 16.0,
          patMargin: 12.0,
          currentRatio: 2.5,
          gearingRatio: 0.25,
          receivablesTurnoverDays: 90,
          payablesTurnoverDays: 60,
          inventoryTurnoverDays: 75,
          cashConversionCycleDays: 105,
          isAudited: true,
        },
      ];

  const latestFin = financials[financials.length - 1];
  const baselineFin = financials[0];

  const redFlags = Array.isArray(dossier.redFlags) ? dossier.redFlags : [];
  const criticalFlags = redFlags.filter(f => f.severity === 'CRITICAL');
  const highFlags = redFlags.filter(f => f.severity === 'HIGH');

  const segmentRevenue = Array.isArray(dossier.segmentRevenue) ? dossier.segmentRevenue : [];

  // Revenue segment calculation for latest period
  const totalLatestSegmentRev = segmentRevenue.reduce((acc, curr) => acc + (curr.fpe2025 || curr.fy2024 || 0), 0);

  // Growth calculation
  const revGrowth = baselineFin.revenue > 0 
    ? ((latestFin.revenue - baselineFin.revenue) / baselineFin.revenue) * 100 
    : 0;
  const marginExpansion = latestFin.gpMargin - baselineFin.gpMargin;

  // Max revenue for scaling SVG charts
  const maxRevenue = Math.max(...financials.map(f => f.revenue || 1), 1000) * 1.15;
  const maxProfit = Math.max(...financials.map(f => f.gp || 1), 500) * 1.2;

  const sentiment = dossier.sentiment || {
    overallScore: 25,
    classification: 'Cautiously Optimistic',
    executiveSummary: 'Institutional prospectus evaluation completed.',
    hedgingIndex: 50,
    transparencyScore: 80,
    redFlagCount: { critical: 0, high: 0, medium: 0, low: 0 },
    toneAnalysis: '',
    sections: [],
  };

  return (
    <div className="space-y-6">
      
      {/* Top Notification / Executive Assessment Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Prospectus Evaluated
              </span>
              <span className="text-xs font-mono text-slate-400">Reg: {dossier.registrationNo || 'SEC/BURSA'}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">{dossier.listingMarket || 'Equity Market'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {dossier.companyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {sentiment.executiveSummary}
            </p>
          </div>

          {/* Quick AI Conviction & Stance Badge + Upload Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {availableDossiers.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('radar-comparison-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white transition-all cursor-pointer shadow-sm group"
                title="Jump directly to Side-by-Side Radar Benchmark"
              >
                <Scale className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span>Compare Dossiers ({availableDossiers.length})</span>
              </button>
            )}

            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="hidden sm:flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Upload Other PDF</span>
              </button>
            )}

            {onDeleteDossier && !['gold-li-2026', 'stratus-global-2026', 'sca-solutions-2025'].includes(dossier.id) && (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/50 rounded-xl px-3 py-2 text-xs text-rose-200 animate-in fade-in">
                  <span className="text-[11px] font-medium">Delete from Cloud & Library?</span>
                  <button
                    onClick={() => {
                      onDeleteDossier(dossier.id);
                      setIsConfirmingDelete(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-500/50 text-xs font-semibold text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
                  title="Delete this custom uploaded prospectus"
                >
                  <Trash2 className="w-4 h-4 text-slate-400" />
                  <span>Delete Prospectus</span>
                </button>
              )
            )}

            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5">
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">AI Sentiment Score</div>
                <div className="text-xl font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <span>+{sentiment.overallScore}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <div className="text-[11px] text-emerald-300 font-medium">{sentiment.classification}</div>
              </div>
              <div className="h-10 w-[1px] bg-slate-800" />
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Fund Stance</div>
                <div className={`text-sm font-bold ${
                  dossier.fundManagerVerdict?.recommendation === 'OVERWEIGHT'
                    ? 'text-emerald-400'
                    : dossier.fundManagerVerdict?.recommendation === 'DO_NOT_INVEST' || dossier.fundManagerVerdict?.recommendation === 'UNDERWEIGHT'
                      ? 'text-rose-400'
                      : 'text-indigo-400'
                }`}>
                  {dossier.fundManagerVerdict?.recommendation || 'OVERWEIGHT'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Conviction: {dossier.fundManagerVerdict?.convictionScore || 8}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IPO Issue Price, Shariah Compliance & Listing Debut Performance Strip */}
      <IpoPricingAndShariahStrip
        dossier={dossier}
        onOpenUpdateListingModal={onOpenUpdateListingModal || (() => {})}
        onOpenAnalystModal={onOpenAnalystModal || (() => {})}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Metric 1: Latest Revenue */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>{latestFin.period} Rev</span>
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-white font-mono">
            {latestFin.revenue >= 1000 ? `${currency}${(latestFin.revenue / 1000).toFixed(1)}M` : `${currency}${latestFin.revenue.toLocaleString()}k`}
          </div>
          <div className={`mt-1 text-[11px] flex items-center gap-1 font-medium ${revGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {revGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{revGrowth >= 0 ? '+' : ''}{revGrowth.toFixed(1)}% vs {baselineFin.period}</span>
          </div>
        </div>

        {/* Metric 2: Gross Margin */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Gross Margin</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-emerald-400 font-mono">
            {latestFin.gpMargin.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            {marginExpansion >= 0 ? `+${marginExpansion.toFixed(1)}% expansion` : `${marginExpansion.toFixed(1)}% compression`}
          </div>
        </div>

        {/* Metric 3: PAT Margin */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>PAT Margin</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-white font-mono">
            {latestFin.patMargin.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {latestFin.pat >= 1000 ? `${currency}${(latestFin.pat / 1000).toFixed(2)}M` : `${currency}${latestFin.pat.toLocaleString()}k`} in {latestFin.period}
          </div>
        </div>

        {/* Metric 4: Liquidity / Solvency */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Current / Gearing</span>
            <Scale className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-white font-mono">
            {latestFin.currentRatio.toFixed(2)}x
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            Gearing: {latestFin.gearingRatio.toFixed(2)}x
          </div>
        </div>

        {/* Metric 5: Cash Conversion Cycle */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Cash Cycle (CCC)</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-white font-mono">
            {latestFin.cashConversionCycleDays}d
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium truncate">
            vs {baselineFin.cashConversionCycleDays}d ({baselineFin.period})
          </div>
        </div>

        {/* Metric 6: Regulatory Red Flags */}
        <div 
          onClick={() => onNavigateTab('redflags')}
          className="bg-slate-900/70 border border-rose-500/30 rounded-xl p-3.5 hover:bg-rose-950/20 cursor-pointer transition-all"
        >
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Red Flags</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1 text-lg sm:text-xl font-bold text-rose-400 font-mono flex items-center gap-1.5">
            <span>{criticalFlags.length} Crit</span>
            <span className="text-xs text-amber-400 font-normal">/ {highFlags.length} High</span>
          </div>
          <div className="mt-1 text-[10px] text-rose-300 underline flex items-center gap-0.5">
            View Audit Matrix <ChevronRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Main Content Grid: Charts & Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Financial Trajectory Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Historical Performance & Margin Trajectory
              </h2>
              <p className="text-xs text-slate-400">
                Audited financials: {financials.map(f => f.period).join(', ')} (in RM'000)
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  chartMetric === 'revenue' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Revenue & GP
              </button>
              <button
                onClick={() => setChartMetric('margins')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  chartMetric === 'margins' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Margin Trend (%)
              </button>
              <button
                onClick={() => setChartMetric('profit')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  chartMetric === 'profit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PBT & PAT
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="h-64 w-full pt-4 overflow-x-auto no-scrollbar">
            {chartMetric === 'revenue' && (
              <div className="h-full min-w-[280px] sm:min-w-[420px] flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6 border-b border-slate-800 pb-2">
                {financials.map((fin, idx) => {
                  const revHeight = (fin.revenue / maxRevenue) * 100;
                  const gpHeight = (fin.gp / maxRevenue) * 100;
                  return (
                    <div key={`chart-rev-${fin.period}-${idx}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[11px] font-mono font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 px-1.5 py-0.5 rounded shadow">
                        RM{(fin.revenue / 1000).toFixed(1)}M
                      </div>
                      <div className="w-full flex items-end justify-center gap-1.5 h-48">
                        {/* Revenue Bar */}
                        <div 
                          style={{ height: `${revHeight}%` }} 
                          className="w-1/2 max-w-[42px] bg-gradient-to-t from-indigo-800 to-indigo-500 rounded-t-md relative group-hover:brightness-110 transition-all shadow-md"
                        >
                          <span className="sr-only">{fin.revenue}</span>
                        </div>
                        {/* GP Bar */}
                        <div 
                          style={{ height: `${gpHeight}%` }} 
                          className="w-1/2 max-w-[42px] bg-gradient-to-t from-emerald-800 to-emerald-400 rounded-t-md relative group-hover:brightness-110 transition-all shadow-md"
                        >
                          <span className="sr-only">{fin.gp}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-slate-200">{fin.period}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">{fin.gpMargin}% GP</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {chartMetric === 'margins' && (
              <div className="h-full min-w-[280px] sm:min-w-[420px] flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6 border-b border-slate-800 pb-2">
                {financials.map((fin, idx) => (
                  <div key={`chart-mar-${fin.period}-${idx}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-2 h-48">
                      {/* GP Margin bar */}
                      <div 
                        style={{ height: `${(fin.gpMargin / 40) * 100}%` }} 
                        className="w-8 bg-emerald-500/80 rounded-t-md relative group-hover:bg-emerald-400 transition-all flex items-center justify-center"
                      >
                        <span className="text-[10px] font-mono font-bold text-slate-950 -rotate-90">
                          {fin.gpMargin}%
                        </span>
                      </div>
                      {/* PAT Margin bar */}
                      <div 
                        style={{ height: `${(fin.patMargin / 40) * 100}%` }} 
                        className="w-8 bg-blue-500/80 rounded-t-md relative group-hover:bg-blue-400 transition-all flex items-center justify-center"
                      >
                        <span className="text-[10px] font-mono font-bold text-slate-950 -rotate-90">
                          {fin.patMargin}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-slate-200">{fin.period}</div>
                      <div className="text-[10px] text-slate-400 font-mono">GP vs PAT</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {chartMetric === 'profit' && (
              <div className="h-full flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6 border-b border-slate-800 pb-2">
                {financials.map((fin, idx) => {
                  const pbtH = (fin.pbt / maxProfit) * 100;
                  const patH = (fin.pat / maxProfit) * 100;
                  return (
                    <div key={`chart-prof-${fin.period}-${idx}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-2 h-48">
                        <div 
                          style={{ height: `${pbtH}%` }} 
                          className="w-8 bg-indigo-500 rounded-t-md group-hover:brightness-110"
                        />
                        <div 
                          style={{ height: `${patH}%` }} 
                          className="w-8 bg-emerald-400 rounded-t-md group-hover:brightness-110"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-slate-200">{fin.period}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          PAT: {currency}{(fin.pat / 1000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-4">
              {chartMetric === 'revenue' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500" />
                    <span>Total Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-400" />
                    <span>Gross Profit</span>
                  </div>
                </>
              )}
              {chartMetric === 'margins' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-400" />
                    <span>Gross Profit Margin (%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span>PAT Margin (%)</span>
                  </div>
                </>
              )}
              {chartMetric === 'profit' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500" />
                    <span>PBT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-400" />
                    <span>PAT (Net Profit)</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => onNavigateTab('financials')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Full Financial Model & Ratios <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Segment Revenue Decomposition */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                Revenue Composition Shift
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {latestFin.period}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {segmentRevenue[0]
                ? `${segmentRevenue[0].segment} is the largest contributor (${(segmentRevenue[0].fpe2025Pct || segmentRevenue[0].fy2024Pct || 50).toFixed(1)}% of latest revenue).`
                : 'Revenue stream breakdown across operating divisions.'}
            </p>

            {/* Segment Breakdown Bars */}
            <div className="mt-4 space-y-3">
              {segmentRevenue.map((seg, sIdx) => {
                const pct = seg.fpe2025Pct || seg.fy2024Pct || 25;
                const rev = seg.fpe2025 || seg.fy2024 || (latestFin.revenue * (pct / 100));
                const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'];
                const segColor = colors[sIdx % colors.length];

                return (
                  <div key={`seg-${seg.segment || 'item'}-${sIdx}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <div className={`w-2.5 h-2.5 rounded-full ${segColor}`} />
                        <span className="font-medium text-slate-200 truncate">{seg.segment}</span>
                      </div>
                      <div className="font-mono text-slate-300 shrink-0">
                        <span className="font-semibold text-white">{pct.toFixed(1)}%</span>
                        <span className="text-slate-500 text-[11px] ml-1.5">({currency}{(rev / 1000).toFixed(1)}M)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${segColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Strategic Note */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Strategic Shift:
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {dossier.fundamentalStrengths?.[0] || dossier.sentiment.toneAnalysis || `Consistent margin progression and operating discipline throughout audited periods.`}
            </p>
          </div>
        </div>

      </div>

      {/* Top Expert Analyst Fair Values & Research Consensus Card */}
      <ExpertAnalystConsensusCard
        dossier={dossier}
        onOpenUpdateListingModal={onOpenUpdateListingModal || (() => {})}
        onOpenFullAnalystModal={onOpenAnalystModal || (() => {})}
      />

      {/* Side-by-Side Prospectus Comparison & Radar Benchmark Section */}
      <div id="radar-comparison-section" className="scroll-mt-6">
        <ProspectusRadarComparison
          currentDossier={dossier}
          availableDossiers={availableDossiers.length > 0 ? availableDossiers : [dossier]}
          onSelectDossier={onSelectDossier}
          onOpenUploadModal={onOpenUploadModal}
        />
      </div>

      {/* Market Sentiment Score Over Time - Interactive Milestone Trajectory */}
      <MarketSentimentTimelineChart 
        dossier={dossier}
        onUpdateDossier={onUpdateDossier}
      />

      {/* Critical Red Flag Strip & Due Diligence Alerts */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Critical Regulatory & Structural Red Flags</h2>
              <p className="text-xs text-slate-400">Identified from Prospectus text scanning and regulatory compliance heuristics</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('redflags')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Review All {dossier.redFlags.length} Audit Findings <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalFlags.slice(0, 2).map((flag, idx) => (
            <div 
              key={`dash-crit-flag-${flag.id || idx}-${idx}`}
              onClick={() => onNavigateTab('redflags')}
              className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    CRITICAL
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{flag.prospectusSection}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors" />
              </div>

              <h3 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                {flag.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {flag.description}
              </p>

              <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Underwriter Query: </span>
                {flag.recommendedAuditQuery}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capital Structure & Proceed Utilisation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* IPO Share Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            IPO Share Capital Structure
          </h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Enlarged Issued Shares:</span>
              <span className="font-mono font-bold text-white">{dossier.enlargedIssuedShares.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">New Public Issue Shares:</span>
              <span className="font-mono text-indigo-400 font-semibold">
                {dossier.publicIssueShares.toLocaleString()} ({((dossier.publicIssueShares / dossier.enlargedIssuedShares) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Secondary Offer for Sale:</span>
              <span className="font-mono text-amber-400 font-semibold">
                {dossier.offerForSaleShares.toLocaleString()} ({((dossier.offerForSaleShares / dossier.enlargedIssuedShares) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Promoter Retained Holding:</span>
              <span className="font-mono text-emerald-400 font-semibold text-right">
                {(() => {
                  const activePromoters = dossier.promoters?.filter(p => (p.postPct || 0) > 0) || [];
                  const totalPct = activePromoters.reduce((acc, p) => acc + (p.postPct || 0), 0);
                  if (totalPct > 0) {
                    return (
                      <>
                        <span>{totalPct.toFixed(2)}%</span>
                        {activePromoters.length > 1 && (
                          <span className="text-slate-400 text-[11px] ml-1.5 font-normal font-sans">
                            ({activePromoters.map(p => `${p.postPct}%`).join(' + ')})
                          </span>
                        )}
                      </>
                    );
                  }
                  const fallbackPct = Math.max(0, (((dossier.enlargedIssuedShares - dossier.totalOfferShares) / dossier.enlargedIssuedShares) * 100));
                  return `${fallbackPct.toFixed(1)}%`;
                })()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Statutory Moratorium:</span>
              <span className="font-mono text-rose-400 font-semibold">{dossier.moratoriumPeriod}</span>
            </div>
          </div>
        </div>

        {/* Use of Proceeds */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Utilisation of IPO Proceeds ({dossier.proceeds.length} Allocations)
          </h3>

          <div className="space-y-2.5">
            {dossier.proceeds.map((item, idx) => (
              <div key={`dash-proceed-${item.purpose || idx}-${idx}`} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.purpose}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-400 font-semibold">{item.percentage}%</span>
                    <span className="text-slate-500 text-[11px]">({item.timeframe})</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${item.percentage}%` }} 
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
