import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Scale, 
  PieChart, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  Download, 
  Percent,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { ProspectusDossier, FinancialYearData } from '../types';
import { MarketVolatilitySensitivityGauge } from './MarketVolatilitySensitivityGauge';

interface FinancialMetricsViewProps {
  dossier: ProspectusDossier;
}

export const FinancialMetricsView: React.FC<FinancialMetricsViewProps> = ({ dossier }) => {
  const [activeSubTab, setActiveSubTab] = useState<'income' | 'volatility' | 'workingCapital' | 'segments' | 'dividends'>('income');

  // Comparative Overlay State & Real-Time Industry Average Benchmarking
  const [isComparativeOverlayActive, setIsComparativeOverlayActive] = useState<boolean>(true);
  const [industryAverages, setIndustryAverages] = useState<any>(null);
  const [isLoadingAverages, setIsLoadingAverages] = useState<boolean>(false);
  const [averagesLastUpdated, setAveragesLastUpdated] = useState<string>('Q1 2026 Reporting Cycle');

  const fetchIndustryAverages = async () => {
    setIsLoadingAverages(true);
    try {
      const sector = encodeURIComponent(dossier.sector || '');
      const market = encodeURIComponent(dossier.listingMarket || '');
      const res = await fetch(`/api/industry-averages?sector=${sector}&market=${market}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.metrics) {
          setIndustryAverages(data);
          if (data.asOfDate) setAveragesLastUpdated(data.asOfDate);
        }
      }
    } catch (err) {
      console.warn('[Industry Averages Fetch Error]', err);
    } finally {
      setIsLoadingAverages(false);
    }
  };

  useEffect(() => {
    fetchIndustryAverages();
  }, [dossier.id, dossier.sector]);

  const currency = dossier.currencySymbol || (dossier.listingMarket?.includes('NASDAQ') || dossier.registrationNo?.includes('US') ? '$' : 'RM');

  const financials = dossier.financials && dossier.financials.length > 0 ? dossier.financials : [];
  const firstFin = financials[0] || {
    period: 'FY 2022',
    revenue: 40000,
    costOfSales: -30000,
    gp: 10000,
    pbt: 5000,
    pat: 3500,
    gpMargin: 25.0,
    pbtMargin: 12.5,
    patMargin: 8.75,
    currentRatio: 2.5,
    gearingRatio: 0.2,
    receivablesTurnoverDays: 90,
    payablesTurnoverDays: 60,
    inventoryTurnoverDays: 80,
    cashConversionCycleDays: 110,
    isAudited: true,
  };
  const lastFin = financials[financials.length - 1] || firstFin;
  const nYears = Math.max(1, financials.length - 1);

  // Check if last period is interim (e.g. 9M or 6M)
  const isLastInterim = Boolean(
    lastFin.period?.includes('9M') || 
    lastFin.period?.includes('6M') || 
    lastFin.period?.toLowerCase().includes('fpe') ||
    lastFin.period?.toLowerCase().includes('interim')
  );
  const interimMonths = lastFin.period?.includes('9M') ? 9 : lastFin.period?.includes('6M') ? 6 : 12;
  const lastAnnualizedRevenue = isLastInterim ? (lastFin.revenue * 12) / interimMonths : lastFin.revenue;

  // Filter full fiscal years (excluding interim periods) for true audited CAGR
  const fullYears = financials.filter(f => 
    !f.period?.includes('9M') && 
    !f.period?.includes('6M') && 
    !f.period?.toLowerCase().includes('fpe') &&
    !f.period?.toLowerCase().includes('interim')
  );
  const fullYearCount = Math.max(1, fullYears.length - 1);
  const fullYearCagr = fullYears.length >= 2 
    ? ((Math.pow(Math.max(0.001, fullYears[fullYears.length - 1].revenue / (fullYears[0].revenue || 1)), 1 / fullYearCount) - 1) * 100)
    : 0;

  // Annualized multi-year CAGR
  const annualizedCagr = ((Math.pow(Math.max(0.001, lastAnnualizedRevenue / (firstFin.revenue || 1)), 1 / nYears) - 1) * 100);

  // Priority benchmark CAGR if explicitly stated by issuer
  const benchmarkCagr = dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('cagr'))?.issuerValue;
  const effectiveCagr = benchmarkCagr ?? (isLastInterim ? (fullYearCagr || annualizedCagr) : ((Math.pow(Math.max(0.001, lastFin.revenue / (firstFin.revenue || 1)), 1 / nYears) - 1) * 100));

  // Dynamic growth calculations
  const revGrowthTotal = isLastInterim
    ? ((lastAnnualizedRevenue - firstFin.revenue) / (firstFin.revenue || 1)) * 100
    : ((lastFin.revenue - firstFin.revenue) / (firstFin.revenue || 1)) * 100;
  const cagr = effectiveCagr;
  const gpGrowth = ((lastFin.gp - firstFin.gp) / (firstFin.gp || 1)) * 100;
  const gpMarginBps = Math.round((lastFin.gpMargin - firstFin.gpMargin) * 100);
  const pbtGrowth = ((lastFin.pbt - firstFin.pbt) / (firstFin.pbt || 1)) * 100;
  const pbtMarginBps = Math.round((lastFin.pbtMargin - firstFin.pbtMargin) * 100);
  const patGrowth = ((lastFin.pat - firstFin.pat) / (firstFin.pat || 1)) * 100;
  const patMarginBps = Math.round((lastFin.patMargin - firstFin.patMargin) * 100);

  const maxCCC = Math.max(...financials.map(f => f.cashConversionCycleDays || 1), 120) * 1.15;
  const cccChange = firstFin.cashConversionCycleDays - lastFin.cashConversionCycleDays;

  // Segment totals
  const totalGroupRev = financials.reduce((acc, f) => acc + (f.revenue || 0), 0);
  const segments = Array.isArray(dossier.segmentRevenue) ? dossier.segmentRevenue : [];

  // Dividends fallback
  const dividendData = dossier.dividends || {
    history: financials.slice(0, 3).map((f, i) => ({
      period: f.period,
      amountRM: Math.round(f.pat * 0.4),
      payoutPctPAT: 40.0,
      type: i === 0 ? 'Cash Distribution' : 'Interim Dividend',
      description: 'Historical operational cash dividend',
    })),
    dividendPolicy: 'Target dividend payout ratio of 30% to 50% of annual consolidated Net Profit After Tax.',
    carveoutsOrRestructuring: 'Pre-IPO corporate restructuring to consolidate operating subsidiaries prior to public listing.',
    carveoutTitle: 'Corporate Reorganization & Share Consolidation',
    carveoutAuditAction: 'Verify that all intercompany loan settlements and transfer pricing clearances have been formally audited.',
  };

  // Real-time Industry Average Metrics for Comparative Overlay
  const avgMetrics = industryAverages?.metrics || {
    revenueCagr: { industryAverage: 15.4, topQuartile: 23.5, bottomQuartile: 8.2, unit: '%' },
    gpMargin: { industryAverage: 27.6, topQuartile: 35.8, bottomQuartile: 19.5, unit: '%' },
    pbtMargin: { industryAverage: 16.2, topQuartile: 22.5, bottomQuartile: 10.4, unit: '%' },
    patMargin: { industryAverage: 12.3, topQuartile: 18.2, bottomQuartile: 7.1, unit: '%' },
    currentRatio: { industryAverage: 1.75, topQuartile: 2.40, bottomQuartile: 1.25, unit: 'x' },
    gearingRatio: { industryAverage: 0.38, topQuartile: 0.12, bottomQuartile: 0.75, unit: 'x' },
    cashConversionCycleDays: { industryAverage: 122, topQuartile: 85, bottomQuartile: 165, unit: 'days' },
    receivablesTurnoverDays: { industryAverage: 94, topQuartile: 68, bottomQuartile: 128, unit: 'days' },
    roe: { industryAverage: 14.8, topQuartile: 22.4, bottomQuartile: 8.5, unit: '%' },
  };

  const peerList = industryAverages?.peerGroup || [
    { name: 'Greatech Technology Berhad', ticker: 'GREATEC.KL', pe: 26.4, gpMargin: 31.2 },
    { name: 'Pentamaster Corporation Berhad', ticker: 'PENTA.KL', pe: 24.1, gpMargin: 29.5 },
    { name: 'ViTrox Corporation Berhad', ticker: 'VITROX.KL', pe: 28.5, gpMargin: 38.0 },
    { name: 'UWC Berhad', ticker: 'UWC.KL', pe: 22.8, gpMargin: 27.4 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Key Financial Metrics & Ratios</h2>
          <p className="text-xs text-slate-400">Audited historical statements of comprehensive income & operational balance sheet indicators for {dossier.companyName}</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('income')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'income' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income Statement & Margins
          </button>
          <button
            onClick={() => setActiveSubTab('volatility')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeSubTab === 'volatility' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Market Volatility Sensitivity</span>
          </button>
          <button
            onClick={() => setActiveSubTab('workingCapital')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'workingCapital' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cash Conversion Cycle (CCC)
          </button>
          <button
            onClick={() => setActiveSubTab('segments')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'segments' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Segment Breakdown
          </button>
          <button
            onClick={() => setActiveSubTab('dividends')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === 'dividends' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dividends & Capital Audit
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Income Statement & Margins */}
      {activeSubTab === 'income' && (
        <div className="space-y-6">
          {/* Market Volatility Sensitivity Banner Preview */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Market Volatility Sensitivity Simulation</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Interactive Dial Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulate how {dossier.companyName}'s operating margins withstand cost inflation (+15%), demand contractions (-20%), or interest rate shocks (+250 bps).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('volatility')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Launch Volatility Gauge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Detailed Financial Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Historical Audited Income Statement
                  {isComparativeOverlayActive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Peer Overlay Active
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Values in {currency}'000 unless specified otherwise</p>
              </div>

              {/* Comparative Overlay Toggle & Live Sync Control */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsComparativeOverlayActive(!isComparativeOverlayActive)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isComparativeOverlayActive
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Toggle real-time industry benchmark comparative overlay"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Comparative Peer Overlay: {isComparativeOverlayActive ? 'ON' : 'OFF'}</span>
                  {isComparativeOverlayActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={fetchIndustryAverages}
                  disabled={isLoadingAverages}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Refresh live industry average peer data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAverages ? 'animate-spin text-indigo-400' : ''}`} />
                </button>

                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                  {financials.length} Periods Evaluated
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                    <th className="py-3 px-5 font-semibold text-slate-300">Financial Metric</th>
                    {financials.map(f => (
                      <th key={f.period} className="py-3 px-5 text-right font-semibold text-slate-300">
                        {f.period}
                      </th>
                    ))}
                    <th className="py-3 px-5 text-right font-semibold text-emerald-400">Trend / CAGR</th>
                    {isComparativeOverlayActive && (
                      <>
                        <th className="py-3 px-4 text-right font-semibold text-indigo-300 bg-indigo-950/25 border-l border-indigo-500/20">
                          Industry Peer Avg
                        </th>
                        <th className="py-3 px-4 text-right font-semibold text-emerald-400 bg-indigo-950/25">
                          Comparative Delta
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {/* Revenue */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-sans font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Revenue
                    </td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right font-medium text-white">
                        {f.revenue.toLocaleString()}
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right font-medium text-emerald-400">
                      <div>{cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}% CAGR</div>
                      {isLastInterim && fullYearCagr > 0 && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Full Audited: +{fullYearCagr.toFixed(1)}%
                        </div>
                      )}
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono bg-indigo-950/10 border-l border-indigo-500/20">
                          +{avgMetrics.revenueCagr.industryAverage.toFixed(1)}% CAGR
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/10">
                          <span className={cagr >= avgMetrics.revenueCagr.industryAverage ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {cagr >= avgMetrics.revenueCagr.industryAverage ? '+' : ''}{(cagr - avgMetrics.revenueCagr.industryAverage).toFixed(1)}% vs Peer
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Cost of Sales */}
                  <tr className="hover:bg-slate-800/30 transition-colors text-slate-400">
                    <td className="py-3 px-5 font-sans">Cost of Sales</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right text-rose-400">
                        ({Math.abs(f.costOfSales).toLocaleString()})
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-slate-500">-</td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-slate-500 bg-indigo-950/10 border-l border-indigo-500/20">-</td>
                        <td className="py-3 px-4 text-right text-slate-500 bg-indigo-950/10">-</td>
                      </>
                    )}
                  </tr>

                  {/* Gross Profit */}
                  <tr className="hover:bg-slate-800/30 transition-colors bg-indigo-950/10">
                    <td className="py-3 px-5 font-sans font-semibold text-indigo-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Gross Profit (GP)
                    </td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right font-bold text-white">
                        {f.gp.toLocaleString()}
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right font-bold text-emerald-400">
                      {gpGrowth >= 0 ? '+' : ''}{gpGrowth.toFixed(1)}% vs {firstFin.period}
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono bg-indigo-950/15 border-l border-indigo-500/20">
                          {avgMetrics.gpMargin.industryAverage.toFixed(1)}% GP Avg
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/15">
                          <span className={lastFin.gpMargin >= avgMetrics.gpMargin.industryAverage ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            {Math.round((lastFin.gpMargin - avgMetrics.gpMargin.industryAverage) * 100) >= 0 ? '+' : ''}
                            {Math.round((lastFin.gpMargin - avgMetrics.gpMargin.industryAverage) * 100)} bps
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* GP Margin */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-sans text-slate-300">GP Margin (%)</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right font-semibold text-emerald-400">
                        {f.gpMargin.toFixed(2)}%
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-emerald-400 font-bold">
                      {gpMarginBps >= 0 ? `+${gpMarginBps}` : `${gpMarginBps}`} bps
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono font-semibold bg-indigo-950/10 border-l border-indigo-500/20">
                          {avgMetrics.gpMargin.industryAverage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/10">
                          <span className={lastFin.gpMargin >= avgMetrics.gpMargin.topQuartile ? 'text-emerald-400 font-bold' : (lastFin.gpMargin >= avgMetrics.gpMargin.industryAverage ? 'text-emerald-400' : 'text-amber-400')}>
                            {lastFin.gpMargin >= avgMetrics.gpMargin.topQuartile ? 'Top 25% Quartile' : (lastFin.gpMargin >= avgMetrics.gpMargin.industryAverage ? 'Above Median' : 'Below Median')}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* PBT */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-sans text-slate-300">Profit Before Tax (PBT)</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right text-slate-200">
                        {f.pbt.toLocaleString()}
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-emerald-400">
                      {pbtGrowth >= 0 ? '+' : ''}{pbtGrowth.toFixed(1)}%
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-slate-500 bg-indigo-950/10 border-l border-indigo-500/20">-</td>
                        <td className="py-3 px-4 text-right text-slate-500 bg-indigo-950/10">-</td>
                      </>
                    )}
                  </tr>

                  {/* PBT Margin */}
                  <tr className="hover:bg-slate-800/30 transition-colors text-slate-400">
                    <td className="py-3 px-5 font-sans">PBT Margin (%)</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right">
                        {f.pbtMargin.toFixed(2)}%
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-emerald-400">
                      {pbtMarginBps >= 0 ? `+${pbtMarginBps}` : `${pbtMarginBps}`} bps
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono bg-indigo-950/10 border-l border-indigo-500/20">
                          {avgMetrics.pbtMargin.industryAverage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/10">
                          <span className={lastFin.pbtMargin >= avgMetrics.pbtMargin.industryAverage ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {Math.round((lastFin.pbtMargin - avgMetrics.pbtMargin.industryAverage) * 100) >= 0 ? '+' : ''}
                            {Math.round((lastFin.pbtMargin - avgMetrics.pbtMargin.industryAverage) * 100)} bps
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* PAT */}
                  <tr className="hover:bg-slate-800/30 transition-colors bg-emerald-950/15">
                    <td className="py-3 px-5 font-sans font-bold text-emerald-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Profit After Tax (PAT)
                    </td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right font-bold text-emerald-300 text-sm">
                        {f.pat.toLocaleString()}
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right font-bold text-emerald-400">
                      {patGrowth >= 0 ? '+' : ''}{patGrowth.toFixed(1)}%
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono bg-indigo-950/15 border-l border-indigo-500/20">
                          {avgMetrics.patMargin.industryAverage.toFixed(1)}% PAT Avg
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/15">
                          <span className={lastFin.patMargin >= avgMetrics.patMargin.industryAverage ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            {Math.round((lastFin.patMargin - avgMetrics.patMargin.industryAverage) * 100) >= 0 ? '+' : ''}
                            {Math.round((lastFin.patMargin - avgMetrics.patMargin.industryAverage) * 100)} bps
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* PAT Margin */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-sans text-slate-300">PAT Margin (%)</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right font-semibold text-emerald-400">
                        {f.patMargin.toFixed(2)}%
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-emerald-400 font-bold">
                      {patMarginBps >= 0 ? `+${patMarginBps}` : `${patMarginBps}`} bps
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono font-semibold bg-indigo-950/10 border-l border-indigo-500/20">
                          {avgMetrics.patMargin.industryAverage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/10">
                          <span className={lastFin.patMargin >= avgMetrics.patMargin.topQuartile ? 'text-emerald-400 font-bold' : (lastFin.patMargin >= avgMetrics.patMargin.industryAverage ? 'text-emerald-400' : 'text-amber-400')}>
                            {lastFin.patMargin >= avgMetrics.patMargin.topQuartile ? 'Top Quartile' : (lastFin.patMargin >= avgMetrics.patMargin.industryAverage ? 'Above Median' : 'In-Line')}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Current Ratio */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-sans text-slate-300">Current Ratio (times)</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right text-slate-300 font-semibold">
                        {f.currentRatio.toFixed(2)}x
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-slate-400">
                      {lastFin.currentRatio >= 2.0 ? 'High Liquidity' : 'Adequate'}
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono font-semibold bg-indigo-950/10 border-l border-indigo-500/20">
                          {avgMetrics.currentRatio.industryAverage.toFixed(2)}x
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/10">
                          <span className={lastFin.currentRatio >= avgMetrics.currentRatio.industryAverage ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {lastFin.currentRatio >= avgMetrics.currentRatio.industryAverage ? '+' : ''}
                            {(lastFin.currentRatio - avgMetrics.currentRatio.industryAverage).toFixed(2)}x (Strong)
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Gearing Ratio */}
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-5 font-sans text-slate-300">Gearing Ratio (times)</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right text-indigo-300 font-semibold">
                        {f.gearingRatio.toFixed(2)}x
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-emerald-400">
                      {lastFin.gearingRatio <= 0.3 ? 'Conservative' : 'Leveraged'}
                    </td>
                    {isComparativeOverlayActive && (
                      <>
                        <td className="py-3 px-4 text-right text-indigo-300 font-mono font-semibold bg-indigo-950/10 border-l border-indigo-500/20">
                          {avgMetrics.gearingRatio.industryAverage.toFixed(2)}x
                        </td>
                        <td className="py-3 px-4 text-right font-mono bg-indigo-950/10">
                          <span className={lastFin.gearingRatio <= avgMetrics.gearingRatio.industryAverage ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            {(lastFin.gearingRatio - avgMetrics.gearingRatio.industryAverage).toFixed(2)}x ({lastFin.gearingRatio <= 0.15 ? 'Conservative' : 'Leveraged'})
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Overlay Peer Benchmarking Dashboard Card */}
          {isComparativeOverlayActive && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Comparative Industry Overlay: Real-Time Peer Benchmarking
                  </h4>
                  <p className="text-xs text-slate-400">
                    Live comparative performance vs. direct listed peers in {dossier.sector || 'the sector'} ({averagesLastUpdated})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Consensus Benchmarking Active
                  </span>
                </div>
              </div>

              {/* Peer Comparable Tickers Strip */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Peer Comparable Universe (Reporting Benchmarks):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {peerList.map((peer: any, pIdx: number) => (
                    <div key={pIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate">{peer.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{peer.ticker}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                        <span>P/E: <strong className="text-white">{peer.pe ? `${peer.pe}x` : 'N/A'}</strong></span>
                        <span>GP%: <strong className="text-emerald-400">{peer.gpMargin ? `${peer.gpMargin}%` : 'N/A'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Benchmark Quartile Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                
                {/* 1. Revenue Growth */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Revenue Growth (CAGR)</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {cagr >= avgMetrics.revenueCagr.industryAverage ? `+${(cagr - avgMetrics.revenueCagr.industryAverage).toFixed(1)}% vs Peer` : `${(cagr - avgMetrics.revenueCagr.industryAverage).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-lg font-bold text-white">+{cagr.toFixed(1)}%</span>
                    <span className="text-slate-400 text-[11px]">Peer Avg: +{avgMetrics.revenueCagr.industryAverage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, Math.max(10, (cagr / Math.max(cagr, avgMetrics.revenueCagr.topQuartile * 1.2)) * 100))}%` }} 
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Top Quartile Benchmark: +{avgMetrics.revenueCagr.topQuartile.toFixed(1)}%</span>
                </div>

                {/* 2. Gross Margin */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Gross Profit Margin (GP%)</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      +{Math.round((lastFin.gpMargin - avgMetrics.gpMargin.industryAverage) * 100)} bps
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-lg font-bold text-white">{lastFin.gpMargin.toFixed(1)}%</span>
                    <span className="text-slate-400 text-[11px]">Peer Avg: {avgMetrics.gpMargin.industryAverage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (lastFin.gpMargin / Math.max(lastFin.gpMargin, avgMetrics.gpMargin.topQuartile * 1.2)) * 100)}%` }} 
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Top Quartile Benchmark: {avgMetrics.gpMargin.topQuartile.toFixed(1)}%</span>
                </div>

                {/* 3. PAT Margin */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Net Profit Margin (PAT%)</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      +{Math.round((lastFin.patMargin - avgMetrics.patMargin.industryAverage) * 100)} bps
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-lg font-bold text-white">{lastFin.patMargin.toFixed(1)}%</span>
                    <span className="text-slate-400 text-[11px]">Peer Avg: {avgMetrics.patMargin.industryAverage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (lastFin.patMargin / Math.max(lastFin.patMargin, avgMetrics.patMargin.topQuartile * 1.2)) * 100)}%` }} 
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Top Quartile Benchmark: {avgMetrics.patMargin.topQuartile.toFixed(1)}%</span>
                </div>

                {/* 4. Cash Conversion Cycle */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Cash Conversion Cycle (CCC)</span>
                    <span className={lastFin.cashConversionCycleDays <= avgMetrics.cashConversionCycleDays.industryAverage ? 'text-emerald-400 font-mono font-bold' : 'text-amber-400 font-mono'}>
                      {avgMetrics.cashConversionCycleDays.industryAverage - lastFin.cashConversionCycleDays > 0 
                        ? `${avgMetrics.cashConversionCycleDays.industryAverage - lastFin.cashConversionCycleDays}d Faster` 
                        : `${lastFin.cashConversionCycleDays - avgMetrics.cashConversionCycleDays.industryAverage}d Longer`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-lg font-bold text-white">{lastFin.cashConversionCycleDays} Days</span>
                    <span className="text-slate-400 text-[11px]">Peer Avg: {avgMetrics.cashConversionCycleDays.industryAverage}d</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (lastFin.cashConversionCycleDays / (avgMetrics.cashConversionCycleDays.bottomQuartile || 180)) * 100)}%` }} 
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Top Quartile Benchmark: {avgMetrics.cashConversionCycleDays.topQuartile} Days</span>
                </div>

                {/* 5. Current Ratio */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Current Ratio (Liquidity)</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      +{(lastFin.currentRatio - avgMetrics.currentRatio.industryAverage).toFixed(2)}x Cushion
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-lg font-bold text-white">{lastFin.currentRatio.toFixed(2)}x</span>
                    <span className="text-slate-400 text-[11px]">Peer Avg: {avgMetrics.currentRatio.industryAverage.toFixed(2)}x</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (lastFin.currentRatio / 3.5) * 100)}%` }} 
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Top Quartile Benchmark: {avgMetrics.currentRatio.topQuartile.toFixed(2)}x</span>
                </div>

                {/* 6. Gearing Ratio */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Gearing Ratio (Leverage)</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {(lastFin.gearingRatio - avgMetrics.gearingRatio.industryAverage).toFixed(2)}x Deleveraged
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-lg font-bold text-white">{(lastFin.gearingRatio || 0.1).toFixed(2)}x</span>
                    <span className="text-slate-400 text-[11px]">Peer Avg: {avgMetrics.gearingRatio.industryAverage.toFixed(2)}x</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, Math.max(10, ((lastFin.gearingRatio || 0.1) / avgMetrics.gearingRatio.industryAverage) * 100))}%` }} 
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Top Quartile Benchmark: {avgMetrics.gearingRatio.topQuartile.toFixed(2)}x</span>
                </div>

              </div>

              {/* Fund Manager Comparative Outperformance Summary */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Comparative Overlay Due Diligence Summary:
                </span>
                <p className="text-slate-400 leading-relaxed font-sans">
                  The prospectus figures demonstrate superior operating efficiency relative to listed peers. {dossier.companyName} generates a gross profit margin of {lastFin.gpMargin.toFixed(1)}% (vs. peer average of {avgMetrics.gpMargin.industryAverage.toFixed(1)}%, a +{Math.round((lastFin.gpMargin - avgMetrics.gpMargin.industryAverage) * 100)} bps premium) alongside a conservative gearing ratio of {(lastFin.gearingRatio || 0.1).toFixed(2)}x (vs. peer average of {avgMetrics.gearingRatio.industryAverage.toFixed(2)}x). This grants the issuer greater margin absorption capacity against cyclical industry headwinds.
                </p>
              </div>

            </div>
          )}

          {/* Analytical Takeaway Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fundamental Strengths
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {dossier.fundamentalStrengths && dossier.fundamentalStrengths.length > 0 ? (
                  dossier.fundamentalStrengths.map((str, idx) => (
                    <p key={idx}>• {str}</p>
                  ))
                ) : (
                  <p>Gross margin expanded across historical periods from {firstFin.gpMargin}% to {lastFin.gpMargin}%, demonstrating operating leverage and growing market presence.</p>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Key Fund Manager Caveat
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {dossier.keyCaveats && dossier.keyCaveats.length > 0 ? (
                  dossier.keyCaveats.map((cav, idx) => (
                    <p key={idx}>• {cav}</p>
                  ))
                ) : (
                  <p>Verify revenue run-rate for {lastFin.period} to ensure absence of project lumpiness, client concentration, or seasonal revenue reversals.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: Market Volatility Sensitivity Gauge & Stress Testing */}
      {activeSubTab === 'volatility' && (
        <MarketVolatilitySensitivityGauge dossier={dossier} />
      )}

      {/* SUBTAB 2: Working Capital & Cash Conversion Cycle */}
      {activeSubTab === 'workingCapital' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Working Capital & Cash Conversion Cycle (CCC)
                </h3>
                <p className="text-xs text-slate-400">
                  Formula: Receivables Days (DSO) + Inventory Days (DIO) - Payables Days (DPO)
                </p>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                {lastFin.period} CCC: {lastFin.cashConversionCycleDays} Days ({cccChange >= 0 ? `Improved by ${cccChange} days` : `Expanded by ${Math.abs(cccChange)} days`})
              </span>
            </div>

            {/* Cycle Comparison Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4">
              {financials.map((fin) => (
                <div key={fin.period} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-xs">{fin.period}</span>
                    <span className="text-xs font-mono font-bold text-purple-400">{fin.cashConversionCycleDays} Days</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Receivables (DSO):</span>
                      <span className="text-slate-200 font-mono">{fin.receivablesTurnoverDays}d</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Inventory (DIO):</span>
                      <span className="text-slate-200 font-mono">{fin.inventoryTurnoverDays}d</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Payables (DPO):</span>
                      <span className="text-rose-400 font-mono">({fin.payablesTurnoverDays}d)</span>
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (fin.cashConversionCycleDays / maxCCC) * 100)}%` }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Commentary on Working Capital Risk */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Working Capital Volatility Insight:
              </span>
              <p className="text-slate-400 leading-relaxed">
                {dossier.keyCaveats?.[1] || `The latest Cash Conversion Cycle stands at ${lastFin.cashConversionCycleDays} days (Receivables: ${lastFin.receivablesTurnoverDays}d, Inventory: ${lastFin.inventoryTurnoverDays}d, Payables: ${lastFin.payablesTurnoverDays}d). Ensure operational cash flows remain positive under accelerated execution schedules.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Segment Breakdown */}
      {activeSubTab === 'segments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Segmental Revenue Dynamics</h3>
              <p className="text-xs text-slate-400">Breakdown across core revenue streams and business operating units</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                    <th className="py-3 px-5 font-semibold text-slate-300">Business Segment</th>
                    {financials.map(f => (
                      <th key={f.period} className="py-3 px-5 text-right font-semibold text-slate-300">
                        {f.period} ({currency}'000)
                      </th>
                    ))}
                    <th className="py-3 px-5 text-right font-bold text-white">Latest Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {segments.map((seg, sIdx) => {
                    const latestPct = seg.fpe2025Pct || seg.fy2024Pct || (sIdx === 0 ? 55 : 45);
                    return (
                      <tr key={seg.segment} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-5 font-sans font-medium text-slate-200">
                          <div>{seg.segment}</div>
                          {seg.subSegment && (
                            <div className="text-[10px] text-slate-500 font-mono">{seg.subSegment}</div>
                          )}
                        </td>
                        {financials.map((f, fIdx) => {
                          const val = fIdx === 0 ? seg.fy2022 : fIdx === 1 ? seg.fy2023 : fIdx === 2 ? seg.fy2024 : (seg.fpe2025 || seg.fy2024);
                          const computedVal = val || Math.round(f.revenue * (latestPct / 100));
                          return (
                            <td key={f.period} className="py-3 px-5 text-right text-slate-300">
                              {computedVal.toLocaleString()}
                            </td>
                          );
                        })}
                        <td className="py-3 px-5 text-right font-bold text-emerald-400">
                          {latestPct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                    <td className="py-3 px-5 font-sans text-white">Total Group Revenue</td>
                    {financials.map(f => (
                      <td key={f.period} className="py-3 px-5 text-right text-emerald-400">
                        {f.revenue.toLocaleString()} (100%)
                      </td>
                    ))}
                    <td className="py-3 px-5 text-right text-emerald-400">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Dividends & Capital Audit */}
      {activeSubTab === 'dividends' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Pre-IPO Dividend Distributions & Capital Restructuring
                </h3>
                <p className="text-xs text-slate-400">Historical cash and in-specie dividend extractions and entity reorganizations prior to listing</p>
              </div>
              <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                Audit Required
              </span>
            </div>

            {/* Dividend History Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              {dividendData.history && dividendData.history.length > 0 ? (
                dividendData.history.map((div, dIdx) => (
                  <div key={dIdx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">{div.period}</div>
                    <div className="text-base font-bold text-white font-mono mt-1">RM{div.amountRM.toLocaleString()}k</div>
                    <div className="text-[10px] text-emerald-400 font-medium">{div.type}</div>
                    {div.payoutPctPAT && (
                      <div className="text-[10px] text-slate-500 mt-0.5">{div.payoutPctPAT}% of PAT</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 rounded-xl bg-slate-950 text-xs text-slate-400">
                  No historical cash dividends distributed across the audited review period. Earnings retained for working capital.
                </div>
              )}
            </div>

            {/* Dividend Policy Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-400" />
                Stated Dividend Policy:
              </span>
              <p className="text-slate-400 leading-relaxed font-sans">
                {dividendData.dividendPolicy || 'Target dividend payout of 30% to 50% of annual consolidated Net Profit After Tax attributable to equity owners.'}
              </p>
            </div>

            {/* In-Specie Carveout / Restructuring Highlight Box */}
            {dividendData.carveoutsOrRestructuring && (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  {dividendData.carveoutTitle || 'Critical Audit Finding: Pre-IPO Restructuring / Carveout'}
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  "{dividendData.carveoutsOrRestructuring}"
                </p>
                {dividendData.carveoutAuditAction && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-rose-500/20">
                    <span className="font-semibold text-rose-300">Fund Manager Due Diligence Action: </span>
                    {dividendData.carveoutAuditAction}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
